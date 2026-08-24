/* ==========================================================================
   AAROGYAM INDIA - USER PERSONAL NOTIFICATION SYSTEM (CLIENT-SIDE ENGINE)
   ========================================================================== */

(function () {
    'use strict';

    // 🔔 User Notification Store & Config
    window.USER_NOTIFICATIONS = {
        items: [],
        currentFilter: 'all',
        audioCtx: null,

        // 1. Initialize Engine on DOM Ready
        init: async function () {
            this.ensureDomElements();
            await this.loadUserNotifications();
            this.bindEvents();
            this.setupPeriodicCheck();
        },

        // 2. Resolve Current User
        getUser: function () {
            try {
                const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('UCAS_USER') || localStorage.getItem('AI_PROFILE') || '{}');
                if (u && (u.id || u.mobile)) return u;
            } catch (e) {}

            return {
                id: localStorage.getItem('user_id') || localStorage.getItem('profile_id') || null,
                mobile: localStorage.getItem('user_mobile') || localStorage.getItem('aim_user_mobile') || null,
                share_id: localStorage.getItem('user_share_id') || localStorage.getItem('user_referral_code') || 'AI000004',
                full_name: localStorage.getItem('user_name') || 'प्रिय पाठक'
            };
        },

        // 3. Audio Chime Synthesizer (Pure Web Audio API - Zero External Dependencies)
        playBellSound: function () {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                if (!this.audioCtx) this.audioCtx = new AudioContext();
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }

                const now = this.audioCtx.currentTime;
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                // Pleasant Bell Chime (C6 -> G5 harmonic)
                osc.frequency.setValueAtTime(1046.50, now);
                osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18);

                gain.gain.setValueAtTime(0.28, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start(now);
                osc.stop(now + 0.6);
            } catch (err) {
                console.warn("Notification audio notice:", err);
            }
        },

        getDb: function () {
            if (window.dbClient && typeof window.dbClient.from === 'function') return window.dbClient;
            if (typeof db !== 'undefined' && db && typeof db.from === 'function') return db;
            if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
            if (window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
            if (window.supabase && typeof window.supabase.createClient === 'function') {
                window.dbClient = window.supabase.createClient(
                    'https://qjhjrzsnrtahmhswxyvb.supabase.co',
                    'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
                );
                return window.dbClient;
            }
            return null;
        },

        // 4. Load User's Personal Real-time & Stored Notifications
        loadUserNotifications: async function () {
            const user = this.getUser();
            const readStore = JSON.parse(localStorage.getItem(`AI_NOTIFS_READ_${user.id || user.mobile || 'guest'}`) || '[]');
            const list = [];

            const db = this.getDb();
            const shareId = user.share_id || user.referral_code || '';

            // --- A. Real Referral Signups from Supabase ---
            const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val).trim()));
            const targetUuid = (user.id && isUuid(user.id)) ? user.id : null;

            if (db && typeof db.from === 'function' && targetUuid) {
                try {
                    const { data: directRefs } = await db
                        .from('profiles')
                        .select('id, full_name, mobile, created_at')
                        .eq('referred_by', targetUuid)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (Array.isArray(directRefs)) {
                        directRefs.forEach(ref => {
                            const dateStr = ref.created_at || new Date().toISOString();
                            list.push({
                                id: `ref_${ref.id}`,
                                category: 'sales',
                                icon: '👥',
                                iconClass: 'user-notif-icon-lead',
                                title: `🎉 नया रेफरल जुड़ा: ${ref.full_name || 'नया सदस्य'}`,
                                desc: `मोबाइल: ${ref.mobile ? ref.mobile.slice(0, 6) + 'XXXX' : '---'} आपके रेफरल लिंक से सफलतापूर्वक रजिस्टर हुआ।`,
                                timestamp: dateStr,
                                isRead: readStore.includes(`ref_${ref.id}`)
                            });
                        });
                    }
                } catch (e) {
                    console.warn("Referral notif note:", e);
                }
            }

            // --- B. Real Survey Leads from Supabase ---
            if (db && typeof db.from === 'function' && user.id) {
                try {
                    const { data: userSurveys } = await db
                        .from('surveys')
                        .select('id, respondent_name, respondent_mobile, created_at, category')
                        .eq('created_by', user.id)
                        .order('created_at', { ascending: false })
                        .limit(8);

                    if (Array.isArray(userSurveys)) {
                        userSurveys.forEach(surv => {
                            list.push({
                                id: `surv_${surv.id}`,
                                category: 'leads',
                                icon: '📋',
                                iconClass: 'user-notif-icon-survey',
                                title: `📝 नया सर्वे प्राप्त: ${surv.respondent_name || 'ग्राहक'}`,
                                desc: `श्रेणी: ${surv.category || 'सामान्य'} • संपर्क: ${surv.respondent_mobile || 'उपलब्ध'}`,
                                timestamp: surv.created_at || new Date().toISOString(),
                                isRead: readStore.includes(`surv_${surv.id}`)
                            });
                        });
                    }
                } catch (e) {
                    console.warn("Survey notif note:", e);
                }
            }

            // --- C. Real Purchases / Order Status ---
            if (db && typeof db.from === 'function' && user.id) {
                try {
                    const { data: userPurchases } = await db
                        .from('purchases')
                        .select('id, book_id, amount, payment_status, purchase_date')
                        .eq('profile_id', user.id)
                        .order('purchase_date', { ascending: false })
                        .limit(5);

                    if (Array.isArray(userPurchases)) {
                        userPurchases.forEach(pur => {
                            list.push({
                                id: `pur_${pur.id}`,
                                category: 'sales',
                                icon: '💳',
                                iconClass: 'user-notif-icon-sale',
                                title: `✅ पेमेंट व ऑर्डर सफल: ₹${pur.amount || 99}`,
                                desc: `आपकी ई-बुक (${pur.book_id || 'Digital Book'}) का ऑर्डर कन्फर्म हो गया है। इनवॉइस उपलब्ध है।`,
                                timestamp: pur.purchase_date || new Date().toISOString(),
                                isRead: readStore.includes(`pur_${pur.id}`)
                            });
                        });
                    }
                } catch (e) {
                    console.warn("Purchase notif note:", e);
                }
            }

            // --- D. User Milestones (100% Profile & Subscription Alerts) ---
            if (user.id || user.mobile) {
                // Incomplete Profile Nudge
                const isProfile100 = user.full_name && user.mobile && user.email && user.gender && user.dob && (user.state || user.State) && (user.city || user.district) && user.address && user.occupation && user.interest && user.netsurf_id;
                if (!isProfile100) {
                    list.push({
                        id: 'milestone_profile_nudge',
                        category: 'announcements',
                        icon: '⚠️',
                        iconClass: 'user-notif-icon-alert',
                        title: '✨ 100% प्रोफाइल पूरा करें (NetSurf ID सहित)',
                        desc: 'रेफरल अर्निंग और सभी VIP टूल्स एक्टिव करने के लिए अपनी अधूरी प्रोफाइल अपडेट करें।',
                        timestamp: new Date().toISOString(),
                        isRead: readStore.includes('milestone_profile_nudge')
                    });
                }

                // Active 365-Day Subscription Alert
                if (user.is_active || user.is_subscriber) {
                    list.push({
                        id: 'milestone_vip_active',
                        category: 'announcements',
                        icon: '👑',
                        iconClass: 'user-notif-icon-sale',
                        title: '👑 Aarogyam VIP Annual Pass एक्टिव है',
                        desc: 'आपको 365 दिनों के लिए सभी ई-बुक्स और UCAS मार्केटिंग टूल्स का अनलिमिटेड एक्सेस प्राप्त है।',
                        timestamp: user.created_at || new Date().toISOString(),
                        isRead: readStore.includes('milestone_vip_active')
                    });
                }
            }

            // --- E. Dynamic Admin Broadcasts from Storage & Supabase ---
            try {
                const globalBroadcasts = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
                if (Array.isArray(globalBroadcasts)) {
                    const today = new Date();
                    const isUserBday = Boolean(user.dob && (() => {
                        try {
                            const b = new Date(user.dob);
                            return b.getDate() === today.getDate() && b.getMonth() === today.getMonth();
                        } catch (e) { return false; }
                    })());

                    const hasPurchased = Boolean(
                        localStorage.getItem('AI_PURCHASES') || 
                        localStorage.getItem('purchases') || 
                        user.is_subscriber || 
                        user.totalPurchases > 0
                    );

                    globalBroadcasts.forEach(bc => {
                        let isEligible = false;
                        if (!bc.target || bc.target === 'all') isEligible = true;
                        else if (bc.target === 'birthday' && isUserBday) isEligible = true;
                        else if (bc.target === 'active' && (user.is_active || user.is_subscriber)) isEligible = true;
                        else if (bc.target === 'inactive' && !(user.is_active || user.is_subscriber)) isEligible = true;
                        else if (bc.target === 'purchased' && hasPurchased) isEligible = true;
                        else if (Array.isArray(bc.target_user_ids) && (bc.target === 'selected' || bc.target_user_ids.length > 0)) {
                            if (bc.target_user_ids.includes(user.id) || bc.target_user_ids.includes(user.mobile) || bc.target_user_ids.includes(shareId)) {
                                isEligible = true;
                            }
                        }

                        if (isEligible) {
                            const isRead = readStore.includes(bc.id);
                            const catIcons = {
                                birthday: '🎂',
                                offer: '🎉',
                                webinar: '🎥',
                                update: '🚀',
                                alert: '⚠️',
                                announcement: '📢'
                            };
                            const bcIcon = catIcons[bc.category] || (bc.title && bc.title.match(/[\u{1F300}-\u{1F9FF}]/u) ? bc.title.match(/[\u{1F300}-\u{1F9FF}]/u)[0] : '📢');

                            list.push({
                                id: bc.id || `BC_${Date.now()}`,
                                category: 'announcements',
                                isBroadcast: true,
                                icon: bcIcon,
                                iconClass: 'user-notif-icon-broadcast',
                                title: bc.title || 'आरोग्यम इंडिया संदेश',
                                desc: bc.body || bc.desc || '',
                                actionUrl: bc.action_url || null,
                                priority: bc.priority || 'normal',
                                timestamp: bc.created_at || new Date().toISOString(),
                                isRead: isRead
                            });

                            // Auto trigger broadcast popup for unread urgent or birthday broadcasts
                            if (!isRead && !sessionStorage.getItem(`AI_BC_POPUP_SHOWN_${bc.id}`)) {
                                setTimeout(() => {
                                    window.USER_NOTIFICATIONS?.showBroadcastPopup(bc);
                                }, 1500);
                            }
                        }
                    });
                }
            } catch (err) {}

            // Sort by timestamp descending
            list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            this.items = list;
            this.updateBadgeCount();
            this.renderList();
        },

        // 5. Ensure DOM Shell (Drawer Panel & Top Toast) Exists
        ensureDomElements: function () {
            if (!document.getElementById('userNotifOverlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'userNotifOverlay';
                overlay.className = 'user-notif-overlay';
                overlay.innerHTML = `
                    <div class="user-notif-panel" id="userNotifPanel">
                        <div class="user-notif-header">
                            <div class="user-notif-title-wrap">
                                <span>🔔</span>
                                <h3 class="user-notif-title">मेरी सूचनाएं (Notifications)</h3>
                                <span class="user-notif-unread-pill" id="userNotifUnreadPill">0 नई</span>
                            </div>
                            <div class="user-notif-header-actions">
                                <button type="button" class="user-notif-btn-action" id="btnMarkAllRead">✓ सभी पढ़ें</button>
                                <button type="button" class="user-notif-btn-close" id="btnCloseNotifPanel">&times;</button>
                            </div>
                        </div>

                        <div class="user-notif-tabs">
                            <button type="button" class="user-notif-tab active" data-filter="all">सभी (All)</button>
                            <button type="button" class="user-notif-tab" data-filter="sales">💰 सेल्स व अर्निंग्स</button>
                            <button type="button" class="user-notif-tab" data-filter="leads">📋 सर्वे व लीड्स</button>
                            <button type="button" class="user-notif-tab" data-filter="announcements">📢 घोषणाएं</button>
                        </div>

                        <ul class="user-notif-list" id="userNotifListContainer">
                            <li class="user-notif-empty">
                                <div class="user-notif-empty-icon">🔕</div>
                                <div class="user-notif-empty-text">कोई नई सूचना नहीं है</div>
                                <p class="user-notif-empty-sub">आपकी सभी व्यक्तिगत गतिविधियां यहाँ दिखाई देंगी।</p>
                            </li>
                        </ul>
                    </div>
                `;
                document.body.appendChild(overlay);
            }

            // Top Toast Container
            if (!document.getElementById('userNotifTopToast')) {
                const toast = document.createElement('div');
                toast.id = 'userNotifTopToast';
                toast.className = 'user-notif-top-toast';
                toast.innerHTML = `
                    <div class="user-notif-toast-icon" id="toastIcon">🔔</div>
                    <div class="user-notif-toast-body">
                        <div class="user-notif-toast-title" id="toastTitle">नया अलर्ट</div>
                        <div class="user-notif-toast-desc" id="toastDesc">विवरण...</div>
                    </div>
                    <button type="button" class="user-notif-toast-close" onclick="window.USER_NOTIFICATIONS.hideTopToast()">&times;</button>
                `;
                document.body.appendChild(toast);
            }
        },

        // 6. Update Badge Counters Across Header Bell & Aarogyam Messages Navigation
        updateBadgeCount: function () {
            const unreadCount = this.items.filter(n => !n.isRead).length;
            const unreadBroadcasts = this.items.filter(n => (n.isBroadcast || String(n.id).startsWith('BC_') || String(n.id).startsWith('system_')) && !n.isRead).length;

            // Update Bell Badges
            const badgeEls = document.querySelectorAll('.user-notif-badge');
            const pill = document.getElementById('userNotifUnreadPill');

            badgeEls.forEach(b => {
                if (unreadCount > 0) {
                    b.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    b.style.display = 'inline-block';
                } else {
                    b.style.display = 'none';
                }
            });

            if (pill) {
                pill.textContent = `${unreadCount} नई`;
                pill.style.display = unreadCount > 0 ? 'inline-block' : 'none';
            }

            // Update Dedicated "आरोग्यम संदेश" Navigation Badges (1, 2, 3...)
            const broadcastBadges = document.querySelectorAll('#ucas-broadcast-unread-badge, #library-broadcast-unread-badge, .aarogyam-broadcast-badge, .broadcast-unread-badge');
            broadcastBadges.forEach(bg => {
                if (unreadBroadcasts > 0) {
                    bg.textContent = unreadBroadcasts > 99 ? '99+' : unreadBroadcasts;
                    bg.style.display = 'inline-flex';
                } else {
                    bg.style.display = 'none';
                }
            });
        },

        // 7. Render Items in Drawer List
        renderList: function () {
            const container = document.getElementById('userNotifListContainer');
            if (!container) return;

            let filtered = this.items;
            if (this.currentFilter !== 'all') {
                filtered = this.items.filter(n => n.category === this.currentFilter);
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <li class="user-notif-empty">
                        <div class="user-notif-empty-icon">🔕</div>
                        <div class="user-notif-empty-text">इस श्रेणी में कोई सूचना नहीं है</div>
                        <p class="user-notif-empty-sub">नई गतिविधियां होते ही यहाँ अपडेट होंगी।</p>
                    </li>
                `;
                return;
            }

            container.innerHTML = filtered.map(item => {
                const timeText = this.formatTimeAgo(item.timestamp);
                return `
                    <li class="user-notif-item ${item.isRead ? 'read' : 'unread'}" data-notif-id="${item.id}">
                        <div class="user-notif-icon-box ${item.iconClass || 'user-notif-icon-broadcast'}">
                            ${item.icon || '🔔'}
                        </div>
                        <div class="user-notif-content">
                            <h4 class="user-notif-item-title">${item.title}</h4>
                            <p class="user-notif-item-desc">${item.desc}</p>
                            <div class="user-notif-item-meta">
                                <span>🕒 ${timeText}</span>
                                ${!item.isRead ? '<span style="color:#059669;font-weight:700;">• नया</span>' : ''}
                            </div>
                        </div>
                    </li>
                `;
            }).join('');

            // Click on item to mark as read
            container.querySelectorAll('.user-notif-item').forEach(itemEl => {
                itemEl.addEventListener('click', () => {
                    const notifId = itemEl.getAttribute('data-notif-id');
                    this.markAsRead(notifId);
                });
            });
        },

        // 8. Open & Close Notification Panel
        togglePanel: function () {
            const overlay = document.getElementById('userNotifOverlay');
            if (!overlay) return;

            if (overlay.classList.contains('show')) {
                this.closePanel();
            } else {
                this.openPanel();
            }
        },

        openPanel: function () {
            const overlay = document.getElementById('userNotifOverlay');
            if (overlay) {
                this.playBellSound();
                overlay.classList.add('show');
            }
        },

        closePanel: function () {
            const overlay = document.getElementById('userNotifOverlay');
            if (overlay) overlay.classList.remove('show');
        },

        // 9. Mark As Read Logic
        markAsRead: function (notifId) {
            const user = this.getUser();
            const readStore = JSON.parse(localStorage.getItem(`AI_NOTIFS_READ_${user.id || user.mobile || 'guest'}`) || '[]');
            if (!readStore.includes(notifId)) {
                readStore.push(notifId);
                localStorage.setItem(`AI_NOTIFS_READ_${user.id || user.mobile || 'guest'}`, JSON.stringify(readStore));
            }

            const item = this.items.find(n => n.id === notifId);
            if (item) item.isRead = true;

            this.updateBadgeCount();
            this.renderList();
        },

        markAllAsRead: function () {
            const user = this.getUser();
            const allIds = this.items.map(n => n.id);
            localStorage.setItem(`AI_NOTIFS_READ_${user.id || user.mobile || 'guest'}`, JSON.stringify(allIds));

            this.items.forEach(n => n.isRead = true);
            this.updateBadgeCount();
            this.renderList();
        },

        // 10. Top Toast Notification Display
        showTopToast: function (title, desc, icon = '🔔') {
            const toast = document.getElementById('userNotifTopToast');
            if (!toast) return;

            const tIcon = document.getElementById('toastIcon');
            const tTitle = document.getElementById('toastTitle');
            const tDesc = document.getElementById('toastDesc');

            if (tIcon) tIcon.textContent = icon;
            if (tTitle) tTitle.textContent = title;
            if (tDesc) tDesc.textContent = desc;

            this.playBellSound();
            toast.classList.add('show');

            toast.onclick = () => {
                this.hideTopToast();
                this.openPanel();
            };

            setTimeout(() => {
                this.hideTopToast();
            }, 6000);
        },

        hideTopToast: function () {
            const toast = document.getElementById('userNotifTopToast');
            if (toast) toast.classList.remove('show');
        },

        // 11. Full Screen Broadcast Announcement Popup Modal
        showBroadcastPopup: function (bc) {
            if (!bc || !bc.id) return;
            sessionStorage.setItem(`AI_BC_POPUP_SHOWN_${bc.id}`, 'true');

            let popup = document.getElementById('ai-broadcast-popup-overlay');
            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'ai-broadcast-popup-overlay';
                popup.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;';
                document.body.appendChild(popup);
            }

            const priorityColor = bc.priority === 'urgent' ? '#EF4444' : (bc.priority === 'important' ? '#F59E0B' : '#10B981');

            popup.innerHTML = `
                <div style="background:#ffffff;border-radius:16px;max-width:440px;width:100%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);overflow:hidden;border:2px solid ${priorityColor};">
                    <div style="background:linear-gradient(135deg, #0F172A 0%, #1E293B 100%);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:1.3rem;">${bc.category === 'birthday' ? '🎂' : '📢'}</span>
                            <strong style="font-size:1rem;color:#F8FAFC;">आरोग्यम इंडिया का संदेश</strong>
                        </div>
                        <button type="button" onclick="window.USER_NOTIFICATIONS.closeBroadcastPopup('${bc.id}')" style="background:transparent;border:none;color:#94A3B8;font-size:1.5rem;cursor:pointer;line-height:1;">&times;</button>
                    </div>

                    <div style="padding:20px;">
                        <div style="font-weight:800;font-size:1.1rem;color:#0F172A;margin-bottom:8px;line-height:1.35;">
                            ${bc.title}
                        </div>
                        <div style="font-size:0.9rem;color:#334155;line-height:1.5;margin-bottom:16px;white-space:pre-wrap;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #E2E8F0;">
${bc.body || bc.desc || ''}
                        </div>

                        <div style="display:flex;flex-direction:column;gap:8px;">
                            ${bc.action_url ? `
                                <a href="${bc.action_url}" target="_blank" onclick="window.USER_NOTIFICATIONS.markAsRead('${bc.id}'); window.USER_NOTIFICATIONS.closeBroadcastPopup('${bc.id}');" style="background:#2563EB;color:#fff;text-align:center;padding:10px 14px;border-radius:8px;font-weight:800;text-decoration:none;font-size:0.92rem;display:flex;align-items:center;justify-content:center;gap:6px;">
                                    <span>🔗</span> <span>अभी देखें (View Now)</span>
                                </a>
                            ` : ''}
                            <button type="button" onclick="window.USER_NOTIFICATIONS.markAsRead('${bc.id}'); window.USER_NOTIFICATIONS.closeBroadcastPopup('${bc.id}');" style="background:#F1F5F9;color:#475569;border:1px solid #CBD5E1;padding:10px;border-radius:8px;font-weight:700;cursor:pointer;font-size:0.88rem;">
                                ✓ धन्यवाद (Mark As Read)
                            </button>
                        </div>
                    </div>
                </div>
            `;
            popup.style.display = 'flex';
            this.playBellSound();
        },

        closeBroadcastPopup: function (bcId) {
            const popup = document.getElementById('ai-broadcast-popup-overlay');
            if (popup) popup.style.display = 'none';
        },

        // 11. Wire DOM Event Listeners
        bindEvents: function () {
            // Close Button
            const closeBtn = document.getElementById('btnCloseNotifPanel');
            if (closeBtn) closeBtn.addEventListener('click', () => this.closePanel());

            // Mark All Read Button
            const markAllBtn = document.getElementById('btnMarkAllRead');
            if (markAllBtn) markAllBtn.addEventListener('click', () => this.markAllAsRead());

            // Overlay Click Outside
            const overlay = document.getElementById('userNotifOverlay');
            if (overlay) {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) this.closePanel();
                });
            }

            // Tab Buttons
            const tabs = document.querySelectorAll('.user-notif-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentFilter = tab.getAttribute('data-filter') || 'all';
                    this.renderList();
                });
            });

            // Connect any button with class .user-notif-bell-btn
            document.querySelectorAll('.user-notif-bell-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.togglePanel();
                });
            });
        },

        // 12. Periodic Background Poll (Every 5 minutes, active tab only)
        setupPeriodicCheck: function () {
            setInterval(async () => {
                if (document.hidden || !document.hasFocus()) return;
                const prevUnread = this.items.filter(n => !n.isRead).length;
                await this.loadUserNotifications();
                const newUnread = this.items.filter(n => !n.isRead).length;

                if (newUnread > prevUnread && this.items[0]) {
                    const topItem = this.items[0];
                    this.showTopToast(topItem.title, topItem.desc, topItem.icon || '🔔');
                }
            }, 300000);
        },

        // 13. Relative Time Formatter
        formatTimeAgo: function (dateStr) {
            if (!dateStr) return 'अभी-अभी';
            const diff = Date.now() - new Date(dateStr).getTime();
            const minutes = Math.floor(diff / 60000);
            if (minutes < 1) return 'अभी-अभी (Just now)';
            if (minutes < 60) return `${minutes} मिनट पहले`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} घंटे पहले`;
            const days = Math.floor(hours / 24);
            if (days === 1) return 'कल';
            if (days < 30) return `${days} दिन पहले`;
            return new Date(dateStr).toLocaleDateString('hi-IN');
        }
    };

    // Auto-init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.USER_NOTIFICATIONS.init());
    } else {
        window.USER_NOTIFICATIONS.init();
    }
})();
