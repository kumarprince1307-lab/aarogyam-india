/**
 * =================================================================
 * AAROGYAM INDIA - ADMIN EBOOK VOICE & AUDIO STUDIO CONTROLLER v1.0
 * =================================================================
 */

// PDF.js Worker Configuration
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

let studioPdfDoc = null;
let studioCurrentBookId = 'BK001';
let studioCurrentPage = 1;
let studioTotalPages = 152;
let studioBookData = null;
let studioAudioScripts = { pages: {} };

// Media Recorder Variables
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🎙️ Admin Audio Studio Initializing...");
    setupEventListeners();
    await loadBookStudio(studioCurrentBookId);
});

function setupEventListeners() {
    const bookSelect = document.getElementById('bookSelect');
    if (bookSelect) {
        bookSelect.addEventListener('change', (e) => {
            studioCurrentBookId = e.target.value;
            studioCurrentPage = 1;
            loadBookStudio(studioCurrentBookId);
        });
    }

    // Text Editor Buttons
    const savePageTextBtn = document.getElementById('savePageTextBtn');
    if (savePageTextBtn) {
        savePageTextBtn.addEventListener('click', () => saveCurrentPageText());
    }

    const testTtsBtn = document.getElementById('testTtsBtn');
    if (testTtsBtn) {
        testTtsBtn.addEventListener('click', () => testCurrentPageTts());
    }

    // Audio Recorder Buttons
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

// =======================================================
// LOAD BOOK STUDIO
// =======================================================
async function loadBookStudio(bookId) {
    console.log(`Loading Studio for: ${bookId}`);
    
    // 1. Fetch books.json metadata
    try {
        const res = await fetch('../data/books.json');
        const json = await res.json();
        studioBookData = json.books.find(b => b.id === bookId || b.id === bookId.toUpperCase());
    } catch (e) {
        console.warn("Failed to load books.json", e);
    }

    // 2. Fetch or initialize audio scripts
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

    // Populate Global Settings
    if (studioAudioScripts.bgmTrack) {
        const bgmSelect = document.getElementById('bgmSelect');
        if (bgmSelect) bgmSelect.value = studioAudioScripts.bgmTrack;
    }
    if (studioAudioScripts.maleNarrator && studioAudioScripts.maleNarrator.name) {
        const maleInput = document.getElementById('maleNarratorName');
        if (maleInput) maleInput.value = studioAudioScripts.maleNarrator.name;
    }
    if (studioAudioScripts.femaleNarrator && studioAudioScripts.femaleNarrator.name) {
        const femaleInput = document.getElementById('femaleNarratorName');
        if (femaleInput) femaleInput.value = studioAudioScripts.femaleNarrator.name;
    }

    // 3. Load PDF
    const pdfUrl = (studioBookData && studioBookData.mainPdf) 
        ? ('..' + studioBookData.mainPdf) 
        : `../pdf/full/${bookId}.pdf`;

    try {
        studioPdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        studioTotalPages = studioPdfDoc.numPages;
        console.log(`PDF Loaded for Studio. Total Pages: ${studioTotalPages}`);
    } catch (err) {
        console.error("Studio PDF Load Error:", err);
    }

    renderPageChipGrid();
    selectPage(1);
}

// =======================================================
// RENDER PAGE CHIP GRID
// =======================================================
function renderPageChipGrid() {
    const grid = document.getElementById('pageChipGrid');
    const statusText = document.getElementById('pageCountStatus');
    if (!grid) return;

    if (statusText) {
        statusText.textContent = `${studioCurrentPage} / ${studioTotalPages} Pages`;
    }

    grid.innerHTML = '';
    for (let p = 1; p <= studioTotalPages; p++) {
        const chip = document.createElement('div');
        chip.className = `page-chip ${p === studioCurrentPage ? 'active' : ''}`;
        
        // Check if page has text or audio
        const pageData = studioAudioScripts.pages && studioAudioScripts.pages[String(p)];
        let hasContent = false;
        if (pageData) {
            if (typeof pageData === 'string' && pageData.trim().length > 0) hasContent = true;
            if (typeof pageData === 'object' && ((pageData.text && pageData.text.trim()) || pageData.audio)) hasContent = true;
        }

        if (hasContent) {
            chip.classList.add('has-content');
            chip.innerHTML = `Pg ${p} ✅`;
        } else {
            chip.innerHTML = `Pg ${p}`;
        }

        chip.addEventListener('click', () => selectPage(p));
        grid.appendChild(chip);
    }
}

// =======================================================
// SELECT PAGE & RENDER PREVIEW
// =======================================================
async function selectPage(pageNum) {
    studioCurrentPage = pageNum;
    
    // Update Active Chip
    document.querySelectorAll('.page-chip').forEach((c, idx) => {
        if (idx + 1 === pageNum) c.classList.add('active');
        else c.classList.remove('active');
    });

    const pageTag = document.getElementById('previewPageNumberTag');
    if (pageTag) pageTag.textContent = `Page ${pageNum}`;

    // 1. Render PDF Canvas Page
    if (studioPdfDoc) {
        try {
            const page = await studioPdfDoc.getPage(pageNum);
            const canvas = document.getElementById('previewCanvas');
            const ctx = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1.0 });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
        } catch (e) {
            console.error("Error rendering preview page:", e);
        }
    }

    // 2. Load Page Text into Editor
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
// SAVE TEXT
// =======================================================
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

// =======================================================
// TEST TTS
// =======================================================
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
        ut.rate = 1.0;
        window.speechSynthesis.speak(ut);
    } else {
        alert("ब्राउज़र में SpeechSynthesis उपलब्ध नहीं है।");
    }
}

// =======================================================
// LIVE MIC RECORDING (OPUS / WEBM)
// =======================================================
async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks = [];

        // Check supported audio mime type
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
        document.getElementById('stopRecBtn').style.display = 'flex';
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
    document.getElementById('startRecBtn').style.display = 'flex';
    document.getElementById('stopRecBtn').style.display = 'none';
}

function saveCurrentPageAudio() {
    if (!recordedAudioBlob) {
        alert("कोई नई रिकॉर्डिंग उपलब्ध नहीं है।");
        return;
    }

    // Convert Blob to Base64 or local URL for permanent mapping
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
    console.log(`Saved scripts for ${studioCurrentBookId} to localStorage.`);
}
