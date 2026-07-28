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
    aoiBookId = urlParams.get("book") || urlParams.get("id") || "BK001";
    console.log("Target Book ID:", aoiBookId);

    try {
        // 1. Supabase Session & Purchase Check
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
    let userEmail = "User";

    if (typeof supabaseClient !== "undefined") {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session?.user) {
            userId = session.user.id;
            userEmail = session.user.email || session.user.id.substring(0, 8);
        }
    }

    if (watermarkUser) watermarkUser.textContent = userEmail;

    // Load books.json (Path root relative check)
    const res = await fetch("../data/books.json");
    if (!res.ok) throw new Error("books.json not found");
    const json = await res.json();
    
    aoiCurrentBookData = json.books.find(b => b.id === targetBookId);

    if (!aoiCurrentBookData) {
        showErrorScreen();
        return;
    }

    // Universal Book Name Display in Header & Loader
    const bookTitle = aoiCurrentBookData.heading || aoiCurrentBookData.name || "Aarogyam India eBook";
    if (bookHeading) bookHeading.textContent = bookTitle;
    if (loaderBookTitle) loaderBookTitle.textContent = bookTitle;

    // Check Purchase Access
    if (aoiCurrentBookData.readEnabled === false) {
        accessDeniedModal.style.display = "flex";
        return;
    }

    // If logged in, check DB purchase (Optional V1 strict check)
    if (userId && typeof supabaseClient !== "undefined") {
        const { data, error } = await supabaseClient
            .from("purchases")
            .select("id")
            .eq("profile_id", userId)
            .eq("book_id", targetBookId)
            .single();

        if (error || !data) {
            console.warn("No purchase record in DB, proceeding with local access...");
        }
    }

    // Initialize PDF Loading
    loadPdfFile(aoiCurrentBookData.mainPdf || "pdf/full/" + targetBookId + ".pdf");
}

// =======================================================
// LOAD PDF VIA PDF.JS
// =======================================================
function loadPdfFile(pdfUrl) {
    console.log("Loading PDF from:", pdfUrl);

    pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
        aoiPdfDoc = pdfDoc_;
        aoiTotalPages = aoiPdfDoc.numPages;
        console.log("PDF Loaded Successfully. Total Pages:", aoiTotalPages);

        // Update Slider Max
        if (pageSlider) pageSlider.max = aoiTotalPages;

        // Check LocalStorage for Last Read Page (Continue Reading)
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
        console.error("PDF Load Error:", err);
        showErrorScreen();
    });
}

function initReaderAtPage(startPage) {
    aoiPageNum = startPage;
    renderPage(aoiPageNum);
    if (loadingIndicator) loadingIndicator.style.display = "none";
}

// =======================================================
// RENDER SINGLE PAGE (AUTO-FIT RESPONSIVE FIX)
// =======================================================
function renderPage(num) {
    aoiPageRendering = true;
    
    aoiPdfDoc.getPage(num).then(page => {
        const container = document.getElementById('readerContainer');
        const availableHeight = container ? container.clientHeight - 20 : window.innerHeight - 150;
        const availableWidth = container ? container.clientWidth - 20 : window.innerWidth - 40;

        const unscaledViewport = page.getViewport({ scale: 1.0 });
        
        let hScale = availableHeight / unscaledViewport.height;
        let wScale = availableWidth / unscaledViewport.width;
        let autoScale = Math.min(hScale, wScale);
        
        const finalScale = autoScale * (aoiScale / 1.2);

        const viewport = page.getViewport({ scale: finalScale });
        aoiCanvas.height = viewport.height;
        aoiCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: aoiCtx,
            viewport: viewport
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

function onPrevPage() {
    if (aoiPageNum <= 1) return;
    aoiPageNum--;
    queueRenderPage(aoiPageNum);
}

function onNextPage() {
    if (aoiPageNum >= aoiTotalPages) return;
    aoiPageNum++;
    queueRenderPage(aoiPageNum);
}

// =======================================================
// UI & PROGRESS UPDATES
// =======================================================
function updateUIControls(num) {
    if (headerPageInfo) headerPageInfo.textContent = `Page ${num} / ${aoiTotalPages}`;
    if (pageInfoDisplay) pageInfoDisplay.textContent = `Page ${num} / ${aoiTotalPages}`;
    
    const percent = Math.round((num / aoiTotalPages) * 100);
    if (headerPercentInfo) headerPercentInfo.textContent = `${percent}%`;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (topProgressBar) topProgressBar.title = `${percent}% Completed`;

    if (pageSlider) pageSlider.value = num;

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (prevBtn) prevBtn.disabled = (num <= 1);
    if (nextBtn) nextBtn.disabled = (num >= aoiTotalPages);
}

function saveProgress(num) {
    let savedData = JSON.parse(localStorage.getItem("AOI_READ_PROGRESS") || "{}");
    savedData[aoiBookId] = num;
    localStorage.setItem("AOI_READ_PROGRESS", JSON.stringify(savedData));
}

// =======================================================
// EVENT LISTENERS & CONTROLS
// =======================================================
const prevBtnEl = document.getElementById("prevPageBtn");
const nextBtnEl = document.getElementById("nextPageBtn");
if (prevBtnEl) prevBtnEl.addEventListener("click", onPrevPage);
if (nextBtnEl) nextBtnEl.addEventListener("click", onNextPage);

// Page Slider Event
if (pageSlider) {
    pageSlider.addEventListener("input", (e) => {
        let targetPage = parseInt(e.target.value);
        if (targetPage >= 1 && targetPage <= aoiTotalPages) {
            aoiPageNum = targetPage;
            queueRenderPage(aoiPageNum);
        }
    });
}

// Page Jump Direct Input
const pageJumpBtn = document.getElementById("pageJumpBtn");
if (pageJumpBtn) {
    pageJumpBtn.addEventListener("click", () => {
        let inputVal = parseInt(document.getElementById("pageJumpInput").value);
        if (inputVal >= 1 && inputVal <= aoiTotalPages) {
            aoiPageNum = inputVal;
            queueRenderPage(aoiPageNum);
            document.getElementById("pageJumpInput").value = "";
        } else {
            alert(`कृपया 1 से ${aoiTotalPages} के बीच का वैध पेज नंबर डालें।`);
        }
    });
}

// Zoom Controls
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

function showErrorScreen() {
    if (loadingIndicator) loadingIndicator.style.display = "none";
    if (pdfErrorScreen) pdfErrorScreen.style.display = "flex";
}

// =======================================================
// WHATSAPP DYNAMIC USER LINK GENERATOR (FIXED)
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const whatsappBtn = document.getElementById("whatsappFloatBtn");
        if (whatsappBtn) {
            const userEmailText = watermarkUser ? watermarkUser.textContent : "User";
            // साफ़ और ब्राउज़र-फ्रेंडली टेक्स्ट फॉर्मेट
            const message = "नमस्ते Aarogyam Inida , मैं आरोग्यम इंडिया की ई-बुक पढ़ रहा हूँ और मुझे सहायता चाहिए।";
            
            // encodeURIComponent का उपयोग करके यूआरएल बनाना
            whatsappBtn.href = "https://wa.me/917974422572?text=" + encodeURIComponent(message);
        }
    }, 1500);
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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}