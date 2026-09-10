/**
 * =================================================================
 * AAROGYAM INDIA - UNIVERSAL 4-LAYER HYBRID AUDIO BOOK ENGINE v2.0
 * =================================================================
 * Universal Fallback Hierarchy:
 * Layer 1: Chapter Voice Script / Custom Text (from bookData.chapters / audio_scripts)
 * Layer 2: Recorded MP3 Audio Narration (from bookData.audioUrl / chapter audio)
 * Layer 3: Digital Vector PDF Text (via PDF.js getTextContent)
 * Layer 4: Universal Image OCR (Tesseract.js directly scanning canvas in browser)
 * 
 * Features:
 * - 100% Automatic continuous reading with Auto Page Turn
 * - Speed control (0.75x, 1.0x, 1.25x, 1.5x)
 * - Zero Server Egress & Zero API Cost (Client-side execution)
 * - Real-time animated waveform visualizer & mode badge
 */

class UniversalAudioBookEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.voices = [];
        this.selectedVoice = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentLayer = null; // 'script' | 'mp3' | 'pdf_text' | 'ocr'
        this.playbackRate = 1.0;
        this.currentUtterance = null;
        this.audioElement = new Audio();
        this.autoNextPage = true;
        this.pageScripts = {};
        this.pageTextCache = new Map();
        this.ocrCache = new Map();
        this.isOcrRunning = false;

        this.init();
    }

    async init() {
        if (this.synth) {
            this.loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
        this.setupAudioElement();
        this.injectUI();
        await this.loadBookAudioScripts();
        console.log("✅ Universal 4-Layer AudioBookEngine v2.0 Initialized");
    }

    async loadBookAudioScripts() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = (window.aoiBookId || urlParams.get('book') || urlParams.get('id') || 'BK001').trim().toUpperCase();
        try {
            const res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.pages) {
                    this.pageScripts = data.pages;
                    console.log(`✅ Loaded ${Object.keys(this.pageScripts).length} page scripts for ${bookId}`);
                }
            }
        } catch (e) {
            console.warn("Audio script fetch:", e);
        }
    }

    loadVoices() {
        if (!this.synth) return;
        this.voices = this.synth.getVoices();
        // Priority to Hindi voice
        this.selectedVoice = this.voices.find(v => v.lang && (v.lang.includes('hi') || v.lang.includes('HI') || v.name.toLowerCase().includes('hindi')))
            || this.voices.find(v => v.lang && v.lang.startsWith('en-IN'))
            || this.voices[0] || null;
    }

    setupAudioElement() {
        this.audioElement.preload = 'metadata';
        this.audioElement.addEventListener('ended', () => {
            this.setPlayingState(false);
            if (this.autoNextPage && typeof window.onNextPage === 'function') {
                window.onNextPage();
                setTimeout(() => {
                    if (this.isPlaying) this.playCurrentPage();
                }, 600);
            }
        });
        this.audioElement.addEventListener('play', () => this.setPlayingState(true));
        this.audioElement.addEventListener('pause', () => this.setPlayingState(false));
    }

    // =======================================================
    // LAYER 1: CHAPTER SCRIPT LOOKUP
    // =======================================================
    getChapterScript(pageNum, bookData) {
        if (!bookData) return null;
        const chapters = bookData.chapters || bookData.audio_scripts || [];
        if (!Array.isArray(chapters) || chapters.length === 0) return null;

        // Find chapter matching current page range
        const matched = chapters.find(ch => {
            if (ch.page && ch.page === pageNum) return true;
            if (ch.startPage && ch.endPage && pageNum >= ch.startPage && pageNum <= ch.endPage) return true;
            return false;
        });

        if (matched && (matched.voiceScript || matched.text || matched.summary)) {
            return {
                title: matched.title || matched.name || `अध्याय ${pageNum}`,
                text: matched.voiceScript || matched.text || matched.summary
            };
        }
        return null;
    }

    // =======================================================
    // LAYER 2: RECORDED MP3 AUDIO LOOKUP
    // =======================================================
    getRecordedAudio(pageNum, bookData) {
        if (!bookData) return null;
        // Check chapter audio first
        if (bookData.chapters && Array.isArray(bookData.chapters)) {
            const ch = bookData.chapters.find(c => c.page === pageNum || (c.startPage <= pageNum && pageNum <= c.endPage));
            if (ch && (ch.audioUrl || ch.audio)) return ch.audioUrl || ch.audio;
        }
        // Fallback to full book audio
        return bookData.audioUrl || bookData.audio_book_url || null;
    }

    // =======================================================
    // LAYER 3: DIGITAL PDF VECTOR TEXT
    // =======================================================
    async getPdfVectorText(pageNum) {
        if (this.pageTextCache.has(pageNum)) {
            return this.pageTextCache.get(pageNum);
        }
        if (!window.aoiPdfDoc) return "";

        try {
            const page = await window.aoiPdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const textItems = textContent.items
                .map(item => item.str.trim())
                .filter(str => str.length > 0);

            const cleanedText = textItems.join(' ')
                .replace(/\s+/g, ' ')
                .replace(/([।!?])\s*/g, '$1\n');

            this.pageTextCache.set(pageNum, cleanedText);
            return cleanedText;
        } catch (err) {
            console.warn("PDF vector text extract error:", err);
            return "";
        }
    }

    // =======================================================
    // LAYER 4: UNIVERSAL IMAGE OCR (CANVAS SCAN)
    // =======================================================
    async getCanvasOcrText(pageNum) {
        if (this.ocrCache.has(pageNum)) {
            return this.ocrCache.get(pageNum);
        }

        const canvas = document.getElementById('pdfCanvas');
        if (!canvas) return "";

        if (typeof Tesseract === 'undefined') {
            console.warn("Tesseract OCR library not loaded.");
            return "";
        }

        try {
            this.isOcrRunning = true;
            this.updateStatusDisplay(`🔍 पृष्ठ ${pageNum} की इमेज स्कैन (OCR) हो रही है...`);

            const result = await Tesseract.recognize(canvas, 'hin+eng', {
                logger: m => {
                    if (m.status === 'recognizing text' && m.progress) {
                        const pct = Math.round(m.progress * 100);
                        this.updateStatusDisplay(`🔍 इमेज OCR स्कैनिंग... ${pct}%`);
                    }
                }
            });

            this.isOcrRunning = false;
            let ocrText = (result.data && result.data.text) ? result.data.text.trim() : "";
            
            // Clean OCR garbage
            ocrText = ocrText
                .replace(/[\r\n]+/g, ' ')
                .replace(/[|—_~`]+/g, ' ')
                .replace(/\s+/g, ' ');

            this.ocrCache.set(pageNum, ocrText);
            return ocrText;
        } catch (err) {
            this.isOcrRunning = false;
            console.error("OCR recognition error:", err);
            return "";
        }
    }

    // =======================================================
    // MAIN PLAY ENGINE (4-LAYER RESOLVER)
    // =======================================================
    async playCurrentPage() {
        const currentPage = window.aoiPageNum || 1;
        const bookData = window.aoiCurrentBookData;

        // If paused, resume
        if (this.isPaused && this.synth && this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
            this.setPlayingState(true);
            return;
        }

        this.stop(); // Stop previous audio

        // Wait for PDF doc ready
        if (!window.aoiPdfDoc) {
            this.updateStatusDisplay(`⏳ ई-बुक लोड हो रही है...`);
            let w = 0;
            while (!window.aoiPdfDoc && w < 15) {
                await new Promise(r => setTimeout(r, 200));
                w++;
            }
        }

        const bookTitle = (bookData && (bookData.heading || bookData.name || bookData.shortTitle)) || "आरोग्यम इंडिया ई-बुक";
        const bookCategory = (bookData && bookData.category) || "कृषि एवं स्वास्थ्य";

        // ----------------------------------------------------
        // LAYER 1: EXACT PAGE SCRIPT LOOKUP (Highest Precision)
        // ----------------------------------------------------
        const pageKey = String(currentPage);
        if (this.pageScripts && this.pageScripts[pageKey] && this.pageScripts[pageKey].trim().length > 0) {
            this.currentLayer = 'page_script';
            this.updateStatusDisplay(`📖 पृष्ठ ${currentPage} का सटीक पाठ सुनाया जा रहा है`);
            this.speakText(this.pageScripts[pageKey], currentPage);
            return;
        }

        // ----------------------------------------------------
        // LAYER 1B: CHECK CHAPTER VOICE SCRIPT
        // ----------------------------------------------------
        const chapterScript = this.getChapterScript(currentPage, bookData);
        if (chapterScript && chapterScript.text.trim().length > 0) {
            this.currentLayer = 'script';
            this.updateStatusDisplay(`🤖 [चैप्टर वॉइस] ${chapterScript.title}`);
            this.speakText(chapterScript.text, currentPage);
            return;
        }

        // ----------------------------------------------------
        // LAYER 2: CHECK RECORDED MP3 AUDIO LINK
        // ----------------------------------------------------
        const mp3AudioUrl = this.getRecordedAudio(currentPage, bookData);
        if (mp3AudioUrl && this.currentLayer === 'mp3') {
            this.currentLayer = 'mp3';
            if (this.audioElement.src !== mp3AudioUrl) {
                this.audioElement.src = mp3AudioUrl;
            }
            this.audioElement.playbackRate = this.playbackRate;
            this.audioElement.play();
            this.setPlayingState(true);
            this.updateStatusDisplay(`🎙️ [रिकॉर्डेड ऑडियो] पृष्ठ ${currentPage}`);
            return;
        }

        // ----------------------------------------------------
        // LAYER 3: CHECK DIGITAL PDF VECTOR TEXT
        // ----------------------------------------------------
        let digitalText = await this.getPdfVectorText(currentPage);
        if (digitalText && digitalText.trim().length > 25) {
            this.currentLayer = 'pdf_text';
            this.updateStatusDisplay(`📖 [डिजिटल टेक्स्ट] पृष्ठ ${currentPage}`);
            this.speakText(digitalText, currentPage);
            return;
        }

        // ----------------------------------------------------
        // LAYER 4: UNIVERSAL IMAGE OCR CANVAS SCAN
        // ----------------------------------------------------
        if (currentPage === 1) {
            // Smart Cover Intro
            const coverText = `आरोग्यम इंडिया ई-बुक: ${bookTitle}। श्रेणी: ${bookCategory}। यह इस पुस्तक का मुख्य आवरण पृष्ठ है। आइए अध्याय शुरू करते हैं।`;
            this.currentLayer = 'cover_intro';
            this.updateStatusDisplay(`📕 मुख्य पृष्ठ (कवर) परिचय सुनाया जा रहा है`);
            this.speakText(coverText, currentPage);
            return;
        }

        // Run OCR on Canvas
        let ocrText = await this.getCanvasOcrText(currentPage);
        if (ocrText && ocrText.trim().length > 10) {
            this.currentLayer = 'ocr';
            this.updateStatusDisplay(`🔍 [इमेज OCR] पृष्ठ ${currentPage} सुनाया जा रहा है`);
            this.speakText(ocrText, currentPage);
            return;
        }

        // Ultimate Fallback for Empty Diagram Page
        const fallbackText = `पृष्ठ संख्या ${currentPage}। यह सचित्र चार्ट एवं तालिका युक्त पृष्ठ है। अगले पृष्ठ पर चल रहे हैं।`;
        this.currentLayer = 'fallback';
        this.updateStatusDisplay(`🖼️ पृष्ठ ${currentPage} सचित्र है - अगले पृष्ठ पर जा रहे हैं`);
        this.speakText(fallbackText, currentPage);
    }

    speakText(text, currentPage) {
        if (!this.synth) return;

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            this.currentUtterance.voice = this.selectedVoice;
            this.currentUtterance.lang = this.selectedVoice.lang || 'hi-IN';
        } else {
            this.currentUtterance.lang = 'hi-IN';
        }

        this.currentUtterance.rate = this.playbackRate;
        this.currentUtterance.pitch = 1.0;

        this.currentUtterance.onstart = () => {
            this.setPlayingState(true);
        };

        this.currentUtterance.onend = () => {
            this.setPlayingState(false);
            if (this.autoNextPage && window.aoiPageNum < (window.aoiTotalPages || 999)) {
                if (typeof window.onNextPage === 'function') {
                    window.onNextPage();
                    setTimeout(() => {
                        if (this.isPlaying) {
                            this.playCurrentPage();
                        }
                    }, 600);
                }
            } else {
                this.updateStatusDisplay(`✅ पृष्ठ ${currentPage} समाप्त हुआ`);
            }
        };

        this.currentUtterance.onerror = (e) => {
            console.warn("TTS Utterance Error:", e);
            this.setPlayingState(false);
        };

        this.synth.speak(this.currentUtterance);
        this.isPlaying = true;
    }

    pause() {
        if (this.currentLayer === 'mp3' && !this.audioElement.paused) {
            this.audioElement.pause();
        } else if (this.synth && this.synth.speaking) {
            this.synth.pause();
            this.isPaused = true;
        }
        this.setPlayingState(false);
        this.updateStatusDisplay(`⏸️ ऑडियो रुका हुआ है`);
    }

    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        if (this.synth) {
            this.synth.cancel();
        }
        this.isPaused = false;
        this.setPlayingState(false);
        this.updateStatusDisplay(`⏹️ ऑडियो बंद है`);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.isPlaying = true;
            this.playCurrentPage();
        }
    }

    setSpeed(speed) {
        this.playbackRate = parseFloat(speed);
        if (this.audioElement) this.audioElement.playbackRate = this.playbackRate;
        if (this.isPlaying && this.currentLayer !== 'mp3') {
            this.playCurrentPage();
        }
    }

    setPlayingState(playing) {
        this.isPlaying = playing;
        const playBtn = document.getElementById('abPlayBtn');
        const waveBox = document.getElementById('abWaveAnimation');
        const floatAbBtn = document.getElementById('floatingAudioTrigger');

        if (playBtn) playBtn.innerHTML = playing ? '⏸️' : '▶️';
        if (waveBox) {
            if (playing) waveBox.classList.add('active');
            else waveBox.classList.remove('active');
        }
        if (floatAbBtn) {
            if (playing) floatAbBtn.classList.add('playing-pulse');
            else floatAbBtn.classList.remove('playing-pulse');
        }
    }

    updateStatusDisplay(msg) {
        const statusEl = document.getElementById('abStatusText');
        if (statusEl) statusEl.textContent = msg;
    }

    injectUI() {
        if (document.getElementById('audioBookBar')) return;

        const bar = document.createElement('div');
        bar.id = 'audioBookBar';
        bar.className = 'audio-book-bar';
        bar.innerHTML = `
            <div class="ab-content">
                <div class="ab-left">
                    <div class="ab-wave" id="abWaveAnimation">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <div class="ab-info">
                        <span class="ab-title">🎧 यूनिवर्सल ऑडियो प्लेयर</span>
                        <span class="ab-status" id="abStatusText">तैयार है • "सुनें" दबाएं</span>
                    </div>
                </div>

                <div class="ab-center">
                    <button class="ab-ctrl-btn" id="abPrevBtn" title="पिछला पृष्ठ">⏮️</button>
                    <button class="ab-main-play-btn" id="abPlayBtn" title="सुनें">▶️</button>
                    <button class="ab-ctrl-btn" id="abNextBtn" title="अगला पृष्ठ">⏭️</button>
                </div>

                <div class="ab-right">
                    <select id="abSpeedSelect" class="ab-select" title="गति">
                        <option value="0.75">0.75x</option>
                        <option value="1.0" selected>1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                    </select>
                    <button class="ab-close-btn" id="abCloseBtn" title="बंद करें">✕</button>
                </div>
            </div>
        `;
        document.body.appendChild(bar);

        const floatBtn = document.createElement('button');
        floatBtn.id = 'floatingAudioTrigger';
        floatBtn.className = 'float-btn audio-float-btn';
        floatBtn.innerHTML = '🎧';
        floatBtn.title = 'ऑडियो बुक सुनें (Audio)';
        
        const floatContainer = document.querySelector('.floating-controls');
        if (floatContainer) {
            floatContainer.insertBefore(floatBtn, floatContainer.firstChild);
        } else {
            document.body.appendChild(floatBtn);
        }

        document.getElementById('abPlayBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('abPrevBtn').addEventListener('click', () => {
            if (typeof window.onPrevPage === 'function') {
                window.onPrevPage();
                if (this.isPlaying) this.playCurrentPage();
            }
        });
        document.getElementById('abNextBtn').addEventListener('click', () => {
            if (typeof window.onNextPage === 'function') {
                window.onNextPage();
                if (this.isPlaying) this.playCurrentPage();
            }
        });
        document.getElementById('abSpeedSelect').addEventListener('change', (e) => this.setSpeed(e.target.value));
        document.getElementById('abCloseBtn').addEventListener('click', () => {
            this.stop();
            bar.classList.remove('open');
        });
        floatBtn.addEventListener('click', () => {
            bar.classList.toggle('open');
            if (bar.classList.contains('open') && !this.isPlaying) {
                this.playCurrentPage();
            }
        });
    }
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
    window.aoiAudioBookEngine = new UniversalAudioBookEngine();
});
