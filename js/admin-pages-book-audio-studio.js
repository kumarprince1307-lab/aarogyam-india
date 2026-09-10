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
        store.put(imagesArray, bookId);
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
        const req = store.get(bookId);
        return new Promise((res) => {
            req.onsuccess = () => res(req.result || null);
            req.onerror = () => res(null);
        });
    } catch (e) {
        return null;
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
              <button id="triggerDirectPdfBtn" class="admin-btn admin-btn-secondary" style="padding:8px 12px; font-size:12px;" title="सीधे PDF फाइल अपलोड करें (ऑटोमैटिक WebP में बदल जाएगी)">
                📄 Upload Direct PDF
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
            </div>
          </div>

          <!-- Real-Time Progress Bar & Metrics -->
          <div id="uploadProgressSection" style="display:none; margin-top:14px; background:#1e293b; padding:12px; border-radius:8px; border:1px solid #334155;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span id="progressStatusLabel" style="font-size:0.85rem; font-weight:700; color:#38bdf8;">प्रगति: 0 / 0 पेजेस</span>
              <span id="progressSizeLabel" style="font-size:0.8rem; color:#94a3b8;">कुल साइज: 0 KB</span>
            </div>
            <div style="width:100%; height:8px; background:#0f172a; border-radius:4px; overflow:hidden;">
              <div id="progressFillBar" style="width:0%; height:100%; background:linear-gradient(90deg, #10b981, #38bdf8); transition:width 0.2s;"></div>
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
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-weight:700; font-size:0.9rem; color:#e2e8f0;">पृष्ठ चुनें (Page Selector):</span>
              <span id="pageCountStatus" style="font-size:0.85rem; color:#10b981; font-weight:700;">1 / 152 Pages</span>
              <span id="currentPageSizeTag" style="font-size:0.75rem; background:#334155; color:#94a3b8; padding:2px 6px; border-radius:4px;">Size: -- KB</span>
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

// =======================================================
// 3. STUDIO EVENTS & WORKFLOW
// =======================================================
async function setupStudioEvents() {
    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) {
        try {
            const res = await fetch('../data/books.json');
            if (res.ok) {
                const json = await res.json();
                if (json.books && json.books.length) {
                    bookSelect.innerHTML = '';
                    json.books.forEach(b => {
                        const opt = document.createElement('option');
                        opt.value = b.id || b.slug;
                        opt.textContent = `${b.id}: ${b.heading || b.name || b.shortTitle}`;
                        if (opt.value === studioCurrentBookId) opt.selected = true;
                        bookSelect.appendChild(opt);
                    });
                    const newOpt = document.createElement('option');
                    newOpt.value = '__NEW__';
                    newOpt.textContent = '➕ नया बुक / डेमो कोड जोड़ें...';
                    bookSelect.appendChild(newOpt);
                }
            }
        } catch (e) {}

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
        bulkInput.addEventListener('change', (e) => handleImageUpload(e.target.files));
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

// =======================================================
// 4. LOAD BOOK STUDIO (INDEXEDDB + GIT + PDF)
// =======================================================
async function loadBookStudio(bookId) {
    studioPdfDoc = null;
    studioPageImages = [];
    studioAudioScripts = { bookId: bookId, pages: {} };
    markUnsaved(false);

    // 1. Fetch from books.json
    try {
        const res = await fetch('../data/books.json');
        const json = await res.json();
        studioBookData = json.books.find(b => b.id === bookId || b.id === bookId.toUpperCase());
    } catch (e) {}

    // 2. Try loading from IndexedDB first (Cached/Staged WebP Pages)
    const dbImages = await loadPagesFromDb(bookId);
    if (dbImages && dbImages.length > 0) {
        studioPageImages = dbImages;
        studioTotalPages = dbImages.length;
    }

    // 3. Load Audio Scripts
    try {
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
        if (localData) {
            studioAudioScripts = JSON.parse(localData);
        } else {
            let res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                studioAudioScripts = await res.json();
            }
        }
    } catch (e) {
        studioAudioScripts = { bookId: bookId, pages: {} };
    }

    // 4. Fallback to PDF if no WebP images yet
    if (!studioPageImages.length) {
        const pdfUrl = (studioBookData && studioBookData.mainPdf) 
            ? ('..' + studioBookData.mainPdf) 
            : `../pdf/full/${bookId}.pdf`;

        try {
            studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
            studioTotalPages = studioPdfDoc.numPages;
        } catch (err) {
            console.warn("PDF Load warning:", err);
            studioTotalPages = 1;
        }
    } else {
        studioTotalPages = studioPageImages.length;
    }

    // Create a pristine backup for Discard
    studioOriginalBackup = {
        images: [...studioPageImages],
        scripts: JSON.parse(JSON.stringify(studioAudioScripts)),
        totalPages: studioTotalPages
    };

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

    const sizeTag = document.getElementById('currentPageSizeTag');
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
            
            // Calculate approximate size
            const base64Str = studioPageImages[pageNum - 1];
            const sizeKb = Math.round((base64Str.length * (3/4)) / 1024);
            if (sizeTag) sizeTag.textContent = `Size: ${sizeKb} KB (WebP HD)`;
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
}

// =======================================================
// 5. BULK UPLOAD WITH PROGRESS BAR & SIZE METRICS
// =======================================================
async function handleImageUpload(files) {
    if (!files || !files.length) return;

    const fileList = Array.from(files);

    // Case A: Single File Upload -> Check whether user wants to replace ONLY current page
    if (fileList.length === 1 && studioTotalPages > 1) {
        const replaceSingle = confirm(`क्या आप सिर्फ वर्तमान पृष्ठ (Page ${studioCurrentPage}) को बदलना चाहते हैं?\n(OK = केवल Page ${studioCurrentPage} बदलें | Cancel = सभी पेजों को 1 पेज से बदलें)`);
        if (replaceSingle) {
            const webpData = await readFileAsWebp(fileList[0]);
            if (!studioPageImages.length) studioPageImages = new Array(studioTotalPages).fill('');
            studioPageImages[studioCurrentPage - 1] = webpData;
            markUnsaved(true);
            selectPage(studioCurrentPage);
            alert(`✅ पृष्ठ ${studioCurrentPage} सफलतापूर्वक बदल दिया गया है! "Save All" दबाकर सुरक्षित करें।`);
            return;
        }
    }

    // Case B: Bulk Upload
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
        if (sizeLabel) sizeLabel.textContent = `वर्तमान फाइल: ${file.name} (${Math.round(currentBytes / 1024)} KB) • कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        if (fillBar) fillBar.style.width = `${percent}%`;

        // Small yield to let UI breathe smoothly
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
    }

    studioPageImages = processedImages;
    studioTotalPages = processedImages.length;

    // Auto save immediately to IndexedDB so reader gets full 152 pages instantly
    await savePagesToDb(studioCurrentBookId, studioPageImages);

    markUnsaved(false);
    renderPageChipGrid();
    selectPage(1);

    if (progressLabel) progressLabel.textContent = `🎉 पूरे ${fileList.length} पेज सुरक्षित रूप से सेव हो गए! (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
    alert(`🎉 बधाई हो! सभी ${fileList.length} पेज सफलतापूर्वक WebP में बदलकर सुरक्षित सेव हो गए हैं!\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\nआप तुरंत रीडर में जाकर पूरे ${fileList.length} पेज देख सकते हैं!`);
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

    if (!confirm(`क्या आप इस PDF के सभी ${studioTotalPages} पेजों को WebP इमेज में बदलना चाहते हैं?`)) return;

    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    if (progressSection) progressSection.style.display = 'block';

    const images = [];
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    let totalBytes = 0;

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

        const currentBytes = Math.round(webpData.length * (3/4));
        totalBytes += currentBytes;

        const percent = Math.round((p / studioPdfDoc.numPages) * 100);
        if (progressLabel) progressLabel.textContent = `PDF पेज कनवर्ट हो रहा है: ${p} / ${studioPdfDoc.numPages} (${percent}%)`;
        if (sizeLabel) sizeLabel.textContent = `कुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        if (fillBar) fillBar.style.width = `${percent}%`;

        if (p % 4 === 0) await new Promise(r => setTimeout(r, 10));
    }

    studioPageImages = images;
    studioTotalPages = images.length;

    await savePagesToDb(studioCurrentBookId, studioPageImages);

    markUnsaved(false);
    renderPageChipGrid();
    selectPage(1);

    if (progressLabel) progressLabel.textContent = `🎉 PDF के सभी ${images.length} पेज WebP में तैयार! (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
    alert(`🎉 बधाई हो! PDF के सभी ${images.length} पेज 100% HD WebP में बदल गए हैं!\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\nअब आप तुरंत रीडर में पूरे ${images.length} पेज देख सकते हैं!`);
}

// Direct PDF File Upload Handler (Auto converts any PDF file to WebP pages)
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
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const total = pdfDoc.numPages;

        const images = [];
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        let totalBytes = 0;

        for (let p = 1; p <= total; p++) {
            const page = await pdfDoc.getPage(p);
            const viewport = page.getViewport({ scale: 1.5 });

            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;

            await page.render({
                canvasContext: tempCtx,
                viewport: viewport
            }).promise;

            const webpData = tempCanvas.toDataURL('image/webp', 0.88);
            images.push(webpData);

            const currentBytes = Math.round(webpData.length * (3/4));
            totalBytes += currentBytes;

            const percent = Math.round((p / total) * 100);
            if (progressLabel) progressLabel.textContent = `PDF पेज कनवर्ट हो रहा है: ${p} / ${total} (${percent}%)`;
            if (sizeLabel) sizeLabel.textContent = `कुल WebP साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
            if (fillBar) fillBar.style.width = `${percent}%`;

            if (p % 4 === 0) await new Promise(r => setTimeout(r, 10));
        }

        studioPageImages = images;
        studioTotalPages = images.length;
        studioPdfDoc = pdfDoc;

        await savePagesToDb(studioCurrentBookId, studioPageImages);

        markUnsaved(false);
        renderPageChipGrid();
        selectPage(1);

        if (progressLabel) progressLabel.textContent = `🎉 PDF के सभी ${images.length} पेज WebP में तैयार! (कुल: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`;
        alert(`🎉 बधाई हो! आपकी PDF के सभी ${images.length} पेज 100% HD WebP में बदलकर सुरक्षित सेव हो गए हैं!\nकुल साइज: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB\n\nअब आप तुरंत रीडर में पूरे ${images.length} पेज देख सकते हैं!`);
    } catch (err) {
        console.error("Direct PDF Parse Error:", err);
        alert("PDF फाइल प्रोसेस करने में समस्या आई। कृपया फाइल जांचें।");
    }
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

    // 3. Update backup
    studioOriginalBackup = {
        images: [...studioPageImages],
        scripts: JSON.parse(JSON.stringify(studioAudioScripts)),
        totalPages: studioTotalPages
    };

    markUnsaved(false);
    alert(`✅ पुस्तक [${studioCurrentBookId}] के सभी ${studioTotalPages} पेज और ऑडियो सफलतापूर्वक सेव हो गए हैं!`);
}

function discardDraftChanges() {
    if (!confirm("क्या आप सभी बिना सेव किए गए बदलाव रद्द करके पहले जैसा करना चाहते हैं?")) return;

    if (studioOriginalBackup) {
        studioPageImages = [...studioOriginalBackup.images];
        studioAudioScripts = JSON.parse(JSON.stringify(studioOriginalBackup.scripts));
        studioTotalPages = studioOriginalBackup.totalPages;
    }

    markUnsaved(false);
    renderPageChipGrid();
    selectPage(1);
    alert("↩️ सभी बदलाव रद्द कर दिए गए हैं। पिछला सेव किया हुआ डेटा लोड हो गया है।");
}

// =======================================================
// 7. 1-CLICK DIRECT GITHUB API AUTO-SYNC (ZERO-EGRESS)
// =======================================================
async function syncStudioToGitHub() {
    if (!studioPageImages || !studioPageImages.length) {
        alert("पुश करने के लिए कोई WebP पेज उपलब्ध नहीं हैं।\nकृपया पहले 'Upload Pages' या 'Upload Direct PDF' से पेज लोड करें।");
        return;
    }

    const total = studioPageImages.length;
    const isConfirmed = confirm(`🚀 क्या आप पुस्तक [${studioCurrentBookId}] के सभी ${total} पेज (WebP) और ऑडियो स्क्रिप्ट सीधे GitHub पर 1-Click में लाइव पुश करना चाहते हैं?\n\n- सभी पेज 'images/books/${studioCurrentBookId}/' में सुरक्षित सेव होंगे\n- ऑडियो स्क्रिप्ट 'data/audio-scripts/${studioCurrentBookId}.json' में सेव होगी\n- कोई मैन्युअल फोल्डर बनाने की आवश्यकता नहीं है!`);
    if (!isConfirmed) return;

    const gitSyncBtn = document.getElementById('gitAutoSyncBtn');
    const gitPushStagingBtn = document.getElementById('gitPushStagingBtn');
    const progressSection = document.getElementById('uploadProgressSection');
    const progressLabel = document.getElementById('progressStatusLabel');
    const sizeLabel = document.getElementById('progressSizeLabel');
    const fillBar = document.getElementById('progressFillBar');

    const origText = gitSyncBtn ? gitSyncBtn.innerHTML : '';
    if (gitSyncBtn) {
        gitSyncBtn.disabled = true;
        gitSyncBtn.innerHTML = `<span>⏳</span> Git पर पुश हो रहा है...`;
    }
    if (gitPushStagingBtn) {
        gitPushStagingBtn.disabled = true;
        gitPushStagingBtn.innerHTML = `<span>⏳</span> Git Push...`;
    }

    if (progressSection) progressSection.style.display = 'block';

    let uploadedCount = 0;
    let totalBytes = 0;
    const failedPages = [];

    // Concurrency Worker Pool (Batch of 3 parallel uploads for high speed & zero timeouts)
    const concurrency = 3;
    const pageIndices = Array.from({ length: total }, (_, i) => i);

    async function uploadWorker() {
        while (pageIndices.length > 0) {
            const i = pageIndices.shift();
            const pageNum = i + 1;
            const base64Data = studioPageImages[i];
            const pagePath = `images/books/${studioCurrentBookId}/${pageNum}.webp`;

            try {
                const res = await fetch('/api/auto-sync-book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'upload_asset',
                        path: pagePath,
                        base64: base64Data
                    })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success) {
                    throw new Error(data.error || `HTTP ${res.status}`);
                }

                uploadedCount++;
                const approxBytes = Math.round(base64Data.length * (3/4));
                totalBytes += approxBytes;

                const percent = Math.round((uploadedCount / total) * 90);
                if (progressLabel) progressLabel.textContent = `🚀 Git पर सिंक हो रहा है: ${uploadedCount} / ${total} पेजेस (${percent}%)`;
                if (sizeLabel) sizeLabel.textContent = `अपलोड हुआ: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB • पेज: ${pageNum}.webp`;
                if (fillBar) fillBar.style.width = `${percent}%`;

            } catch (err) {
                console.error(`Error uploading page ${pageNum}:`, err);
                failedPages.push(pageNum);
            }
        }
    }

    try {
        const workers = Array.from({ length: Math.min(concurrency, total) }, () => uploadWorker());
        await Promise.all(workers);

        if (failedPages.length > 0) {
            alert(`⚠️ कुछ पेजों (${failedPages.join(', ')}) को अपलोड करने में समस्या आई। कृपया दोबारा पुश दबाएं।`);
            return;
        }

        // Final Step: Commit data/audio-scripts/{bookId}.json & update catalog manifest
        if (progressLabel) progressLabel.textContent = `⏳ ऑडियो स्क्रिप्ट और कैटलॉग Git पर सुरक्षित हो रहा है...`;
        if (fillBar) fillBar.style.width = `95%`;

        const manifestRes = await fetch('/api/auto-sync-book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'save_audio_studio',
                bookId: studioCurrentBookId,
                totalPages: total,
                audioScripts: studioAudioScripts
            })
        });

        const manifestData = await manifestRes.json().catch(() => ({}));
        if (!manifestRes.ok || !manifestData.success) {
            throw new Error(manifestData.error || `Manifest Save Failed (HTTP ${manifestRes.status})`);
        }

        // Save locally to IndexedDB as well
        await savePagesToDb(studioCurrentBookId, studioPageImages);
        localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));

        markUnsaved(false);
        if (fillBar) fillBar.style.width = `100%`;
        if (progressLabel) progressLabel.textContent = `🎉 पुस्तक [${studioCurrentBookId}] के सभी ${total} पेज Git पर सफलतापूर्वक लाइव हो गए!`;

        alert(`🎉 बधाई हो!\n\nपुस्तक [${studioCurrentBookId}] के सभी ${total} पेज और ऑडियो स्क्रिप्ट GitHub API से 1-Click में सफलतापूर्वक पुश हो गए हैं!\n\n📁 पाथ: images/books/${studioCurrentBookId}/1.webp से ${total}.webp\n📄 स्क्रिप्ट: data/audio-scripts/${studioCurrentBookId}.json\n\nअब दुनिया के किसी भी मोबाइल/कंप्यूटर में यह बुक 0.1 सेकंड में सुपरफास्ट लाइव खुलेगी!`);

    } catch (netErr) {
        console.error("Auto Sync Error:", netErr);
        alert(`❌ Git Auto-Sync में त्रुटि:\n${netErr.message || 'नेटवर्क कनेक्शन जांचें'}`);
    } finally {
        if (gitSyncBtn) {
            gitSyncBtn.disabled = false;
            gitSyncBtn.innerHTML = origText;
        }
        if (gitPushStagingBtn) {
            gitPushStagingBtn.disabled = false;
            gitPushStagingBtn.innerHTML = `🚀 1-Click Push to Git`;
        }
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
        if (studioPageImages.length >= studioCurrentPage) {
            studioPageImages.splice(studioCurrentPage - 1, 1);
        }
        delete studioAudioScripts.pages[String(studioCurrentPage)];
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
    if (!studioAudioScripts.pages[String(studioCurrentPage)]) {
        studioAudioScripts.pages[String(studioCurrentPage)] = {};
    }

    if (typeof studioAudioScripts.pages[String(studioCurrentPage)] === 'string') {
        studioAudioScripts.pages[String(studioCurrentPage)] = { text: text, audio: '' };
    } else {
        studioAudioScripts.pages[String(studioCurrentPage)].text = text;
    }

    markUnsaved(true);
    renderPageChipGrid();
    alert(`✅ Page ${studioCurrentPage} का टेक्स्ट सेव हो गया! "Save All" दबाकर सुरक्षित करें।`);
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

        markUnsaved(true);
        renderPageChipGrid();
        alert(`✅ Page ${studioCurrentPage} की ऑडियो रिकॉर्डिंग सेव हो गई! "Save All" दबाकर सुरक्षित करें।`);
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
        markUnsaved(true);
        renderPageChipGrid();
        alert(`🗑️ Page ${studioCurrentPage} की ऑडियो हटा दी गई।`);
    }
}
