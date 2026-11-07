/**
 * 🏛️ AAROGYAM INDIA — UNIVERSAL PROMOTIONS & FESTIVAL GATEWAY ENGINE
 * 
 * Complies 100% with AAROGYAM MANAS:
 * 1. Add-on, Enrich, Never Break (Independent sandboxed overlay)
 * 2. 100% Dynamic JSON-driven (data/universal-promotions.json)
 * 3. No-Profile No-Share Rule (Share requires registered profile & official share_id)
 * 4. Zero Phone Number Egress (Only official share_id in URLs/messages)
 * 5. Zero Supabase Egress (Runs entirely via CDN-cached JSON & local storage)
 * 6. High-Performance HTML5 Canvas particle & 3D CSS levitation
 */

(function () {
    'use strict';

    if (typeof window === 'undefined') return;

    window.AarogyamPromotionGateway = {
        initialized: false,
        activePromo: null,
        canvasAnimFrame: null,

        // 1. Target Page Matching
        // 1. Target Page Matching & Expiry Time Check
        isBookLandingPage: function () {
            try {
                const path = (window.location.pathname || '').toLowerCase();
                const search = (window.location.search || '').toLowerCase();
                return (path.includes('book-landing') || search.includes('id=bk') || path.includes('/ebooks/book-landing') || path.includes('reader'));
            } catch (e) {
                return false;
            }
        },

        // Strict Rule: Time khatm hone ke baad (Start/End Date ke bahar) ya inactive hone par na popup aayega na gift box
        isPromoTimeActive: function (promo) {
            if (!promo || !promo.is_active) return false;
            const now = Date.now();
            if (promo.start_date) {
                const start = new Date(promo.start_date).getTime();
                if (now < start) return false;
            }
            if (promo.end_date) {
                const end = new Date(promo.end_date).getTime();
                if (now > end) return false;
            }
            return true;
        },

        shouldDisplayOnPage: function (targetPages) {
            try {
                const path = (window.location.pathname || '').toLowerCase();

                // STRICT AAROGYAM MANAS RULE: Never display on Book Landing Pages, Reader, Admin, or Checkout!
                if (this.isBookLandingPage()) return false;
                if (path.includes('/admin') || path.endsWith('admin.html')) return false;
                if (path.includes('payment-') || path.includes('checkout-success') || path.includes('order-confirmation')) return false;

                if (!Array.isArray(targetPages) || targetPages.length === 0 || targetPages.includes('all')) {
                    return true;
                }

                // Check specific targets
                const isHome = (path === '/' || path.endsWith('index.html') || path === '');
                const isLibrary = path.includes('my-library') || path.includes('library.html');
                const isTube = path.includes('tube.html');
                const isProfile = path.includes('profile.html') || path.includes('/pages/profile');

                if (targetPages.includes('home') && isHome) return true;
                if (targetPages.includes('library') && isLibrary) return true;
                if (targetPages.includes('tube') && isTube) return true;
                if (targetPages.includes('profile') && isProfile) return true;

                return false;
            } catch (e) {
                return false;
            }
        },

        // 2. Page Identification & Frequency Controls
        getPageIdentifier: function () {
            try {
                const p = (window.location.pathname || '').toLowerCase();
                if (p.includes('my-library')) return 'library';
                if (p.includes('profile')) return 'profile';
                if (p.includes('tube')) return 'tube';
                return 'home';
            } catch (e) {
                return 'home';
            }
        },

        // 24-Hour Sweet Spot Frequency (Full 3D popup only once per 24 hours)
        shouldShowFullPopupToday: function (promoId) {
            try {
                const search = (window.location.search || '').toLowerCase();
                if (search.includes('promo=') || search.includes('test_promo') || search.includes('preview')) {
                    return true;
                }
                const key = 'AI_PROMO_DAILY_SHOWN_' + promoId;
                const lastShownAt = parseInt(localStorage.getItem(key) || '0', 10);
                if (!lastShownAt) return true;

                const elapsedMs = Date.now() - lastShownAt;
                return elapsedMs >= (24 * 60 * 60 * 1000);
            } catch (e) {
                return true;
            }
        },

        markFullPopupShownToday: function (promoId) {
            try {
                const key = 'AI_PROMO_DAILY_SHOWN_' + promoId;
                localStorage.setItem(key, String(Date.now()));
            } catch (e) { }
        },

        isMinimizedOnPage: function (promoId) {
            try {
                const pageId = this.getPageIdentifier();
                return sessionStorage.getItem('AI_PROMO_MINIMIZED_' + promoId + '_' + pageId) === '1';
            } catch (e) {
                return false;
            }
        },

        setMinimizedOnPage: function (promoId) {
            try {
                const pageId = this.getPageIdentifier();
                sessionStorage.setItem('AI_PROMO_MINIMIZED_' + promoId + '_' + pageId, '1');
            } catch (e) { }
        },

        markDismissed: function (promoId) {
            this.setMinimizedOnPage(promoId);
            this.markFullPopupShownToday(promoId);
        },

        // 3. User Identity & Constitutional Profile Check
        getUserInfo: function () {
            let fullName = 'प्रिय पाठक';
            let shareId = null;
            let isRegistered = false;
            let mobile = '';

            try {
                // Check all Aarogyam identity caches
                const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('UCAS_USER') || localStorage.getItem('AI_PROFILE') || '{}');
                if (u && (u.id || u.mobile)) {
                    isRegistered = true;
                    fullName = u.full_name || u.name || fullName;
                    shareId = u.share_id || u.referral_code || null;
                    mobile = u.mobile || u.phone || '';
                }

                if (!shareId) {
                    shareId = localStorage.getItem('user_share_id') || localStorage.getItem('user_referral_code') || null;
                }
                if (!mobile) {
                    mobile = localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_mobile') || '';
                }
                const savedName = localStorage.getItem('user_name') || localStorage.getItem('aim_user_name');
                if (savedName && savedName.trim()) {
                    fullName = savedName.trim();
                }

                // Strict Manas rule: share_id cannot be mobile numbers or empty
                if (shareId && /^\d{10}$/.test(shareId)) {
                    shareId = null; // Purge illegal phone number referral
                }

                if (localStorage.getItem('user_id') || localStorage.getItem('profile_id') || localStorage.getItem('aarogyam_user_registered')) {
                    isRegistered = true;
                }
            } catch (e) { }

            return {
                name: fullName,
                shareId: shareId,
                phone: mobile,
                isRegistered: isRegistered && Boolean(shareId)
            };
        },

        // 3.5 Pure Web Audio API Sound Chime (0 KB Egress - Crystal Clear Bell Chord)
        playChimeSound: function () {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
                const now = ctx.currentTime;
                // High-fidelity musical bell chime (C6 - G6 - C7 progression)
                const freqs = [1046.5, 1567.98, 2093.0];
                freqs.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.04);
                    gain.gain.setValueAtTime(0.15 / (idx + 1), now + idx * 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.55);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + idx * 0.04);
                    osc.stop(now + idx * 0.04 + 0.6);
                });
            } catch (e) { }
        },

        // 3.6 Floating Toast Notification (Top-centered, clear multi-line, never blocks buttons)
        showToast: function (msg, bg = '#10b981') {
            const old = document.getElementById('agy-promo-toast');
            if (old) old.remove();
            const toast = document.createElement('div');
            toast.id = 'agy-promo-toast';
            toast.style.cssText = `position:fixed;top:24px;left:50%;transform:translateX(-50%);background:${bg};color:#ffffff;padding:12px 22px;border-radius:18px;font-size:0.92rem;font-weight:800;z-index:99999999;box-shadow:0 10px 32px rgba(0,0,0,0.65);border:1.5px solid rgba(255,255,255,0.3);text-align:center;max-width:92vw;width:max-content;white-space:normal;line-height:1.45;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;animation:agyToastPop 0.3s ease;`;
            toast.innerHTML = msg;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.transition = 'opacity 0.4s, transform 0.4s';
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(-12px)';
                setTimeout(() => toast.remove(), 400);
            }, 3400);
        },

        // 4. Trigger Auth Modal if Not Registered (Uses existing universal registration system)
        promptRegistrationForShare: function (onSuccess) {
            // 1. Universal Guest Auth Modal (Full 2-field fast registration)
            if (typeof window.openGuestLoginModal === 'function') {
                window.openGuestLoginModal((userObj) => {
                    this.playChimeSound();
                    if (typeof onSuccess === 'function') onSuccess(userObj);
                }, {
                    force: true,
                    title: '🎁 शुभकामना शेयर करने हेतु 1-मिनट पंजीकरण',
                    subtitle: 'अपना नाम व नंबर दर्ज करें और अपना आधिकारिक शेयर आईडी प्राप्त करें'
                });
                return;
            }

            // 2. Sakhi Auth Modal
            if (typeof window.openSakhiAuthModal === 'function') {
                window.openSakhiAuthModal();
                return;
            }

            // 3. Unified Auth Modal
            if (typeof window.openUnifiedAuthModal === 'function') {
                window.openUnifiedAuthModal();
                return;
            }

            // Fallback friendly registration prompt
            const confirmed = window.confirm(
                "🌟 शुभकामना संदेश शेयर करने के लिए कृपया पहले 1-मिनट में अपना खाता रजिस्टर करें ताकि आपका आधिकारिक शेयर आईडी लिंक बन सके।\n\nक्या आप अभी रजिस्टर करना चाहते हैं?"
            );
            if (confirmed) {
                window.location.href = '/ebooks/my-library.html?action=register';
            }
        },

        // 5. Handle WhatsApp Share (Awards +10 Points on 10 Shares, Audio Chime & Shares Real Image)
        handleShare: async function (promo) {
            let user = this.getUserInfo();

            if (!user.isRegistered || !user.shareId) {
                this.promptRegistrationForShare((newUser) => {
                    // Re-trigger share with new registered profile!
                    this.handleShare(promo);
                });
                return;
            }

            // Prompt sender for their real name if default or missing so it's always included in the message!
            if (!user.name || user.name === 'प्रिय पाठक' || user.name === 'स्वास्थ्य साधक') {
                const entered = window.prompt("✨ अपनों को शुभकामना संदेश भेजने के लिए कृपया अपना शुभ नाम दर्ज करें (जैसे: रमेश पटेल):", "");
                if (entered && entered.trim()) {
                    user.name = entered.trim();
                    try {
                        localStorage.setItem('user_name', user.name);
                        localStorage.setItem('aim_user_name', user.name);
                    } catch (e) { }
                }
            }

            try {
                const origin = window.location.origin || 'https://aarogyamindia.com';
                const shareTarget = promo.target_url ? (origin + promo.target_url) : origin;
                const sep = shareTarget.includes('?') ? '&' : '?';
                // Attach share_id and sender's full name for recipient personalization
                const verifiedShareUrl = `${shareTarget}${sep}ref=${encodeURIComponent(user.shareId)}&from=${encodeURIComponent(user.name)}&promo=${encodeURIComponent(promo.id)}`;

                let tmpl = promo.share_message_template ||
                    `🪔 *{sender_name} जी की तरफ से सप्रेम बधाई और उपहार!* 🪔

आरोग्यम इंडिया की ओर से आपके व आपके पूरे परिवार को पावन पर्व की मंगलमय शुभकामनाएँ। 
स्वास्थ्य, दीर्घायु और समृद्धि का यह विशेष संदेश केवल आपके लिए भेजा गया है।

🎁 *{sender_name}* जी द्वारा भेजा गया उपहार व *5 पॉइंट्स* प्राप्त करने के लिए नीचे दिए गए लिंक पर क्लिक करें:
👉 {link}

✨ *क्या आप भी अपने नाम व नंबर से अपनों को यह पावन संदेश भेजना चाहते हैं?*
ऊपर दिए गए लिंक पर क्लिक करें, अपना नाम जोड़ें और 10 साथियों को शेयर करके विशेष गिफ्ट पॉइंट्स कमाएं!

_(नोट: यह 5 पॉइंट्स उपहार केवल नए सदस्यों के लिए मान्य है)_`;

                tmpl = tmpl.replace(/{sender_name}/g, user.name);
                tmpl = tmpl.replace(/{user_name}/g, user.name);
                tmpl = tmpl.replace(/{festival_title}/g, promo.title || 'उत्सव');
                tmpl = tmpl.replace(/{link}/g, verifiedShareUrl);

                // Play Audio Chime
                this.playChimeSound();

                // 🎯 10-Share Challenge Counter Logic (Only completes & credits at 10 shares)
                const shareKey = `AOI_SHARE_CHALLENGE_${promo.id || 'utsav'}_${user.phone || 'guest'}`;
                const totalGoal = 10;
                let currentShares = parseInt(localStorage.getItem(shareKey) || '0', 10);

                if (currentShares < totalGoal) {
                    currentShares += 1;
                    localStorage.setItem(shareKey, String(currentShares));

                    if (currentShares >= totalGoal) {
                        // 10 Shares Completed! Award 10 Points
                        try {
                            if (window.AarogyamWallet && typeof window.AarogyamWallet.creditPoints === 'function') {
                                window.AarogyamWallet.creditPoints(10, `🎯 10 शेयर लक्ष्य पूर्ण रिवॉर्ड`, 'earn_share_goal');
                            }
                        } catch (e) { }

                        // Direct bulletproof storage credit to guarantee points are 100% saved in AOI_WALLET_VAULT_V1
                        try {
                            const vaultKey = 'AOI_WALLET_VAULT_V1';
                            let vault = JSON.parse(localStorage.getItem(vaultKey) || 'null');
                            if (!vault) {
                                vault = {
                                    balance: 0,
                                    total_earned: 0,
                                    total_spent: 0,
                                    earned_self: 0,
                                    earned_referral: 0,
                                    ledger: [],
                                    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                                };
                            }
                            vault.balance = (vault.balance || 0) + 10;
                            vault.total_earned = (vault.total_earned || 0) + 10;
                            vault.earned_self = (vault.earned_self || 0) + 10;
                            vault.expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
                            vault.ledger = vault.ledger || [];
                            vault.ledger.unshift({
                                id: 'earn_' + Date.now(),
                                type: 'earn_share_goal',
                                title: '🎯 10 शेयर लक्ष्य पूर्ण रिवॉर्ड',
                                points: 10,
                                timestamp: new Date().toISOString(),
                                status: 'credited'
                            });
                            localStorage.setItem(vaultKey, JSON.stringify(vault));
                            localStorage.setItem('AOI_WALLET_BALANCE', String(vault.balance));
                        } catch (e) { }

                        this.showToast('🎉 बधाई! आपने 10 शेयर पूरे कर लिए! <strong>10 पॉइंट्स</strong> आपके वॉलेट में क्रेडिट हो गए! 🪙');
                        // Re-render promotion modal to show 'अपने पॉइंट्स देखें' button
                        setTimeout(() => { this.renderPromotion(promo); }, 800);
                    } else {
                        const remaining = totalGoal - currentShares;
                        this.showToast(`👏 1 शेयर हुआ! अब केवल <strong>${remaining} शेयर बाकी</strong> हैं! 🎯`);
                        // Live update counter in DOM if modal still open
                        const remBadge = document.getElementById('agyPromoRemBadge');
                        if (remBadge) remBadge.textContent = `${remaining} बाकी`;
                        const progBar = document.getElementById('agyPromoProgBar');
                        if (progBar) progBar.style.width = `${(currentShares / totalGoal) * 100}%`;
                        const btnText = document.getElementById('agyPromoShareBtnText');
                        if (btnText) btnText.textContent = `दोस्तों रिश्तेदारों को अपने नाम से भेजें`;
                    }
                } else {
                    this.showToast('🎉 आपका 10 शेयर लक्ष्य पहले ही पूरा हो चुका है! 🪙');
                }

                // Try native Web Share API with REAL JPEG IMAGE file (for Mobile WhatsApp)
                let nativeShared = false;
                if (navigator.share && promo.image_url) {
                    try {
                        const imgUrl = promo.image_url.startsWith('http') ? promo.image_url : (origin + promo.image_url);
                        const file = await this.loadImageAsJpegFile(imgUrl, `aarogyam-${promo.id || 'utsav'}`);
                        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: promo.title || 'शुभकामना संदेश',
                                text: tmpl
                            });
                            nativeShared = true;
                        }
                    } catch (shareErr) {
                        if (shareErr && shareErr.name === 'AbortError') {
                            return; // User cancelled share sheet intentionally
                        }
                        console.warn("Native file share fallback:", shareErr);
                    }
                }

                // Fallback to WhatsApp URL if desktop or native share not completed
                if (!nativeShared) {
                    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(tmpl)}`;
                    window.open(waUrl, '_blank', 'noopener,noreferrer');
                }
            } catch (err) {
                console.error("Promo share error:", err);
            }
        },

        // Universal Share Interceptor: Call this whenever user shares via any on-page WhatsApp trigger
        recordShareAction: function () {
            try {
                const promo = this.activePromotion || { id: 'utsav' };
                const user = this.getUserInfo();
                const shareKey = `AOI_SHARE_CHALLENGE_${promo.id || 'utsav'}_${user.phone || 'guest'}`;
                const totalGoal = 10;
                let currentShares = parseInt(localStorage.getItem(shareKey) || '0', 10);

                if (currentShares < totalGoal) {
                    currentShares += 1;
                    localStorage.setItem(shareKey, String(currentShares));
                    this.playChimeSound();

                    if (currentShares >= totalGoal) {
                        try {
                            if (window.AarogyamWallet && typeof window.AarogyamWallet.creditPoints === 'function') {
                                window.AarogyamWallet.creditPoints(10, '🎯 10 शेयर लक्ष्य पूर्ण रिवॉर्ड', 'earn_share_goal');
                            }
                        } catch (e) { }

                        // Direct storage credit to guarantee 100% persistence
                        try {
                            const vaultKey = 'AOI_WALLET_VAULT_V1';
                            let vault = JSON.parse(localStorage.getItem(vaultKey) || 'null');
                            if (!vault) {
                                vault = {
                                    balance: 0,
                                    total_earned: 0,
                                    total_spent: 0,
                                    earned_self: 0,
                                    earned_referral: 0,
                                    ledger: [],
                                    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                                };
                            }
                            vault.balance = (vault.balance || 0) + 10;
                            vault.total_earned = (vault.total_earned || 0) + 10;
                            vault.earned_self = (vault.earned_self || 0) + 10;
                            vault.ledger = vault.ledger || [];
                            vault.ledger.unshift({
                                id: 'earn_' + Date.now(),
                                type: 'earn_share_goal',
                                title: '🎯 10 शेयर लक्ष्य पूर्ण रिवॉर्ड',
                                points: 10,
                                timestamp: new Date().toISOString(),
                                expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                                status: 'credited'
                            });
                            localStorage.setItem(vaultKey, JSON.stringify(vault));
                            localStorage.setItem('AOI_WALLET_BALANCE', String(vault.balance));
                        } catch (e) { }

                        this.showToast('🎉 बधाई! आपने 10 शेयर पूरे कर लिए! <strong>10 पॉइंट्स</strong> आपके वॉलेट में क्रेडिट हो गए! 🪙');
                        const remBadge = document.getElementById('agyPromoRemBadge');
                        if (remBadge) remBadge.textContent = '10 पूर्ण!';
                        const progBar = document.getElementById('agyPromoProgBar');
                        if (progBar) progBar.style.width = '100%';
                    } else {
                        const remaining = totalGoal - currentShares;
                        this.showToast(`👏 1 शेयर हुआ! अब केवल <strong>${remaining} शेयर बाकी</strong> हैं! 🎯`);
                        const remBadge = document.getElementById('agyPromoRemBadge');
                        if (remBadge) remBadge.textContent = `${remaining} बाकी`;
                        const progBar = document.getElementById('agyPromoProgBar');
                        if (progBar) progBar.style.width = `${(currentShares / totalGoal) * 100}%`;
                    }
                }
            } catch (e) {}
        },

        // Helper: Convert any promo image (webp/png/jpg) to 100% compliant JPEG file for WhatsApp
        loadImageAsJpegFile: function (url, filename) {
            return new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width || 800;
                        canvas.height = img.naturalHeight || img.height || 600;
                        const ctx = canvas.getContext('2d');
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob((blob) => {
                            if (blob) {
                                resolve(new File([blob], `${filename}.jpg`, { type: 'image/jpeg' }));
                            } else {
                                this.fetchBlobFallback(url, filename).then(resolve);
                            }
                        }, 'image/jpeg', 0.92);
                    } catch (e) {
                        this.fetchBlobFallback(url, filename).then(resolve);
                    }
                };
                img.onerror = () => {
                    this.fetchBlobFallback(url, filename).then(resolve);
                };
                img.src = url;
            });
        },

        fetchBlobFallback: async function (url, filename) {
            try {
                const r = await fetch(url).catch(() => null);
                if (r && r.ok) {
                    const b = await r.blob();
                    const ext = b.type.includes('png') ? 'png' : 'jpg';
                    const mime = b.type.includes('png') ? 'image/png' : 'image/jpeg';
                    return new File([b], `${filename}.${ext}`, { type: mime });
                }
            } catch (_) { }
            return null;
        },

        // 6. Particle Canvas System (High Performance Micro-Engine)
        startParticleEngine: function (canvas, preset) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;

            const onResize = () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            };
            window.addEventListener('resize', onResize, { passive: true });

            // Color palettes based on preset
            let colors = ['#F59E0B', '#D97706', '#FBBF24', '#FEF3C7', '#EF4444']; // Golden Diya (default)

            if (preset === 'tricolor_patriotic') {
                colors = ['#FF9933', '#FFFFFF', '#138808', '#000080', '#FFA726', '#66BB6A']; // Tiranga
            } else if (preset === 'holi_gulal_petals') {
                colors = ['#EC4899', '#F97316', '#A855F7', '#10B981', '#F43F5E', '#3B82F6']; // Holi Gulal
            } else if (preset === 'neon_tube_flow') {
                colors = ['#06B6D4', '#EF4444', '#3B82F6', '#8B5CF6', '#F43F5E']; // Neon Tube
            } else if (preset === 'achiever_confetti') {
                colors = ['#E11D48', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']; // Confetti
            }

            const particleCount = Math.min(width < 600 ? 32 : 55, 60);
            const particles = [];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height - height,
                    size: Math.random() * 6 + 3,
                    speedY: Math.random() * 1.8 + 0.8,
                    speedX: (Math.random() - 0.5) * 1.2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rot: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 4,
                    shape: preset === 'achiever_confetti' ? 'ribbon' : (preset === 'holi_gulal_petals' ? 'petal' : 'sparkle'),
                    alpha: Math.random() * 0.7 + 0.3
                });
            }

            let running = true;
            const startTime = Date.now();

            const render = () => {
                if (!running) return;

                // Auto stop after 30 seconds to conserve device battery
                if (Date.now() - startTime > 30000) {
                    ctx.clearRect(0, 0, width, height);
                    return;
                }

                ctx.clearRect(0, 0, width, height);

                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.y += p.speedY;
                    p.x += p.speedX;
                    p.rot += p.rotSpeed;

                    if (p.y > height + 20) {
                        p.y = -20;
                        p.x = Math.random() * width;
                    }

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rot * Math.PI) / 180);
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;

                    if (p.shape === 'ribbon') {
                        ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size / 2);
                    } else if (p.shape === 'petal') {
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Four-pointed sparkle
                        ctx.beginPath();
                        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                }

                window.AarogyamPromotionGateway.canvasAnimFrame = requestAnimationFrame(render);
            };

            this.canvasAnimFrame = requestAnimationFrame(render);

            return () => {
                running = false;
                window.removeEventListener('resize', onResize);
                if (window.AarogyamPromotionGateway.canvasAnimFrame) {
                    cancelAnimationFrame(window.AarogyamPromotionGateway.canvasAnimFrame);
                }
            };
        },

        // 7. Inject & Render Floating Modal
        renderPromotion: function (promo) {
            this.activePromo = promo;
            const user = this.getUserInfo();

            // Check if user came from a personal WhatsApp share link (?from=...&ref=...)
            const urlParams = new URLSearchParams(window.location.search);
            const fromSender = urlParams.get('from');
            const urlRef = urlParams.get('ref') || urlParams.get('share_id');
            if (urlRef) {
                try {
                    localStorage.setItem('AOI_REFERRER_ID', urlRef.trim());
                    localStorage.setItem('user_referral_code', urlRef.trim());
                } catch (e) { }
            }

            const decodedSender = fromSender ? decodeURIComponent(fromSender).trim() : '';
            const isGiftRecipient = Boolean(decodedSender);

            // Hide minimised widget if open
            const minGift = document.getElementById('agy-floating-gift-box');
            if (minGift) minGift.style.display = 'none';

            // Clean up any existing modal instance
            const prev = document.getElementById('agy-promo-root');
            if (prev) prev.remove();

            // Personalize greeting
            const greetingName = user.name && user.name !== 'प्रिय पाठक' ? user.name : 'स्वास्थ्य साधक';

            // 🎯 10-Share Challenge & Wallet State Calculation (Persists across campaign duration)
            const shareKey = `AOI_SHARE_CHALLENGE_${promo.id || 'utsav'}_${user.phone || 'guest'}`;
            const guestKey = `AOI_SHARE_CHALLENGE_${promo.id || 'utsav'}_guest`;
            const totalGoal = 10;
            let currentShares = parseInt(localStorage.getItem(shareKey) || '0', 10);
            if (user.phone && currentShares === 0) {
                const guestShares = parseInt(localStorage.getItem(guestKey) || '0', 10);
                if (guestShares > 0) {
                    currentShares = guestShares;
                    try { localStorage.setItem(shareKey, String(guestShares)); } catch (e) { }
                }
            }
            const remainingShares = Math.max(0, totalGoal - currentShares);
            const isChallengeDone = currentShares >= totalGoal;
            const currentWalletBal = (window.AarogyamWallet && typeof window.AarogyamWallet.getBalance === 'function') ? window.AarogyamWallet.getBalance() : 0;

            // Aura color style based on preset
            let auraGradient = 'radial-gradient(circle, rgba(245,158,11,0.55) 0%, rgba(220,38,38,0.2) 60%, rgba(0,0,0,0) 80%)';
            if (promo.animation_preset === 'tricolor_patriotic') {
                auraGradient = 'radial-gradient(circle, rgba(255,153,51,0.5) 0%, rgba(255,255,255,0.3) 40%, rgba(19,136,8,0.4) 70%, rgba(0,0,0,0) 90%)';
            } else if (promo.animation_preset === 'holi_gulal_petals') {
                auraGradient = 'radial-gradient(circle, rgba(236,72,153,0.55) 0%, rgba(168,85,247,0.35) 50%, rgba(0,0,0,0) 80%)';
            } else if (promo.animation_preset === 'neon_tube_flow') {
                auraGradient = 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, rgba(239,68,68,0.4) 50%, rgba(0,0,0,0) 80%)';
            }

            const root = document.createElement('div');
            root.id = 'agy-promo-root';
            root.innerHTML = `
                <style>
                    #agy-promo-root {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100vw;
                        height: 100vh;
                        z-index: 999999;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(6, 10, 20, 0.82);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        opacity: 0;
                        transition: opacity 0.35s ease;
                        padding: 16px;
                        box-sizing: border-box;
                        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
                    }
                    #agy-promo-root.active {
                        opacity: 1;
                    }
                    #agy-promo-canvas {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 1;
                    }
                    .agy-promo-card-wrapper {
                        position: relative;
                        z-index: 2;
                        max-width: 520px;
                        width: 100%;
                        text-align: center;
                        transform: scale(0.92) translateY(12px);
                        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    #agy-promo-root.active .agy-promo-card-wrapper {
                        transform: scale(1) translateY(0);
                    }
                    /* Smooth Shrink & Fly to Bottom-Left Corner on Close (Minimize Compression) */
                    .agy-promo-card-wrapper.compressing-to-gift {
                        transition: transform 0.44s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease !important;
                        transform: translate(-38vw, 36vh) scale(0.06) !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                    @media (max-width: 768px) {
                        .agy-promo-card-wrapper.compressing-to-gift {
                            transform: translate(-34vw, 32vh) scale(0.05) !important;
                        }
                    }
                    #agy-promo-root.fading-out {
                        opacity: 0 !important;
                        transition: opacity 0.42s ease !important;
                    }
                    /* 3D Prominent Center Floating Image Stage (Half-Screen Prominent View) */
                    .agy-promo-floating-stage {
                        position: relative;
                        width: 100%;
                        margin: 0 auto -18px auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 3;
                    }
                    .agy-promo-aura-halo {
                        position: absolute;
                        width: 95%;
                        height: 220px;
                        border-radius: 50%;
                        background: ${auraGradient};
                        animation: agyAuraPulse 3.5s ease-in-out infinite alternate;
                        pointer-events: none;
                        filter: blur(16px);
                    }
                    .agy-promo-float-img {
                        position: relative;
                        width: 95%;
                        max-width: 480px;
                        max-height: 46vh;
                        height: auto;
                        object-fit: contain;
                        filter: drop-shadow(0 16px 36px rgba(0,0,0,0.75));
                        animation: agyLevitate 4.5s ease-in-out infinite alternate;
                        border-radius: 20px;
                    }
                    @media (max-width: 600px) {
                        .agy-promo-float-img {
                            max-height: 38vh !important;
                            max-width: 95vw;
                            border-radius: 16px;
                        }
                    }
                    @keyframes agyLevitate {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-7px) rotate(0.6deg); }
                        100% { transform: translateY(2px) rotate(-0.6deg); }
                    }
                    @keyframes agyAuraPulse {
                        0% { opacity: 0.55; transform: scale(0.92); }
                        50% { opacity: 0.95; transform: scale(1.08); }
                        100% { opacity: 0.6; transform: scale(0.95); }
                    }
                    /* Transparent Container - STRICT ZERO CHOUKOR/DARK BOX */
                    .agy-promo-card {
                        background: transparent !important;
                        background-color: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        color: #ffffff;
                        position: relative;
                    }
                    /* Sleek Floating Text Strip - Hugs text tightly, transparent glass, NOT a square box! */
                    .agy-promo-text-patti {
                        display: inline-block;
                        width: auto;
                        max-width: 94%;
                        margin: 4px auto 14px auto;
                        padding: 10px 20px;
                        background: rgba(0, 0, 0, 0.42);
                        backdrop-filter: blur(10px);
                        -webkit-backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.16);
                        border-radius: 20px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
                        animation: agyPattiPulse 4s ease-in-out infinite alternate;
                    }
                    @keyframes agyPattiPulse {
                        0% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(245, 158, 11, 0.15); }
                        100% { box-shadow: 0 6px 28px rgba(0, 0, 0, 0.55), 0 0 26px rgba(245, 158, 11, 0.35); }
                    }
                    .agy-promo-badge {
                        display: inline-block;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 0.78rem;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                        background: linear-gradient(135deg, #d97706, #f59e0b);
                        color: #ffffff;
                        margin-bottom: 8px;
                        box-shadow: 0 2px 10px rgba(245, 158, 11, 0.45);
                    }
                    .agy-promo-greeting {
                        font-size: 0.94rem;
                        color: #cbd5e1;
                        margin-bottom: 4px;
                        text-shadow: 0 2px 6px rgba(0,0,0,0.8);
                    }
                    .agy-promo-greeting strong {
                        color: #fef08a;
                        font-weight: 800;
                    }
                    .agy-promo-title {
                        font-size: 1.3rem;
                        font-weight: 800;
                        line-height: 1.35;
                        margin: 0 0 6px 0;
                        color: #ffffff;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.9);
                    }
                    .agy-promo-subtitle {
                        font-size: 0.88rem;
                        line-height: 1.5;
                        color: #e2e8f0;
                        margin: 0;
                        text-shadow: 0 2px 8px rgba(0,0,0,0.85);
                    }
                    /* Action Buttons: Responsive 1-Line Fit (Small Gift + Long WhatsApp) */
                    .agy-promo-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                        width: 96%;
                        max-width: 440px;
                        margin: 0 auto;
                        box-sizing: border-box;
                    }
                    .agy-promo-buttons-row {
                        display: flex;
                        flex-direction: row;
                        align-items: stretch;
                        gap: 8px;
                        width: 100%;
                    }
                    /* Box 1: Small Gift Button (Orange / Golden) */
                    .agy-promo-cta-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 5px;
                        flex: 0.85;
                        min-width: 85px;
                        background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
                        color: #ffffff;
                        font-size: 0.88rem;
                        font-weight: 800;
                        padding: 10px 8px;
                        min-height: 46px;
                        border-radius: 13px;
                        text-decoration: none;
                        transition: transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 4px 16px rgba(234, 88, 12, 0.55);
                        border: 1px solid rgba(255, 255, 255, 0.25);
                        cursor: pointer;
                        box-sizing: border-box;
                        white-space: nowrap;
                    }
                    .agy-promo-cta-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 22px rgba(234, 88, 12, 0.75);
                    }
                    .agy-promo-cta-btn.agy-locked {
                        background: linear-gradient(135deg, #78350f 0%, #9a3412 50%, #7c2d12 100%);
                        opacity: 0.95;
                        border: 1px solid rgba(254, 240, 138, 0.35);
                    }
                    /* Box 2: Long WhatsApp Button (Green, Wide, Prominent) */
                    .agy-promo-share-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        flex: 2;
                        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                        color: #ffffff;
                        font-size: 0.82rem;
                        font-weight: 900;
                        padding: 8px 10px;
                        min-height: 46px;
                        border-radius: 13px;
                        cursor: pointer;
                        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                        border: 1.5px solid rgba(255, 255, 255, 0.35);
                        box-shadow: 0 4px 18px rgba(22, 163, 74, 0.55);
                        box-sizing: border-box;
                        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                        letter-spacing: 0.1px;
                        line-height: 1.25;
                        text-align: center;
                    }
                    .agy-promo-share-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 24px rgba(22, 163, 74, 0.75);
                    }
                    /* Close Cross Button - Safely Positioned to Avoid Edge Clipping */
                    .agy-promo-close-btn {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: rgba(15, 23, 42, 0.85);
                        border: 1.5px solid rgba(255, 255, 255, 0.45);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 1.1rem;
                        font-weight: 700;
                        transition: background 0.2s, transform 0.2s;
                        z-index: 60;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
                    }
                    .agy-promo-close-btn:hover {
                        background: rgba(239, 68, 68, 0.9);
                        transform: scale(1.1);
                    }
                </style>

                <canvas id="agy-promo-canvas"></canvas>

                <div class="agy-promo-card-wrapper">
                    <!-- Top Floating Close Button -->
                    <button class="agy-promo-close-btn" id="agyPromoCloseBtn" title="बंद करें (Close)" aria-label="Close">✕</button>

                    <!-- 3D Center Floating Image Stage -->
                    <div class="agy-promo-floating-stage">
                        <div class="agy-promo-aura-halo"></div>
                        <img src="${promo.image_url || '/images/logo/logo.png'}" alt="Festival Promotion" class="agy-promo-float-img" onerror="if(this.src && !this.src.includes('/images/logo/logo.png'))this.src='/images/logo/logo.png';" />
                    </div>

                    <!-- Inner Transparent Container (No Black Box!) -->
                    <div class="agy-promo-card">
                        <!-- Sleek Text Patti -->
                        <div class="agy-promo-text-patti">
                            <span class="agy-promo-badge">${isGiftRecipient ? '🎁 सप्रेम उत्सव उपहार' : (promo.badge || '✨ विशेष उत्सव')}</span>

                            <div class="agy-promo-greeting">
                                ${isGiftRecipient ? `
                                    ✨ <strong style="color:#fde047;font-size:1.02rem;">${decodedSender} जी</strong> की तरफ से सप्रेम बधाई और उपहार!
                                ` : `
                                    प्रिय <strong>${greetingName}</strong> जी,
                                `}
                            </div>

                            <h3 class="agy-promo-title">${promo.title}</h3>
                            <p class="agy-promo-subtitle">${promo.subtitle}</p>
                        </div>

                        <!-- Progress Bar & Responsive 1-Line Dual Buttons -->
                        <div class="agy-promo-actions">
                            ${promo.share_enabled ? `
                                <div id="agyPromoChallengeWrap" style="background:rgba(0,0,0,0.45); border:1px solid rgba(254,240,138,0.3); border-radius:12px; padding:6px 12px; margin-bottom:2px; text-align:center; width:100%; box-sizing:border-box;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; font-size:0.75rem; font-weight:800; color:#fef08a;">
                                        <span>🎯 10 शेयर लक्ष्य: दोस्तों को भेजें</span>
                                        <span id="agyPromoRemBadge" style="background:#eab308; color:#000; padding:1px 7px; border-radius:10px; font-weight:900; font-size:0.70rem;">${isChallengeDone ? 'पूर्ण' : `${remainingShares} बाकी`}</span>
                                    </div>
                                    <div style="background:rgba(255,255,255,0.12); border-radius:10px; height:6px; overflow:hidden; margin-bottom:3px;">
                                        <div id="agyPromoProgBar" style="background:linear-gradient(90deg,#22c55e,#10b981); height:100%; width:${(currentShares / totalGoal) * 100}%; transition:width 0.4s ease;"></div>
                                    </div>
                                    <div id="agyPromoProgSubtext" style="font-size:0.68rem; color:#cbd5e1;">
                                        ${isChallengeDone ? '🎉 10 शेयर पूरे! आपका उपहार अनलॉक हो गया है।' : '(10 पूरे होने पर उपहार अनलॉक • बीच में रोकने पर कोई पॉइंट नहीं)'}
                                    </div>
                                </div>
                            ` : ''}

                            <!-- 1 Single Line for Both Buttons (Small Gift + Long WhatsApp) -->
                            <div class="agy-promo-buttons-row">
                                <!-- Small Gift Button (Left) -->
                                ${(isGiftRecipient && !user.isRegistered) ? `
                                    <button type="button" class="agy-promo-cta-btn" id="agyPromoClaimBtn" title="उपहार प्राप्त करें">
                                        <span>🎁 उपहार</span>
                                    </button>
                                ` : (isChallengeDone ? `
                                    <a href="/ebooks/share-rewards.html#passbook" class="agy-promo-cta-btn aoi-open-passbook" id="agyPromoGiftBtn" title="उपहार खोलें">
                                        <span>🎁 उपहार</span>
                                    </a>
                                ` : `
                                    <button type="button" class="agy-promo-cta-btn agy-locked" id="agyPromoGiftLockedBtn" title="10 शेयर पूरे होने पर खुलेगा">
                                        <span>🔒 उपहार</span>
                                    </button>
                                `)}

                                <!-- Long WhatsApp Button (Right) -->
                                ${promo.share_enabled ? `
                                    <button type="button" class="agy-promo-share-btn" id="agyPromoShareBtn">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.058-1.745-.392-1.378-.561-2.261-1.95-2.33-2.04-.069-.092-.556-.739-.556-1.409 0-.671.352-1.002.477-1.139.124-.138.272-.172.363-.172.091 0 .182.002.261.006.084.004.196-.032.307.234.114.272.389.948.423 1.017.034.069.057.15.011.24-.045.09-.068.147-.136.225-.068.079-.144.175-.205.235-.069.068-.141.141-.06.28.081.139.362.597.777.967.535.477.986.624 1.125.694.14.069.222.059.304-.035.083-.095.352-.41.446-.55.093-.14.188-.117.315-.07.128.046.81.382.949.452.14.069.233.104.267.162.034.059.034.343-.11.748z"/>
                                        </svg>
                                        <span id="agyPromoShareBtnText">दोस्तों रिश्तेदारों को अपने नाम से भेजें</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(root);

            // Animate in
            requestAnimationFrame(() => {
                root.classList.add('active');
            });

            // Start Particle Engine
            const canvas = document.getElementById('agy-promo-canvas');
            const stopParticles = this.startParticleEngine(canvas, promo.animation_preset);

            // Dismiss function (Compresses and flies down into Floating Gift Box)
            const dismiss = () => {
                const card = root.querySelector('.agy-promo-card-wrapper');
                if (card) {
                    card.classList.add('compressing-to-gift');
                }
                root.classList.add('fading-out');
                this.markDismissed(promo.id);
                stopParticles();
                setTimeout(() => {
                    root.remove();
                    this.renderMinimisedFloatingGift(promo, true);
                }, 440);
            };

            // Event Listeners
            const closeBtn = document.getElementById('agyPromoCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dismiss();
                });
            }

            // Click or Touch anywhere outside card dismisses and minimizes
            root.addEventListener('click', (e) => {
                const cardWrapper = root.querySelector('.agy-promo-card-wrapper');
                if (cardWrapper && !cardWrapper.contains(e.target)) {
                    dismiss();
                }
            });
            root.addEventListener('touchend', (e) => {
                const cardWrapper = root.querySelector('.agy-promo-card-wrapper');
                if (cardWrapper && !cardWrapper.contains(e.target)) {
                    dismiss();
                }
            }, { passive: true });

            // ESC key dismisses
            const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                    dismiss();
                    window.removeEventListener('keydown', onKeyDown);
                }
            };
            window.addEventListener('keydown', onKeyDown);

            // Locked Gift Button click - shows guidance toast
            const giftLockedBtn = document.getElementById('agyPromoGiftLockedBtn');
            if (giftLockedBtn) {
                giftLockedBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const rem = Math.max(0, totalGoal - parseInt(localStorage.getItem(shareKey) || '0', 10));
                    this.showToast(`🎯 पहले 10 साथियों को शेयर करें! (अभी <strong>${rem} शेयर बाकी</strong> हैं) इसके बाद उपहार खुलेगा! 🎁`);
                });
            }

            // Unlocked Gift Button click - records dismissal so user can explore
            const giftBtn = document.getElementById('agyPromoGiftBtn');
            if (giftBtn) {
                giftBtn.addEventListener('click', () => {
                    this.markDismissed(promo.id);
                });
            }

            // Claim Gift Button (For Unregistered Recipient)
            const claimBtn = document.getElementById('agyPromoClaimBtn');
            if (claimBtn) {
                claimBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.promptRegistrationForShare((newUser) => {
                        this.playChimeSound();
                        try {
                            if (window.AarogyamWallet) {
                                // ⚠️ CRITICAL: Clear stale wallet vault so welcome bonus goes to NEW user, not previous one
                                localStorage.removeItem('AOI_WALLET_VAULT_V1');
                                localStorage.removeItem('AOI_WALLET_BALANCE');
                                // Re-initialize wallet for the newly registered user
                                window.AarogyamWallet.state = null;
                                window.AarogyamWallet.init();
                                if (typeof window.AarogyamWallet.creditPoints === 'function') {
                                    window.AarogyamWallet.creditPoints(5, '🎁 स्वागत उपहार (5 पॉइंट्स)', 'welcome_bonus');
                                }
                            }
                        } catch (e) { }
                        this.showToast('🎉 बधाई! <strong>5 पॉइंट्स</strong> आपके वॉलेट में क्रेडिट हो गए हैं! 🪙');
                        // Re-render modal to show registered view
                        this.renderPromotion(promo);
                    });
                });
            }

            // Share Button
            const shareBtn = document.getElementById('agyPromoShareBtn');
            if (shareBtn) {
                shareBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleShare(promo);
                });
            }

            // CTA Button click also records dismissal
            const ctaBtn = document.getElementById('agyPromoCtaBtn');
            if (ctaBtn) {
                ctaBtn.addEventListener('click', () => {
                    this.markDismissed(promo.id);
                });
            }
        },

        // 8. Minimised Floating Gift Box Widget (Bottom-Left)
        renderMinimisedFloatingGift: function (promo, isPoppingIn = false) {
            // Strict Rule: Time khatm hone ke baad (after end_date) gift box bilkul nahi aana chahiye!
            if (!this.isPromoTimeActive(promo)) {
                const old = document.getElementById('agy-floating-gift-box');
                if (old) old.remove();
                return;
            }

            // Safety check: Do not show on book landing pages
            if (this.isBookLandingPage()) return;

            const existing = document.getElementById('agy-floating-gift-box');
            if (existing) {
                existing.style.display = 'flex';
                if (isPoppingIn) {
                    existing.classList.remove('agy-pop-entrance');
                    void existing.offsetWidth; // force reflow
                    existing.classList.add('agy-pop-entrance');
                    this.playChimeSound();
                }
                return;
            }

            if (isPoppingIn) {
                this.playChimeSound();
            }

            const box = document.createElement('div');
            box.id = 'agy-floating-gift-box';
            if (isPoppingIn) {
                box.className = 'agy-pop-entrance';
            }
            box.innerHTML = `
                <style>
                    #agy-floating-gift-box {
                        position: fixed;
                        bottom: 148px;
                        left: 16px;
                        z-index: 99998;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 8px 14px 8px 10px;
                        background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                        border: 1.5px solid rgba(255, 255, 255, 0.4);
                        border-radius: 50px;
                        color: #ffffff;
                        cursor: pointer;
                        box-shadow: 0 6px 24px rgba(234, 88, 12, 0.55), 0 0 12px rgba(245, 158, 11, 0.35);
                        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s;
                        animation: agyGiftFloat 3.6s ease-in-out infinite alternate;
                        font-family: system-ui, -apple-system, sans-serif;
                        user-select: none;
                    }
                    @media (max-width: 768px) {
                        #agy-floating-gift-box {
                            bottom: 182px !important;
                            left: 12px !important;
                            padding: 6px 12px 6px 8px !important;
                        }
                    }
                    #agy-floating-gift-box.agy-pop-entrance {
                        animation: agyGiftPopIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, agyGiftFloat 3.6s ease-in-out 0.45s infinite alternate !important;
                    }
                    @keyframes agyGiftPopIn {
                        0% { transform: scale(0.2) translateY(24px); opacity: 0; }
                        60% { transform: scale(1.18) translateY(-4px); opacity: 1; }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                    #agy-floating-gift-box:hover {
                        transform: scale(1.08) translateY(-3px);
                        box-shadow: 0 10px 30px rgba(234, 88, 12, 0.75);
                    }
                    .agy-floating-gift-pulse {
                        position: absolute;
                        inset: -5px;
                        border-radius: 50px;
                        border: 2px solid rgba(245, 158, 11, 0.75);
                        animation: agyGiftPulseRing 2s ease-out infinite;
                        pointer-events: none;
                    }
                    .agy-floating-gift-icon {
                        font-size: 1.5rem;
                        filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
                        animation: agyGiftWiggle 2.5s ease-in-out infinite;
                    }
                    .agy-floating-gift-text {
                        display: flex;
                        flex-direction: column;
                        line-height: 1.15;
                        text-align: left;
                    }
                    .agy-fgt-main {
                        font-size: 0.82rem;
                        font-weight: 900;
                        color: #ffffff;
                        letter-spacing: 0.3px;
                    }
                    .agy-fgt-sub {
                        font-size: 0.68rem;
                        color: #fef08a;
                        font-weight: 700;
                    }
                    @keyframes agyGiftFloat {
                        0% { transform: translateY(0px); }
                        100% { transform: translateY(-7px); }
                    }
                    @keyframes agyGiftWiggle {
                        0%, 100% { transform: rotate(0deg); }
                        20% { transform: rotate(-12deg) scale(1.1); }
                        40% { transform: rotate(12deg) scale(1.1); }
                        60% { transform: rotate(-6deg); }
                        80% { transform: rotate(6deg); }
                    }
                    @keyframes agyGiftPulseRing {
                        0% { transform: scale(0.95); opacity: 1; }
                        100% { transform: scale(1.22); opacity: 0; }
                    }
                </style>
                <div class="agy-floating-gift-pulse"></div>
                <div class="agy-floating-gift-icon">🎁</div>
                <div class="agy-floating-gift-text">
                    <span class="agy-fgt-main">उत्सव उपहार</span>
                    <span class="agy-fgt-sub">पॉइंट्स कमाएँ</span>
                </div>
            `;

            box.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                box.style.display = 'none';
                this.renderPromotion(promo);
            });

            document.body.appendChild(box);
        },

        // 9. Bootstrap Engine
        init: async function () {
            if (this.initialized) return;
            this.initialized = true;

            try {
                // Fetch dynamic promotions JSON (15s cache buster)
                const cacheBust = Math.floor(Date.now() / 15000);
                const resp = await fetch('/data/universal-promotions.json?v=' + cacheBust);
                if (!resp.ok) return;

                const data = await resp.json();
                if (!data || !Array.isArray(data.promotions)) return;

                const now = new Date().getTime();

                // Find first eligible active promotion
                const eligible = data.promotions.find(p => {
                    if (!p.is_active) return false;

                    // Date range checks
                    if (p.start_date) {
                        const start = new Date(p.start_date).getTime();
                        if (now < start) return false;
                    }
                    if (p.end_date) {
                        const end = new Date(p.end_date).getTime();
                        if (now > end) return false;
                    }

                    // Page targeting
                    if (!this.shouldDisplayOnPage(p.target_pages)) return false;

                    return true;
                });

                if (eligible) {
                    const canShowToday = this.shouldShowFullPopupToday(eligible.id);
                    const isMinimized = this.isMinimizedOnPage(eligible.id);

                    if (canShowToday && !isMinimized) {
                        // 1st visit today: show full popup & register daily impression
                        this.markFullPopupShownToday(eligible.id);
                        setTimeout(() => {
                            this.renderPromotion(eligible);
                        }, 300);
                    } else {
                        // Already shown today or closed: keep screen clean with gentle bottom-left gift box
                        setTimeout(() => {
                            this.renderMinimisedFloatingGift(eligible, false);
                        }, 300);
                    }
                } else {
                    // Time khatm hone ke baad: Na popup rahega, na gift box bachega
                    const oldBox = document.getElementById('agy-floating-gift-box');
                    if (oldBox) oldBox.remove();
                    const oldPopup = document.getElementById('agy-promotion-overlay');
                    if (oldPopup) oldPopup.remove();
                }
            } catch (err) {
                console.warn("Promotions gateway note:", err);
            }
        }
    };

    // Auto initialize once DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.AarogyamPromotionGateway.init();
        });
    } else {
        window.AarogyamPromotionGateway.init();
    }
})();
