/**
 * =================================================================
 * AAROGYAM INDIA - ADMIN EBOOK VOICE & AUDIO STUDIO PAGE MODULE
 * =================================================================
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

// Media Recorder
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;

export async function initBookAudioStudio() {
    initAdminLayout('eBook Voice & Audio Studio', 'पेज-वाइज़ टेक्स्ट टाइप/पेस्ट करें या सीधे माइक से आवाज़ रिकॉर्ड करें।');
    
    const container = document.getElementById('page-content');
    if (!container) return;

    container.innerHTML = `
        <!-- Header Controls Bar -->
        <div class="admin-card" style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h2 style="margin:0; font-size:1.3rem; color:#f8fafc;">🎧 eBook Voice & Audio Studio</h2>
              <p style="margin:4px 0 0; font-size:0.85rem; color:#94a3b8;">
                पेज-वाइज़ टेक्स्ट टाइप/पेस्ट करें या सीधे माइक से आवाज़ रिकॉर्ड करें।
              </p>
            </div>
            
            <div style="display:flex; gap:10px; align-items:center;">
              <label style="font-size:0.85rem; color:#cbd5e1; font-weight:600;">पुस्तक चुनें:</label>
              <select id="bookSelect" class="admin-input" style="padding:6px 12px; width:240px; font-weight:700;">
                <option value="BK001">BK001: खरीफ फसल मास्टर गाइड 2026</option>
                <option value="BK002">BK002: खेती का डॉक्टर</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Global Settings Bar (BGM + Narrator Setup) -->
        <div class="admin-card" style="margin-bottom: 16px; background:#0f172a;">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; align-items:center;">
            <div>
              <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">🎵 बैकग्राउंड म्यूजिक (BGM):</label>
              <select id="bgmSelect" class="admin-input" style="padding:6px 8px; width:100%;">
                <option value="flute" selected>बांसुरी संगीत (Soothing Flute)</option>
                <option value="tanpura">तानपुरा धुन (Meditative Tanpura)</option>
                <option value="acoustic">शांत गिटार (Acoustic Calm)</option>
                <option value="none">कोई म्यूजिक नहीं (Mute BGM)</option>
              </select>
            </div>

            <div>
              <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">👨 पुरुष नरेटर का नाम:</label>
              <input type="text" id="maleNarratorName" value="दादा अविनाश" class="admin-input" style="padding:6px 8px; width:100%;">
            </div>

            <div>
              <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">👩 महिला नरेटर का नाम:</label>
              <input type="text" id="femaleNarratorName" value="कृषि सखी" class="admin-input" style="padding:6px 8px; width:100%;">
            </div>

            <div>
              <label style="font-size:0.8rem; color:#94a3b8; display:block; margin-bottom:4px;">💾 ग्लोबल सेटिंग:</label>
              <button id="saveGlobalBtn" class="admin-btn admin-btn-primary" style="padding:8px 14px; width:100%; justify-content:center;">
                सेव सेटिंग्स
              </button>
            </div>
          </div>
        </div>

        <!-- Page Selector Bar -->
        <div class="admin-card" style="margin-bottom: 16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-weight:700; font-size:0.9rem; color:#e2e8f0;">पृष्ठ चुनें (Page Selector):</span>
            <span id="pageCountStatus" style="font-size:0.85rem; color:#10b981; font-weight:700;">1 / 152 Pages</span>
          </div>
          <div id="pageChipGrid" class="page-chip-grid" style="display:flex; flex-wrap:wrap; gap:6px; max-height:160px; overflow-y:auto; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #334155;">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Main Studio Split View -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-top:16px;">
          
          <!-- LEFT: LIVE PAGE PREVIEW CANVAS -->
          <div class="admin-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <h3 style="margin:0; font-size:1rem; color:#38bdf8;">📄 पेज प्रिव्यू (Page Preview)</h3>
              <span id="previewPageNumberTag" style="background:#0284c7; color:#fff; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700;">Page 1</span>
            </div>
            <div style="background:#0f172a; border-radius:8px; padding:10px; display:flex; justify-content:center; align-items:center; min-height:400px; max-height:600px; overflow-y:auto;">
              <canvas id="previewCanvas" style="max-width:100%; height:auto; border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.4);"></canvas>
            </div>
          </div>

          <!-- RIGHT: AUDIO & TEXT EDITOR STUDIO -->
          <div class="admin-card">
            <h3 style="margin:0 0 12px; font-size:1rem; color:#34d399;">🎙️ पेज वॉइस एवं टेक्स्ट कंट्रोल</h3>
            
            <!-- OPTION A: TEXT EDITOR (TTS MODE) -->
            <div style="margin-bottom: 18px;">
              <label style="font-weight:700; font-size:0.85rem; color:#e2e8f0; display:block; margin-bottom:6px;">
                🟢 विकल्प A: इस पेज का हिंदी टेक्स्ट (Type / Paste Text):
              </label>
              <textarea id="pageTextInput" rows="6" class="admin-input" style="width:100%; resize:vertical; font-size:0.9rem; line-height:1.5;" placeholder="इस पेज पर लिखा हुआ टेक्स्ट यहाँ पेस्ट करें या टाइप करें..."></textarea>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <button id="testTtsBtn" class="admin-btn admin-btn-secondary" style="padding:6px 12px; font-size:12px;">
                  🔊 टेक्स्ट बोलकर सुनें (TTS Test)
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
                🎙️ विकल्प B: सीधे माइक से अपनी आवाज़ रिकॉर्ड करें:
              </label>
              <p style="margin:0 0 10px; font-size:0.75rem; color:#94a3b8;">
                माइक ऑन करें, पेज देखकर बोलें। यह सीधे 24kbps Opus में कंप्रेस होकर सेव होगा (सिर्फ 15-25 KB per page)।
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
                <div style="font-size:0.8rem; color:#34d399; font-weight:700; margin-bottom:6px;">रिकॉर्ड की गई ऑडियो:</div>
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
            studioCurrentBookId = e.target.value;
            studioCurrentPage = 1;
            loadBookStudio(studioCurrentBookId);
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

    const saveGlobalBtn = document.getElementById('saveGlobalBtn');
    if (saveGlobalBtn) {
        saveGlobalBtn.addEventListener('click', () => saveGlobalSettings());
    }
}

async function loadBookStudio(bookId) {
    try {
        const res = await fetch('../data/books.json');
        const json = await res.json();
        studioBookData = json.books.find(b => b.id === bookId || b.id === bookId.toUpperCase());
    } catch (e) {}

    try {
        let res = await fetch(`../data/audio-scripts/${bookId}.json`);
        if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
        if (res.ok) {
            studioAudioScripts = await res.json();
        } else {
            studioAudioScripts = { bookId: bookId, pages: {} };
        }
    } catch (e) {
        studioAudioScripts = { bookId: bookId, pages: {} };
    }

    // Populate Settings
    if (studioAudioScripts.bgmTrack) {
        const bgm = document.getElementById('bgmSelect');
        if (bgm) bgm.value = studioAudioScripts.bgmTrack;
    }
    if (studioAudioScripts.maleNarrator && studioAudioScripts.maleNarrator.name) {
        const maleInput = document.getElementById('maleNarratorName');
        if (maleInput) maleInput.value = studioAudioScripts.maleNarrator.name;
    }
    if (studioAudioScripts.femaleNarrator && studioAudioScripts.femaleNarrator.name) {
        const femaleInput = document.getElementById('femaleNarratorName');
        if (femaleInput) femaleInput.value = studioAudioScripts.femaleNarrator.name;
    }

    // Load PDF
    const pdfUrl = (studioBookData && studioBookData.mainPdf) 
        ? ('..' + studioBookData.mainPdf) 
        : `../pdf/full/${bookId}.pdf`;

    try {
        studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        studioTotalPages = studioPdfDoc.numPages;
    } catch (err) {
        console.error("Studio PDF Load Error:", err);
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
        chip.style.padding = '4px 10px';
        chip.style.borderRadius = '6px';
        chip.style.fontSize = '12px';
        chip.style.cursor = 'pointer';
        chip.style.transition = 'all 0.2s';
        
        const pageData = studioAudioScripts.pages && studioAudioScripts.pages[String(p)];
        let hasContent = false;
        if (pageData) {
            if (typeof pageData === 'string' && pageData.trim().length > 0) hasContent = true;
            if (typeof pageData === 'object' && ((pageData.text && pageData.text.trim()) || pageData.audio)) hasContent = true;
        }

        if (p === studioCurrentPage) {
            chip.style.background = '#10b981';
            chip.style.color = '#fff';
            chip.style.fontWeight = '700';
        } else if (hasContent) {
            chip.style.background = '#064e3b';
            chip.style.color = '#6ee7b7';
            chip.style.border = '1px solid #10b981';
        } else {
            chip.style.background = '#334155';
            chip.style.color = '#cbd5e1';
        }

        chip.innerHTML = hasContent ? `Pg ${p} ✅` : `Pg ${p}`;
        chip.addEventListener('click', () => selectPage(p));
        grid.appendChild(chip);
    }
}

async function selectPage(pageNum) {
    studioCurrentPage = pageNum;
    renderPageChipGrid();

    const pageTag = document.getElementById('previewPageNumberTag');
    if (pageTag) pageTag.textContent = `Page ${pageNum}`;

    if (studioPdfDoc) {
        try {
            const page = await studioPdfDoc.getPage(pageNum);
            const canvas = document.getElementById('previewCanvas');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const viewport = page.getViewport({ scale: 1.0 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
            }
        } catch (e) {
            console.error("Error rendering preview page:", e);
        }
    }

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

function saveGlobalSettings() {
    const bgm = document.getElementById('bgmSelect').value;
    const maleName = document.getElementById('maleNarratorName').value;
    const femaleName = document.getElementById('femaleNarratorName').value;

    studioAudioScripts.bgmTrack = bgm;
    studioAudioScripts.maleNarrator = { name: maleName, avatar: '/images/logo/logo.png' };
    studioAudioScripts.femaleNarrator = { name: femaleName, avatar: '/images/logo/fevicon.png' };

    saveScriptsDataToLocal();
    alert("✅ BGM और नरेटर सेटिंग्स सफलतापूर्वक सेव हो गई!");
}

function saveScriptsDataToLocal() {
    localStorage.setItem(`AOI_AUDIO_SCRIPTS_${studioCurrentBookId}`, JSON.stringify(studioAudioScripts));
}
