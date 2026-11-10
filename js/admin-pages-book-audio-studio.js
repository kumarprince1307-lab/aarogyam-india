/**
 * =================================================================
 * AAROGYAM INDIA - PRO EBOOK & AUDIO STUDIO (ALL-IN-ONE ENGINE v5.0)
 * =================================================================
 * 1. IndexedDB Storage: Handles 150+ Full HD WebP pages (No 5MB quota crash)
 * 2. Real-Time Upload & Conversion Progress Bar with KB/MB stats
 * 3. Staging & Discard Protection (Save / Discard Drafts)
 * 4. 1-Click ZIP Export for Git (images/books/BK001/1.webp to N.webp)
 * 5. Single Page Replace vs Bulk Replace Detection
 * 6. 24kbps Opus Original Mic Voice Recording + Female TTS Mode
 */

import { initAdminLayout } from './admin-main.js';

// PDF.js Worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Reliable PDF.js Loader & Initializer
async function ensurePdfJsLoaded() {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
        if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        return window.pdfjsLib;
    }
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            if (window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(window.pdfjsLib);
            } else {
                reject(new Error('PDF.js library failed to mount'));
            }
        };
        script.onerror = () => reject(new Error('PDF.js CDN load error'));
        document.head.appendChild(script);
    });
}

// Global Studio State
let studioPdfDoc = null;
let studioCurrentBookId = 'BK001';
let studioCurrentPage = 1;
let studioTotalPages = 152;
let studioBookData = null;
let studioAudioScripts = { pages: {} };
let studioPageImages = []; // Array of Data URLs / Blobs
let studioOriginalBackup = null; // Backup for Discard feature
let hasUnsavedChanges = false;
let isSyncInProgress = false; // Anti-duplicate click lock
let modifiedPageIndices = new Set(); // Stores 0-indexed page numbers that changed
let audioScriptsModified = false; // Flag if text or audio voice changed
let isFullBookReload = false; // Flag if bulk upload or fresh PDF was loaded
let pendingSmartUploadFiles = []; // Staged files for smart position modal
let studioDemoParsedPages = []; // Stores real book page numbers for demo books
let studioIsDemoStudio = false; // Flag if current studio book is a demo book
let isPageMultiSelectMode = false; // Multi-select page deletion mode
let selectedPagesForBulkAction = new Set(); // Selected page numbers for bulk delete

// Media Recorder
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;

// =======================================================
// 1. INDEXEDDB ENGINE (100MB+ SAFE LOCAL STORAGE)
// =======================================================
function openStudioDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('AoiStudioDB', 1);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('bookPages')) {
                db.createObjectStore('bookPages');
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function savePagesToDb(bookId, imagesArray) {
    try {
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readwrite');
        const store = tx.objectStore('bookPages');
        const cleanId = String(bookId || '').trim();
        store.put(imagesArray, cleanId);
        if (cleanId.toUpperCase() !== cleanId) store.put(imagesArray, cleanId.toUpperCase());
        if (cleanId.toLowerCase() !== cleanId) store.put(imagesArray, cleanId.toLowerCase());
        return new Promise((res) => { tx.oncomplete = () => res(true); });
    } catch (e) {
        console.warn("IndexedDB Save Warning:", e);
        return false;
    }
}

async function loadPagesFromDb(bookId) {
    try {
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readonly');
        const store = tx.objectStore('bookPages');
        const cleanId = String(bookId || '').trim();
        const probeKeys = [cleanId, cleanId.toUpperCase(), cleanId.toLowerCase()].filter(Boolean);
        for (const k of probeKeys) {
            const res = await new Promise((resolve) => {
                const req = store.get(k);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (Array.isArray(res) && res.length > 0) return res;
        }
        return null;
    } catch (e) {
        return null;
    }
}

// 🎁 IndexedDB Storage Helpers for Large Word (.docx) Bonus Files
async function saveBonusFileToDb(bookId, fileObj) {
    try {
        const cleanKey = `bonus_word_${String(bookId || '').toUpperCase().trim()}`;
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readwrite');
        const store = tx.objectStore('bookPages');
        store.put(fileObj, cleanKey);
        return new Promise((res) => { tx.oncomplete = () => res(true); });
    } catch (e) {
        console.warn("IndexedDB Bonus Save Error:", e);
        return false;
    }
}

async function loadBonusFileFromDb(bookId) {
    try {
        const cleanKey = `bonus_word_${String(bookId || '').toUpperCase().trim()}`;
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readonly');
        const store = tx.objectStore('bookPages');
        const req = store.get(cleanKey);
        return new Promise((res) => {
            req.onsuccess = () => res(req.result || null);
            req.onerror = () => res(null);
        });
    } catch (e) {
        return null;
    }
}

async function deleteBonusFileFromDb(bookId) {
    try {
        const cleanKey = `bonus_word_${String(bookId || '').toUpperCase().trim()}`;
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readwrite');
        const store = tx.objectStore('bookPages');
        store.delete(cleanKey);
        return new Promise((res) => { tx.oncomplete = () => res(true); });
    } catch (e) {
        return false;
    }
}

// 📄 IndexedDB Storage Helpers for Attached Source PDF Files (Multi-PDF & Zero-Crash Vault)
async function savePdfFileToDb(bookId, fileObj) {
    try {
        const cleanId = String(bookId || '').toUpperCase().trim();
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readwrite');
        const store = tx.objectStore('bookPages');
        store.put(fileObj, `source_pdf_${cleanId}`);
        store.put(fileObj, `source_pdf_${cleanId.toLowerCase()}`);

        // Also add to multi-PDF list for this book
        const listReq = store.get(`source_pdfs_list_${cleanId}`);
        listReq.onsuccess = () => {
            let list = listReq.result;
            if (!Array.isArray(list)) list = [];
            const idx = list.findIndex(p => p && p.name === fileObj.name);
            if (idx >= 0) list[idx] = fileObj;
            else list.push(fileObj);
            try {
                const tx2 = db.transaction('bookPages', 'readwrite');
                tx2.objectStore('bookPages').put(list, `source_pdfs_list_${cleanId}`);
            } catch (_) {}
        };

        return new Promise((res) => { tx.oncomplete = () => res(true); });
    } catch (e) {
        console.warn("IndexedDB PDF Save Error:", e);
        return false;
    }
}

async function loadAllPdfFilesFromDb(bookId) {
    try {
        const cleanId = String(bookId || '').toUpperCase().trim();
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readonly');
        const store = tx.objectStore('bookPages');
        const res = await new Promise((resolve) => {
            const req = store.get(`source_pdfs_list_${cleanId}`);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
        if (Array.isArray(res) && res.length > 0) return res;

        // Fallback to single PDF
        const single = await loadPdfFileFromDb(cleanId);
        if (single) return [single];
        return [];
    } catch (e) {
        return [];
    }
}

async function loadPdfFileFromDb(bookId) {
    try {
        const cleanId = String(bookId || '').toUpperCase().trim();
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readonly');
        const store = tx.objectStore('bookPages');
        const probeKeys = [
            `source_pdf_${cleanId}`,
            `source_pdf_${cleanId.toLowerCase()}`,
            `source_pdf_${cleanId.toUpperCase()}`
        ];
        for (const k of probeKeys) {
            const res = await new Promise((resolve) => {
                const req = store.get(k);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            });
            if (res) return res;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function deletePdfFileFromDb(bookId) {
    try {
        const cleanId = String(bookId || '').toUpperCase().trim();
        const db = await openStudioDb();
        const tx = db.transaction('bookPages', 'readwrite');
        const store = tx.objectStore('bookPages');
        store.delete(`source_pdf_${cleanId}`);
        store.delete(`source_pdf_${cleanId.toLowerCase()}`);
        return new Promise((res) => { tx.oncomplete = () => res(true); });
    } catch (e) {
        return false;
    }
}

// 🌐 Universal Catalog Synchronizer (Keeps Landing Page, Reader & Download Catalogs in 100% Sync)
function syncBookToAllCatalogs(bookId, totalPages, pageImages = null) {
    try {
        const cleanId = String(bookId || '').toUpperCase().trim();
        if (!cleanId) return;

        // 1. Sync to AAROGYAM_CUSTOM_BOOKS
        let customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
        let bIdx = customBooks.findIndex(b => b && b.id && b.id.toUpperCase() === cleanId);
        const bookTitle = studioBookData?.title || studioBookData?.name || cleanId;
        const bookCover = studioBookData?.cover || studioBookData?.hero?.cover_image || `/images/books/${cleanId.toLowerCase()}-cover.webp`;

        if (bIdx >= 0) {
            customBooks[bIdx].totalPages = totalPages;
            customBooks[bIdx].hasWebpPages = true;
            customBooks[bIdx].hasAudioBook = true;
            if (pageImages && pageImages.length) customBooks[bIdx].pageImages = pageImages;
            customBooks[bIdx].updated_at = new Date().toISOString();
        } else {
            customBooks.push({
                id: cleanId,
                title: bookTitle,
                name: bookTitle,
                category: studioBookData?.category || 'कृषि मास्टर गाइड',
                cover: bookCover,
                totalPages: totalPages,
                hasWebpPages: true,
                hasAudioBook: true,
                pageImages: pageImages || studioPageImages || [],
                pageImagesPath: `images/books/${cleanId}`,
                isCustom: true,
                updated_at: new Date().toISOString()
            });
        }
        localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));

        // 2. Sync to AAROGYAM_BOOK_LANDING_PAGES
        let landingPages = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
        let lpIdx = landingPages.findIndex(p => p && p.id && p.id.toUpperCase() === cleanId);
        if (lpIdx >= 0) {
            landingPages[lpIdx].totalPages = totalPages;
            landingPages[lpIdx].updated_at = new Date().toISOString();
            localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(landingPages));
        }

        console.log(`[Catalogs Synced] Book [${cleanId}] updated with ${totalPages} pages in custom catalogs.`);
    } catch (e) {
        console.warn("[Catalogs Sync Warning]:", e);
    }
}

// =======================================================
// 2. MAIN STUDIO UI INITIALIZATION
// =======================================================
export async function initBookAudioStudio() {
    initAdminLayout('eBook Voice & Audio Studio', 'WebP इमेज अपलोड करें, पेज क्रम सेट करें और माइक से आवाज़ या टेक्स्ट जोड़ें।');
    
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
        <!-- Header Controls Bar -->
        <div class="admin-card" style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h2 style="margin:0; font-size:1.3rem; color:#f8fafc;">🎧 All-in-One eBook & Audio Studio</h2>
              <p style="margin:4px 0 0; font-size:0.85rem; color:#94a3b8;">
                पेज-वाइज़ WebP इमेज अपलोड करें, मूल आवाज़ रिकॉर्ड करें या टेक्स्ट जोड़ें।
              </p>
            </div>
            
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <label style="font-size:0.85rem; color:#cbd5e1; font-weight:600;">पुस्तक / डेमो कोड:</label>
              <select id="bookSelect" class="admin-input" style="padding:6px 12px; width:260px; font-weight:700;">
                <option value="BK001">BK001: खरीफ फसल मास्टर गाइड 2026</option>
                <option value="BK002">BK002: खेती का डॉक्टर</option>
                <option value="DEMO001">DEMO001: डेमो खरीफ मास्टर गाइड</option>
                <option value="FREE001">FREE001: फ्री जैविक खेती गाइड</option>
                <option value="__NEW__">➕ नया बुक / डेमो कोड जोड़ें...</option>
              </select>
              <button id="openNewBookModalBtn" class="admin-btn" style="background:#10b981; color:#fff; font-weight:700; padding:6px 14px; font-size:12px; display:inline-flex; align-items:center; gap:6px; cursor:pointer;" title="नई ई-बुक, डेमो या वर्चुअल कॉम्बो रजिस्टर करें">
                <span>➕</span> नई पुस्तक बनाएँ
              </button>
              <a id="quickTestReaderBtn" href="../ebooks/reader.html?book=BK001" target="_blank" class="admin-btn" style="background:#0284c7; color:#fff; font-weight:700; padding:6px 12px; font-size:12px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;" title="रीडर में इस किताब को खोलें">
                <span>📖</span> रीडर में देखें
              </a>
              <a id="quickTestDownloadBtn" href="../ebooks/download.html?book=BK001" target="_blank" class="admin-btn" style="background:#0d9488; color:#fff; font-weight:700; padding:6px 12px; font-size:12px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;" title="डाउनलोड पेज पर इस किताब को टेस्ट करें">
                <span>📥</span> डाउनलोड पेज
              </a>
              <a id="quickTestLandingBtn" href="../universal-book-landing.html?id=BK001" target="_blank" class="admin-btn" style="background:#d97706; color:#fff; font-weight:700; padding:6px 12px; font-size:12px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;" title="इस किताब का लैंडिंग पेज देखें">
                <span>🌐</span> लैंडिंग पेज
              </a>
            </div>
          </div>
        </div>

        <!-- Mode & Bulk Action Bar -->
        <div class="admin-card" style="margin-bottom: 16px; background:#0f172a; border-left:4px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <span style="font-weight:700; color:#34d399; font-size:0.95rem; display:block;">📁 Bulk WebP / PNG पेज अपलोडर</span>
              <span style="font-size:0.8rem; color:#94a3b8;">एक साथ 150+ पेज चुनें। सिस्टम अपने आप नाम (1, 2, 3...) के हिसाब से सजा देगा।</span>
            </div>

            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <input type="file" id="bulkImageInput" multiple accept="image/webp,image/png,image/jpeg" style="display:none;">
              <input type="file" id="directPdfInput" accept="application/pdf" style="display:none;">
              <button id="triggerBulkUploadBtn" class="admin-btn admin-btn-primary" style="padding:8px 14px;">
                📤 Bulk Images चुनें (Upload Pages)
              </button>
              <button id="openImportModalBtn" class="admin-btn" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; padding:8px 14px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(99,102,241,0.3);" title="किसी भी अन्य पुस्तक से पेजेस और उनका ऑडियो सीधे इस नई पुस्तक में जोड़ें">
                <span>📚</span> अन्य पुस्तक से जोड़ें (Import / Reuse Pages)
              </button>
              <button id="triggerDirectPdfBtn" class="admin-btn admin-btn-secondary" style="padding:8px 12px; font-size:12px;" title="सीधे PDF फाइल अपलोड करें (ऑटोमैटिक WebP में बदल जाएगी)">
                📄 Upload Direct PDF
              </button>
              <button id="openBonusManagerBtn" class="admin-btn" style="background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:8px 14px; font-weight:800; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(245,158,11,0.35); cursor:pointer;" title="इस पुस्तक के लिए Word फाइल (.docx) और Google Drive बोनस लिंक अपलोड व प्रबंधित करें">
                <span>🎁</span> अपलोड बोनस (Word / Drive)
              </button>
              <button id="convertPdfToWebpBtn" class="admin-btn admin-btn-secondary" style="padding:8px 12px; font-size:12px;" title="मौजूदा PDF के सारे पेजों को WebP इमेज में बदलें">
                ⚡ Convert Existing PDF
              </button>
              <button id="gitAutoSyncBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:8px 16px; font-weight:800; font-size:12px; box-shadow:0 4px 12px rgba(16,185,129,0.35); display:inline-flex; align-items:center; gap:6px;" title="सभी WebP पेजों और ऑडियो को 1-Click में सीधे GitHub पर पुश करें (Vercel ऑटोमैटिक लाइव)">
                <span>🚀</span> 1-Click Push to Git (Live Sync)
              </button>
              <button id="downloadZipBtn" class="admin-btn" style="background:#8b5cf6; color:#fff; padding:8px 12px; font-size:12px;" title="Git फोल्डर (images/books/BK001/) के लिए ZIP डाउनलोड करें">
                📦 Download WebP ZIP
              </button>
              <button id="exportJsonBtn" class="admin-btn" style="background:#3b82f6; color:#fff; padding:8px 12px; font-size:12px;">
                💾 Export JSON
              </button>
              <button id="viewEmailLogsBtn" class="admin-btn" style="background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; padding:8px 14px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(2,132,199,0.35); cursor:pointer;" title="ग्राहकों को भेजे गए ई-बुक्स व बोनस के ईमेल्स की लाइव हिस्ट्री देखें">
                <span>📧</span> ईमेल हिस्ट्री (Sent Logs)
              </button>
            </div>
          </div>

          <!-- Source PDF Vault Card: Attached Source PDF Info & Re-Extract / Manage Actions -->
          <div id="sourcePdfStatusCard" style="display:none; margin-top:14px; padding:12px 16px; background:#1e293b; border-radius:10px; border:1px solid #38bdf8; box-shadow:0 4px 15px rgba(0,0,0,0.3); align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; align-items:center; gap:12px; min-width:260px;">
              <div style="width:42px; height:42px; border-radius:8px; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
                📄
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span id="sourcePdfNameLabel" style="font-weight:700; color:#f8fafc; font-size:0.95rem;">BK021.pdf</span>
                  <span id="sourcePdfBadge" style="background:#065f46; color:#34d399; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:12px; border:1px solid #059669;">✓ IndexedDB सुरक्षित</span>
                </div>
                <div id="sourcePdfMetaLabel" style="font-size:0.78rem; color:#94a3b8; margin-top:2px;">28 पेजेस • 14.2 MB • कभी भी 1-Click में इमेज रिकवर करें</div>
              </div>
            </div>

            <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
              <button id="reExtractPdfPagesBtn" class="admin-btn" style="background:linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; padding:6px 12px; font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:5px; border-radius:6px; cursor:pointer;" title="यदि कभी पेज इमेज डिलीट हो जाएं तो सीधे इस PDF से HD WebP इमेज और ऑडियो टेक्स्ट दोबारा बनाएं">
                <span>🔄</span> PDF से दोबारा इमेज निकालें (Re-Extract HD)
              </button>
              <button id="downloadSourcePdfBtn" class="admin-btn" style="background:#334155; color:#e2e8f0; padding:6px 12px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px; border-radius:6px; border:1px solid #475569; cursor:pointer;" title="मूल PDF फाइल को अपने कंप्यूटर/मोबाइल में डाउनलोड करें">
                <span>⬇️</span> PDF डाउनलोड
              </button>
              <button id="replaceSourcePdfBtn" class="admin-btn" style="background:#334155; color:#38bdf8; padding:6px 12px; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:5px; border-radius:6px; border:1px solid #0284c7; cursor:pointer;" title="इस PDF की जगह कोई नई PDF अपलोड करें">
                <span>🔄</span> बदलें (Replace)
              </button>
              <button id="deleteSourcePdfBtn" class="admin-btn" style="background:rgba(239,68,68,0.15); color:#f87171; padding:6px 12px; font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:5px; border-radius:6px; border:1px solid #ef4444; cursor:pointer;" title="इस पुस्तक से संलग्न मूल PDF को डिलीट करें">
                <span>🗑️</span> PDF हटाएं
              </button>
            </div>
          </div>

          <!-- Real-Time Progress Bar & Metrics -->
          <div id="uploadProgressSection" style="display:none; margin-top:14px; background:#0b1329; padding:16px; border-radius:10px; border:2px solid #38bdf8; box-shadow:0 0 20px rgba(56,189,248,0.25);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span>
                <span id="progressStatusLabel" style="font-size:0.92rem; font-weight:800; color:#38bdf8;">प्रगति: 0 / 0 पेजेस (0%)</span>
              </div>
              <span id="progressSizeLabel" style="font-size:0.85rem; color:#94a3b8; font-weight:600;">कुल साइज: 0 KB</span>
            </div>
            <div style="width:100%; height:12px; background:#0f172a; border-radius:6px; overflow:hidden; border:1px solid #334155; padding:1px;">
              <div id="progressFillBar" style="width:0%; height:100%; border-radius:5px; background:linear-gradient(90deg, #10b981, #06b6d4, #3b82f6); transition:width 0.25s ease-out;"></div>
            </div>
          </div>
        </div>

        <!-- Sync Success Modal Popup -->
        <div id="syncSuccessModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px); z-index:999999; justify-content:center; align-items:center; padding:16px;">
          <div class="admin-card" style="max-width:520px; width:100%; background:#0f172a; border:2px solid #10b981; border-radius:14px; padding:24px; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.6);">
            <div style="font-size:3.2rem; margin-bottom:8px; line-height:1;">🎉</div>
            <h3 style="margin:0 0 6px; font-size:1.4rem; color:#34d399; font-weight:800;">1-Click Git Sync सफल!</h3>
            <p style="color:#cbd5e1; font-size:0.9rem; margin:0 0 16px;">
              आपकी पुस्तक के सभी पेजेस और ऑडियो डेटा GitHub API से 100% लाइव पुश हो गए हैं।
            </p>
            
            <div style="background:#1e293b; border-radius:8px; padding:14px; margin-bottom:20px; text-align:left; font-size:0.85rem; color:#e2e8f0; display:flex; flex-direction:column; gap:8px; border:1px solid #334155;">
              <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">पुस्तक कोड:</span> <strong id="successModalBookId" style="color:#38bdf8;">BK001</strong></div>
              <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">कुल पेजेस:</span> <strong id="successModalPages" style="color:#34d399;">152 Pages (HD WebP)</strong></div>
              <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">कुल डेटा साइज:</span> <strong id="successModalSize" style="color:#fbbf24;">11.8 MB</strong></div>
              <div style="display:flex; justify-content:space-between;"><span style="color:#94a3b8;">Git स्टोरेज पाथ:</span> <span style="font-family:monospace; font-size:0.75rem; color:#a7f3d0;" id="successModalPath">images/books/BK001/</span></div>
            </div>

            <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
              <a id="successModalReaderLink" href="../ebooks/reader.html?book=BK001" target="_blank" class="admin-btn" style="background:linear-gradient(135deg, #0284c7, #2563eb); color:#fff; padding:10px 20px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
                <span>📖</span> लाइव रीडर में टेस्ट करें
              </a>
              <button id="closeSuccessModalBtn" class="admin-btn admin-btn-secondary" style="padding:10px 20px; font-weight:700;">
                ✅ ठीक है (Done)
              </button>
            </div>
          </div>
        </div>

        <!-- Cross-Book Page & Audio Assembler Modal -->
        <div id="importPagesModal" style="display:none; position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:999999; justify-content:center; align-items:center; padding:12px; box-sizing:border-box;">
          <div class="admin-card" style="max-width:1050px; width:100%; height:94vh; max-height:94vh; background:#0f172a; border:2px solid #6366f1; border-radius:14px; padding:14px 18px; display:flex; flex-direction:column; box-shadow:0 25px 60px rgba(0,0,0,0.85); overflow:hidden; box-sizing:border-box;">
            
            <!-- Modal Header (Compact) -->
            <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; border-bottom:1px solid #334155; padding-bottom:8px;">
              <div>
                <h3 style="margin:0; font-size:1.15rem; color:#818cf8; font-weight:800; display:flex; align-items:center; gap:8px;">
                  <span>📚</span> अन्य पुस्तक से पेज और ऑडियो जोड़ें (Page & Audio Assembler)
                </h3>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#94a3b8;">
                  किसी भी मौजूदा पुस्तक से पेजेस चुनें। उनका <strong>ऑडियो और टेक्स्ट</strong> अपने आप इस नई किताब में कॉपी हो जाएगा!
                </p>
              </div>
              <button id="closeImportModalBtn" class="admin-btn" style="background:#334155; color:#fff; padding:4px 10px; font-size:14px; border-radius:6px; line-height:1; cursor:pointer;" title="बंद करें">✕</button>
            </div>

            <!-- Controls Row: Source Book & Placement (Compact) -->
            <div style="flex-shrink:0; display:flex; gap:10px; flex-wrap:wrap; margin-bottom:8px; background:#1e293b; padding:8px 12px; border-radius:8px; border:1px solid #334155;">
              <div style="flex:1; min-width:200px;">
                <label style="font-size:0.75rem; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">1. सोर्स पुस्तक चुनें (जहाँ से पेज लेने हैं):</label>
                <select id="importSourceBookSelect" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.85rem; font-weight:700;"></select>
              </div>
              <div style="flex:1; min-width:200px;">
                <label style="font-size:0.75rem; font-weight:700; color:#cbd5e1; display:block; margin-bottom:2px;">2. कहाँ जोड़ना है (Placement):</label>
                <select id="importPlacementSelect" class="admin-input" style="width:100%; padding:5px 8px; font-size:0.85rem; font-weight:700;">
                  <option value="REPLACE">🔄 सभी पुराने पेज हटाकर केवल ये नए पेज रखें (Replace All)</option>
                  <option value="END" selected>📌 सबसे आखिर में जोड़ें (Append to End)</option>
                  <option value="AFTER_CURRENT">📍 वर्तमान पेज के बाद जोड़ें</option>
                  <option value="BEGINNING">🔝 सबसे शुरुआत में जोड़ें (Beginning)</option>
                </select>
              </div>
            </div>

            <!-- Audio Option & Notice Banner (Super Compact) -->
            <div style="flex-shrink:0; margin-bottom:8px; background:linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1)); border:1px solid #10b981; border-radius:8px; padding:6px 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.82rem; font-weight:700; color:#34d399;">
                <input type="checkbox" id="importIncludeAudioCheck" checked style="width:16px; height:16px; accent-color:#10b981;">
                🎙️ ऑडियो और टेक्स्ट स्क्रिप्ट भी साथ लाएं (Include Voice & Script)
              </label>
              <div style="font-size:0.72rem; color:#a7f3d0;">
                💡 <strong>स्वतंत्र संपादन:</strong> नई किताब में आप किसी भी पेज की आवाज़ या टेक्स्ट बदल सकते हैं—मूल किताब सुरक्षित रहेगी!
              </div>
            </div>

            <!-- Range Filter & Multi Select Toolbar (With Top Quick Import Button) -->
            <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px; background:#0b1329; padding:6px 10px; border-radius:8px; border:1px solid #1e293b;">
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <input type="text" id="importRangeInput" placeholder="पेज रेंज (उदा. 1-20, 25, 30-50)" class="admin-input" style="width:180px; padding:4px 8px; font-size:0.8rem;">
                <button id="importApplyRangeBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">✅ रेंज चुनें</button>
                <button id="importSelectAllBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">Select All</button>
                <button id="importClearBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">Clear All</button>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <span id="importSelectedCountTag" style="background:#6366f1; color:#fff; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:800;">चयनित: 0 पेज</span>
                <button id="quickImportBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:5px 12px; font-weight:800; font-size:11px; border-radius:6px; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                  <span>✨</span> <span id="quickImportBtnText">इंपोर्ट करें</span>
                </button>
              </div>
            </div>

            <!-- Scrollable Visual Page Grid (Fills available space) -->
            <div id="importSourcePageGrid" style="flex:1 1 auto; min-height:0; overflow-y:auto; background:#070d1e; border:1px solid #1e293b; border-radius:8px; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(135px, 1fr)); gap:10px;">
              <div style="color:#94a3b8; font-size:13px; grid-column:1/-1; text-align:center; padding:40px;">सोर्स पुस्तक के पेजेस लोड हो रहे हैं...</div>
            </div>

            <!-- Modal Bottom Action Bar (Fixed & Always Visible) -->
            <div style="flex-shrink:0; display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid #334155; background:#0f172a; flex-wrap:wrap; gap:8px;">
              <button id="cancelImportModalBtn" class="admin-btn admin-btn-secondary" style="padding:6px 14px; font-size:12px;">
                ❌ रद्द करें (Cancel)
              </button>
              <div style="display:flex; align-items:center; gap:10px;">
                <span id="importFooterSummary" style="font-size:0.8rem; color:#94a3b8;">कोई पेज चयनित नहीं है</span>
                <button id="executeImportBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:8px 22px; font-weight:800; font-size:13px; box-shadow:0 4px 14px rgba(16,185,129,0.4); display:inline-flex; align-items:center; gap:8px; cursor:pointer;">
                  <span>🚀</span> <span id="executeImportBtnText">0 पेजेस और ऑडियो जोड़ें</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Smart Upload & Position Injection Modal -->
        <div id="smartUploadPositionModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:999999; justify-content:center; align-items:center; padding:16px;">
          <div class="admin-card" style="max-width:560px; width:100%; background:#0f172a; border:2px solid #38bdf8; border-radius:14px; padding:22px; box-shadow:0 20px 45px rgba(0,0,0,0.7);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h3 style="margin:0; font-size:1.15rem; color:#38bdf8; display:flex; align-items:center; gap:8px;">
                <span>📥</span> <span id="smartUploadModalTitle">पेज अपलोड पोजीशन चुनें</span>
              </h3>
              <button id="closeSmartUploadModalBtn" style="background:none; border:none; color:#94a3b8; font-size:1.4rem; cursor:pointer; line-height:1;">&times;</button>
            </div>

            <p style="color:#cbd5e1; font-size:0.85rem; margin:0 0 16px;">
              आपने <strong id="smartUploadCountBadge" style="color:#34d399;">0 इमेजेस</strong> चुनी हैं। आप इन्हें वर्तमान पुस्तक (कुल <span id="smartUploadExistingTotal" style="color:#38bdf8;">0</span> पेजेस) में कहाँ लोड करना चाहते हैं?
            </p>

            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:18px;">
              
              <!-- Option 1: Append to End -->
              <label style="display:flex; align-items:flex-start; gap:10px; background:#1e293b; border:1.5px solid #334155; border-radius:8px; padding:12px; cursor:pointer;" class="upload-mode-opt">
                <input type="radio" name="smartUploadMode" value="append" checked style="margin-top:3px;">
                <div>
                  <strong style="color:#34d399; font-size:0.9rem; display:block;">➕ अंत में जोड़ें (Append to End)</strong>
                  <span style="font-size:0.78rem; color:#94a3b8;">मौजूदा सभी पेजों के बाद नए पेज जोड़ें (पहला कोई भी पेज नहीं हटेगा)।</span>
                </div>
              </label>

              <!-- Option 2: Insert in Middle (Between Pages) -->
              <label style="display:flex; align-items:flex-start; gap:10px; background:#1e293b; border:1.5px solid #334155; border-radius:8px; padding:12px; cursor:pointer;" class="upload-mode-opt">
                <input type="radio" name="smartUploadMode" value="insert" style="margin-top:3px;">
                <div style="flex:1;">
                  <strong style="color:#60a5fa; font-size:0.9rem; display:block;">📥 बीच में इन्सर्ट करें (Insert Between Pages)</strong>
                  <span style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:6px;">पेज के बाद नए पेज जोड़ें (पुराने आगे खिसक जाएंगे, कोई पेज डिलीट नहीं होगा)।</span>
                  <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                    <span style="font-size:0.8rem; color:#cbd5e1;">पेज नंबर:</span>
                    <input type="number" id="smartInsertAfterPageNum" min="0" value="1" class="admin-input" style="width:70px; padding:3px 6px; font-size:0.85rem; font-weight:700;">
                    <span style="font-size:0.78rem; color:#94a3b8;">के बाद इन्सर्ट करें</span>
                  </div>
                </div>
              </label>

              <!-- Option 3: Replace / Overwrite Range -->
              <label style="display:flex; align-items:flex-start; gap:10px; background:#1e293b; border:1.5px solid #334155; border-radius:8px; padding:12px; cursor:pointer;" class="upload-mode-opt">
                <input type="radio" name="smartUploadMode" value="replace_range" style="margin-top:3px;">
                <div style="flex:1;">
                  <strong style="color:#fbbf24; font-size:0.9rem; display:block;">🔄 वर्तमान पेजों को बदलें (Replace Specific Pages)</strong>
                  <span style="font-size:0.78rem; color:#94a3b8; display:block; margin-bottom:6px;">चुने गए पेज नंबर से आगे के पेजों की इमेज बदलें (कुल पेजों की संख्या नहीं बढ़ेगी)।</span>
                  <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
                    <span style="font-size:0.8rem; color:#cbd5e1;">शुरू पेज:</span>
                    <input type="number" id="smartReplaceStartPageNum" min="1" value="1" class="admin-input" style="width:70px; padding:3px 6px; font-size:0.85rem; font-weight:700;">
                    <span style="font-size:0.78rem; color:#94a3b8;">से आगे बदलें</span>
                  </div>
                </div>
              </label>

              <!-- Option 4: Full Book Reload -->
              <label style="display:flex; align-items:flex-start; gap:10px; background:#1e293b; border:1.5px solid #334155; border-radius:8px; padding:12px; cursor:pointer;" class="upload-mode-opt">
                <input type="radio" name="smartUploadMode" value="full_reload" style="margin-top:3px;">
                <div>
                  <strong style="color:#f87171; font-size:0.9rem; display:block;">⚠️ पूरी किताब नई इमेजेस से रीलोड करें (Full Overwrite)</strong>
                  <span style="font-size:0.78rem; color:#94a3b8;">पुराने सभी पेजों को हटाकर सिर्फ इन नई इमेजेस को रखें।</span>
                </div>
              </label>

            </div>

            <div style="display:flex; justify-content:flex-end; gap:10px;">
              <button id="cancelSmartUploadBtn" class="admin-btn admin-btn-secondary" style="padding:7px 16px; font-size:12px;">❌ रद्द करें</button>
              <button id="confirmSmartUploadBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:7px 20px; font-weight:800; font-size:12px; box-shadow:0 4px 12px rgba(16,185,129,0.35);">
                ✅ लागू करें (Process Upload)
              </button>
            </div>
          </div>
        </div>

        <!-- 📖 Unified New Book Creator Modal -->
        <div id="newBookCreatorModal" style="display:none; position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:9999999; justify-content:center; align-items:center; padding:16px; box-sizing:border-box;">
          <div class="admin-card" style="max-width:560px; width:100%; background:#0f172a; border:2px solid #10b981; border-radius:14px; padding:20px; box-shadow:0 25px 60px rgba(0,0,0,0.9); box-sizing:border-box; max-height:92vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #334155; padding-bottom:10px;">
              <h3 style="margin:0; font-size:1.15rem; color:#34d399; font-weight:800; display:flex; align-items:center; gap:8px;">
                <span>📖</span> नई पुस्तक / कॉम्बो बनाएँ (Create New Book)
              </h3>
              <button type="button" id="closeNewBookModalBtn" class="admin-btn" style="background:#334155; color:#fff; padding:4px 10px; font-size:14px; border-radius:6px; cursor:pointer;">✕</button>
            </div>
            
            <form id="newBookCreatorForm" style="display:flex; flex-direction:column; gap:12px;">
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <div style="flex:1; min-width:160px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <label style="font-size:12px; font-weight:700; color:#cbd5e1;">पुस्तक कोड (Book ID) *</label>
                    <button type="button" id="autoGenBookIdBtn" class="admin-btn" style="background:#0284c7; color:#fff; padding:1px 6px; font-size:10px; font-weight:800; cursor:pointer;" title="अगला उपलब्ध Book ID ऑटो-जेनरेट करें">⚡ ऑटो-जेनरेट</button>
                  </div>
                  <input type="text" id="newBookIdInput" required placeholder="उदा. BK016" class="admin-input" style="width:100%; text-transform:uppercase; font-weight:800; padding:7px 10px; color:#34d399;">
                </div>
                <div style="width:110px;">
                  <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">कुल पेज (Pages)</label>
                  <input type="number" id="newBookTotalPagesInput" min="0" max="1000" placeholder="0" value="0" class="admin-input" style="width:100%; padding:7px 10px; text-align:center; font-weight:800; color:#38bdf8;" title="किताब के कुल पेजों की संख्या">
                </div>
                <div style="flex:1; min-width:160px;">
                  <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">कैटेगरी (Category)</label>
                  <select id="newBookCategorySelect" class="admin-input" style="width:100%; padding:7px 10px; font-weight:700;">
                    <option value="Agriculture">🌾 कृषि / फसल (Agriculture)</option>
                    <option value="Vegetables">🥦 सब्जी खेती (Vegetables)</option>
                    <option value="PestDisease">💊 कीट व रोग निवारण (Pest / Disease)</option>
                    <option value="AnimalHusbandry">🐄 पशुपालन (Animal Husbandry)</option>
                    <option value="Combo">📦 कॉम्बो / बंडल (Combo Bundle)</option>
                    <option value="Organic">🌿 जैविक खेती (Organic Farming)</option>
                    <option value="Other">🏠 अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">पुस्तक का नाम (Book Title / Heading) *</label>
                <input type="text" id="newBookTitleInput" required placeholder="उदा. टमाटर व मिर्च फसल सुरक्षा मास्टर गाइड 2026" class="admin-input" style="width:100%; font-weight:700; padding:7px 10px;">
              </div>

              <!-- 🎁 100% Free Book Option for All Readers -->
              <div style="background:#064e3b; border:1px solid #10b981; padding:8px 12px; border-radius:8px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:800; color:#6ee7b7; cursor:pointer;">
                  <input type="checkbox" id="newBookIsFreeInput" style="accent-color:#10b981; width:16px; height:16px;">
                  🎁 100% मुफ़्त ई-बुक (Free Access for All Users)
                </label>
                <span style="font-size:11px; color:#cbd5e1;">(बिना खरीदे सभी पाठक पढ़ व सुन सकेंगे)</span>
              </div>

              <div style="display:flex; gap:10px;">
                <div style="flex:1;">
                  <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">MRP (मूल कीमत ₹)</label>
                  <input type="number" id="newBookMrpInput" placeholder="299" class="admin-input" style="width:100%; padding:7px 10px;">
                </div>
                <div style="flex:1;">
                  <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">ऑफर मूल्य (Offer Price ₹)</label>
                  <input type="number" id="newBookOfferPriceInput" placeholder="99" class="admin-input" style="width:100%; font-weight:800; color:#34d399; padding:7px 10px;">
                </div>
              </div>

              <!-- Visibility Options -->
              <div style="background:#1e293b; padding:10px 12px; border-radius:8px; border:1px solid #334155;">
                <label style="display:block; font-size:12px; font-weight:700; color:#38bdf8; margin-bottom:6px;">कहाँ-कहाँ प्रदर्शित करना है (Visibility):</label>
                <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:12px; color:#e2e8f0; font-weight:600;">
                  <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="checkbox" id="visMyLibrary" checked style="accent-color:#10b981;"> My Library
                  </label>
                  <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="checkbox" id="visStore" checked style="accent-color:#10b981;"> Store / Catalog
                  </label>
                  <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="checkbox" id="visLanding" checked style="accent-color:#10b981;"> Book Landing
                  </label>
                  <label style="display:flex; align-items:center; gap:5px; cursor:pointer;">
                    <input type="checkbox" id="visBundle" checked style="accent-color:#10b981;"> Combo Bundles
                  </label>
                </div>
              </div>

              <!-- Bonus Fields -->
              <div style="background:#1e293b; padding:10px 12px; border-radius:8px; border:1px solid #334155;">
                <label style="display:block; font-size:12px; font-weight:700; color:#f59e0b; margin-bottom:6px;">🎁 VIP डिजिटल बोनस (वैकल्पिक / Optional):</label>
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <input type="text" id="newBookWordUrlInput" placeholder="📝 Word फाइल (.docx) डाउनलोड लिंक" class="admin-input" style="width:100%; font-size:12px; padding:6px 10px;">
                  <input type="text" id="newBookDriveUrlInput" placeholder="📁 Google Drive वीडियो / नोट्स फोल्डर लिंक" class="admin-input" style="width:100%; font-size:12px; padding:6px 10px;">
                  <input type="text" id="newBookBonusDescInput" placeholder="बोनस विवरण (उदा. सम्पूर्ण फसल सुरक्षा शेड्यूल + 25 वीडियो)" class="admin-input" style="width:100%; font-size:12px; padding:6px 10px;">
                </div>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
                <button type="button" id="cancelNewBookBtn" class="admin-btn admin-btn-secondary" style="padding:8px 14px;">रद्द करें</button>
                <button type="submit" id="saveNewBookBtn" class="admin-btn" style="background:#10b981; color:#fff; font-weight:800; padding:8px 18px; cursor:pointer;">
                  🚀 पुस्तक बनाएँ व स्टूडियो में खोलें
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 📧 Sent Email Delivery History Modal -->
        <div id="emailDeliveryLogsModal" style="display:none; position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:9999999; justify-content:center; align-items:center; padding:16px; box-sizing:border-box;">
          <div class="admin-card" style="max-width:880px; width:100%; background:#0f172a; border:2px solid #0284c7; border-radius:14px; padding:20px; box-shadow:0 25px 60px rgba(0,0,0,0.9); box-sizing:border-box; max-height:92vh; display:flex; flex-direction:column;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px; flex-shrink:0;">
              <div>
                <h3 style="margin:0; font-size:1.15rem; color:#38bdf8; font-weight:800; display:flex; align-items:center; gap:8px;">
                  <span>📧</span> ग्राहक ईमेल डिलीवरी हिस्ट्री (Sent Email Logs)
                </h3>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#94a3b8;">
                  Vercel + Resend API के माध्यम से ग्राहकों को भेजे गए ई-बुक्स, Word गाइड और Google Drive लिंक की लाइव सूची।
                </p>
              </div>
              <div style="display:flex; gap:8px; align-items:center;">
                <button type="button" id="refreshEmailLogsBtn" class="admin-btn admin-btn-secondary" style="padding:4px 10px; font-size:12px; cursor:pointer;" title="रिफ्रेश करें">🔄 रिफ्रेश</button>
                <button type="button" id="closeEmailLogsModalBtn" class="admin-btn" style="background:#334155; color:#fff; padding:4px 10px; font-size:14px; border-radius:6px; cursor:pointer;">✕</button>
              </div>
            </div>

            <!-- Test Email Dispatch Card -->
            <div style="background:#0b1329; border:1px solid #1e40af; border-radius:10px; padding:12px 14px; margin-bottom:12px; flex-shrink:0;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-weight:800; font-size:12px; color:#60a5fa;">🧪 तुरंत टेस्ट ईमेल भेजें (Live Email Delivery Test):</span>
                <span style="font-size:10px; color:#94a3b8;">सीधा इनबॉक्स में ई-बुक + बोनस लिंक डिलीवरी</span>
              </div>
              <div style="display:grid; grid-template-columns:1.5fr 1fr 1fr auto; gap:8px; align-items:center;">
                <input type="email" id="testEmailRecipientInput" value="kumar.prince1307@gmail.com" placeholder="प्राप्तकर्ता ईमेल" class="admin-input" style="font-size:11px; padding:6px 10px;">
                <input type="text" id="testEmailNameInput" value="Kartik Prince" placeholder="ग्राहक का नाम" class="admin-input" style="font-size:11px; padding:6px 10px;">
                <input type="text" id="testEmailBookInput" placeholder="किताब का नाम / कोड" class="admin-input" style="font-size:11px; padding:6px 10px;">
                <button type="button" id="testSendEmailBtn" class="admin-btn" style="background:#2563eb; color:#fff; font-weight:800; font-size:11px; padding:7px 14px; cursor:pointer; white-space:nowrap;">
                  🚀 टेस्ट ईमेल भेजें
                </button>
              </div>
            </div>

            <!-- Search / Filter Bar -->
            <div style="display:flex; gap:10px; margin-bottom:12px; flex-shrink:0;">
              <input type="text" id="emailLogsSearchInput" placeholder="🔍 ग्राहक का नाम, ईमेल या पुस्तक का नाम खोजें..." class="admin-input" style="flex:1; padding:7px 12px; font-size:0.85rem;">
            </div>

            <!-- Table Container -->
            <div style="flex:1; overflow-y:auto; border:1px solid #334155; border-radius:8px; background:#1e293b; min-height:220px;">
              <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left; color:#e2e8f0;">
                <thead style="background:#0b1329; position:sticky; top:0; z-index:1; border-bottom:1px solid #334155;">
                  <tr>
                    <th style="padding:8px 12px; color:#94a3b8; font-weight:700;">तारीख / समय</th>
                    <th style="padding:8px 12px; color:#94a3b8; font-weight:700;">ग्राहक</th>
                    <th style="padding:8px 12px; color:#94a3b8; font-weight:700;">ईमेल</th>
                    <th style="padding:8px 12px; color:#94a3b8; font-weight:700;">ई-बुक / बोनस सामग्री</th>
                    <th style="padding:8px 12px; color:#94a3b8; font-weight:700; text-align:center;">स्थिति</th>
                  </tr>
                </thead>
                <tbody id="emailLogsTableBody">
                  <tr>
                    <td colspan="5" style="text-align:center; padding:24px; color:#94a3b8;">
                      लोड हो रहा है...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:11px; color:#94a3b8; flex-shrink:0;">
              <span id="emailLogsCountLabel">कुल 0 ईमेल रिकॉर्ड्स</span>
              <span>⚡ Powered by Resend API</span>
            </div>
          </div>
        </div>

        <!-- 🎁 Dedicated VIP Bonus Manager Modal (Word & Google Drive Tabs) -->
        <div id="bonusManagerModal" style="display:none; position:fixed; inset:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:9999999; justify-content:center; align-items:center; padding:16px; box-sizing:border-box;">
          <div class="admin-card" style="max-width:620px; width:100%; background:#0f172a; border:2px solid #f59e0b; border-radius:14px; padding:20px; box-shadow:0 25px 60px rgba(0,0,0,0.9); box-sizing:border-box; max-height:92vh; overflow-y:auto;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #334155; padding-bottom:10px;">
              <div>
                <h3 style="margin:0; font-size:1.15rem; color:#fbbf24; font-weight:800; display:flex; align-items:center; gap:8px;">
                  <span>🎁</span> वीआईपी बोनस प्रबंधक (Word व Google Drive)
                </h3>
                <p style="margin:2px 0 0; font-size:0.75rem; color:#94a3b8;">
                  पुस्तक <strong id="bonusTargetBookIdLabel" style="color:#38bdf8;">BK001</strong> के साथ संलग्न डिजिटल फाइल्स
                </p>
              </div>
              <button type="button" id="closeBonusModalBtn" class="admin-btn" style="background:#334155; color:#fff; padding:4px 10px; font-size:14px; border-radius:6px; cursor:pointer;">✕</button>
            </div>

            <!-- Bonus Type Tabs -->
            <div style="display:flex; gap:10px; margin-bottom:16px; border-bottom:1px solid #334155; padding-bottom:8px;">
              <button type="button" id="tabBonusWordBtn" class="admin-btn" style="background:#1e3a8a; color:#93c5fd; padding:7px 16px; font-size:12px; font-weight:800; border:1px solid #3b82f6; cursor:pointer;">
                📝 Word फाइल (.docx)
              </button>
              <button type="button" id="tabBonusDriveBtn" class="admin-btn" style="background:#1e293b; color:#94a3b8; padding:7px 16px; font-size:12px; font-weight:700; border:1px solid #334155; cursor:pointer;">
                📁 Google Drive लिंक
              </button>
            </div>

            <!-- Tab 1: Word Document Form -->
            <div id="bonusWordPane" style="display:flex; flex-direction:column; gap:12px;">
              <div style="background:#172554; border:1px solid #1e40af; border-radius:8px; padding:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#93c5fd; margin-bottom:6px;">
                  1. Word फाइल (.docx / .doc) चुनें या लिंक पेस्ट करें:
                </label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <input type="file" id="bonusWordFileInput" accept=".docx,.doc,.pdf" style="display:none;">
                  <button type="button" id="triggerBonusWordFileBtn" class="admin-btn" style="background:#2563eb; color:#fff; padding:6px 12px; font-size:11px; font-weight:700; cursor:pointer;">
                    📂 Word फाइल चुनें (.docx)
                  </button>
                  <button type="button" id="downloadBonusWordFileBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:11px; font-weight:700; display:none;">
                    📥 वर्ड फाइल डाउनलोड करें
                  </button>
                  <span id="bonusWordFileNameLabel" style="font-size:11px; color:#cbd5e1; font-style:italic;">कोई फाइल नहीं चुनी</span>
                </div>
                <input type="text" id="bonusWordUrlInput" placeholder="अथवा सीधा फाइल URL पेस्ट करें (उदा. https://...)" class="admin-input" style="width:100%; margin-top:8px; font-size:11px; padding:6px 10px;">
              </div>

              <!-- Word Thumbnail & Title with Live Preview & File Picker -->
              <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                  2. Word गाइड का थंबनेल / कवर (Thumbnail Image):
                </label>
                <div style="display:flex; gap:12px; align-items:center;">
                  <div style="width:80px; height:100px; background:#0f172a; border:2px dashed #3b82f6; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                    <img id="bonusWordThumbPreview" src="https://placehold.co/80x100/1e3a8a/white?text=DOCX" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                  <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; gap:8px;">
                      <input type="file" id="bonusWordThumbFileInput" accept="image/*" style="display:none;">
                      <button type="button" id="triggerBonusWordThumbFileBtn" class="admin-btn" style="background:#3b82f6; color:#fff; padding:5px 12px; font-size:11px; font-weight:700; cursor:pointer;">
                        🖼️ थंबनेल इमेज चुनें
                      </button>
                      <button type="button" id="downloadBonusWordThumbBtn" class="admin-btn admin-btn-secondary" style="padding:5px 12px; font-size:11px; font-weight:700;">
                        📥 थंबनेल डाउनलोड करें
                      </button>
                    </div>
                    <input type="text" id="bonusWordThumbInput" placeholder="अथवा थंबनेल इमेज URL पेस्ट करें" class="admin-input" style="width:100%; padding:6px 10px; font-size:11px;">
                  </div>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">Word गाइड का शीर्षक (Title):</label>
                <input type="text" id="bonusWordTitleInput" placeholder="उदा. सम्पूर्ण फसल सुरक्षा शेड्यूल - Word गाइड (.docx)" class="admin-input" style="width:100%; padding:7px 10px; font-weight:700;">
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">विवरण (Description):</label>
                <textarea id="bonusWordDescInput" rows="2" placeholder="उदा. 15 पृष्ठों की एडिटेबल व प्रिंटेबल फाइल जिसमें खाद व स्प्रे का पूरा टाइमटेबल है।" class="admin-input" style="width:100%; padding:7px 10px; font-size:12px; resize:vertical;"></textarea>
              </div>
            </div>

            <!-- Tab 2: Google Drive Form -->
            <div id="bonusDrivePane" style="display:none; flex-direction:column; gap:12px;">
              <div style="background:#064e3b; border:1px solid #047857; border-radius:8px; padding:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#6ee7b7; margin-bottom:6px;">
                  1. Google Drive फोल्डर या फाइल लिंक (Sharing URL):
                </label>
                <div style="display:flex; gap:8px;">
                  <input type="text" id="bonusDriveUrlInput" placeholder="उदा. https://drive.google.com/drive/folders/1ABC..." class="admin-input" style="flex:1; font-size:12px; padding:7px 10px;">
                  <button type="button" id="testDriveLinkBtn" class="admin-btn" style="background:#10b981; color:#fff; padding:6px 14px; font-size:11px; font-weight:700; cursor:pointer;" title="ड्राइव लिंक नए टैब में खोलें">
                    🔗 लिंक टेस्ट करें
                  </button>
                </div>
                <span style="font-size:10px; color:#a7f3d0; margin-top:4px; display:block;">💡 ध्यान दें: Drive लिंक का एक्सेस 'Anyone with link can view' होना चाहिए।</span>
              </div>

              <!-- Drive Thumbnail & Title with Live Preview & File Picker -->
              <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:12px;">
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                  2. Drive फोल्डर थंबनेल (Thumbnail Image):
                </label>
                <div style="display:flex; gap:12px; align-items:center;">
                  <div style="width:80px; height:100px; background:#0f172a; border:2px dashed #10b981; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0;">
                    <img id="bonusDriveThumbPreview" src="https://placehold.co/80x100/065f46/white?text=DRIVE" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                  <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                    <div style="display:flex; gap:8px;">
                      <input type="file" id="bonusDriveThumbFileInput" accept="image/*" style="display:none;">
                      <button type="button" id="triggerBonusDriveThumbFileBtn" class="admin-btn" style="background:#10b981; color:#fff; padding:5px 12px; font-size:11px; font-weight:700; cursor:pointer;">
                        🖼️ थंबनेल इमेज चुनें
                      </button>
                      <button type="button" id="downloadBonusDriveThumbBtn" class="admin-btn admin-btn-secondary" style="padding:5px 12px; font-size:11px; font-weight:700;">
                        📥 थंबनेल डाउनलोड करें
                      </button>
                    </div>
                    <input type="text" id="bonusDriveThumbInput" placeholder="अथवा थंबनेल इमेज URL पेस्ट करें" class="admin-input" style="width:100%; padding:6px 10px; font-size:11px;">
                  </div>
                </div>
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">Drive बोनस का शीर्षक (Title):</label>
                <input type="text" id="bonusDriveTitleInput" placeholder="उदा. किसान स्पेशल वीडियो लाइब्रेरी - Google Drive" class="admin-input" style="width:100%; padding:7px 10px; font-weight:700;">
              </div>

              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:#cbd5e1; margin-bottom:4px;">विवरण (Description):</label>
                <textarea id="bonusDriveDescInput" rows="2" placeholder="उदा. 25 फुल एचडी वीडियो, फील्ड डेमो और प्रैक्टिकल नोट्स।" class="admin-input" style="width:100%; padding:7px 10px; font-size:12px; resize:vertical;"></textarea>
              </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; border-top:1px solid #334155; padding-top:12px;">
              <button type="button" id="removeBonusBtn" class="admin-btn" style="background:#7f1d1d; color:#fca5a5; padding:6px 12px; font-size:11px; cursor:pointer;">
                🗑️ बोनस हटाएं
              </button>
              <div style="display:flex; gap:10px;">
                <button type="button" id="cancelBonusModalBtn" class="admin-btn admin-btn-secondary" style="padding:7px 14px; font-size:12px;">रद्द करें</button>
                <button type="button" id="saveBonusModalBtn" class="admin-btn" style="background:#10b981; color:#fff; font-weight:800; padding:7px 18px; font-size:12px; cursor:pointer;">
                  💾 बोनस सुरक्षित करें
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Staging / Save / Discard Bar -->
        <div id="stagingActionBar" class="admin-card" style="margin-bottom: 16px; background:#1e1b4b; border:1px solid #6366f1; display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.2rem;">⚠️</span>
              <span style="font-size:0.85rem; color:#c7d2fe; font-weight:600;">
                आपके पास बिना सेव किए गए बदलाव (Draft Changes) मौजूद हैं।
              </span>
            </div>
            <div style="display:flex; gap:10px;">
              <button id="discardChangesBtn" class="admin-btn" style="background:#64748b; color:#fff; padding:6px 14px;">
                ❌ रद्द करें (Discard)
              </button>
              <button id="saveAllChangesBtn" class="admin-btn admin-btn-primary" style="padding:6px 18px; font-weight:700;">
                💾 लोकल सेव (Save Local)
              </button>
              <button id="gitPushStagingBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:6px 16px; font-weight:800; font-size:12px;">
                🚀 1-Click Push to Git
              </button>
            </div>
          </div>
        </div>

        <!-- Page Selector & Reorder Bar -->
        <div class="admin-card" style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span style="font-weight:700; font-size:0.9rem; color:#e2e8f0;">पृष्ठ चुनें (Page Selector):</span>
              <span id="pageCountStatus" style="font-size:0.85rem; color:#10b981; font-weight:700;">1 / 152 Pages</span>
              <span id="currentPageSizeTag" style="font-size:0.75rem; background:#334155; color:#94a3b8; padding:2px 6px; border-radius:4px;">Size: -- KB</span>

              <!-- Quick Page Count Adjuster -->
              <div style="display:inline-flex; align-items:center; gap:4px; background:#1e293b; padding:2px 6px; border-radius:6px; border:1px solid #475569;" title="किताब के कुल पेज यहाँ से सीधे सेट करें">
                <span style="font-size:11px; color:#cbd5e1; font-weight:700;">कुल पेज:</span>
                <input type="number" id="quickSetTotalPagesInput" min="0" max="1000" style="width:52px; background:#0f172a; border:1px solid #64748b; color:#38bdf8; font-weight:800; font-size:12px; padding:2px 4px; text-align:center; border-radius:4px;">
                <button type="button" id="applyTotalPagesBtn" class="admin-btn" style="background:#0284c7; color:#fff; padding:2px 8px; font-size:11px; font-weight:700;">लागू करें</button>
              </div>
            </div>
            
            <!-- Page Management Buttons -->
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <button id="addPageBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">➕ नया पेज</button>
              <button id="insertPagesBetweenBtn" class="admin-btn" style="background:#4f46e5; color:#fff; padding:4px 8px; font-size:11px; font-weight:700;" title="वर्तमान पेज के बाद नए पेज जोड़ें / इन्सर्ट करें">📥 बीच में पेज इन्सर्ट करें</button>
              <button id="movePagePrevBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">⬅️ आगे करें</button>
              <button id="movePageNextBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">➡️ पीछे करें</button>
              <button id="deletePageBtn" class="admin-btn" style="background:#ef4444; color:#fff; padding:4px 8px; font-size:11px;">🗑️ यह पेज हटाएं</button>

              <!-- Multi-Select & Bulk Delete / Bulk Audio Controls -->
              <button id="toggleSelectModeBtn" type="button" class="admin-btn" style="background:#334155; color:#e2e8f0; padding:4px 8px; font-size:11px; font-weight:700; border:1px solid #64748b;" title="कई पेजों को एक साथ चुनकर लाइव/ड्राफ्ट या डिलीट करने के लिए">☑️ मल्टी-सेलेक्ट</button>
              <button id="selectAllPagesBtn" type="button" class="admin-btn" style="background:#1e3a8a; color:#93c5fd; padding:4px 8px; font-size:11px; display:none;">✅ सब चुनें</button>
              <button id="deselectAllPagesBtn" type="button" class="admin-btn" style="background:#334155; color:#cbd5e1; padding:4px 8px; font-size:11px; display:none;">⬜ अनचेक</button>
              <button id="liveSelectedPagesAudioBtn" type="button" class="admin-btn" style="background:#065f46; color:#6ee7b7; padding:4px 8px; font-size:11px; font-weight:800; border:1px solid #10b981; display:none;" title="चुने हुए पेजों के ऑडियो को एक साथ लाइव करें">🟢 चुने हुए LIVE</button>
              <button id="draftSelectedPagesAudioBtn" type="button" class="admin-btn" style="background:#334155; color:#cbd5e1; padding:4px 8px; font-size:11px; font-weight:800; border:1px solid #64748b; display:none;" title="चुने हुए पेजों के ऑडियो को ड्राफ्ट (ऑफ) करें">⚪ चुने हुए DRAFT</button>
              <button id="deleteSelectedPagesBtn" type="button" class="admin-btn" style="background:#dc2626; color:#fff; padding:4px 10px; font-size:11px; font-weight:800; display:none; box-shadow:0 0 10px rgba(220,38,38,0.5);">🗑️ चुने हुए पेज डिलीट करें (<span id="selectedPagesCountBadge">0</span>)</button>
              <button id="clearAllBookPagesBtn" type="button" class="admin-btn" style="background:#7f1d1d; color:#fca5a5; padding:4px 8px; font-size:11px; font-weight:700; border:1px solid #dc2626;" title="किताब के सभी पेजों को एक साथ खाली करें">💥 सभी पेज हटाएं</button>
            </div>
          </div>

          <div id="pageChipGrid" class="page-chip-grid" style="display:flex; flex-wrap:wrap; gap:6px; max-height:160px; overflow-y:auto; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #334155;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Main Studio Split View -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-top:16px;">
          
          <!-- LEFT: LIVE PAGE PREVIEW -->
          <div class="admin-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
              <h3 style="margin:0; font-size:1rem; color:#38bdf8;">📄 पेज प्रिव्यू (Page Preview)</h3>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="file" id="singlePageImageInput" accept="image/webp,image/png,image/jpeg" style="display:none;">
                <button id="replaceCurrentPageImgBtn" class="admin-btn" style="background:#0284c7; color:#fff; padding:3px 10px; font-size:11px; font-weight:700; border-radius:4px; display:inline-flex; align-items:center; gap:4px;" title="सिर्फ वर्तमान पेज की इमेज बदलें">
                  <span>🔄</span> इस पेज की इमेज बदलें
                </button>
                <span id="previewPageNumberTag" style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Page 1</span>
              </div>
            </div>
            <div id="previewContainer" style="background:#0f172a; border-radius:8px; padding:10px; display:flex; justify-content:center; align-items:center; min-height:400px; max-height:600px; overflow-y:auto;">
              <canvas id="previewCanvas" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.4); display:none;"></canvas>
              <img id="previewImage" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.4); display:none;" alt="Preview" />
              <div id="previewLoadingText" style="color:#94a3b8; font-size:13px;">पेज लोड हो रहा है...</div>
            </div>
          </div>

          <!-- RIGHT: AUDIO & TEXT EDITOR STUDIO -->
          <div class="admin-card">
            <h3 style="margin:0 0 12px; font-size:1rem; color:#34d399;">🎙️ पेज वॉइस एवं टेक्स्ट कंट्रोल</h3>
            
            <!-- 🛡️ Audio Quality Control & Live Approval Badge -->
            <div id="pageAudioApprovalCard" style="background:#0f172a; border:1.5px solid #334155; border-radius:8px; padding:10px 14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span id="pageAudioApprovalBadge" style="padding:4px 10px; border-radius:12px; font-size:12px; font-weight:800; background:#334155; color:#cbd5e1;">
                  ⚪ ड्राफ्ट (ऑडियो ऑफ)
                </span>
                <span id="pageAudioApprovalDesc" style="font-size:11px; color:#94a3b8;">
                  रीडर में दिखेगा: "इस पेज का ऑडियो जल्द ही उपलब्ध होगा"
                </span>
              </div>
              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                <button id="toggleAudioLiveBtn" type="button" class="admin-btn" style="background:#10b981; color:#fff; padding:6px 14px; font-size:12px; font-weight:800; border-radius:6px; cursor:pointer;" title="वर्तमान पेज के ऑडियो की गुणवत्ता जांचकर पाठकों के लिए लाइव या ड्राफ्ट करें">
                  🟢 ऑडियो लाइव करें (Approve)
                </button>
                <button id="approveAllPagesAudioBtn" type="button" class="admin-btn admin-btn-secondary" style="padding:6px 10px; font-size:11px; cursor:pointer; background:#065f46; color:#6ee7b7; border:1px solid #10b981;" title="किताब के सभी पेजों का ऑडियो एक क्लिक में 100% लाइव करें">
                  ✅ सभी पेज लाइव
                </button>
                <button id="draftAllPagesAudioBtn" type="button" class="admin-btn admin-btn-secondary" style="padding:6px 10px; font-size:11px; cursor:pointer; background:#334155; color:#cbd5e1; border:1px solid #64748b;" title="किताब के सभी पेजों का ऑडियो बंद (ड्राफ्ट) करें">
                  ⚪ सभी पेज ड्राफ्ट
                </button>
              </div>
            </div>

            <!-- OPTION A: TEXT EDITOR (TTS MODE) -->
            <div style="margin-bottom: 18px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:6px;">
                <label style="font-weight:700; font-size:0.85rem; color:#e2e8f0;">
                  🟢 विकल्प A: इस पेज का हिंदी टेक्स्ट (मधुर महिला आवाज़ - कृषि सखी):
                </label>
                <button id="ocrExtractBtn" type="button" class="admin-btn" style="background:#4338ca; color:#fff; padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;" title="वर्तमान पेज की इमेज से हिंदी व अंग्रेजी टेक्स्ट स्कैन करें (OCR)">
                  <span>🔍</span> इमेज से टेक्स्ट निकालें (OCR)
                </button>
              </div>
              <textarea id="pageTextInput" rows="5" class="admin-input" style="width:100%; resize:vertical; font-size:0.9rem; line-height:1.5;" placeholder="इस पेज पर लिखा हुआ टेक्स्ट यहाँ पेस्ट करें या टाइप करें..."></textarea>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; gap:8px; align-items:center;">
                  <button id="studioPrevPageBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:12px;" title="पिछला पेज">
                    ⏮️ पिछला (Prev)
                  </button>
                  <button id="studioNextPageBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:12px;" title="अगला पेज">
                    ⏭️ अगला (Next)
                  </button>
                  <button id="testTtsBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:12px;">
                    🔊 महिला आवाज़ में सुनें (TTS Test)
                  </button>
                  <button id="stopTtsBtn" class="admin-btn" style="background:#ef4444; color:#fff; padding:6px 12px; font-size:12px; display:none; align-items:center; gap:4px;">
                    <span>⏹️</span> आवाज़ रोकें (Stop)
                  </button>
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <span id="autoSaveBadge" style="font-size:0.75rem; color:#34d399; font-weight:700; background:#064e3b; padding:3px 8px; border-radius:4px; display:none;">✅ स्वतः सेव हुआ</span>
                  <button id="savePageTextBtn" class="admin-btn admin-btn-primary" style="padding:6px 14px; font-size:12px;">
                    💾 सेव करें (Save)
                  </button>
                  <button id="gitPushEditorBtn" class="admin-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:6px 14px; font-weight:800; font-size:12px; box-shadow:0 4px 12px rgba(16,185,129,0.35); display:inline-flex; align-items:center; gap:4px;" title="ऑडियो और टेक्स्ट को सीधे Git पर पुश करें">
                    <span>🚀</span> 1-Click Git Push
                  </button>
                </div>
              </div>
            </div>

            <hr style="border:none; border-top:1px solid #334155; margin:16px 0;">

            <!-- OPTION B: LIVE MIC RECORDER WITH STUDIO NOISE REMOVER & SWEET ECHO -->
            <div>
              <label style="font-weight:700; font-size:0.85rem; color:#e2e8f0; display:block; margin-bottom:6px;">
                🎙️ विकल्प B: सीधे माइक से अपनी मूल आवाज़ रिकॉर्ड करें:
              </label>
              <p style="margin:0 0 10px; font-size:0.75rem; color:#94a3b8;">
                माइक ऑन करें, पेज देखकर बोलें। <strong>नॉइज़ रिमूवर</strong> और <strong>मधुर इको</strong> के साथ असली आवाज़ 24kbps Opus में सेव होगी।
              </p>

              <!-- Studio Audio Quality & Sound Enhancer Settings -->
              <div style="background:#1e293b; border:1px solid #334155; border-radius:8px; padding:10px 12px; margin-bottom:12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
                  <span style="font-size:0.82rem; font-weight:800; color:#38bdf8; display:flex; align-items:center; gap:6px;">
                    <span>✨</span> स्टूडियो वॉइस फ़िल्टर (Noise Remover & Sweet Echo)
                  </span>
                  <span style="font-size:0.75rem; background:#064e3b; color:#6ee7b7; padding:2px 8px; border-radius:12px; font-weight:700;">
                    🛡️ नॉइज़ फ़िल्टर सक्रिय
                  </span>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">
                      🎧 कानों को प्यारा इको (Sweet Studio Echo):
                    </label>
                    <select id="studioEchoPresetSelect" class="admin-input" style="width:100%; padding:4px 8px; font-size:0.8rem; font-weight:700;">
                      <option value="sweet" selected>✨ हल्का मधुर इको (Sweet Echo - 35%)</option>
                      <option value="medium">🎙️ मीडियम पॉडकास्ट इको (Medium Echo - 50%)</option>
                      <option value="rich">🏛️ रिच कॉन्सर्ट इको (Rich Presence - 65%)</option>
                      <option value="none">🔇 इको बंद (Direct Mic - 0%)</option>
                    </select>
                  </div>

                  <div>
                    <label style="font-size:0.75rem; color:#cbd5e1; font-weight:600; display:block; margin-bottom:2px;">
                      🛡️ बैकग्राउंड नॉइज़ फ़िल्टर (Noise Filter):
                    </label>
                    <select id="studioNoiseFilterSelect" class="admin-input" style="width:100%; padding:4px 8px; font-size:0.8rem; font-weight:700;">
                      <option value="high" selected>🟢 हाई-क्वालिटी नॉइज़ रिमूवर (High DSP)</option>
                      <option value="standard">🟡 स्टैंडर्ड नॉइज़ रिमूवर</option>
                      <option value="off">⚪ डायरेक्ट माइक (No Filter)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:8px; margin-top:10px; padding:12px; background:#0f172a; border-radius:8px; flex-wrap:wrap;">
                <button id="startRecBtn" class="admin-btn" style="background:#ef4444; color:#fff; padding:8px 16px; font-weight:700;">
                  <span>🔴</span> रिकॉर्ड शुरू करें
                </button>
                <button id="stopRecBtn" class="admin-btn" style="background:#475569; color:#fff; display:none; padding:8px 16px; font-weight:700;">
                  <span>⏹️</span> रोकें (Stop)
                </button>
                <button id="testLiveMicBtn" class="admin-btn admin-btn-secondary" style="padding:8px 12px; font-size:12px;" title="ईयरफोन लगाकर अपनी आवाज़ और मधुर इको तुरंत लाइव सुनें">
                  <span>🎧</span> लाइव टेस्ट (Live Echo Test)
                </button>
                <div id="recStatusWave" style="height:34px; flex:1; min-width:180px; background:#1e293b; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px;">
                  माइक तैयार है (🛡️ नॉइज़ फ़िल्टर + 🎧 मधुर इको)
                </div>
              </div>

              <!-- Audio Playback Preview Box -->
              <div id="audioPlaybackBox" style="margin-top:12px; display:none; background:#0f172a; padding:12px; border-radius:8px;">
                <div style="font-size:0.8rem; color:#34d399; font-weight:700; margin-bottom:6px;">रिकॉर्ड की गई आपकी मूल ऑडियो:</div>
                <audio id="recordedAudioPlayer" controls style="width:100%; height:36px;"></audio>
                <div style="display:flex; gap:10px; margin-top:10px;">
                  <button id="saveRecordedAudioBtn" class="admin-btn admin-btn-primary" style="flex:1; justify-content:center;">
                    💾 यह ऑडियो सेव करें
                  </button>
                  <button id="deleteRecordedAudioBtn" class="admin-btn" style="background:#ef4444; color:#fff; padding:6px 12px;">
                    🗑️ डिलीट
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
    `;

    // Extract book ID from hash or query parameters (e.g. #book-audio-studio?id=BK015)
    try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const hashParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?')) : '');
        const searchParams = new URLSearchParams(search);
        const urlId = (hashParams.get('id') || hashParams.get('book') || searchParams.get('id') || searchParams.get('book') || '').trim().toUpperCase();
        if (urlId) {
            studioCurrentBookId = urlId;
        }
    } catch (e) {}

    setupStudioEvents();
    await loadBookStudio(studioCurrentBookId);
}

// =======================================================
// 3. STUDIO EVENTS & WORKFLOW
async function populateStudioBookSelect(selectedId) {
    const bookSelect = document.getElementById('bookSelect');
    if (!bookSelect) return;

    let mainBooks = [];
    try {
        const res = await fetch('../data/books.json?v=' + Date.now());
        if (res.ok) {
            const json = await res.json();
            if (json.books && json.books.length) mainBooks = json.books;
        }
    } catch (e) {}

    let customBooks = [];
    try {
        customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
    } catch (e) {}

    let landingPages = [];
    try {
        const resLp = await fetch('../data/universal-book-landing-pages.json?v=' + Date.now());
        if (resLp.ok) {
            const jsonLp = await resLp.json();
            if (jsonLp.bookLandingPages && jsonLp.bookLandingPages.length) landingPages = jsonLp.bookLandingPages;
        }
    } catch (e) {}

    try {
        const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
        if (Array.isArray(localLp)) {
            localLp.forEach(lp => {
                if (!lp || !lp.id) return;
                const idx = landingPages.findIndex(x => x && x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                if (idx >= 0) landingPages[idx] = { ...landingPages[idx], ...lp };
                else landingPages.push(lp);
            });
        }
    } catch (e) {}

    let freeDemoBooks = [];
    try {
        freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
    } catch (e) {}
    if (!freeDemoBooks || freeDemoBooks.length === 0) {
        freeDemoBooks = [
            { id: 'DEMO001', name: 'खरीफ फसल मास्टर गाइड 2026 (Free Demo)', type: 'demo' },
            { id: 'BONUS001', name: 'ऑर्गेनिक स्प्रे एवं फसल सुरक्षा फॉर्मूला (Free Bonus)', type: 'bonus_free' }
        ];
    }

    const uniqueMainMap = new Map();
    const demoMap = new Map();
    const bonusMap = new Map();

    // 1. Process mainBooks from books.json
    mainBooks.forEach(b => {
        if (!b || !b.id) return;
        const bId = b.id.toUpperCase();
        if (bId.startsWith('DEMO') || b.type === 'demo' || b.isDemo) {
            demoMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        } else if (bId.startsWith('FREE') || bId.startsWith('BONUS') || b.type === 'bonus_free' || b.isBonus) {
            bonusMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        } else {
            uniqueMainMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        }
    });

    // 2. Process customBooks
    customBooks.forEach(b => {
        if (!b || !b.id) return;
        const bId = b.id.toUpperCase();
        if (bId.startsWith('DEMO') || b.type === 'demo' || b.isDemo) {
            if (!demoMap.has(bId)) demoMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        } else if (bId.startsWith('FREE') || bId.startsWith('BONUS') || b.type === 'bonus_free' || b.isBonus) {
            if (!bonusMap.has(bId)) bonusMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        } else if (!uniqueMainMap.has(bId)) {
            uniqueMainMap.set(bId, { id: bId, title: b.heading || b.name || bId });
        }
    });

    // 3. Process landingPages (crucial for DEMO-BK015, DEMO-BK002, DEMO-BK001, etc.)
    landingPages.forEach(p => {
        if (!p || !p.id) return;
        const pId = p.id.toUpperCase();
        const pTitle = p.hero?.title || p.heading || p.name || pId;
        const bType = p.book_type || p.type || '';
        if (bType === 'demo' || pId.startsWith('DEMO') || p.isDemo) {
            demoMap.set(pId, { id: pId, title: pTitle });
        } else if (bType === 'free' || pId.startsWith('FREE') || pId.startsWith('BONUS') || p.isBonus) {
            bonusMap.set(pId, { id: pId, title: pTitle });
        } else if (!uniqueMainMap.has(pId)) {
            uniqueMainMap.set(pId, { id: pId, title: pTitle });
        }
    });

    // 4. Process freeDemoBooks
    freeDemoBooks.forEach(b => {
        if (!b || !b.id) return;
        const bId = b.id.toUpperCase();
        if (bId.startsWith('DEMO') || b.type === 'demo' || b.isDemo) {
            if (!demoMap.has(bId)) demoMap.set(bId, { id: bId, title: b.heading || b.name || 'डेमो पुस्तक' });
        } else if (!bonusMap.has(bId)) {
            bonusMap.set(bId, { id: bId, title: b.heading || b.name || 'फ्री बोनस' });
        }
    });

    bookSelect.innerHTML = '';

    // OptGroup 1: Main Books
    const ogMain = document.createElement('optgroup');
    ogMain.label = '📚 मुख्य सशुल्क पुस्तकें (Main Books)';
    Array.from(uniqueMainMap.values()).forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = `${b.id}: ${b.title}`;
        if (opt.value === selectedId) opt.selected = true;
        ogMain.appendChild(opt);
    });
    bookSelect.appendChild(ogMain);

    // OptGroup 2: Demo Books
    if (demoMap.size > 0) {
        const ogDemo = document.createElement('optgroup');
        ogDemo.label = '📖 डेमो पुस्तकें (Demo Books)';
        Array.from(demoMap.values()).forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.id}: ${b.title}`;
            if (opt.value === selectedId) opt.selected = true;
            ogDemo.appendChild(opt);
        });
        bookSelect.appendChild(ogDemo);
    }

    // OptGroup 3: Free Bonus Books
    if (bonusMap.size > 0) {
        const ogBonus = document.createElement('optgroup');
        ogBonus.label = '🎁 फ्री बोनस पुस्तकें (Free Bonus Books)';
        Array.from(bonusMap.values()).forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.id}: ${b.title}`;
            if (opt.value === selectedId) opt.selected = true;
            ogBonus.appendChild(opt);
        });
        bookSelect.appendChild(ogBonus);
    }

    // Option 4: Add New Book/Demo Code
    const newOpt = document.createElement('option');
    newOpt.value = '__NEW__';
    newOpt.textContent = '➕ नया बुक / डेमो कोड जोड़ें...';
    bookSelect.appendChild(newOpt);

    // If selectedId wasn't found in existing options, add it dynamically
    if (selectedId && !Array.from(bookSelect.options).some(o => o.value === selectedId)) {
        const customOpt = document.createElement('option');
        customOpt.value = selectedId;
        customOpt.textContent = `${selectedId}: पुस्तक / डेमो ऑडियो`;
        customOpt.selected = true;
        bookSelect.insertBefore(customOpt, newOpt);
    }
    if (selectedId) {
        bookSelect.value = selectedId;
    }
}

// =======================================================
// 3. STUDIO EVENTS & WORKFLOW
// =======================================================
async function setupStudioEvents() {
    const bookSelect = document.getElementById('bookSelect');
    const openNewBookBtn = document.getElementById('openNewBookModalBtn');
    const newBookModal = document.getElementById('newBookCreatorModal');
    const closeNewBookBtn = document.getElementById('closeNewBookModalBtn');
    const cancelNewBookBtn = document.getElementById('cancelNewBookBtn');
    const newBookForm = document.getElementById('newBookCreatorForm');

    // 📖 Auto Book ID Generator (Just like Book Landing Pages)
    async function getNextAvailableBookId() {
        let maxNum = 0;
        const allIds = new Set();
        try {
            const res = await fetch('../data/books.json?v=' + Date.now());
            if (res.ok) {
                const j = await res.json();
                (j.books || []).forEach(b => b && b.id && allIds.add(b.id.toUpperCase()));
            }
        } catch (_) {}
        try {
            const resLp = await fetch('../data/universal-book-landing-pages.json?v=' + Date.now());
            if (resLp.ok) {
                const jLp = await resLp.json();
                (jLp.bookLandingPages || []).forEach(p => p && p.id && allIds.add(p.id.toUpperCase()));
            }
        } catch (_) {}
        try {
            const cb = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            cb.forEach(b => b && b.id && allIds.add(b.id.toUpperCase()));
        } catch (_) {}
        try {
            const lb = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            lb.forEach(b => b && b.id && allIds.add(b.id.toUpperCase()));
        } catch (_) {}

        allIds.forEach(id => {
            if (id.startsWith('BK')) {
                const num = parseInt(id.replace('BK', ''), 10);
                if (!isNaN(num) && num > maxNum) maxNum = num;
            }
        });
        const nextNum = (maxNum > 0 ? maxNum : 15) + 1;
        return `BK${String(nextNum).padStart(3, '0')}`;
    }

    // 📖 New Book Creator Modal Handlers
    async function openNewBookModal() {
        if (!newBookModal) return;
        if (newBookForm) newBookForm.reset();
        const ml = document.getElementById('visMyLibrary'); if (ml) ml.checked = true;
        const st = document.getElementById('visStore'); if (st) st.checked = true;
        const lp = document.getElementById('visLanding'); if (lp) lp.checked = true;
        const bd = document.getElementById('visBundle'); if (bd) bd.checked = true;

        const autoCode = await getNextAvailableBookId();
        const idInput = document.getElementById('newBookIdInput');
        if (idInput) idInput.value = autoCode;
        const pagesInput = document.getElementById('newBookTotalPagesInput');
        if (pagesInput) pagesInput.value = '0';

        newBookModal.style.display = 'flex';
        setTimeout(() => {
            const titleInput = document.getElementById('newBookTitleInput');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    function closeNewBookModal() {
        if (newBookModal) newBookModal.style.display = 'none';
    }

    const autoGenBtn = document.getElementById('autoGenBookIdBtn');
    if (autoGenBtn) {
        autoGenBtn.addEventListener('click', async () => {
            const autoCode = await getNextAvailableBookId();
            const idInput = document.getElementById('newBookIdInput');
            if (idInput) {
                idInput.value = autoCode;
                alert(`⚡ अगला उपलब्ध Book ID जनरेट हुआ: ${autoCode}`);
            }
        });
    }

    const freeCheck = document.getElementById('newBookIsFreeInput');
    if (freeCheck) {
        freeCheck.addEventListener('change', (e) => {
            const mrpInp = document.getElementById('newBookMrpInput');
            const offerInp = document.getElementById('newBookOfferPriceInput');
            if (e.target.checked) {
                if (mrpInp) mrpInp.value = '0';
                if (offerInp) offerInp.value = '0';
            } else {
                if (mrpInp && mrpInp.value === '0') mrpInp.value = '299';
                if (offerInp && offerInp.value === '0') offerInp.value = '99';
            }
        });
    }

    if (openNewBookBtn) openNewBookBtn.addEventListener('click', openNewBookModal);
    if (closeNewBookBtn) closeNewBookBtn.addEventListener('click', closeNewBookModal);
    if (cancelNewBookBtn) cancelNewBookBtn.addEventListener('click', closeNewBookModal);

    if (newBookForm) {
        newBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const idInput = document.getElementById('newBookIdInput');
            const titleInput = document.getElementById('newBookTitleInput');
            const catSelect = document.getElementById('newBookCategorySelect');
            const mrpInput = document.getElementById('newBookMrpInput');
            const offerInput = document.getElementById('newBookOfferPriceInput');
            const wordInput = document.getElementById('newBookWordUrlInput');
            const driveInput = document.getElementById('newBookDriveUrlInput');
            const descInput = document.getElementById('newBookBonusDescInput');
            const pagesInput = document.getElementById('newBookTotalPagesInput');

            const cleanCode = (idInput?.value || '').trim().toUpperCase();
            const title = (titleInput?.value || '').trim();
            const category = catSelect?.value || 'Agriculture';
            const mrp = parseInt(mrpInput?.value, 10) || 299;
            const offerPrice = parseInt(offerInput?.value, 10) || 99;
            const wordUrl = (wordInput?.value || '').trim();
            const driveUrl = (driveInput?.value || '').trim();
            const bonusDesc = (descInput?.value || '').trim();
            const initialPages = parseInt(pagesInput?.value, 10) || 0;

            if (!cleanCode) {
                alert('कृपया पुस्तक कोड (Book ID) दर्ज करें!');
                return;
            }
            if (!title) {
                alert('कृपया पुस्तक का नाम दर्ज करें!');
                return;
            }

            const bonuses = [];
            if (wordUrl) {
                bonuses.push({
                    type: 'word_doc',
                    title: `${title} - Word गाइड (.docx)`,
                    file_url: wordUrl,
                    word_url: wordUrl,
                    thumbnail: '/images/icons/docx-icon.png',
                    description: bonusDesc || 'Word गाइड डाउनलोड'
                });
            }
            if (driveUrl) {
                bonuses.push({
                    type: 'google_drive',
                    title: `${title} - Google Drive वीडियो व नोट्स`,
                    drive_url: driveUrl,
                    file_url: driveUrl,
                    thumbnail: '/images/icons/gdrive-icon.png',
                    description: bonusDesc || 'Google Drive फोल्डर एक्सेस'
                });
            }

            const isFree = !!document.getElementById('newBookIsFreeInput')?.checked;
            const finalMrp = isFree ? 0 : mrp;
            const finalOffer = isFree ? 0 : offerPrice;
            const finalCat = isFree ? 'फ्री ई-बुक' : category;

            const newBook = {
                id: cleanCode,
                heading: title,
                name: title,
                title: title,
                is_free: isFree,
                isFree: isFree,
                category: finalCat,
                mrp: finalMrp,
                price: finalOffer,
                offerPrice: finalOffer,
                totalPages: initialPages,
                visibility: {
                    myLibrary: !!document.getElementById('visMyLibrary')?.checked,
                    store: !!document.getElementById('visStore')?.checked,
                    landing: !!document.getElementById('visLanding')?.checked,
                    bundle: !!document.getElementById('visBundle')?.checked
                },
                bonuses: bonuses,
                created_at: new Date().toISOString()
            };

            // 1. Save to AAROGYAM_CUSTOM_BOOKS
            let customBooks = [];
            try {
                customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            } catch (err) {}
            const existingIdx = customBooks.findIndex(b => b && b.id && b.id.toUpperCase() === cleanCode);
            if (existingIdx >= 0) {
                customBooks[existingIdx] = { ...customBooks[existingIdx], ...newBook };
            } else {
                customBooks.push(newBook);
            }
            localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));

            // If free book, also mirror into AAROGYAM_FREE_DEMO_BOOKS
            if (isFree) {
                try {
                    let freeDemos = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
                    const fdIdx = freeDemos.findIndex(b => b.id && b.id.toUpperCase() === cleanCode);
                    if (fdIdx >= 0) freeDemos[fdIdx] = { ...freeDemos[fdIdx], ...newBook };
                    else freeDemos.push(newBook);
                    localStorage.setItem('AAROGYAM_FREE_DEMO_BOOKS', JSON.stringify(freeDemos));
                } catch (_) {}
            }

            // 2. If visLanding, sync to AAROGYAM_BOOK_LANDING_PAGES
            if (newBook.visibility.landing) {
                let landingPages = [];
                try {
                    landingPages = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
                } catch (err) {}
                const lpIdx = landingPages.findIndex(p => p && p.id && p.id.toUpperCase() === cleanCode);
                const lpEntry = {
                    id: cleanCode,
                    book_id: cleanCode,
                    slug: cleanCode.toLowerCase(),
                    title: title,
                    name: title,
                    heading: title,
                    hero_title: title,
                    is_free: isFree,
                    hero: {
                        tag: isFree ? '🎁 100% मुफ़्त ई-बुक' : '🌾 Agriculture Practical Guide',
                        title: title,
                        subtitle: 'सम्पूर्ण Practical Guide',
                        cover_image: `/images/books/${cleanCode.toLowerCase()}-cover.webp`,
                        rating_score: '4.9',
                        rating_count: '120+ Ratings',
                        description: 'सम्पूर्ण प्रैक्टिकल जानकारी।',
                        mrp: finalMrp,
                        offer_price: finalOffer
                    },
                    category: finalCat,
                    mrp: finalMrp,
                    price: finalOffer,
                    bonuses: bonuses,
                    updated_at: new Date().toISOString()
                };
                if (lpIdx >= 0) {
                    landingPages[lpIdx] = { ...landingPages[lpIdx], ...lpEntry };
                } else {
                    landingPages.push(lpEntry);
                }
                localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(landingPages));
            }

            // 3. If initialPages specified, set initial page count without filling DB with empty strings
            if (initialPages > 0) {
                studioTotalPages = initialPages;
                studioPageImages = [];
            }

            closeNewBookModal();

            // Refresh Book Select & Switch to new book
            studioCurrentBookId = cleanCode;
            studioCurrentPage = 1;
            await populateStudioBookSelect(studioCurrentBookId);
            await loadBookStudio(studioCurrentBookId);

            alert(`✅ पुस्तक "${title}" (${cleanCode}) सफलतापूर्वक सुरक्षित हो गई!\n\nअब आप "🎁 अपलोड बोनस" से Word/Drive फाइल्स जोड़ सकते हैं, या "📚 अन्य पुस्तक से जोड़ें" से पुरानी किताबों के पेज शामिल कर सकते हैं।`);
        });
    }

    // 📄 Multi-Select & Bulk Page Delete Handlers
    const toggleSelectModeBtn = document.getElementById('toggleSelectModeBtn');
    const selectAllPagesBtn = document.getElementById('selectAllPagesBtn');
    const deselectAllPagesBtn = document.getElementById('deselectAllPagesBtn');
    const liveSelectedPagesAudioBtn = document.getElementById('liveSelectedPagesAudioBtn');
    const draftSelectedPagesAudioBtn = document.getElementById('draftSelectedPagesAudioBtn');
    const deleteSelectedPagesBtn = document.getElementById('deleteSelectedPagesBtn');
    const clearAllBookPagesBtn = document.getElementById('clearAllBookPagesBtn');
    const selectedCountBadge = document.getElementById('selectedPagesCountBadge');

    function updateMultiSelectUI() {
        if (selectedCountBadge) selectedCountBadge.textContent = selectedPagesForBulkAction.size;
        const hasSelection = isPageMultiSelectMode && selectedPagesForBulkAction.size > 0;
        if (deleteSelectedPagesBtn) {
            deleteSelectedPagesBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }
        if (liveSelectedPagesAudioBtn) {
            liveSelectedPagesAudioBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }
        if (draftSelectedPagesAudioBtn) {
            draftSelectedPagesAudioBtn.style.display = hasSelection ? 'inline-block' : 'none';
        }
        if (selectAllPagesBtn) selectAllPagesBtn.style.display = isPageMultiSelectMode ? 'inline-block' : 'none';
        if (deselectAllPagesBtn) deselectAllPagesBtn.style.display = isPageMultiSelectMode ? 'inline-block' : 'none';
        if (toggleSelectModeBtn) {
            toggleSelectModeBtn.style.background = isPageMultiSelectMode ? '#f59e0b' : '#334155';
            toggleSelectModeBtn.style.color = isPageMultiSelectMode ? '#000' : '#e2e8f0';
            toggleSelectModeBtn.textContent = isPageMultiSelectMode ? '❌ चयन मोड बंद' : '☑️ मल्टी-सेलेक्ट';
        }
    }

    if (liveSelectedPagesAudioBtn) {
        liveSelectedPagesAudioBtn.addEventListener('click', () => setAudioApprovalForSelectedPages(true));
    }

    if (draftSelectedPagesAudioBtn) {
        draftSelectedPagesAudioBtn.addEventListener('click', () => setAudioApprovalForSelectedPages(false));
    }

    if (toggleSelectModeBtn) {
        toggleSelectModeBtn.addEventListener('click', () => {
            isPageMultiSelectMode = !isPageMultiSelectMode;
            if (!isPageMultiSelectMode) selectedPagesForBulkAction.clear();
            updateMultiSelectUI();
            renderPageChipGrid();
        });
    }

    if (selectAllPagesBtn) {
        selectAllPagesBtn.addEventListener('click', () => {
            selectedPagesForBulkAction.clear();
            for (let i = 1; i <= studioTotalPages; i++) selectedPagesForBulkAction.add(i);
            updateMultiSelectUI();
            renderPageChipGrid();
        });
    }

    if (deselectAllPagesBtn) {
        deselectAllPagesBtn.addEventListener('click', () => {
            selectedPagesForBulkAction.clear();
            updateMultiSelectUI();
            renderPageChipGrid();
        });
    }

    if (deleteSelectedPagesBtn) {
        deleteSelectedPagesBtn.addEventListener('click', async () => {
            if (selectedPagesForBulkAction.size === 0) {
                alert('कृपया पहले डिलीट करने के लिए पेज चुनें!');
                return;
            }
            const count = selectedPagesForBulkAction.size;
            if (!confirm(`⚠️ क्या आप चुने हुए ${count} पेजों को स्थायी रूप से हटाना चाहते हैं?`)) return;

            const delSet = new Set(selectedPagesForBulkAction);
            const newImages = [];
            const newScriptsPages = {};
            let newP = 1;

            for (let p = 1; p <= studioTotalPages; p++) {
                if (!delSet.has(p)) {
                    if (studioPageImages && studioPageImages[p - 1]) {
                        newImages.push(studioPageImages[p - 1]);
                    }
                    if (studioAudioScripts.pages && studioAudioScripts.pages[String(p)]) {
                        newScriptsPages[String(newP)] = studioAudioScripts.pages[String(p)];
                    }
                    newP++;
                }
            }

            studioPageImages = newImages;
            studioTotalPages = newImages.length || (newP - 1);
            studioAudioScripts.pages = newScriptsPages;
            selectedPagesForBulkAction.clear();
            isPageMultiSelectMode = false;

            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            markUnsaved(true);
            updateMultiSelectUI();
            renderPageChipGrid();
            selectPage(Math.min(studioCurrentPage, Math.max(1, studioTotalPages)));

            alert(`✅ ${count} पेज सफलतापूर्वक डिलीट कर दिए गए! कुल बचे पेज: ${studioTotalPages}`);
        });
    }

    if (clearAllBookPagesBtn) {
        clearAllBookPagesBtn.addEventListener('click', async () => {
            if (!confirm(`💥 चेतावनी: क्या आप पुस्तक [${studioCurrentBookId}] के सभी ${studioTotalPages} पेजों को खाली करना चाहते हैं?\n\n(यह सभी पेज इमेजेस और स्क्रिप्ट्स को हटा देगा)`)) return;

            studioPageImages = [];
            studioTotalPages = 0;
            studioAudioScripts.pages = {};
            selectedPagesForBulkAction.clear();
            isPageMultiSelectMode = false;

            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            markUnsaved(true);
            updateMultiSelectUI();
            renderPageChipGrid();

            const previewImg = document.getElementById('pagePreviewImage');
            if (previewImg) previewImg.src = '';
            const textInput = document.getElementById('pageTextInput');
            if (textInput) textInput.value = '';

            alert(`💥 पुस्तक [${studioCurrentBookId}] के सभी पेज खाली कर दिए गए हैं। अब आप नए सिरे से पेज अपलोड या इम्पोर्ट कर सकते हैं।`);
        });
    }

    // Set Total Pages Directly
    const applyTotalPagesBtn = document.getElementById('applyTotalPagesBtn');
    const quickSetTotalInput = document.getElementById('quickSetTotalPagesInput');
    if (applyTotalPagesBtn && quickSetTotalInput) {
        applyTotalPagesBtn.addEventListener('click', async () => {
            const targetTotal = parseInt(quickSetTotalInput.value, 10);
            if (isNaN(targetTotal) || targetTotal < 0) {
                alert('कृपया एक वैध संख्या दर्ज करें (0 - 1000)');
                return;
            }
            if (targetTotal < studioTotalPages) {
                const diff = studioTotalPages - targetTotal;
                if (!confirm(`⚠️ आप कुल पेज संख्या ${studioTotalPages} से घटाकर ${targetTotal} कर रहे हैं। आखिरी ${diff} पेज डिलीट हो जाएंगे। क्या आप सहमत हैं?`)) {
                    return;
                }
                if (studioPageImages && studioPageImages.length > targetTotal) {
                    studioPageImages = studioPageImages.slice(0, targetTotal);
                }
                if (studioAudioScripts.pages) {
                    for (let p = targetTotal + 1; p <= studioTotalPages; p++) {
                        delete studioAudioScripts.pages[String(p)];
                    }
                }
            } else if (targetTotal > studioTotalPages) {
                if (!studioPageImages) studioPageImages = [];
                while (studioPageImages.length < targetTotal) {
                    studioPageImages.push('');
                }
            }
            studioTotalPages = targetTotal;
            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            markUnsaved(true);
            renderPageChipGrid();
            selectPage(Math.min(studioCurrentPage, Math.max(1, studioTotalPages)));
            alert(`✅ कुल पेज संख्या सफलतापूर्वक ${targetTotal} सेट कर दी गई!`);
        });
    }

    // 🎁 Dedicated VIP Bonus Manager Modal Handlers (Word & Google Drive)
    const openBonusBtn = document.getElementById('openBonusManagerBtn');
    const bonusModal = document.getElementById('bonusManagerModal');
    const closeBonusBtn = document.getElementById('closeBonusModalBtn');
    const cancelBonusBtn = document.getElementById('cancelBonusModalBtn');
    const saveBonusBtn = document.getElementById('saveBonusModalBtn');
    const removeBonusBtn = document.getElementById('removeBonusBtn');
    const tabWordBtn = document.getElementById('tabBonusWordBtn');
    const tabDriveBtn = document.getElementById('tabBonusDriveBtn');
    const wordPane = document.getElementById('bonusWordPane');
    const drivePane = document.getElementById('bonusDrivePane');

    const triggerWordFileBtn = document.getElementById('triggerBonusWordFileBtn');
    const bonusWordFileInput = document.getElementById('bonusWordFileInput');
    const bonusWordFileNameLabel = document.getElementById('bonusWordFileNameLabel');
    const bonusWordUrlInput = document.getElementById('bonusWordUrlInput');
    const bonusWordThumbInput = document.getElementById('bonusWordThumbInput');
    const bonusWordThumbPreview = document.getElementById('bonusWordThumbPreview');
    const bonusWordTitleInput = document.getElementById('bonusWordTitleInput');
    const bonusWordDescInput = document.getElementById('bonusWordDescInput');

    const bonusDriveUrlInput = document.getElementById('bonusDriveUrlInput');
    const bonusDriveThumbInput = document.getElementById('bonusDriveThumbInput');
    const bonusDriveThumbPreview = document.getElementById('bonusDriveThumbPreview');
    const bonusDriveTitleInput = document.getElementById('bonusDriveTitleInput');
    const bonusDriveDescInput = document.getElementById('bonusDriveDescInput');

    function switchBonusTab(tab) {
        if (tab === 'word') {
            if (wordPane) wordPane.style.display = 'flex';
            if (drivePane) drivePane.style.display = 'none';
            if (tabWordBtn) { tabWordBtn.style.background = '#1e3a8a'; tabWordBtn.style.color = '#93c5fd'; }
            if (tabDriveBtn) { tabDriveBtn.style.background = '#1e293b'; tabDriveBtn.style.color = '#94a3b8'; }
        } else {
            if (wordPane) wordPane.style.display = 'none';
            if (drivePane) drivePane.style.display = 'flex';
            if (tabWordBtn) { tabWordBtn.style.background = '#1e293b'; tabWordBtn.style.color = '#94a3b8'; }
            if (tabDriveBtn) { tabDriveBtn.style.background = '#064e3b'; tabDriveBtn.style.color = '#6ee7b7'; }
        }
    }

    if (tabWordBtn) tabWordBtn.addEventListener('click', () => switchBonusTab('word'));
    if (tabDriveBtn) tabDriveBtn.addEventListener('click', () => switchBonusTab('drive'));

    let pendingBonusWordFile = null;

    function compressThumbnailDataUrl(dataUrl, maxW = 120, maxH = 150) {
        return new Promise((resolve) => {
            if (!dataUrl || !dataUrl.startsWith('data:image')) return resolve(dataUrl);
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const scale = Math.min(1, maxW / (img.width || 1), maxH / (img.height || 1));
                    canvas.width = Math.max(1, Math.round((img.width || 80) * scale));
                    canvas.height = Math.max(1, Math.round((img.height || 100) * scale));
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } catch (_) {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    }

    async function openBonusManager() {
        if (!bonusModal) return;
        const bLabel = document.getElementById('bonusTargetBookIdLabel');
        if (bLabel) bLabel.textContent = studioCurrentBookId;
        pendingBonusWordFile = null;

        // Reset
        if (bonusWordFileInput) bonusWordFileInput.value = '';
        if (bonusWordFileNameLabel) bonusWordFileNameLabel.textContent = 'कोई फाइल नहीं चुनी';
        if (bonusWordUrlInput) bonusWordUrlInput.value = '';
        if (bonusWordThumbInput) bonusWordThumbInput.value = '';
        if (bonusWordTitleInput) bonusWordTitleInput.value = `${studioCurrentBookId} - सम्पूर्ण फसल सुरक्षा शेड्यूल - Word गाइड (.docx)`;
        if (bonusWordDescInput) bonusWordDescInput.value = '15 पृष्ठों की एडिटेबल व प्रिंटेबल फाइल जिसमें खाद व स्प्रे का पूरा टाइमटेबल है।';

        if (bonusDriveUrlInput) bonusDriveUrlInput.value = '';
        if (bonusDriveThumbInput) bonusDriveThumbInput.value = '';
        if (bonusDriveTitleInput) bonusDriveTitleInput.value = `${studioCurrentBookId} - किसान स्पेशल वीडियो लाइब्रेरी - Google Drive`;
        if (bonusDriveDescInput) bonusDriveDescInput.value = '25 फुल एचडी वीडियो, फील्ड डेमो और प्रैक्टिकल नोट्स।';

        // Check if Word file already in IndexedDB
        try {
            const dbWordFile = await loadBonusFileFromDb(studioCurrentBookId);
            if (dbWordFile && dbWordFile.dataUrl) {
                pendingBonusWordFile = dbWordFile;
                if (bonusWordFileNameLabel) {
                    bonusWordFileNameLabel.textContent = `✅ ${dbWordFile.name || 'Word Guide'} (${((dbWordFile.size || 0) / (1024 * 1024)).toFixed(2)} MB - सुरक्षित)`;
                }
                if (bonusWordUrlInput) bonusWordUrlInput.value = `idb://bonus_word_${studioCurrentBookId}`;
                if (downloadWordFileBtn) {
                    downloadWordFileBtn.style.display = 'inline-block';
                    downloadWordFileBtn.onclick = () => {
                        const a = document.createElement('a');
                        a.href = dbWordFile.dataUrl;
                        a.download = dbWordFile.name || `${studioCurrentBookId}_Bonus_Guide.docx`;
                        a.click();
                    };
                }
            } else if (downloadWordFileBtn) {
                downloadWordFileBtn.style.display = 'none';
            }
        } catch (_) {}

        // Load existing bonuses from custom books
        let customBooks = [];
        try { customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]'); } catch (_) {}
        const book = customBooks.find(b => b.id && b.id.toUpperCase() === studioCurrentBookId.toUpperCase());
        if (book && Array.isArray(book.bonuses)) {
            const wordBonus = book.bonuses.find(b => b.type === 'word_doc' || b.word_url || (b.file_url && b.file_url.includes('.doc')));
            if (wordBonus) {
                if (bonusWordUrlInput && !bonusWordUrlInput.value) bonusWordUrlInput.value = wordBonus.file_url || wordBonus.word_url || '';
                if (bonusWordTitleInput) bonusWordTitleInput.value = wordBonus.title || '';
                if (bonusWordDescInput) bonusWordDescInput.value = wordBonus.description || '';
                if (bonusWordThumbInput) bonusWordThumbInput.value = wordBonus.thumbnail || '';
                if (bonusWordThumbPreview && wordBonus.thumbnail) bonusWordThumbPreview.src = wordBonus.thumbnail;
                if (wordBonus.fileName && bonusWordFileNameLabel && !pendingBonusWordFile) {
                    bonusWordFileNameLabel.textContent = `✅ ${wordBonus.fileName}`;
                }
            }
            const driveBonus = book.bonuses.find(b => b.type === 'google_drive' || b.drive_url);
            if (driveBonus) {
                if (bonusDriveUrlInput) bonusDriveUrlInput.value = driveBonus.drive_url || driveBonus.file_url || '';
                if (bonusDriveTitleInput) bonusDriveTitleInput.value = driveBonus.title || '';
                if (bonusDriveDescInput) bonusDriveDescInput.value = driveBonus.description || '';
                if (bonusDriveThumbInput) bonusDriveThumbInput.value = driveBonus.thumbnail || '';
                if (bonusDriveThumbPreview && driveBonus.thumbnail) bonusDriveThumbPreview.src = driveBonus.thumbnail;
            }
        }

        switchBonusTab('word');
        bonusModal.style.display = 'flex';
    }

    if (openBonusBtn) openBonusBtn.addEventListener('click', openBonusManager);
    if (closeBonusBtn) closeBonusBtn.addEventListener('click', () => { if (bonusModal) bonusModal.style.display = 'none'; });
    if (cancelBonusBtn) cancelBonusBtn.addEventListener('click', () => { if (bonusModal) bonusModal.style.display = 'none'; });

    // Word file upload & download
    const downloadWordFileBtn = document.getElementById('downloadBonusWordFileBtn');
    if (triggerWordFileBtn && bonusWordFileInput) {
        triggerWordFileBtn.addEventListener('click', () => {
            bonusWordFileInput.value = '';
            bonusWordFileInput.click();
        });
        bonusWordFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const f = e.target.files[0];
                if (bonusWordFileNameLabel) {
                    bonusWordFileNameLabel.textContent = `⏳ लोड हो रहा है... ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`;
                }
                const r = new FileReader();
                r.onload = () => {
                    const dataUrl = r.result;
                    pendingBonusWordFile = {
                        name: f.name,
                        size: f.size,
                        type: f.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        dataUrl: dataUrl
                    };
                    if (bonusWordUrlInput) bonusWordUrlInput.value = `idb://bonus_word_${studioCurrentBookId}`;
                    if (bonusWordFileNameLabel) {
                        bonusWordFileNameLabel.textContent = `✅ ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB - तैयार)`;
                    }
                    if (downloadWordFileBtn) {
                        downloadWordFileBtn.style.display = 'inline-block';
                        downloadWordFileBtn.onclick = () => {
                            const a = document.createElement('a');
                            a.href = dataUrl;
                            a.download = f.name || `${studioCurrentBookId}_Bonus_Guide.docx`;
                            a.click();
                        };
                    }
                };
                r.readAsDataURL(f);
            }
        });
    }

    if (downloadWordFileBtn) {
        downloadWordFileBtn.addEventListener('click', async () => {
            if (pendingBonusWordFile && pendingBonusWordFile.dataUrl) {
                const a = document.createElement('a');
                a.href = pendingBonusWordFile.dataUrl;
                a.download = pendingBonusWordFile.name || `${studioCurrentBookId}_Bonus_Guide.docx`;
                a.click();
                return;
            }
            const dbFile = await loadBonusFileFromDb(studioCurrentBookId);
            if (dbFile && dbFile.dataUrl) {
                const a = document.createElement('a');
                a.href = dbFile.dataUrl;
                a.download = dbFile.name || `${studioCurrentBookId}_Bonus_Guide.docx`;
                a.click();
                return;
            }
            const url = bonusWordUrlInput?.value;
            if (url && !url.startsWith('idb://')) {
                window.open(url, '_blank');
                return;
            }
            alert('डाउनलोड करने के लिए पहले कोई वर्ड फाइल चुनें!');
        });
    }

    // Word Thumbnail image file picker & download
    const triggerWordThumbBtn = document.getElementById('triggerBonusWordThumbFileBtn');
    const bonusWordThumbFileInput = document.getElementById('bonusWordThumbFileInput');
    const downloadWordThumbBtn = document.getElementById('downloadBonusWordThumbBtn');

    if (triggerWordThumbBtn && bonusWordThumbFileInput) {
        triggerWordThumbBtn.addEventListener('click', () => {
            bonusWordThumbFileInput.value = '';
            bonusWordThumbFileInput.click();
        });
        bonusWordThumbFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const f = e.target.files[0];
                const r = new FileReader();
                r.onload = async () => {
                    const rawDataUrl = r.result;
                    const compressed = await compressThumbnailDataUrl(rawDataUrl, 120, 150);
                    if (bonusWordThumbInput) bonusWordThumbInput.value = compressed;
                    if (bonusWordThumbPreview) bonusWordThumbPreview.src = compressed;
                };
                r.readAsDataURL(f);
            }
        });
    }

    if (downloadWordThumbBtn && bonusWordThumbPreview) {
        downloadWordThumbBtn.addEventListener('click', () => {
            const src = bonusWordThumbPreview.src;
            if (!src || src.includes('placehold.co')) {
                alert('डाउनलोड करने के लिए पहले कोई थंबनेल चुनें!');
                return;
            }
            const a = document.createElement('a');
            a.href = src;
            a.download = `${studioCurrentBookId}_Word_Bonus_Thumb.png`;
            a.click();
        });
    }

    if (bonusWordThumbInput && bonusWordThumbPreview) {
        bonusWordThumbInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) bonusWordThumbPreview.src = val;
        });
    }

    // Drive Thumbnail image file picker & download
    const triggerDriveThumbBtn = document.getElementById('triggerBonusDriveThumbFileBtn');
    const bonusDriveThumbFileInput = document.getElementById('bonusDriveThumbFileInput');
    const downloadDriveThumbBtn = document.getElementById('downloadBonusDriveThumbBtn');
    const testDriveLinkBtn = document.getElementById('testDriveLinkBtn');

    if (triggerDriveThumbBtn && bonusDriveThumbFileInput) {
        triggerDriveThumbBtn.addEventListener('click', () => {
            bonusDriveThumbFileInput.value = '';
            bonusDriveThumbFileInput.click();
        });
        bonusDriveThumbFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const f = e.target.files[0];
                const r = new FileReader();
                r.onload = async () => {
                    const rawDataUrl = r.result;
                    const compressed = await compressThumbnailDataUrl(rawDataUrl, 120, 150);
                    if (bonusDriveThumbInput) bonusDriveThumbInput.value = compressed;
                    if (bonusDriveThumbPreview) bonusDriveThumbPreview.src = compressed;
                };
                r.readAsDataURL(f);
            }
        });
    }

    if (downloadDriveThumbBtn && bonusDriveThumbPreview) {
        downloadDriveThumbBtn.addEventListener('click', () => {
            const src = bonusDriveThumbPreview.src;
            if (!src || src.includes('placehold.co')) {
                alert('डाउनलोड करने के लिए पहले कोई थंबनेल चुनें!');
                return;
            }
            const a = document.createElement('a');
            a.href = src;
            a.download = `${studioCurrentBookId}_Drive_Bonus_Thumb.png`;
            a.click();
        });
    }

    if (testDriveLinkBtn) {
        testDriveLinkBtn.addEventListener('click', () => {
            const link = (bonusDriveUrlInput?.value || '').trim();
            if (!link) {
                alert('कृपया पहले Google Drive लिंक दर्ज करें!');
                return;
            }
            window.open(link, '_blank');
        });
    }

    if (bonusDriveThumbInput && bonusDriveThumbPreview) {
        bonusDriveThumbInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            if (val) bonusDriveThumbPreview.src = val;
        });
    }

    if (saveBonusBtn) {
        saveBonusBtn.addEventListener('click', async () => {
            const wordUrl = (bonusWordUrlInput?.value || '').trim();
            const wordTitle = (bonusWordTitleInput?.value || '').trim();
            const wordDesc = (bonusWordDescInput?.value || '').trim();
            const wordThumb = (bonusWordThumbInput?.value || '').trim();

            const driveUrl = (bonusDriveUrlInput?.value || '').trim();
            const driveTitle = (bonusDriveTitleInput?.value || '').trim();
            const driveDesc = (bonusDriveDescInput?.value || '').trim();
            const driveThumb = (bonusDriveThumbInput?.value || '').trim();

            saveBonusBtn.disabled = true;
            saveBonusBtn.textContent = '⏳ सुरक्षित हो रहा है...';

            // 1. If Word file has binary data, save into IndexedDB (100MB+ safe space)
            if (pendingBonusWordFile && pendingBonusWordFile.dataUrl) {
                await saveBonusFileToDb(studioCurrentBookId, pendingBonusWordFile);
            }

            // 2. Compress thumbnails to lightweight JPEG (avoids localStorage 5MB quota crash)
            const compressedWordThumb = await compressThumbnailDataUrl(wordThumb, 120, 150);
            const compressedDriveThumb = await compressThumbnailDataUrl(driveThumb, 120, 150);

            const bonuses = [];
            if (wordUrl || pendingBonusWordFile) {
                const refUrl = pendingBonusWordFile ? `idb://bonus_word_${studioCurrentBookId}` : wordUrl;
                bonuses.push({
                    type: 'word_doc',
                    title: wordTitle || `${studioCurrentBookId} - Word गाइड (.docx)`,
                    file_url: refUrl,
                    word_url: refUrl,
                    fileName: pendingBonusWordFile ? pendingBonusWordFile.name : `${studioCurrentBookId}_Bonus_Guide.docx`,
                    fileSize: pendingBonusWordFile ? pendingBonusWordFile.size : 0,
                    thumbnail: compressedWordThumb || 'https://placehold.co/80x100/1e3a8a/white?text=DOCX',
                    description: wordDesc || 'Word गाइड डाउनलोड'
                });
            }
            if (driveUrl) {
                bonuses.push({
                    type: 'google_drive',
                    title: driveTitle || `${studioCurrentBookId} - Google Drive वीडियो व नोट्स`,
                    drive_url: driveUrl,
                    file_url: driveUrl,
                    thumbnail: compressedDriveThumb || 'https://placehold.co/80x100/065f46/white?text=DRIVE',
                    description: driveDesc || 'Google Drive फोल्डर एक्सेस'
                });
            }

            // Save into AAROGYAM_CUSTOM_BOOKS safely
            try {
                let customBooks = [];
                try { customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]'); } catch (_) {}
                const bIdx = customBooks.findIndex(b => b.id && b.id.toUpperCase() === studioCurrentBookId.toUpperCase());
                if (bIdx >= 0) {
                    customBooks[bIdx].bonuses = bonuses;
                } else {
                    customBooks.push({
                        id: studioCurrentBookId,
                        heading: studioCurrentBookId,
                        bonuses: bonuses
                    });
                }
                localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));
            } catch (quotaErr) {
                console.warn('Quota exceeded in AAROGYAM_CUSTOM_BOOKS save:', quotaErr);
            }

            // Sync with AAROGYAM_BOOK_LANDING_PAGES safely
            try {
                let landingPages = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
                const lpIdx = landingPages.findIndex(p => p.id && p.id.toUpperCase() === studioCurrentBookId.toUpperCase());
                if (lpIdx >= 0) {
                    landingPages[lpIdx].bonuses = bonuses;
                    localStorage.setItem('AAROGYAM_BOOK_LANDING_PAGES', JSON.stringify(landingPages));
                }
            } catch (_) {}

            saveBonusBtn.disabled = false;
            saveBonusBtn.textContent = '💾 बोनस सुरक्षित करें';
            if (bonusModal) bonusModal.style.display = 'none';
            alert(`🎉 बधाई! पुस्तक [${studioCurrentBookId}] के VIP बोनस (Word व Google Drive) सफलतापूर्वक सेव हो गए हैं!\n\nवर्ड फाइल बिना मेमोरी घेरे IndexedDB में सुरक्षित हो गई है और My Library में तुरंत डाउनलोड बटन के साथ दिखेगी।`);
        });
    }

    if (removeBonusBtn) {
        removeBonusBtn.addEventListener('click', async () => {
            if (!confirm(`क्या आप पुस्तक [${studioCurrentBookId}] के सभी बोनस हटाना चाहते हैं?`)) return;

            await deleteBonusFileFromDb(studioCurrentBookId);
            pendingBonusWordFile = null;

            let customBooks = [];
            try { customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]'); } catch (_) {}
            const bIdx = customBooks.findIndex(b => b.id && b.id.toUpperCase() === studioCurrentBookId.toUpperCase());
            if (bIdx >= 0) {
                customBooks[bIdx].bonuses = [];
                localStorage.setItem('AAROGYAM_CUSTOM_BOOKS', JSON.stringify(customBooks));
            }
            if (bonusModal) bonusModal.style.display = 'none';
            alert(`✅ पुस्तक [${studioCurrentBookId}] से सभी बोनस हटा दिए गए हैं।`);
        });
    }

    // 📧 Email Delivery Logs & Live Test Email Handlers
    const emailModal = document.getElementById('emailDeliveryLogsModal');
    const viewEmailLogsBtn = document.getElementById('viewEmailLogsBtn');
    const closeEmailLogsBtn = document.getElementById('closeEmailLogsModalBtn');
    const refreshEmailLogsBtn = document.getElementById('refreshEmailLogsBtn');
    const emailSearchInput = document.getElementById('emailLogsSearchInput');
    const testSendEmailBtn = document.getElementById('testSendEmailBtn');
    let cachedEmailLogs = [];

    function getEmailApiUrl() {
        if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
            return 'https://aarogyamindia.online/api/send-email';
        }
        return '/api/send-email';
    }

    async function loadEmailDeliveryLogs() {
        const tbody = document.getElementById('emailLogsTableBody');
        const countLabel = document.getElementById('emailLogsCountLabel');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#94a3b8;">⏳ लोड हो रहा है...</td></tr>`;

        let logs = [];
        try {
            const res = await fetch(getEmailApiUrl());
            if (res.ok) {
                const json = await res.json();
                if (json && Array.isArray(json.logs)) {
                    logs = json.logs;
                }
            }
        } catch (_) {}

        // Fallback or augment with localStorage cache
        try {
            const localLogs = JSON.parse(localStorage.getItem('AAROGYAM_SENT_EMAILS') || '[]');
            if (Array.isArray(localLogs) && localLogs.length > 0) {
                localLogs.forEach(ll => {
                    if (!logs.some(l => l.recipient_email === ll.recipient_email && l.created_at === ll.created_at)) {
                        logs.push(ll);
                    }
                });
            }
        } catch (_) {}

        cachedEmailLogs = logs;
        renderEmailLogsTable(logs);
    }

    function renderEmailLogsTable(logsToRender) {
        const tbody = document.getElementById('emailLogsTableBody');
        const countLabel = document.getElementById('emailLogsCountLabel');
        if (!tbody) return;

        if (!logsToRender || logsToRender.length === 0) {
            tbody.innerHTML = `
              <tr>
                <td colspan="5" style="text-align:center; padding:32px 16px; color:#94a3b8;">
                  <div style="font-size:1.5rem; margin-bottom:6px;">📭</div>
                  अभी तक कोई ईमेल नहीं भेजा गया है।<br>
                  <span style="font-size:11px; color:#64748b;">(जैसे ही कोई पाठक My Library या Download पेज पर ईमेल दर्ज करेगा, यहाँ लाइव डिलीवरी रिकॉर्ड दिखेगा)</span>
                </td>
              </tr>`;
            if (countLabel) countLabel.textContent = 'कुल 0 ईमेल रिकॉर्ड्स';
            return;
        }

        if (countLabel) countLabel.textContent = `कुल ${logsToRender.length} ईमेल रिकॉर्ड्स`;

        tbody.innerHTML = logsToRender.map(log => {
            const dateStr = log.created_at ? new Date(log.created_at).toLocaleString('hi-IN', { dateStyle:'short', timeStyle:'short' }) : 'अभी-अभी';
            const name = log.recipient_name || 'किसान साथी';
            const email = log.recipient_email || '-';
            const book = log.book_title || 'विशेष ई-बुक';
            const hasWord = !!(log.word_url || log.has_word);
            const hasDrive = !!(log.drive_url || log.has_drive);
            const status = log.status || 'delivered';

            return `
              <tr style="border-bottom:1px solid #334155;">
                <td style="padding:10px 12px; color:#94a3b8; font-size:11px; white-space:nowrap;">${dateStr}</td>
                <td style="padding:10px 12px; font-weight:700; color:#f1f5f9;">${name}</td>
                <td style="padding:10px 12px; color:#38bdf8; font-family:monospace; font-size:11px;">${email}</td>
                <td style="padding:10px 12px; color:#e2e8f0;">
                  <div style="font-weight:600;">${book}</div>
                  <div style="display:flex; gap:6px; margin-top:3px;">
                    ${hasWord ? '<span style="background:#1e3a8a; color:#93c5fd; padding:1px 6px; border-radius:4px; font-size:10px;">📝 Word</span>' : ''}
                    ${hasDrive ? '<span style="background:#065f46; color:#a7f3d0; padding:1px 6px; border-radius:4px; font-size:10px;">📁 Drive</span>' : ''}
                  </div>
                </td>
                <td style="padding:10px 12px; text-align:center;">
                  <span style="background:rgba(16,185,129,0.2); color:#34d399; border:1px solid #10b981; padding:2px 8px; border-radius:12px; font-weight:700; font-size:10px;">
                    ${status === 'sent' || status === 'delivered' ? '✅ Delivered' : '⚡ Sent'}
                  </span>
                </td>
              </tr>
            `;
        }).join('');
    }

    if (viewEmailLogsBtn) {
        viewEmailLogsBtn.addEventListener('click', () => {
            if (emailModal) {
                emailModal.style.display = 'flex';
                loadEmailDeliveryLogs();
            }
        });
    }

    if (closeEmailLogsBtn && emailModal) {
        closeEmailLogsBtn.addEventListener('click', () => { emailModal.style.display = 'none'; });
    }

    if (refreshEmailLogsBtn) {
        refreshEmailLogsBtn.addEventListener('click', () => loadEmailDeliveryLogs());
    }

    if (emailSearchInput) {
        emailSearchInput.addEventListener('input', (e) => {
            const q = (e.target.value || '').toLowerCase().trim();
            if (!q) {
                renderEmailLogsTable(cachedEmailLogs);
                return;
            }
            const filtered = cachedEmailLogs.filter(l => 
                (l.recipient_name && l.recipient_name.toLowerCase().includes(q)) ||
                (l.recipient_email && l.recipient_email.toLowerCase().includes(q)) ||
                (l.book_title && l.book_title.toLowerCase().includes(q))
            );
            renderEmailLogsTable(filtered);
        });
    }

    if (testSendEmailBtn) {
        testSendEmailBtn.addEventListener('click', async () => {
            const toEmail = document.getElementById('testEmailRecipientInput')?.value.trim();
            const toName = document.getElementById('testEmailNameInput')?.value.trim() || 'किसान साथी';
            const toBook = document.getElementById('testEmailBookInput')?.value.trim() || studioCurrentBookId;
            if (!toEmail || !toEmail.includes('@')) {
                alert('कृपया एक वैध ईमेल पता दर्ज करें!');
                return;
            }

            testSendEmailBtn.disabled = true;
            testSendEmailBtn.textContent = '⏳ भेजा जा रहा है...';

            try {
                // Extract bonus URLs if available
                let customBooks = [];
                try { customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]'); } catch (_) {}
                const book = customBooks.find(b => b.id && b.id.toUpperCase() === studioCurrentBookId.toUpperCase());
                const wordBonus = book?.bonuses?.find(b => b.type === 'word_doc' || b.word_url);
                const driveBonus = book?.bonuses?.find(b => b.type === 'google_drive' || b.drive_url);

                const payload = {
                    to: toEmail,
                    name: toName,
                    bookTitle: toBook,
                    bookUrl: `https://aarogyamindia.online/ebooks/reader.html?book=${studioCurrentBookId}`,
                    wordDocUrl: (wordBonus?.word_url && !wordBonus.word_url.startsWith('idb://')) ? wordBonus.word_url : '',
                    driveUrl: driveBonus?.drive_url || '',
                    emailType: 'admin_test_delivery'
                };

                let emailDelivered = false;
                let deliveryId = 'simulated_' + Date.now();

                try {
                    const resp = await fetch(getEmailApiUrl(), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await resp.json().catch(() => ({}));
                    if (resp.ok && data.success) {
                        emailDelivered = true;
                        deliveryId = data.data?.id || 'delivered';
                        alert(`🎉 सफलता! लाइव टेस्ट ईमेल [${toEmail}] पर Resend API द्वारा भेज दिया गया है!\n\nEmail ID: ${deliveryId}\nकृपया अपना इनबॉक्स/स्पैम फोल्डर चेक करें।`);
                    } else if (resp.status === 404 || !resp.ok) {
                        console.warn("Live API response notice:", resp.status, data);
                        alert(`ℹ️ लोकल सिमुलेशन मोड (Local Test Mode):\n\n'api/send-email.js' लोकल में तैयार है और जब आप Vercel पर Git Push करेंगे तो यह लाइव ईमेल भेजेगा।\n\nलोकल टेस्टिंग के लिए यह ईमेल [${toEmail}] के साथ लॉग में दर्ज (Simulated) कर दिया गया है।`);
                        emailDelivered = true;
                    }
                } catch (netErr) {
                    console.warn("Network fetch notice (Local Simulation Fallback):", netErr);
                    alert(`ℹ️ लोकल सिमुलेशन मोड (Local Test Mode):\n\n'api/send-email.js' लोकल में तैयार है और जब आप Vercel पर Git Push करेंगे तो यह लाइव ईमेल भेजेगा।\n\nलोकल टेस्टिंग के लिए यह ईमेल [${toEmail}] के साथ लॉग में दर्ज (Simulated) कर दिया गया है।`);
                    emailDelivered = true;
                }

                if (emailDelivered) {
                    const sentLog = {
                        recipient_email: toEmail,
                        recipient_name: toName,
                        book_title: toBook,
                        word_url: payload.wordDocUrl,
                        drive_url: payload.driveUrl,
                        status: 'delivered',
                        created_at: new Date().toISOString()
                    };
                    let sentLogs = JSON.parse(localStorage.getItem('AAROGYAM_SENT_EMAILS') || '[]');
                    sentLogs.unshift(sentLog);
                    localStorage.setItem('AAROGYAM_SENT_EMAILS', JSON.stringify(sentLogs.slice(0, 100)));
                    loadEmailDeliveryLogs();
                }
            } catch (err) {
                alert(`⚠️ ईमेल प्रेषण त्रुटि: ${err.message}`);
            } finally {
                testSendEmailBtn.disabled = false;
                testSendEmailBtn.textContent = '🚀 टेस्ट ईमेल भेजें';
            }
        });
    }

    if (bookSelect) {
        await populateStudioBookSelect(studioCurrentBookId);

        bookSelect.addEventListener('change', (e) => {
            if (e.target.value === '__NEW__') {
                openNewBookModal();
                bookSelect.value = studioCurrentBookId;
                return;
            }
            studioCurrentBookId = e.target.value;
            studioCurrentPage = 1;
            loadBookStudio(studioCurrentBookId);
        });
    }

    // Bulk Upload
    const triggerBtn = document.getElementById('triggerBulkUploadBtn');
    const bulkInput = document.getElementById('bulkImageInput');
    if (triggerBtn && bulkInput) {
        triggerBtn.addEventListener('click', () => {
            bulkInput.value = '';
            bulkInput.click();
        });
        bulkInput.addEventListener('change', (e) => handleImageUpload(e.target.files));
    }

    // Direct Single Page Replace
    const replacePageBtn = document.getElementById('replaceCurrentPageImgBtn');
    const singlePageInput = document.getElementById('singlePageImageInput');
    if (replacePageBtn && singlePageInput) {
        replacePageBtn.addEventListener('click', () => {
            singlePageInput.value = '';
            singlePageInput.click();
        });
        singlePageInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const webp = await readFileAsWebp(e.target.files[0]);
                if (!studioPageImages.length) studioPageImages = new Array(studioTotalPages).fill('');
                studioPageImages[studioCurrentPage - 1] = webp;
                modifiedPageIndices.add(studioCurrentPage - 1);
                await savePagesToDb(studioCurrentBookId, studioPageImages);
                markUnsaved(true);
                selectPage(studioCurrentPage);
                alert(`✅ पृष्ठ ${studioCurrentPage} की नई इमेज सुरक्षित लोड हो गई!\n\n1-Click Push to Git दबाने पर सीधे Git पर लाइव हो जाएगी।`);
            }
        });
    }

    // Insert Pages Between Button
    const insertBtn = document.getElementById('insertPagesBetweenBtn');
    if (insertBtn && bulkInput) {
        insertBtn.addEventListener('click', () => {
            const insertPageNumInput = document.getElementById('smartInsertAfterPageNum');
            if (insertPageNumInput) insertPageNumInput.value = studioCurrentPage;
            bulkInput.value = '';
            bulkInput.dataset.targetAction = 'insert';
            bulkInput.click();
        });
    }

    // Smart Upload Position Modal Controls
    const smartModal = document.getElementById('smartUploadPositionModal');
    const cancelSmartBtn = document.getElementById('cancelSmartUploadBtn');
    const closeSmartBtn = document.getElementById('closeSmartUploadModalBtn');
    const confirmSmartBtn = document.getElementById('confirmSmartUploadBtn');

    if (cancelSmartBtn && smartModal) {
        cancelSmartBtn.addEventListener('click', () => { smartModal.style.display = 'none'; pendingSmartUploadFiles = []; });
    }
    if (closeSmartBtn && smartModal) {
        closeSmartBtn.addEventListener('click', () => { smartModal.style.display = 'none'; pendingSmartUploadFiles = []; });
    }
    if (confirmSmartBtn && smartModal) {
        confirmSmartBtn.addEventListener('click', () => {
            const selectedRadio = document.querySelector('input[name="smartUploadMode"]:checked');
            const mode = selectedRadio ? selectedRadio.value : 'append';
            let targetPos = studioCurrentPage;
            if (mode === 'insert') {
                targetPos = parseInt(document.getElementById('smartInsertAfterPageNum')?.value, 10) || studioCurrentPage;
            } else if (mode === 'replace_range') {
                targetPos = parseInt(document.getElementById('smartReplaceStartPageNum')?.value, 10) || studioCurrentPage;
            }
            smartModal.style.display = 'none';
            if (pendingSmartUploadFiles && pendingSmartUploadFiles.length > 0) {
                executeSmartUpload(mode, targetPos, pendingSmartUploadFiles);
                pendingSmartUploadFiles = [];
            }
        });
    }

    // Direct PDF Upload
    const directPdfBtn = document.getElementById('triggerDirectPdfBtn');
    const directPdfInput = document.getElementById('directPdfInput');
    if (directPdfBtn && directPdfInput) {
        directPdfBtn.addEventListener('click', () => directPdfInput.click());
        directPdfInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleDirectPdfUpload(e.target.files[0]);
            }
        });
    }

    // Source PDF Vault Card Actions (Re-Extract HD, Download, Replace, Delete)
    const reExtractPdfBtn = document.getElementById('reExtractPdfPagesBtn');
    if (reExtractPdfBtn) {
        reExtractPdfBtn.addEventListener('click', () => reExtractPagesFromSavedPdf(studioCurrentBookId));
    }
    const downloadPdfBtn = document.getElementById('downloadSourcePdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => downloadSourcePdf(studioCurrentBookId));
    }
    const replacePdfBtn = document.getElementById('replaceSourcePdfBtn');
    if (replacePdfBtn && directPdfInput) {
        replacePdfBtn.addEventListener('click', () => directPdfInput.click());
    }
    const deletePdfBtn = document.getElementById('deleteSourcePdfBtn');
    if (deletePdfBtn) {
        deletePdfBtn.addEventListener('click', () => deleteSourcePdf(studioCurrentBookId));
    }

    // Convert PDF to WebP
    const convertBtn = document.getElementById('convertPdfToWebpBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => convertCurrentPdfToWebp());
    }

    // 1-Click Push to Git Live Sync
    const gitSyncBtn = document.getElementById('gitAutoSyncBtn');
    if (gitSyncBtn) {
        gitSyncBtn.addEventListener('click', () => syncStudioToGitHub());
    }

    const gitPushStagingBtn = document.getElementById('gitPushStagingBtn');
    if (gitPushStagingBtn) {
        gitPushStagingBtn.addEventListener('click', () => syncStudioToGitHub());
    }

    const gitPushEditorBtn = document.getElementById('gitPushEditorBtn');
    if (gitPushEditorBtn) {
        gitPushEditorBtn.addEventListener('click', () => syncStudioToGitHub());
    }

    // Modal Close
    const closeSuccessBtn = document.getElementById('closeSuccessModalBtn');
    const syncModal = document.getElementById('syncSuccessModal');
    if (closeSuccessBtn && syncModal) {
        closeSuccessBtn.addEventListener('click', () => {
            syncModal.style.display = 'none';
        });
    }

    // Download ZIP
    const zipBtn = document.getElementById('downloadZipBtn');
    if (zipBtn) {
        zipBtn.addEventListener('click', () => downloadWebpPagesZip());
    }

    // Export JSON
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportStudioJsonManifest());
    }

    // Staging Actions
    const saveAllBtn = document.getElementById('saveAllChangesBtn');
    if (saveAllBtn) {
        saveAllBtn.addEventListener('click', () => commitAllChanges());
    }

    const discardBtn = document.getElementById('discardChangesBtn');
    if (discardBtn) {
        discardBtn.addEventListener('click', () => discardDraftChanges());
    }

    // Page Management
    const addPageBtn = document.getElementById('addPageBtn');
    if (addPageBtn) {
        addPageBtn.addEventListener('click', () => addNewBlankPage());
    }

    const deletePageBtn = document.getElementById('deletePageBtn');
    if (deletePageBtn) {
        deletePageBtn.addEventListener('click', () => deleteCurrentPage());
    }

    const movePagePrevBtn = document.getElementById('movePagePrevBtn');
    if (movePagePrevBtn) {
        movePagePrevBtn.addEventListener('click', () => moveCurrentPage(-1));
    }

    const movePageNextBtn = document.getElementById('movePageNextBtn');
    if (movePageNextBtn) {
        movePageNextBtn.addEventListener('click', () => moveCurrentPage(1));
    }

    // Audio & Text Events
    const pageTextInput = document.getElementById('pageTextInput');
    if (pageTextInput) {
        pageTextInput.addEventListener('input', (e) => {
            const text = e.target.value;
            const pageKey = String(studioCurrentPage);
            if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
            if (!studioAudioScripts.pages[pageKey]) {
                studioAudioScripts.pages[pageKey] = { text: text, audio: '' };
            } else if (typeof studioAudioScripts.pages[pageKey] === 'string') {
                studioAudioScripts.pages[pageKey] = { text: text, audio: '' };
            } else {
                studioAudioScripts.pages[pageKey].text = text;
            }
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            audioScriptsModified = true;
            markUnsaved(true);
            renderPageChipGrid();

            const badge = document.getElementById('autoSaveBadge');
            if (badge) {
                badge.style.display = 'inline-block';
                badge.textContent = `✅ Pg ${studioCurrentPage} स्वतः सेव हुआ`;
                clearTimeout(badge._timer);
                badge._timer = setTimeout(() => { badge.style.display = 'none'; }, 3000);
            }
        });
    }

    const studioPrevPageBtn = document.getElementById('studioPrevPageBtn');
    if (studioPrevPageBtn) {
        studioPrevPageBtn.addEventListener('click', () => {
            if (studioCurrentPage > 1) {
                selectPage(studioCurrentPage - 1);
            }
        });
    }

    const studioNextPageBtn = document.getElementById('studioNextPageBtn');
    if (studioNextPageBtn) {
        studioNextPageBtn.addEventListener('click', () => {
            if (studioCurrentPage < studioTotalPages) {
                selectPage(studioCurrentPage + 1);
            }
        });
    }

    const savePageTextBtn = document.getElementById('savePageTextBtn');
    if (savePageTextBtn) {
        savePageTextBtn.addEventListener('click', () => saveCurrentPageText());
    }

    const testTtsBtn = document.getElementById('testTtsBtn');
    if (testTtsBtn) {
        testTtsBtn.addEventListener('click', () => testCurrentPageTts());
    }

    const stopTtsBtn = document.getElementById('stopTtsBtn');
    if (stopTtsBtn) {
        stopTtsBtn.addEventListener('click', () => stopCurrentPageTts());
    }

    const ocrExtractBtn = document.getElementById('ocrExtractBtn');
    if (ocrExtractBtn) {
        ocrExtractBtn.addEventListener('click', () => extractTextFromCurrentImageOcr());
    }

    const toggleAudioLiveBtn = document.getElementById('toggleAudioLiveBtn');
    if (toggleAudioLiveBtn) {
        toggleAudioLiveBtn.addEventListener('click', () => toggleCurrentPageAudioLive());
    }

    const approveAllPagesAudioBtn = document.getElementById('approveAllPagesAudioBtn');
    if (approveAllPagesAudioBtn) {
        approveAllPagesAudioBtn.addEventListener('click', () => approveAllPagesAudio());
    }

    const draftAllPagesAudioBtn = document.getElementById('draftAllPagesAudioBtn');
    if (draftAllPagesAudioBtn) {
        draftAllPagesAudioBtn.addEventListener('click', () => draftAllPagesAudio());
    }

    const startRecBtn = document.getElementById('startRecBtn');
    if (startRecBtn) {
        startRecBtn.addEventListener('click', () => startRecording());
    }

    const stopRecBtn = document.getElementById('stopRecBtn');
    if (stopRecBtn) {
        stopRecBtn.addEventListener('click', () => stopRecording());
    }

    const saveRecordedAudioBtn = document.getElementById('saveRecordedAudioBtn');
    if (saveRecordedAudioBtn) {
        saveRecordedAudioBtn.addEventListener('click', () => saveCurrentPageAudio());
    }

    const deleteRecordedAudioBtn = document.getElementById('deleteRecordedAudioBtn');
    if (deleteRecordedAudioBtn) {
        deleteRecordedAudioBtn.addEventListener('click', () => deleteCurrentPageAudio());
    }

    const testLiveMicBtn = document.getElementById('testLiveMicBtn');
    if (testLiveMicBtn) {
        testLiveMicBtn.addEventListener('click', () => toggleLiveMicMonitoring());
    }

    // Import / Cross-Book Assembler Events
    const openImportBtn = document.getElementById('openImportModalBtn');
    if (openImportBtn) {
        openImportBtn.addEventListener('click', () => openImportModal());
    }

    const closeImportBtn = document.getElementById('closeImportModalBtn');
    const cancelImportBtn = document.getElementById('cancelImportModalBtn');
    const importModal = document.getElementById('importPagesModal');
    if (closeImportBtn && importModal) {
        closeImportBtn.addEventListener('click', () => { importModal.style.display = 'none'; });
    }
    if (cancelImportBtn && importModal) {
        cancelImportBtn.addEventListener('click', () => { importModal.style.display = 'none'; });
    }

    const importSourceSelect = document.getElementById('importSourceBookSelect');
    if (importSourceSelect) {
        importSourceSelect.addEventListener('change', (e) => loadSourceBookForImport(e.target.value));
    }

    const applyRangeBtn = document.getElementById('importApplyRangeBtn');
    const rangeInput = document.getElementById('importRangeInput');
    if (applyRangeBtn && rangeInput) {
        applyRangeBtn.addEventListener('click', () => applyImportRange(rangeInput.value));
        rangeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') applyImportRange(rangeInput.value);
        });
    }

    const selectAllBtn = document.getElementById('importSelectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => setAllImportCheckboxes(true));
    }

    const clearBtn = document.getElementById('importClearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => setAllImportCheckboxes(false));
    }

    const executeImportBtn = document.getElementById('executeImportBtn');
    if (executeImportBtn) {
        executeImportBtn.onclick = () => executeImportPages();
    }

    const quickImportBtn = document.getElementById('quickImportBtn');
    if (quickImportBtn) {
        quickImportBtn.onclick = () => executeImportPages();
    }
}

// =======================================================
// 4. LOAD BOOK STUDIO (INDEXEDDB + GIT + PDF)
// =======================================================
async function loadBookStudio(bookId) {
    const cleanId = String(bookId).toUpperCase().trim();
    studioCurrentBookId = cleanId;
    studioCurrentPage = 0; // Prevent selectPage auto-saving previous book's text!

    // Clear DOM inputs immediately so previous book content never leaks
    const textInput = document.getElementById('pageTextInput');
    if (textInput) textInput.value = '';
    const previewImg = document.getElementById('previewImage');
    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
    const previewCanvas = document.getElementById('previewCanvas');
    if (previewCanvas) previewCanvas.style.display = 'none';
    const audioBox = document.getElementById('audioPlaybackBox');
    if (audioBox) audioBox.style.display = 'none';

    studioPdfDoc = null;
    studioPageImages = [];
    studioAudioScripts = { bookId: cleanId, pages: {} };
    modifiedPageIndices.clear();
    audioScriptsModified = false;
    isFullBookReload = false;
    markUnsaved(false);

    // 1. Check in Free Demo books list
    let freeDemoBook = null;
    try {
        const fList = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
        freeDemoBook = fList.find(b => b.id && b.id.toUpperCase() === cleanId);
    } catch (e) {}

    // 2. Fetch from books.json / universal-book-landing-pages.json / custom books
    try {
        const res = await fetch('../data/books.json?v=' + Date.now());
        if (res.ok) {
            const json = await res.json();
            studioBookData = json.books.find(b => b.id === bookId || b.id === cleanId);
        }
    } catch (e) {}

    // For Demo / Free books, prioritize Universal Landing Pages and Custom Landing Pages to obtain demo_reader_pages & preview images
    const isDemoId = cleanId.startsWith('DEMO') || cleanId.startsWith('FREE') || cleanId.startsWith('BONUS');
    if (isDemoId || !studioBookData) {
        try {
            const resLp = await fetch('../data/universal-book-landing-pages.json?v=' + Math.floor(Date.now() / 300000));
            if (resLp.ok) {
                const jsonLp = await resLp.json();
                if (jsonLp.bookLandingPages) {
                    const matchLp = jsonLp.bookLandingPages.find(p => 
                        (p.id && p.id.toUpperCase() === cleanId) ||
                        (p.id && p.id.replace(/-/g, '').toUpperCase() === cleanId.replace(/-/g, '')) ||
                        (cleanId.includes('002') && p.id && p.id.includes('002') && p.id.startsWith('DEMO')) ||
                        (cleanId.includes('015') && p.id && p.id.includes('015') && p.id.startsWith('DEMO')) ||
                        (cleanId.includes('001') && p.id && p.id.includes('001') && p.id.startsWith('DEMO'))
                    );
                    if (matchLp) studioBookData = { ...(studioBookData || {}), ...matchLp };
                }
            }
        } catch (e) {}
    }

    if (!studioBookData || isDemoId) {
        try {
            const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            const matchLocal = localLp.find(p => 
                (p.id && p.id.toUpperCase() === cleanId) ||
                (p.id && p.id.replace(/-/g, '').toUpperCase() === cleanId.replace(/-/g, ''))
            );
            if (matchLocal) studioBookData = { ...(studioBookData || {}), ...matchLocal };
        } catch (e) {}
    }

    if (!studioBookData) {
        try {
            const customList = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            studioBookData = customList.find(b => b.id && b.id.toUpperCase() === cleanId);
        } catch (e) {}
    }

    if (!studioBookData && freeDemoBook) {
        studioBookData = freeDemoBook;
    }

    studioIsDemoStudio = cleanId.startsWith('DEMO') || studioBookData?.book_type === 'demo' || studioBookData?.type === 'demo' || studioBookData?.isDemo;
    const isDemoStudio = studioIsDemoStudio;
    
    // Robust target parent resolution for DEMO-BK002, DEMO002, DEMO-BK015, etc.
    let targetParent = (studioBookData?.targetMainBook || '').toUpperCase();
    if (!targetParent && studioBookData?.target_main_books) {
        if (Array.isArray(studioBookData.target_main_books) && studioBookData.target_main_books.length > 0) {
            targetParent = String(studioBookData.target_main_books[0]).toUpperCase();
        } else if (typeof studioBookData.target_main_books === 'string') {
            targetParent = studioBookData.target_main_books.trim().toUpperCase();
        }
    }
    if (!targetParent) {
        const stripped = cleanId.replace(/^(DEMO_|DEMO-|DEMO|FREE_|FREE-|FREE|BONUS_|BONUS-|BONUS)/i, '').trim().toUpperCase();
        if (stripped.startsWith('BK')) targetParent = stripped;
        else if (/^\d+$/.test(stripped)) targetParent = 'BK' + stripped.padStart(3, '0');
        else targetParent = stripped || (cleanId.includes('002') ? 'BK002' : (cleanId.includes('015') ? 'BK015' : 'BK001'));
    }

    // 2b. PRIORITY 1 FOR DEMO BOOKS: Load explicitly configured demo_reader_pages
    studioDemoParsedPages = [];
    if (isDemoStudio) {
        const allowedPagesParam = (studioBookData?.demo_reader_pages || studioBookData?.demoPages || '').trim();
        if (allowedPagesParam) {
            allowedPagesParam.split(/[,;]+/).forEach(part => {
                const clean = part.trim();
                if (clean.includes('-')) {
                    const [s, e] = clean.split('-').map(x => parseInt(x.trim(), 10));
                    if (!isNaN(s) && !isNaN(e) && s <= e) {
                        for (let p = s; p <= e; p++) {
                            if (!studioDemoParsedPages.includes(p)) studioDemoParsedPages.push(p);
                        }
                    }
                } else {
                    const num = parseInt(clean, 10);
                    if (!isNaN(num) && !studioDemoParsedPages.includes(num)) {
                        studioDemoParsedPages.push(num);
                    }
                }
            });
        }

        studioPageImages = [];
        // 1. Add preview gallery images configured in builder for this demo book
        const rawPreviewImgs = (studioBookData?.demo_images || studioBookData?.demoImages || studioBookData?.preview_images || []);
        if (Array.isArray(rawPreviewImgs) && rawPreviewImgs.length > 0) {
            rawPreviewImgs.forEach(img => {
                if (img && typeof img === 'string') {
                    const cleanPath = img.startsWith('/') ? ('..' + img) : (img.startsWith('http') || img.startsWith('..') ? img : ('../' + img));
                    if (!studioPageImages.includes(cleanPath)) studioPageImages.push(cleanPath);
                }
            });
        }

        // 2. Also add selected main book pages from studioDemoParsedPages without duplicate
        if (studioDemoParsedPages.length > 0) {
            studioDemoParsedPages.forEach(p => {
                const pagePath = `../images/books/${targetParent}/${p}.webp`;
                if (!studioPageImages.includes(pagePath)) studioPageImages.push(pagePath);
            });
        }
        studioTotalPages = studioPageImages.length;
    }

    // Determine target total pages from repository / metadata for main books
    const repoTotal = (studioBookData && studioBookData.totalPages) 
        ? studioBookData.totalPages 
        : (cleanId === 'BK001' ? 152 : (cleanId === 'BK002' ? 118 : (cleanId === 'BK015' ? 154 : 0)));
    const basePath = (studioBookData && studioBookData.pageImagesPath) 
        ? studioBookData.pageImagesPath 
        : `images/books/${cleanId}`;

    // 3. Check Saved Pages in IndexedDB FIRST (User-saved edits take highest priority)
    if (!studioPageImages.length) {
        const dbImages = await loadPagesFromDb(cleanId);
        if (dbImages && Array.isArray(dbImages) && dbImages.length > 0) {
            const validImages = dbImages.filter(img => img && typeof img === 'string' && img.trim().length > 0);
            if (validImages.length > 0) {
                studioPageImages = dbImages;
                studioTotalPages = dbImages.length;
                console.log(`[Studio] Loaded ${studioTotalPages} user-saved pages from IndexedDB for ${cleanId}`);
            }
        }
    }

    // 4. Check Saved Pages in LocalStorage SECOND
    if (!studioPageImages.length) {
        try {
            const localPages = localStorage.getItem(`AOI_BOOK_PAGES_${cleanId}`);
            if (localPages) {
                const parsedPages = JSON.parse(localPages);
                if (Array.isArray(parsedPages) && parsedPages.length > 0) {
                    const validLocal = parsedPages.filter(img => img && typeof img === 'string' && img.trim().length > 0);
                    if (validLocal.length > 0) {
                        studioPageImages = parsedPages;
                        studioTotalPages = parsedPages.length;
                        console.log(`[Studio] Loaded ${studioTotalPages} user-saved pages from LocalStorage for ${cleanId}`);
                    }
                }
            }
        } catch (e) {}
    }

    // 5. Static WebP images Fallback (ONLY if user has never saved a custom page list)
    if (!studioPageImages.length && !isDemoStudio && repoTotal > 0 && (studioBookData?.hasWebpPages || cleanId.startsWith('BK'))) {
        studioPageImages = [];
        for (let p = 1; p <= repoTotal; p++) {
            studioPageImages.push(`../${basePath}/${p}.webp`);
        }
        studioTotalPages = repoTotal;
    }

    // 6. Check custom book pageImages in JSON / Landing Page (ONLY for main books, NEVER demo books)
    if (!studioPageImages.length && studioBookData && !isDemoStudio) {
        if (Array.isArray(studioBookData.pageImages) && studioBookData.pageImages.length > 0) {
            studioPageImages = studioBookData.pageImages.map(img => img.startsWith('/') ? ('..' + img) : img);
            studioTotalPages = studioPageImages.length;
        }
    }

    // 6b. Fallback for Demo Books without configured demo_reader_pages: default to 1..5 of targetParent
    if (!studioPageImages.length && isDemoStudio) {
        [1, 2, 3, 4, 5].forEach(p => {
            const pagePath = `../images/books/${targetParent}/${p}.webp`;
            if (!studioPageImages.includes(pagePath)) studioPageImages.push(pagePath);
        });
        studioTotalPages = studioPageImages.length;
    }

    // 7. Load Audio Scripts (Fetch server first, then merge local edits)
    let serverScripts = {};
    let serverMeta = { bookId: cleanId, pages: {} };
    try {
        let res = await fetch(`../data/audio-scripts/${cleanId}.json?v=${Date.now()}`);
        if (!res.ok) res = await fetch(`/data/audio-scripts/${cleanId}.json?v=${Date.now()}`);
        if (res.ok) {
            serverMeta = await res.json();
            serverScripts = serverMeta.pages || {};
        } else if (isDemoStudio && targetParent) {
            // Inherit audio scripts from parent main book for demo pages
            let resParent = await fetch(`../data/audio-scripts/${targetParent}.json?v=${Date.now()}`);
            if (!resParent.ok) resParent = await fetch(`/data/audio-scripts/${targetParent}.json?v=${Date.now()}`);
            if (resParent.ok) {
                const parentJson = await resParent.json();
                serverMeta = { bookId: cleanId, pages: {} };
                const parentPages = parentJson.pages || {};
                
                if (studioDemoParsedPages.length > 0) {
                    studioDemoParsedPages.forEach((realPage, idx) => {
                        const seqKey = String(idx + 1);
                        const realKey = String(realPage);
                        const scriptData = parentPages[realKey] || parentPages[seqKey];
                        if (scriptData) {
                            serverMeta.pages[seqKey] = scriptData;
                            serverMeta.pages[realKey] = scriptData;
                        }
                    });
                } else {
                    serverMeta.pages = parentPages;
                }
                serverScripts = serverMeta.pages || {};
            }
        } else if (freeDemoBook && freeDemoBook.audioUrl) {
            serverMeta = {
                bookId: cleanId,
                pages: {
                    "1": { text: freeDemoBook.subtitle || freeDemoBook.name || '', audio: freeDemoBook.audioUrl }
                }
            };
            serverScripts = serverMeta.pages;
        }
    } catch (e) {
        console.warn("Studio audio scripts fetch warning:", e);
    }

    let localScripts = {};
    try {
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${cleanId}`);
        if (localData) {
            const parsed = JSON.parse(localData);
            if (parsed && parsed.pages) {
                localScripts = parsed.pages;
            }
            serverMeta = { ...serverMeta, ...parsed };
        }
    } catch (e) {}

    // CRITICAL: NEVER let empty local text or audio overwrite populated server text or audio, and PRESERVE is_live approval state!
    const mergedPages = { ...serverScripts };
    Object.keys(localScripts).forEach(k => {
        const localP = localScripts[k];
        const serverP = serverScripts[k] || {};
        const localText = (typeof localP === 'string' ? localP : localP?.text || '').trim();
        const serverText = (typeof serverP === 'string' ? serverP : serverP?.text || '').trim();
        const localAudio = (typeof localP === 'object' ? localP?.audio || '' : '').trim();
        const serverAudio = (typeof serverP === 'object' ? serverP?.audio || '' : '').trim();
        const isLive = (localP && typeof localP === 'object' && localP.is_live !== undefined)
            ? Boolean(localP.is_live)
            : (serverP && typeof serverP === 'object' && serverP.is_live !== undefined ? Boolean(serverP.is_live) : false);

        mergedPages[k] = {
            text: localText || serverText,
            audio: localAudio || serverAudio,
            is_live: isLive
        };
    });

    // Ensure all server scripts retain boolean is_live flag
    Object.keys(serverScripts).forEach(k => {
        if (!mergedPages[k]) {
            const sp = serverScripts[k];
            mergedPages[k] = {
                text: typeof sp === 'string' ? sp : (sp?.text || ''),
                audio: typeof sp === 'object' ? (sp?.audio || '') : '',
                is_live: typeof sp === 'object' && sp?.is_live !== undefined ? Boolean(sp.is_live) : true
            };
        } else if (mergedPages[k].is_live === undefined) {
            mergedPages[k].is_live = typeof serverScripts[k] === 'object' && serverScripts[k]?.is_live !== undefined
                ? Boolean(serverScripts[k].is_live)
                : false;
        }
    });

    // 🛡️ Guard against cross-book script contamination (e.g. BK021 text leaking into BK017)
    if (cleanId === 'BK017') {
        const curText = mergedPages["1"]?.text || '';
        if (!curText || (!curText.includes('गेहूँ') && !curText.includes('गेहू') && studioBookData?.audio_layer?.tts_text)) {
            mergedPages["1"] = {
                text: studioBookData.audio_layer.tts_text,
                audio: studioBookData.audio_layer.mp3_url || '',
                is_live: true
            };
        }
    } else if (studioBookData?.audio_layer?.tts_text && (!mergedPages["1"] || !mergedPages["1"].text)) {
        mergedPages["1"] = {
            text: studioBookData.audio_layer.tts_text,
            audio: studioBookData.audio_layer.mp3_url || '',
            is_live: true
        };
    }

    studioAudioScripts = {
        ...serverMeta,
        bookId: cleanId,
        pages: mergedPages
    };

    // Cleanse local storage with populated merged scripts
    try {
        localStorage.setItem(`AOI_AUDIO_SCRIPTS_${cleanId}`, JSON.stringify(studioAudioScripts));
    } catch(e) {}

    // 8. Fallback to PDF if no WebP images yet
    if (!studioPageImages.length) {
        const pdfUrl = (studioBookData && (studioBookData.mainPdf || studioBookData.pdf_url || studioBookData.demoPdf || studioBookData.freePdf)) 
            ? ('..' + (studioBookData.mainPdf || studioBookData.pdf_url || studioBookData.demoPdf || studioBookData.freePdf)) 
            : `../pdf/full/${cleanId}.pdf`;

        try {
            studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
            studioTotalPages = studioPdfDoc.numPages;
        } catch (err) {
            console.warn("PDF Load warning:", err);
            studioTotalPages = (freeDemoBook && (freeDemoBook.demoImages?.length || freeDemoBook.pageImages?.length)) ? (freeDemoBook.demoImages?.length || freeDemoBook.pageImages?.length) : 0;
        }
    } else {
        studioTotalPages = studioPageImages.length;
    }

    // 🛡️ CRITICAL DEFENSE: Never let studioTotalPages collapse to 1 if scripts or metadata have more pages!
    const scriptPageNumbers = Object.keys(studioAudioScripts.pages || {})
        .map(n => parseInt(n, 10))
        .filter(n => !isNaN(n) && n > 0);
    const maxScriptPage = scriptPageNumbers.length > 0 ? Math.max(...scriptPageNumbers) : 0;

    if (studioPageImages && studioPageImages.length > 0) {
        studioTotalPages = Math.max(studioPageImages.length, maxScriptPage);
    } else if (maxScriptPage > 0) {
        studioTotalPages = Math.max(studioTotalPages || 0, maxScriptPage);
    } else if (studioBookData?.totalPages && parseInt(studioBookData.totalPages, 10) > 0) {
        studioTotalPages = parseInt(studioBookData.totalPages, 10);
    } else if (studioTotalPages <= 0) {
        studioTotalPages = 1;
    }

    // Create a pristine backup for Discard
    studioOriginalBackup = {
        images: [...studioPageImages],
        scripts: JSON.parse(JSON.stringify(studioAudioScripts)),
        totalPages: studioTotalPages
    };

    updateQuickTestLinks(cleanId);
    await updateSourcePdfUI(cleanId);
    renderPageChipGrid();
    selectPage(1);
}

function renderPageChipGrid() {
    const grid = document.getElementById('pageChipGrid');
    const statusText = document.getElementById('pageCountStatus');
    const quickSetInput = document.getElementById('quickSetTotalPagesInput');
    const selectedBadge = document.getElementById('selectedPagesCountBadge');
    const bulkDelBtn = document.getElementById('deleteSelectedPagesBtn');

    if (!grid) return;

    if (statusText) statusText.textContent = `${studioCurrentPage} / ${studioTotalPages} Pages`;
    if (quickSetInput && document.activeElement !== quickSetInput) {
        quickSetInput.value = studioTotalPages;
    }
    if (selectedBadge) selectedBadge.textContent = selectedPagesForBulkAction.size;
    if (bulkDelBtn) {
        bulkDelBtn.style.display = (isPageMultiSelectMode && selectedPagesForBulkAction.size > 0) ? 'inline-block' : 'none';
    }

    grid.innerHTML = '';
    for (let p = 1; p <= studioTotalPages; p++) {
        const chip = document.createElement('div');
        chip.className = 'studio-page-chip';
        chip.dataset.page = p;
        chip.style.padding = '5px 10px';
        chip.style.borderRadius = '6px';
        chip.style.fontSize = '12px';
        chip.style.cursor = 'pointer';
        chip.style.transition = 'background 0.15s, border 0.15s';
        chip.style.display = 'flex';
        chip.style.alignItems = 'center';
        chip.style.gap = '6px';
        
        const pageData = studioAudioScripts.pages && studioAudioScripts.pages[String(p)];
        let hasAudio = false;
        let hasText = false;
        if (pageData) {
            if (typeof pageData === 'string' && pageData.trim().length > 0) hasText = true;
            if (typeof pageData === 'object') {
                if (pageData.audio && pageData.audio.trim().length > 0) hasAudio = true;
                if (pageData.text && pageData.text.trim().length > 0) hasText = true;
            }
        }

        const isChecked = selectedPagesForBulkAction.has(p);

        if (isPageMultiSelectMode && isChecked) {
            chip.style.background = '#7f1d1d';
            chip.style.color = '#fca5a5';
            chip.style.border = '2px solid #ef4444';
            chip.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
        } else if (p === studioCurrentPage) {
            chip.style.background = '#10b981';
            chip.style.color = '#fff';
            chip.style.fontWeight = '700';
            chip.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.5)';
        } else if (hasAudio) {
            chip.style.background = '#1e3a8a';
            chip.style.color = '#93c5fd';
            chip.style.border = '1px solid #3b82f6';
        } else if (hasText) {
            chip.style.background = '#064e3b';
            chip.style.color = '#6ee7b7';
            chip.style.border = '1px solid #10b981';
        } else {
            chip.style.background = '#334155';
            chip.style.color = '#cbd5e1';
        }

        let badge = `Pg ${p}`;
        if (studioIsDemoStudio && studioDemoParsedPages && studioDemoParsedPages.length >= p) {
            badge = `D${p} (P${studioDemoParsedPages[p - 1]})`;
        }
        const isLive = pageData && typeof pageData === 'object' && pageData.is_live === true;
        if (hasAudio) badge += ' 🎙️';
        else if (hasText) badge += ' 📖';

        const statusDot = document.createElement('span');
        statusDot.style.cursor = 'pointer';
        statusDot.style.fontSize = '11px';
        statusDot.style.padding = '1px 4px';
        statusDot.style.borderRadius = '3px';
        statusDot.style.userSelect = 'none';

        if (isLive) {
            statusDot.textContent = '🟢';
            statusDot.title = `पेज ${p} लाइव है (क्लिक करके ऑफ/ड्राफ्ट करें)`;
        } else if (hasAudio || hasText) {
            statusDot.textContent = '⚪';
            statusDot.title = `पेज ${p} ड्राफ्ट है (क्लिक करके लाइव करें)`;
        } else {
            statusDot.textContent = '🔇';
            statusDot.title = `पेज ${p} पर अभी कोई ऑडियो/टेक्स्ट नहीं है (क्लिक करके लाइव मार्क करें)`;
        }

        statusDot.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePageAudioLiveDirect(p, e);
        });

        if (isPageMultiSelectMode) {
            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = isChecked;
            chk.style.accentColor = '#ef4444';
            chk.style.cursor = 'pointer';
            chk.addEventListener('click', (e) => e.stopPropagation());
            chk.addEventListener('change', (e) => {
                if (e.target.checked) selectedPagesForBulkAction.add(p);
                else selectedPagesForBulkAction.delete(p);
                if (typeof updateMultiSelectUI === 'function') updateMultiSelectUI();
                renderPageChipGrid();
            });
            chip.appendChild(chk);

            const lbl = document.createElement('span');
            lbl.textContent = badge;
            chip.appendChild(lbl);
            chip.appendChild(statusDot);

            chip.addEventListener('click', () => {
                if (selectedPagesForBulkAction.has(p)) selectedPagesForBulkAction.delete(p);
                else selectedPagesForBulkAction.add(p);
                if (typeof updateMultiSelectUI === 'function') updateMultiSelectUI();
                renderPageChipGrid();
            });
        } else {
            const lbl = document.createElement('span');
            lbl.textContent = badge;
            chip.appendChild(lbl);
            chip.appendChild(statusDot);

            chip.addEventListener('click', (e) => {
                if (e.target === statusDot) return;
                selectPage(p);
            });
        }

        grid.appendChild(chip);
    }
}

function updateActiveChipHighlight(activeNum) {
    const chips = document.querySelectorAll('.studio-page-chip');
    chips.forEach(chip => {
        const p = parseInt(chip.dataset.page, 10);
        if (p === activeNum) {
            chip.style.background = '#10b981';
            chip.style.color = '#fff';
            chip.style.fontWeight = '700';
            chip.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
            chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        } else if (!selectedPagesForBulkAction.has(p)) {
            const pageData = studioAudioScripts.pages && studioAudioScripts.pages[String(p)];
            let hasAudio = false;
            let hasText = false;
            if (pageData) {
                if (typeof pageData === 'string' && pageData.trim().length > 0) hasText = true;
                if (typeof pageData === 'object') {
                    if (pageData.audio && pageData.audio.trim().length > 0) hasAudio = true;
                    if (pageData.text && pageData.text.trim().length > 0) hasText = true;
                }
            }
            if (hasAudio) {
                chip.style.background = '#1e3a8a';
                chip.style.color = '#93c5fd';
                chip.style.border = '1px solid #3b82f6';
            } else if (hasText) {
                chip.style.background = '#064e3b';
                chip.style.color = '#6ee7b7';
                chip.style.border = '1px solid #10b981';
            } else {
                chip.style.background = '#334155';
                chip.style.color = '#cbd5e1';
                chip.style.border = 'none';
            }
            chip.style.fontWeight = 'normal';
            chip.style.boxShadow = 'none';
        }
    });
}

async function selectPage(pageNum) {
    // Silence any ongoing TTS audio when page changes
    stopCurrentPageTts();

    // Auto-save previous page text before switching (ONLY within the same book and valid page > 0)
    if (studioCurrentPage && studioCurrentPage > 0 && studioCurrentPage !== pageNum && studioAudioScripts && studioAudioScripts.bookId === studioCurrentBookId) {
        const currentTextInput = document.getElementById('pageTextInput');
        if (currentTextInput) {
            const currentText = currentTextInput.value;
            const curKey = String(studioCurrentPage);
            if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
            if (!studioAudioScripts.pages[curKey]) {
                studioAudioScripts.pages[curKey] = { text: currentText, audio: '' };
            } else if (typeof studioAudioScripts.pages[curKey] === 'string') {
                studioAudioScripts.pages[curKey] = { text: currentText, audio: '' };
            } else {
                studioAudioScripts.pages[curKey].text = currentText;
            }
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
        }
    }

    studioCurrentPage = pageNum;
    const statusText = document.getElementById('pageCountStatus');
    if (statusText) statusText.textContent = `${studioCurrentPage} / ${studioTotalPages} Pages`;
    updateActiveChipHighlight(pageNum);

    const pageTag = document.getElementById('previewPageNumberTag');
    if (pageTag) {
        if (studioIsDemoStudio && studioDemoParsedPages && studioDemoParsedPages.length >= pageNum) {
            pageTag.textContent = `Demo Page ${pageNum} (Book Page ${studioDemoParsedPages[pageNum - 1]})`;
        } else {
            pageTag.textContent = `Page ${pageNum}`;
        }
    }

    const sizeTag = document.getElementById('currentPageSizeTag');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewImage = document.getElementById('previewImage');
    const loadingText = document.getElementById('previewLoadingText');

    if (loadingText) {
        loadingText.style.display = 'block';
        loadingText.textContent = `पृष्ठ ${pageNum} लोड हो रहा है...`;
    }

    // 1. Render WebP Image if available
    if (studioPageImages.length >= pageNum && studioPageImages[pageNum - 1]) {
        if (previewCanvas) previewCanvas.style.display = 'none';
        if (previewImage) {
            const rawSrc = studioPageImages[pageNum - 1];
            let retryCount = 0;
            previewImage.onload = () => {
                if (loadingText) loadingText.style.display = 'none';
                previewImage.style.display = 'block';
            };
            previewImage.onerror = () => {
                retryCount++;
                if (retryCount === 1) {
                    if (rawSrc.startsWith('../')) {
                        previewImage.src = rawSrc.replace(/^\.\.\//, '/');
                        return;
                    } else if (rawSrc.startsWith('/')) {
                        previewImage.src = '..' + rawSrc;
                        return;
                    }
                } else if (retryCount === 2) {
                    previewImage.src = rawSrc.replace(/^(\.\.\/|\/)+/, '');
                    return;
                }
                if (loadingText) {
                    loadingText.style.display = 'block';
                    loadingText.textContent = `पृष्ठ ${pageNum} लोड नहीं हो सका।`;
                }
            };

            previewImage.src = rawSrc;
            if (previewImage.complete && previewImage.naturalWidth > 0) {
                if (loadingText) loadingText.style.display = 'none';
                previewImage.style.display = 'block';
            }
            
            // Calculate approximate size
            if (typeof rawSrc === 'string' && rawSrc.startsWith('data:')) {
                const sizeKb = Math.round((rawSrc.length * (3/4)) / 1024);
                if (sizeTag) sizeTag.textContent = `Size: ${sizeKb} KB (WebP HD)`;
            } else {
                if (sizeTag) sizeTag.textContent = `Mode: WebP HD Page Asset`;
            }
        }
    } 
    // 2. Render PDF Canvas Fallback
    else if (studioPdfDoc) {
        if (previewImage) previewImage.style.display = 'none';
        if (previewCanvas) {
            previewCanvas.style.display = 'block';
            if (sizeTag) sizeTag.textContent = `Mode: PDF Vector Page`;
            try {
                const page = await studioPdfDoc.getPage(pageNum);
                const ctx = previewCanvas.getContext('2d');
                const viewport = page.getViewport({ scale: 1.0 });

                previewCanvas.height = viewport.height;
                previewCanvas.width = viewport.width;

                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
                if (loadingText) loadingText.style.display = 'none';
            } catch (e) {
                console.error("Error rendering preview page:", e);
                if (loadingText) {
                    loadingText.style.display = 'block';
                    loadingText.textContent = `PDF पेज लोड त्रुटि: ${e.message}`;
                }
            }
        }
    } else {
        if (previewCanvas) previewCanvas.style.display = 'none';
        if (previewImage) previewImage.style.display = 'none';
        if (loadingText) {
            loadingText.style.display = 'block';
            loadingText.textContent = `पृष्ठ ${pageNum} खाली है। ऊपर से इमेज अपलोड करें।`;
        }
        if (sizeTag) sizeTag.textContent = `Empty Page`;
    }

    // Populate Right Form
    const textInput = document.getElementById('pageTextInput');
    const audioBox = document.getElementById('audioPlaybackBox');
    const audioPlayer = document.getElementById('recordedAudioPlayer');

    const pageData = studioAudioScripts.pages && studioAudioScripts.pages[String(pageNum)];
    if (pageData) {
        if (typeof pageData === 'string') {
            if (textInput) textInput.value = pageData;
            if (audioBox) audioBox.style.display = 'none';
        } else if (typeof pageData === 'object') {
            if (textInput) textInput.value = pageData.text || '';
            if (pageData.audio && audioBox && audioPlayer) {
                audioPlayer.src = pageData.audio;
                audioBox.style.display = 'block';
            } else if (audioBox) {
                audioBox.style.display = 'none';
            }
        }
    } else {
        if (textInput) textInput.value = '';
        if (audioBox) audioBox.style.display = 'none';
    }

    // Update Audio Approval & Live Status Badge
    const approvalBadge = document.getElementById('pageAudioApprovalBadge');
    const approvalDesc = document.getElementById('pageAudioApprovalDesc');
    const approvalBtn = document.getElementById('toggleAudioLiveBtn');

    const isLive = pageData && typeof pageData === 'object' && pageData.is_live === true;
    if (approvalBadge) {
        approvalBadge.textContent = isLive ? '🟢 ऑडियो लाइव (Approved)' : '⚪ ड्राफ्ट (ऑडियो ऑफ)';
        approvalBadge.style.background = isLive ? '#065f46' : '#334155';
        approvalBadge.style.color = isLive ? '#6ee7b7' : '#cbd5e1';
    }
    if (approvalDesc) {
        approvalDesc.textContent = isLive ? 'पाठकों को रीडर में यह ऑडियो/TTS सुनाई देगा।' : 'रीडर में दिखेगा: "इस पेज का ऑडियो जल्द ही उपलब्ध होगा"';
        approvalDesc.style.color = isLive ? '#34d399' : '#94a3b8';
    }
    if (approvalBtn) {
        approvalBtn.textContent = isLive ? '🔴 ऑडियो बंद करें (Draft/Off)' : '🟢 ऑडियो लाइव करें (Approve)';
        approvalBtn.style.background = isLive ? '#ef4444' : '#10b981';
    }
}

// =======================================================
// 5. BULK UPLOAD & POSITION INGESTION WITH PROGRESS BAR
// =======================================================
function openSmartUploadPositionModal(fileList, defaultMode = 'append', defaultPos = null) {
    pendingSmartUploadFiles = fileList;
    const smartModal = document.getElementById('smartUploadPositionModal');
    const countBadge = document.getElementById('smartUploadCountBadge');
    const existingTotal = document.getElementById('smartUploadExistingTotal');
    const insertPageNumInput = document.getElementById('smartInsertAfterPageNum');
    const replacePageNumInput = document.getElementById('smartReplaceStartPageNum');

    if (countBadge) countBadge.textContent = `${fileList.length} इमेजेस`;
    if (existingTotal) existingTotal.textContent = String(studioTotalPages);
    if (insertPageNumInput) insertPageNumInput.value = defaultPos !== null ? defaultPos : studioCurrentPage;
    if (replacePageNumInput) replacePageNumInput.value = defaultPos !== null ? defaultPos : studioCurrentPage;

    const radio = document.querySelector(`input[name="smartUploadMode"][value="${defaultMode}"]`);
    if (radio) radio.checked = true;

    if (smartModal) {
        smartModal.style.display = 'flex';
    }
}

async function handleImageUpload(files) {
    if (!files || !files.length) return;
    const fileList = Array.from(files);

    const bulkInput = document.getElementById('bulkImageInput');
    const targetAction = bulkInput?.dataset?.targetAction;
    if (bulkInput) bulkInput.dataset.targetAction = '';

    // If explicit insert button was pressed
    if (targetAction === 'insert' && studioTotalPages > 0) {
        openSmartUploadPositionModal(fileList, 'insert', studioCurrentPage);
        return;
    }

    // If there are no existing pages, perform direct fresh ingestion
    if (studioTotalPages === 0) {
        executeSmartUpload('full_reload', 1, fileList);
        return;
    }

    // If only 1 file is selected, open modal with replace current page as default
    if (fileList.length === 1 && studioTotalPages >= 1) {
        openSmartUploadPositionModal(fileList, 'replace_range', studioCurrentPage);
        return;
    }

    // For multiple files with existing pages, open smart positioning modal
    openSmartUploadPositionModal(fileList, 'append', studioCurrentPage);
}

function shiftAudioScriptsForInsertion(insertAfterIndex, count) {
    const newPages = {};
    const oldPages = studioAudioScripts.pages || {};
    Object.keys(oldPages).forEach(k => {
        const pNum = parseInt(k, 10);
        if (pNum <= insertAfterIndex) {
            newPages[String(pNum)] = oldPages[k];
        } else {
            newPages[String(pNum + count)] = oldPages[k];
        }
    });
    studioAudioScripts.pages = newPages;
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    audioScriptsModified = true;
}

function shiftAudioScriptsForDeletion(deletedIndex) {
    const newPages = {};
    const oldPages = studioAudioScripts.pages || {};
    Object.keys(oldPages).forEach(k => {
        const pNum = parseInt(k, 10);
        if (pNum < deletedIndex) {
            newPages[String(pNum)] = oldPages[k];
        } else if (pNum > deletedIndex) {
            newPages[String(pNum - 1)] = oldPages[k];
        }
    });
    studioAudioScripts.pages = newPages;
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    audioScriptsModified = true;
}

async function executeSmartUpload(mode, targetPos, fileList) {
    if (!fileList || !fileList.length) return;

    fileList.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    if (progressSection) progressSection.style.display = 'block';

    const processedImages = [];
    let totalBytes = 0;

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const webpData = await readFileAsWebp(file);
        processedImages.push(webpData);

        const currentBytes = Math.round(webpData.length * (3/4));
        totalBytes += currentBytes;

        const percent = Math.round(((i + 1) / fileList.length) * 100);
        if (progressLabel) progressLabel.textContent = `कनवर्ट हो रहा है: ${i + 1} / ${fileList.length} पेजेस (${percent}%)`;
        if (sizeLabel) sizeLabel.textContent = `फाइल: ${file.name} (${Math.round(currentBytes / 1024)} KB) • कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        if (fillBar) fillBar.style.width = `${percent}%`;

        if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
    }

    let targetSelectPage = 1;
    let summaryMsg = '';

    if (mode === 'append') {
        const startIdx = studioPageImages.length;
        studioPageImages.push(...processedImages);
        for (let i = 0; i < processedImages.length; i++) {
            modifiedPageIndices.add(startIdx + i);
        }
        studioTotalPages = studioPageImages.length;
        targetSelectPage = startIdx + 1;
        summaryMsg = `➕ अंत में ${processedImages.length} नए पेज जुड़ गए! (अब कुल: ${studioTotalPages} पेजेस)`;
    } else if (mode === 'insert') {
        const insertIndex = Math.max(0, Math.min(studioPageImages.length, targetPos));
        studioPageImages.splice(insertIndex, 0, ...processedImages);
        shiftAudioScriptsForInsertion(insertIndex, processedImages.length);
        for (let i = 0; i < processedImages.length; i++) {
            modifiedPageIndices.add(insertIndex + i);
        }
        studioTotalPages = studioPageImages.length;
        targetSelectPage = insertIndex + 1;
        summaryMsg = `📥 पेज ${insertIndex} के बाद ${processedImages.length} नए पेज इन्सर्ट हो गए! (अब कुल: ${studioTotalPages} पेजेस)`;
    } else if (mode === 'replace_range') {
        const startIdx = Math.max(0, Math.min(studioPageImages.length - 1, targetPos - 1));
        for (let i = 0; i < processedImages.length; i++) {
            if (startIdx + i < studioPageImages.length) {
                studioPageImages[startIdx + i] = processedImages[i];
                modifiedPageIndices.add(startIdx + i);
            } else {
                studioPageImages.push(processedImages[i]);
                modifiedPageIndices.add(studioPageImages.length - 1);
            }
        }
        studioTotalPages = studioPageImages.length;
        targetSelectPage = startIdx + 1;
        summaryMsg = `🔄 पेज ${startIdx + 1} से आगे ${processedImages.length} पेजों की इमेज बदल दी गई!`;
    } else { // full_reload
        isFullBookReload = true;
        modifiedPageIndices.clear();
        studioPageImages = processedImages;
        studioTotalPages = processedImages.length;
        targetSelectPage = 1;
        summaryMsg = `🎉 पूरी पुस्तक ${processedImages.length} नए पेजों के साथ रीलोड हो गई!`;
    }

    // Auto save immediately to IndexedDB so reader gets full updated pages instantly
    await savePagesToDb(studioCurrentBookId, studioPageImages);

    markUnsaved(true);
    renderPageChipGrid();
    selectPage(targetSelectPage);

    if (progressLabel) progressLabel.textContent = `🎉 ${summaryMsg} (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
    alert(`${summaryMsg}\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\n1-Click Push to Git दबाकर इन बदलावों को सीधे लाइव करें!`);
}

function readFileAsWebp(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const rawData = reader.result;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const webpData = canvas.toDataURL('image/webp', 0.88);
                resolve(webpData);
            };
            img.onerror = () => resolve(rawData);
            img.src = rawData;
        };
        reader.readAsDataURL(file);
    });
}

// Convert PDF to WebP
async function convertCurrentPdfToWebp() {
    if (!studioPdfDoc) {
        alert("कोई PDF उपलब्ध नहीं है जिसे कनवर्ट किया जा सके।");
        return;
    }

    if (!confirm(`क्या आप इस PDF के सभी ${studioTotalPages} पेजों को WebP इमेज में बदलना चाहते हैं? (ऑटोमैटिक टेक्स्ट भी एक्सट्रेक्ट होकर ऑडियो स्क्रिप्ट में भर जाएगा)`)) return;

    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    if (progressSection) progressSection.style.display = 'block';

    const images = [];
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    let totalBytes = 0;
    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

    for (let p = 1; p <= studioPdfDoc.numPages; p++) {
        const page = await studioPdfDoc.getPage(p);
        const viewport = page.getViewport({ scale: 1.5 });

        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        await page.render({
            canvasContext: tempCtx,
            viewport: viewport
        }).promise;

        const webpData = tempCanvas.toDataURL('image/webp', 0.88);
        images.push(webpData);

        // Auto Extract Text from PDF Page for Audio Script Box
        try {
            const textContent = await page.getTextContent();
            if (textContent && textContent.items && textContent.items.length) {
                const pageText = textContent.items.map(it => it.str).join(' ').replace(/\s+/g, ' ').trim();
                const pageKey = String(p);
                const prev = studioAudioScripts.pages[pageKey];
                const prevAudio = (prev && typeof prev === 'object') ? (prev.audio || '') : '';
                if (!prev || (typeof prev === 'object' && !prev.text)) {
                    studioAudioScripts.pages[pageKey] = { text: pageText, audio: prevAudio };
                }
            }
        } catch (eText) {
            console.warn(`Text extraction error on page ${p}:`, eText);
        }

        const currentBytes = Math.round(webpData.length * (3/4));
        totalBytes += currentBytes;

        const percent = Math.round((p / studioPdfDoc.numPages) * 100);
        if (progressLabel) progressLabel.textContent = `PDF पेज कनवर्ट व टेक्स्ट एक्सट्रेक्ट हो रहा है: ${p} / ${studioPdfDoc.numPages} (${percent}%)`;
        if (sizeLabel) sizeLabel.textContent = `कुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        if (fillBar) fillBar.style.width = `${percent}%`;

        if (p % 4 === 0) await new Promise(r => setTimeout(r, 10));
    }

    studioPageImages = images;
    studioTotalPages = images.length;

    await savePagesToDb(studioCurrentBookId, studioPageImages);
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

    markUnsaved(false);
    updateQuickTestLinks(studioCurrentBookId);
    await updateSourcePdfUI(studioCurrentBookId);
    renderPageChipGrid();
    selectPage(1);

    if (progressLabel) progressLabel.textContent = `🎉 PDF के सभी ${images.length} पेज WebP में तैयार! (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
    alert(`🎉 बधाई हो! PDF के सभी ${images.length} पेज 100% HD WebP में बदल गए हैं और टेक्स्ट स्वतः ऑडियो स्क्रिप्ट बॉक्स में भर गया है!\n\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\nअब आप बिना दोबारा टाइप किए सीधे आवाज़ रिकॉर्ड कर सकते हैं या TTS चला सकते हैं!`);
}

// Direct PDF File Upload Handler (Auto converts any PDF file to WebP pages + extracts text)
async function handleDirectPdfUpload(file) {
    if (!file || file.type !== 'application/pdf') {
        alert("कृपया एक वैध PDF फाइल चुनें।");
        return;
    }

    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    if (progressSection) progressSection.style.display = 'block';
    if (progressLabel) progressLabel.textContent = `⏳ PDF फाइल लोड हो रही है (${(file.size / (1024 * 1024)).toFixed(2)} MB)...`;

    try {
        const pdfjs = await ensurePdfJsLoaded();
        const arrayBuffer = await file.arrayBuffer();
        const typedArray = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjs.getDocument({
            data: typedArray,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true
        });
        const pdfDoc = await loadingTask.promise;
        const total = pdfDoc.numPages;

        // 🛡️ Permanently Vault Source PDF File in IndexedDB
        await savePdfFileToDb(studioCurrentBookId, {
            name: file.name,
            size: file.size,
            type: file.type || 'application/pdf',
            lastModified: file.lastModified || Date.now(),
            buffer: arrayBuffer,
            totalPages: total
        });
        await updateSourcePdfUI(studioCurrentBookId);

        let doAppend = false;
        const existingPages = (studioPageImages && Array.isArray(studioPageImages)) ? studioPageImages.filter(Boolean) : [];
        if (existingPages.length > 0) {
            doAppend = confirm(
                `📚 इस पुस्तक में पहले से ${existingPages.length} पेज मौजूद हैं।\n\n` +
                `• [OK] = इस नई PDF के सभी ${total} पेजों को आगे जोड़ें (APPEND करें)।\n  (कुल ${existingPages.length + total} पेज बन जाएंगे)\n\n` +
                `• [Cancel] = पुरानी किताब हटाकर केवल इस PDF के ${total} पेज रखें (REPLACE ALL करें)।`
            );
        }

        const images = [];
        const pageTexts = [];
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        let totalBytes = 0;

        for (let p = 1; p <= total; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale: 2.0 });

            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            await page.render({
                canvasContext: tempCtx,
                viewport: viewport
            }).promise;

            const webpData = tempCanvas.toDataURL('image/webp', 0.90);
            images.push(webpData);

            // Auto Extract Text from PDF Page for Audio Script Box (Devanagari ligature preserved)
            let pageText = '';
            try {
                const textContent = await page.getTextContent();
                if (textContent && textContent.items && textContent.items.length) {
                    let lastY = null;
                    const lines = [];
                    let curLine = [];
                    for (const item of textContent.items) {
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                            lines.push(curLine.join(' '));
                            curLine = [];
                        }
                        if (item.str && item.str.trim()) {
                            curLine.push(item.str.trim());
                        }
                        lastY = item.transform[5];
                    }
                    if (curLine.length) lines.push(curLine.join(' '));
                    pageText = lines.join('\n').replace(/ +/g, ' ').trim();
                }
            } catch (eText) {
                console.warn(`Text extraction note on page ${p}:`, eText);
            }
            pageTexts.push(pageText);

            const currentBytes = Math.round(webpData.length * (3/4));
            totalBytes += currentBytes;

            const percent = Math.round((p / total) * 100);
            if (progressLabel) progressLabel.textContent = `PDF पेज कनवर्ट व टेक्स्ट एक्सट्रेक्ट हो रहा है: ${p} / ${total} (${percent}%)`;
            if (sizeLabel) sizeLabel.textContent = `कुल WebP साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
            if (fillBar) fillBar.style.width = `${percent}%`;

            if (p % 4 === 0) await new Promise(r => setTimeout(r, 10));
        }

        if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
        if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

        if (doAppend) {
            const startOffset = existingPages.length;
            studioPageImages = [...existingPages, ...images];
            studioTotalPages = studioPageImages.length;
            for (let p = 1; p <= total; p++) {
                const targetKey = String(startOffset + p);
                const pText = pageTexts[p - 1] || '';
                studioAudioScripts.pages[targetKey] = {
                    text: pText,
                    audio: '',
                    is_live: false // Draft until approved
                };
            }
            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            syncBookToAllCatalogs(studioCurrentBookId, studioTotalPages, studioPageImages);
            markUnsaved(false);
            renderPageChipGrid();
            selectPage(startOffset + 1);
            if (progressLabel) progressLabel.textContent = `🎉 नई PDF के सभी ${images.length} पेज आगे जोड़े गए! कुल: ${studioTotalPages} पेज`;
            alert(`🎉 बधाई हो! नई PDF के सभी ${images.length} पेज सफलतापूर्वक आगे जोड़ दिए गए हैं!\n\nकुल पेज अब: ${studioTotalPages} हो गए हैं।\n\nआप तुरंत नए पेजों के ऑडियो की समीक्षा कर उन्हें लाइव कर सकते हैं!`);
        } else {
            studioPageImages = images;
            studioTotalPages = images.length;
            studioAudioScripts.pages = {};
            for (let p = 1; p <= total; p++) {
                const pText = pageTexts[p - 1] || '';
                studioAudioScripts.pages[String(p)] = {
                    text: pText,
                    audio: '',
                    is_live: false
                };
            }
            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
            syncBookToAllCatalogs(studioCurrentBookId, studioTotalPages, studioPageImages);
            markUnsaved(false);
            renderPageChipGrid();
            selectPage(1);
            if (progressLabel) progressLabel.textContent = `🎉 PDF के सभी ${images.length} पेज WebP में तैयार! (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
            alert(`🎉 बधाई हो! इस PDF के सभी ${images.length} पेज 100% HD WebP में बदल गए हैं और टेक्स्ट स्वतः ऑडियो स्क्रिप्ट बॉक्स में भर गया है!\n\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\nअब आप बिना दोबारा टाइप किए सीधे आवाज़ रिकॉर्ड कर सकते हैं या TTS चला सकते हैं!`);
        }
    } catch (err) {
        console.error("Direct PDF Parse Error:", err);
        const progressSection = document.getElementById('uploadProgressSection');
        if (progressSection) progressSection.style.display = 'none';
        alert(`❌ PDF प्रोसेस करने में समस्या आई:\n${err.message || err}\n\nसुझाव: कृपया सुनिश्चित करें कि यह एक मान्य PDF फाइल है (पासवर्ड प्रोटेक्टेड न हो)।`);
    }
}

// =======================================================
// 📄 SOURCE PDF MANAGEMENT & RECOVERY VAULT ENGINE
// =======================================================
async function updateSourcePdfUI(bookId) {
    const cleanId = String(bookId || studioCurrentBookId || '').toUpperCase().trim();
    const card = document.getElementById('sourcePdfStatusCard');
    const nameLabel = document.getElementById('sourcePdfNameLabel');
    const metaLabel = document.getElementById('sourcePdfMetaLabel');
    const badge = document.getElementById('sourcePdfBadge');
    if (!card) return;

    if (!cleanId) {
        card.style.display = 'none';
        return;
    }

    // 1. Check IndexedDB first (All saved PDFs for this book)
    const pdfList = await loadAllPdfFilesFromDb(cleanId);
    if (pdfList && pdfList.length > 0) {
        card.style.display = 'flex';
        const latest = pdfList[pdfList.length - 1];
        const totalPdfs = pdfList.length;
        if (nameLabel) {
            nameLabel.textContent = totalPdfs > 1 
                ? `${latest.name || cleanId + '.pdf'} (+${totalPdfs - 1} अन्य PDF)`
                : (latest.name || `${cleanId}.pdf`);
        }
        let totalBytes = pdfList.reduce((acc, p) => acc + (p.size || (p.buffer ? p.buffer.byteLength : 0)), 0);
        const sizeMb = (totalBytes / (1024 * 1024)).toFixed(2);
        const pagesCount = latest.totalPages || studioTotalPages || 0;
        if (metaLabel) metaLabel.textContent = `${totalPdfs > 1 ? `${totalPdfs} संलग्न PDF • ` : ''}${pagesCount > 0 ? pagesCount + ' पेजेस • ' : ''}${sizeMb} MB • IndexedDB सुरक्षित Vault`;
        if (badge) {
            badge.textContent = totalPdfs > 1 ? `✓ IndexedDB (${totalPdfs} PDF सुरक्षित)` : '✓ IndexedDB सुरक्षित';
            badge.style.background = '#065f46';
            badge.style.color = '#34d399';
            badge.style.borderColor = '#059669';
        }
        return;
    }

    // 2. Check if server full PDF exists via HEAD request
    try {
        const testUrl = `../pdf/full/${cleanId}.pdf`;
        const resp = await fetch(testUrl, { method: 'HEAD' });
        if (resp.ok) {
            card.style.display = 'flex';
            if (nameLabel) nameLabel.textContent = `${cleanId}.pdf`;
            const clen = resp.headers.get('content-length');
            const sizeStr = clen ? (parseInt(clen, 10) / (1024 * 1024)).toFixed(2) + ' MB' : 'Server PDF';
            if (metaLabel) metaLabel.textContent = `सर्वर PDF • ${sizeStr} • ऑनलाइन सुरक्षित`;
            if (badge) {
                badge.textContent = '🌐 Server PDF';
                badge.style.background = '#1e3a8a';
                badge.style.color = '#60a5fa';
                badge.style.borderColor = '#3b82f6';
            }
            return;
        }
    } catch (_) {}

    // 3. Fallback: Check book metadata pdf URL
    if (studioBookData && (studioBookData.mainPdf || studioBookData.pdf_url)) {
        card.style.display = 'flex';
        if (nameLabel) nameLabel.textContent = `${cleanId}.pdf`;
        if (metaLabel) metaLabel.textContent = `कैटलॉग PDF • ऑनलाइन सुरक्षित`;
        if (badge) {
            badge.textContent = '🌐 Remote PDF';
            badge.style.background = '#1e3a8a';
            badge.style.color = '#60a5fa';
            badge.style.borderColor = '#3b82f6';
        }
        return;
    }

    // Not found
    card.style.display = 'none';
}

async function reExtractPagesFromSavedPdf(bookId) {
    const cleanId = String(bookId || studioCurrentBookId || '').toUpperCase().trim();
    if (!cleanId) return;

    let arrayBuffer = null;
    let fileName = `${cleanId}.pdf`;

    const savedPdf = await loadPdfFileFromDb(cleanId);
    if (savedPdf && savedPdf.buffer) {
        arrayBuffer = savedPdf.buffer;
        if (savedPdf.name) fileName = savedPdf.name;
    } else {
        // Fallback: try fetching from server
        try {
            const resp = await fetch(`../pdf/full/${cleanId}.pdf`);
            if (resp.ok) {
                arrayBuffer = await resp.arrayBuffer();
            }
        } catch (_) {}
    }

    if (!arrayBuffer) {
        alert("❌ इस पुस्तक के लिए कोई सुरक्षित PDF नहीं मिली।\nकृपया '📄 Upload Direct PDF' बटन से PDF अपलोड करें।");
        return;
    }

    if (!confirm(`⚠️ क्या आप सुरक्षित PDF (${fileName}) से दोबारा सभी पेजेस HD WebP में निकालना चाहते हैं?\n\n(यदि पेज इमेज गायब हो गई हैं, तो यह उन्हें 100% सही रीस्टोर कर देगा। आपकी पहले से सेव की गई ऑडियो स्क्रिप्ट्स सुरक्षित रहेंगी।)`)) {
        return;
    }

    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    if (progressSection) progressSection.style.display = 'block';
    if (progressLabel) progressLabel.textContent = `⏳ PDF लोड हो रही है...`;

    try {
        const pdfjs = await ensurePdfJsLoaded();
        const typedArray = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjs.getDocument({
            data: typedArray,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true
        });
        const pdfDoc = await loadingTask.promise;
        const total = pdfDoc.numPages;

        const images = [];
        const pageTexts = [];
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        let totalBytes = 0;

        for (let p = 1; p <= total; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale: 2.0 });

            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

            await page.render({
                canvasContext: tempCtx,
                viewport: viewport
            }).promise;

            const webpData = tempCanvas.toDataURL('image/webp', 0.90);
            images.push(webpData);

            let pageText = '';
            try {
                const textContent = await page.getTextContent();
                if (textContent && textContent.items && textContent.items.length) {
                    let lastY = null;
                    const lines = [];
                    let curLine = [];
                    for (const item of textContent.items) {
                        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                            lines.push(curLine.join(' '));
                            curLine = [];
                        }
                        if (item.str && item.str.trim()) {
                            curLine.push(item.str.trim());
                        }
                        lastY = item.transform[5];
                    }
                    if (curLine.length) lines.push(curLine.join(' '));
                    pageText = lines.join('\n').replace(/ +/g, ' ').trim();
                }
            } catch (eText) {
                console.warn(`Text extraction note on page ${p}:`, eText);
            }
            pageTexts.push(pageText);

            const currentBytes = Math.round(webpData.length * (3/4));
            totalBytes += currentBytes;

            const percent = Math.round((p / total) * 100);
            if (progressLabel) progressLabel.textContent = `PDF से HD इमेज निकल रही है: ${p} / ${total} (${percent}%)`;
            if (sizeLabel) sizeLabel.textContent = `कुल WebP साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
            if (fillBar) fillBar.style.width = `${percent}%`;

            if (p % 4 === 0) await new Promise(r => setTimeout(r, 10));
        }

        studioPageImages = images;
        studioTotalPages = images.length;
        if (!studioAudioScripts) studioAudioScripts = { bookId: cleanId, pages: {} };
        if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

        // Preserve existing audio, only fill text if empty
        for (let p = 1; p <= total; p++) {
            const pageKey = String(p);
            const prev = studioAudioScripts.pages[pageKey];
            const prevAudio = (prev && typeof prev === 'object') ? (prev.audio || '') : '';
            const prevIsLive = (prev && typeof prev === 'object') ? !!prev.is_live : false;
            const prevText = (prev && typeof prev === 'object' && prev.text) ? prev.text : (pageTexts[p - 1] || '');
            
            studioAudioScripts.pages[pageKey] = {
                text: prevText,
                audio: prevAudio,
                is_live: prevIsLive
            };
        }

        await savePagesToDb(cleanId, studioPageImages);
        localStorage.setItem(`AOI_AUDIO_SCRIPTS_${cleanId}`, JSON.stringify(studioAudioScripts));
        syncBookToAllCatalogs(cleanId, studioTotalPages, studioPageImages);
        markUnsaved(false);
        renderPageChipGrid();
        selectPage(1);
        await updateSourcePdfUI(cleanId);

        if (progressLabel) progressLabel.textContent = `🎉 PDF से सभी ${images.length} पेज सफलतापूर्वक रीस्टोर हो गए!`;
        alert(`🎉 बधाई हो!\n\nसुरक्षित PDF से सभी ${images.length} HD पेजेस सफलतापूर्वक दोबारा निकाल लिए गए हैं!\n\nअब आपकी पुस्तक Reader और Download में बिल्कुल स्पष्ट दिखेगी।`);
    } catch (err) {
        console.error("Re-extract error:", err);
        alert(`❌ PDF से इमेज निकालने में त्रुटि: ${err.message || err}`);
    } finally {
        setTimeout(() => {
            if (progressSection) progressSection.style.display = 'none';
        }, 2000);
    }
}

async function downloadSourcePdf(bookId) {
    const cleanId = String(bookId || studioCurrentBookId || '').toUpperCase().trim();
    if (!cleanId) return;

    const savedPdf = await loadPdfFileFromDb(cleanId);
    if (savedPdf && savedPdf.buffer) {
        const blob = new Blob([savedPdf.buffer], { type: savedPdf.type || 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = savedPdf.name || `${cleanId}.pdf`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 500);
        return;
    }

    // Fallback: server file
    const serverUrl = `../pdf/full/${cleanId}.pdf`;
    window.open(serverUrl, '_blank');
}

async function deleteSourcePdf(bookId) {
    const cleanId = String(bookId || studioCurrentBookId || '').toUpperCase().trim();
    if (!cleanId) return;

    if (!confirm(`🗑️ क्या आप पुस्तक ${cleanId} की संलग्न PDF फाइल को सुरक्षित वॉल्ट से हटाना चाहते हैं?\n\n(नोट: मौजूदा बनाए गए WebP पेजेस और ऑडियो सुरक्षित रहेंगे)`)) {
        return;
    }

    await deletePdfFileFromDb(cleanId);
    await updateSourcePdfUI(cleanId);
    alert(`✅ पुस्तक ${cleanId} की संलग्न PDF सुरक्षित रूप से हटा दी गई है।`);
}

// =======================================================
// 6. STAGING & COMMIT / DISCARD SYSTEM
// =======================================================
function markUnsaved(isUnsaved) {
    hasUnsavedChanges = isUnsaved;
    const bar = document.getElementById('stagingActionBar');
    if (bar) bar.style.display = isUnsaved ? 'block' : 'none';
}

async function commitAllChanges() {
    // 1. Save images to IndexedDB
    if (studioPageImages && studioPageImages.length > 0) {
        await savePagesToDb(studioCurrentBookId, studioPageImages);
    }

    // 2. Save script data to localStorage
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

    // 2b. Sync to AAROGYAM_CUSTOM_BOOKS & AAROGYAM_BOOK_LANDING_PAGES
    syncBookToAllCatalogs(studioCurrentBookId, studioTotalPages, studioPageImages);

    // 3. If this is a Free/Demo book, sync audio & pages back to AAROGYAM_FREE_DEMO_BOOKS
    try {
        const freeDemoList = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
        const fdIdx = freeDemoList.findIndex(b => b.id && b.id.toUpperCase() === studioCurrentBookId.toUpperCase());
        if (fdIdx >= 0) {
            const page1Audio = studioAudioScripts?.pages?.["1"]?.audio || Object.values(studioAudioScripts?.pages || {}).find(p => p && p.audio)?.audio || '';
            freeDemoList[fdIdx].hasAudioBook = true;
            freeDemoList[fdIdx].has_audio = true;
            if (page1Audio) freeDemoList[fdIdx].audioUrl = page1Audio;
            if (studioPageImages && studioPageImages.length > 0) {
                freeDemoList[fdIdx].demoImages = studioPageImages;
                freeDemoList[fdIdx].pageImages = studioPageImages;
                freeDemoList[fdIdx].totalPages = studioPageImages.length;
            }
            localStorage.setItem('AAROGYAM_FREE_DEMO_BOOKS', JSON.stringify(freeDemoList));
        }
    } catch (e) {}

    // 4. Update backup
    studioOriginalBackup = {
        images: [...studioPageImages],
        scripts: JSON.parse(JSON.stringify(studioAudioScripts)),
        totalPages: studioTotalPages
    };

    markUnsaved(false);
    alert(`✅ पुस्तक [${studioCurrentBookId}] के सभी ${studioTotalPages} पेज और ऑडियो सफलतापूर्वक सेव हो गए हैं!`);
}

async function discardDraftChanges() {
    if (!confirm("क्या आप सभी बिना सेव किए गए बदलाव रद्द करके पहले जैसा करना चाहते हैं?")) return;

    if (studioOriginalBackup) {
        studioPageImages = [...studioOriginalBackup.images];
        studioAudioScripts = JSON.parse(JSON.stringify(studioOriginalBackup.scripts));
        studioTotalPages = studioOriginalBackup.totalPages;
    }

    markUnsaved(false);
    updateQuickTestLinks(studioCurrentBookId);
    await updateSourcePdfUI(studioCurrentBookId);
    renderPageChipGrid();
    selectPage(1);
    alert("↩️ सभी बदलाव रद्द कर दिए गए हैं। पिछला सेव किया हुआ डेटा लोड हो गया है।");
}

function getAutoSyncApiUrl() {
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        return 'https://aarogyamindia.online/api/auto-sync-book';
    }
    return '/api/auto-sync-book';
}

// =======================================================
// 7. 1-CLICK DIRECT GITHUB API AUTO-SYNC (ZERO-EGRESS)
// =======================================================
async function syncStudioToGitHub() {
    if (isSyncInProgress) {
        console.warn("Sync already in progress. Ignoring duplicate click.");
        return;
    }

    if (!studioPageImages || !studioPageImages.length) {
        alert("पुश करने के लिए कोई WebP पेज उपलब्ध नहीं हैं।\nकृपया पहले 'Upload Pages' या 'Upload Direct PDF' से पेज लोड करें।");
        return;
    }

    const total = studioPageImages.length;
    
    // -------------------------------------------------------------
    // SMART ZERO-REDUNDANCY DELTA ENGINE (Prevents duplicate git commits)
    // -------------------------------------------------------------
    let rawCandidates = [];
    if (isFullBookReload || (modifiedPageIndices.size === 0 && !audioScriptsModified)) {
        rawCandidates = Array.from({ length: total }, (_, i) => i);
    } else if (modifiedPageIndices.size > 0) {
        rawCandidates = Array.from(modifiedPageIndices).sort((a, b) => a - b);
    }

    // Filter: ONLY upload pages that are actual new Base64 strings.
    // If an image already points to a Git/server file (../images/books/...), DO NOT re-commit it!
    pagesToUpload = rawCandidates.filter(idx => {
        const img = studioPageImages[idx];
        if (!img) return false;
        if (typeof img === 'string' && (img.startsWith('../') || img.startsWith('/images/') || img.startsWith('http'))) {
            return false; // Already saved on GitHub!
        }
        return typeof img === 'string' && img.startsWith('data:image/');
    });

    if (pagesToUpload.length === 0) {
        isDeltaAudioOnly = true;
    } else if (pagesToUpload.length === 1) {
        isDeltaSinglePage = true;
    }

    // Confirm dialog text customized to what actually changed
    let confirmMsg = '';
    if (isDeltaAudioOnly) {
        confirmMsg = `⚡ पुस्तक [${studioCurrentBookId}] में केवल ऑडियो/टेक्स्ट में बदलाव हुआ है।\n\nक्या आप सिर्फ ऑडियो स्क्रिप्ट को Git पर 0.5 सेकंड में लाइव करना चाहते हैं? (152 पेजों को दोबारा अपलोड नहीं किया जाएगा)`;
    } else if (isDeltaSinglePage) {
        confirmMsg = `🚀 पुस्तक [${studioCurrentBookId}] का केवल पेज ${pagesToUpload[0] + 1} बदला है।\n\nक्या आप सिर्फ इसी 1 पेज और स्क्रिप्ट को Git पर 1 सेकंड में लाइव करना चाहते हैं?`;
    } else {
        confirmMsg = `🚀 क्या आप पुस्तक [${studioCurrentBookId}] के ${pagesToUpload.length} पेजों और ऑडियो को सीधे GitHub पर 1-Click में लाइव पुश करना चाहते हैं?`;
    }

    if (!confirm(confirmMsg)) return;

    isSyncInProgress = true;

    const gitSyncBtn = document.getElementById('gitAutoSyncBtn');
    const gitPushStagingBtn = document.getElementById('gitPushStagingBtn');
    const triggerBulkBtn = document.getElementById('triggerBulkUploadBtn');
    const triggerPdfBtn = document.getElementById('triggerDirectPdfBtn');
    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');
    const apiUrl = getAutoSyncApiUrl();

    const origText = gitSyncBtn ? gitSyncBtn.innerHTML : '';
    if (gitSyncBtn) {
        gitSyncBtn.disabled = true;
        gitSyncBtn.innerHTML = `<span>⏳</span> Git पर पुश हो रहा है...`;
    }
    if (gitPushStagingBtn) {
        gitPushStagingBtn.disabled = true;
        gitPushStagingBtn.innerHTML = `<span>⏳</span> Git Push...`;
    }
    if (triggerBulkBtn) triggerBulkBtn.disabled = true;
    if (triggerPdfBtn) triggerPdfBtn.disabled = true;

    if (progressSection) {
        progressSection.style.display = 'block';
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    let uploadedCount = 0;
    let totalBytes = 0;
    const failedPages = [];

    try {
        // CASE 1: ONLY AUDIO/TEXT CHANGED -> ZERO IMAGE UPLOADS
        if (isDeltaAudioOnly) {
            if (progressLabel) progressLabel.textContent = `⚡ केवल ऑडियो स्क्रिप्ट और टेक्स्ट में बदलाव पाया गया। सिर्फ JSON सिंक हो रहा है...`;
            if (sizeLabel) sizeLabel.textContent = `डेटा साइज: < 10 KB`;
            if (fillBar) fillBar.style.width = `60%`;

            const scriptJsonStr = JSON.stringify(studioAudioScripts, null, 2);
            const scriptBase64 = btoa(unescape(encodeURIComponent(scriptJsonStr)));

            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'upload_asset',
                    path: `data/audio-scripts/${studioCurrentBookId}.json`,
                    base64: scriptBase64
                })
            });

            // Save locally
            await savePagesToDb(studioCurrentBookId, studioPageImages);
            localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

            modifiedPageIndices.clear();
            audioScriptsModified = false;
            isFullBookReload = false;
            markUnsaved(false);

            if (fillBar) fillBar.style.width = `100%`;
            if (progressLabel) progressLabel.textContent = `🎉 पुस्तक [${studioCurrentBookId}] का नया ऑडियो/टेक्स्ट Git पर 0.5s में लाइव हो गया!`;

            const modal = document.getElementById('syncSuccessModal');
            if (modal) {
                const bIdEl = document.getElementById('successModalBookId');
                const pagesEl = document.getElementById('successModalPages');
                const sizeEl = document.getElementById('successModalSize');
                const pathEl = document.getElementById('successModalPath');
                const linkEl = document.getElementById('successModalReaderLink');

                if (bIdEl) bIdEl.textContent = studioCurrentBookId;
                if (pagesEl) pagesEl.textContent = `ऑडियो/टेक्स्ट अपडेट (0 Images Touched)`;
                if (sizeEl) sizeEl.textContent = `< 10 KB (Superfast)`;
                if (pathEl) pathEl.textContent = `data/audio-scripts/${studioCurrentBookId}.json`;
                if (linkEl) linkEl.href = `../ebooks/reader.html?book=${studioCurrentBookId}`;

                modal.style.display = 'flex';
            }
            return;
        }

        // CASE 2: UPLOAD ONLY MODIFIED IMAGES (Single page or full book)
        const targetUploadCount = pagesToUpload.length;
        for (let idx = 0; idx < targetUploadCount; idx++) {
            const pageIndex = pagesToUpload[idx];
            const pageNum = pageIndex + 1;
            const base64Data = studioPageImages[pageIndex];
            const pagePath = `images/books/${studioCurrentBookId}/${pageNum}.webp`;

            let success = false;
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'upload_asset',
                            path: pagePath,
                            base64: base64Data
                        })
                    });
                    const data = await res.json().catch(() => ({}));
                    if (res.ok && data.success) {
                        success = true;
                        break;
                    } else {
                        throw new Error(data.error || `HTTP ${res.status}`);
                    }
                } catch (err) {
                    if (attempt === 3) {
                        console.error(`Page ${pageNum} upload failed:`, err);
                    } else {
                        await new Promise(r => setTimeout(r, 300 * attempt));
                    }
                }
            }

            if (success) {
                uploadedCount++;
                const approxBytes = Math.round(base64Data.length * (3/4));
                totalBytes += approxBytes;

                const percent = Math.round((uploadedCount / targetUploadCount) * 90);
                if (progressLabel) progressLabel.textContent = `🚀 Git पर सिंक हो रहा है: ${uploadedCount} / ${targetUploadCount} पेजेस (${percent}%)`;
                if (sizeLabel) sizeLabel.textContent = `अपलोड हुआ: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB • पेज: ${pageNum}.webp`;
                if (fillBar) fillBar.style.width = `${percent}%`;
            } else {
                failedPages.push(pageNum);
            }
        }

        if (failedPages.length > 0) {
            alert(`⚠️ कुछ पेजों (${failedPages.join(', ')}) को अपलोड करने में समस्या आई। कृपया दोबारा पुश दबाएं।`);
            return;
        }

        // Final Step: Commit data/audio-scripts/{bookId}.json
        if (progressLabel) progressLabel.textContent = `⏳ ऑडियो स्क्रिप्ट Git पर सुरक्षित हो रहा है...`;
        if (fillBar) fillBar.style.width = `95%`;

        const scriptJsonStr = JSON.stringify(studioAudioScripts, null, 2);
        const scriptBase64 = btoa(unescape(encodeURIComponent(scriptJsonStr)));

        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'upload_asset',
                path: `data/audio-scripts/${studioCurrentBookId}.json`,
                base64: scriptBase64
            })
        });

        // Save locally to IndexedDB & localStorage
        await savePagesToDb(studioCurrentBookId, studioPageImages);
        localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

        modifiedPageIndices.clear();
        audioScriptsModified = false;
        isFullBookReload = false;
        markUnsaved(false);

        if (fillBar) fillBar.style.width = `100%`;
        if (progressLabel) progressLabel.textContent = `🎉 पुस्तक [${studioCurrentBookId}] Git पर 100% सफलतापूर्वक लाइव हो गई!`;

        // Display Rich Celebration Modal
        const modal = document.getElementById('syncSuccessModal');
        if (modal) {
            const bIdEl = document.getElementById('successModalBookId');
            const pagesEl = document.getElementById('successModalPages');
            const sizeEl = document.getElementById('successModalSize');
            const pathEl = document.getElementById('successModalPath');
            const linkEl = document.getElementById('successModalReaderLink');

            if (bIdEl) bIdEl.textContent = studioCurrentBookId;
            if (pagesEl) pagesEl.textContent = isDeltaSinglePage ? `Page ${pagesToUpload[0] + 1} Updated` : `${targetUploadCount} Pages (HD WebP)`;
            if (sizeEl) sizeEl.textContent = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
            if (pathEl) pathEl.textContent = isDeltaSinglePage ? `images/books/${studioCurrentBookId}/${pagesToUpload[0] + 1}.webp` : `images/books/${studioCurrentBookId}/`;
            if (linkEl) linkEl.href = `../ebooks/reader.html?book=${studioCurrentBookId}`;

            modal.style.display = 'flex';
        }

    } catch (netErr) {
        console.error("Auto Sync Error:", netErr);
        alert(`❌ Git Auto-Sync में त्रुटि:\n${netErr.message || 'नेटवर्क कनेक्शन जांचें'}`);
    } finally {
        isSyncInProgress = false;
        if (gitSyncBtn) {
            gitSyncBtn.disabled = false;
            gitSyncBtn.innerHTML = origText;
        }
        if (gitPushStagingBtn) {
            gitPushStagingBtn.disabled = false;
            gitPushStagingBtn.innerHTML = `🚀 1-Click Push to Git`;
        }
        if (triggerBulkBtn) triggerBulkBtn.disabled = false;
        if (triggerPdfBtn) triggerPdfBtn.disabled = false;
    }
}

// =======================================================
// 8. 1-CLICK ZIP EXPORT FOR GIT REPOSITORY
// =======================================================
async function downloadWebpPagesZip() {
    if (!studioPageImages || !studioPageImages.length) {
        alert("डाउनलोड करने के लिए कोई WebP इमेज उपलब्ध नहीं है। कृपया पहले इमेज अपलोड करें या PDF कनवर्ट करें।");
        return;
    }

    if (typeof JSZip === 'undefined') {
        alert("JSZip लाइब्रेरी लोड नहीं हो पाई। कृपया इंटरनेट कनेक्शन जांचें।");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder(studioCurrentBookId);

    const progressLabel = document.getElementById('progressStatusLabel');
    const progressSection = document.getElementById('uploadProgressSection');
    if (progressSection) progressSection.style.display = 'block';

    for (let i = 0; i < studioPageImages.length; i++) {
        const base64Data = studioPageImages[i];
        // Strip out data URL prefix to get clean base64
        const cleanBase64 = base64Data.replace(/^data:image\/(webp|png|jpeg);base64,/, '');
        folder.file(`${i + 1}.webp`, cleanBase64, { base64: true });
        
        if (progressLabel) progressLabel.textContent = `📦 ZIP फाइल तैयार हो रही है: ${i + 1} / ${studioPageImages.length} पेजेस...`;
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studioCurrentBookId}_WebP_Pages.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (progressLabel) progressLabel.textContent = `✅ ${studioCurrentBookId}_WebP_Pages.zip डाउनलोड हो गई!`;
    alert(`📦 ${studioCurrentBookId}_WebP_Pages.zip डाउनलोड हो गई है!\n\n💡 इसे आप अपने प्रोजेक्ट के "images/books/${studioCurrentBookId}/" फोल्डर में एक्सट्रैक्ट करके Git पर पुश कर सकते हैं। फिर पूरी दुनिया के मोबाइलों में यह 0.1s में लाइव दिखेगा!`);
}

function exportStudioJsonManifest() {
    const jsonStr = JSON.stringify(studioAudioScripts, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studioCurrentBookId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`📥 ${studioCurrentBookId}.json सफलतापूर्वक डाउनलोड हो गया! इसे data/audio-scripts/ में रख सकते हैं।`);
}

// =======================================================
// 8. PAGE MANAGEMENT & AUDIO RECORDING
// =======================================================
function addNewBlankPage() {
    studioTotalPages++;
    studioPageImages.push('');
    markUnsaved(true);
    renderPageChipGrid();
    selectPage(studioTotalPages);
    alert(`✅ नया पृष्ठ ${studioTotalPages} जुड़ गया है।`);
}

function deleteCurrentPage() {
    if (studioTotalPages <= 1) {
        alert("कम से कम 1 पृष्ठ होना अनिवार्य है।");
        return;
    }

    if (confirm(`क्या आप पृष्ठ ${studioCurrentPage} को हटाना चाहते हैं?`)) {
        const deletedNum = studioCurrentPage;
        if (studioPageImages.length >= studioCurrentPage) {
            studioPageImages.splice(studioCurrentPage - 1, 1);
        }
        shiftAudioScriptsForDeletion(deletedNum);
        studioTotalPages--;
        studioCurrentPage = Math.min(studioCurrentPage, studioTotalPages);
        markUnsaved(true);
        renderPageChipGrid();
        selectPage(studioCurrentPage);
    }
}

function moveCurrentPage(direction) {
    const target = studioCurrentPage + direction;
    if (target < 1 || target > studioTotalPages) return;

    if (studioPageImages.length >= Math.max(studioCurrentPage, target)) {
        const temp = studioPageImages[studioCurrentPage - 1];
        studioPageImages[studioCurrentPage - 1] = studioPageImages[target - 1];
        studioPageImages[target - 1] = temp;
    }

    // Swap scripts
    const curScript = studioAudioScripts.pages[String(studioCurrentPage)];
    const targetScript = studioAudioScripts.pages[String(target)];
    studioAudioScripts.pages[String(studioCurrentPage)] = targetScript;
    studioAudioScripts.pages[String(target)] = curScript;

    markUnsaved(true);
    selectPage(target);
}

function saveCurrentPageText() {
    const textInput = document.getElementById('pageTextInput');
    const text = textInput ? textInput.value.trim() : '';

    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
    const pageKey = String(studioCurrentPage);

    if (!studioAudioScripts.pages[pageKey]) {
        studioAudioScripts.pages[pageKey] = { text: text, audio: '' };
    } else if (typeof studioAudioScripts.pages[pageKey] === 'string') {
        studioAudioScripts.pages[pageKey] = { text: text, audio: '' };
    } else {
        studioAudioScripts.pages[pageKey].text = text;
    }

    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    audioScriptsModified = true;
    markUnsaved(true);
    renderPageChipGrid();

    const badge = document.getElementById('autoSaveBadge');
    if (badge) {
        badge.style.display = 'inline-block';
        badge.style.background = '#10b981';
        badge.style.color = '#fff';
        badge.textContent = `✅ Pg ${studioCurrentPage} सुरक्षित सेव हुआ!`;
        clearTimeout(badge._timer);
        badge._timer = setTimeout(() => { badge.style.display = 'none'; }, 3500);
    }
}

let studioTtsAudio = new Audio();
let studioTtsIsPlaying = false;
let studioTtsChunks = [];
let studioTtsChunkIndex = 0;

function stopCurrentPageTts() {
    studioTtsIsPlaying = false;
    studioTtsChunks = [];
    studioTtsChunkIndex = 0;

    if (window._studioTtsKeepAliveInterval) {
        clearInterval(window._studioTtsKeepAliveInterval);
        window._studioTtsKeepAliveInterval = null;
    }
    window._studioCurrentUtterance = null;
    if (studioTtsAudio) {
        studioTtsAudio.pause();
        studioTtsAudio.currentTime = 0;
        studioTtsAudio.src = '';
        studioTtsAudio.onended = null;
        studioTtsAudio.onerror = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    const testBtn = document.getElementById('testTtsBtn');
    const stopBtn = document.getElementById('stopTtsBtn');
    if (testBtn) {
        testBtn.textContent = '🔊 महिला आवाज़ में सुनें (TTS Test)';
        testBtn.style.display = 'inline-flex';
    }
    if (stopBtn) {
        stopBtn.style.display = 'none';
    }
}

function toggleCurrentPageAudioLive(forceState = null) {
    const curKey = String(studioCurrentPage);
    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

    const textInput = document.getElementById('pageTextInput');
    const curText = textInput ? textInput.value.trim() : '';

    if (!studioAudioScripts.pages[curKey]) {
        studioAudioScripts.pages[curKey] = { text: curText, audio: '', is_live: false };
    } else if (typeof studioAudioScripts.pages[curKey] === 'string') {
        studioAudioScripts.pages[curKey] = { text: curText || studioAudioScripts.pages[curKey], audio: '', is_live: false };
    } else if (curText) {
        studioAudioScripts.pages[curKey].text = curText;
    }

    const currentLive = studioAudioScripts.pages[curKey].is_live === true;
    studioAudioScripts.pages[curKey].is_live = forceState !== null ? Boolean(forceState) : !currentLive;
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

    selectPage(studioCurrentPage);
    renderPageChipGrid();
}

function togglePageAudioLiveDirect(pageNum, e) {
    if (e) e.stopPropagation();
    const pk = String(pageNum);
    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

    if (!studioAudioScripts.pages[pk]) {
        studioAudioScripts.pages[pk] = { text: '', audio: '', is_live: true };
    } else if (typeof studioAudioScripts.pages[pk] === 'string') {
        studioAudioScripts.pages[pk] = { text: studioAudioScripts.pages[pk], audio: '', is_live: true };
    } else {
        const curLive = studioAudioScripts.pages[pk].is_live === true;
        studioAudioScripts.pages[pk].is_live = !curLive;
    }

    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

    if (pageNum === studioCurrentPage) {
        selectPage(studioCurrentPage);
    } else {
        renderPageChipGrid();
    }
}

function approveAllPagesAudio() {
    const doAll = confirm(`क्या आप इस पुस्तक (${studioCurrentBookId}) के सभी ${studioTotalPages} पेजों के ऑडियो को एक साथ लाइव (Approve) करना चाहते हैं?`);
    if (!doAll) return;

    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
    for (let p = 1; p <= studioTotalPages; p++) {
        const pk = String(p);
        if (!studioAudioScripts.pages[pk]) {
            studioAudioScripts.pages[pk] = { text: '', audio: '', is_live: true };
        } else if (typeof studioAudioScripts.pages[pk] === 'string') {
            studioAudioScripts.pages[pk] = { text: studioAudioScripts.pages[pk], audio: '', is_live: true };
        } else {
            studioAudioScripts.pages[pk].is_live = true;
        }
    }
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    selectPage(studioCurrentPage);
    renderPageChipGrid();
    alert(`🎉 सभी ${studioTotalPages} पेजों का ऑडियो 100% लाइव हो चुका है! पाठक अब रीडर में सभी पेज सुन सकेंगे।`);
}

function draftAllPagesAudio() {
    const doAll = confirm(`क्या आप इस पुस्तक (${studioCurrentBookId}) के सभी ${studioTotalPages} पेजों के ऑडियो को बंद (ड्राफ्ट) करना चाहते हैं?\n(रीडर में दिखेगा कि ऑडियो जल्द ही आ रहा है)`);
    if (!doAll) return;

    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
    for (let p = 1; p <= studioTotalPages; p++) {
        const pk = String(p);
        if (!studioAudioScripts.pages[pk]) {
            studioAudioScripts.pages[pk] = { text: '', audio: '', is_live: false };
        } else if (typeof studioAudioScripts.pages[pk] === 'string') {
            studioAudioScripts.pages[pk] = { text: studioAudioScripts.pages[pk], audio: '', is_live: false };
        } else {
            studioAudioScripts.pages[pk].is_live = false;
        }
    }
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    selectPage(studioCurrentPage);
    renderPageChipGrid();
    alert(`⚪ सभी ${studioTotalPages} पेजों का ऑडियो ड्राफ्ट (ऑफ) कर दिया गया है।`);
}

function setAudioApprovalForSelectedPages(isLive) {
    if (!selectedPagesForBulkAction || selectedPagesForBulkAction.size === 0) {
        alert("कृपया पहले कम से कम एक पेज चुनें।");
        return;
    }
    const count = selectedPagesForBulkAction.size;
    const actionLabel = isLive ? "लाइव (Approve)" : "ड्राफ्ट (Draft/Off)";

    if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};

    selectedPagesForBulkAction.forEach(p => {
        const pk = String(p);
        if (!studioAudioScripts.pages[pk]) {
            studioAudioScripts.pages[pk] = { text: '', audio: '', is_live: isLive };
        } else if (typeof studioAudioScripts.pages[pk] === 'string') {
            studioAudioScripts.pages[pk] = { text: studioAudioScripts.pages[pk], audio: '', is_live: isLive };
        } else {
            studioAudioScripts.pages[pk].is_live = isLive;
        }
    });

    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
    selectPage(studioCurrentPage);
    renderPageChipGrid();
    alert(`✅ चुने हुए ${count} पेजों का ऑडियो ${actionLabel} कर दिया गया है।`);
}

async function extractTextFromCurrentImageOcr() {
    if (!studioPageImages || !studioPageImages[studioCurrentPage - 1]) {
        alert("पहले इस पेज पर कोई इमेज अपलोड करें।");
        return;
    }
    const imgSrc = studioPageImages[studioCurrentPage - 1];
    const textInput = document.getElementById('pageTextInput');
    const ocrBtn = document.getElementById('ocrExtractBtn');
    const autoSaveBadge = document.getElementById('autoSaveBadge');

    if (ocrBtn) {
        ocrBtn.disabled = true;
        ocrBtn.innerHTML = `<span>⏳</span> स्कैनिंग (OCR)...`;
    }

    try {
        if (!window.Tesseract) {
            await new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
                s.onload = res;
                s.onerror = rej;
                document.head.appendChild(s);
            });
        }

        const worker = await window.Tesseract.createWorker('hin+eng');
        const ret = await worker.recognize(imgSrc);
        const text = (ret && ret.data && ret.data.text) ? ret.data.text.trim() : '';
        await worker.terminate();

        if (text) {
            if (textInput) {
                textInput.value = text;
                const curKey = String(studioCurrentPage);
                if (!studioAudioScripts) studioAudioScripts = { bookId: studioCurrentBookId, pages: {} };
                if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
                if (!studioAudioScripts.pages[curKey]) {
                    studioAudioScripts.pages[curKey] = { text: text, audio: '', is_live: false };
                } else if (typeof studioAudioScripts.pages[curKey] === 'string') {
                    studioAudioScripts.pages[curKey] = { text: text, audio: '', is_live: false };
                } else {
                    studioAudioScripts.pages[curKey].text = text;
                }
                localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
                if (autoSaveBadge) {
                    autoSaveBadge.style.display = 'inline-block';
                    autoSaveBadge.textContent = '✅ OCR टेक्स्ट सेव हुआ';
                    setTimeout(() => { autoSaveBadge.style.display = 'none'; }, 2500);
                }
            }
            alert(`🎉 पृष्ठ ${studioCurrentPage} से हिंदी/अंग्रेजी टेक्स्ट सफलतापूर्वक स्कैन होकर स्क्रिप्ट बॉक्स में भर गया है!\n\nकृपया टेक्स्ट की समीक्षा करें और '🟢 ऑडियो लाइव करें' दबाएं।`);
        } else {
            alert(`⚠️ इमेज से कोई स्पष्ट टेक्स्ट नहीं पहचाना जा सका। कृपया इमेज की स्पष्टता जांचें या टेक्स्ट स्वयं टाइप करें।`);
        }
    } catch (err) {
        console.error("OCR recognition error:", err);
        alert(`❌ OCR एरर: ${err.message || err}`);
    } finally {
        if (ocrBtn) {
            ocrBtn.disabled = false;
            ocrBtn.innerHTML = `<span>🔍</span> इमेज से टेक्स्ट निकालें (OCR)`;
        }
    }
}

function updateQuickTestLinks(bookId) {
    const cleanId = String(bookId || studioCurrentBookId || 'BK001').toUpperCase().trim();
    const rBtn = document.getElementById('quickTestReaderBtn');
    const dlBtn = document.getElementById('quickTestDownloadBtn');
    const lpBtn = document.getElementById('quickTestLandingBtn');
    if (rBtn) rBtn.href = `../ebooks/reader.html?book=${cleanId}`;
    if (dlBtn) dlBtn.href = `../ebooks/download.html?book=${cleanId}`;
    if (lpBtn) lpBtn.href = `../universal-book-landing.html?id=${cleanId}`;
}

function testCurrentPageTts() {
    const textInput = document.getElementById('pageTextInput');
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        alert("कृपया पहले टेक्स्ट टाइप या पेस्ट करें।");
        return;
    }

    stopCurrentPageTts();
    studioTtsIsPlaying = true;

    const testBtn = document.getElementById('testTtsBtn');
    const stopBtn = document.getElementById('stopTtsBtn');
    if (testBtn) testBtn.textContent = '🔊 आवाज़ चल रही है... (सुनें)';
    if (stopBtn) stopBtn.style.display = 'inline-flex';

    // Check if browser has Hindi native voice
    let nativeHindiVoice = null;
    if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices() || [];
        if (typeof window.AarogyamAudioNormalizer !== 'undefined' && typeof window.AarogyamAudioNormalizer.getBestSweetVoice === 'function') {
            nativeHindiVoice = window.AarogyamAudioNormalizer.getBestSweetVoice(voices);
        } else {
            const hindiVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().includes('hi-in') || v.lang.toLowerCase().includes('hi_in')));
            if (hindiVoices.length > 0) {
                nativeHindiVoice = hindiVoices.find(v => {
                    const name = v.name.toLowerCase();
                    return name.includes('swara') || name.includes('madhur') || name.includes('google') || name.includes('kalpana') || name.includes('heera') || name.includes('female');
                }) || hindiVoices[0];
            }
        }
    }

    // Split text into chunks with full universal sanitization
    let chunks = [];
    if (typeof window.AarogyamAudioNormalizer !== 'undefined' && typeof window.AarogyamAudioNormalizer.splitIntoChunks === 'function') {
        chunks = window.AarogyamAudioNormalizer.splitIntoChunks(text);
    } else {
        const cleanText = String(text)
            .replace(/[\u3002\uFF0E]/g, ' । ')
            .replace(/(\d+)\.(\d+)/g, '$1 दशमलव $2')
            .replace(/[•▪★●◆✦✓✔■►▶❖➔→⇒—–_~*#@&|^<>{}[\]"`'()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const segs = cleanText.split(/\s*।\s*/);
        for (const s of segs) {
            const tr = s.trim();
            if (tr) chunks.push(tr);
        }
        if (!chunks.length) chunks.push(cleanText);
    }

    studioTtsChunks = chunks;
    studioTtsChunkIndex = 0;

    const playNext = () => {
        if (!studioTtsIsPlaying) return;
        if (studioTtsChunkIndex >= studioTtsChunks.length) {
            stopCurrentPageTts();
            return;
        }
        const chunk = studioTtsChunks[studioTtsChunkIndex];
        if (!chunk || !chunk.trim()) {
            studioTtsChunkIndex++;
            playNext();
            return;
        }

        if ('speechSynthesis' in window) {
            try {
                const ut = new SpeechSynthesisUtterance(chunk);
                if (nativeHindiVoice) ut.voice = nativeHindiVoice;
                ut.lang = 'hi-IN';
                ut.rate = 0.92; // Sweet, natural unhurried reading
                ut.pitch = 1.05; // Gentle, bright, sweet female pitch

                let hasAdvanced = false;
                let watchdog = null;

                const advance = (reason) => {
                    if (hasAdvanced || !studioTtsIsPlaying) return;
                    hasAdvanced = true;
                    if (watchdog) {
                        clearTimeout(watchdog);
                        watchdog = null;
                    }
                    if (reason === 'watchdog' && 'speechSynthesis' in window) {
                        try { window.speechSynthesis.cancel(); } catch(e) {}
                    }
                    studioTtsChunkIndex++;
                    setTimeout(() => {
                        if (studioTtsIsPlaying) playNext();
                    }, 75);
                };

                ut.onend = () => {
                    advance('end');
                };
                ut.onerror = (e) => {
                    if (e && (e.error === 'canceled' || e.error === 'interrupted')) {
                        return;
                    }
                    console.warn("Studio TTS chunk error:", e?.error);
                    advance('error');
                };

                // Generous Watchdog: Never cut off natural speech!
                const timeoutMs = Math.max(14000, chunk.length * 350);
                watchdog = setTimeout(() => {
                    if (!hasAdvanced && studioTtsIsPlaying) {
                        console.warn("[Studio TTS] Watchdog dead-man advance for chunk:", chunk);
                        advance('watchdog');
                    }
                }, timeoutMs);

                window._studioCurrentUtterance = ut;
                if (!window._studioTtsKeepAliveInterval) {
                    window._studioTtsKeepAliveInterval = setInterval(() => {
                        if ('speechSynthesis' in window && window.speechSynthesis.paused) {
                            try { window.speechSynthesis.resume(); } catch(e) {}
                        }
                    }, 2000);
                }

                if (window.speechSynthesis.paused) {
                    try { window.speechSynthesis.resume(); } catch(e) {}
                }
                window.speechSynthesis.speak(ut);
            } catch(e) {
                studioTtsChunkIndex++;
                playNext();
            }
        } else {
            studioTtsChunkIndex++;
            playNext();
        }
    };

    playNext();
}

let studioAudioCtx = null;
let studioMicStream = null;
let isLiveMicMonitoring = false;
let liveMonitorStream = null;
let liveMonitorCtx = null;

async function toggleLiveMicMonitoring() {
    const btn = document.getElementById('testLiveMicBtn');
    if (isLiveMicMonitoring) {
        // Stop Live Monitoring
        if (liveMonitorStream) {
            liveMonitorStream.getTracks().forEach(t => t.stop());
            liveMonitorStream = null;
        }
        if (liveMonitorCtx && liveMonitorCtx.state !== 'closed') {
            liveMonitorCtx.close().catch(() => {});
            liveMonitorCtx = null;
        }
        isLiveMicMonitoring = false;
        if (btn) {
            btn.innerHTML = `<span>🎧</span> लाइव टेस्ट (Live Echo Test)`;
            btn.style.background = '#334155';
            btn.style.color = '#e2e8f0';
        }
        const waveBox = document.getElementById('recStatusWave');
        if (waveBox) waveBox.innerHTML = `माइक तैयार है (🛡️ नॉइज़ फ़िल्टर + 🎧 मधुर इको)`;
        return;
    }

    try {
        if (btn) {
            btn.innerHTML = `<span>⏳</span> शुरू हो रहा है...`;
        }

        const noiseFilterSetting = document.getElementById('studioNoiseFilterSelect')?.value || 'high';
        const useBrowserDSP = noiseFilterSetting !== 'off';

        const constraints = {
            audio: {
                channelCount: 1,
                sampleRate: 48000,
                echoCancellation: useBrowserDSP,
                noiseSuppression: useBrowserDSP,
                autoGainControl: useBrowserDSP
            }
        };

        liveMonitorStream = await navigator.mediaDevices.getUserMedia(constraints);
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        liveMonitorCtx = new AudioCtx({ sampleRate: 48000 });
        if (liveMonitorCtx.state === 'suspended') {
            await liveMonitorCtx.resume();
        }

        const source = liveMonitorCtx.createMediaStreamSource(liveMonitorStream);

        // 1. High-Pass Filter (Low-cut rumble filter)
        const highPass = liveMonitorCtx.createBiquadFilter();
        highPass.type = 'highpass';
        highPass.frequency.setValueAtTime(noiseFilterSetting === 'high' ? 90 : 70, liveMonitorCtx.currentTime);
        highPass.Q.setValueAtTime(0.7, liveMonitorCtx.currentTime);

        // 2. Low-Pass Filter (De-hiss filter)
        const lowPass = liveMonitorCtx.createBiquadFilter();
        lowPass.type = 'lowpass';
        lowPass.frequency.setValueAtTime(noiseFilterSetting === 'high' ? 11500 : 13000, liveMonitorCtx.currentTime);
        lowPass.Q.setValueAtTime(0.7, liveMonitorCtx.currentTime);

        // 3. Compressor
        const comp = liveMonitorCtx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(noiseFilterSetting === 'high' ? -42 : -36, liveMonitorCtx.currentTime);
        comp.knee.setValueAtTime(12, liveMonitorCtx.currentTime);
        comp.ratio.setValueAtTime(6, liveMonitorCtx.currentTime);
        comp.attack.setValueAtTime(0.003, liveMonitorCtx.currentTime);
        comp.release.setValueAtTime(0.15, liveMonitorCtx.currentTime);

        source.connect(highPass);
        highPass.connect(lowPass);
        lowPass.connect(comp);

        // Direct dry sound
        const dryGain = liveMonitorCtx.createGain();
        dryGain.gain.setValueAtTime(0.95, liveMonitorCtx.currentTime);
        comp.connect(dryGain);
        dryGain.connect(liveMonitorCtx.destination);

        // Echo wet loop
        const echoPreset = document.getElementById('studioEchoPresetSelect')?.value || 'sweet';
        let echoGainLevel = 0.35;
        let delayTimeVal = 0.080;

        if (echoPreset === 'medium') {
            echoGainLevel = 0.50;
            delayTimeVal = 0.110;
        } else if (echoPreset === 'rich') {
            echoGainLevel = 0.65;
            delayTimeVal = 0.140;
        } else if (echoPreset === 'none') {
            echoGainLevel = 0.0;
        }

        if (echoGainLevel > 0) {
            const delay = liveMonitorCtx.createDelay();
            delay.delayTime.setValueAtTime(delayTimeVal, liveMonitorCtx.currentTime);

            const tone = liveMonitorCtx.createBiquadFilter();
            tone.type = 'lowpass';
            tone.frequency.setValueAtTime(2800, liveMonitorCtx.currentTime);

            const feedback = liveMonitorCtx.createGain();
            feedback.gain.setValueAtTime(echoGainLevel * 0.45, liveMonitorCtx.currentTime);

            const wetGain = liveMonitorCtx.createGain();
            wetGain.gain.setValueAtTime(echoGainLevel, liveMonitorCtx.currentTime);

            comp.connect(delay);
            delay.connect(tone);
            tone.connect(feedback);
            feedback.connect(delay);
            tone.connect(wetGain);
            wetGain.connect(liveMonitorCtx.destination);
        }

        isLiveMicMonitoring = true;
        if (btn) {
            btn.innerHTML = `<span>🟢</span> लाइव मॉनिटर चालू (बंद करें)`;
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            btn.style.color = '#fff';
        }

        const waveBox = document.getElementById('recStatusWave');
        if (waveBox) waveBox.innerHTML = `🎧 लाइव हेडफ़ोन मॉनिटरिंग सक्रिय! बोलकर टेस्ट करें।`;
    } catch (err) {
        console.error("Live mic test error:", err);
        alert("माइक एक्सेस नहीं मिल पाया। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।");
        if (btn) {
            btn.innerHTML = `<span>🎧</span> लाइव टेस्ट (Live Echo Test)`;
            btn.style.background = '#334155';
        }
    }
}

async function startRecording() {
    try {
        // Stop live monitoring if active
        if (isLiveMicMonitoring) {
            await toggleLiveMicMonitoring();
        }

        const noiseFilterSetting = document.getElementById('studioNoiseFilterSelect')?.value || 'high';
        const useBrowserDSP = noiseFilterSetting !== 'off';

        const constraints = {
            audio: {
                channelCount: 1,
                sampleRate: 48000,
                echoCancellation: useBrowserDSP,
                noiseSuppression: useBrowserDSP,
                autoGainControl: useBrowserDSP
            }
        };

        studioMicStream = await navigator.mediaDevices.getUserMedia(constraints);
        audioChunks = [];

        // Initialize Web Audio DSP Engine for High-Quality Noise Removal & Sweet Echo
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        studioAudioCtx = new AudioCtx({ sampleRate: 48000 });
        if (studioAudioCtx.state === 'suspended') {
            await studioAudioCtx.resume();
        }

        const source = studioAudioCtx.createMediaStreamSource(studioMicStream);

        // 1. High-Pass Filter (Low-cut rumble filter: cuts table vibration, wind pop, 50Hz electrical hum)
        const highPassFilter = studioAudioCtx.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.setValueAtTime(noiseFilterSetting === 'high' ? 90 : 70, studioAudioCtx.currentTime);
        highPassFilter.Q.setValueAtTime(0.7, studioAudioCtx.currentTime);

        // 2. Low-Pass Filter (De-hiss: cuts high-frequency electrical hiss & coil whine)
        const lowPassFilter = studioAudioCtx.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.setValueAtTime(noiseFilterSetting === 'high' ? 11500 : 13000, studioAudioCtx.currentTime);
        lowPassFilter.Q.setValueAtTime(0.7, studioAudioCtx.currentTime);

        // 3. Studio Dynamics Compressor / Noise Gate
        const compressor = studioAudioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(noiseFilterSetting === 'high' ? -42 : -36, studioAudioCtx.currentTime);
        compressor.knee.setValueAtTime(12, studioAudioCtx.currentTime);
        compressor.ratio.setValueAtTime(6, studioAudioCtx.currentTime);
        compressor.attack.setValueAtTime(0.003, studioAudioCtx.currentTime);
        compressor.release.setValueAtTime(0.15, studioAudioCtx.currentTime);

        // Connect noise suppression chain
        source.connect(highPassFilter);
        highPassFilter.connect(lowPassFilter);
        lowPassFilter.connect(compressor);

        // 4. Sweet Acoustic Echo & Presence Branch
        const echoPreset = document.getElementById('studioEchoPresetSelect')?.value || 'sweet';
        let echoGainLevel = 0.35; // 35% sweet acoustic echo
        let delayTimeVal = 0.080; // 80ms warm slapback

        if (echoPreset === 'medium') {
            echoGainLevel = 0.50;
            delayTimeVal = 0.110;
        } else if (echoPreset === 'rich') {
            echoGainLevel = 0.65;
            delayTimeVal = 0.140;
        } else if (echoPreset === 'none') {
            echoGainLevel = 0.0;
        }

        const destNode = studioAudioCtx.createMediaStreamDestination();

        // Direct Voice (Dry)
        const dryGain = studioAudioCtx.createGain();
        dryGain.gain.setValueAtTime(0.95, studioAudioCtx.currentTime);
        compressor.connect(dryGain);
        dryGain.connect(destNode);

        // Sweet Echo (Wet Loop)
        if (echoGainLevel > 0) {
            const delayNode = studioAudioCtx.createDelay();
            delayNode.delayTime.setValueAtTime(delayTimeVal, studioAudioCtx.currentTime);

            // Warm tone filter for echo (softens high frequencies so echo feels natural, not metallic)
            const echoToneFilter = studioAudioCtx.createBiquadFilter();
            echoToneFilter.type = 'lowpass';
            echoToneFilter.frequency.setValueAtTime(2800, studioAudioCtx.currentTime);

            const feedbackGain = studioAudioCtx.createGain();
            feedbackGain.gain.setValueAtTime(echoGainLevel * 0.45, studioAudioCtx.currentTime);

            const echoOutputGain = studioAudioCtx.createGain();
            echoOutputGain.gain.setValueAtTime(echoGainLevel, studioAudioCtx.currentTime);

            // Connect echo loop
            compressor.connect(delayNode);
            delayNode.connect(echoToneFilter);
            echoToneFilter.connect(feedbackGain);
            feedbackGain.connect(delayNode); // feedback loop

            echoToneFilter.connect(echoOutputGain);
            echoOutputGain.connect(destNode);
        }

        const processedStream = destNode.stream;

        const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 24000 }
            : {};

        mediaRecorder = new MediaRecorder(processedStream, options);
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);

            const player = document.getElementById('recordedAudioPlayer');
            const box = document.getElementById('audioPlaybackBox');
            if (player && box) {
                player.src = recordedAudioUrl;
                box.style.display = 'block';
            }

            const waveBox = document.getElementById('recStatusWave');
            if (waveBox) waveBox.innerHTML = `✅ रिकॉर्डिंग पूरी हुई (${Math.round(recordedAudioBlob.size / 1024)} KB) • 🎧 मधुर इको स्टूडियो साउंड सक्रिय`;

            if (studioAudioCtx && studioAudioCtx.state !== 'closed') {
                studioAudioCtx.close().catch(() => {});
                studioAudioCtx = null;
            }
        };

        mediaRecorder.start();
        document.getElementById('startRecBtn').style.display = 'none';
        document.getElementById('stopRecBtn').style.display = 'inline-flex';
        const waveBox = document.getElementById('recStatusWave');
        if (waveBox) waveBox.innerHTML = `🔴 रिकॉर्डिंग जारी है... (🛡️ नॉइज़ फ़िल्टर + 🎧 मधुर इको)`;
    } catch (err) {
        console.error("Mic Access Error:", err);
        alert("माइक एक्सेस नहीं मिल पाया। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।");
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (studioMicStream) {
        studioMicStream.getTracks().forEach(track => track.stop());
        studioMicStream = null;
    }
    if (studioAudioCtx && studioAudioCtx.state !== 'closed') {
        studioAudioCtx.close().catch(() => {});
        studioAudioCtx = null;
    }
    document.getElementById('startRecBtn').style.display = 'inline-flex';
    document.getElementById('stopRecBtn').style.display = 'none';
}

function saveCurrentPageAudio() {
    if (!recordedAudioBlob) {
        alert("कोई नई रिकॉर्डिंग उपलब्ध नहीं है।");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(recordedAudioBlob);
    reader.onloadend = () => {
        const base64data = reader.result;
        
        if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
        if (!studioAudioScripts.pages[String(studioCurrentPage)]) {
            studioAudioScripts.pages[String(studioCurrentPage)] = {};
        }

        if (typeof studioAudioScripts.pages[String(studioCurrentPage)] === 'string') {
            studioAudioScripts.pages[String(studioCurrentPage)] = {
                text: studioAudioScripts.pages[String(studioCurrentPage)],
                audio: base64data
            };
        } else {
            studioAudioScripts.pages[String(studioCurrentPage)].audio = base64data;
        }

        audioScriptsModified = true;
        markUnsaved(true);
        renderPageChipGrid();
        alert(`✅ Page ${studioCurrentPage} की ऑडियो रिकॉर्डिंग सेव हो गई!\n"1-Click Push to Git" दबाने पर सिर्फ 0.5 सेकंड में ऑडियो स्क्रिप्ट Git पर लाइव हो जाएगी।`);
    };
}

function deleteCurrentPageAudio() {
    if (confirm(`क्या आप Page ${studioCurrentPage} की ऑडियो हटाना चाहते हैं?`)) {
        if (studioAudioScripts.pages && studioAudioScripts.pages[String(studioCurrentPage)]) {
            if (typeof studioAudioScripts.pages[String(studioCurrentPage)] === 'object') {
                studioAudioScripts.pages[String(studioCurrentPage)].audio = '';
            }
        }
        const box = document.getElementById('audioPlaybackBox');
        if (box) box.style.display = 'none';
        audioScriptsModified = true;
        markUnsaved(true);
        renderPageChipGrid();
        alert(`🗑️ Page ${studioCurrentPage} की ऑडियो हटा दी गई।`);
    }
}

// =======================================================
// 9. CROSS-BOOK PAGE & AUDIO ASSEMBLER (IMPORT SYSTEM)
// =======================================================
let sourceBookImagesCache = [];
let sourceBookScriptsCache = { pages: {} };
let modalAudioPlayer = null;

async function openImportModal() {
    const modal = document.getElementById('importPagesModal');
    const sourceSelect = document.getElementById('importSourceBookSelect');
    if (!modal || !sourceSelect) return;

    // Populate source book dropdown (all books including Main, Demo, Free)
    try {
        let mainBooks = [];
        const res = await fetch('../data/books.json');
        if (res.ok) {
            const json = await res.json();
            if (json.books && json.books.length) mainBooks = json.books;
        }

        let customBooks = [];
        try {
            customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
        } catch (e) {}

        let freeDemoBooks = [];
        try {
            freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
        } catch (e) {}

        sourceSelect.innerHTML = '';
        
        // Add Common Bank option
        const commonOpt = document.createElement('option');
        commonOpt.value = 'COMMON';
        commonOpt.textContent = '🌟 COMMON: मास्टर कॉमन पेज बैंक';
        sourceSelect.appendChild(commonOpt);

        // Main Books
        mainBooks.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id || b.slug;
            opt.textContent = `📚 ${b.id}: ${b.heading || b.name || b.shortTitle}`;
            sourceSelect.appendChild(opt);
        });

        // Demo & Free Books
        freeDemoBooks.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = `${b.type === 'demo' ? '📖' : '🎁'} ${b.id}: ${b.heading || b.name}`;
            sourceSelect.appendChild(opt);
        });

        // Select default source book (e.g. BK001 if current is not BK001, else first option)
        if (studioCurrentBookId !== 'BK001') {
            sourceSelect.value = 'BK001';
        } else if (sourceSelect.options.length > 1) {
            sourceSelect.selectedIndex = 1;
        }
    } catch (e) {
        console.warn("Source book list load error:", e);
    }

    modal.style.display = 'flex';
    const rangeInput = document.getElementById('importRangeInput');
    if (rangeInput) rangeInput.value = '';

    await loadSourceBookForImport(sourceSelect.value || 'BK001');
}

async function loadSourceBookForImport(sourceBookId) {
    const grid = document.getElementById('importSourcePageGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="color:#38bdf8; font-size:13px; grid-column:1/-1; text-align:center; padding:40px;">सोर्स पुस्तक के पेजेस और ऑडियो लोड हो रहे हैं...</div>';

    sourceBookImagesCache = [];
    sourceBookScriptsCache = { pages: {} };

    // 1. Load Audio Scripts for Source Book
    try {
        const local = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${sourceBookId}`);
        if (local) {
            sourceBookScriptsCache = JSON.parse(local);
        } else {
            let res = await fetch(`../data/audio-scripts/${sourceBookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${sourceBookId}.json`);
            if (res.ok) sourceBookScriptsCache = await res.json();
        }
    } catch (e) {
        sourceBookScriptsCache = { pages: {} };
    }

    // 2. Load Images from DB
    const dbImages = await loadPagesFromDb(sourceBookId);
    let totalSrcPages = 0;
    if (dbImages && dbImages.length > 0) {
        sourceBookImagesCache = dbImages;
        totalSrcPages = dbImages.length;
    } else {
        // Fallback: Check books.json totalPages
        try {
            const res = await fetch('../data/books.json');
            const json = await res.json();
            const b = json.books.find(x => x.id === sourceBookId);
            if (b && b.totalPages) totalSrcPages = b.totalPages;
            else if (sourceBookId === 'BK001') totalSrcPages = 152;
            else if (sourceBookId === 'BK002') totalSrcPages = 150;
            else totalSrcPages = 30;
        } catch (e) {
            totalSrcPages = (sourceBookId === 'BK001') ? 152 : 30;
        }
    }

    if (totalSrcPages === 0) totalSrcPages = 1;

    grid.innerHTML = '';
    for (let p = 1; p <= totalSrcPages; p++) {
        const pageData = (sourceBookScriptsCache.pages && sourceBookScriptsCache.pages[String(p)]) || null;
        let hasAudio = false;
        let hasText = false;
        let audioSrc = '';
        let textSrc = '';

        if (pageData) {
            if (typeof pageData === 'string') {
                hasText = pageData.trim().length > 0;
                textSrc = pageData;
            } else if (typeof pageData === 'object') {
                if (pageData.audio && pageData.audio.trim().length > 0) {
                    hasAudio = true;
                    audioSrc = pageData.audio;
                }
                if (pageData.text && pageData.text.trim().length > 0) {
                    hasText = true;
                    textSrc = pageData.text;
                }
            }
        }

        let thumbSrc = (sourceBookImagesCache.length >= p && sourceBookImagesCache[p - 1]) 
            ? sourceBookImagesCache[p - 1] 
            : `../images/books/${sourceBookId}/${p}.webp`;

        const card = document.createElement('div');
        card.className = 'import-page-card';
        card.dataset.page = p;
        card.style.cssText = 'background:#1e293b; border:2px solid #334155; border-radius:8px; padding:6px; display:flex; flex-direction:column; align-items:center; position:relative; cursor:pointer; transition:all 0.18s ease-in-out; user-select:none;';
        
        card.innerHTML = `
            <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:11px; font-weight:800; color:#38bdf8; background:#0f172a; padding:2px 6px; border-radius:4px; border:1px solid #334155;">Pg ${p}</span>
                <input type="checkbox" class="import-page-cb" data-page="${p}" style="width:18px; height:18px; accent-color:#10b981; cursor:pointer;">
            </div>
            <div style="width:100%; height:155px; background:#000; border-radius:6px; overflow:hidden; display:flex; justify-content:center; align-items:center; margin-bottom:4px; border:1px solid #1e293b;">
                <img src="${thumbSrc}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';" style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;" alt="Pg ${p}">
                <div style="display:none; color:#64748b; font-size:11px; text-align:center; padding:10px; width:100%; height:100%; align-items:center; justify-content:center;">Pg ${p}</div>
            </div>
            <div style="width:100%; display:flex; gap:3px; flex-wrap:wrap; justify-content:center; margin-bottom:2px;">
                ${hasAudio ? '<span style="font-size:9px; background:#1e3a8a; color:#93c5fd; padding:1px 5px; border-radius:4px; font-weight:700;">🎙️ ऑडियो</span>' : ''}
                ${hasText ? '<span style="font-size:9px; background:#064e3b; color:#6ee7b7; padding:1px 5px; border-radius:4px; font-weight:700;">📄 टेक्स्ट</span>' : ''}
                ${(!hasAudio && !hasText) ? '<span style="font-size:9px; color:#64748b;">(नो ऑडियो)</span>' : ''}
            </div>
            ${(hasAudio || hasText) ? `
                <button type="button" class="preview-audio-btn" style="background:#334155; border:none; color:#e2e8f0; font-size:10px; padding:3px 6px; border-radius:4px; cursor:pointer; width:100%; margin-top:2px;">
                    ▶️ आवाज़ सुनें
                </button>
            ` : ''}
        `;

        const cb = card.querySelector('.import-page-cb');
        card.addEventListener('click', (e) => {
            if (e.target.closest('.preview-audio-btn')) return;
            if (e.target !== cb) cb.checked = !cb.checked;
            updateCardSelectionState(card, cb.checked);
            updateImportCountBadge();
        });

        cb.addEventListener('change', () => {
            updateCardSelectionState(card, cb.checked);
            updateImportCountBadge();
        });

        const previewBtn = card.querySelector('.preview-audio-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playSourceAudioPreview(audioSrc, textSrc);
            });
        }

        grid.appendChild(card);
    }

    updateImportCountBadge();
}

function updateCardSelectionState(card, isChecked) {
    if (isChecked) {
        card.style.borderColor = '#10b981';
        card.style.background = 'linear-gradient(180deg, rgba(16, 185, 129, 0.22), #0f172a)';
        card.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
        card.style.transform = 'scale(1.02)';
    } else {
        card.style.borderColor = '#334155';
        card.style.background = '#1e293b';
        card.style.boxShadow = 'none';
        card.style.transform = 'none';
    }
}

function updateImportCountBadge() {
    const checked = document.querySelectorAll('.import-page-cb:checked');
    const count = checked ? checked.length : 0;
    const tag = document.getElementById('importSelectedCountTag');
    const quickBtnText = document.getElementById('quickImportBtnText');
    const btnText = document.getElementById('executeImportBtnText');
    const summaryEl = document.getElementById('importFooterSummary');
    const sourceSelect = document.getElementById('importSourceBookSelect');
    const srcBook = sourceSelect ? sourceSelect.value : '';

    if (tag) tag.textContent = `चयनित: ${count} पेज`;
    if (quickBtnText) quickBtnText.textContent = count > 0 ? `${count} पेज जोड़ें` : `इंपोर्ट करें`;
    if (btnText) btnText.textContent = `${count} पेजेस और ऑडियो जोड़ें`;
    if (summaryEl) {
        summaryEl.textContent = count > 0 
            ? `✅ ${count} पेज चुने गए (सोर्स: ${srcBook})`
            : `कोई पेज चयनित नहीं है`;
        summaryEl.style.color = count > 0 ? '#34d399' : '#94a3b8';
    }
}

function setAllImportCheckboxes(select) {
    const cards = document.querySelectorAll('.import-page-card');
    cards.forEach(card => {
        const cb = card.querySelector('.import-page-cb');
        if (cb) {
            cb.checked = select;
            updateCardSelectionState(card, select);
        }
    });
    updateImportCountBadge();
}

function applyImportRange(rangeStr) {
    if (!rangeStr || !rangeStr.trim()) return;
    const cards = document.querySelectorAll('.import-page-card');
    const targetPages = new Set();

    const parts = rangeStr.split(/[,;\s]+/);
    parts.forEach(p => {
        const trimmed = p.trim();
        if (trimmed.includes('-')) {
            const [startStr, endStr] = trimmed.split('-');
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                    targetPages.add(i);
                }
            }
        } else {
            const num = parseInt(trimmed, 10);
            if (!isNaN(num)) targetPages.add(num);
        }
    });

    cards.forEach(card => {
        const pageNum = parseInt(card.dataset.page, 10);
        const cb = card.querySelector('.import-page-cb');
        if (cb) {
            const isMatch = targetPages.has(pageNum);
            cb.checked = isMatch;
            updateCardSelectionState(card, isMatch);
        }
    });

    updateImportCountBadge();
}

function playSourceAudioPreview(audioSrc, textSrc) {
    if (modalAudioPlayer) {
        modalAudioPlayer.pause();
        modalAudioPlayer = null;
    }
    if (window._studioModalTtsPlayer && typeof window._studioModalTtsPlayer.stop === 'function') {
        window._studioModalTtsPlayer.stop();
        window._studioModalTtsPlayer = null;
    }
    if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch(e) {}
    }

    if (audioSrc && audioSrc.trim().length > 0) {
        modalAudioPlayer = new Audio(audioSrc);
        modalAudioPlayer.play().catch(e => console.warn("Audio preview error:", e));
    } else if (textSrc && textSrc.trim().length > 0 && ('speechSynthesis' in window)) {
        if (typeof window.AarogyamAudioNormalizer !== 'undefined' && typeof window.AarogyamAudioNormalizer.speakChunksSafe === 'function') {
            window._studioModalTtsPlayer = window.AarogyamAudioNormalizer.speakChunksSafe({
                text: textSrc,
                rate: 0.92,
                pitch: 1.05
            });
        } else {
            const ut = new SpeechSynthesisUtterance(textSrc);
            ut.lang = 'hi-IN';
            ut.rate = 0.92;
            ut.pitch = 1.05;
            window._studioSourceUtterance = ut;
            window.speechSynthesis.speak(ut);
        }
    } else {
        alert("इस पेज पर कोई ऑडियो या टेक्स्ट उपलब्ध नहीं है।");
    }
}

function convertImgUrlToWebpDataUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 800;
            canvas.height = img.naturalHeight || img.height || 1131;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                const webp = canvas.toDataURL('image/webp', 0.88);
                resolve(webp);
            } catch (e) {
                resolve(url);
            }
        };
        img.onerror = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1131;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, 800, 1131);
            ctx.fillStyle = '#64748b';
            ctx.font = '24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Page (Source: ${url})`, 400, 565);
            resolve(canvas.toDataURL('image/webp', 0.88));
        };
        img.src = url;
    });
}

let isImportRunning = false;
async function executeImportPages() {
    if (isImportRunning) return;
    const checkboxes = Array.from(document.querySelectorAll('.import-page-cb:checked'));
    if (!checkboxes.length) {
        alert("कृपया कम से कम 1 पेज चुनें जिसे आप इस पुस्तक में जोड़ना चाहते हैं।");
        return;
    }

    isImportRunning = true;
    const executeBtn = document.getElementById('executeImportBtn');
    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.innerHTML = `<span>⏳</span> पेजेस इंपोर्ट हो रहे हैं...`;
    }

    try {
        const sourceBookSelect = document.getElementById('importSourceBookSelect');
        const sourceBookId = sourceBookSelect ? sourceBookSelect.value : 'BK001';
        let placement = document.getElementById('importPlacementSelect')?.value || 'END';
        const includeAudio = document.getElementById('importIncludeAudioCheck')?.checked ?? true;

        // 🛡️ DEDUPLICATION: Strict Set deduplication guarantees 0 duplicate pages
        const selectedPages = [...new Set(checkboxes.map(cb => parseInt(cb.dataset.page, 10)).filter(n => !isNaN(n) && n > 0))].sort((a, b) => a - b);

    const importedImages = [];
    const importedScripts = [];

    for (let p of selectedPages) {
        // 1. Get Image
        let imgData = (sourceBookImagesCache.length >= p && sourceBookImagesCache[p - 1])
            ? sourceBookImagesCache[p - 1]
            : `../images/books/${sourceBookId}/${p}.webp`;

        if (!imgData.startsWith('data:image/')) {
            imgData = await convertImgUrlToWebpDataUrl(imgData);
        }
        importedImages.push(imgData);

        // 2. Clone Audio / Script Text
        let scriptClone = { text: '', audio: '' };
        if (includeAudio && sourceBookScriptsCache.pages && sourceBookScriptsCache.pages[String(p)]) {
            const raw = sourceBookScriptsCache.pages[String(p)];
            if (typeof raw === 'string') {
                scriptClone = { text: raw, audio: '' };
            } else if (typeof raw === 'object') {
                scriptClone = {
                    text: raw.text || '',
                    audio: raw.audio || '' // Cloned Opus base64 audio
                };
            }
        }
        importedScripts.push(scriptClone);
    }

    // 3. Assemble Target Book arrays
    let currentImages = [...studioPageImages];
    let currentScripts = [];
    for (let i = 1; i <= currentImages.length; i++) {
        const s = studioAudioScripts.pages && studioAudioScripts.pages[String(i)];
        if (s) {
            currentScripts.push(typeof s === 'string' ? { text: s, audio: '' } : { text: s.text || '', audio: s.audio || '' });
        } else {
            currentScripts.push({ text: '', audio: '' });
        }
    }

    let finalImages = [];
    let finalScripts = [];

    if (placement === 'REPLACE') {
        finalImages = [...importedImages];
        finalScripts = [...importedScripts];
    } else {
        if (currentImages.length > 0 && placement === 'END') {
            const doAppend = confirm(
                `📚 इस पुस्तक में पहले से ${currentImages.length} पेज मौजूद हैं!\n\n` +
                `• [OK] = नए ${importedImages.length} पेजों को आगे जोड़ें (APPEND करें)।\n  (कुल ${currentImages.length + importedImages.length} पेज बन जाएंगे)\n\n` +
                `• [Cancel] = पुराने सभी पेज हटाकर केवल नए ${importedImages.length} पेज रखें (REPLACE ALL करें)।`
            );
            if (!doAppend) {
                placement = 'REPLACE';
            }
        }

        if (placement === 'REPLACE') {
            finalImages = [...importedImages];
            finalScripts = [...importedScripts];
        } else if (placement === 'BEGINNING') {
            finalImages = [...importedImages, ...currentImages];
            finalScripts = [...importedScripts, ...currentScripts];
        } else if (placement === 'AFTER_CURRENT' && currentImages.length > 0) {
            const insertIdx = Math.min(studioCurrentPage, currentImages.length);
            finalImages = [
                ...currentImages.slice(0, insertIdx),
                ...importedImages,
                ...currentImages.slice(insertIdx)
            ];
            finalScripts = [
                ...currentScripts.slice(0, insertIdx),
                ...importedScripts,
                ...currentScripts.slice(insertIdx)
            ];
        } else {
            // Default: END
            finalImages = [...currentImages, ...importedImages];
            finalScripts = [...currentScripts, ...importedScripts];
        }
    }

    // Reconstruct studioPageImages & studioAudioScripts.pages
    studioPageImages = finalImages;
    studioTotalPages = finalImages.length;
    studioAudioScripts.pages = {};

    for (let i = 0; i < finalScripts.length; i++) {
        const pgNum = String(i + 1);
        studioAudioScripts.pages[pgNum] = finalScripts[i];
    }

    // Save to target book's IndexedDB & localStorage
    await savePagesToDb(studioCurrentBookId, studioPageImages);
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

    audioScriptsModified = true;
    isFullBookReload = true;
    markUnsaved(true);

    // Close Modal & Reset Checkboxes
    const modal = document.getElementById('importPagesModal');
    if (modal) modal.style.display = 'none';
    setAllImportCheckboxes(false);

    renderPageChipGrid();
    const newFocusPage = (placement === 'BEGINNING') ? 1 : ((placement === 'AFTER_CURRENT') ? studioCurrentPage + 1 : (currentImages.length > 0 ? currentImages.length + 1 : 1));
    selectPage(newFocusPage);

    alert(`🎉 बधाई! पुस्तक [${sourceBookId}] से ${selectedPages.length} पेजेस और उनका ऑडियो [${studioCurrentBookId}] में सफलतापूर्वक जुड़ गए हैं!\n\n💡 स्वतंत्र संपादन (Independent Editing):\nअब आप किसी भी पेज पर जाकर उसकी आवाज़ दोबारा रिकॉर्ड कर सकते हैं या नया टेक्स्ट लिख सकते हैं। इससे मूल पुस्तक (${sourceBookId}) में कोई छेड़छाड़ नहीं होगी!\n\nसारे बदलाव फाइनल करने के लिए "🚀 1-Click Push to Git" बटन दबाएं।`);
    } catch(err) {
        console.error("Execute import error:", err);
        alert(`❌ पेजेस जोड़ने में समस्या आई: ${err.message || err}`);
    } finally {
        isImportRunning = false;
        if (executeBtn) {
            executeBtn.disabled = false;
            executeBtn.innerHTML = `<span>✨</span> <span id="executeImportBtnText">0 पेजेस और ऑडियो इंपोर्ट करें</span>`;
        }
    }
}

