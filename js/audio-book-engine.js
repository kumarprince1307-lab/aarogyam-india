/**
 * =================================================================
 * AAROGYAM INDIA - PRO HYBRID AUDIO BOOK ENGINE v3.2 (ROCK SOLID)
 * =================================================================
 * 1. Admin Recorded Audio: Plays real recorded human voice directly
 * 2. Text Script: Plays crisp Natural Female TTS or Warm Male TTS
 * 3. Soothing Ambient BGM: Zero-Egress Web Audio Indian Ambient Pad
 * 4. Welcome Audio: Greets user by name from profile
 * 5. Unrecorded Pages: Polite audio notice + auto page turn
 */

class SoothingBgmEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.gainNode = null;
        this.oscillators = [];
        this.volume = 0.12; // Audible and soothing ambient background
        this.isMuted = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
    }

    start() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;
            if (this.isPlaying) return;

            // Master BGM Gain
            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.gainNode.connect(this.ctx.destination);

            // Rich Meditative Indian Ambient Tanpura & Flute Drone (Sa-Pa-Sa: C3, G3, C4, G4, C5)
            const freqs = [130.81, 196.00, 261.63, 392.00, 523.25];
            this.oscillators = freqs.map((f, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(f, this.ctx.currentTime);

                // Gentle acoustic warmth filter
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450 + (i * 50), this.ctx.currentTime);

                // Subtle individual gain for balanced blend
                const oscGain = this.ctx.createGain();
                const branchVol = i === 0 ? 0.35 : (i === 1 ? 0.25 : 0.15);
                oscGain.gain.setValueAtTime(branchVol, this.ctx.currentTime);

                osc.connect(filter);
                filter.connect(oscGain);
                oscGain.connect(this.gainNode);
                osc.start();
                return osc;
            });

            this.isPlaying = true;
            this.updateBgmUi();
        } catch (e) {
            console.warn("BGM start notice:", e);
        }
    }

    stop() {
        if (!this.isPlaying) return;
        try {
            this.oscillators.forEach(osc => {
                try { osc.stop(); osc.disconnect(); } catch (e) {}
            });
            this.oscillators = [];
            this.isPlaying = false;
            this.updateBgmUi();
        } catch (e) {}
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stop();
        } else {
            this.start();
        }
        this.updateBgmUi();
        return !this.isMuted;
    }

    updateBgmUi() {
        const btn = document.getElementById('abBgmToggleBtn');
        if (btn) {
            if (this.isPlaying && !this.isMuted) {
                btn.classList.add('bgm-active');
                btn.style.opacity = '1';
                btn.title = 'BGM चालू है (क्लिक करके बंद करें)';
            } else {
                btn.classList.remove('bgm-active');
                btn.style.opacity = '0.4';
                btn.title = 'BGM बंद है (क्लिक करके चालू करें)';
            }
        }
    }
}

class ProAudioBookEngine {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.voices = [];
        this.maleVoice = null;
        this.femaleVoice = null;
        this.activeGender = 'female'; // Default to female (cleanest Hindi TTS)
        this.isPlaying = false;
        this.isPaused = false;
        this.playbackRate = 1.0;
        this.currentUtterance = null;
        this.audioElement = new Audio();
        this.bgm = new SoothingBgmEngine();
        this.autoNextPage = true;
        this.pageScripts = {};
        this.metadata = {};
        this.userName = "किसान मित्र";
        this.welcomePlayed = false;
        this.isPageRecordedAudio = false;

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
        this.setupAudioElement();
        this.injectUI();
        await this.loadBookAudioScripts();
        console.log("✅ Pro AudioBookEngine v3.3 Initialized for:", this.userName);
    }

    getUserProfileName() {
        try {
            const sessionManager = (typeof V1_SESSION !== "undefined") ? V1_SESSION : window.V1_SESSION;
            const user = sessionManager && typeof sessionManager.getCurrentUser === "function" 
                ? sessionManager.getCurrentUser() 
                : null;
            
            if (user) {
                let name = (user.name || user.fullName || user.first_name || "").trim();
                // If name has digits or is missing, use respectful title
                if (!name || /\d/.test(name) || name.length < 2) {
                    this.userName = "किसान मित्र";
                } else {
                    this.userName = name;
                }
            } else {
                this.userName = "किसान मित्र";
            }
        } catch (e) {
            this.userName = "किसान मित्र";
        }
    }

    loadVoices() {
        if (!this.synth) return;
        this.voices = this.synth.getVoices() || [];
        if (!this.voices.length) return;

        // Hindi voices pool
        const hindiVoices = this.voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().includes('hi-in') || v.lang.toLowerCase().includes('hi_in')));
        
        // 1. Female Voice Search: Kalpana, Swara, Heera, Google हिन्दी, Zira
        this.femaleVoice = hindiVoices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('kalpana') || name.includes('swara') || name.includes('heera') || name.includes('female') || name.includes('google') || name.includes('zira');
        }) || hindiVoices[0] || this.voices.find(v => v.lang && v.lang.startsWith('en-IN')) || this.voices[0];

        // 2. Male Voice Search: Hemant, Madhur, Ravi, David, Mark, Prabhat, Male
        this.maleVoice = hindiVoices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('hemant') || name.includes('madhur') || name.includes('ravi') || name.includes('prabhat') || name.includes('male');
        }) || this.voices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('mark');
        }) || (hindiVoices.length > 1 ? hindiVoices[1] : hindiVoices[0]) || this.femaleVoice;
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

    async loadBookAudioScripts() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = (window.aoiBookId || urlParams.get('book') || urlParams.get('id') || 'BK001').trim().toUpperCase();
        
        // 1. Check local studio edits
        const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                this.metadata = parsed;
                this.pageScripts = parsed.pages || {};
                this.updateNarratorDisplay();
                return;
            } catch (e) {}
        }

        // 2. Fetch from files
        try {
            let res = await fetch(`../data/audio-scripts/${bookId}.json`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json`);
            if (res.ok) {
                const data = await res.json();
                this.metadata = data;
                this.pageScripts = data.pages || {};
                this.updateNarratorDisplay();
            }
        } catch (e) {
            console.warn("Audio script fetch:", e);
        }
    }

    updateNarratorDisplay() {
        const nameEl = document.getElementById('abNarratorName');
        const avatarEl = document.getElementById('abNarratorAvatar');
        const genderToggle = document.querySelector('.ab-gender-toggle');

        if (this.isPageRecordedAudio) {
            if (nameEl) nameEl.textContent = 'आपकी मूल आवाज़ (Admin Voice)';
            if (avatarEl) avatarEl.src = '/images/logo/logo.png';
            if (genderToggle) {
                genderToggle.style.opacity = '0.5';
                genderToggle.title = 'यह पेज आपकी अपनी रिकॉर्ड की गई आवाज़ में है';
            }
            return;
        }

        if (genderToggle) {
            genderToggle.style.opacity = '1';
            genderToggle.title = 'आवाज़ का चयन करें (महिला / पुरुष)';
        }

        if (this.activeGender === 'male') {
            const male = this.metadata.maleNarrator || { name: 'दादा अविनाश (पुरुष स्वर)', avatar: '/images/logo/logo.png' };
            if (nameEl) nameEl.textContent = male.name;
            if (avatarEl) avatarEl.src = male.avatar;
        } else {
            const female = this.metadata.femaleNarrator || { name: 'कृषि सखी (महिला स्वर)', avatar: '/images/logo/fevicon.png' };
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

        if (this.isPlaying && !this.isPageRecordedAudio) {
            this.playCurrentPage();
        }
    }

    // =======================================================
    // MAIN PLAY ENGINE
    // =======================================================
    async playCurrentPage() {
        const currentPage = window.aoiPageNum || 1;
        this.getUserProfileName();

        // Start Soothing BGM in background
        this.bgm.start();

        // 1. Play Welcome Greeting Once on First Start
        if (!this.welcomePlayed) {
            this.welcomePlayed = true;
            this.stopAudioSources();
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

        this.stopAudioSources();

        // 2. Check Page Script or Recorded Audio
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

        // Case A: Real Admin Recorded Audio exists (Plays original human voice directly)
        if (pageAudio && pageAudio.trim().length > 0) {
            this.isPageRecordedAudio = true;
            this.updateNarratorDisplay();
            this.updateStatusDisplay(`🎙️ पृष्ठ ${currentPage} - रिकॉर्डेड आवाज़ चल रही है`);
            this.audioElement.src = pageAudio;
            this.audioElement.playbackRate = this.playbackRate;
            this.audioElement.play().catch(e => {
                console.warn("Audio play gesture required:", e);
            });
            this.setPlayingState(true);
            return;
        }

        this.isPageRecordedAudio = false;
        this.updateNarratorDisplay();

        // Case B: Text Script exists -> Plays Male or Female TTS
        if (pageText && pageText.trim().length > 0) {
            const genderLabel = this.activeGender === 'male' ? 'पुरुष स्वर' : 'महिला स्वर';
            this.updateStatusDisplay(`📖 पृष्ठ ${currentPage} (${genderLabel}) सुनाया जा रहा है`);
            this.speakText(pageText, currentPage);
            return;
        }

        // Case C: Unrecorded Page -> Polite Notice + Auto Next
        const politeNotice = `${this.userName} जी, पृष्ठ संख्या ${currentPage} की ऑडियो रिकॉर्डिंग जल्द ही उपलब्ध करा दी जाएगी। आइए अगले पृष्ठ पर चलते हैं।`;
        this.updateStatusDisplay(`⏳ पृष्ठ ${currentPage} की ऑडियो जल्द उपलब्ध होगी...`);
        this.speakText(politeNotice, currentPage);
    }

    speakText(text, currentPage, isWelcome = false) {
        if (!this.synth) return;

        this.synth.cancel();
        this.loadVoices(); // Ensure fresh voice list

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Accurate Voice & Tone Assignment
        if (this.activeGender === 'female') {
            if (this.femaleVoice) this.currentUtterance.voice = this.femaleVoice;
            this.currentUtterance.pitch = 1.0; // Clear, crystal natural female tone
            this.currentUtterance.rate = 0.95 * this.playbackRate;
        } else {
            if (this.maleVoice) this.currentUtterance.voice = this.maleVoice;
            // Warm male tone: if device voice is same, lower pitch slightly for distinct male resonance
            this.currentUtterance.pitch = 0.84;
            this.currentUtterance.rate = 0.90 * this.playbackRate;
        }
        
        this.currentUtterance.lang = 'hi-IN';

        this.currentUtterance.onstart = () => {
            this.setPlayingState(true);
        };

        this.currentUtterance.onend = () => {
            this.setPlayingState(false);
            
            // If welcome audio finished, immediately start reading the current page
            if (isWelcome) {
                setTimeout(() => {
                    this.isPlaying = true;
                    this.playCurrentPage();
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
            console.warn("TTS Error:", e);
            this.setPlayingState(false);
        };

        this.synth.speak(this.currentUtterance);
        this.isPlaying = true;
    }

    stopAudioSources() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        if (this.synth) {
            this.synth.cancel();
        }
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
        this.stopAudioSources();
        this.bgm.stop();
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
                        <img id="abNarratorAvatar" src="/images/logo/fevicon.png" alt="Narrator" class="ab-avatar-img" />
                    </div>
                    <div class="ab-info">
                        <span class="ab-title" id="abNarratorName">कृषि सखी</span>
                        <span class="ab-status" id="abStatusText">तैयार है • "सुनें" दबाएं</span>
                    </div>
                </div>

                <!-- Center Controls -->
                <div class="ab-center">
                    <button class="ab-ctrl-btn" id="abPrevBtn" title="पिछला पृष्ठ">⏮️</button>
                    <button class="ab-main-play-btn" id="abPlayBtn" title="सुनें">▶️</button>
                    <button class="ab-ctrl-btn" id="abNextBtn" title="अगला पृष्ठ">⏭️</button>
                </div>

                <!-- Gender Toggle & BGM & Speed & Close -->
                <div class="ab-right">
                    <!-- Male / Female Switcher -->
                    <div class="ab-gender-toggle">
                        <button id="abGenderFemale" class="ab-gender-btn active" title="महिला स्वर">👩 महिला</button>
                        <button id="abGenderMale" class="ab-gender-btn" title="पुरुष स्वर">👨 पुरुष</button>
                    </div>

                    <!-- BGM Toggle Button -->
                    <button id="abBgmToggleBtn" class="ab-ctrl-btn" title="बैकग्राउंड म्यूजिक चालू/बंद" style="width:28px; height:28px; font-size:12px;">🎵</button>

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
        
        document.getElementById('abBgmToggleBtn').addEventListener('click', () => {
            const active = this.bgm.toggleMute();
            document.getElementById('abBgmToggleBtn').style.opacity = active ? '1' : '0.4';
        });

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
