/**
 * =================================================================
 * AAROGYAM INDIA - PRO EBOOK & AUDIO STUDIO (ALL-IN-ONE ENGINE)
 * =================================================================
 * Features:
 * 1. Book / Demo Code Selector & Creator (BK001, BK002, DEMO001, etc.)
 * 2. Bulk WebP / PNG / JPG Image Uploader (Auto sorted, fast HD)
 * 3. 1-Click "PDF to WebP" Converter
 * 4. Page Manager: Add, Reorder, Delete Pages
 * 5. Page Audio Recording: 24kbps Opus Real Voice
 * 6. Page Text Editor: Crisp Natural Female TTS Mode
 * 7. Live Sync + Export Manifest JSON
 */

import { initAdminLayout } from './admin-main.js';

// PDF.js Worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let studioPdfDoc = null;
let studioCurrentBookId = 'BK001';
let studioCurrentPage = 1;
let studioTotalPages = 152;
let studioBookData = null;
let studioAudioScripts = { pages: {} };
let studioPageImages = [];

// Media Recorder
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;

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
                WebP पेज इमेज अपलोड करें, पेज क्रम सेट करें और माइक से आवाज़ या टेक्स्ट जोड़ें।
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
            </div>
          </div>
        </div>

        <!-- Mode & Bulk Action Bar -->
        <div class="admin-card" style="margin-bottom: 16px; background:#0f172a; border-left:4px solid #10b981;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <span style="font-weight:700; color:#34d399; font-size:0.95rem; display:block;">📁 Bulk WebP / PNG पेज अपलोडर</span>
              <span style="font-size:0.8rem; color:#94a3b8;">एक साथ 150+ पेज की WebP/PNG/JPG इमेज चुनें। सिस्टम अपने आप क्रम में लगा देगा।</span>
            </div>

            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <input type="file" id="bulkImageInput" multiple accept="image/webp,image/png,image/jpeg" style="display:none;">
              <button id="triggerBulkUploadBtn" class="admin-btn admin-btn-primary" style="padding:8px 14px;">
                📤 Bulk Images चुनें (Upload Pages)
              </button>
              <button id="convertPdfToWebpBtn" class="admin-btn admin-btn-secondary" style="padding:8px 12px; font-size:12px;" title="मौजूदा PDF के सारे पेजों को WebP इमेज में बदलें">
                ⚡ Convert PDF to WebP
              </button>
              <button id="exportJsonBtn" class="admin-btn" style="background:#3b82f6; color:#fff; padding:8px 12px; font-size:12px;">
                💾 Export JSON Manifest
              </button>
            </div>
          </div>
        </div>

        <!-- Page Selector & Reorder Bar -->
        <div class="admin-card" style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-weight:700; font-size:0.9rem; color:#e2e8f0;">पृष्ठ चुनें (Page Selector):</span>
              <span id="pageCountStatus" style="font-size:0.85rem; color:#10b981; font-weight:700;">1 / 152 Pages</span>
            </div>
            
            <!-- Page Management Buttons -->
            <div style="display:flex; gap:6px;">
              <button id="addPageBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">➕ नया पेज</button>
              <button id="movePagePrevBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">⬅️ आगे करें</button>
              <button id="movePageNextBtn" class="admin-btn admin-btn-secondary" style="padding:4px 8px; font-size:11px;">➡️ पीछे करें</button>
              <button id="deletePageBtn" class="admin-btn" style="background:#ef4444; color:#fff; padding:4px 8px; font-size:11px;">🗑️ यह पेज हटाएं</button>
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3 style="margin:0; font-size:1rem; color:#38bdf8;">📄 पेज प्रिव्यू (Page Preview)</h3>
              <span id="previewPageNumberTag" style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Page 1</span>
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
            
            <!-- OPTION A: TEXT EDITOR (TTS MODE) -->
            <div style="margin-bottom: 18px;">
              <label style="font-weight:700; font-size:0.85rem; color:#e2e8f0; display:block; margin-bottom:6px;">
                🟢 विकल्प A: इस पेज का हिंदी टेक्स्ट (मधुर महिला आवाज़ - कृषि सखी):
              </label>
              <textarea id="pageTextInput" rows="5" class="admin-input" style="width:100%; resize:vertical; font-size:0.9rem; line-height:1.5;" placeholder="इस पेज पर लिखा हुआ टेक्स्ट यहाँ पेस्ट करें या टाइप करें..."></textarea>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button id="testTtsBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:12px;">
                  🔊 महिला आवाज़ में सुनें (TTS Test)
                </button>
                <button id="savePageTextBtn" class="admin-btn admin-btn-primary" style="padding:6px 14px; font-size:12px;">
                  💾 टेक्स्ट सेव करें (Save Text)
                </button>
              </div>
            </div>

            <hr style="border:none; border-top:1px solid #334155; margin:16px 0;">

            <!-- OPTION B: LIVE MIC RECORDER -->
            <div>
              <label style="font-weight:700; font-size:0.85rem; color:#e2e8f0; display:block; margin-bottom:6px;">
                🎙️ विकल्प B: सीधे माइक से अपनी मूल आवाज़ रिकॉर्ड करें:
              </label>
              <p style="margin:0 0 10px; font-size:0.75rem; color:#94a3b8;">
                माइक ऑन करें, पेज देखकर बोलें। यह आपकी असली आवाज़ में 24kbps Opus में सेव होगा।
              </p>

              <div style="display:flex; align-items:center; gap:12px; margin-top:14px; padding:14px; background:#0f172a; border-radius:8px;">
                <button id="startRecBtn" class="admin-btn" style="background:#ef4444; color:#fff;">
                  <span>🔴</span> रिकॉर्ड शुरू करें
                </button>
                <button id="stopRecBtn" class="admin-btn" style="background:#475569; color:#fff; display:none;">
                  <span>⏹️</span> रोकें (Stop)
                </button>
                <div id="recStatusWave" style="height:34px; flex:1; background:#1e293b; border-radius:6px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:12px;">
                  माइक तैयार है
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

    setupStudioEvents();
    await loadBookStudio(studioCurrentBookId);
}

function setupStudioEvents() {
    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) {
        bookSelect.addEventListener('change', (e) => {
            if (e.target.value === '__NEW__') {
                const newCode = prompt("नया बुक / डेमो कोड दर्ज करें (उदा. BK003 या DEMO002):");
                if (newCode && newCode.trim()) {
                    const cleanCode = newCode.trim().toUpperCase();
                    const opt = document.createElement('option');
                    opt.value = cleanCode;
                    opt.textContent = `${cleanCode}: कस्टम पुस्तक/डेमो`;
                    bookSelect.insertBefore(opt, bookSelect.lastElementChild);
                    bookSelect.value = cleanCode;
                    studioCurrentBookId = cleanCode;
                    studioCurrentPage = 1;
                    loadBookStudio(studioCurrentBookId);
                } else {
                    bookSelect.value = studioCurrentBookId;
                }
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
        triggerBtn.addEventListener('click', () => bulkInput.click());
        bulkInput.addEventListener('change', (e) => handleBulkImageUpload(e.target.files));
    }

    // Convert PDF to WebP
    const convertBtn = document.getElementById('convertPdfToWebpBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', () => convertCurrentPdfToWebp());
    }

    // Export JSON
    const exportBtn = document.getElementById('exportJsonBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => exportStudioJsonManifest());
    }

    // Page Reordering & Addition
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
    const savePageTextBtn = document.getElementById('savePageTextBtn');
    if (savePageTextBtn) {
        savePageTextBtn.addEventListener('click', () => saveCurrentPageText());
    }

    const testTtsBtn = document.getElementById('testTtsBtn');
    if (testTtsBtn) {
        testTtsBtn.addEventListener('click', () => testCurrentPageTts());
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
}

async function loadBookStudio(bookId) {
    studioPdfDoc = null;
    studioPageImages = [];
    studioAudioScripts = { bookId: bookId, pages: {} };

    // 1. Load book data from books.json
    try {
        const res = await fetch('../data/books.json');
        const json = await res.json();
        studioBookData = json.books.find(b => b.id === bookId || b.id === bookId.toUpperCase());
    } catch (e) {}

    // 2. Load Audio & Page Manifest
    try {
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
        if (localData) {
            studioAudioScripts = JSON.parse(localData);
            if (studioAudioScripts.pageImages && studioAudioScripts.pageImages.length) {
                studioPageImages = studioAudioScripts.pageImages;
            }
        } else {
            let res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                studioAudioScripts = await res.json();
                if (studioAudioScripts.pageImages && studioAudioScripts.pageImages.length) {
                    studioPageImages = studioAudioScripts.pageImages;
                }
            }
        }
    } catch (e) {
        studioAudioScripts = { bookId: bookId, pages: {} };
    }

    // 3. If no images yet, load PDF
    if (!studioPageImages.length) {
        const pdfUrl = (studioBookData && studioBookData.mainPdf) 
            ? ('..' + studioBookData.mainPdf) 
            : `../pdf/full/${bookId}.pdf`;

        try {
            studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
            studioTotalPages = studioPdfDoc.numPages;
        } catch (err) {
            console.warn("Studio PDF Load warning:", err);
            studioTotalPages = 1;
        }
    } else {
        studioTotalPages = studioPageImages.length;
    }

    renderPageChipGrid();
    selectPage(1);
}

function renderPageChipGrid() {
    const grid = document.getElementById('pageChipGrid');
    const statusText = document.getElementById('pageCountStatus');
    if (!grid) return;

    if (statusText) statusText.textContent = `${studioCurrentPage} / ${studioTotalPages} Pages`;

    grid.innerHTML = '';
    for (let p = 1; p <= studioTotalPages; p++) {
        const chip = document.createElement('div');
        chip.style.padding = '5px 10px';
        chip.style.borderRadius = '6px';
        chip.style.fontSize = '12px';
        chip.style.cursor = 'pointer';
        chip.style.transition = 'all 0.2s';
        chip.style.display = 'flex';
        chip.style.alignItems = 'center';
        chip.style.gap = '4px';
        
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

        if (p === studioCurrentPage) {
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
        if (hasAudio) badge += ' 🎙️';
        else if (hasText) badge += ' 📖';

        chip.innerHTML = badge;
        chip.addEventListener('click', () => selectPage(p));
        grid.appendChild(chip);
    }
}

async function selectPage(pageNum) {
    studioCurrentPage = pageNum;
    renderPageChipGrid();

    const pageTag = document.getElementById('previewPageNumberTag');
    if (pageTag) pageTag.textContent = `Page ${pageNum}`;

    const previewCanvas = document.getElementById('previewCanvas');
    const previewImage = document.getElementById('previewImage');
    const loadingText = document.getElementById('previewLoadingText');

    if (loadingText) loadingText.style.display = 'none';

    // 1. Render WebP Image if available
    if (studioPageImages.length >= pageNum && studioPageImages[pageNum - 1]) {
        if (previewCanvas) previewCanvas.style.display = 'none';
        if (previewImage) {
            previewImage.style.display = 'block';
            previewImage.src = studioPageImages[pageNum - 1];
        }
    } 
    // 2. Render PDF Canvas Fallback
    else if (studioPdfDoc) {
        if (previewImage) previewImage.style.display = 'none';
        if (previewCanvas) {
            previewCanvas.style.display = 'block';
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
            } catch (e) {
                console.error("Error rendering preview page:", e);
            }
        }
    } else {
        if (previewCanvas) previewCanvas.style.display = 'none';
        if (previewImage) previewImage.style.display = 'none';
        if (loadingText) {
            loadingText.style.display = 'block';
            loadingText.textContent = `पृष्ठ ${pageNum} खाली है। ऊपर से इमेज अपलोड करें।`;
        }
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
}

// Bulk Upload Handler
async function handleBulkImageUpload(files) {
    if (!files || !files.length) return;

    const fileList = Array.from(files);
    // Natural Sort by filename (e.g. 1.webp, 2.webp, 10.webp or page_1.png)
    fileList.sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    const waveBox = document.getElementById('recStatusWave');
    if (waveBox) waveBox.innerHTML = `⏳ ${fileList.length} इमेज प्रोसेस हो रही हैं...`;

    const imagesBase64 = [];

    for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const dataUrl = await readFileAsDataUrl(file);
        imagesBase64.push(dataUrl);
    }

    studioPageImages = imagesBase64;
    studioTotalPages = imagesBase64.length;
    studioAudioScripts.pageImages = imagesBase64;

    saveScriptsDataToLocal();
    renderPageChipGrid();
    selectPage(1);

    if (waveBox) waveBox.innerHTML = `✅ ${fileList.length} पेज सफलतापूर्वक लोड हो गए!`;
    alert(`🎉 ${fileList.length} WebP/PNG पेज सफलतापूर्वक लोड हो गए हैं!`);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

// Convert PDF to WebP
async function convertCurrentPdfToWebp() {
    if (!studioPdfDoc) {
        alert("कोई PDF उपलब्ध नहीं है जिसे कनवर्ट किया जा सके।");
        return;
    }

    if (!confirm(`क्या आप इस PDF के सभी ${studioTotalPages} पेजों को WebP इमेज में बदलना चाहते हैं?`)) return;

    const waveBox = document.getElementById('recStatusWave');
    const images = [];

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    for (let p = 1; p <= studioPdfDoc.numPages; p++) {
        if (waveBox) waveBox.innerHTML = `⏳ कनवर्ट हो रहा है: Page ${p} / ${studioPdfDoc.numPages}...`;
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
    }

    studioPageImages = images;
    studioTotalPages = images.length;
    studioAudioScripts.pageImages = images;

    saveScriptsDataToLocal();
    renderPageChipGrid();
    selectPage(1);

    if (waveBox) waveBox.innerHTML = `✅ ${images.length} पेज WebP में बदल गए!`;
    alert(`🎉 बधाई हो! ${images.length} पेज 100% HD WebP में बदल गए हैं!`);
}

function addNewBlankPage() {
    studioTotalPages++;
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
        if (studioPageImages.length >= studioCurrentPage) {
            studioPageImages.splice(studioCurrentPage - 1, 1);
            studioAudioScripts.pageImages = studioPageImages;
        }
        delete studioAudioScripts.pages[String(studioCurrentPage)];
        studioTotalPages--;
        studioCurrentPage = Math.min(studioCurrentPage, studioTotalPages);
        saveScriptsDataToLocal();
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
        studioAudioScripts.pageImages = studioPageImages;
    }

    // Swap scripts
    const curScript = studioAudioScripts.pages[String(studioCurrentPage)];
    const targetScript = studioAudioScripts.pages[String(target)];
    studioAudioScripts.pages[String(studioCurrentPage)] = targetScript;
    studioAudioScripts.pages[String(target)] = curScript;

    saveScriptsDataToLocal();
    selectPage(target);
}

function saveCurrentPageText() {
    const textInput = document.getElementById('pageTextInput');
    const text = textInput ? textInput.value.trim() : '';

    if (!studioAudioScripts.pages) studioAudioScripts.pages = {};
    if (!studioAudioScripts.pages[String(studioCurrentPage)]) {
        studioAudioScripts.pages[String(studioCurrentPage)] = {};
    }

    if (typeof studioAudioScripts.pages[String(studioCurrentPage)] === 'string') {
        studioAudioScripts.pages[String(studioCurrentPage)] = { text: text, audio: '' };
    } else {
        studioAudioScripts.pages[String(studioCurrentPage)].text = text;
    }

    saveScriptsDataToLocal();
    renderPageChipGrid();
    alert(`✅ Page ${studioCurrentPage} का टेक्स्ट सफलतापूर्वक सेव हो गया!`);
}

function testCurrentPageTts() {
    const textInput = document.getElementById('pageTextInput');
    const text = textInput ? textInput.value.trim() : '';
    if (!text) {
        alert("कृपया पहले टेक्स्ट टाइप या पेस्ट करें।");
        return;
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = 'hi-IN';
        ut.rate = 0.95;
        ut.pitch = 1.0;
        window.speechSynthesis.speak(ut);
    } else {
        alert("ब्राउज़र में SpeechSynthesis उपलब्ध नहीं है।");
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];

        const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 24000 }
            : {};

        mediaRecorder = new MediaRecorder(stream, options);
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
            if (waveBox) waveBox.innerHTML = `✅ रिकॉर्डिंग पूरी हुई (${Math.round(recordedAudioBlob.size / 1024)} KB)`;
        };

        mediaRecorder.start();
        document.getElementById('startRecBtn').style.display = 'none';
        document.getElementById('stopRecBtn').style.display = 'inline-flex';
        const waveBox = document.getElementById('recStatusWave');
        if (waveBox) waveBox.innerHTML = `🔴 रिकॉर्डिंग जारी है... (माइक में बोलें)`;
    } catch (err) {
        console.error("Mic Access Error:", err);
        alert("माइक एक्सेस नहीं मिल पाया। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें।");
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
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

        saveScriptsDataToLocal();
        renderPageChipGrid();
        alert(`✅ Page ${studioCurrentPage} की ऑडियो रिकॉर्डिंग सफलतापूर्वक सेव हो गई!`);
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
        saveScriptsDataToLocal();
        renderPageChipGrid();
        alert(`🗑️ Page ${studioCurrentPage} की ऑडियो हटा दी गई।`);
    }
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

function saveScriptsDataToLocal() {
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
}
