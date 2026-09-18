/* =================================================================
    AAROGYAM INDIA - EBOOK READER ENGINE (FINAL V1 FIXED)
================================================================= */

// PDF.js Worker Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let aoiPdfDoc = null;
let aoiPageNum = 1;
let aoiPageRendering = false;
let aoiPageNumPending = null;
let aoiScale = 1.2; // Default Zoom Scale
let aoiTotalPages = 0;
let aoiBookId = "";
let aoiCurrentBookData = null;

// DOM Elements
const aoiCanvas = document.getElementById('pdfCanvas');
const aoiCtx = aoiCanvas.getContext('2d');
const progressFill = document.getElementById('progressFill');
const topProgressBar = document.getElementById('topProgressBar');
const bookHeading = document.getElementById('bookHeading');
const headerPageInfo = document.getElementById('headerPageInfo');
const headerPercentInfo = document.getElementById('headerPercentInfo');
const pageInfoDisplay = document.getElementById('pageInfoDisplay');
const pageSlider = document.getElementById('pageSlider');
const loadingIndicator = document.getElementById('loadingIndicator');
const loaderBookTitle = document.getElementById('loaderBookTitle');
const pdfErrorScreen = document.getElementById('pdfErrorScreen');
const accessDeniedModal = document.getElementById('accessDeniedModal');
const continueReadingModal = document.getElementById('continueReadingModal');
const lastSavedPageText = document.getElementById('lastSavedPageText');
const watermarkUser = document.getElementById('watermarkUser');

document.addEventListener("DOMContentLoaded", async () => {
    console.log("====================================");
    console.log("AAROGYAM INDIA READER SYSTEM START");
    console.log("====================================");

    const urlParams = new URLSearchParams(window.location.search);
    aoiBookId = (urlParams.get("book") || urlParams.get("id") || "BK001").trim();

    console.log("Target Book ID:", aoiBookId);

    try {
        await verifyUserAccessAndSession(aoiBookId);
    } catch (err) {
        console.error("Reader Initialization Error:", err);
        showErrorScreen();
    }
});

// =======================================================
// SESSION & PURCHASE VERIFICATION
// =======================================================
async function verifyUserAccessAndSession(targetBookId) {
    let attempts = 0;
    while (typeof supabaseClient === "undefined" && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        attempts++;
    }

    let userId = null;
    let userIdentifier = "User";

    const sessionManager = (typeof V1_SESSION !== "undefined") ? V1_SESSION : window.V1_SESSION;
    const currentUser = sessionManager && typeof sessionManager.getCurrentUser === "function" 
        ? sessionManager.getCurrentUser() 
        : null;

    if (currentUser) {
        userId = currentUser.id;
        userIdentifier = currentUser.email || currentUser.mobile || currentUser.id.substring(0, 8);
    }

    if (watermarkUser) watermarkUser.textContent = userIdentifier;

    let jsonBooks = [];
    try {
        const res = await fetch("../data/books.json?v=" + Date.now());
        if (res.ok) {
            const json = await res.json();
            jsonBooks = json.books || [];
        }
    } catch (e) {
        console.warn("books.json fetch note:", e);
    }

    // Merge custom books & studio free demo books
    try {
        const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
        if (Array.isArray(customBooks)) {
            customBooks.forEach(cb => {
                const idx = jsonBooks.findIndex(x => x && x.id && x.id.toUpperCase() === cb.id.toUpperCase());
                if (idx >= 0) jsonBooks[idx] = { ...jsonBooks[idx], ...cb };
                else jsonBooks.push(cb);
            });
        }
    } catch (e) {}

    try {
        const freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
        if (Array.isArray(freeDemoBooks)) {
            freeDemoBooks.forEach(fb => {
                const idx = jsonBooks.findIndex(x => x && x.id && x.id.toUpperCase() === fb.id.toUpperCase());
                if (idx >= 0) jsonBooks[idx] = { ...jsonBooks[idx], ...fb };
                else jsonBooks.push(fb);
            });
        }
    } catch (e) {}

    // Merge Landing Pages (for sample_preview images and demo_reader_pages)
    try {
        const resLp = await fetch("/data/universal-book-landing-pages.json?v=" + Date.now());
        if (resLp.ok) {
            const jsonLp = await resLp.json();
            const lpList = jsonLp.bookLandingPages || [];
            lpList.forEach(lp => {
                if (!lp || !lp.id) return;
                const idx = jsonBooks.findIndex(x => x && x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                const previewImgList = (lp.sample_preview && Array.isArray(lp.sample_preview.pages) && lp.sample_preview.pages.length > 0)
                    ? lp.sample_preview.pages.map(p => typeof p === 'object' ? p.image : p).filter(Boolean)
                    : (lp.demoImages || []);
                const normalized = {
                    ...lp,
                    id: lp.id.toUpperCase(),
                    heading: lp.hero?.title || lp.heading || lp.id,
                    name: lp.hero?.title || lp.name || lp.id,
                    demo_reader_pages: lp.demo_reader_pages || lp.demoPages || '',
                    demoImages: previewImgList.length > 0 ? previewImgList : (jsonBooks[idx]?.demoImages || []),
                    targetMainBook: lp.targetMainBook || lp.id.replace(/^(DEMO_|DEMO-|FREE_|FREE-|BONUS_|BONUS-)/i, '') || 'BK001'
                };
                if (idx >= 0) jsonBooks[idx] = { ...jsonBooks[idx], ...normalized };
                else jsonBooks.push(normalized);
            });
        }
    } catch (e) {}

    try {
        const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
        if (Array.isArray(localLp)) {
            localLp.forEach(lp => {
                if (!lp || !lp.id) return;
                const idx = jsonBooks.findIndex(x => x && x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                const previewImgList = (lp.sample_preview && Array.isArray(lp.sample_preview.pages) && lp.sample_preview.pages.length > 0)
                    ? lp.sample_preview.pages.map(p => typeof p === 'object' ? p.image : p).filter(Boolean)
                    : (lp.demoImages || []);
                const normalized = {
                    ...lp,
                    id: lp.id.toUpperCase(),
                    heading: lp.hero?.title || lp.heading || lp.id,
                    name: lp.hero?.title || lp.name || lp.id,
                    demo_reader_pages: lp.demo_reader_pages || lp.demoPages || '',
                    demoImages: previewImgList.length > 0 ? previewImgList : (jsonBooks[idx]?.demoImages || []),
                    targetMainBook: lp.targetMainBook || lp.id.replace(/^(DEMO_|DEMO-|FREE_|FREE-|BONUS_|BONUS-)/i, '') || 'BK001'
                };
                if (idx >= 0) jsonBooks[idx] = { ...jsonBooks[idx], ...normalized };
                else jsonBooks.push(normalized);
            });
        }
    } catch (e) {}

    const targetKey = String(targetBookId).toUpperCase();
    aoiCurrentBookData = jsonBooks.find(b => 
        (b.id && b.id.toUpperCase() === targetKey) || 
        (b.book_id && b.book_id.toUpperCase() === targetKey) ||
        (b.slug && b.slug.toLowerCase() === String(targetBookId).toLowerCase())
    );

    const canonicalBookId = (aoiCurrentBookData?.id || (targetKey.includes('KHARIF') ? 'BK001' : (targetKey.includes('KHETI') ? 'BK002' : targetKey))).toUpperCase();
    aoiBookId = canonicalBookId;
    window.aoiBookId = canonicalBookId;

    // Fallback if not found: create a fallback book object so reader never throws 404
    if (!aoiCurrentBookData) {
        aoiCurrentBookData = {
            id: canonicalBookId,
            heading: `Aarogyam India eBook (${canonicalBookId})`,
            name: `Aarogyam India eBook (${canonicalBookId})`,
            demoImages: [
                '../images/books/kharif-master-guide-2026-preview-01.webp',
                '../images/books/kharif-master-guide-2026-preview-02.webp',
                '../images/books/kharif-master-guide-2026-preview-03.webp',
                '../images/books/kharif-master-guide-2026-preview-04.webp'
            ],
            targetMainBook: canonicalBookId === 'BK002' ? 'BK002' : 'BK001',
            isDemo: false,
            readEnabled: true
        };
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get("demo") === "1" || 
                       Boolean(aoiCurrentBookData.isDemo) || 
                       aoiCurrentBookData.type === 'demo' || 
                       aoiCurrentBookData.type === 'bonus_free' || 
                       Boolean(aoiCurrentBookData.isBonus) || 
                       canonicalBookId.startsWith('DEMO') || 
                       canonicalBookId.startsWith('BONUS') || 
                       canonicalBookId.startsWith('FREE');

    const bookTitle = aoiCurrentBookData.heading || aoiCurrentBookData.name || "Aarogyam India eBook";
    if (bookHeading) bookHeading.textContent = bookTitle + (isDemoMode ? " (Demo)" : "");
    if (loaderBookTitle) loaderBookTitle.textContent = bookTitle;

    // Sticky Top Bar for Demo / Bonus Mode
    if (isDemoMode) {
        if (watermarkUser) watermarkUser.textContent = "Free Demo Preview";
        const targetMain = aoiCurrentBookData.targetMainBook || (canonicalBookId === 'BK002' ? 'BK002' : 'BK001');
        const checkoutUrl = `/ebooks/checkout.html?product=${encodeURIComponent(targetMain)}`;
        
        let demoBar = document.getElementById('demoReaderStickyBar');
        if (!demoBar) {
            demoBar = document.createElement('div');
            demoBar.id = 'demoReaderStickyBar';
            demoBar.style.cssText = "background:linear-gradient(135deg, #0f172a, #1e293b);border-bottom:2px solid #f59e0b;padding:8px 16px;display:flex;justify-content:space-between;align-items:center;z-index:9999;box-shadow:0 4px 14px rgba(0,0,0,0.5);flex-wrap:wrap;gap:8px;";
            
            const videos = Array.isArray(aoiCurrentBookData.videos) ? aoiCurrentBookData.videos : [];
            const hasVideos = videos.length > 0;

            demoBar.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;color:#f8fafc;font-size:0.86rem;font-weight:700;">
                    <span style="background:#f59e0b;color:#000;font-size:0.7rem;font-weight:900;padding:2px 6px;border-radius:4px;">FREE DEMO</span>
                    <span>⚡ यह निःशुल्क डेमो प्रिव्यू है • सम्पूर्ण मुख्य पुस्तक मात्र ₹99 में प्राप्त करें</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    ${hasVideos ? `<button type="button" id="readerVideoBtn" style="background:#ef4444;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:0.8rem;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;"><span>🎬</span> <span>वीडियो देखें</span></button>` : ''}
                    <a href="${checkoutUrl}" style="background:#16a34a;color:#fff;text-decoration:none;padding:6px 14px;border-radius:6px;font-size:0.82rem;font-weight:800;box-shadow:0 2px 8px rgba(22,163,74,0.4);display:inline-flex;align-items:center;gap:4px;">
                        <span>⚡</span> <span>पूरी मुख्य किताब खरीदें (₹99)</span>
                    </a>
                </div>
            `;
            document.body.prepend(demoBar);

            if (hasVideos) {
                document.getElementById('readerVideoBtn')?.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.openBookVideoModal(bookTitle, videos);
                });
            }
        }
    } else {
        if (aoiCurrentBookData.readEnabled === false) {
            accessDeniedModal.style.display = "flex";
            return;
        }

        if (userId && typeof supabaseClient !== "undefined") {
            const { data, error } = await supabaseClient
                .from("purchases")
                .select("id")
                .eq("profile_id", userId)
                .eq("book_id", canonicalBookId)
                .single();

            if (error || !data) {
                console.warn("No purchase record in DB, proceeding with local access...");
            }
        }
    }

    // Check for WebP / Image Pages first (Smart HD Fast Engine)
    let pageImages = null;

    if (isDemoMode) {
        // DEMO MODE: Check for specific demo reader allowed pages (e.g. 1, 2, 3, 5, 8, 12, 16 or 1-10)
        const allowedPagesParam = (urlParams.get("pages") || aoiCurrentBookData.demo_reader_pages || aoiCurrentBookData.demoPages || '').trim();
        const targetMain = (aoiCurrentBookData.targetMainBook || (canonicalBookId.replace(/^(DEMO_|DEMO-|BONUS_|BONUS-|FREE_|FREE-)/i, '')) || (canonicalBookId === 'BK002' ? 'BK002' : 'BK001')).toUpperCase();
        
        let parsedPageNumbers = [];
        if (allowedPagesParam) {
            allowedPagesParam.split(/[,;]+/).forEach(part => {
                const clean = part.trim();
                if (clean.includes('-')) {
                    const [s, e] = clean.split('-').map(x => parseInt(x.trim(), 10));
                    if (!isNaN(s) && !isNaN(e) && s <= e) {
                        for (let p = s; p <= e; p++) {
                            if (!parsedPageNumbers.includes(p)) parsedPageNumbers.push(p);
                        }
                    }
                } else {
                    const num = parseInt(clean, 10);
                    if (!isNaN(num) && !parsedPageNumbers.includes(num)) {
                        parsedPageNumbers.push(num);
                    }
                }
            });
        }

        const targetParentBook = jsonBooks.find(b => b && b.id && b.id.toUpperCase() === targetMain);
        let rawPreviewImages = [];
        if (aoiCurrentBookData.demoImages && Array.isArray(aoiCurrentBookData.demoImages) && aoiCurrentBookData.demoImages.length > 0) {
            rawPreviewImages = aoiCurrentBookData.demoImages;
        } else if (aoiCurrentBookData.demo_images && Array.isArray(aoiCurrentBookData.demo_images) && aoiCurrentBookData.demo_images.length > 0) {
            rawPreviewImages = aoiCurrentBookData.demo_images;
        } else if (aoiCurrentBookData.sample_preview && Array.isArray(aoiCurrentBookData.sample_preview.pages) && aoiCurrentBookData.sample_preview.pages.length > 0) {
            rawPreviewImages = aoiCurrentBookData.sample_preview.pages.map(p => typeof p === 'object' ? p.image : p).filter(Boolean);
        } else if (targetParentBook) {
            if (targetParentBook.demo_images && Array.isArray(targetParentBook.demo_images) && targetParentBook.demo_images.length > 0) {
                rawPreviewImages = targetParentBook.demo_images;
            } else if (targetParentBook.demoImages && Array.isArray(targetParentBook.demoImages) && targetParentBook.demoImages.length > 0) {
                rawPreviewImages = targetParentBook.demoImages;
            } else if (targetParentBook.sample_preview && Array.isArray(targetParentBook.sample_preview.pages)) {
                rawPreviewImages = targetParentBook.sample_preview.pages.map(p => typeof p === 'object' ? p.image : p).filter(Boolean);
            }
        }

        let combinedImages = [];
        let sourceMap = [];

        // 1. Add all sample preview images (resolved with proper ../ relative path)
        if (rawPreviewImages && rawPreviewImages.length > 0) {
            rawPreviewImages.forEach((img, idx) => {
                if (img && typeof img === 'string') {
                    const cleanPath = img.startsWith('/') ? ('..' + img) : (img.startsWith('http') || img.startsWith('data:') || img.startsWith('..') ? img : ('../' + img));
                    if (!combinedImages.includes(cleanPath)) {
                        combinedImages.push(cleanPath);
                        sourceMap.push(idx + 1);
                    }
                }
            });
        }

        // 2. Add selected specific main book pages
        if (parsedPageNumbers.length > 0) {
            parsedPageNumbers.forEach(p => {
                const pagePath = `../images/books/${targetMain}/${p}.webp`;
                if (!combinedImages.includes(pagePath)) {
                    combinedImages.push(pagePath);
                    sourceMap.push(p);
                }
            });
        } else if (combinedImages.length === 0) {
            if (aoiCurrentBookData.pageImages && Array.isArray(aoiCurrentBookData.pageImages) && aoiCurrentBookData.pageImages.length > 0) {
                aoiCurrentBookData.pageImages.slice(0, 5).forEach((img, idx) => {
                    const cleanPath = img.startsWith('/') ? ('..' + img) : (img.startsWith('http') || img.startsWith('data:') || img.startsWith('..') ? img : ('../' + img));
                    combinedImages.push(cleanPath);
                    sourceMap.push(idx + 1);
                });
            } else {
                [1, 2, 3, 4, 5].forEach(p => {
                    combinedImages.push(`../images/books/${targetMain}/${p}.webp`);
                    sourceMap.push(p);
                });
            }
        }

        pageImages = combinedImages;
        window.aoiSourcePageMap = sourceMap;
    } else {
        // MAIN BOOK MODE: load FULL book pages (152 pages for BK001, 118 pages for BK002, etc.)
        if (aoiCurrentBookData.pageImages && Array.isArray(aoiCurrentBookData.pageImages) && aoiCurrentBookData.pageImages.length > 0) {
            pageImages = aoiCurrentBookData.pageImages;
        }

        // Check IndexedDB Studio Cache
        if (!pageImages || !pageImages.length) {
            try {
                pageImages = await loadPagesFromIndexedDb(canonicalBookId);
            } catch (e) {}
        }

        if (!pageImages || !pageImages.length) {
            const localPagesKey = `AOI_BOOK_PAGES_${canonicalBookId}`;
            const localStudioKey = `AOI_AUDIO_SCRIPTS_${canonicalBookId}`;
            try {
                const rawPages = localStorage.getItem(localPagesKey);
                if (rawPages) pageImages = JSON.parse(rawPages);
                else {
                    const rawStudio = localStorage.getItem(localStudioKey);
                    if (rawStudio) {
                        const parsedStudio = JSON.parse(rawStudio);
                        if (parsedStudio && parsedStudio.pageImages && parsedStudio.pageImages.length) {
                            pageImages = parsedStudio.pageImages;
                        }
                    }
                }
            } catch (e) {}
        }

        // Check if book has hasWebpPages flag or totalPages in repository
        if (!pageImages || !pageImages.length) {
            const defaultTotal = canonicalBookId === 'BK001' ? 152 : (canonicalBookId === 'BK002' ? 118 : 0);
            const total = aoiCurrentBookData.totalPages || defaultTotal;
            const basePath = aoiCurrentBookData.pageImagesPath || `images/books/${canonicalBookId}`;
            if ((aoiCurrentBookData.hasWebpPages || canonicalBookId === 'BK001' || canonicalBookId === 'BK002') && total > 0) {
                pageImages = [];
                for (let i = 1; i <= total; i++) {
                    pageImages.push(`../${basePath}/${i}.webp`);
                }
            } else {
                // Probe static WebP image in repository
                try {
                    const probeRes = await fetch(`../images/books/${canonicalBookId}/1.webp`, { method: 'HEAD' });
                    if (probeRes.ok) {
                        const count = total > 0 ? total : (canonicalBookId === 'BK001' ? 152 : (canonicalBookId === 'BK002' ? 118 : 100));
                        pageImages = [];
                        for (let i = 1; i <= count; i++) {
                            pageImages.push(`../images/books/${canonicalBookId}/${i}.webp`);
                        }
                    }
                } catch (e) {}
            }
        }
    }

    if (pageImages && pageImages.length > 0) {
        console.log("⚡ Fast HD Image Engine Activated. Total Pages:", pageImages.length);
        initImageModeReader(pageImages);
    } else {
        console.log("📄 Standard PDF Engine Activated for:", targetBookId);
        loadPdfFile(aoiCurrentBookData.mainPdf || "pdf/full/" + targetBookId + ".pdf");
    }
}

function loadPagesFromIndexedDb(bookId) {
    return new Promise((resolve) => {
        try {
            const req = indexedDB.open('AoiStudioDB', 1);
            req.onsuccess = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('bookPages')) return resolve(null);
                const tx = db.transaction('bookPages', 'readonly');
                const store = tx.objectStore('bookPages');
                const getReq = store.get(bookId);
                getReq.onsuccess = () => resolve(getReq.result || null);
                getReq.onerror = () => resolve(null);
            };
            req.onerror = () => resolve(null);
        } catch (err) {
            resolve(null);
        }
    });
}

// =======================================================
// FAST HD IMAGE MODE READER (WEBP / PNG / ZERO-CRASH)
// =======================================================
let aoiPageImagesList = null;

function initImageModeReader(images) {
    aoiPageImagesList = images;
    aoiTotalPages = images.length;
    window.aoiTotalPages = aoiTotalPages;
    window.aoiCurrentBookData = aoiCurrentBookData;

    if (pageSlider) pageSlider.max = aoiTotalPages;

    let savedData = JSON.parse(localStorage.getItem("AOI_READ_PROGRESS") || "{}");
    let savedPage = savedData[aoiBookId] || 1;

    if (savedPage > 1 && savedPage <= aoiTotalPages) {
        if (lastSavedPageText) lastSavedPageText.textContent = `Page ${savedPage}`;
        if (continueReadingModal) continueReadingModal.style.display = "flex";

        document.getElementById("confirmContinueBtn").onclick = () => {
            continueReadingModal.style.display = "none";
            initReaderAtPage(savedPage);
        };

        document.getElementById("startAgainBtn").onclick = () => {
            continueReadingModal.style.display = "none";
            initReaderAtPage(1);
        };
    } else {
        initReaderAtPage(1);
    }
}

// =======================================================
// LOAD PDF VIA PDF.JS (ROBUST MULTI-PATH FALLBACK)
// =======================================================
function loadPdfFile(pdfUrl) {
    // Generate candidate paths
    let primaryPath = pdfUrl;
    let fallbackPath = pdfUrl.startsWith('/') ? ('..' + pdfUrl) : ('../' + pdfUrl);
    if (pdfUrl.startsWith('../')) {
        fallbackPath = pdfUrl.replace(/^\.\.\//, '/');
    }

    console.log("Loading PDF primary attempt:", primaryPath);

    function attemptLoad(urlToTry, isFallback = false) {
        pdfjsLib.getDocument(urlToTry).promise.then(pdfDoc_ => {
            aoiPdfDoc = pdfDoc_;
            aoiTotalPages = aoiPdfDoc.numPages;
            window.aoiPdfDoc = aoiPdfDoc;
            window.aoiTotalPages = aoiTotalPages;
            window.aoiCurrentBookData = aoiCurrentBookData;
            console.log("PDF Loaded Successfully from", urlToTry, "Total Pages:", aoiTotalPages);

            if (pageSlider) pageSlider.max = aoiTotalPages;

            let savedData = JSON.parse(localStorage.getItem("AOI_READ_PROGRESS") || "{}");
            let savedPage = savedData[aoiBookId] || 1;

            if (savedPage > 1 && savedPage <= aoiTotalPages) {
                if (lastSavedPageText) lastSavedPageText.textContent = `Page ${savedPage}`;
                if (continueReadingModal) continueReadingModal.style.display = "flex";

                document.getElementById("confirmContinueBtn").onclick = () => {
                    continueReadingModal.style.display = "none";
                    initReaderAtPage(savedPage);
                };

                document.getElementById("startAgainBtn").onclick = () => {
                    continueReadingModal.style.display = "none";
                    initReaderAtPage(1);
                };
            } else {
                initReaderAtPage(1);
            }

        }).catch(err => {
            console.warn(`PDF load failed for [${urlToTry}]:`, err);
            if (!isFallback) {
                console.log("Retrying with fallback path:", fallbackPath);
                attemptLoad(fallbackPath, true);
            } else {
                console.error("All PDF load paths failed.");
                showErrorScreen();
            }
        });
    }

    attemptLoad(primaryPath);
}

function initReaderAtPage(startPage) {
    aoiPageNum = startPage;
    window.aoiPageNum = aoiPageNum;
    renderPage(aoiPageNum);
    if (loadingIndicator) loadingIndicator.style.display = "none";
}

// =======================================================
// RENDER SINGLE PAGE (HYBRID WEBP IMAGE & PDF CANVAS)
// =======================================================
function renderPage(num) {
    const pageImgEl = document.getElementById('pageImage');

    // Case 1: Fast HD WebP Image Mode
    if (aoiPageImagesList && aoiPageImagesList.length >= num) {
        if (aoiCanvas) aoiCanvas.style.display = 'none';
        if (pageImgEl) {
            pageImgEl.style.display = 'block';
            pageImgEl.src = aoiPageImagesList[num - 1];
            
            const container = document.getElementById('canvasContainer');
            if (aoiScale === 1.2) {
                pageImgEl.style.transform = 'none';
                if (container) container.style.overflow = 'hidden';
            } else {
                pageImgEl.style.transform = `scale(${aoiScale / 1.2})`;
                pageImgEl.style.transformOrigin = 'center center';
                if (container) container.style.overflow = 'auto';
            }
            pageImgEl.style.transition = 'transform 0.15s ease';

            // Instant Background Preload next/prev pages
            if (num < aoiTotalPages) {
                const preloadNext = new Image();
                preloadNext.src = aoiPageImagesList[num];
            }
            if (num > 1) {
                const preloadPrev = new Image();
                preloadPrev.src = aoiPageImagesList[num - 2];
            }
        }
        updateUIControls(num);
        saveProgress(num);
        return;
    }

    // Case 2: PDF Mode via PDF.js
    if (!aoiPdfDoc) return;
    if (pageImgEl) pageImgEl.style.display = 'none';
    if (aoiCanvas) aoiCanvas.style.display = 'block';

    aoiPageRendering = true;
    
    aoiPdfDoc.getPage(num).then(page => {
        const container = document.getElementById('readerContainer');
        const availableHeight = container ? container.clientHeight - 20 : window.innerHeight - 150;
        const availableWidth = container ? container.clientWidth - 20 : window.innerWidth - 40;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        
        let hScale = availableHeight / unscaledViewport.height;
        let wScale = availableWidth / unscaledViewport.width;
        let autoScale = Math.min(hScale, wScale);
        
        // Base scale for fitting the page, including user zoom.
        const baseScale = autoScale * (aoiScale / 1.2);
        
        // Get the viewport at this base scale.
        const viewport = page.getViewport({ scale: baseScale });

        const devicePixelRatio = window.devicePixelRatio || 1;

        // Set the canvas backing store size to be higher resolution.
        aoiCanvas.width = viewport.width * devicePixelRatio;
        aoiCanvas.height = viewport.height * devicePixelRatio;

        // Set the canvas display size.
        aoiCanvas.style.width = `${viewport.width}px`;
        aoiCanvas.style.height = `${viewport.height}px`;
        
        // Create a new viewport for rendering, scaled up by the device pixel ratio.
        const renderViewport = page.getViewport({ scale: baseScale * devicePixelRatio });

        // Disable image smoothing to get crisper text and vectors.
        aoiCtx.imageSmoothingEnabled = false;

        const renderContext = {
            canvasContext: aoiCtx,
            viewport: renderViewport
        };

        const renderTask = page.render(renderContext);

        renderTask.promise.then(() => {
            aoiPageRendering = false;
            if (aoiPageNumPending !== null) {
                renderPage(aoiPageNumPending);
                aoiPageNumPending = null;
            }
        });
    });

    updateUIControls(num);
    saveProgress(num);
}

function queueRenderPage(num) {
    if (aoiPageRendering) {
        aoiPageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Centralized Page Change and Audio Synchronization
let _audioSyncDebounceTimer = null;
function syncAudioEngineWithPage(immediate = false) {
    clearTimeout(_audioSyncDebounceTimer);
    const doSync = () => {
        if (window.aoiAudioBookEngine && window.aoiAudioBookEngine.isPlaying) {
            window.aoiAudioBookEngine.playCurrentPage();
        }
    };
    if (immediate) {
        doSync();
    } else {
        _audioSyncDebounceTimer = setTimeout(doSync, 150);
    }
}

function changePage(targetPage, syncAudio = true, immediateAudio = true) {
    targetPage = Math.max(1, Math.min(aoiTotalPages || 1, parseInt(targetPage) || 1));
    if (aoiPageNum === targetPage && !syncAudio) return;
    
    aoiPageNum = targetPage;
    window.aoiPageNum = aoiPageNum;
    queueRenderPage(aoiPageNum);
    
    if (syncAudio) {
        syncAudioEngineWithPage(immediateAudio);
    }
}

function onPrevPage() {
    if (aoiPageNum <= 1) return;
    changePage(aoiPageNum - 1, true, true);
}

function onNextPage() {
    if (aoiPageNum >= aoiTotalPages) return;
    changePage(aoiPageNum + 1, true, true);
}

// Global Hooks for Audio Engine and Controls
window.changePage = changePage;
window.onPrevPage = onPrevPage;
window.onNextPage = onNextPage;
window.renderPage = renderPage;

// =======================================================
// UI & PROGRESS UPDATES
// =======================================================
function updateUIControls(num) {
    if (headerPageInfo) headerPageInfo.textContent = `Page ${num} / ${aoiTotalPages}`;
    if (pageInfoDisplay) pageInfoDisplay.textContent = `Page ${num} / ${aoiTotalPages}`;
    
    const percent = Math.round((num / (aoiTotalPages || 1)) * 100);
    if (headerPercentInfo) headerPercentInfo.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (topProgressBar) topProgressBar.title = `${percent}% Completed`;

    if (pageSlider && parseInt(pageSlider.value) !== num) {
        pageSlider.value = num;
    }

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (prevBtn) prevBtn.disabled = (num <= 1);
    if (nextBtn) nextBtn.disabled = (num >= aoiTotalPages);

    updateWhatsAppHelpLink(num);
}

function saveProgress(num) {
    let savedData = JSON.parse(localStorage.getItem("AOI_READ_PROGRESS") || "{}");
    savedData[aoiBookId] = num;
    localStorage.setItem("AOI_READ_PROGRESS", JSON.stringify(savedData));
}

// =======================================================
// READING THEME MANAGER (DARK NIGHT MODE / LIGHT DAY MODE)
// =======================================================
function initThemeManager() {
    const themeBtn = document.getElementById("themeToggleBtn");
    const themeIcon = document.getElementById("themeToggleIcon");
    const savedTheme = localStorage.getItem("AOI_READER_THEME") || "dark";

    function applyTheme(theme) {
        if (theme === "light") {
            document.body.classList.remove("theme-dark");
            document.body.classList.add("theme-light");
            if (themeIcon) themeIcon.textContent = "☀️";
            if (themeBtn) themeBtn.title = "डार्क / नाइट मोड पर स्विच करें (Dark Mode)";
        } else {
            document.body.classList.remove("theme-light");
            document.body.classList.add("theme-dark");
            if (themeIcon) themeIcon.textContent = "🌙";
            if (themeBtn) themeBtn.title = "लाइट / डे मोड पर स्विच करें (Light Mode)";
        }
        localStorage.setItem("AOI_READER_THEME", theme);
    }

    applyTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.body.classList.contains("theme-light") ? "light" : "dark";
            const next = current === "light" ? "dark" : "light";
            applyTheme(next);
            showToast(next === "dark" ? "🌙 नाइट मोड चालू (आँखों के लिए सुरक्षित)" : "☀️ लाइट मोड चालू");
        });
    }
}

// =======================================================
// EVENT LISTENERS & CONTROLS
// =======================================================
const prevBtnEl = document.getElementById("prevPageBtn");
const nextBtnEl = document.getElementById("nextPageBtn");
if (prevBtnEl) prevBtnEl.addEventListener("click", onPrevPage);
if (nextBtnEl) nextBtnEl.addEventListener("click", onNextPage);

if (pageSlider) {
    // While dragging: update page visuals with debounced audio sync
    pageSlider.addEventListener("input", (e) => {
        let targetPage = parseInt(e.target.value);
        if (targetPage >= 1 && targetPage <= aoiTotalPages) {
            changePage(targetPage, true, false);
        }
    });

    // When released: trigger immediate audio sync
    pageSlider.addEventListener("change", (e) => {
        let targetPage = parseInt(e.target.value);
        if (targetPage >= 1 && targetPage <= aoiTotalPages) {
            changePage(targetPage, true, true);
        }
    });
}

const pageJumpBtn = document.getElementById("pageJumpBtn");
if (pageJumpBtn) {
    pageJumpBtn.addEventListener("click", () => {
        let inputVal = parseInt(document.getElementById("pageJumpInput").value);
        if (inputVal >= 1 && inputVal <= aoiTotalPages) {
            changePage(inputVal, true, true);
            document.getElementById("pageJumpInput").value = "";
        } else {
            alert(`कृपया 1 से ${aoiTotalPages} के बीच का वैध पेज नंबर डालें।`);
        }
    });
}

// Enter key support for Page Jump Input
const pageJumpInputEl = document.getElementById("pageJumpInput");
if (pageJumpInputEl) {
    pageJumpInputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            if (pageJumpBtn) pageJumpBtn.click();
        }
    });
}

const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");

if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
        if (aoiScale < 2.5) {
            aoiScale += 0.2;
            renderPage(aoiPageNum);
        }
    });
}

if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
        if (aoiScale > 0.8) {
            aoiScale -= 0.2;
            renderPage(aoiPageNum);
        }
    });
}

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown") {
        onNextPage();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        onPrevPage();
    } else if (e.key === "+" || e.key === "=") {
        aoiScale = Math.min(2.5, aoiScale + 0.2);
        renderPage(aoiPageNum);
    } else if (e.key === "-") {
        aoiScale = Math.max(0.8, aoiScale - 0.2);
        renderPage(aoiPageNum);
    }
});

// Touch Swipe Navigation for Mobile
let touchStartX = 0;
let touchStartY = 0;
const readerContainerEl = document.getElementById("readerContainer");

if (readerContainerEl) {
    readerContainerEl.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    readerContainerEl.addEventListener("touchend", (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // Horizontal swipe detected (min 60px distance and mostly horizontal)
            if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
                if (diffX < 0) {
                    onNextPage(); // Swiped Left -> Next Page
                } else {
                    onPrevPage(); // Swiped Right -> Prev Page
                }
            }
        }
    }, { passive: true });
}

function showErrorScreen() {
    if (loadingIndicator) loadingIndicator.style.display = "none";
    if (pdfErrorScreen) pdfErrorScreen.style.display = "flex";
}

// =======================================================
// WHATSAPP DYNAMIC USER LINK GENERATOR (7974422572)
// =======================================================
function updateWhatsAppHelpLink(page) {
    const whatsappBtn = document.getElementById("whatsappFloatBtn");
    if (!whatsappBtn) return;
    const title = (aoiCurrentBookData && (aoiCurrentBookData.heading || aoiCurrentBookData.name || aoiCurrentBookData.title)) || document.getElementById('bookHeading')?.textContent || "ई-बुक";
    const curPage = page || aoiPageNum || 1;
    const bId = (aoiBookId || "BK001").trim().toUpperCase();
    const message = `नमस्ते Aarogyam India, मैं '${title}' (Book ID: ${bId}) का पेज संख्या ${curPage} पढ़ रहा हूँ और मुझे सहायता/जानकारी चाहिए।`;
    whatsappBtn.href = "https://wa.me/917974422572?text=" + encodeURIComponent(message);
}

// =======================================================
// TOAST NOTIFICATION UTILITY
// =======================================================
function showToast(message, duration = 3000) {
    let toast = document.getElementById("readerToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "readerToast";
        toast.className = "reader-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(window._readerToastTimer);
    window._readerToastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, duration);
}
window.showReaderToast = showToast;

// =======================================================
// BOOK LANDING PAGE 1-CLICK SHARE SYSTEM (ID BASED)
// =======================================================
function initShareBookSystem() {
    const shareBtn = document.getElementById("shareBookFloatBtn");
    const shareModal = document.getElementById("shareBookModal");
    const closeShareModalBtn = document.getElementById("closeShareModalBtn");
    const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
    const shareLinkInput = document.getElementById("shareLinkInput");
    const shareSubTitle = document.getElementById("shareBookModalSubtitle");
    const shareWaBtn = document.getElementById("shareWhatsappDirectBtn");
    const shareTgBtn = document.getElementById("shareTelegramDirectBtn");
    const shareFbBtn = document.getElementById("shareFacebookDirectBtn");

    if (!shareBtn) return;

    function getBookShareData() {
        const bId = (aoiBookId || (new URLSearchParams(window.location.search).get("book") || new URLSearchParams(window.location.search).get("id") || "BK001")).trim().toUpperCase();
        const title = (aoiCurrentBookData && (aoiCurrentBookData.heading || aoiCurrentBookData.name || aoiCurrentBookData.title)) || document.getElementById('bookHeading')?.textContent || "Aarogyam India ई-बुक";
        const origin = window.location.origin;
        // Canonical share link passing through serverless open-graph pre-renderer
        const shareUrl = `${origin}/api/share?id=${encodeURIComponent(bId)}`;
        const directLandingUrl = `${origin}/ebooks/book-landing.html?id=${encodeURIComponent(bId)}`;
        const shareTitle = `🌾 ${title} - Aarogyam India`;
        const shareMessage = `🌾 *Aarogyam India Practical Agriculture E-Book*\n\n📖 *${title}*\n(Book ID: ${bId})\n\n👉 इस संपूर्ण ई-बुक का विवरण, डेमो पेज एवं विशेष ऑफर देखने के लिए नीचे दिए लिंक पर क्लिक करें:\n${shareUrl}`;

        return { bId, title, origin, shareUrl, directLandingUrl, shareTitle, shareMessage };
    }

    function openShareModal() {
        if (!shareModal) return;
        const data = getBookShareData();

        if (shareSubTitle) {
            shareSubTitle.innerHTML = `<strong>${data.title}</strong> (ID: <code>${data.bId}</code>) का लैंडिंग पेज शेयर करें:`;
        }

        if (shareLinkInput) {
            shareLinkInput.value = data.shareUrl;
        }

        if (shareWaBtn) {
            shareWaBtn.href = "https://api.whatsapp.com/send?text=" + encodeURIComponent(data.shareMessage);
        }

        if (shareTgBtn) {
            shareTgBtn.href = "https://t.me/share/url?url=" + encodeURIComponent(data.shareUrl) + "&text=" + encodeURIComponent(`🌾 ${data.title} - Aarogyam India ई-बुक`);
        }

        if (shareFbBtn) {
            shareFbBtn.href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(data.shareUrl);
        }

        shareModal.style.display = "flex";
    }

    shareBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const data = getBookShareData();

        // 1. Try Native Mobile Web Share API if supported
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data.shareTitle,
                    text: data.shareMessage,
                    url: data.shareUrl
                });
                showToast("✅ पुस्तक लिंक सफलतापूर्वक शेयर किया गया!");
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') {
                    return; // User dismissed share sheet
                }
                console.warn("Native Web Share fallback to modal:", err);
            }
        }

        // 2. Open Share Modal (Desktop / Fallback)
        openShareModal();
    });

    if (closeShareModalBtn) {
        closeShareModalBtn.addEventListener("click", () => {
            if (shareModal) shareModal.style.display = "none";
        });
    }

    if (shareModal) {
        shareModal.addEventListener("click", (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = "none";
            }
        });
    }

    if (copyShareLinkBtn && shareLinkInput) {
        copyShareLinkBtn.addEventListener("click", async () => {
            const linkToCopy = shareLinkInput.value || getBookShareData().shareUrl;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(linkToCopy);
                } else {
                    shareLinkInput.select();
                    document.execCommand('copy');
                }
                copyShareLinkBtn.innerHTML = `<i class="fa-solid fa-check"></i> कॉपीड!`;
                showToast("✅ लैंडिंग पेज लिंक कॉपी कर लिया गया है!");
                setTimeout(() => {
                    copyShareLinkBtn.innerHTML = `<i class="fa-regular fa-copy"></i> कॉपी`;
                }, 2500);
            } catch (err) {
                console.error("Clipboard copy error:", err);
                shareLinkInput.select();
                showToast("लिंक का चयन करें और कॉपी करें");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initThemeManager();
    setTimeout(() => {
        updateWhatsAppHelpLink();
        initShareBookSystem();
    }, 600);
});

// Global Keyboard Shortcut: Escape to close modals
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        const shareModal = document.getElementById("shareBookModal");
        if (shareModal && shareModal.style.display !== "none") {
            shareModal.style.display = "none";
        }
        if (aiAskModal && aiAskModal.style.display !== "none") {
            aiAskModal.style.display = "none";
        }
    }
});

// AI Ask Modal Toggle
const aiAskBtn = document.getElementById("aiAskBtn");
const aiAskModal = document.getElementById("aiAskModal");
const closeAiModal = document.getElementById("closeAiModal");
const submitAiQuery = document.getElementById("submitAiQuery");

if (aiAskBtn) {
    aiAskBtn.addEventListener("click", () => {
        if (aiAskModal) aiAskModal.style.display = "flex";
    });
}

if (closeAiModal) {
    closeAiModal.addEventListener("click", () => {
        if (aiAskModal) aiAskModal.style.display = "none";
    });
}

if (submitAiQuery) {
    submitAiQuery.addEventListener("click", () => {
        const queryText = document.getElementById("aiQueryInput").value.trim();
        if (!queryText) {
            alert("कृपया अपना सवाल दर्ज करें।");
            return;
        }
        alert("यह V1 रीडर का प्रीमियम फीचर है! V2 अपडेट में इस पर AI आधारित उत्तर मिलना शुरू हो जाएगा। आपका सवाल दर्ज कर लिया गया है: " + queryText);
        document.getElementById("aiQueryInput").value = "";
        if (aiAskModal) aiAskModal.style.display = "none";
    });
}

// =================================================================
// UNIVERSAL IN-PAGE VIDEO PLAYER MODAL ENGINE (MULTI-VIDEO PLAYLIST)
// =================================================================
window.extractYoutubeEmbedUrl = function (url) {
    if (!url) return '';
    let str = String(url).trim();
    if (str.includes('embed/')) return str;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = str.match(regExp);
    if (match && match[2].length === 11) {
        return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
    }
    return str;
};

window.switchActiveVideoModal = function (url, btn) {
    const frame = document.getElementById('ai-active-video-frame');
    const nativePlayer = document.getElementById('ai-active-video-native');
    const isDirect = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

    if (isDirect) {
        if (frame) {
            frame.src = '';
            frame.style.display = 'none';
        }
        if (nativePlayer) {
            nativePlayer.style.display = 'block';
            nativePlayer.src = url;
            nativePlayer.play().catch(() => {});
        }
    } else {
        if (nativePlayer) {
            nativePlayer.pause();
            nativePlayer.style.display = 'none';
        }
        if (frame) {
            frame.style.display = 'block';
            frame.src = window.extractYoutubeEmbedUrl(url);
        }
    }

    document.querySelectorAll('.ai-video-playlist-btn').forEach(b => {
        b.style.background = '#1e293b';
        b.style.borderColor = '#334155';
        b.classList.remove('active');
    });
    if (btn) {
        btn.style.background = '#ef4444';
        btn.style.borderColor = '#ef4444';
        btn.classList.add('active');
    }
};

window.closeBookVideoModal = function () {
    const overlay = document.getElementById('ai-book-video-modal-overlay');
    if (overlay) {
        const frame = document.getElementById('ai-active-video-frame');
        if (frame) frame.src = '';
        const nativePlayer = document.getElementById('ai-active-video-native');
        if (nativePlayer) nativePlayer.pause();
        overlay.remove();
    }
};

window.openBookVideoModal = function (bookTitle, videos) {
    window.closeBookVideoModal();

    let list = [];
    if (Array.isArray(videos)) {
        list = videos.map((v, i) => {
            if (typeof v === 'string') return { title: `भाग #${i + 1}`, url: v };
            return { title: v.title || `भाग #${i + 1}`, url: v.url || v.link || '' };
        }).filter(v => v && v.url);
    } else if (typeof videos === 'string' && videos.trim()) {
        list = [{ title: '📺 वीडियो डेमो', url: videos.trim() }];
    }

    if (list.length === 0) {
        alert('इस पुस्तक के लिए कोई वीडियो लिंक उपलब्ध नहीं है।');
        return;
    }

    const firstItem = list[0];
    const isDirect = /\.(mp4|webm|ogg)(\?.*)?$/i.test(firstItem.url);
    const firstEmbed = window.extractYoutubeEmbedUrl(firstItem.url);

    const safeTitle = (bookTitle || 'eBook').replace(/[<>&"']/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
        }
        return c;
    });

    const modalHtml = `
      <div id="ai-book-video-modal-overlay" style="display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:9999999;padding:16px;box-sizing:border-box;">
        <div style="background:#0f172a;border:1.5px solid #334155;border-radius:20px;max-width:760px;width:100%;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.7);position:relative;color:#fff;display:flex;flex-direction:column;max-height:92vh;">
          
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:#1e293b;border-bottom:1px solid #334155;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.2rem;color:#ef4444;">🎬</span>
              <h3 style="margin:0;font-size:1.05rem;font-weight:900;color:#f8fafc;line-height:1.2;">
                ${safeTitle} — वीडियो डेमो
              </h3>
            </div>
            <button onclick="window.closeBookVideoModal()" style="background:transparent;border:none;color:#94a3b8;font-size:1.8rem;cursor:pointer;line-height:1;padding:0 8px;display:flex;align-items:center;" title="बंद करें (Close)">&times;</button>
          </div>

          <!-- Video Player Container (16:9 Responsive) -->
          <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:#000;flex-shrink:0;">
            <iframe 
              id="ai-active-video-frame" 
              src="${isDirect ? '' : firstEmbed}" 
              title="${safeTitle}" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen 
              style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:${isDirect ? 'none' : 'block'};">
            </iframe>
            <video 
              id="ai-active-video-native" 
              src="${isDirect ? firstItem.url : ''}" 
              controls 
              autoplay 
              style="position:absolute;top:0;left:0;width:100%;height:100%;display:${isDirect ? 'block' : 'none'};background:#000;">
            </video>
          </div>

          <!-- Multi-Video Playlist Selector (If more than 1 video) -->
          ${list.length > 1 ? `
            <div style="padding:12px 18px;background:#0b1329;border-top:1px solid #1e293b;flex-shrink:0;">
              <div style="font-size:0.78rem;font-weight:800;color:#38bdf8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:6px;">
                <span>📺</span> <span>वीडियो प्लेलिस्ट (कुल ${list.length} भाग उपलब्ध - देखने के लिए चुनें):</span>
              </div>
              <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;">
                ${list.map((v, idx) => {
                  const safeVTitle = (v.title || `भाग #${idx + 1}`).replace(/[<>&"']/g, '');
                  const rawUrl = (v.url || '').replace(/'/g, "\\'");
                  return `
                    <button 
                      type="button" 
                      onclick="window.switchActiveVideoModal('${rawUrl}', this)" 
                      class="ai-video-playlist-btn ${idx === 0 ? 'active' : ''}" 
                      style="padding:6px 14px;border-radius:20px;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;background:${idx === 0 ? '#ef4444' : '#1e293b'};color:#fff;border:1px solid ${idx === 0 ? '#ef4444' : '#334155'};transition:all 0.2s;"
                    >
                      <span>▶</span> <span>${safeVTitle}</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Footer Actions -->
          <div style="padding:10px 18px;display:flex;justify-content:space-between;align-items:center;background:#0f172a;flex-wrap:wrap;gap:10px;border-top:1px solid #1e293b;flex-shrink:0;">
            <div style="font-size:0.78rem;color:#94a3b8;">
              🌾 Aarogyam India Digital Learning Hub
            </div>
            <button onclick="window.closeBookVideoModal()" style="background:#334155;color:#fff;border:none;padding:6px 16px;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;">
              बंद करें (Close)
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Close on overlay click outside box
    const overlay = document.getElementById('ai-book-video-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeBookVideoModal();
        });
    }
};

// Global ESC key listener to close video modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        window.closeBookVideoModal();
    }
});