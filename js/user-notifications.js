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

            // --- E. System Broadcasts & New Launch Notifications ---
            list.push({
                id: 'system_broadcast_01',
                category: 'announcements',
                icon: '📢',
                iconClass: 'user-notif-icon-broadcast',
                title: '🚀 Aarogyam UCAS V1 मार्केटिंग हब लाइव हुआ!',
                desc: 'अब आप 1-क्लिक में अपने नाम व Share ID के साथ पर्सनल लैंडिंग पेज व वेबिनार इनविटेशन बना सकते हैं।',
                timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
                isRead: readStore.includes('system_broadcast_01')
            });

            list.push({
                id: 'system_broadcast_book_launch',
                category: 'announcements',
                icon: '📚',
                iconClass: 'user-notif-icon-book',
                title: '📖 नई ई-बुक: "खेती का डॉक्टर - खरीफ 2026"',
                desc: 'जैविक कृषि और उन्नत फसल सुरक्षा की नई मास्टर गाइड ई-लाइब्रेरी में उपलब्ध है।',
                timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
                isRead: readStore.includes('system_broadcast_book_launch')
            });

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

        // 6. Update Badge Counters Across Header Bell Buttons
        updateBadgeCount: function () {
            const unreadCount = this.items.filter(n => !n.isRead).length;
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

        // 12. Periodic Background Poll (Every 60s)
        setupPeriodicCheck: function () {
            setInterval(async () => {
                const prevUnread = this.items.filter(n => !n.isRead).length;
                await this.loadUserNotifications();
                const newUnread = this.items.filter(n => !n.isRead).length;

                if (newUnread > prevUnread && this.items[0]) {
                    const topItem = this.items[0];
                    this.showTopToast(topItem.title, topItem.desc, topItem.icon || '🔔');
                }
            }, 60000);
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
