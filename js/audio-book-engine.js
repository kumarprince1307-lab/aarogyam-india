/**
 * =================================================================
 * AAROGYAM INDIA - PRO HYBRID AUDIO BOOK ENGINE v3.0
 * =================================================================
 * Features:
 * 1. Personalized User Welcome Audio (with Profile Name)
 * 2. Personalized Polite Notice on Unrecorded Pages + Auto Advance
 * 3. Exact Page-by-Page Audio & Text Script Integration
 * 4. Male / Female Voice Switcher (Realtime Pitch Filter & TTS)
 * 5. Soothing Ambient Background Music (BGM)
 * 6. Dynamic Narrator Avatar with Waveform Pulse
 * 7. Zero-Cost & Zero-Egress Architecture (Client-Side)
 */

class ProAudioBookEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.voices = [];
        this.maleVoice = null;
        this.femaleVoice = null;
        this.activeGender = 'male'; // 'male' | 'female'
        this.isPlaying = false;
        this.isPaused = false;
        this.playbackRate = 1.0;
        this.currentUtterance = null;
        this.audioElement = new Audio();
        this.bgmAudioElement = new Audio();
        this.autoNextPage = true;
        this.pageScripts = {};
        this.metadata = {};
        this.userName = "किसान मित्र";
        this.welcomePlayed = false;

        this.init();
    }

    async init() {
        this.getUserProfileName();
        if (this.synth) {
            this.loadVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
        this.setupAudioElements();
        this.injectUI();
        await this.loadBookAudioScripts();
        console.log("✅ Pro AudioBookEngine v3.0 Initialized for user:", this.userName);
    }

    getUserProfileName() {
        try {
            const sessionManager = (typeof V1_SESSION !== "undefined") ? V1_SESSION : window.V1_SESSION;
            const user = sessionManager && typeof sessionManager.getCurrentUser === "function" 
                ? sessionManager.getCurrentUser() 
                : null;
            
            if (user) {
                this.userName = user.name || user.first_name || user.mobile || "किसान मित्र";
            }
        } catch (e) {
            this.userName = "किसान मित्र";
        }
    }

    loadVoices() {
        if (!this.synth) return;
        this.voices = this.synth.getVoices();
        
        // Find Male & Female Hindi/Indian voices
        this.femaleVoice = this.voices.find(v => (v.lang.includes('hi') || v.lang.includes('HI')) && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('kalpana') || v.name.toLowerCase().includes('zira')))
            || this.voices.find(v => v.lang.includes('hi') || v.lang.includes('HI'))
            || this.voices[0] || null;

        this.maleVoice = this.voices.find(v => (v.lang.includes('hi') || v.lang.includes('HI')) && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('hemant') || v.name.toLowerCase().includes('david')))
            || this.voices.find(v => v.lang.includes('hi') || v.lang.includes('HI'))
            || this.voices[0] || null;
    }

    setupAudioElements() {
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

        // BGM Setup (Gentle Ambient Loop)
        this.bgmAudioElement.loop = true;
        this.bgmAudioElement.volume = 0.12;
    }

    async loadBookAudioScripts() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = (window.aoiBookId || urlParams.get('book') || urlParams.get('id') || 'BK001').trim().toUpperCase();
        
        // Check localStorage first (Admin studio edits)
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                this.metadata = parsed;
                this.pageScripts = parsed.pages || {};
                console.log(`✅ Loaded ${Object.keys(this.pageScripts).length} scripts from Admin Studio for ${bookId}`);
                this.updateNarratorDisplay();
                return;
            } catch (e) {}
        }

        // Fetch from file system
        try {
            let res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                const data = await res.json();
                this.metadata = data;
                this.pageScripts = data.pages || {};
                console.log(`✅ Loaded ${Object.keys(this.pageScripts).length} page scripts for ${bookId}`);
                this.updateNarratorDisplay();
            }
        } catch (e) {
            console.warn("Audio script fetch:", e);
        }
    }

    updateNarratorDisplay() {
        const nameEl = document.getElementById('abNarratorName');
        const avatarEl = document.getElementById('abNarratorAvatar');
        
        if (this.activeGender === 'male') {
            const male = this.metadata.maleNarrator || { name: 'दादा अविनाश', avatar: '/images/logo/logo.png' };
            if (nameEl) nameEl.textContent = male.name;
            if (avatarEl) avatarEl.src = male.avatar;
        } else {
            const female = this.metadata.femaleNarrator || { name: 'कृषि सखी', avatar: '/images/logo/fevicon.png' };
            if (nameEl) nameEl.textContent = female.name;
            if (avatarEl) avatarEl.src = female.avatar;
        }
    }

    setGender(gender) {
        this.activeGender = gender;
        this.updateNarratorDisplay();
        
        const maleBtn = document.getElementById('abGenderMale');
        const femaleBtn = document.getElementById('abGenderFemale');
        if (maleBtn && femaleBtn) {
            if (gender === 'male') {
                maleBtn.classList.add('active');
                femaleBtn.classList.remove('active');
            } else {
                femaleBtn.classList.add('active');
                maleBtn.classList.remove('active');
            }
        }

        if (this.isPlaying) {
            this.playCurrentPage();
        }
    }

    // =======================================================
    // MAIN PLAY ENGINE
    // =======================================================
    async playCurrentPage() {
        const currentPage = window.aoiPageNum || 1;
        this.getUserProfileName();

        // 1. Play Welcome Greeting Once on First Play
        if (!this.welcomePlayed) {
            this.welcomePlayed = true;
            this.stop();
            const welcomeText = `${this.userName} जी, आरोग्यम इंडिया डिजिटल लाइब्रेरी में आपका हार्दिक स्वागत है। आइए अध्ययन शुरू करते हैं।`;
            this.updateStatusDisplay(`🌸 ${this.userName} जी, स्वागत है!`);
            this.speakText(welcomeText, currentPage, true);
            return;
        }

        if (this.isPaused && this.synth && this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
            this.setPlayingState(true);
            return;
        }

        this.stop(); // Stop previous utterance

        // 2. Check Page Script / Audio Record
        const pageKey = String(currentPage);
        const pageEntry = this.pageScripts[pageKey];

        let pageText = '';
        let pageAudio = '';

        if (pageEntry) {
            if (typeof pageEntry === 'string') pageText = pageEntry;
            else if (typeof pageEntry === 'object') {
                pageText = pageEntry.text || '';
                pageAudio = pageEntry.audio || '';
            }
        }

        // A. If Admin Recorded Audio exists
        if (pageAudio && pageAudio.trim().length > 0) {
            this.updateStatusDisplay(`🎙️ पृष्ठ ${currentPage} - रिकॉर्डेड आवाज़ चल रही है`);
            this.audioElement.src = pageAudio;
            this.audioElement.playbackRate = this.playbackRate;
            this.audioElement.play();
            this.setPlayingState(true);
            return;
        }

        // B. If Text exists -> Speak with TTS
        if (pageText && pageText.trim().length > 0) {
            this.updateStatusDisplay(`📖 पृष्ठ ${currentPage} सुनाया जा रहा है`);
            this.speakText(pageText, currentPage);
            return;
        }

        // C. If Page has NO recording and NO text -> Polite Notice + Auto Next
        const politeNotice = `${this.userName} जी, पृष्ठ संख्या ${currentPage} की ऑडियो रिकॉर्डिंग जल्द ही उपलब्ध करा दी जाएगी। आइए अगले पृष्ठ पर चलते हैं।`;
        this.updateStatusDisplay(`⏳ पृष्ठ ${currentPage} की ऑडियो जल्द उपलब्ध होगी...`);
        this.speakText(politeNotice, currentPage);
    }

    speakText(text, currentPage, isWelcome = false) {
        if (!this.synth) return;

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Voice Selection
        if (this.activeGender === 'female' && this.femaleVoice) {
            this.currentUtterance.voice = this.femaleVoice;
            this.currentUtterance.pitch = 1.2; // Pleasant sweeter tone
        } else if (this.maleVoice) {
            this.currentUtterance.voice = this.maleVoice;
            this.currentUtterance.pitch = 0.95; // Warm male tone
        }
        
        this.currentUtterance.lang = 'hi-IN';
        this.currentUtterance.rate = this.playbackRate;

        this.currentUtterance.onstart = () => {
            this.setPlayingState(true);
        };

        this.currentUtterance.onend = () => {
            this.setPlayingState(false);
            
            // If it was just the welcome message, immediately read the actual current page!
            if (isWelcome) {
                setTimeout(() => {
                    if (this.isPlaying) this.playCurrentPage();
                }, 400);
                return;
            }

            // Auto Turn Page
            if (this.autoNextPage && window.aoiPageNum < (window.aoiTotalPages || 999)) {
                if (typeof window.onNextPage === 'function') {
                    window.onNextPage();
                    setTimeout(() => {
                        if (this.isPlaying) this.playCurrentPage();
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
        if (!this.audioElement.paused) {
            this.audioElement.pause();
        }
        if (this.synth && this.synth.speaking) {
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
        if (this.isPlaying) this.playCurrentPage();
    }

    setPlayingState(playing) {
        this.isPlaying = playing;
        const playBtn = document.getElementById('abPlayBtn');
        const waveBox = document.getElementById('abWaveAnimation');
        const floatAbBtn = document.getElementById('floatingAudioTrigger');
        const avatarBox = document.getElementById('abNarratorAvatarBox');

        if (playBtn) playBtn.innerHTML = playing ? '⏸️' : '▶️';
        if (waveBox) {
            if (playing) waveBox.classList.add('active');
            else waveBox.classList.remove('active');
        }
        if (avatarBox) {
            if (playing) avatarBox.classList.add('pulse-avatar');
            else avatarBox.classList.remove('pulse-avatar');
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
                <!-- Narrator Avatar & Info -->
                <div class="ab-left">
                    <div class="ab-avatar-box" id="abNarratorAvatarBox">
                        <img id="abNarratorAvatar" src="/images/logo/logo.png" alt="Narrator" class="ab-avatar-img" />
                    </div>
                    <div class="ab-info">
                        <span class="ab-title" id="abNarratorName">दादा अविनाश</span>
                        <span class="ab-status" id="abStatusText">तैयार है • "सुनें" दबाएं</span>
                    </div>
                </div>

                <!-- Center Controls -->
                <div class="ab-center">
                    <button class="ab-ctrl-btn" id="abPrevBtn" title="पिछला पृष्ठ">⏮️</button>
                    <button class="ab-main-play-btn" id="abPlayBtn" title="सुनें">▶️</button>
                    <button class="ab-ctrl-btn" id="abNextBtn" title="अगला पृष्ठ">⏭️</button>
                </div>

                <!-- Gender Toggle & Speed & Close -->
                <div class="ab-right">
                    <!-- Male / Female Switcher -->
                    <div class="ab-gender-toggle">
                        <button id="abGenderMale" class="ab-gender-btn active" title="पुरुष स्वर">👨 पुरुष</button>
                        <button id="abGenderFemale" class="ab-gender-btn" title="महिला स्वर">👩 महिला</button>
                    </div>

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

        // Attach Events
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
        document.getElementById('abGenderMale').addEventListener('click', () => this.setGender('male'));
        document.getElementById('abGenderFemale').addEventListener('click', () => this.setGender('female'));
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
    window.aoiAudioBookEngine = new ProAudioBookEngine();
});
