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
let isSyncInProgress = false; // Anti-duplicate click lock
let modifiedPageIndices = new Set(); // Stores 0-indexed page numbers that changed
let audioScriptsModified = false; // Flag if text or audio voice changed
let isFullBookReload = false; // Flag if bulk upload or fresh PDF was loaded

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
              <button id="openImportModalBtn" class="admin-btn" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; padding:8px 14px; font-weight:700; font-size:12px; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(99,102,241,0.3);" title="किसी भी अन्य पुस्तक से पेजेस और उनका ऑडियो सीधे इस नई पुस्तक में जोड़ें">
                <span>📚</span> अन्य पुस्तक से जोड़ें (Import / Reuse Pages)
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
                  <option value="END">📌 सबसे आखिर में जोड़ें (End of Book)</option>
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
        const res = await fetch('../data/books.json');
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
        landingPages = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
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
    mainBooks.forEach(b => {
        if (b && b.id) uniqueMainMap.set(b.id.toUpperCase(), { id: b.id.toUpperCase(), title: b.heading || b.name || b.id });
    });
    customBooks.forEach(b => {
        if (b && b.id && !b.id.toUpperCase().startsWith('DEMO') && !b.id.toUpperCase().startsWith('FREE') && !b.id.toUpperCase().startsWith('BONUS') && !uniqueMainMap.has(b.id.toUpperCase())) {
            uniqueMainMap.set(b.id.toUpperCase(), { id: b.id.toUpperCase(), title: b.heading || b.name || b.id });
        }
    });
    landingPages.forEach(p => {
        if (p && p.id && !uniqueMainMap.has(p.id.toUpperCase())) {
            uniqueMainMap.set(p.id.toUpperCase(), { id: p.id.toUpperCase(), title: p.hero?.title || p.id });
        }
    });

    const demoBooksList = freeDemoBooks.filter(b => b.type === 'demo' || b.isDemo || (b.id && b.id.toUpperCase().startsWith('DEMO')));
    const bonusBooksList = freeDemoBooks.filter(b => b.type === 'bonus_free' || b.isBonus || (b.id && (b.id.toUpperCase().startsWith('FREE') || b.id.toUpperCase().startsWith('BONUS'))));

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
    if (demoBooksList.length > 0) {
        const ogDemo = document.createElement('optgroup');
        ogDemo.label = '📖 डेमो पुस्तकें (Demo Books)';
        demoBooksList.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id.toUpperCase();
            opt.textContent = `${b.id.toUpperCase()}: ${b.heading || b.name || 'डेमो पुस्तक'}`;
            if (opt.value === selectedId) opt.selected = true;
            ogDemo.appendChild(opt);
        });
        bookSelect.appendChild(ogDemo);
    }

    // OptGroup 3: Free Bonus Books
    if (bonusBooksList.length > 0) {
        const ogBonus = document.createElement('optgroup');
        ogBonus.label = '🎁 फ्री बोनस पुस्तकें (Free Bonus Books)';
        bonusBooksList.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id.toUpperCase();
            opt.textContent = `${b.id.toUpperCase()}: ${b.heading || b.name || 'फ्री बोनस'}`;
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
}

// =======================================================
// 3. STUDIO EVENTS & WORKFLOW
// =======================================================
async function setupStudioEvents() {
    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) {
        await populateStudioBookSelect(studioCurrentBookId);

        bookSelect.addEventListener('change', (e) => {
            if (e.target.value === '__NEW__') {
                const newCode = prompt("नया बुक / डेमो कोड दर्ज करें (उदा. BK003 या DEMO002 या FREE002):");
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
        executeImportBtn.addEventListener('click', () => executeImportPages());
    }

    const quickImportBtn = document.getElementById('quickImportBtn');
    if (quickImportBtn) {
        quickImportBtn.addEventListener('click', () => executeImportPages());
    }
}

// =======================================================
// 4. LOAD BOOK STUDIO (INDEXEDDB + GIT + PDF)
// =======================================================
async function loadBookStudio(bookId) {
    studioPdfDoc = null;
    studioPageImages = [];
    studioAudioScripts = { bookId: bookId, pages: {} };
    modifiedPageIndices.clear();
    audioScriptsModified = false;
    isFullBookReload = false;
    markUnsaved(false);

    // 1. Check in Free Demo books list
    let freeDemoBook = null;
    try {
        const fList = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
        freeDemoBook = fList.find(b => b.id && b.id.toUpperCase() === bookId.toUpperCase());
    } catch (e) {}

    // 2. Fetch from books.json / custom books
    try {
        const res = await fetch('../data/books.json');
        const json = await res.json();
        studioBookData = json.books.find(b => b.id === bookId || b.id === bookId.toUpperCase());
    } catch (e) {}

    if (!studioBookData) {
        try {
            const customList = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            studioBookData = customList.find(b => b.id && b.id.toUpperCase() === bookId.toUpperCase());
        } catch (e) {}
    }

    if (!studioBookData && freeDemoBook) {
        studioBookData = freeDemoBook;
    }

    // 3. Try loading from IndexedDB first (Cached/Staged WebP Pages)
    const dbImages = await loadPagesFromDb(bookId);
    if (dbImages && dbImages.length > 0) {
        studioPageImages = dbImages;
        studioTotalPages = dbImages.length;
    } else if (freeDemoBook && (freeDemoBook.demoImages?.length || freeDemoBook.pageImages?.length)) {
        studioPageImages = freeDemoBook.demoImages || freeDemoBook.pageImages || [];
        studioTotalPages = studioPageImages.length;
    }

    // 4. Try loading from LocalStorage
    if (!studioPageImages.length) {
        try {
            const localPages = localStorage.getItem(`AOI_BOOK_PAGES_${bookId.toUpperCase()}`);
            if (localPages) {
                const parsedPages = JSON.parse(localPages);
                if (Array.isArray(parsedPages) && parsedPages.length > 0) {
                    studioPageImages = parsedPages;
                    studioTotalPages = parsedPages.length;
                }
            }
        } catch (e) {}
    }

    // 5. Try loading from Static WebP images in Repository / books.json
    if (!studioPageImages.length) {
        const cleanId = String(bookId).toUpperCase();
        const total = (studioBookData && studioBookData.totalPages) 
            ? studioBookData.totalPages 
            : (cleanId === 'BK001' ? 152 : (cleanId === 'BK002' ? 118 : 0));
        const basePath = (studioBookData && studioBookData.pageImagesPath) 
            ? studioBookData.pageImagesPath 
            : `images/books/${cleanId}`;

        if (total > 0 && (studioBookData?.hasWebpPages || cleanId === 'BK001' || cleanId === 'BK002')) {
            studioPageImages = [];
            for (let p = 1; p <= total; p++) {
                studioPageImages.push(`../${basePath}/${p}.webp`);
            }
            studioTotalPages = total;
        } else {
            // Probe static file in repository
            try {
                const probe = await fetch(`../images/books/${cleanId}/1.webp`, { method: 'HEAD' });
                if (probe.ok) {
                    const count = total > 0 ? total : 100;
                    studioPageImages = [];
                    for (let p = 1; p <= count; p++) {
                        studioPageImages.push(`../images/books/${cleanId}/${p}.webp`);
                    }
                    studioTotalPages = count;
                }
            } catch (e) {}
        }
    }

    // 6. Check custom book pageImages/demoImages in JSON
    if (!studioPageImages.length && studioBookData) {
        if (Array.isArray(studioBookData.pageImages) && studioBookData.pageImages.length > 0) {
            studioPageImages = studioBookData.pageImages.map(img => img.startsWith('/') ? ('..' + img) : img);
            studioTotalPages = studioPageImages.length;
        } else if (Array.isArray(studioBookData.demoImages) && studioBookData.demoImages.length > 0) {
            studioPageImages = studioBookData.demoImages.map(img => img.startsWith('/') ? ('..' + img) : img);
            studioTotalPages = studioPageImages.length;
        }
    }

    // 7. Load Audio Scripts
    try {
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
        if (localData) {
            studioAudioScripts = JSON.parse(localData);
        } else {
            let res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                studioAudioScripts = await res.json();
            } else if (freeDemoBook && freeDemoBook.audioUrl) {
                studioAudioScripts = {
                    bookId: bookId,
                    pages: {
                        "1": { text: freeDemoBook.subtitle || freeDemoBook.name || '', audio: freeDemoBook.audioUrl }
                    }
                };
            }
        }
    } catch (e) {
        studioAudioScripts = { bookId: bookId, pages: {} };
    }

    // 8. Fallback to PDF if no WebP images yet
    if (!studioPageImages.length) {
        const pdfUrl = (studioBookData && (studioBookData.mainPdf || studioBookData.pdf_url || studioBookData.demoPdf || studioBookData.freePdf)) 
            ? ('..' + (studioBookData.mainPdf || studioBookData.pdf_url || studioBookData.demoPdf || studioBookData.freePdf)) 
            : `../pdf/full/${bookId}.pdf`;

        try {
            studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
            studioTotalPages = studioPdfDoc.numPages;
        } catch (err) {
            console.warn("PDF Load warning:", err);
            studioTotalPages = (freeDemoBook && (freeDemoBook.demoImages?.length || freeDemoBook.pageImages?.length)) ? (freeDemoBook.demoImages?.length || freeDemoBook.pageImages?.length) : 1;
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
            const imgSrc = studioPageImages[pageNum - 1];
            if (typeof imgSrc === 'string' && imgSrc.startsWith('data:')) {
                const sizeKb = Math.round((imgSrc.length * (3/4)) / 1024);
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
            modifiedPageIndices.add(studioCurrentPage - 1);
            markUnsaved(true);
            selectPage(studioCurrentPage);
            alert(`✅ पृष्ठ ${studioCurrentPage} बदल दिया गया है!\n"1-Click Push to Git" दबाने पर सिर्फ यही 1 पेज Git पर तुरंत लाइव होगा।`);
            return;
        }
    }

    // Case B: Bulk Upload
    isFullBookReload = true;
    modifiedPageIndices.clear();
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
    // SMART DELTA DETERMINATION: What actually needs to be synced?
    // -------------------------------------------------------------
    let pagesToUpload = [];
    let isDeltaAudioOnly = false;
    let isDeltaSinglePage = false;

    if (isFullBookReload || (modifiedPageIndices.size === 0 && !audioScriptsModified)) {
        // Full book upload (First time or bulk re-upload)
        pagesToUpload = Array.from({ length: total }, (_, i) => i);
    } else if (modifiedPageIndices.size === 0 && audioScriptsModified) {
        // Audio or Text changed ONLY (ZERO image changes)
        isDeltaAudioOnly = true;
    } else {
        // Specific pages were replaced/added
        pagesToUpload = Array.from(modifiedPageIndices).sort((a, b) => a - b);
        if (pagesToUpload.length === 1) isDeltaSinglePage = true;
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

    audioScriptsModified = true;
    markUnsaved(true);
    renderPageChipGrid();
    alert(`✅ Page ${studioCurrentPage} का टेक्स्ट सेव हो गया!\n"1-Click Push to Git" दबाने पर सिर्फ 0.5 सेकंड में ऑडियो स्क्रिप्ट Git पर लाइव हो जाएगी।`);
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
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    if (audioSrc && audioSrc.trim().length > 0) {
        modalAudioPlayer = new Audio(audioSrc);
        modalAudioPlayer.play().catch(e => console.warn("Audio preview error:", e));
    } else if (textSrc && textSrc.trim().length > 0 && ('speechSynthesis' in window)) {
        const ut = new SpeechSynthesisUtterance(textSrc);
        ut.lang = 'hi-IN';
        ut.rate = 0.95;
        ut.pitch = 1.0;
        window.speechSynthesis.speak(ut);
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

async function executeImportPages() {
    const checkboxes = Array.from(document.querySelectorAll('.import-page-cb:checked'));
    if (!checkboxes.length) {
        alert("कृपया कम से कम 1 पेज चुनें जिसे आप इस पुस्तक में जोड़ना चाहते हैं।");
        return;
    }

    const sourceBookSelect = document.getElementById('importSourceBookSelect');
    const sourceBookId = sourceBookSelect ? sourceBookSelect.value : 'BK001';
    const placementSelect = document.getElementById('importPlacementSelect');
    const placement = placementSelect ? placementSelect.value : 'END';
    const includeAudio = document.getElementById('importIncludeAudioCheck')?.checked ?? true;

    const selectedPages = checkboxes.map(cb => parseInt(cb.dataset.page, 10)).sort((a, b) => a - b);

    const executeBtn = document.getElementById('executeImportBtn');
    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.innerHTML = `<span>⏳</span> पेजेस इंपोर्ट हो रहे हैं...`;
    }

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

    if (placement === 'BEGINNING') {
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

    if (executeBtn) {
        executeBtn.disabled = false;
        executeBtn.innerHTML = `<span>✨</span> <span id="executeImportBtnText">0 पेजेस और ऑडियो इंपोर्ट करें</span>`;
    }

    // Close Modal
    const modal = document.getElementById('importPagesModal');
    if (modal) modal.style.display = 'none';

    renderPageChipGrid();
    const newFocusPage = (placement === 'BEGINNING') ? 1 : ((placement === 'AFTER_CURRENT') ? studioCurrentPage + 1 : (currentImages.length > 0 ? currentImages.length + 1 : 1));
    selectPage(newFocusPage);

    alert(`🎉 बधाई! पुस्तक [${sourceBookId}] से ${selectedPages.length} पेजेस और उनका ऑडियो [${studioCurrentBookId}] में सफलतापूर्वक जुड़ गए हैं!\n\n💡 स्वतंत्र संपादन (Independent Editing):\nअब आप किसी भी पेज पर जाकर उसकी आवाज़ दोबारा रिकॉर्ड कर सकते हैं या नया टेक्स्ट लिख सकते हैं। इससे मूल पुस्तक (${sourceBookId}) में कोई छेड़छाड़ नहीं होगी!\n\nसारे बदलाव फाइनल करने के लिए "🚀 1-Click Push to Git" बटन दबाएं।`);
}

