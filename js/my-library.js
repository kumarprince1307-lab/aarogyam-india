// =========================================================================
// AIM PROJECT - MY LIBRARY FINAL JAVASCRIPT (Supabase & Real User Integrated)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initUserData();
    startDailyTimer();
    loadLibraryData();
    initLibraryAudioGuide();
});

// 1. Sidebar Menu Toggle Function
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    if (sideMenu) {
        sideMenu.classList.toggle('active');
    }
}

// 2. सुरक्षित लॉगआउट फंक्शन (पूरी तरह से स्टोरेज साफ करने वाला)
function logoutUser() {
    const keysToRemove = [
        'AI_USER', 'AI_PROFILE', 'AI_SESSION', 'AI_LOGIN_STATUS',
        'AI_PURCHASES', 'purchases', 'user_purchases', 'aim_purchases', 'cached_purchases',
        'UCAS_USER', 'CURRENT_USER', 'aarogyam_user', 'user_name', 'user_phone',
        'aim_user_name', 'aim_user_mobile', 'aim_user_email', 'wb_registered',
        'AOI_READ_PROGRESS', 'AI_WISHLIST', 'aim_profile_completed', 'ai_profile_completed'
    ];
    keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch(e) {}
    });
    try { sessionStorage.clear(); } catch(e) {}
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('aim_') || k.startsWith('ai_') || k.includes('purch'))) {
                localStorage.removeItem(k);
            }
        }
    } catch(e) {}
    
    alert('आप सफलतापूर्वक लॉग आउट हो चुके हैं। (Logged out successfully)');
    window.location.href = window.location.pathname;
}
window.logoutUser = logoutUser;

// Navigation & KPI Scroll Action Helpers
window.switchTabAndScroll = function(category) {
    if (category === 'purchased' || category === 'mybooks') {
        switchTab('purchased');
    } else if (category === 'available') {
        switchTab('available');
    } else if (category === 'bonus') {
        switchTab('bonus');
    } else if (category === 'demo') {
        switchTab('demo');
    } else if (category === 'coming') {
        switchTab('coming');
    }
    const catTabs = document.querySelector('.category-tabs');
    if (catTabs) {
        catTabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.scrollToWeatherSection = function() {
    const wCard = document.getElementById('weatherSectionCard');
    if (wCard) {
        wCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        window.location.href = '/weather.html';
    }
};

window.triggerAppInstallFlow = function() {
    if (typeof window.triggerPwaInstall === 'function') {
        window.triggerPwaInstall();
    } else {
        const pwaCard = document.getElementById('library-pwa-card');
        if (pwaCard) {
            pwaCard.style.display = 'block';
            pwaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (typeof window.openAppInstallGuideModal === 'function') {
            window.openAppInstallGuideModal();
        }
    }
};

window.scrollToTubeSection = function() {
    const tubeCard = document.querySelector('.tube-kpi-access-card');
    if (tubeCard) {
        tubeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        window.location.href = '/tube.html';
    }
};

// 3. Category Tabs Switching Logic
function switchTab(category, evt) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Activate target tab button by ID or by current event safely
    const activeBtn = document.getElementById('tabBtn-' + category);
    const eventObj = evt || (typeof window !== 'undefined' && window.event ? window.event : null);
    if (activeBtn) {
        activeBtn.classList.add('active');
    } else if (eventObj && eventObj.currentTarget && eventObj.currentTarget.classList && eventObj.currentTarget.classList.contains('tab-btn')) {
        eventObj.currentTarget.classList.add('active');
    }

    const sections = ['purchased', 'available', 'bonus', 'demo', 'coming'];
    sections.forEach(sec => {
        const el = document.getElementById('section-' + sec);
        if (el) el.style.display = 'none';
    });

    const targetSection = document.getElementById('section-' + category);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
}

// 4. रोज़ सुबह 6:00 बजे से नया 24-घंटे का काउंटडाउन टाइमर
function startDailyTimer() {
    const timerElement = document.getElementById('dealTimer');
    if (!timerElement) return;

    function updateTimer() {
        const now = new Date();
        let target = new Date();
        target.setHours(6, 0, 0, 0);

        if (now >= target) {
            target.setDate(target.getDate() + 1);
        }

        const diff = target - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timerElement.textContent = 
            String(hours).padStart(2, '0') + ':' + 
            String(minutes).padStart(2, '0') + ':' + 
            String(seconds).padStart(2, '0');
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 5. Supabase और LocalStorage से असली यूजर का डेटा और डायनेमिक प्रोग्रेस कैलकुलेशन
function calculateProfileProgress() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    let score = 0;
    const isProfileMarkedDone = localStorage.getItem('ai_profile_completed') === 'true';
    
    if (storedUser.full_name || storedUser.name) score++;
    if (storedUser.mobile) score++;
    if (storedUser.email) score++;
    if (storedUser.gender) score++;
    if (storedUser.State || storedUser.state) score++;
    if (storedUser.dob && String(storedUser.dob).trim()) score++;
    if (storedUser.district || storedUser.city) score++;
    if (storedUser.address) score++;
    if (storedUser.occupation) score++;
    if (storedUser.interest) score++;
    if (storedUser.netsurf_id && String(storedUser.netsurf_id).trim()) score++;
    
    const hasCoreFields = Boolean((storedUser.full_name || storedUser.name) && storedUser.mobile && (storedUser.state || storedUser.State || storedUser.district || storedUser.city));
    let percentage = Math.min(100, Math.round((score / 11) * 100));
    if (isProfileMarkedDone || (hasCoreFields && score >= 4)) {
        percentage = 100;
    }

    const completionText = document.getElementById('profileCompletionText');
    const completionBar = document.getElementById('profileCompletionBar');
    const statusHint = document.getElementById('profileStatusHint');
    const nudgePopup = document.getElementById('profile100NudgePopup');
    const nudgePercent = document.getElementById('nudgePercentText');

    if (completionText) completionText.textContent = `${percentage}%`;
    if (completionBar) {
        completionBar.style.width = `${percentage}%`;
        if (percentage === 100) {
            completionBar.style.background = '#10b981';
        } else if (percentage >= 60) {
            completionBar.style.background = 'linear-gradient(90deg, #f59e0b, #10b981)';
        } else {
            completionBar.style.background = '#f59e0b';
        }
    }

    if (statusHint) {
        if (percentage === 100) {
            statusHint.textContent = '🟢 प्रोफाइल 100% पूर्ण है!';
            statusHint.style.color = '#10b981';
        } else {
            statusHint.textContent = `⚠️ केवल ${percentage}% पूर्ण — 100% करें`;
            statusHint.style.color = '#d97706';
        }
    }

    // Persistent Popup Reminder only if strictly incomplete AND not dismissed
    if (nudgePopup) {
        const isDismissed = sessionStorage.getItem('ai_profile_nudge_dismissed') === 'true' || isProfileMarkedDone;
        if (percentage < 100 && (storedUser.id || storedUser.mobile) && !isDismissed) {
            nudgePopup.style.display = 'block';
            if (nudgePercent) nudgePercent.textContent = `${percentage}%`;
        } else {
            nudgePopup.style.display = 'none';
        }
    }
}

function initUserData() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const userName = storedUser.full_name || storedUser.name || "प्रिय पाठक";
    const userMobile = storedUser.mobile || "";
    const userEmail = storedUser.email || "";
    const userNetsurfId = storedUser.netsurf_id || "";
    const userState = storedUser.state || storedUser.State || "";
    const userDob = storedUser.dob || "";
    const userCity = storedUser.city || storedUser.district || "";
    const userAddress = storedUser.address || "";
    const userOccupation = storedUser.occupation || "";
    const userInterest = storedUser.interest || "";
    const userGender = storedUser.gender || "";

    // DOM Elements Update
    const userNameSpan = document.getElementById('userName');
    const menuUserName = document.getElementById('menuUserName');
    const mobileUserPhoneSpan = document.getElementById('mobileUserPhone');

    if (userNameSpan) userNameSpan.textContent = userName;
    if (menuUserName) menuUserName.textContent = userName;
    if (mobileUserPhoneSpan) mobileUserPhoneSpan.textContent = userMobile;

    // फॉर्म इनपुट्स में ऑटो-फिल करना
    if (document.getElementById('leadName')) document.getElementById('leadName').value = userName;
    if (document.getElementById('leadPhone')) document.getElementById('leadPhone').value = userMobile;
    if (document.getElementById('leadNetsurfId')) document.getElementById('leadNetsurfId').value = userNetsurfId;
    if (document.getElementById('leadEmail')) document.getElementById('leadEmail').value = userEmail;
    if (document.getElementById('leadGender')) document.getElementById('leadGender').value = userGender;
    if (document.getElementById('leadState')) document.getElementById('leadState').value = userState;
    if (document.getElementById('leadDob')) document.getElementById('leadDob').value = userDob;
    if (document.getElementById('leadCity')) document.getElementById('leadCity').value = userCity;
    if (document.getElementById('leadAddress')) document.getElementById('leadAddress').value = userAddress;
    if (document.getElementById('leadOccupation')) document.getElementById('leadOccupation').value = userOccupation;
    if (document.getElementById('leadInterest')) document.getElementById('leadInterest').value = userInterest;

    // 🟢 Active / Inactive User Status & 365-Day Countdown Timer
    updateSubscriptionTimerAndStatus(storedUser);

    calculateProfileProgress();
}

function updateSubscriptionTimerAndStatus(storedUser) {
    const isActive = Boolean(storedUser.is_active || storedUser.is_subscriber || storedUser.status === 'active');
    const badgeEl = document.getElementById('userStatusBadge');
    const badgeText = document.getElementById('userStatusText');
    const activeCard = document.getElementById('activeSubscriptionCard');
    const inactiveBanner = document.getElementById('inactiveSubscriptionBanner');

    if (badgeEl && badgeText) {
        if (isActive) {
            badgeEl.style.background = 'rgba(16,185,129,0.15)';
            badgeEl.style.color = '#059669';
            badgeEl.style.borderColor = 'rgba(16,185,129,0.3)';
            badgeText.textContent = '🟢 Active Subscriber';
        } else {
            badgeEl.style.background = 'rgba(239,68,68,0.12)';
            badgeEl.style.color = '#dc2626';
            badgeEl.style.borderColor = 'rgba(239,68,68,0.25)';
            badgeText.textContent = '🔴 Inactive / Free Member';
        }
    }

    if (isActive) {
        if (activeCard) activeCard.style.display = 'block';
        if (inactiveBanner) inactiveBanner.style.display = 'none';

        // 365-Day Countdown Calculation
        const regDateStr = storedUser.created_at || storedUser.subscribed_at || new Date().toISOString();
        const startDate = new Date(regDateStr);
        const endDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
        const now = new Date();

        const diffTime = endDate - now;
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const subStartDateEl = document.getElementById('subStartDate');
        const subEndDateEl = document.getElementById('subEndDate');
        const daysBadge = document.getElementById('subDaysLeftBadge');

        if (subStartDateEl) subStartDateEl.textContent = startDate.toLocaleDateString('hi-IN');
        if (subEndDateEl) subEndDateEl.textContent = endDate.toLocaleDateString('hi-IN');
        if (daysBadge) daysBadge.textContent = `⏳ ${daysLeft} दिन शेष`;
    } else {
        if (activeCard) activeCard.style.display = 'none';
        if (inactiveBanner) inactiveBanner.style.display = 'block';
    }
}

// 6. स्मार्ट चेक: यदि यूजर लॉग-इन नहीं है तो ऑटो-पॉपअप नहीं खुलेगा
function checkAndOpenProfileModal() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    if (!storedUser.id && !storedUser.mobile) {
        return;
    }

    // अगर यूजर की प्रोफाइल 100% पूरी है तो सीधे रिटर्न करें
    const is100Complete = storedUser.full_name && storedUser.mobile && storedUser.email && storedUser.gender && storedUser.dob && (storedUser.state || storedUser.State) && (storedUser.city || storedUser.district) && storedUser.address && storedUser.occupation && storedUser.interest && storedUser.netsurf_id;
    if (is100Complete) {
        return; 
    }

    // अगर प्रोफाइल अधूरी है तो 1.5 सेकंड बाद पॉपअप खोलें
    const hasSeenModal = sessionStorage.getItem('aim_profile_prompted_session');
    if (!hasSeenModal) {
        setTimeout(() => {
            openLeadModal();
            sessionStorage.setItem('aim_profile_prompted_session', 'true');
        }, 1200);
    }
}

function openLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        initUserData();
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeLeadModal() {
    const modal = document.getElementById('leadModal');
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// फॉर्म सबमिट और सेव फंक्शन
async function submitLeadForm(event) {
    event.preventDefault();
    const fullName = document.getElementById('leadName').value.trim();
    const mobile = document.getElementById('leadPhone').value.trim();
    
    const netsurfIdElem = document.getElementById('leadNetsurfId');
    const netsurfId = netsurfIdElem && netsurfIdElem.value.trim() !== '' ? netsurfIdElem.value.trim() : null;

    const emailElem = document.getElementById('leadEmail');
    const email = emailElem && emailElem.value.trim() !== '' ? emailElem.value.trim() : null;

    const genderElem = document.getElementById('leadGender');
    const gender = genderElem && genderElem.value.trim() !== '' ? genderElem.value.trim() : null;

    const stateElem = document.getElementById('leadState');
    const state = stateElem && stateElem.value.trim() !== '' ? stateElem.value.trim() : null;

    const dobElem = document.getElementById('leadDob');
    const dob = dobElem && dobElem.value.trim() !== '' ? dobElem.value.trim() : null;

    const cityElem = document.getElementById('leadCity');
    const city = cityElem && cityElem.value.trim() !== '' ? cityElem.value.trim() : null;

    const addressElem = document.getElementById('leadAddress');
    const address = addressElem && addressElem.value.trim() !== '' ? addressElem.value.trim() : null;

    const occupationElem = document.getElementById('leadOccupation');
    const occupation = occupationElem && occupationElem.value.trim() !== '' ? occupationElem.value.trim() : null;

    const interestElem = document.getElementById('leadInterest');
    const interest = interestElem && interestElem.value.trim() !== '' ? interestElem.value.trim() : null;

    if (!fullName || !mobile) {
        alert('कृपया नाम और मोबाइल नंबर दर्ज करें।');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
    if (!currentUser.id) {
        alert('User not logged in. Cannot update profile.');
        return;
    }

    const profileData = {
        full_name: fullName,
        netsurf_id: netsurfId,
        email: email,
        gender: gender,
        dob: dob,
        State: state, 
        district: city,
        address: address,
        occupation: occupation,
        interest: interest,
    };

    const submitBtn = document.getElementById('leadSubmitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'सेव हो रहा है...';
    }

    try {
        if (typeof updateProfile !== 'function') {
            alert('Error: Update function is not available.');
            return;
        }

        const result = await updateProfile(currentUser.id, profileData);

        if (result.success) {
            const updatedUser = { ...currentUser, ...result.profile, netsurf_id: netsurfId };
            localStorage.setItem('AI_USER', JSON.stringify(updatedUser));
            if (typeof ProfileStorage !== 'undefined') ProfileStorage.save(updatedUser);

            alert('🎉 बधाई हो! आपकी प्रोफाइल जानकारी (NetSurf ID सहित) सफलतापूर्वक सहेज ली गई है।');
            closeLeadModal();
            initUserData();
            calculateProfileProgress();
        } else {
            alert('प्रोफाइल अपडेट करने में त्रुटि: ' + (result.message || 'अज्ञात एरर'));
        }
    } catch (err) {
        console.error('Profile update exception', err);
        alert('प्रोफाइल सेव करने में त्रुटि हुई।');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'जानकारी सुरक्षित करें (Save Profile)';
        }
    }
}
// 8. Full Screen Zoom Modal Handler (बुक कवर फुल-स्क्रीन और पिंच-ज़ूम इफ़ेक्ट)
function openImageZoom(imgSrc) {
    let modal = document.getElementById('imageZoomModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.className = 'image-modal-overlay';
        modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:999999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(8px);";
        modal.innerHTML = `
            <button onclick="closeImageZoom()" style="position:absolute;top:20px;right:25px;background:#fff;border:none;width:45px;height:45px;border-radius:50%;font-size:26px;font-weight:bold;cursor:pointer;color:#333;box-shadow:0 4px 15px rgba(0,0,0,0.3);z-index:1000000;">&times;</button>
            <div style="max-width:90%;max-height:90%;overflow:auto;display:flex;justify-content:center;align-items:center;">
                <img id="zoomedImg" src="" alt="Zoomed Book Cover" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
            </div>
        `;
        document.body.appendChild(modal);
    }
    const imgEl = document.getElementById('zoomedImg');
    if (imgEl) imgEl.src = imgSrc;
    modal.style.display = 'flex';
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function getLibrarySupabaseClient() {
    if (window.dbClient && typeof window.dbClient.from === 'function') return window.dbClient;
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        try {
            window.dbClient = window.supabase.createClient(
                "https://qjhjrzsnrtahmhswxyvb.supabase.co",
                "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"
            );
            return window.dbClient;
        } catch (e) {}
    }
    if (typeof db !== 'undefined' && db && typeof db.from === 'function') return db;
    return null;
}

// 9. Load Books Data and Render Dynamic Library Sections & Dynamic Counts
async function loadLibraryData() {
    try {
        let jsonBooks = [];
        const cacheTime = Date.now();
        
        try {
            const res = await fetch('/data/books.json?v=' + cacheTime);
            if (res.ok) {
                const data = await res.json();
                jsonBooks = data.books || data || [];
            }
        } catch (e) {
            try {
                const res2 = await fetch('../data/books.json?v=' + cacheTime);
                if (res2.ok) {
                    const data2 = await res2.json();
                    jsonBooks = data2.books || data2 || [];
                }
            } catch (e2) {
                console.warn("books.json fetch note:", e2);
            }
        }

        const bookMap = new Map();
        jsonBooks.forEach(b => {
            if (b && b.id) {
                const bId = b.id.toUpperCase().trim();
                const isComing = (b.status === 'coming_soon' || b.isComingSoon === true || b.is_coming_soon === true);
                bookMap.set(bId, {
                    ...b,
                    id: bId,
                    status: isComing ? 'coming_soon' : (b.status || 'active'),
                    isComingSoon: isComing
                });
            }
        });

        // Overlay custom books & studio free/demo books
        try {
            const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            if (Array.isArray(customBooks)) {
                customBooks.forEach(cb => {
                    if (cb && cb.id) {
                        const bId = cb.id.toUpperCase().trim();
                        const existing = bookMap.get(bId) || {};
                        bookMap.set(bId, { ...existing, ...cb, id: bId });
                    }
                });
            }
        } catch (e) {}

        try {
            const freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
            if (Array.isArray(freeDemoBooks)) {
                freeDemoBooks.forEach(fb => {
                    if (fb && fb.id) {
                        const bId = fb.id.toUpperCase().trim();
                        const existing = bookMap.get(bId) || {};
                        bookMap.set(bId, { ...existing, ...fb, id: bId });
                    }
                });
            }
        } catch (e) {}

        // Overlay Admin Book Landing Pages
        try {
            const blpPages = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            if (Array.isArray(blpPages)) {
                blpPages.forEach(p => {
                    if (p && p.id) {
                        const bId = p.id.toUpperCase().trim();
                        const existing = bookMap.get(bId) || {};
                        const isComing = (p.is_coming_soon === true || p.is_coming_soon === 'true' || p.status === 'coming_soon');
                        bookMap.set(bId, {
                            ...existing,
                            id: bId,
                            title: p.title || existing.title || existing.heading,
                            heading: p.title || existing.heading || existing.title,
                            name: p.title || existing.name || existing.title,
                            cover: p.hero?.cover_image || existing.cover || existing.thumbnail,
                            cover_image: p.hero?.cover_image || existing.cover_image,
                            thumbnail: p.hero?.cover_image || existing.thumbnail,
                            offerPrice: p.pricing?.offer_price || existing.offerPrice,
                            mrp: p.pricing?.original_price || existing.mrp,
                            status: isComing ? 'coming_soon' : (p.status || existing.status || 'active'),
                            isComingSoon: isComing,
                            hasAudioBook: Boolean(p.audio_layer?.enabled !== false || existing.hasAudioBook || bId === 'BK015'),
                            audio_layer: p.audio_layer || existing.audio_layer,
                            audio_enabled: p.audio_layer?.enabled !== false,
                            publish_targets: p.publish_targets || existing.publish_targets
                        });
                    }
                });
            }
        } catch(e) {}

        const finalBooks = Array.from(bookMap.values());
        await renderLibrarySections(finalBooks);
    } catch (error) {
        console.error('Error loading library books:', error);
    }
}

async function renderLibrarySections(booksArray) {
    const purchasedGrid = document.getElementById('purchasedBooksGrid');
    const availableGrid = document.getElementById('availableBooksGrid');
    const bonusGrid = document.getElementById('bonusBooksGrid');
    const demoGrid = document.getElementById('demoBooksGrid');
    const comingSoonGrid = document.getElementById('comingSoonGrid');

    if (purchasedGrid) purchasedGrid.innerHTML = '';
    if (availableGrid) availableGrid.innerHTML = '';
    if (bonusGrid) bonusGrid.innerHTML = '';
    if (demoGrid) demoGrid.innerHTML = '';
    if (comingSoonGrid) comingSoonGrid.innerHTML = '';

    if (!booksArray || booksArray.length === 0) return;

    // 1. Gather all purchases (LocalStorage + Supabase Remote Multi-Profile Sync)
    const localUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    let profileId = localUser.id || null;
    const rawMobile = localUser.mobile || localUser.phone || '';
    const cleanMobile = rawMobile ? String(rawMobile).replace(/\D/g, '').slice(-10) : '';
    const isLoggedInUser = Boolean(profileId || (cleanMobile && cleanMobile.length === 10));

    let userPurchases = [];
    const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
    userPurchases = Array.isArray(localPurchases) ? [...localPurchases] : [];

    try {
        const activeDb = getLibrarySupabaseClient();
        if (activeDb && isLoggedInUser) {
            // ✅ EGRESS FIX: 15-min sessionStorage cache for purchases per specific user
            const libCacheKey = 'aim_lib_purch_' + (cleanMobile || profileId);
            let fromCache = false;
            try {
                const raw = sessionStorage.getItem(libCacheKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && (Date.now() - (parsed._ts || 0) < 900000) && Array.isArray(parsed.data)) {
                        userPurchases = parsed.data;
                        fromCache = true;
                    }
                }
            } catch(e) {}

            if (!fromCache) {
                let profileIds = [];
                if (profileId) profileIds.push(profileId);

                // If mobile number exists, query Supabase profiles to get all associated profile IDs
                if (cleanMobile && cleanMobile.length === 10) {
                    try {
                        const { data: pList } = await activeDb
                            .from('profiles')
                            .select('id, full_name, mobile, is_active, is_subscriber')
                            .or(`mobile.eq.${cleanMobile},mobile.eq.+91${cleanMobile},mobile.eq.91${cleanMobile}`);

                        if (Array.isArray(pList) && pList.length > 0) {
                            pList.forEach(p => {
                                if (p && p.id && !profileIds.includes(p.id)) {
                                    profileIds.push(p.id);
                                }
                            });
                            if (!localUser.id && pList[0].id) {
                                localUser.id = pList[0].id;
                                if (pList[0].full_name && !localUser.full_name) localUser.full_name = pList[0].full_name;
                                if (pList[0].is_active) localUser.is_active = true;
                                if (pList[0].is_subscriber) localUser.is_subscriber = true;
                                localStorage.setItem('AI_USER', JSON.stringify(localUser));
                            }
                        }
                    } catch (pe) {
                        console.warn("Profile query note:", pe);
                    }
                }

                // If profile ID(s) exist, query Supabase purchases table
                if (profileIds.length > 0) {
                    const { data: dbPurchases, error: purErr } = await activeDb
                        .from('purchases')
                        .select('id, profile_id, book_id, amount, payment_status, payment_id, order_id, purchase_date, created_at')
                        .in('profile_id', profileIds);

                    if (!purErr && Array.isArray(dbPurchases)) {
                        const freshPurchases = [];
                        dbPurchases.forEach(p => {
                            const rawBId = String(p.book_id || '').toUpperCase().trim();
                            if (rawBId) {
                                const bIds = rawBId.includes(',') ? rawBId.split(',').map(s => s.trim().toUpperCase()) : [rawBId];
                                bIds.forEach(singleId => {
                                    if (singleId && !freshPurchases.some(up => String(up.book_id || up.id || '').toUpperCase() === singleId)) {
                                        freshPurchases.push({
                                            id: p.id || ('pur_' + singleId),
                                            book_id: singleId,
                                            amount: p.amount,
                                            payment_status: p.payment_status || 'success',
                                            purchase_date: p.purchase_date || p.created_at || new Date().toISOString()
                                        });
                                    }
                                });
                            }
                        });
                        userPurchases = freshPurchases;
                        localStorage.setItem('AI_PURCHASES', JSON.stringify(userPurchases));
                        localStorage.setItem('purchases', JSON.stringify(userPurchases));
                        // Save to session cache for 15 minutes
                        try { sessionStorage.setItem(libCacheKey, JSON.stringify({ data: userPurchases, _ts: Date.now() })); } catch(e) {}
                    }
                }
            }
        }
    } catch (dbErr) {
        console.warn("Supabase purchases sync exception:", dbErr);
    }

    // Collect all valid purchased book IDs
    const activePurchasedBookIds = new Set();
    userPurchases.forEach(p => {
        if (!p) return;
        const bId = String(p.book_id || p.id || '').toUpperCase().trim();
        if (bId) {
            activePurchasedBookIds.add(bId);
            activePurchasedBookIds.add(bId.replace(/^DEMO-?/i, ''));
        }
    });

    let purchasedCount = 0;
    let bonusCount = 0;
    let demoCount = 0;
    let audioCount = 0;
    let wishlistItems = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]');
    let wishlistCount = wishlistItems.length;

    const seenPurchasedIds = new Set();
    const seenAvailableIds = new Set();
    const seenDemoIds = new Set();
    const seenBonusIds = new Set();
    const seenComingSoonIds = new Set();
    const seenAudioIds = new Set();

    // Render Books across all active sections (Deduplicated)
    booksArray.forEach(book => {
        const rawId = (book.book_id || book.id || '').toUpperCase().trim();
        if (!rawId) return;

        const bookId = book.book_id || book.id;
        const bookName = book.title || book.heading || book.name;
        const bookCover = book.cover_image || book.cover || book.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp';
        const isComingSoonBook = (book.status === 'coming_soon' || book.isComingSoon === true || book.is_coming_soon === true || book.badge === 'coming_soon' || book.store_badge === 'coming_soon');
        const hasAudioBook = Boolean(book.hasAudioBook || book.has_audio || book.audioUrl || book.audio_layer?.enabled || book.audio_enabled || rawId === 'BK001' || rawId === 'BK002' || rawId === 'BK015');
        const isStudioDemo = (book.type === 'demo' || book.isDemo === true || rawId.startsWith('DEMO')) && !rawId.startsWith('BONUS') && !rawId.startsWith('FREE');
        const isStudioBonus = (book.type === 'bonus_free' || book.isBonus === true || rawId.startsWith('BONUS') || rawId.startsWith('FREE')) && !rawId.startsWith('DEMO');
        const bookVideos = Array.isArray(book.videos) ? book.videos : (book.video?.url ? [{ title: book.video.title || 'Video Demo', url: book.video.url }] : []);
        // ✅ FIX: Extract PDF path from book data (covers BK015 and all custom uploads)
        const bookPdfPath = book.mainPdf || book.pdf_url || book.pdfUrl || book.main_pdf || '';

        if (hasAudioBook && !seenAudioIds.has(rawId)) {
            seenAudioIds.add(rawId);
            audioCount++;
        }

        // 1. Purchased / My Books (Paid unlocked books)
        const isPurchased = !isComingSoonBook && !isStudioDemo && !isStudioBonus && activePurchasedBookIds.has(rawId);

        if (isPurchased && !seenPurchasedIds.has(rawId)) {
            seenPurchasedIds.add(rawId);
            purchasedCount++;
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // Reading progress calculation
            let progressPercent = 0;
            try {
                const readProgressMap = JSON.parse(localStorage.getItem('AOI_READ_PROGRESS') || '{}');
                const pInfo = readProgressMap[rawId] || readProgressMap[bookId] || null;
                if (pInfo && pInfo.total > 0) {
                    progressPercent = Math.min(100, Math.round((pInfo.current / pInfo.total) * 100));
                }
            } catch(e) {}

            card.innerHTML = `
                <div style="position:relative;cursor:pointer;" onclick="window.location.href='/ebooks/reader.html?book=${bookId}'" title="क्लिक करके सीधे पढ़ें">
                    <img src="${bookCover}" alt="${bookName}">
                    ${hasAudioBook ? '<span style="position:absolute; bottom:8px; left:8px; background:linear-gradient(135deg, #8b5cf6, #6366f1); color:#fff; font-size:0.68rem; font-weight:800; padding:3px 8px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.3);">🎧 ऑडियो उपलब्ध</span>' : ''}
                    <span style="position:absolute; top:8px; right:8px; background:#10b981; color:#fff; font-size:0.68rem; font-weight:800; padding:3px 8px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.25);">✓ UNLOCKED</span>
                </div>
                <h4>${bookName}</h4>
                ${progressPercent > 0 ? `
                <div style="margin: 6px 0;">
                    <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:#64748b;font-weight:700;margin-bottom:3px;">
                        <span>📖 पठन प्रोग्रेस</span>
                        <span style="color:#10b981;">${progressPercent}% पूर्ण</span>
                    </div>
                    <div style="width:100%;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;">
                        <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#10b981,#059669);border-radius:3px;"></div>
                    </div>
                </div>` : ''}
                <div class="book-btn-group" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                    <a href="/ebooks/reader.html?book=${bookId}" class="btn-read" style="flex:1;min-width:85px;padding:8px;background:#138A36;color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.85rem;">📖 Read</a>
                    ${hasAudioBook ? `<a href="/ebooks/reader.html?book=${bookId}&audio=1" class="btn-audio" style="flex:1;min-width:85px;padding:8px;background:linear-gradient(135deg, #7c3aed, #6366f1);color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.85rem;" title="ऑडियो बुक सुनें">🎧 ऑडियो</a>` : ''}
                    ${bookVideos.length > 0 ? `<button type="button" onclick='window.openBookVideoModal("${bookName}", ${JSON.stringify(bookVideos)})' class="btn-video" style="flex:1;min-width:85px;padding:8px;background:#ef4444;color:#fff;text-align:center;border-radius:10px;font-weight:700;border:none;cursor:pointer;font-size:0.85rem;" title="वीडियो डेमो देखें">🎬 वीडियो</button>` : ''}
                    <a href="/ebooks/download.html?book=${encodeURIComponent(bookId)}" class="btn-buy" style="flex:1;min-width:85px;padding:8px;background:#E86A17;color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;display:inline-block;font-size:0.85rem;" title="PDF डाउनलोड हब खोलें">📥 PDF</a>
                </div>
            `;
            if (purchasedGrid) purchasedGrid.appendChild(card);

            // Check if purchased book has specific bonus books in Landing Pages, JSON, or Studio Free/Bonus Books
            let bonusList = [];
            if (book.bonusBooks && Array.isArray(book.bonusBooks) && book.bonusBooks.length > 0) {
                bonusList = book.bonusBooks.map((f, i) => ({ title: `${bookName} — VIP बोनस #${i+1}`, file_url: f, image: bookCover, id: `${rawId}_BONUS_${i+1}` }));
            }
            if (book.bonuses && Array.isArray(book.bonuses) && book.bonuses.length > 0) {
                bonusList = [...bonusList, ...book.bonuses];
            }

            // Auto-attach any Studio Free Bonus Books linked to this purchased book
            try {
                const allFreeDemo = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
                if (Array.isArray(allFreeDemo)) {
                    allFreeDemo.forEach(fb => {
                        if (fb && (fb.type === 'bonus_free' || fb.isBonus)) {
                            const tBook = (fb.targetMainBook || '').toUpperCase().trim();
                            if (tBook === rawId || tBook === 'ALL') {
                                bonusList.push({
                                    id: fb.id,
                                    title: fb.heading || fb.name || `${bookName} — विशेष बोनस`,
                                    subtitle: fb.subtitle || 'आपकी मुख्य पुस्तक खरीद के साथ अनलॉक हुआ',
                                    image: fb.cover || fb.thumbnail || bookCover,
                                    hasAudioBook: Boolean(fb.hasAudioBook || fb.audioUrl),
                                    demoPdf: fb.demoPdf || fb.freePdf || fb.pdf_url || '',
                                    videos: Array.isArray(fb.videos) ? fb.videos : []
                                });
                            }
                        }
                    });
                }
            } catch(e) {}

            if (bonusList.length > 0 && bonusGrid) {
                bonusList.forEach((bn, bIdx) => {
                    const bnKey = bn.id || `${rawId}_bn_${bIdx}`;
                    if (!seenBonusIds.has(bnKey)) {
                        seenBonusIds.add(bnKey);
                        bonusCount++;
                        const bonusCard = document.createElement('div');
                        bonusCard.className = 'book-card';
                        bonusCard.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.05);display:flex;flex-direction:column;justify-content:space-between;';
                        const bImg = bn.image || bn.cover || '/images/books/kharif-master-guide-2026-cover.webp';
                        const bTitle = bn.title || `${bookName} — बोनस #${bIdx+1}`;
                        const bId = bn.id || `${bookId}&demo=1`;
                        const bReaderUrl = `/ebooks/reader.html?book=${encodeURIComponent(bId)}&demo=1`;
                        const bHasAudio = Boolean(bn.hasAudioBook || hasAudioBook);
                        const bPdf = bn.demoPdf || bn.file_url || '';
                        const bVideos = Array.isArray(bn.videos) ? bn.videos : [];

                        bonusCard.innerHTML = `
                            <div>
                                <div style="text-align:center;margin-bottom:8px;">
                                    <img src="${bImg}" style="width:70px;height:95px;object-fit:cover;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,0.12);cursor:pointer;" onclick="openImageZoom('${bImg}')" />
                                </div>
                                <span style="background:#16a34a;color:#fff;font-size:0.68rem;font-weight:800;padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:4px;">🎁 100% FREE VIP BONUS</span>
                                <h4 style="color:#065f46;margin:0 0 6px 0;font-size:0.95rem;">${bTitle}</h4>
                                <p style="font-size:0.78rem;color:#64748b;margin-bottom:12px;">आपकी ${bookName} खरीद के साथ मुफ़्त अनलॉक।</p>
                            </div>
                            <div class="book-btn-group" style="display:flex;gap:6px;flex-wrap:wrap;">
                                <a href="${bReaderUrl}" class="btn-read" style="flex:1;min-width:80px;text-align:center;background:#10b981;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;">📖 Read Bonus</a>
                                ${bHasAudio ? `<a href="${bReaderUrl}&audio=1" class="btn-audio" style="flex:1;min-width:75px;padding:8px;background:linear-gradient(135deg, #7c3aed, #6366f1);color:#fff;text-align:center;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;" title="ऑडियो सुनें">🎧 ऑडियो</a>` : ''}
                                ${bVideos.length > 0 ? `<button type="button" onclick='window.openBookVideoModal("${bTitle}", ${JSON.stringify(bVideos)})' class="btn-video" style="flex:1;min-width:75px;padding:8px;background:#ef4444;color:#fff;text-align:center;border-radius:8px;font-weight:700;border:none;cursor:pointer;font-size:0.82rem;" title="वीडियो देखें">🎬 वीडियो</button>` : ''}
                                ${bPdf ? `<a href="${bPdf}" download target="_blank" class="btn-buy" style="flex:1;min-width:75px;padding:8px;background:#E86A17;color:#fff;text-align:center;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;" title="बोनस PDF डाउनलोड करें">📥 PDF</a>` : ''}
                            </div>
                        `;
                        bonusGrid.appendChild(bonusCard);
                    }
                });
            }
        }

        // 2. Available Books (All live active published main books)
        const isLiveAgri = !isComingSoonBook && !isStudioDemo && !isStudioBonus && (book.status === 'active' || rawId === 'BK001' || rawId === 'BK002' || rawId === 'BK006' || rawId === 'BK015' || rawId === 'SUB001');
        if (isLiveAgri && !seenAvailableIds.has(rawId)) {
            seenAvailableIds.add(rawId);
            let targetUrl = book.landingPage || (rawId === 'SUB001' ? '/subscription.html' : (rawId === 'BK001' ? '/ebooks/kharif-master-guide-2026.html' : (rawId === 'BK002' ? '/ebooks/kheti-dr.html' : `/ebooks/book-landing.html?id=${bookId}`)));

            if (window.renderUniversalBookMarketingCard && typeof window.renderUniversalBookMarketingCard === 'function') {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = window.renderUniversalBookMarketingCard(book);
                if (availableGrid && tempDiv.firstElementChild) availableGrid.appendChild(tempDiv.firstElementChild);
            } else {
                const availCard = document.createElement('div');
                availCard.className = 'book-card';

                availCard.innerHTML = `
                    <div style="cursor:pointer;position:relative;" onclick="window.location.href='${targetUrl}'" title="क्लिक करके मुख्य विवरण देखें">
                        <img src="${bookCover}" alt="${bookName}" style="cursor:pointer;">
                        ${hasAudioBook ? '<span style="position:absolute; bottom:8px; left:8px; background:linear-gradient(135deg, #8b5cf6, #6366f1); color:#fff; font-size:0.68rem; font-weight:800; padding:3px 8px; border-radius:6px; box-shadow:0 2px 6px rgba(0,0,0,0.3);">🎧 ऑडियो उपलब्ध</span>' : ''}
                    </div>
                    <h4 style="cursor:pointer;" onclick="window.location.href='${targetUrl}'">${bookName}</h4>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;">
                        <span style="font-weight:800;color:#138A36;font-size:1.05rem;">₹${book.offerPrice || 99}</span>
                        <span style="text-decoration:line-through;color:#94a3b8;font-size:0.85rem;">₹${book.mrp || 299}</span>
                    </div>
                    <div class="book-btn-group" style="margin-top: 6px; display:flex; gap:6px;">
                        <a href="${targetUrl}" class="btn-available" style="flex:1;text-align:center;display:block;padding:9px;background:#E86A17;color:#fff;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.85rem;">Buy Now / Details</a>
                        ${hasAudioBook ? `<a href="/ebooks/reader.html?book=${bookId}&audio=1" class="btn-audio" style="min-width:75px;padding:9px;background:linear-gradient(135deg, #7c3aed, #6366f1);color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.85rem;" title="ऑडियो बुक सुनें">🎧 ऑडियो</a>` : ''}
                    </div>
                `;
                if (availableGrid) availableGrid.appendChild(availCard);
            }
        }

        // 3. Demo Books (Read Free Samples from Studio - Visible to All Users)
        const isDemoEligible = !isComingSoonBook && isStudioDemo;
        if (isDemoEligible && !seenDemoIds.has(rawId)) {
            seenDemoIds.add(rawId);
            demoCount++;
            const demoCard = document.createElement('div');
            demoCard.className = 'book-card';
            const targetMain = book.targetMainBook || 'BK001';
            const targetCheckoutUrl = `/ebooks/checkout.html?product=${encodeURIComponent(targetMain)}`;
            const readerDemoUrl = `/ebooks/reader.html?book=${encodeURIComponent(bookId)}&demo=1`;
            const demoPdfPath = book.demoPdf || book.freePdf || book.pdf_url || '';

            demoCard.innerHTML = `
                <div style="position:relative;">
                    <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                    <span style="position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#2563eb,#38bdf8);color:#fff;font-size:0.7rem;font-weight:800;padding:3px 8px;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">📖 FREE DEMO</span>
                </div>
                <h4>${bookName}</h4>
                <div class="book-btn-group" style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
                    <a href="${readerDemoUrl}" class="btn-read" style="flex:1;min-width:80px;padding:8px;background:#0284c7;color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.82rem;">📖 Read Demo</a>
                    ${hasAudioBook ? `<a href="${readerDemoUrl}&audio=1" class="btn-audio" style="flex:1;min-width:75px;padding:8px;background:linear-gradient(135deg, #7c3aed, #6366f1);color:#fff;text-align:center;border-radius:10px;font-weight:700;text-decoration:none;font-size:0.82rem;" title="ऑडियो डेमो सुनें">🎧 ऑडियो</a>` : ''}
                    ${bookVideos.length > 0 ? `<button type="button" onclick='window.openBookVideoModal("${bookName}", ${JSON.stringify(bookVideos)})' class="btn-video" style="flex:1;min-width:75px;padding:8px;background:#ef4444;color:#fff;text-align:center;border-radius:10px;font-weight:700;border:none;cursor:pointer;font-size:0.82rem;" title="वीडियो डेमो देखें">🎬 वीडियो</button>` : ''}
                </div>
                <div style="margin-top:10px;">
                    <a href="${targetCheckoutUrl}" style="display:block;text-align:center;background:linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);color:#ffffff;padding:12px 14px;border-radius:10px;font-weight:900;font-size:0.95rem;text-decoration:none;box-shadow:0 4px 14px rgba(220,38,38,0.45);border:1.5px solid #fca5a5;letter-spacing:0.3px;">
                        ⚡ पूरी मुख्य किताब खरीदें (मात्र ₹99) 🛒
                    </a>
                </div>
            `;
            if (demoGrid) demoGrid.appendChild(demoCard);
        }

        // 4. Free Bonus Books (From Studio - Audience Visibility Filter)
        if (isStudioBonus && !seenBonusIds.has(rawId)) {
            // Check visibility audience
            const aud = book.visibility_audience || book.audience || 'all';
            let isAllowed = true;
            if (aud === 'active_only') {
                isAllowed = purchasedCount > 0;
            } else if (aud === 'attached_books' && Array.isArray(book.target_main_books) && book.target_main_books.length > 0 && !book.target_main_books.includes('ALL')) {
                isAllowed = book.target_main_books.some(tb => activePurchasedBookIds.has(String(tb).toUpperCase()));
            } else if (book.targetMainBook && book.targetMainBook !== 'ALL' && aud === 'attached_books') {
                isAllowed = activePurchasedBookIds.has(String(book.targetMainBook).toUpperCase());
            }

            if (isAllowed) {
                seenBonusIds.add(rawId);
                bonusCount++;
                const freeBonusCard = document.createElement('div');
                freeBonusCard.className = 'book-card';
                freeBonusCard.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.05);display:flex;flex-direction:column;justify-content:space-between;';
                const readerBonusUrl = `/ebooks/reader.html?book=${encodeURIComponent(bookId)}&demo=1`;
                const bonusPdfPath = book.demoPdf || book.freePdf || book.pdf_url || '';

                freeBonusCard.innerHTML = `
                    <div>
                        <div style="text-align:center;margin-bottom:8px;">
                            <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" style="height:110px;width:auto;object-fit:contain;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,0.15);cursor:pointer;" />
                        </div>
                        <span style="background:#16a34a;color:#fff;font-size:0.68rem;font-weight:800;padding:2px 6px;border-radius:4px;display:inline-block;margin-bottom:4px;">🎁 100% FREE BONUS</span>
                        <h4 style="color:#065f46;margin:0 0 6px 0;font-size:0.95rem;">${bookName}</h4>
                        <p style="font-size:0.78rem;color:#64748b;margin-bottom:12px;">${book.subtitle || 'Aarogyam India डिजिटल लाइब्रेरी में मुफ़्त उपलब्ध।'}</p>
                    </div>
                    <div class="book-btn-group" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <a href="${readerBonusUrl}" class="btn-read" style="flex:1;min-width:80px;padding:8px;background:#10b981;color:#fff;text-align:center;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;">📖 Read Bonus</a>
                        ${hasAudioBook ? `<a href="${readerBonusUrl}&audio=1" class="btn-audio" style="flex:1;min-width:75px;padding:8px;background:linear-gradient(135deg, #7c3aed, #6366f1);color:#fff;text-align:center;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;" title="ऑडियो सुनें">🎧 ऑडियो</a>` : ''}
                        ${bonusPdfPath ? `<a href="${bonusPdfPath}" download target="_blank" class="btn-buy" style="flex:1;min-width:75px;padding:8px;background:#E86A17;color:#fff;text-align:center;border-radius:8px;font-weight:700;text-decoration:none;font-size:0.82rem;" title="PDF डाउनलोड करें">📥 डाउनलोड</a>` : ''}
                        ${bookVideos.length > 0 ? `<button type="button" onclick='window.openBookVideoModal("${bookName}", ${JSON.stringify(bookVideos)})' class="btn-video" style="flex:1;min-width:75px;padding:8px;background:#ef4444;color:#fff;text-align:center;border-radius:8px;font-weight:700;border:none;cursor:pointer;font-size:0.82rem;" title="वीडियो देखें">🎬 वीडियो</button>` : ''}
                    </div>
                `;
                if (bonusGrid) bonusGrid.appendChild(freeBonusCard);
            }
        }

        // 5. Coming Soon Books (All 11 unreleased books)
        if (isComingSoonBook && !seenComingSoonIds.has(rawId)) {
            seenComingSoonIds.add(rawId);
            const comingCard = document.createElement('div');
            comingCard.className = 'book-card';
            comingCard.innerHTML = `
                <div style="position: relative;">
                    <img src="${bookCover}" alt="${bookName}" onclick="openImageZoom('${bookCover}')" title="क्लिक करके फुल-स्क्रीन देखें">
                    <span style="position: absolute; top: 8px; right: 8px; cursor:pointer; font-size:1.2rem;" onclick="toggleWishlist(this, '${bookName}')" class="wishlist-heart">❤️</span>
                </div>
                <h4>${bookName}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 0 4px;">
                    <span style="font-size: 0.75rem; color: #E86A17; font-weight: 700; background:#fdf2e9; padding:4px 8px; border-radius:6px;">Coming Soon</span>
                    <a href="javascript:void(0)" onclick="alert('✅ आपकी रुचि दर्ज कर ली गई है। पुस्तक लाइव होने पर आपको सूचित किया जाएगा।')" style="padding: 6px 12px; font-size: 0.75rem; background:#138A36; color:#fff; border-radius:10px; text-decoration:none; font-weight:700;">Notify Me</a>
                </div>
            `;
            if (comingSoonGrid) comingSoonGrid.appendChild(comingCard);
        }
    });

    // Default General Bonus Cards: fallback if no studio bonus books exist and user has purchases
    if (bonusGrid && bonusCount === 0 && purchasedCount > 0) {
        bonusCount = 2;
        const genBonusCard1 = document.createElement('div');
        genBonusCard1.className = 'book-card';
        genBonusCard1.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #10b981;box-shadow:0 4px 12px rgba(0,0,0,0.05);';
        genBonusCard1.innerHTML = `
            <div style="font-size:2.2rem;text-align:center;margin-bottom:8px;">🌿</div>
            <h4 style="color:#065f46;margin-bottom:6px;">ऑर्गेनिक स्प्रे एवं फसल सुरक्षा फॉर्मूला</h4>
            <p style="font-size:0.8rem;color:#64748b;margin-bottom:12px;line-height:1.4;">घर पर प्राकृतिक कीटनाशक और टॉनिक बनाने की सम्पूर्ण विधि।</p>
            <a href="/ebooks/reader.html?book=BK001&demo=1" style="display:block;text-align:center;background:#10b981;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;">📖 बोनस सामग्री पढ़ें</a>
        `;
        bonusGrid.appendChild(genBonusCard1);

        const genBonusCard2 = document.createElement('div');
        genBonusCard2.className = 'book-card';
        genBonusCard2.style.cssText = 'background:#fff;border-radius:12px;padding:14px;border:1.5px solid #f59e0b;box-shadow:0 4px 12px rgba(0,0,0,0.05);';
        genBonusCard2.innerHTML = `
            <div style="font-size:2.2rem;text-align:center;margin-bottom:8px;">💻</div>
            <h4 style="color:#92400e;margin-bottom:6px;">AI वेबसाइट एवं डिजिटल टूल्स चीटशीट</h4>
            <p style="font-size:0.8rem;color:#64748b;margin-bottom:12px;line-height:1.4;">10 उपयोगी AI टूल्स व प्रॉम्प्ट्स का विशेष गाइड।</p>
            <a href="/ebooks/reader.html?book=BK001&demo=1" style="display:block;text-align:center;background:#f59e0b;color:#fff;padding:8px;border-radius:8px;font-weight:700;text-decoration:none;">📖 बोनस सामग्री पढ़ें</a>
        `;
        bonusGrid.appendChild(genBonusCard2);
    } else if (bonusGrid && bonusCount === 0 && purchasedCount === 0) {
        bonusGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">
                <p style="font-size: 0.95rem; font-weight: 700; color:#1e293b;">🎁 अभी कोई मुफ़्त बोनस अनलॉक नहीं है।</p>
                <p style="font-size: 0.82rem; margin-top: 6px; color:#64748b;">लाइब्रेरी की किसी भी ई-बुक खरीद के साथ विशेष VIP बोनस सामग्री अपने आप अनलॉक हो जाती है।</p>
            </div>
        `;
    }

    // Update Welcome Card Stats
    updateWelcomeStatsCounts(purchasedCount, bonusCount, wishlistCount, demoCount, audioCount, seenAvailableIds.size);

    if (demoCount === 0 && demoGrid) {
        demoGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #666; background:#fff; border-radius:12px; border:1px dashed #cbd5e1;">
                <p style="font-size: 0.95rem; font-weight: 700; color:#1e293b;">📖 अभी कोई डेमो पुस्तक नहीं है।</p>
                <p style="font-size: 0.82rem; margin-top: 6px; color:#64748b;">कृपया 'उपलब्ध बुक्स (AVAILABLE)' टैब से मुख्य पुस्तकें देखें।</p>
            </div>
        `;
    }

    if (purchasedCount === 0 && purchasedGrid) {
        purchasedGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 30px; color: #666; background:linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); border-radius:16px; border:1.5px dashed #86efac; box-shadow:0 4px 14px rgba(0,0,0,0.03);">
                <div style="font-size: 2.2rem; margin-bottom: 8px;">📚</div>
                <p style="font-size: 1.05rem; font-weight: 800; color:#1e293b;">आपकी डिजिटल लाइब्रेरी सुरक्षित है!</p>
                <p style="font-size: 0.86rem; margin-top: 6px; color:#475569; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                    आपकी कोई भी खरीदी गई ई-बुक यहाँ जीवनभर उपलब्ध रहेगी। नई पुस्तकें देखने और पढ़ने के लिए <strong>'उपलब्ध बुक्स'</strong> टैब देखें।
                </p>
                <button onclick="switchTab('available')" style="margin-top:14px; background:linear-gradient(135deg, #E86A17 0%, #ea580c 100%); color:#fff; border:none; padding:10px 22px; border-radius:10px; font-weight:800; font-size: 0.92rem; cursor:pointer; box-shadow:0 4px 14px rgba(232,106,23,0.35);">
                    🛍️ उपलब्ध पुस्तकें देखें (${seenAvailableIds.size} बुक्स)
                </button>
            </div>
        `;
    }
}

// वेलकम कार्ड के काउंट्स को वास्तविक वैल्यू से अपडेट करने का फंक्शन
function updateWelcomeStatsCounts(purchased, bonus, wishlist, demo, audio, available) {
    const kpiAvailable = document.getElementById('kpiAvailableCount');
    if (kpiAvailable) kpiAvailable.textContent = available || 0;

    const kpiPurchased = document.getElementById('kpiPurchasedCount');
    if (kpiPurchased) kpiPurchased.textContent = purchased || 0;

    const kpiBonus = document.getElementById('kpiBonusCount');
    if (kpiBonus) kpiBonus.textContent = bonus || 0;

    const kpiWeather = document.getElementById('kpiWeatherValue');
    if (kpiWeather) kpiWeather.textContent = 'लाइव';

    const kpiInstall = document.getElementById('kpiInstallAppValue');
    if (kpiInstall) kpiInstall.textContent = 'इंस्टॉल';

    const kpiTube = document.getElementById('kpiTubeCount');
    if (kpiTube) kpiTube.textContent = '100+';

    const kpiDemo = document.getElementById('kpiDemoCount');
    if (kpiDemo) kpiDemo.textContent = demo || 0;

    const kpiAudio = document.getElementById('kpiAudioCount');
    if (kpiAudio) kpiAudio.textContent = audio || 0;

    const kpiWishlist = document.getElementById('kpiWishlistCount');
    if (kpiWishlist) kpiWishlist.textContent = wishlist || 0;
}

// 10. Wishlist Heart Toggle
function toggleWishlist(element, bookName) {
    element.classList.toggle('active');
    let wishlist = JSON.parse(localStorage.getItem('AI_WISHLIST') || '[]');
    if (element.classList.contains('active')) {
        if (!wishlist.includes(bookName)) wishlist.push(bookName);
        alert(bookName + ' को आपकी Wishlist में जोड़ दिया गया है!');
    } else {
        wishlist = wishlist.filter(item => item !== bookName);
        alert(bookName + ' को Wishlist से हटा दिया गया है।');
    }
    localStorage.setItem('AI_WISHLIST', JSON.stringify(wishlist));
}

// 11. बधाई हो! सक्सेस पॉपअप
function showCongratulationsPopup() {
    let pop = document.getElementById('congratsPopup');
    if (!pop) {
        pop = document.createElement('div');
        pop.id = 'congratsPopup';
        pop.className = 'modal-overlay show';
        pop.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999999;display:flex;justify-content:center;align-items:center;";
        pop.innerHTML = `
            <div class="modal-card" style="background:#fff;padding:30px;border-radius:24px;text-align:center;max-width:400px;width:90%;">
                <h3 style="color: #138A36; font-size: 1.4rem; margin-bottom: 10px;">🎉 बधाई हो!</h3>
                <p style="font-size: 0.95rem; color: #333; line-height: 1.5; margin-bottom: 20px;">
                    आपने सफलतापूर्वक ई-बुक प्राप्त कर ली है, जिसे आप <b>लाइफटाइम (जीवनभर)</b> पढ़ सकते हैं! यह आपकी 'My Library' में जोड़ दी गई है।
                </p>
                <button onclick="document.getElementById('congratsPopup').remove(); window.location.reload();" style="width:100%;padding:12px;background:#138A36;color:#fff;border:none;border-radius:14px;font-weight:700;font-size:1rem;cursor:pointer;">ठीक है (OK)</button>
            </div>
        `;
        document.body.appendChild(pop);
    }
}

// 12. Direct Native PDF Downloader & Zero-Egress Client-Side PDF Assembler

// Progress overlay for PDF generation
function showPdfProgress(current, total, msg) {
    let overlay = document.getElementById('aim_pdf_progress_overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'aim_pdf_progress_overlay';
        overlay.style.cssText = `
            position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:99999;
            display:flex; flex-direction:column; align-items:center; justify-content:center;
            font-family:sans-serif; color:#fff; text-align:center; padding:20px;
        `;
        overlay.innerHTML = `
            <div style="background:#1a1a2e;border-radius:16px;padding:32px 28px;max-width:320px;width:100%;box-shadow:0 8px 40px rgba(0,0,0,0.5);">
                <div style="font-size:2.2rem;margin-bottom:12px;">📄</div>
                <div id="aim_pdf_msg" style="font-size:1rem;font-weight:600;margin-bottom:16px;"></div>
                <div style="background:#333;border-radius:8px;height:12px;overflow:hidden;margin-bottom:10px;">
                    <div id="aim_pdf_bar" style="height:100%;background:linear-gradient(90deg,#f97316,#ef4444);border-radius:8px;transition:width 0.3s;width:0%;"></div>
                </div>
                <div id="aim_pdf_count" style="font-size:0.8rem;color:#aaa;"></div>
                <div style="font-size:0.72rem;color:#888;margin-top:10px;">📵 फोन स्क्रीन बंद न करें</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    const bar = document.getElementById('aim_pdf_bar');
    const msgEl = document.getElementById('aim_pdf_msg');
    const countEl = document.getElementById('aim_pdf_count');
    if (bar && total > 0) bar.style.width = Math.round((current / total) * 100) + '%';
    if (msgEl) msgEl.textContent = msg || 'PDF बन रहा है...';
    if (countEl && total > 0) countEl.textContent = `पेज ${current} / ${total} प्रोसेस हो रहे हैं`;
}

function hidePdfProgress() {
    const overlay = document.getElementById('aim_pdf_progress_overlay');
    if (overlay) overlay.remove();
}

async function loadJsPdfLibrary() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    // Try primary CDN, then fallback
    const cdnList = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ];
    for (const src of cdnList) {
        try {
            await new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => (window.jspdf && window.jspdf.jsPDF) ? resolve() : reject();
                s.onerror = reject;
                document.head.appendChild(s);
            });
            if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
        } catch(e) {}
    }
    throw new Error('jsPDF library load failed from all CDNs');
}

// Convert any image blob to JPEG data URL using an in-memory Canvas (jsPDF requires JPEG or PNG)
function convertBlobToJpegDataUrl(blob) {
    return new Promise((resolve) => {
        if (!blob) return resolve(null);
        const img = new Image();
        const objUrl = URL.createObjectURL(blob);
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 800;
                canvas.height = img.naturalHeight || 1200;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const jpeg = canvas.toDataURL('image/jpeg', 0.85);
                URL.revokeObjectURL(objUrl);
                resolve(jpeg);
            } catch(e) {
                URL.revokeObjectURL(objUrl);
                resolve(null);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(objUrl);
            resolve(null);
        };
        img.src = objUrl;
    });
}

async function assembleClientPdfFromImages(cleanId, cleanTitle, hintTotalPages = 0) {
    showPdfProgress(0, 1, 'PDF engine लोड हो रहा है...');
    try {
        const jsPDF = await loadJsPdfLibrary();

        // ── Step A: Resolve page image URLs
        showPdfProgress(0, 1, 'पेज लिस्ट तैयार की जा रही है...');
        let totalPages = hintTotalPages > 0 ? hintTotalPages : 0;
        
        // If no hint, probe count
        if (totalPages <= 0) {
            for (let n = 1; n <= 300; n++) {
                const testUrls = [`/images/books/${cleanId}/${n}.webp`, `../images/books/${cleanId}/${n}.webp`];
                let found = false;
                for (const u of testUrls) {
                    try {
                        const r = await fetch(u, { method: 'HEAD' }).catch(() => ({ ok: false }));
                        if (r.ok) { found = true; break; }
                    } catch(e) {}
                }
                if (found) { totalPages = n; }
                else { break; }
            }
        }

        if (totalPages <= 0) {
            hidePdfProgress();
            return false;
        }

        const pageUrls = [];
        for (let i = 1; i <= totalPages; i++) {
            pageUrls.push(`/images/books/${cleanId}/${i}.webp`);
        }

        showPdfProgress(0, totalPages, `${totalPages} पेज मिले, PDF बनना शुरू...`);

        // ── Step B: Fetch images in batches of 4, convert to JPEG canvas, add to jsPDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const W = 210, H = 297;
        const BATCH = 4;
        let processedCount = 0;

        for (let i = 0; i < pageUrls.length; i += BATCH) {
            const batchUrls = pageUrls.slice(i, i + BATCH);

            const blobs = await Promise.all(
                batchUrls.map(url =>
                    fetch(url)
                        .then(r => r.ok ? r.blob() : fetch(`..${url}`).then(r2 => r2.ok ? r2.blob() : null))
                        .catch(() => null)
                )
            );

            for (let j = 0; j < blobs.length; j++) {
                const blob = blobs[j];
                if (!blob) continue;
                const jpegDataUrl = await convertBlobToJpegDataUrl(blob);
                if (!jpegDataUrl) continue;

                if (processedCount > 0) doc.addPage('a4', 'portrait');
                doc.addImage(jpegDataUrl, 'JPEG', 0, 0, W, H, undefined, 'FAST');
                processedCount++;
                showPdfProgress(processedCount, totalPages, 'PDF बन रहा है...');
            }
        }

        if (processedCount === 0) {
            hidePdfProgress();
            return false;
        }

        showPdfProgress(totalPages, totalPages, 'PDF सेव हो रही है...');
        doc.save(`${cleanId}_${cleanTitle}.pdf`);
        hidePdfProgress();
        return true;

    } catch(e) {
        console.error('PDF Assembly error:', e);
        hidePdfProgress();
        return false;
    }
}

window.downloadBookPdf = function(bookId, bookTitle, directPdfPath, totalPagesHint = 0) {
    const cleanId = (bookId || '').toUpperCase().trim();
    if (!cleanId) return;
    window.location.href = `/ebooks/download.html?book=${encodeURIComponent(cleanId)}`;
};

// =========================================================================
// 13. INTERACTIVE TAB HELPERS & AUDIO FILTER
// =========================================================================
window.filterOrSwitchAudioBooks = function() {
    if (typeof switchTab === 'function') switchTab('purchased');
    setTimeout(() => {
        const audioButtons = document.querySelectorAll('#purchasedBooksGrid .btn-audio, #availableBooksGrid .btn-audio');
        if (audioButtons.length > 0) {
            audioButtons[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            switchTab('available');
        }
    }, 100);
};

window.dismissLibraryPwaCard = function() {
    const card = document.getElementById('library-pwa-card');
    if (card) {
        card.style.display = 'none';
        sessionStorage.setItem('aim_pwa_banner_dismissed', 'true');
    }
};

// =========================================================================
// 14. LIVE WEATHER ENGINE WITH GPS & ZERO-EGRESS CACHING
// =========================================================================
const DISTRICT_COORDS = {
    'rewa': { name: 'रीवा (Rewa)', state: 'मध्य प्रदेश', lat: 24.5362, lon: 81.3038 },
    'indore': { name: 'इंदौर (Indore)', state: 'मध्य प्रदेश', lat: 22.7196, lon: 75.8577 },
    'bhopal': { name: 'भोपाल (Bhopal)', state: 'मध्य प्रदेश', lat: 23.2599, lon: 77.4126 },
    'ujjain': { name: 'उज्जैन (Ujjain)', state: 'मध्य प्रदेश', lat: 23.1765, lon: 75.7885 },
    'jabalpur': { name: 'जबलपुर (Jabalpur)', state: 'मध्य प्रदेश', lat: 23.1815, lon: 79.9864 },
    'satna': { name: 'सतना (Satna)', state: 'मध्य प्रदेश', lat: 24.5804, lon: 80.8293 },
    'varanasi': { name: 'वाराणसी (Varanasi)', state: 'उत्तर प्रदेश', lat: 25.3176, lon: 82.9739 },
    'lucknow': { name: 'लखनऊ (Lucknow)', state: 'उत्तर प्रदेश', lat: 26.8467, lon: 80.9462 },
    'patna': { name: 'पटना (Patna)', state: 'बिहार', lat: 25.5941, lon: 85.1376 },
    'jaipur': { name: 'जयपुर (Jaipur)', state: 'राजस्थान', lat: 26.9124, lon: 75.7873 }
};

const WMO_ICONS = {
    0: { desc: 'साफ आसमान (Clear Sky)', icon: '☀️' },
    1: { desc: 'मुख्यतः साफ (Mainly Clear)', icon: '🌤️' },
    2: { desc: 'हल्के बादल (Partly Cloudy)', icon: '⛅' },
    3: { desc: 'घने बादल (Overcast)', icon: '☁️' },
    45: { desc: 'कोहरा (Foggy)', icon: '🌫️' },
    51: { desc: 'हल्की बूंदाबांदी', icon: '🌦️' },
    61: { desc: 'हल्की बारिश (Light Rain)', icon: '🌧️' },
    63: { desc: 'मध्यम बारिश (Moderate Rain)', icon: '🌧️' },
    65: { desc: 'भारी बारिश (Heavy Rain)', icon: '⛈️' },
    80: { desc: 'बारिश बौछार (Showers)', icon: '🌦️' },
    95: { desc: 'गरज-चमक बारिश (Thunderstorm)', icon: '⚡⛈️' }
};

window.fetchAndRenderLibraryWeather = async function(lat, lon, cityName, stateName) {
    try {
        const tempEl = document.getElementById('displayTemp');
        const cityEl = document.getElementById('displayCityName');
        const countryEl = document.getElementById('displayCountry');
        const condEl = document.getElementById('displayCondition');
        const iconEmojiEl = document.getElementById('weatherIconEmoji');
        const rainWindEl = document.getElementById('displayRainWind');

        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&timezone=auto`;
        const res = await fetch(apiUrl);
        if (!res.ok) return;
        const data = await res.json();
        const cur = data.current || {};
        const daily = data.daily || {};

        const temp = Math.round(cur.temperature_2m || 28);
        const humidity = cur.relative_humidity_2m || 45;
        const wind = Math.round(cur.wind_speed_10m || 10);
        const code = cur.weather_code || 0;
        const rainChance = (daily.precipitation_probability_max && daily.precipitation_probability_max[0]) || 0;
        const wInfo = WMO_ICONS[code] || { desc: 'साफ मौसम', icon: '🌤️' };

        if (tempEl) tempEl.textContent = `${temp}°C`;
        if (cityEl) cityEl.textContent = cityName;
        if (countryEl) countryEl.textContent = `${stateName} • Live`;
        if (condEl) condEl.textContent = wInfo.desc;
        if (iconEmojiEl) iconEmojiEl.textContent = wInfo.icon;
        if (rainWindEl) rainWindEl.textContent = `नमी: ${humidity}% • हवा: ${wind} km/h • बारिश: ${rainChance}%`;
    } catch(e) {
        console.warn('Weather fetch warning:', e);
    }
};

// =========================================================================
// 14. WEATHER GPS & LOCATION ENGINE (NO-FAIL SMART GEOLOCATION)
// =========================================================================
window.detectUserLiveLocationWeather = function() {
    const gpsBtn = document.getElementById('weatherGpsBtn');
    if (gpsBtn) gpsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>स्थान खोज रहे हैं...</span>';

    // Smart Fallback via IP Geolocation (Zero Permission Needed, 100% Reliable on Mobile / PWA)
    async function fallbackToIpWeather() {
        let lat = null, lon = null, cityName = 'आपका क्षेत्र', stateName = 'लाइव मौसम';
        
        try {
            // Source 1: ipapi.co
            const r1 = await fetch('https://ipapi.co/json/');
            if (r1.ok) {
                const d1 = await r1.json();
                if (d1.latitude && d1.longitude) {
                    lat = d1.latitude;
                    lon = d1.longitude;
                    cityName = d1.city || d1.region || 'स्थानीय क्षेत्र';
                    stateName = d1.region || 'भारत';
                }
            }
        } catch(e) {}

        if (!lat) {
            try {
                // Source 2: bigdatacloud client info
                const r2 = await fetch('https://api.bigdatacloud.net/data/client-info');
                if (r2.ok) {
                    const d2 = await r2.json();
                    if (d2.location && d2.location.latitude) {
                        lat = d2.location.latitude;
                        lon = d2.location.longitude;
                        cityName = d2.location.city || d2.location.principalSubdivision || 'स्थानीय क्षेत्र';
                        stateName = d2.location.principalSubdivision || 'भारत';
                    }
                }
            } catch(e) {}
        }

        // Final Default: Rewa
        if (!lat) {
            lat = 24.5362;
            lon = 81.3037;
            cityName = 'रीवा';
            stateName = 'मध्य प्रदेश';
        }

        await window.fetchAndRenderLibraryWeather(lat, lon, cityName, stateName);
        if (gpsBtn) gpsBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>📍 ' + cityName + '</span>';
    }

    if (!navigator.geolocation) {
        fallbackToIpWeather();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            let cityName = 'मेरी लाइव लोकेशन';
            let stateName = 'GPS डिटेक्टेड';

            try {
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=hi`);
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData.locality || geoData.city) cityName = geoData.locality || geoData.city;
                    if (geoData.principalSubdivision) stateName = geoData.principalSubdivision;
                }
            } catch(e) {}

            await window.fetchAndRenderLibraryWeather(lat, lon, cityName, stateName);
            if (gpsBtn) gpsBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>📍 ' + cityName + '</span>';
        },
        (err) => {
            console.warn('GPS permission denied or unavailable, using smart IP fallback:', err);
            fallbackToIpWeather();
        },
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    );
};

window.searchCityWeather = function() {
    const input = document.getElementById('citySearchInput');
    if (!input || !input.value.trim()) return;
    const q = input.value.trim().toLowerCase();
    const match = DISTRICT_COORDS[q] || Object.values(DISTRICT_COORDS).find(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q));
    if (match) {
        window.fetchAndRenderLibraryWeather(match.lat, match.lon, match.name, match.state);
    } else {
        fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=hi&format=json`)
            .then(r => r.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const res = data.results[0];
                    window.fetchAndRenderLibraryWeather(res.latitude, res.longitude, res.name, res.admin1 || 'India');
                } else {
                    alert('शहर नहीं मिला। कृपया पुनः प्रयास करें।');
                }
            })
            .catch(() => alert('मौसम खोजने में त्रुटि।'));
    }
};

// =========================================================================
// 15. PRO HEADER AUDIO GUIDE & BACKGROUND AUDIO ENGINE (लाइब्रेरी ऑडियो गाइड)
// =========================================================================
function initLibraryAudioGuide() {
    const headerBtn = document.getElementById('headerAudioGuideBtn');
    const headerBtnText = document.getElementById('headerAudioGuideText');
    const floatBtn = document.getElementById('libraryAudioGuideFloatBtn');
    const guideBar = document.getElementById('libraryAudioGuideBar');
    const playBtn = document.getElementById('libGuidePlayBtn');
    const muteBtn = document.getElementById('libGuideMuteBtn');
    const closeBtn = document.getElementById('libGuideCloseBtn');
    const statusText = document.getElementById('libGuideStatus');

    // Sub-Header Dedicated Play Button Elements
    const subBtn = document.getElementById('subHeaderPlayBtn');
    const subIcon = document.getElementById('subHeaderPlayIcon');
    const subText = document.getElementById('subHeaderPlayText');
    const subStatus = document.getElementById('subAudioStatusText');

    let isPlaying = false;
    let isMuted = false;
    let synth = window.speechSynthesis || null;
    let currentUtterance = null;
    let wakeLockObj = null;
    let silentKeepAliveAudio = null;
    let currentPlaySessionId = 0;

    let guideAudioElement = new Audio();
    guideAudioElement.preload = 'auto';
    let guideChunks = [];
    let currentChunkIdx = 0;

    // Load default weather on startup
    const defaultCity = DISTRICT_COORDS['rewa'];
    if (defaultCity && typeof window.fetchAndRenderLibraryWeather === 'function') {
        window.fetchAndRenderLibraryWeather(defaultCity.lat, defaultCity.lon, defaultCity.name, defaultCity.state);
    }

    // Initialize Background Silent Audio Anchor
    function startSilentKeepAlive() {
        try {
            if (!silentKeepAliveAudio) {
                silentKeepAliveAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
                silentKeepAliveAudio.loop = true;
                silentKeepAliveAudio.volume = 0.01;
            }
            silentKeepAliveAudio.play().catch(() => {});
        } catch(e) {}
    }

    function stopSilentKeepAlive() {
        if (silentKeepAliveAudio) {
            try { silentKeepAliveAudio.pause(); } catch(e) {}
        }
    }

    // WakeLock for preventing screen sleep during guide
    async function acquireWakeLock() {
        try {
            const nav = typeof navigator !== 'undefined' ? navigator : null;
            if (nav && 'wakeLock' in nav && !wakeLockObj) {
                wakeLockObj = await nav.wakeLock.request('screen');
                if (wakeLockObj) {
                    wakeLockObj.addEventListener('release', () => { wakeLockObj = null; });
                }
            }
        } catch(e) {}
    }

    function releaseWakeLock() {
        if (wakeLockObj) {
            try { wakeLockObj.release(); } catch(e) {}
            wakeLockObj = null;
        }
    }

    // MediaSession setup for Lock Screen Controls (Type-Safe for all IDEs)
    function setupMediaSession() {
        const nav = typeof navigator !== 'undefined' ? navigator : null;
        if (!nav || !('mediaSession' in nav) || !nav.mediaSession) return;
        try {
            const ms = nav.mediaSession;
            const MetaClass = window.MediaMetadata || (typeof globalThis !== 'undefined' ? globalThis.MediaMetadata : null);
            if (MetaClass) {
                ms.metadata = new MetaClass({
                    title: 'डिजिटल लाइब्रेरी ऑडियो गाइड',
                    artist: 'आरोग्यम इंडिया (Aarogyam India)',
                    album: 'स्मार्ट किसान नॉलेज हब',
                    artwork: [
                        { src: '/images/logo/logo.png', sizes: '512x512', type: 'image/png' }
                    ]
                });
            }
            const bindAction = (actionName, fn) => {
                try {
                    if (typeof ms.setActionHandler === 'function') {
                        ms.setActionHandler(actionName, fn);
                    }
                } catch(err) {}
            };
            bindAction('play', () => { if (typeof toggleGuide === 'function') toggleGuide(); });
            bindAction('pause', () => { if (typeof toggleGuide === 'function') toggleGuide(); });
            bindAction('stop', () => { if (typeof toggleGuide === 'function') toggleGuide(); });
        } catch(e) {}
    }

    function getHindiSpeechText() {
        const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        const userName = storedUser.full_name || storedUser.name || 'किसान साथी';
        return `नमस्ते ${userName} जी! Aarogyam India डिजिटल लाइब्रेरी में आपका हार्दिक स्वागत है।

यहाँ 'मेरी पुस्तकें' टैब में आपकी खरीदी गई सभी ई-बुक्स सुरक्षित हैं, जिन्हें आप 'Read' बटन से पढ़ सकते हैं और 'Audio' बटन से सुन सकते हैं।

'उपलब्ध बुक्स' टैब में सभी नई कृषि पुस्तकें उपलब्ध हैं—किसी भी पुस्तक के कवर पर क्लिक करके आप उसका संपूर्ण विवरण देख सकते हैं और आसानी से खरीद सकते हैं।

'फ्री बोनस' और 'डेमो बुक्स' टैब में आप मुफ़्त सैंपल व बोनस सामग्री पढ़ सकते हैं।

नीचे मौसम केंद्र में 'GPS' बटन दबाकर आप अपने खेत या गांव का लाइव तापमान व मौसम तुरंत जान सकते हैं, और 7 दिनों के विस्तृत पूर्वानुमान के लिए 'Know More' बटन पर क्लिक करें।

'मंडी भाव' कार्ड पर क्लिक करके आप सभी फसलों के लाइव थोक बाजार भाव देख सकते हैं।

खेती की नई तकनीकों के 100 से ज्यादा वीडियो देखने के लिए 'Aarogyam Tube' पर जाएं।

और बिना फोन मेमोरी भरे कभी भी ऑफलाइन पढ़ने के लिए ऊपर दिए गए 'Install App' बटन से ऐप अपने फोन में जोड़ें।`;
    }

    function updateUiState(playing) {
        isPlaying = playing;
        if (headerBtn) {
            if (playing) {
                headerBtn.classList.add('is-playing');
                if (headerBtnText) headerBtnText.textContent = '⏸️ रोकें';
            } else {
                headerBtn.classList.remove('is-playing');
                if (headerBtnText) headerBtnText.textContent = '🔊 गाइड सुनें';
            }
        }
        if (subBtn) {
            if (playing) {
                subBtn.classList.add('is-playing');
                if (subIcon) subIcon.textContent = '⏸️';
                if (subText) subText.textContent = 'रोकें';
                if (subStatus) subStatus.textContent = '🎙️ ऑडियो गाइड चल रहा है (रोकने के लिए टैप करें)...';
            } else {
                subBtn.classList.remove('is-playing');
                if (subIcon) subIcon.textContent = '▶️';
                if (subText) subText.textContent = 'गाइड सुनें';
                if (subStatus) subStatus.textContent = 'लाइब्रेरी व पुस्तकों की जानकारी सुनें';
            }
        }
        if (playBtn) playBtn.textContent = playing ? '⏸️' : '▶️';
        if (statusText) statusText.textContent = playing ? 'ऑडियो गाइड चल रहा है...' : 'गाइड पुनः सुनने के लिए टैप करें';
        if (guideBar) {
            if (playing) guideBar.classList.add('playing');
            else guideBar.classList.remove('playing');
        }
    }

    let keepAliveTimer = null;

    function clearKeepAlive() {
        if (keepAliveTimer) {
            clearInterval(keepAliveTimer);
            keepAliveTimer = null;
        }
    }

    function startKeepAlive() {
        clearKeepAlive();
        keepAliveTimer = setInterval(() => {
            if (synth && synth.speaking) {
                try {
                    synth.pause();
                    synth.resume();
                } catch(e) {}
            } else {
                clearKeepAlive();
            }
        }, 10000);
    }

    function speakGuide() {
        if (!synth) synth = window.speechSynthesis || null;
        if (!synth) {
            alert('आपके ब्राउज़र में ऑडियो सपोर्ट उपलब्ध नहीं है।');
            return;
        }

        stopGuide();

        isPlaying = true;
        updateUiState(true);
        acquireWakeLock();
        startSilentKeepAlive();
        setupMediaSession();

        const fullText = getHindiSpeechText();
        currentUtterance = new SpeechSynthesisUtterance(fullText);
        currentUtterance.lang = 'hi-IN';
        currentUtterance.rate = 0.95;
        currentUtterance.pitch = 1.0;
        currentUtterance.volume = isMuted ? 0 : 1.0;

        // Select natural Hindi female voice if available
        try {
            const voices = synth.getVoices ? synth.getVoices() : [];
            const hindiVoice = voices.find(v => v.lang && (v.lang.includes('hi') || v.lang.includes('HI')));
            if (hindiVoice) currentUtterance.voice = hindiVoice;
        } catch(e) {}

        currentUtterance.onstart = () => {
            isPlaying = true;
            updateUiState(true);
            startKeepAlive();
        };

        currentUtterance.onend = () => {
            stopGuide();
        };

        currentUtterance.onerror = (e) => {
            // Ignore cancel / interrupted errors caused by user clicking stop
            if (e && e.error !== 'canceled' && e.error !== 'interrupted') {
                console.warn('Audio guide notice:', e);
            }
            stopGuide();
        };

        try {
            synth.speak(currentUtterance);
        } catch(err) {
            console.warn('Synth speak error:', err);
            stopGuide();
        }
    }

    function stopGuide() {
        isPlaying = false;
        clearKeepAlive();

        if (synth) {
            try {
                synth.cancel();
            } catch(e) {}
        }
        if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis) {
            try {
                window.speechSynthesis.cancel();
            } catch(e) {}
        }

        if (currentUtterance) {
            currentUtterance.onend = null;
            currentUtterance.onerror = null;
            currentUtterance.onstart = null;
            currentUtterance = null;
        }

        stopSilentKeepAlive();
        releaseWakeLock();
        updateUiState(false);
    }

    function toggleGuide() {
        const isCurrentlySpeaking = Boolean(
            isPlaying ||
            (synth && (synth.speaking || synth.pending)) ||
            (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
        );

        if (isCurrentlySpeaking) {
            stopGuide();
        } else {
            speakGuide();
        }
    }

    // Expose Single Master Handler globally
    window.toggleLibraryAudioGuide = function(e) {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        toggleGuide();
    };
    window.speakLibraryAudioGuide = speakGuide;
    window.stopLibraryAudioGuide = stopGuide;

    // Connect Legacy buttons if present
    if (floatBtn) {
        floatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleGuide();
        });
    }
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            toggleGuide();
        });
    }
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            muteBtn.textContent = isMuted ? '🔇' : '🔊';
            if (currentUtterance && isPlaying) {
                stopGuide();
                speakGuide();
            }
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            stopGuide();
            if (guideBar) guideBar.style.display = 'none';
        });
    }

    if (synth && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = () => {};
    }

    // Auto-attempt playback on load with fallback on first touch/click
    setTimeout(() => {
        try {
            if (!isPlaying) speakGuide();
        } catch(e) {}
    }, 600);

    const triggerAutoAudioOnFirstGesture = () => {
        if (!isPlaying && !(synth && synth.speaking)) {
            speakGuide();
        }
    };
    window.addEventListener('click', triggerAutoAudioOnFirstGesture, { once: true });
    window.addEventListener('touchstart', triggerAutoAudioOnFirstGesture, { once: true });
}

// =========================================================================
// APP INSTALL GUIDE MODAL & 30-SEC HINDI AUDIO TUTORIAL (Screenshot 1 Match)
// =========================================================================
let isAppInstallAudioPlaying = false;
let appInstallUtterance = null;

const APP_INSTALL_AUDIO_SCRIPT = 'Aarogyam App इंस्टॉल करें और बिना फोन मेमोरी भरे कभी भी किताबें पढ़ें, ज़ूम करें और ऑडियो सुनें। प्रिंट निकालने के लिए नीचे नीले बॉक्स में Full HD चुनें (3 बार मान्य)! ऐप इंस्टॉल करने के लिए नीचे दिए गए हरे बटन "फोन होम स्क्रीन पर ऐप जोड़ें" पर क्लिक करें!';

window.toggleAppInstallAudio = function() {
    const statusEl = document.getElementById('appInstallAudioStatus');
    const iconEl = document.getElementById('appInstallAudioIcon');
    const waves = document.getElementById('appInstallSoundWaves');

    if (isAppInstallAudioPlaying) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        isAppInstallAudioPlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (statusEl) statusEl.textContent = 'क्लिक करके लाइव हिंदी ऑडियो गाइडेंस सुनें';
        if (waves) waves.style.opacity = '0.3';
        return;
    }

    if (!('speechSynthesis' in window)) {
        alert('ऑडियो सपोर्ट आपके ब्राउज़र में उपलब्ध नहीं है। कृपया नीचे दिए गए स्टेप्स पढ़कर ऐप इंस्टॉल करें।');
        return;
    }

    window.speechSynthesis.cancel();
    appInstallUtterance = new SpeechSynthesisUtterance(APP_INSTALL_AUDIO_SCRIPT);
    appInstallUtterance.lang = 'hi-IN';
    appInstallUtterance.rate = 0.95;
    appInstallUtterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => (v.lang && (v.lang.includes('hi') || v.lang.includes('hi-IN'))) || (v.name && v.name.includes('Hindi')));
    if (hiVoice) appInstallUtterance.voice = hiVoice;

    appInstallUtterance.onstart = () => {
        isAppInstallAudioPlaying = true;
        if (iconEl) iconEl.className = 'fa-solid fa-pause';
        if (statusEl) statusEl.textContent = '🔊 गाइडेंस चल रही है... (रोकने के लिए दोबारा क्लिक करें)';
        if (waves) waves.style.opacity = '1';
    };

    appInstallUtterance.onend = () => {
        isAppInstallAudioPlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (statusEl) statusEl.textContent = 'गाइडेंस पूरी हुई। अब नीचे से ऐप इंस्टॉल करें!';
        if (waves) waves.style.opacity = '0.3';
    };

    appInstallUtterance.onerror = () => {
        isAppInstallAudioPlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (statusEl) statusEl.textContent = 'पुनः सुनने के लिए टैप करें';
        if (waves) waves.style.opacity = '0.3';
    };

    window.speechSynthesis.speak(appInstallUtterance);
};

window.openAppInstallGuideModal = function() {
    const modal = document.getElementById('appInstallGuideModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            try {
                if (!isAppInstallAudioPlaying) window.toggleAppInstallAudio();
            } catch(e) {}
        }, 400);
    }
};

window.closeAppInstallGuideModal = function() {
    const modal = document.getElementById('appInstallGuideModal');
    if (modal) {
        modal.style.display = 'none';
        if (isAppInstallAudioPlaying && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            isAppInstallAudioPlaying = false;
        }
    }
};

window.triggerAppInstallFromModal = function() {
    if (typeof window.triggerPwaInstall === 'function') {
        window.triggerPwaInstall();
    } else {
        alert('ऐप इंस्टॉल करने के लिए अपने ब्राउज़र मेन्यू (⋮) में जाकर "Add to Home screen" चुनें।');
    }
};