/**
 * =================================================================
 * AAROGYAM INDIA - PRO HYBRID AUDIO BOOK ENGINE v5.5 (ROCK SOLID)
 * =================================================================
 * 1. Admin Recorded Audio: Real human voice with background streaming
 * 2. Natural TTS: Hindi Female (Kalpana/Swara/Google हिन्दी) with chunking
 * 3. Animated Leaf Progress Bar (🍃): Live progress & smooth scrubbing
 * 4. Volume, Mute & Speed Controls: (0.75x to 2.0x, volume slider, mute)
 * 5. MediaSession & Background Playback: Lock screen media controls & WakeLock
 * 6. Polite Missing Audio Voice: "इस पेज का ऑडियो मैं नहीं पढ़ पा रही हूँ..."
 * 7. 100% Atomic Page Synchronization: Instant switch on any page turn
 */

class SoothingBgmEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.gainNode = null;
        this.oscillators = [];
        this.volume = 0.0;
        this.isMuted = true;
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
            if (!this.ctx || this.isPlaying) return;

            this.gainNode = this.ctx.createGain();
            this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.gainNode.connect(this.ctx.destination);

            const freqs = [130.81, 196.00, 261.63, 392.00, 523.25];
            this.oscillators = freqs.map((f, i) => {
                const osc = this.ctx.createOscillator();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(f, this.ctx.currentTime);

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(450 + (i * 50), this.ctx.currentTime);

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
        this.volume = 1.0;
        this.isMuted = false;
        this.currentUtterance = null;
        this.audioElement = new Audio();
        this.bgm = new SoothingBgmEngine();
        this.autoNextPage = true;
        this.pageScripts = {};
        this.metadata = {};
        this.userName = "किसान मित्र";
        this.welcomePlayed = false;
        this.isPageRecordedAudio = false;
        this.activeEpoch = 0;
        this.activeTimers = [];

        this.hasNativeHindiVoice = false;
        this.ttsAudio = new Audio();
        this.wakeLock = null;

        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.isUserSeeking = false;
        this.silentKeepAliveAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
        this.silentKeepAliveAudio.loop = true;
        this.silentKeepAliveAudio.volume = 0.01;

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
        this.setupMediaSession();
        console.log("✅ Pro AudioBookEngine v5.5 (Dual-Engine Rock Solid Voice) Initialized for:", this.userName);
    }

    getUserProfileName() {
        try {
            const sessionManager = (typeof V1_SESSION !== "undefined") ? V1_SESSION : window.V1_SESSION;
            const user = sessionManager && typeof sessionManager.getCurrentUser === "function" 
                ? sessionManager.getCurrentUser() 
                : null;
            
            if (user) {
                let name = (user.name || user.fullName || user.first_name || "").trim();
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
            if (this.isPageRecordedAudio && this.isPlaying) {
                this.handleTrackEnded();
            }
        });

        this.audioElement.addEventListener('timeupdate', () => {
            if (this.isPageRecordedAudio && !this.isUserSeeking) {
                const cur = this.audioElement.currentTime || 0;
                const dur = this.audioElement.duration || 0;
                this.updateProgressBar(cur, dur);
            }
        });

        this.audioElement.addEventListener('play', () => {
            this.setPlayingState(true);
            this.requestWakeLock();
        });

        this.audioElement.addEventListener('pause', () => {
            if (!this.synth || !this.synth.speaking) {
                this.setPlayingState(false);
            }
        });

        this.audioElement.addEventListener('error', (e) => {
            console.warn("Audio element playback error, falling back to TTS:", e);
        });
    }

    handleTrackEnded() {
        const totalPages = window.aoiTotalPages || 152;
        const curPage = window.aoiPageNum || 1;
        if (this.autoNextPage && curPage < totalPages) {
            this.updateStatusDisplay(`⏭️ पृष्ठ ${curPage} समाप्त • अगले पृष्ठ पर जा रहे हैं...`);
            setTimeout(() => {
                if (!this.isPlaying) return;
                if (typeof window.onNextPage === 'function') {
                    window.onNextPage();
                }
            }, 700);
        } else {
            this.setPlayingState(false);
            this.updateStatusDisplay(`✅ पुस्तक वाचन समाप्त हुआ`);
        }
    }

    async requestWakeLock() {
        try {
            if ('wakeLock' in navigator && !this.wakeLock) {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    this.wakeLock = null;
                });
            }
        } catch (err) {
            console.warn("WakeLock request note:", err);
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release().catch(() => {});
            this.wakeLock = null;
        }
    }

    setupMediaSession() {
        if (!('mediaSession' in navigator)) return;

        navigator.mediaSession.setActionHandler('play', () => {
            this.togglePlay();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            this.pause();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
            if (typeof window.onPrevPage === 'function') window.onPrevPage();
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
            if (typeof window.onNextPage === 'function') window.onNextPage();
        });
        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime !== undefined && this.isPageRecordedAudio && this.audioElement.duration) {
                this.audioElement.currentTime = details.seekTime;
                this.updateProgressBar(this.audioElement.currentTime, this.audioElement.duration);
            }
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
            if (this.isPageRecordedAudio) {
                this.audioElement.currentTime = Math.min(this.audioElement.duration || 0, this.audioElement.currentTime + 10);
            }
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
            if (this.isPageRecordedAudio) {
                this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - 10);
            }
        });
    }

    updateMediaSessionMetadata() {
        if (!('mediaSession' in navigator)) return;
        const curPage = window.aoiPageNum || 1;
        const total = window.aoiTotalPages || 1;
        const title = (window.aoiCurrentBookData && (window.aoiCurrentBookData.heading || window.aoiCurrentBookData.name || window.aoiCurrentBookData.title)) || document.getElementById('bookHeading')?.textContent || "Aarogyam E-Book";

        let coverUrl = '/images/logo/logo.png';
        if (window.aoiCurrentBookData?.cover_image) coverUrl = window.aoiCurrentBookData.cover_image;
        else if (window.aoiCurrentBookData?.image) coverUrl = window.aoiCurrentBookData.image;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: `${title} (Page ${curPage}/${total})`,
            artist: 'Aarogyam India - Digital Library',
            album: 'Practical Agriculture Audio Book',
            artwork: [
                { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
    }

    async loadBookAudioScripts() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = (window.aoiBookId || urlParams.get('book') || urlParams.get('id') || 'BK001').trim().toUpperCase();
        
        let serverScripts = {};
        let serverMeta = {};

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

        const targetMain = (window.aoiCurrentBookData?.targetMainBook || bookId.replace(/^(DEMO_|DEMO-|FREE_|FREE-|BONUS_|BONUS-)/i, '') || '').toUpperCase().trim();
        if (targetMain && targetMain !== bookId) {
            if (Object.keys(serverScripts).length === 0) {
                try {
                    let resMain = await fetch(`../data/audio-scripts/${targetMain}.json?v=${Date.now()}`);
                    if (!resMain.ok) resMain = await fetch(`/data/audio-scripts/${targetMain}.json?v=${Date.now()}`);
                    if (resMain.ok) {
                        const dataMain = await resMain.json();
                        serverMeta = { ...dataMain, ...serverMeta };
                        serverScripts = { ...(dataMain.pages || {}), ...serverScripts };
                    }
                } catch(e) {}
            }
            try {
                const fallbackData = localStorage.getItem(`AOI_AUDIO_SCRIPTS_${targetMain}`);
                if (fallbackData) {
                    const parsed = JSON.parse(fallbackData);
                    if (parsed && parsed.pages) {
                        localScripts = { ...parsed.pages, ...localScripts };
                    }
                    serverMeta = { ...parsed, ...serverMeta };
                }
            } catch(e) {}
        }

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
    // MAIN PLAY ENGINE (ATOMIC & ZERO-DESYNC)
    // =======================================================
    async playCurrentPage() {
        const currentPage = window.aoiPageNum || 1;
        const effectivePage = (window.aoiSourcePageMap && window.aoiSourcePageMap[currentPage - 1]) ? window.aoiSourcePageMap[currentPage - 1] : currentPage;
        this.getUserProfileName();
        this.updateMediaSessionMetadata();

        // 1. Clean stop all ongoing audio sources immediately
        this.stopAudioSources();
        this.isPaused = false;
        this.isPlaying = true;
        this.setPlayingState(true);

        const pageKey = String(effectivePage);
        const pageEntry = this.pageScripts[pageKey] || this.pageScripts[String(currentPage)];

        // 2. Direct page text or recorded audio playback
        let pageText = '';
        let pageAudio = '';

        if (pageEntry) {
            if (typeof pageEntry === 'string') pageText = pageEntry;
            else if (typeof pageEntry === 'object') {
                pageText = pageEntry.text || '';
                pageAudio = pageEntry.audio || '';
            }
        }

        // Case A: Real Admin Recorded Audio exists
        if (pageAudio && pageAudio.trim().length > 0) {
            this.isPageRecordedAudio = true;
            this.updateNarratorDisplay();
            this.updateStatusDisplay(`🎙️ पृष्ठ ${currentPage} - रिकॉर्डेड आवाज़ चल रही है`);
            
            this.audioElement.src = pageAudio;
            this.audioElement.playbackRate = this.playbackRate;
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
            
            this.audioElement.play().catch(e => {
                console.warn("Audio play gesture required or autoplay restriction:", e);
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

        // Case C: Unrecorded Page -> Exact polite Hindi voice notice + Auto Next
        const politeNotice = `इस पेज का ऑडियो मैं नहीं पढ़ पा रही हूँ, जल्द ही इसमें ऑडियो आ जाएगा`;
        this.updateStatusDisplay(`⏳ पृष्ठ ${currentPage}: ऑडियो जल्द उपलब्ध होगा...`);
        this.speakText(politeNotice, currentPage);
    }

    splitTextIntoChunks(text) {
        if (!text) return [];
        if (typeof window.AarogyamAudioNormalizer !== 'undefined' && typeof window.AarogyamAudioNormalizer.splitIntoChunks === 'function') {
            return window.AarogyamAudioNormalizer.splitIntoChunks(text);
        }
        const clean = String(text)
            .replace(/[\u3002\uFF0E]/g, ' । ')
            .replace(/(\d+)\.(\d+)/g, '$1 दशमलव $2')
            .replace(/[•▪★●◆✦✓✔■►▶❖➔→⇒—–_~*#@&|^<>{}[\]"`'()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const segs = clean.split(/\s*।\s*/);
        const res = [];
        for (const s of segs) {
            const tr = s.trim();
            if (tr) res.push(tr);
        }
        return res.length ? res : [clean];
    }

    speakText(text, currentPage, isWelcome = false) {
        this.loadVoices();

        const chunks = this.splitTextIntoChunks(text);
        if (!chunks.length) return;

        this.currentChunks = chunks;
        this.totalChunks = chunks.length;
        this.currentChunkIndex = 0;

        const currentEpoch = ++this.activeEpoch;
        this.isPlaying = true;
        this.isPaused = false;
        this.setPlayingState(true);
        this.requestWakeLock();
        this.updateMediaSessionMetadata();

        try {
            if (this.silentKeepAliveAudio) this.silentKeepAliveAudio.play().catch(() => {});
        } catch(e) {}

        const onAllChunksFinished = () => {
            if (!this.isPlaying || this.activeEpoch !== currentEpoch) return;
            this.handleTrackEnded();
        };

        const playNextChunk = () => {
            if (!this.isPlaying || this.activeEpoch !== currentEpoch) return;
            if (this.currentChunkIndex >= chunks.length) {
                this.updateProgressBar(chunks.length, chunks.length);
                onAllChunksFinished();
                return;
            }

            const currentChunk = chunks[this.currentChunkIndex];
            if (!currentChunk || !currentChunk.trim()) {
                this.currentChunkIndex++;
                playNextChunk();
                return;
            }

            this.updateProgressBar(this.currentChunkIndex + 1, chunks.length);

            let hasAdvanced = false;
            const advance = () => {
                if (hasAdvanced || !this.isPlaying || this.activeEpoch !== currentEpoch) return;
                hasAdvanced = true;
                this.currentChunkIndex++;
                playNextChunk();
            };

            if (this.synth) {
                try {
                    this.synth.cancel();
                    const ut = new SpeechSynthesisUtterance(currentChunk);
                    ut.lang = 'hi-IN';
                    ut.pitch = 1.0;
                    ut.rate = 0.95 * (this.playbackRate || 1.0);
                    ut.volume = this.isMuted ? 0 : (this.volume || 1.0);

                    if (this.femaleVoice) {
                        ut.voice = this.femaleVoice;
                    }

                    ut.onend = () => {
                        advance();
                    };

                    ut.onerror = (e) => {
                        if (e && e.error !== 'canceled' && e.error !== 'interrupted') {
                            console.warn("Speech error:", e);
                        }
                        advance();
                    };

                    this.synth.speak(ut);
                } catch(err) {
                    console.warn("Synth speak error:", err);
                    advance();
                }
            } else {
                advance();
            }
        };

        playNextChunk();
    }

    stopAudioSources() {
        this.activeEpoch = (this.activeEpoch || 0) + 1;
        if (Array.isArray(this.activeTimers)) {
            this.activeTimers.forEach(t => {
                clearTimeout(t);
                clearInterval(t);
            });
            this.activeTimers = [];
        }
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.audioElement.src = '';
        }
        if (this.ttsAudio) {
            this.ttsAudio.pause();
            this.ttsAudio.currentTime = 0;
        }
        if (this.synth) {
            try {
                this.synth.cancel();
            } catch(e) {}
        }
        if (this.silentKeepAliveAudio) {
            try { this.silentKeepAliveAudio.pause(); } catch(e) {}
        }
        this.releaseWakeLock();
    }

    pause() {
        this.stopAudioSources();
        this.isPaused = true;
        this.isPlaying = false;
        this.setPlayingState(false);
        this.updateStatusDisplay(`⏸️ ऑडियो रुका हुआ है`);
        this.releaseWakeLock();
    }

    stop() {
        this.stopAudioSources();
        this.bgm.stop();
        this.isPaused = false;
        this.isPlaying = false;
        this.setPlayingState(false);
        this.updateStatusDisplay(`⏹️ ऑडियो बंद है`);
        this.updateProgressBar(0, 100);
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
        this.playbackRate = parseFloat(speed) || 1.0;
        if (this.audioElement) {
            this.audioElement.playbackRate = this.playbackRate;
        }
        const speedSelect = document.getElementById('abSpeedSelect');
        if (speedSelect) speedSelect.value = String(this.playbackRate);
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, parseFloat(vol)));
        this.isMuted = (this.volume === 0);
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }
        this.updateVolumeUi();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.audioElement) {
            this.audioElement.volume = this.isMuted ? 0 : this.volume;
        }
        this.updateVolumeUi();
    }

    updateVolumeUi() {
        const btn = document.getElementById('abVolumeBtn');
        const slider = document.getElementById('abVolumeSlider');
        if (btn) {
            btn.innerHTML = this.isMuted ? '🔇' : (this.volume > 0.5 ? '🔊' : '🔉');
            btn.title = this.isMuted ? 'अनम्यूट करें' : 'म्यूट करें';
        }
        if (slider) {
            slider.value = this.isMuted ? 0 : this.volume;
        }
    }

    seekProgress(percent) {
        percent = Math.max(0, Math.min(100, percent));
        if (this.isPageRecordedAudio && this.audioElement && this.audioElement.duration) {
            this.audioElement.currentTime = (percent / 100) * this.audioElement.duration;
            this.updateProgressBar(this.audioElement.currentTime, this.audioElement.duration);
        } else if (this.currentChunks && this.currentChunks.length > 0) {
            const targetChunk = Math.min(this.currentChunks.length - 1, Math.floor((percent / 100) * this.currentChunks.length));
            this.currentChunkIndex = targetChunk;
            this.updateProgressBar(targetChunk + 1, this.currentChunks.length);
        }
    }

    updateProgressBar(current, total) {
        const track = document.getElementById('abProgressFill');
        const leaf = document.getElementById('abLeafIndicator');
        const timeDisplay = document.getElementById('abTimeDisplay');
        
        let percent = 0;
        let timeStr = "0:00 / 0:00";

        if (total > 0) {
            percent = Math.min(100, Math.max(0, (current / total) * 100));
            if (this.isPageRecordedAudio) {
                const formatSec = (s) => {
                    const m = Math.floor(s / 60);
                    const sec = Math.floor(s % 60);
                    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
                };
                timeStr = `${formatSec(current)} / ${formatSec(total)}`;
            } else {
                timeStr = `भाग ${Math.round(current)} / ${Math.round(total)}`;
            }
        }

        if (track) track.style.width = `${percent}%`;
        if (leaf) leaf.style.left = `${percent}%`;
        if (timeDisplay) timeDisplay.textContent = timeStr;
    }

    setPlayingState(playing) {
        this.isPlaying = playing;
        const playBtn = document.getElementById('abPlayBtn');
        const floatAbBtn = document.getElementById('floatingAudioTrigger');
        const avatarBox = document.getElementById('abNarratorAvatarBox');
        const waveBox = document.getElementById('abWaveVisualizer');
        const leaf = document.getElementById('abLeafIndicator');

        if (playBtn) playBtn.innerHTML = playing ? '⏸️' : '▶️';
        if (avatarBox) {
            if (playing) avatarBox.classList.add('pulse-avatar');
            else avatarBox.classList.remove('pulse-avatar');
        }
        if (waveBox) {
            if (playing) waveBox.classList.add('active');
            else waveBox.classList.remove('active');
        }
        if (leaf) {
            if (playing) leaf.classList.add('swimming-leaf');
            else leaf.classList.remove('swimming-leaf');
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
            <!-- Top Controls Row -->
            <div class="ab-content">
                <!-- Narrator Info -->
                <div class="ab-left">
                    <div class="ab-avatar-box" id="abNarratorAvatarBox">
                        <img id="abNarratorAvatar" src="/images/logo/fevicon.png" alt="Narrator" class="ab-avatar-img" />
                    </div>
                    <div class="ab-info">
                        <span class="ab-title" id="abNarratorName">कृषि सखी</span>
                        <span class="ab-status" id="abStatusText">तैयार है • "सुनें" दबाएं</span>
                    </div>
                </div>

                <!-- Center Controls & Visualizer -->
                <div class="ab-center">
                    <div class="ab-wave" id="abWaveVisualizer">
                        <span></span><span></span><span></span><span></span>
                    </div>
                    <button class="ab-ctrl-btn" id="abPrevBtn" title="पिछला पृष्ठ">⏮️</button>
                    <button class="ab-main-play-btn" id="abPlayBtn" title="सुनें">▶️</button>
                    <button class="ab-ctrl-btn" id="abNextBtn" title="अगला पृष्ठ">⏭️</button>
                </div>

                <!-- Right Controls: Volume, Speed, BGM, Close -->
                <div class="ab-right">
                    <!-- Volume Control -->
                    <div class="ab-vol-group" title="वॉल्यूम नियंत्रण">
                        <button id="abVolumeBtn" class="ab-ctrl-btn ab-vol-btn">🔊</button>
                        <input type="range" id="abVolumeSlider" min="0" max="1" step="0.05" value="1" class="ab-vol-slider" />
                    </div>

                    <!-- BGM Toggle Button -->
                    <button id="abBgmToggleBtn" class="ab-ctrl-btn" title="बैकग्राउंड म्यूजिक चालू/बंद">🎵</button>

                    <!-- Speed Selector -->
                    <select id="abSpeedSelect" class="ab-select" title="ऑडियो गति">
                        <option value="0.75">0.75x</option>
                        <option value="1.0" selected>1.0x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2.0">2.0x</option>
                    </select>
                    <button class="ab-close-btn" id="abCloseBtn" title="बंद करें">✕</button>
                </div>
            </div>

            <!-- Bottom Row: Animated Swimming Leaf Progress Bar 🍃 -->
            <div class="ab-progress-row">
                <div class="ab-progress-track-wrapper" id="abProgressContainer">
                    <div class="ab-progress-track">
                        <div class="ab-progress-fill" id="abProgressFill" style="width: 0%;"></div>
                    </div>
                    <!-- Swimming Animated Leaf Indicator -->
                    <div class="ab-leaf-indicator swimming-leaf" id="abLeafIndicator" style="left: 0%;">
                        <span class="leaf-icon">🍃</span>
                    </div>
                </div>
                <div class="ab-time-info" id="abTimeDisplay">0:00 / 0:00</div>
            </div>
        `;
        document.body.appendChild(bar);

        // Prominent Floating Audio Trigger with Red/Amber theme
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

        // Attach UI Event Listeners
        document.getElementById('abPlayBtn').addEventListener('click', () => this.togglePlay());
        
        document.getElementById('abPrevBtn').addEventListener('click', () => {
            if (typeof window.onPrevPage === 'function') {
                window.onPrevPage();
            }
        });
        
        document.getElementById('abNextBtn').addEventListener('click', () => {
            if (typeof window.onNextPage === 'function') {
                window.onNextPage();
            }
        });

        document.getElementById('abSpeedSelect').addEventListener('change', (e) => {
            this.setSpeed(e.target.value);
        });

        document.getElementById('abVolumeBtn').addEventListener('click', () => {
            this.toggleMute();
        });

        document.getElementById('abVolumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });
        
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

        // Interactive Progress Bar Seeking
        const progContainer = document.getElementById('abProgressContainer');
        if (progContainer) {
            const handleSeek = (e) => {
                const rect = progContainer.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clickX = clientX - rect.left;
                const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                this.seekProgress(pct);
            };

            progContainer.addEventListener('mousedown', (e) => {
                this.isUserSeeking = true;
                handleSeek(e);
            });

            window.addEventListener('mouseup', () => {
                if (this.isUserSeeking) this.isUserSeeking = false;
            });

            progContainer.addEventListener('touchstart', (e) => {
                this.isUserSeeking = true;
                handleSeek(e);
            }, { passive: true });

            window.addEventListener('touchend', () => {
                if (this.isUserSeeking) this.isUserSeeking = false;
            });
        }

        // Auto-open if redirected with ?audio=1
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('audio') === '1' || urlParams.get('audio') === 'true') {
            setTimeout(() => {
                bar.classList.add('open');
                this.playCurrentPage();
            }, 800);
        }

        // Feature Announcement Toast
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
