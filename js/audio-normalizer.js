/**
 * =================================================================
 * AAROGYAM INDIA - UNIVERSAL AUDIO SCRIPT NORMALIZER & TTS ENGINE v6.0
 * =================================================================
 * Solid Universal Ingestion Pipeline:
 * 1. Agricultural & Scientific Terminology to Spoken Hindi
 * 2. Units, Fractions, Doses, Chemical Formulations & Prices Conversion
 * 3. Bullet & Symbol Stripping (Zero dangling punctuation / commas)
 * 4. Semantic Clause Splitting (Natural 50-85 character rhythmic chunks)
 * 5. Multi-Layer Watchdog & Keep-Alive Pulse (Immune to Chromium 15s Stall)
 * =================================================================
 */

(function(global) {
    'use strict';

    const UniversalAudioNormalizer = {
        /**
         * 1. Clean & Convert Raw Text into Pure Spoken Hindi Text
         */
        cleanText: function(input) {
            if (!input) return '';
            let text = String(input);

            // A. Remove HTML tags if present
            text = text.replace(/<[^>]*>/g, ' ');

            // B. Replace Asian & full-stop variations with Hindi Purna Viram
            text = text.replace(/[\u3002\uFF0E]/g, ' । ');

            // C. Agricultural & Formulation Units Expansion
            text = text
                // Doses & Ratios (e.g. 2ml/L, 5kg/acre)
                .replace(/(\d+)\s*(?:ml|एमएल)\s*\/\s*(?:L|ltr|Ltr|ली|लीटर)/gi, '$1 मिलीलीटर प्रति लीटर')
                .replace(/(\d+)\s*(?:g|gm|ग्राम)\s*\/\s*(?:L|ltr|Ltr|ली|लीटर)/gi, '$1 ग्राम प्रति लीटर')
                .replace(/(\d+)\s*(?:kg|किग्रा|किलो)\s*\/\s*(?:acre|एकड़)/gi, '$1 किलो प्रति एकड़')
                .replace(/(\d+)\s*(?:kg|किग्रा|किलो)\s*\/\s*(?:ha|हेक्टेयर)/gi, '$1 किलो प्रति हेक्टेयर')
                // Formulation types (EC, WP, SC, SL, SP, WG, FS, GR)
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*EC\b/gi, '$1 प्रतिशत ई सी')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*WP\b/gi, '$1 प्रतिशत डब्ल्यूपी')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*SC\b/gi, '$1 प्रतिशत एस सी')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*SL\b/gi, '$1 प्रतिशत एस एल')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*SP\b/gi, '$1 प्रतिशत एस पी')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*WG\b/gi, '$1 प्रतिशत डब्ल्यू जी')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*FS\b/gi, '$1 प्रतिशत एफ एस')
                .replace(/\b(\d+(?:\.\d+)?)\s*%\s*GR\b/gi, '$1 प्रतिशत जी आर')
                // Fertilizers & Technical Terms
                .replace(/\bN:P:K\b|\bNPK\b/gi, 'एन पी के')
                .replace(/\bDAP\b/gi, 'डी ए पी')
                .replace(/\bMOP\b/gi, 'एम ओ पी')
                .replace(/\bSSP\b/gi, 'एस एस पी')
                .replace(/\bIPM\b/gi, 'आई पी एम')
                .replace(/\bpH\b/gi, 'पी एच')
                .replace(/\bppm\b/gi, 'पी पी एम')
                .replace(/\bWhatsApp\b|\bwhatsapp\b/gi, 'व्हाट्सएप')
                .replace(/\bAI\b|\bAi\b/gi, 'ए आई')
                .replace(/\bPDF\b|\bpdf\b/gi, 'पीडीएफ')
                .replace(/\bTOC\b/gi, 'विषय सूची')
                .replace(/\b4K\b/gi, '4K')
                .replace(/\b3D\b/gi, '3D')
                .replace(/\bHD\b/gi, 'एच डी')
                // Units
                .replace(/%/g, ' प्रतिशत ')
                .replace(/(\d+)\s*(?:kg|किग्रा)/gi, '$1 किलोग्राम ')
                .replace(/(\d+)\s*(?:gm|g|ग्राम)/gi, '$1 ग्राम ')
                .replace(/(\d+)\s*(?:ml|एमएल)/gi, '$1 मिलीलीटर ')
                .replace(/(\d+)\s*(?:L|ltr|Ltr|लीटर)/gi, '$1 लीटर ')
                .replace(/₹\s*(\d+)|Rs\.?\s*(\d+)/gi, '$1$2 रुपये ')
                .replace(/(\d+)\s*°\s*C/gi, '$1 डिग्री सेल्सियस ')
                // Numbers & Decimals (e.g. 5.6 -> 5 दशमलव 6)
                .replace(/(\d+)\.(\d+)/g, '$1 दशमलव $2')
                .replace(/(\d+)\s*-\s*(\d+)/g, '$1 से $2')
                .replace(/(\d+)\/(\d+)/g, '$1 बटा $2');

            // D. Strip Emojis, Bullet Glyphs & Code Markers
            text = text
                .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ')
                .replace(/[•▪★●◆✦✓✔■►▶❖➔→⇒—–_~*#@&|^<>{}[\]"`'()]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // E. Clean trailing commas & punctuation clutter
            text = text
                .replace(/[,;:]+/g, ' , ')
                .replace(/[।\.?!]+/g, ' । ')
                .replace(/\s*,\s*।\s*/g, ' । ')
                .replace(/\s*।\s*,\s*/g, ' । ')
                .replace(/(?:।\s*)+/g, ' । ')
                .replace(/(?:,\s*)+/g, ' , ')
                .replace(/^[\s,।]+|[\s,।]+$/g, '');

            return text;
        },

        /**
         * 2. Intelligently Split ANY Script into 50-85 Char Rhythmic Spoken Chunks
         */
        splitIntoChunks: function(input) {
            const cleaned = this.cleanText(input);
            if (!cleaned) return [];

            // A. Primary split by Hindi full-stops, question marks, and line breaks
            const primaryBlocks = cleaned.split(/\s*।\s*/);
            const subSegments = [];

            // Conjunctions / Transition words for splitting overlong blocks
            const conjunctionRegex = /(\s+(?:और|तथा|एवं|जिसमें|जिससे|ताकि|इसलिए|परंतु|लेकिन|अतः|अर्थात|जैसे कि|इसके बाद|पहला चरण|दूसरा चरण|तीसरा चरण|चौथा चरण|पांचवा चरण|छठा चरण|पहला कदम|दूसरा कदम|तीसरा कदम|चौथा कदम|पांचवा कदम|छठा कदम|पहला सिद्धांत|दूसरा सिद्धांत|तीसरा सिद्धांत|चौथा सिद्धांत|पांचवा सिद्धांत)\s+)/i;

            for (const block of primaryBlocks) {
                const b = block.trim();
                if (!b) continue;

                if (b.length <= 85) {
                    subSegments.push(b);
                } else {
                    // Split by commas first
                    const commaParts = b.split(/\s*,\s*/);
                    for (const cp of commaParts) {
                        const c = cp.trim();
                        if (!c) continue;

                        if (c.length <= 85) {
                            subSegments.push(c);
                        } else {
                            // Split by Conjunctions
                            const conjParts = c.split(conjunctionRegex);
                            let temp = '';
                            for (const part of conjParts) {
                                const p = part.trim();
                                if (!p) continue;
                                if ((temp + ' ' + p).length <= 80) {
                                    temp = temp ? (temp + ' ' + p) : p;
                                } else {
                                    if (temp) subSegments.push(temp);
                                    temp = p;
                                }
                            }
                            if (temp) subSegments.push(temp);
                        }
                    }
                }
            }

            // Word-level safety split for any segment still > 85 chars
            const safeSegments = [];
            for (const seg of subSegments) {
                const s = seg.trim().replace(/^[\s,]+|[\s,]+$/g, '');
                if (!s) continue;

                if (s.length <= 85) {
                    safeSegments.push(s);
                } else {
                    const words = s.split(/\s+/);
                    let wChunk = '';
                    for (const w of words) {
                        if ((wChunk + ' ' + w).length > 75) {
                            if (wChunk) safeSegments.push(wChunk.trim());
                            wChunk = w;
                        } else {
                            wChunk = wChunk ? (wChunk + ' ' + w) : w;
                        }
                    }
                    if (wChunk) safeSegments.push(wChunk.trim());
                }
            }

            // Merge very short fragments (< 30 chars) with adjacent chunks for smooth breathing cadence
            const finalChunks = [];
            let current = '';

            for (const seg of safeSegments) {
                const clean = seg.trim().replace(/^[\s,]+|[\s,]+$/g, '');
                if (!clean) continue;

                if (!current) {
                    current = clean;
                } else if ((current + ' । ' + clean).length <= 80) {
                    current = current + ' । ' + clean;
                } else {
                    finalChunks.push(current);
                    current = clean;
                }
            }
            if (current) finalChunks.push(current);

            return finalChunks.length ? finalChunks : [cleaned];
        },

        /**
         * 3. Robust Self-Healing Speech Synthesis Player
         */
        speakChunksSafe: function(options) {
            const text = options.text || '';
            const onStatus = options.onStatus || function() {};
            const onChunkStart = options.onChunkStart || function() {};
            const onFinished = options.onFinished || function() {};
            const rate = options.rate || 0.96;
            const pitch = options.pitch || 1.0;
            const voice = options.voice || null;

            const chunks = this.splitIntoChunks(text);
            if (!chunks.length) {
                onFinished();
                return { stop: function() {} };
            }

            let isRunning = true;
            let chunkIdx = 0;
            let currentUtterance = null;
            let watchdogTimer = null;
            let keepAliveTimer = null;

            const stopPlayer = () => {
                isRunning = false;
                if (watchdogTimer) clearTimeout(watchdogTimer);
                if (keepAliveTimer) clearInterval(keepAliveTimer);
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            };

            // Global Keep-Alive Heartbeat (fixes Chromium 15s freeze)
            keepAliveTimer = setInterval(() => {
                if (!isRunning) {
                    clearInterval(keepAliveTimer);
                    return;
                }
                if ('speechSynthesis' in window && window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }
            }, 1800);

            const playNext = () => {
                if (!isRunning) return;
                if (chunkIdx >= chunks.length) {
                    stopPlayer();
                    onFinished();
                    return;
                }

                const currentChunk = chunks[chunkIdx];
                if (!currentChunk || !currentChunk.trim()) {
                    chunkIdx++;
                    playNext();
                    return;
                }

                onChunkStart(chunkIdx + 1, chunks.length, currentChunk);

                if ('speechSynthesis' in window) {
                    try {
                        const ut = new SpeechSynthesisUtterance(currentChunk);
                        currentUtterance = ut;
                        if (voice) ut.voice = voice;
                        ut.lang = 'hi-IN';
                        ut.rate = rate;
                        ut.pitch = pitch;

                        let hasAdvanced = false;
                        const advance = () => {
                            if (hasAdvanced || !isRunning) return;
                            hasAdvanced = true;
                            if (watchdogTimer) clearTimeout(watchdogTimer);
                            chunkIdx++;
                            playNext();
                        };

                        ut.onend = () => {
                            advance();
                        };

                        ut.onerror = (e) => {
                            console.warn("SpeechSynthesis utterance note:", e?.error);
                            advance();
                        };

                        // Dynamic Watchdog: auto-advance if browser drops event
                        const watchdogMs = Math.min(12000, Math.max(3000, currentChunk.length * 150));
                        watchdogTimer = setTimeout(() => {
                            if (!hasAdvanced && isRunning) {
                                console.warn("Watchdog auto-advanced chunk:", currentChunk);
                                advance();
                            }
                        }, watchdogMs);

                        setTimeout(() => {
                            if (isRunning && 'speechSynthesis' in window) {
                                window.speechSynthesis.speak(ut);
                            }
                        }, 25);
                    } catch(err) {
                        console.error("Utterance error:", err);
                        chunkIdx++;
                        playNext();
                    }
                } else {
                    chunkIdx++;
                    playNext();
                }
            };

            playNext();

            return {
                stop: stopPlayer,
                chunks: chunks
            };
        }
    };

    // Export globally
    global.AarogyamAudioNormalizer = UniversalAudioNormalizer;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = UniversalAudioNormalizer;
    }

})(typeof window !== 'undefined' ? window : globalThis);
