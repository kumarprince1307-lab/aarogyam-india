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
        shouldDisplayOnPage: function (targetPages) {
            try {
                const path = (window.location.pathname || '').toLowerCase();
                const search = (window.location.search || '').toLowerCase();

                // STRICT AAROGYAM MANAS RULE: Never display on Book Landing Pages, Reader, Admin, or Checkout!
                if (path.includes('book-landing') || search.includes('id=bk') || path.includes('/ebooks/book-landing') || path.includes('reader')) {
                    return false;
                }
                if (path.includes('/admin') || path.endsWith('admin.html')) return false;
                if (path.includes('payment-') || path.includes('checkout-success') || path.includes('order-confirmation')) return false;

                if (!Array.isArray(targetPages) || targetPages.length === 0 || targetPages.includes('all')) {
                    return true;
                }

                // Check specific targets
                const isHome = (path === '/' || path.endsWith('index.html') || path === '');
                const isLibrary = path.includes('my-library') || path.includes('library.html');
                const isTube = path.includes('tube.html');

                if (targetPages.includes('home') && isHome) return true;
                if (targetPages.includes('library') && isLibrary) return true;
                if (targetPages.includes('tube') && isTube) return true;

                return false;
            } catch (e) {
                return false;
            }
        },

        // 2. Frequency & Session Capping
        isDismissedRecently: function (promo, globalUpdatedAt) {
            try {
                // If preview or test query parameter is present, bypass dismissal
                const search = (window.location.search || '').toLowerCase();
                if (search.includes('promo=') || search.includes('test_promo') || search.includes('preview')) {
                    return false;
                }

                const key = 'AI_PROM_DISMISSED_' + promo.id;
                const dismissedAt = parseInt(localStorage.getItem(key) || '0', 10);
                if (!dismissedAt) return false;

                // If promo or catalog was updated AFTER user dismissed it, RESET DISMISSAL so they see the fresh update!
                const promoUpdated = promo.updated_at ? new Date(promo.updated_at).getTime() : 0;
                const globalUpdated = globalUpdatedAt ? new Date(globalUpdatedAt).getTime() : 0;
                const latestUpdate = Math.max(promoUpdated, globalUpdated);

                if (latestUpdate > dismissedAt) {
                    localStorage.removeItem(key);
                    sessionStorage.removeItem(key);
                    return false;
                }

                const elapsedMs = Date.now() - dismissedAt;

                if (promo.frequency_mode === 'once_per_session') {
                    return Boolean(sessionStorage.getItem(key));
                }

                // Default: once per day (24 hours)
                return elapsedMs < (24 * 60 * 60 * 1000);
            } catch (e) {
                return false;
            }
        },

        markDismissed: function (promoId) {
            try {
                const key = 'AI_PROM_DISMISSED_' + promoId;
                localStorage.setItem(key, String(Date.now()));
                sessionStorage.setItem(key, '1');
            } catch (e) {}
        },

        // 3. User Identity & Constitutional Profile Check
        getUserInfo: function () {
            let fullName = 'प्रिय पाठक';
            let shareId = null;
            let isRegistered = false;

            try {
                // Check all Aarogyam identity caches
                const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('UCAS_USER') || localStorage.getItem('AI_PROFILE') || '{}');
                if (u && (u.id || u.mobile)) {
                    isRegistered = true;
                    fullName = u.full_name || u.name || fullName;
                    shareId = u.share_id || u.referral_code || null;
                }

                if (!shareId) {
                    shareId = localStorage.getItem('user_share_id') || localStorage.getItem('user_referral_code') || null;
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
            } catch (e) {}

            return {
                name: fullName,
                shareId: shareId,
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
            } catch (e) {}
        },

        // 3.6 Floating Toast Notification
        showToast: function (msg, bg = '#10b981') {
            const old = document.getElementById('agy-promo-toast');
            if (old) old.remove();
            const toast = document.createElement('div');
            toast.id = 'agy-promo-toast';
            toast.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:12px 24px;border-radius:30px;font-size:0.92rem;font-weight:800;z-index:9999999;box-shadow:0 8px 30px rgba(0,0,0,0.5);display:flex;align-items:center;gap:8px;font-family:system-ui,sans-serif;pointer-events:none;animation:agyToastPop 0.3s ease;`;
            toast.innerHTML = msg;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.transition = 'opacity 0.4s, transform 0.4s';
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(12px)';
                setTimeout(() => toast.remove(), 400);
            }, 3200);
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

        // 5. Handle WhatsApp Share (Awards +1 Point & Plays Chime Sound)
        handleShare: function (promo) {
            const user = this.getUserInfo();

            if (!user.isRegistered || !user.shareId) {
                this.promptRegistrationForShare((newUser) => {
                    // Re-trigger share with new registered profile!
                    this.handleShare(promo);
                });
                return;
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

_(नोट: यह 5 पॉइंट्स उपहार केवल नए सदस्यों के लिए मान्य है)_`;

                tmpl = tmpl.replace(/{sender_name}/g, user.name);
                tmpl = tmpl.replace(/{user_name}/g, user.name);
                tmpl = tmpl.replace(/{festival_title}/g, promo.title || 'उत्सव');
                tmpl = tmpl.replace(/{link}/g, verifiedShareUrl);

                // Play Audio Chime
                this.playChimeSound();

                // Credit +1 Share Point to User Wallet (No Capping as requested)
                try {
                    if (window.AarogyamWallet && typeof window.AarogyamWallet.creditPoints === 'function') {
                        window.AarogyamWallet.creditPoints(1, `🪔 ${promo.title || 'उत्सव'} शुभकामना शेयर`, 'earn_share');
                    }
                } catch (e) {}

                // Show celebratory toast
                this.showToast('🎉 <strong>+1 पॉइंट</strong> आपके वॉलेट में जुड़ा! 🪙');

                // Open WhatsApp
                const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(tmpl)}`;
                window.open(waUrl, '_blank', 'noopener,noreferrer');
            } catch (err) {
                console.error("Promo share error:", err);
            }
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
                } catch (e) {}
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
                        max-width: 460px;
                        width: 100%;
                        text-align: center;
                        transform: scale(0.92) translateY(12px);
                        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    #agy-promo-root.active .agy-promo-card-wrapper {
                        transform: scale(1) translateY(0);
                    }
                    /* 3D Prominent Center Floating Image Stage */
                    .agy-promo-floating-stage {
                        position: relative;
                        width: 100%;
                        margin: 0 auto -22px auto;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 3;
                    }
                    .agy-promo-aura-halo {
                        position: absolute;
                        width: 92%;
                        height: 180px;
                        border-radius: 50%;
                        background: ${auraGradient};
                        animation: agyAuraPulse 3.5s ease-in-out infinite alternate;
                        pointer-events: none;
                        filter: blur(14px);
                    }
                    .agy-promo-float-img {
                        position: relative;
                        width: 94%;
                        max-width: 380px;
                        max-height: 240px;
                        height: auto;
                        object-fit: contain;
                        filter: drop-shadow(0 14px 32px rgba(0,0,0,0.7));
                        animation: agyLevitate 4.5s ease-in-out infinite alternate;
                        border-radius: 18px;
                    }
                    @keyframes agyLevitate {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-8px) rotate(0.8deg); }
                        100% { transform: translateY(2px) rotate(-0.8deg); }
                    }
                    @keyframes agyAuraPulse {
                        0% { opacity: 0.55; transform: scale(0.92); }
                        50% { opacity: 0.95; transform: scale(1.08); }
                        100% { opacity: 0.6; transform: scale(0.95); }
                    }
                    /* Transparent Glassmorphic Animated Patti (Strip) - NO BLACK SQUARE BOX */
                    .agy-promo-card {
                        background: transparent !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        color: #ffffff;
                        position: relative;
                    }
                    /* Sleek Text Strip - Hugs text tightly, transparent backdrop, NOT a square box! */
                    .agy-promo-text-patti {
                        display: inline-block;
                        width: auto;
                        max-width: 92%;
                        margin: 4px auto 14px auto;
                        padding: 10px 18px;
                        background: rgba(0, 0, 0, 0.35);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-radius: 20px;
                        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
                        animation: agyPattiPulse 4s ease-in-out infinite alternate;
                    }
                    @keyframes agyPattiPulse {
                        0% { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), 0 0 10px rgba(245, 158, 11, 0.1); }
                        100% { box-shadow: 0 6px 25px rgba(0, 0, 0, 0.55), 0 0 25px rgba(245, 158, 11, 0.3); }
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
                    /* Action Buttons (Stacked Vertically, 390px max-width) */
                    .agy-promo-actions {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        width: 96%;
                        max-width: 390px;
                        margin: 0 auto;
                    }
                    /* Box 1: Gift Box (Orange / Golden) */
                    .agy-promo-cta-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
                        color: #ffffff;
                        font-size: 1rem;
                        font-weight: 800;
                        padding: 13px 20px;
                        border-radius: 14px;
                        text-decoration: none;
                        transition: transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 4px 18px rgba(234, 88, 12, 0.55);
                        border: 1px solid rgba(255, 255, 255, 0.25);
                        cursor: pointer;
                    }
                    .agy-promo-cta-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 25px rgba(234, 88, 12, 0.75);
                    }
                    /* Box 2: WhatsApp Share (Green) */
                    .agy-promo-share-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                        color: #ffffff;
                        font-size: 0.94rem;
                        font-weight: 700;
                        padding: 12px 18px;
                        border-radius: 14px;
                        cursor: pointer;
                        transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 4px 16px rgba(22, 163, 74, 0.45);
                    }
                    .agy-promo-share-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 22px rgba(22, 163, 74, 0.65);
                    }
                    /* Close Cross Button */
                    .agy-promo-close-btn {
                        position: absolute;
                        top: -12px;
                        right: 0px;
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        background: rgba(0, 0, 0, 0.65);
                        border: 1.5px solid rgba(255, 255, 255, 0.35);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-size: 1.15rem;
                        transition: background 0.2s, transform 0.2s;
                        z-index: 25;
                        box-shadow: 0 4px 14px rgba(0,0,0,0.6);
                    }
                    .agy-promo-close-btn:hover {
                        background: rgba(239, 68, 68, 0.85);
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

                        <!-- 2 Action Buttons Stacked Directly Below -->
                        <div class="agy-promo-actions">
                            ${(isGiftRecipient && !user.isRegistered) ? `
                                <button type="button" class="agy-promo-cta-btn" id="agyPromoClaimBtn">
                                    <span>🎁 अपना उपहार व 5 पॉइंट्स ओपन करें</span>
                                </button>
                            ` : `
                                <a href="${promo.target_url || '/'}" class="agy-promo-cta-btn" id="agyPromoCtaBtn">
                                    <span>🎁 ${promo.cta_text ? promo.cta_text.replace(/^[🎁📖🎬🌿🔥\s]+/, '') : 'उत्सव उपहार व ई-बुक्स देखें'}</span>
                                </a>
                            `}

                            ${promo.share_enabled ? `
                                <button type="button" class="agy-promo-share-btn" id="agyPromoShareBtn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.058-1.745-.392-1.378-.561-2.261-1.95-2.33-2.04-.069-.092-.556-.739-.556-1.409 0-.671.352-1.002.477-1.139.124-.138.272-.172.363-.172.091 0 .182.002.261.006.084.004.196-.032.307.234.114.272.389.948.423 1.017.034.069.057.15.011.24-.045.09-.068.147-.136.225-.068.079-.144.175-.205.235-.069.068-.141.141-.06.28.081.139.362.597.777.967.535.477.986.624 1.125.694.14.069.222.059.304-.035.083-.095.352-.41.446-.55.093-.14.188-.117.315-.07.128.046.81.382.949.452.14.069.233.104.267.162.034.059.034.343-.11.748z"/>
                                    </svg>
                                    <span>📲 WhatsApp पर शुभकामनाएँ शेयर करें (+1 Point)</span>
                                </button>
                            ` : ''}
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

            // Dismiss function (Minimises to Floating Gift Box)
            const dismiss = () => {
                root.classList.remove('active');
                this.markDismissed(promo.id);
                stopParticles();
                setTimeout(() => {
                    root.remove();
                    this.renderMinimisedFloatingGift(promo);
                }, 380);
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

            // Click outside card dismisses
            root.addEventListener('click', (e) => {
                if (e.target === root || e.target === canvas) {
                    dismiss();
                }
            });

            // ESC key dismisses
            const onKeyDown = (e) => {
                if (e.key === 'Escape') {
                    dismiss();
                    window.removeEventListener('keydown', onKeyDown);
                }
            };
            window.addEventListener('keydown', onKeyDown);

            // Claim Gift Button (For Unregistered Recipient)
            const claimBtn = document.getElementById('agyPromoClaimBtn');
            if (claimBtn) {
                claimBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.promptRegistrationForShare((newUser) => {
                        this.playChimeSound();
                        try {
                            if (window.AarogyamWallet && typeof window.AarogyamWallet.creditPoints === 'function') {
                                window.AarogyamWallet.creditPoints(5, '🎁 स्वागत उपहार (5 पॉइंट्स)', 'welcome_bonus');
                            }
                        } catch(e) {}
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
        renderMinimisedFloatingGift: function (promo) {
            // Safety check: Do not show on book landing pages
            if (this.isBookLandingPage()) return;

            const existing = document.getElementById('agy-floating-gift-box');
            if (existing) {
                existing.style.display = 'flex';
                return;
            }

            const box = document.createElement('div');
            box.id = 'agy-floating-gift-box';
            box.innerHTML = `
                <style>
                    #agy-floating-gift-box {
                        position: fixed;
                        bottom: 82px;
                        left: 18px;
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

        // 8. Bootstrap Engine
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

                    // Frequency dismissal check
                    if (this.isDismissedRecently(p, data.updated_at)) return false;

                    return true;
                });

                if (eligible) {
                    // Quick smooth entrance (300ms after DOM ready)
                    setTimeout(() => {
                        this.renderPromotion(eligible);
                    }, 300);
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
