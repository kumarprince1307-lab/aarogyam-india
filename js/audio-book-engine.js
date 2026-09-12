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
        this.volume = 0.0; // Completely muted background music
        this.isMuted = true; // BGM disabled by default to keep voice 100% clean & clear
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
        if (this.isMuted || this.volume === 0) return;
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
        this.femaleVoice = null;
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

        this.hasNativeHindiVoice = false;
        this.ttsAudio = new Audio();

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
        await this.loadBookAudioScripts();
        this.injectUI();
        console.log("✅ Pro AudioBookEngine v5.0 (Dual-Engine Rock Solid Voice) Initialized for:", this.userName);
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
        const voices = this.synth.getVoices() || [];
        if (!voices.length) return;

        // Hindi natural female voices pool (Kalpana, Swara, Heera, Google हिन्दी, Zira)
        const hindiVoices = voices.filter(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.toLowerCase().includes('hi-in') || v.lang.toLowerCase().includes('hi_in')));
        
        if (hindiVoices.length > 0) {
            this.femaleVoice = hindiVoices.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('kalpana') || name.includes('swara') || name.includes('heera') || name.includes('female') || name.includes('google') || name.includes('zira');
            }) || hindiVoices[0];
            this.hasNativeHindiVoice = true;
        } else {
            this.femaleVoice = null;
            this.hasNativeHindiVoice = false;
        }
    }

    setupAudioElement() {
        this.audioElement.preload = 'metadata';
        this.audioElement.addEventListener('ended', () => {
            if (this.isPageRecordedAudio) {
                const totalPages = window.aoiTotalPages || 152;
                const curPage = window.aoiPageNum || 1;
                if (this.autoNextPage && curPage < totalPages) {
                    this.updateStatusDisplay(`⏭️ अगले पृष्ठ पर जा रहे हैं...`);
                    if (typeof window.onNextPage === 'function') {
                        window.onNextPage();
                    }
                    setTimeout(() => {
                        this.isPlaying = true;
                        this.playCurrentPage();
                    }, 500);
                } else {
                    this.setPlayingState(false);
                    this.updateStatusDisplay(`✅ पुस्तक वाचन समाप्त हुआ`);
                }
            }
        });
        this.audioElement.addEventListener('play', () => this.setPlayingState(true));
        this.audioElement.addEventListener('pause', () => this.setPlayingState(false));
    }

    async loadBookAudioScripts() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = (window.aoiBookId || urlParams.get('book') || urlParams.get('id') || 'BK001').trim().toUpperCase();
        
        let serverScripts = {};
        let serverMeta = {};

        // 1. Fetch from server files first (with timestamp cache buster)
        try {
            let res = await fetch(`../data/audio-scripts/${bookId}.json?v=${Date.now()}`);
            if (!res.ok) res = await fetch(`/data/audio-scripts/${bookId}.json?v=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                serverMeta = data || {};
                serverScripts = data.pages || {};
            }
        } catch (e) {
            console.warn("Audio script server fetch warning:", e);
        }

        // 2. Check local studio edits & merge
        let localScripts = {};
        try {
            const localData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${bookId}`);
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed && parsed.pages) {
                    localScripts = parsed.pages;
                }
                serverMeta = { ...serverMeta, ...parsed };
            }
        } catch (e) {}

        this.metadata = serverMeta;
        this.pageScripts = { ...serverScripts, ...localScripts };
        this.updateNarratorDisplay();
    }

    updateNarratorDisplay() {
        const nameEl = document.getElementById('abNarratorName');
        const avatarEl = document.getElementById('abNarratorAvatar');

        if (this.isPageRecordedAudio) {
            if (nameEl) nameEl.textContent = 'आपकी मूल आवाज़ (Admin Voice)';
            if (avatarEl) avatarEl.src = '/images/logo/logo.png';
        } else {
            const female = this.metadata.femaleNarrator || { name: 'कृषि सखी (आवाज)', avatar: '/images/logo/fevicon.png' };
            if (nameEl) nameEl.textContent = female.name;
            if (avatarEl) avatarEl.src = female.avatar;
        }
    }

    // =======================================================
    // MAIN PLAY ENGINE
    // =======================================================
    async playCurrentPage() {
        const currentPage = window.aoiPageNum || 1;
        this.getUserProfileName();

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

        // Case B: Text Script exists -> Plays Crisp Natural Female TTS with Chunking
        if (pageText && pageText.trim().length > 0) {
            this.updateStatusDisplay(`📖 पृष्ठ ${currentPage} सुनाया जा रहा है`);
            this.speakText(pageText, currentPage);
            return;
        }

        // Case C: Unrecorded Page -> Polite Notice + Auto Next
        const politeNotice = `${this.userName} जी, पृष्ठ संख्या ${currentPage} की ऑडियो रिकॉर्डिंग जल्द ही उपलब्ध करा दी जाएगी। आइए अगले पृष्ठ पर चलते हैं।`;
        this.updateStatusDisplay(`⏳ पृष्ठ ${currentPage} की ऑडियो जल्द उपलब्ध होगी...`);
        this.speakText(politeNotice, currentPage);
    }

    splitTextIntoChunks(text) {
        if (!text) return [];
        // Clean text and replace non-standard full stops
        const normalized = text.replace(/[\u3002]/g, ' । ');
        // Split by lines, Hindi purna viram (।), period, question mark, exclamation, semicolon
        const rawSegments = normalized.split(/[\r\n।\.?!;:]+/);
        const subSegments = [];

        for (const seg of rawSegments) {
            const cl = seg.trim();
            if (!cl) continue;
            // If a single segment without punctuation is too long (> 100 chars), split by comma or words
            if (cl.length > 100) {
                const subParts = cl.split(/[,，]+/);
                for (const part of subParts) {
                    const cleanPart = part.trim();
                    if (!cleanPart) continue;
                    if (cleanPart.length > 100) {
                        const words = cleanPart.split(/\s+/);
                        let wChunk = '';
                        for (const w of words) {
                            if ((wChunk + ' ' + w).length > 80) {
                                if (wChunk) subSegments.push(wChunk.trim());
                                wChunk = w;
                            } else {
                                wChunk = wChunk ? (wChunk + ' ' + w) : w;
                            }
                        }
                        if (wChunk) subSegments.push(wChunk.trim());
                    } else {
                        subSegments.push(cleanPart);
                    }
                }
            } else {
                subSegments.push(cl);
            }
        }

        const chunks = [];
        let currentChunk = '';

        for (const seg of subSegments) {
            const clean = seg.trim();
            if (!clean) continue;

            if ((currentChunk + ' ' + clean).length > 100) {
                if (currentChunk.trim()) chunks.push(currentChunk.trim());
                currentChunk = clean;
            } else {
                currentChunk = currentChunk ? (currentChunk + ' । ' + clean) : clean;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks.length ? chunks : [text.trim()];
    }

    speakText(text, currentPage, isWelcome = false) {
        this.stopAudioSources();
        this.loadVoices();

        const chunks = this.splitTextIntoChunks(text);
        if (!chunks.length) return;

        let chunkIndex = 0;
        this.isPlaying = true;
        this.setPlayingState(true);

        const onAllChunksFinished = () => {
            if (!this.isPlaying) return;
            if (isWelcome) {
                setTimeout(() => {
                    this.isPlaying = true;
                    this.playCurrentPage();
                }, 300);
                return;
            }

            const totalPages = window.aoiTotalPages || 152;
            const curPage = window.aoiPageNum || 1;
            if (this.autoNextPage && curPage < totalPages) {
                this.updateStatusDisplay(`⏭️ अगले पृष्ठ पर जा रहे हैं...`);
                if (typeof window.onNextPage === 'function') {
                    window.onNextPage();
                }
                setTimeout(() => {
                    this.isPlaying = true;
                    this.playCurrentPage();
                }, 500);
            } else {
                this.setPlayingState(false);
                this.updateStatusDisplay(`✅ पृष्ठ ${curPage} समाप्त हुआ`);
            }
        };

        const playCloudChunk = (chunkText) => {
            if (!this.isPlaying) return;
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=hi&q=${encodeURIComponent(chunkText)}`;
            this.ttsAudio.src = ttsUrl;
            this.ttsAudio.playbackRate = this.playbackRate;

            const onChunkEnd = () => {
                this.ttsAudio.removeEventListener('ended', onChunkEnd);
                this.ttsAudio.removeEventListener('error', onChunkError);
                chunkIndex++;
                playNextChunk();
            };

            const onChunkError = () => {
                this.ttsAudio.removeEventListener('ended', onChunkEnd);
                this.ttsAudio.removeEventListener('error', onChunkError);
                // Fallback to WebSpeech if Cloud TTS network blocked
                if (this.synth) {
                    this.synth.cancel();
                    const ut = new SpeechSynthesisUtterance(chunkText);
                    ut.lang = 'hi-IN';
                    ut.onend = () => { chunkIndex++; playNextChunk(); };
                    ut.onerror = () => { chunkIndex++; playNextChunk(); };
                    this.synth.speak(ut);
                } else {
                    chunkIndex++;
                    playNextChunk();
                }
            };

            this.ttsAudio.addEventListener('ended', onChunkEnd);
            this.ttsAudio.addEventListener('error', onChunkError);

            const playPromise = this.ttsAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Fallback to WebSpeech on browser audio gesture restriction
                    if (this.synth) {
                        this.synth.cancel();
                        const ut = new SpeechSynthesisUtterance(chunkText);
                        ut.lang = 'hi-IN';
                        ut.onend = () => { chunkIndex++; playNextChunk(); };
                        ut.onerror = () => { chunkIndex++; playNextChunk(); };
                        this.synth.speak(ut);
                    }
                });
            }
        };

        const playNextChunk = () => {
            if (!this.isPlaying) return;
            if (chunkIndex >= chunks.length) {
                onAllChunksFinished();
                return;
            }

            const currentChunk = chunks[chunkIndex];

            // If system has true Hindi voice installed (e.g. Android/Mac/Google Hindi)
            if (this.synth && this.hasNativeHindiVoice && this.femaleVoice) {
                this.synth.cancel();
                const ut = new SpeechSynthesisUtterance(currentChunk);
                this.currentUtterance = ut;
                ut.voice = this.femaleVoice;
                ut.lang = 'hi-IN';
                ut.pitch = 1.0;
                ut.rate = 0.95 * this.playbackRate;

                ut.onend = () => {
                    chunkIndex++;
                    playNextChunk();
                };
                ut.onerror = () => {
                    playCloudChunk(currentChunk);
                };

                setTimeout(() => {
                    if (this.isPlaying && this.synth) this.synth.speak(ut);
                }, 30);
            } else {
                // Windows / Systems without Hindi Voice pack: Use sweet Cloud Google Hindi
                playCloudChunk(currentChunk);
            }
        };

        playNextChunk();
    }

    stopAudioSources() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
        if (this.ttsAudio) {
            this.ttsAudio.pause();
            this.ttsAudio.currentTime = 0;
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
        const floatAbBtn = document.getElementById('floatingAudioTrigger');
        const avatarBox = document.getElementById('abNarratorAvatarBox');

        if (playBtn) playBtn.innerHTML = playing ? '⏸️' : '▶️';
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

                <!-- BGM & Speed & Close Controls -->
                <div class="ab-right">
                    <!-- BGM Toggle Button -->
                    <button id="abBgmToggleBtn" class="ab-ctrl-btn" title="बैकग्राउंड म्यूजिक चालू/बंद" style="width:32px; height:32px; font-size:14px;">🎵</button>

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
        
        document.getElementById('abBgmToggleBtn').addEventListener('click', () => {
            this.bgm.toggleMute();
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

        // Auto-open if redirected with ?audio=1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('audio') === '1' || urlParams.get('audio') === 'true') {
            setTimeout(() => {
                bar.classList.add('open');
                this.playCurrentPage();
            }, 800);
        }

        // 4-Second Marketing Audio Feature Announcement Toast
        setTimeout(() => {
            this.showMarketingAudioToast();
        }, 1000);
    }

    showMarketingAudioToast() {
        if (sessionStorage.getItem('AIM_AUDIO_TOAST_SHOWN')) return;
        sessionStorage.setItem('AIM_AUDIO_TOAST_SHOWN', 'true');

        const toast = document.createElement('div');
        toast.id = 'abMarketingToast';
        toast.style.cssText = `
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(-150px);
            z-index: 999999;
            background: linear-gradient(135deg, #fef08a 0%, #fde047 45%, #eab308 100%);
            border: 2px solid #ca8a04;
            border-radius: 14px;
            padding: 10px 14px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 0 25px rgba(234,179,8,0.55);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            color: #78350f;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            width: calc(100% - 24px);
            max-width: 440px;
            box-sizing: border-box;
        `;

        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; min-width:0; flex:1;">
                <div style="width:34px; height:34px; border-radius:50%; background:#78350f; color:#fef08a; display:flex; align-items:center; justify-content:center; font-size:1.15rem; flex-shrink:0; box-shadow:0 2px 8px rgba(120,53,15,0.35);">
                    🎧
                </div>
                <div style="min-width:0; flex:1;">
                    <div style="font-size:0.86rem; font-weight:800; color:#78350f; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        🎉 खुशखबरी! इस पुस्तक का ऑडियो उपलब्ध है
                    </div>
                    <div style="font-size:0.72rem; color:#854d0e; font-weight:600; line-height:1.2; margin-top:2px;">
                        पढ़ने के साथ-साथ पूरी किताब की आवाज़ भी सुनें
                    </div>
                </div>
            </div>
            <button id="toastPlayAudioBtn" style="background:#78350f; color:#ffffff; border:1.5px solid #451a03; border-radius:20px; padding:6px 12px; font-size:0.76rem; font-weight:800; cursor:pointer; white-space:nowrap; flex-shrink:0; box-shadow:0 3px 10px rgba(120,53,15,0.4); display:inline-flex; align-items:center; gap:4px;">
                <span>▶️</span> <span>सुनें</span>
            </button>
        `;

        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        const playBtn = toast.querySelector('#toastPlayAudioBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const bar = document.getElementById('audioBookBar');
                if (bar) bar.classList.add('open');
                this.playCurrentPage();
                toast.style.transform = 'translateX(-50%) translateY(-150px)';
                setTimeout(() => toast.remove(), 400);
            });
        }

        // Auto hide after exactly 4 seconds (4000ms)
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.style.transform = 'translateX(-50%) translateY(-150px)';
                setTimeout(() => toast.remove(), 400);
            }
        }, 4000);
    }
}

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
    window.aoiAudioBookEngine = new ProAudioBookEngine();
});

