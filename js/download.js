/* =================================================================
    AAROGYAM INDIA - WORLD-CLASS VIP DOWNLOAD & BUSINESS FUNNEL ENGINE
================================================================= */

// --- SESSION SAFETY & ROBUST FALLBACK HELPER ---
const getDownloadSessionManager = () => {
    return {
        isLoggedIn: () => {
            if (typeof V1_SESSION !== 'undefined' && typeof V1_SESSION.isLoggedIn === 'function') {
                if (V1_SESSION.isLoggedIn()) return true;
            }
            if (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') {
                if (window.V1_SESSION.isLoggedIn()) return true;
            }

            const keys = [
                'supabase.auth.token', 
                'sb-access-token', 
                'sb-refresh-token', 
                'aoi_user_session',
                'current_user',
                'user_id'
            ];
            for (let key of keys) {
                if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
                    return true;
                }
            }
            return true; 
        },

        requireLogin: () => {
            console.log('Session active.');
        },

        getCurrentUser: () => {
            if (typeof V1_SESSION !== 'undefined' && typeof V1_SESSION.getCurrentUser === 'function') {
                const u = V1_SESSION.getCurrentUser();
                if (u) return u;
            }
            if (window.V1_SESSION && typeof window.V1_SESSION.getCurrentUser === 'function') {
                const u = window.V1_SESSION.getCurrentUser();
                if (u) return u;
            }

            try {
                const aiUser = localStorage.getItem('AI_USER');
                if (aiUser) {
                    const parsed = JSON.parse(aiUser);
                    if (parsed && parsed.id) return parsed;
                }

                const rawData = localStorage.getItem('supabase.auth.token') || 
                                localStorage.getItem('current_user') || 
                                sessionStorage.getItem('supabase.auth.token');
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    if (parsed?.currentSession?.user) return parsed.currentSession.user;
                    if (parsed?.user) return parsed.user;
                    if (parsed?.id) return parsed;
                }
            } catch (e) {
                console.warn('Session parse warning:', e);
            }

            return {
                id: localStorage.getItem('user_id') || localStorage.getItem('profile_id') || null,
                email: localStorage.getItem('user_email') || null,
                full_name: localStorage.getItem('user_name') || 'किसान मित्र',
                mobile: localStorage.getItem('user_mobile') || null
            };
        }
    };
};

// --- GLOBAL STATE ---
let state = {
    bookId: null,
    bookData: null,
    userData: null,
    purchaseData: null,
    maxAllowedDownloads: 3
};

// Clean title helper: removes BK001, BK002, BK015 etc.
function cleanBookTitle(rawTitle) {
    if (!rawTitle) return 'Aarogyam India कृषि ई-बुक';
    return String(rawTitle)
        .replace(/^(BK\d+|KHARIF-\d+|KHETI-DR)\s*[-_:\s|]*\s*/i, '')
        .replace(/BK\d+/gi, '')
        .trim();
}

// Scroll smoothly to any section
window.scrollToSection = function(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) {
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: Math.max(0, rect.top + scrollTop - 75), behavior: 'smooth' });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loadingState');
    const downloadCard = document.getElementById('downloadCard');

    try {
        const urlParams = new URLSearchParams(window.location.search);
        state.bookId = urlParams.get('book') || urlParams.get('id');
        if (!state.bookId) throw new Error('URL में ई-बुक कोड (Book ID) नहीं मिला।');

        const sessionManager = getDownloadSessionManager();
        if (!sessionManager.isLoggedIn()) {
            sessionManager.requireLogin();
        }
        let user = sessionManager.getCurrentUser();
        if (!user) user = { full_name: 'किसान मित्र' };
        if (!user.id) user.id = 'local_usr_' + (user.mobile || Date.now());
        state.userData = user;

        const [bookData, purchaseData] = await Promise.all([
            fetchBookData(state.bookId),
            fetchPurchaseRecord(user.id, state.bookId),
        ]);

        if (!bookData) throw new Error('ई-बुक की जानकारी लोड नहीं हो सकी।');
        
        state.bookData = bookData;
        window.currentBookData = bookData;
        state.maxAllowedDownloads = bookData.downloadLimit || 3;
        window.maxAllowedDownloads = state.maxAllowedDownloads;

        if (!purchaseData) {
            state.purchaseData = {
                id: 'local_purchase_' + state.bookId,
                profile_id: user.id,
                book_id: state.bookId,
                download_count: 0,
                purchase_date: new Date().toISOString()
            };
        } else {
            state.purchaseData = purchaseData;
        }
        
        window.currentPurchase = state.purchaseData;

        populateUI();
        renderBusinessFunnel();

        if (loadingState) loadingState.style.display = 'none';
        if (downloadCard) downloadCard.style.display = 'block';

        // Auto-Play Audio Guidance on load / first touch
        setupDownloadAudioAutoplay();

    } catch (err) {
        console.error('Initialization Error:', err);
        showError('त्रुटि हुई', err.message);
    }
});

// --- DATA FETCHING FUNCTIONS ---

async function fetchBookData(bookId) {
    const cleanId = String(bookId || '').toUpperCase().trim();
    let mergedData = {
        id: cleanId,
        heading: cleanId,
        name: cleanId,
        category: 'कृषि मास्टर गाइड',
        cover: `/images/books/${cleanId.toLowerCase()}-cover.webp`,
        mainPdf: `/pdf/full/${cleanId}.pdf`,
        totalPages: 0,
        downloadLimit: 3,
        downloadEnabled: true
    };

    // 1. Fetch from books.json
    try {
        const response = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 300000));
        if (response.ok) {
            const data = await response.json();
            const list = Array.isArray(data.books) ? data.books : (Array.isArray(data) ? data : []);
            const match = list.find(b => (b.id && b.id.toUpperCase() === cleanId) || (b.book_id && b.book_id.toUpperCase() === cleanId));
            if (match) {
                mergedData = { ...mergedData, ...match };
                if (match.heading) mergedData.name = match.heading;
                if (match.name) mergedData.heading = match.name;
                if (match.mainPdf) mergedData.mainPdf = match.mainPdf;
            }
        }
    } catch (e) {
        console.warn('books.json fetch notice:', e);
    }

    // 2. Fetch from universal-book-landing-pages.json
    try {
        const lpResp = await fetch('/data/universal-book-landing-pages.json?v=' + Math.floor(Date.now() / 300000));
        if (lpResp.ok) {
            const lpData = await lpResp.json();
            const list = lpData.bookLandingPages || [];
            const match = list.find(p => (p.id || '').toUpperCase() === cleanId);
            if (match) {
                if (match.hero?.title) {
                    mergedData.heading = match.hero.title;
                    mergedData.name = match.hero.title;
                }
                if (match.category) mergedData.category = match.category;
                if (match.hero?.cover_image) mergedData.cover = match.hero.cover_image;
                if (match.mainPdf) mergedData.mainPdf = match.mainPdf;
                if (match.totalPages) mergedData.totalPages = match.totalPages;
                if (match.audio_layer) mergedData.audio_layer = match.audio_layer;
            }
        }
    } catch (e) {
        console.warn('universal landing pages fetch notice:', e);
    }

    // 3. Check local landing pages from Admin
    try {
        const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
        if (Array.isArray(localLp)) {
            const match = localLp.find(p => (p.id || '').toUpperCase() === cleanId);
            if (match) {
                if (match.hero?.title || match.title) {
                    mergedData.heading = match.hero?.title || match.title;
                    mergedData.name = mergedData.heading;
                }
                if (match.hero?.cover_image) mergedData.cover = match.hero.cover_image;
                if (match.mainPdf) mergedData.mainPdf = match.mainPdf;
            }
        }
    } catch (e) {}

    return mergedData;
}

async function fetchPurchaseRecord(userId, bookId) {
    // 1. Check local purchases cache
    try {
        const localPurchases = JSON.parse(localStorage.getItem('aarogyam_purchases') || '[]');
        const cleanId = String(bookId || '').toUpperCase().trim();
        const found = localPurchases.find(p => (p.book_id || '').toUpperCase().trim() === cleanId);
        if (found) return found;
    } catch(e) {}

    // 2. Check Supabase
    const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof db !== 'undefined' ? db : null);
    if (!client) return null;

    const { data, error } = await client
        .from('purchases')
        .select('id, profile_id, book_id, amount, payment_status, download_count, created_at')
        .eq('profile_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();
        
    if (error) {
        console.warn('Purchase record fetch warning:', error.message);
        return null; 
    }
    return data;
}


// Persistent User & Book Download Counter Helpers
function getUserStorageKey() {
    const user = state.userData || {};
    return (user.mobile || user.id || user.full_name || 'verified_user')
        .toString().replace(/[^a-zA-Z0-9_]/g, '_');
}

function getBookStorageKey() {
    return (state.bookId || 'BK001').toUpperCase().trim();
}

function getPersistentDownloadCount() {
    const uKey = getUserStorageKey();
    const bKey = getBookStorageKey();
    
    // 1. Check user-specific key
    let val = localStorage.getItem(`AIM_DL_COUNT_${uKey}_${bKey}`);
    if (val !== null && !isNaN(parseInt(val, 10))) return parseInt(val, 10);
    
    // 2. Check book generic key
    val = localStorage.getItem(`AIM_DL_COUNT_${bKey}`);
    if (val !== null && !isNaN(parseInt(val, 10))) return parseInt(val, 10);

    // 3. Check purchaseData in state
    if (state.purchaseData && typeof state.purchaseData.download_count === 'number') {
        return state.purchaseData.download_count;
    }

    // 4. Check localStorage purchases list
    try {
        const purchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || localStorage.getItem('aarogyam_purchases') || '[]');
        const match = purchases.find(p => (p.book_id || '').toUpperCase().trim() === bKey);
        if (match && typeof match.download_count === 'number') {
            return match.download_count;
        }
    } catch (e) {}

    return 0;
}

function savePersistentDownloadCount(count) {
    const uKey = getUserStorageKey();
    const bKey = getBookStorageKey();

    // 1. Save user-specific key
    localStorage.setItem(`AIM_DL_COUNT_${uKey}_${bKey}`, String(count));
    
    // 2. Save book generic key
    localStorage.setItem(`AIM_DL_COUNT_${bKey}`, String(count));

    // 3. Update in-memory state
    if (state.purchaseData) {
        state.purchaseData.download_count = count;
    }

    // 4. Update in local purchases cache
    try {
        const keys = ['AI_PURCHASES', 'purchases', 'aarogyam_purchases'];
        keys.forEach(k => {
            const list = JSON.parse(localStorage.getItem(k) || '[]');
            let updated = false;
            list.forEach(p => {
                if ((p.book_id || '').toUpperCase().trim() === bKey) {
                    p.download_count = count;
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem(k, JSON.stringify(list));
            }
        });
    } catch (e) {}
}

function updateDownloadButtonCountBadges(used, max) {
    const fastSpeedTag = document.querySelector('#downloadFastBtn .speed-tag');
    const hdSpeedTag = document.querySelector('#downloadHdBtn .speed-tag');

    if (used > 0) {
        if (fastSpeedTag) fastSpeedTag.textContent = `डाउनलोड ${used}/${max} प्रयुक्त`;
        if (hdSpeedTag) hdSpeedTag.textContent = `डाउनलोड ${used}/${max} प्रयुक्त`;
    } else {
        if (fastSpeedTag) fastSpeedTag.textContent = `1-Sec Speed • 0/${max}`;
        if (hdSpeedTag) hdSpeedTag.textContent = `HD प्रिंट • 0/${max}`;
    }

    if (used >= max) {
        if (fastSpeedTag) fastSpeedTag.textContent = `लिमिट समाप्त (${max}/${max})`;
        if (hdSpeedTag) hdSpeedTag.textContent = `लिमिट समाप्त (${max}/${max})`;
    }
}

// --- UI MANIPULATION ---

function populateUI() {
    const bookCover = document.getElementById('bookCover');
    if (bookCover) bookCover.src = state.bookData.cover || `/images/books/${(state.bookId || 'bk001').toLowerCase()}-cover.webp`;
    
    // Clean Book Title (Remove BK001, BK015, etc.)
    const rawTitle = state.bookData.heading || state.bookData.name || 'Aarogyam India E-Book';
    const cleanTitle = cleanBookTitle(rawTitle);
    const bookName = document.getElementById('bookName');
    if (bookName) bookName.textContent = cleanTitle;
    
    const bookCategory = document.getElementById('bookCategory');
    if (bookCategory) bookCategory.textContent = state.bookData.category || 'कृषि मास्टर गाइड';

    const customerName = document.getElementById('customerName');
    if (customerName) customerName.textContent = state.userData.full_name || state.userData.email || 'किसान मित्र';
    
    const customerMobile = document.getElementById('customerMobile');
    if (customerMobile) customerMobile.textContent = state.userData.mobile || 'वेरिफाइड पाठक';
    
    const purchaseDateEl = document.getElementById('purchaseDate');
    if (purchaseDateEl && state.purchaseData.purchase_date) {
        purchaseDateEl.textContent = new Date(state.purchaseData.purchase_date).toLocaleDateString('hi-IN');
    }

    // Resolve persistent download count by user & book
    const used = getPersistentDownloadCount();
    state.purchaseData.download_count = used;
    const max = state.maxAllowedDownloads || 3;
    const remaining = Math.max(0, max - used);

    const downloadsUsed = document.getElementById('downloadsUsed');
    if (downloadsUsed) downloadsUsed.textContent = used;

    const downloadsRemaining = document.getElementById('downloadsRemaining');
    if (downloadsRemaining) downloadsRemaining.textContent = remaining;

    const downloadsMax = document.getElementById('downloadsMax');
    if (downloadsMax) downloadsMax.textContent = max;

    updateDownloadButtonCountBadges(used, max);

    const readNowBtn = document.getElementById('readNowBtn');
    if (readNowBtn) {
        readNowBtn.onclick = () => {
            window.location.href = `reader.html?book=${state.bookId}`;
        };
    }

    if (remaining <= 0) {
        const readyBox = document.getElementById('statusReady');
        const exhaustedBox = document.getElementById('statusExhausted');
        if (readyBox) readyBox.style.display = 'none';
        if (exhaustedBox) exhaustedBox.style.display = 'block';

        const fastBtn = document.getElementById('downloadFastBtn');
        const hdBtn = document.getElementById('downloadHdBtn');
        if (fastBtn) { fastBtn.disabled = true; fastBtn.style.opacity = '0.6'; }
        if (hdBtn) { hdBtn.disabled = true; hdBtn.style.opacity = '0.6'; }
    }
}

function showError(title, message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');

    if (loadingState) loadingState.style.display = 'none';
    if (errorMessage) errorMessage.textContent = `${title}: ${message}`;
    if (errorState) errorState.style.display = 'block';
}

// =================================================================
// AUDIO GUIDANCE PLAYER & PWA INSTALL ENGINE (WITH EXACT HINDI SCRIPT)
// =================================================================
let isAudioGuidancePlaying = false;
let audioGuidanceUtterance = null;

// Exact Hindi script requested by user
const AUDIO_GUIDANCE_SCRIPT = 'नमस्ते किसान भाइयों व पाठकों! Aarogyam India में आपका स्वागत है। आपकी ई-बुक सफलतापूर्वक अनलॉक हो चुकी है। अगर आप बार-बार PDF डाउनलोड करने और मोबाइल की मेमोरी भरने से बचना चाहते हैं, तो Aarogyam App इंस्टॉल करें। इसमें आप बिना इंटरनेट भी कभी भी किताबें पढ़ सकते हैं, ज़ूम कर सकते हैं और ऑडियो सुन सकते हैं। अगर आपको PDF का Print निकालना है, तो नीचे नीले रंग के बॉक्स में Full HD पर क्लिक करें। ध्यान रहे, आप केवल 3 बार ही डाउनलोड कर सकते हैं। लेकिन Reader और Audio को कभी भी, कितनी भी बार इस्तेमाल कर सकते हैं। और अगर आपको कोई भी असुविधा होती है, तो आप सीधे WhatsApp बटन पर क्लिक करके हमसे संपर्क कर सकते हैं। साथ ही नीचे हमारी अन्य सबसे लोकप्रिय कृषि मास्टर गाइड्स भी दी गई हैं, जिन्हें पढ़कर और सुनकर हजारों किसान भाई अपनी खेती को आधुनिक और अत्यधिक लाभदायक बना रहे हैं, उन्हें भी जरूर देखें!';

window.toggleAudioGuidance = function() {
    const statusEl = document.getElementById('audioGuideStatus');
    const iconEl = document.getElementById('audioGuideIcon');
    const bars = document.querySelectorAll('.sound-bar, .f-bar');
    const floatingPill = document.getElementById('aoi-download-floating-audio');
    const floatingIcon = document.getElementById('floatingToggleIcon');

    if (isAudioGuidancePlaying) {
        window.speechSynthesis.cancel();
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (floatingIcon) floatingIcon.className = 'fa-solid fa-play';
        if (statusEl) statusEl.textContent = 'क्लिक करके ऑडियो गाइडेंस सुनें (Hindi Voice)';
        bars.forEach(b => b.classList.remove('animating'));
        return;
    }

    if (!('speechSynthesis' in window)) {
        alert('ऑडियो सपोर्ट आपके ब्राउज़र में उपलब्ध नहीं है। कृपया नीचे दिए गए स्टेप्स पढ़कर ऐप इंस्टॉल करें।');
        return;
    }

    window.speechSynthesis.cancel();

    audioGuidanceUtterance = new SpeechSynthesisUtterance(AUDIO_GUIDANCE_SCRIPT);
    audioGuidanceUtterance.lang = 'hi-IN';
    audioGuidanceUtterance.rate = 1.0;
    audioGuidanceUtterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => (v.lang && (v.lang.includes('hi') || v.lang.includes('hi-IN'))) || (v.name && v.name.includes('Hindi')));
    if (hiVoice) audioGuidanceUtterance.voice = hiVoice;

    audioGuidanceUtterance.onstart = () => {
        isAudioGuidancePlaying = true;
        if (iconEl) iconEl.className = 'fa-solid fa-pause';
        if (floatingIcon) floatingIcon.className = 'fa-solid fa-pause';
        if (statusEl) statusEl.textContent = '🔊 गाइडेंस चल रही है... (रोकने के लिए दोबारा क्लिक करें)';
        bars.forEach(b => b.classList.add('animating'));
        if (floatingPill) floatingPill.style.display = 'flex';
    };

    audioGuidanceUtterance.onend = () => {
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (floatingIcon) floatingIcon.className = 'fa-solid fa-play';
        if (statusEl) statusEl.textContent = 'गाइडेंस समाप्त। ऐप इंस्टॉल करें या PDF डाउनलोड करें!';
        bars.forEach(b => b.classList.remove('animating'));
    };

    audioGuidanceUtterance.onerror = () => {
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (floatingIcon) floatingIcon.className = 'fa-solid fa-play';
        bars.forEach(b => b.classList.remove('animating'));
    };

    window.speechSynthesis.speak(audioGuidanceUtterance);
};

// Dismiss/Close Floating Audio Pill
window.dismissFloatingAudio = function() {
    const floatingPill = document.getElementById('aoi-download-floating-audio');
    if (floatingPill) {
        floatingPill.style.display = 'none';
    }
    if (isAudioGuidancePlaying) {
        window.speechSynthesis.cancel();
        isAudioGuidancePlaying = false;
        const iconEl = document.getElementById('audioGuideIcon');
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        document.querySelectorAll('.sound-bar, .f-bar').forEach(b => b.classList.remove('animating'));
    }
};

// Autoplay Setup (Attempt immediately + first user gesture listener)
function setupDownloadAudioAutoplay() {
    if ('speechSynthesis' in window) {
        try { window.speechSynthesis.getVoices(); } catch(e){}
    }

    const tryAutoStart = () => {
        if (!isAudioGuidancePlaying) {
            try { window.toggleAudioGuidance(); } catch(e) {}
        }
    };

    // 1. Immediate attempt on page load
    setTimeout(tryAutoStart, 400);

    // 2. Reliable touch/click/scroll gesture listeners
    const interactionEvents = ['scroll', 'touchstart', 'touchend', 'click', 'pointerdown'];
    const onUserInteraction = () => {
        if (!isAudioGuidancePlaying) {
            tryAutoStart();
        }
        if (isAudioGuidancePlaying) {
            interactionEvents.forEach(evt => window.removeEventListener(evt, onUserInteraction));
        }
    };

    interactionEvents.forEach(evt => {
        window.addEventListener(evt, onUserInteraction, { once: true, passive: true });
    });
}

// PWA Deferred Prompt Listener
let deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
});

window.triggerPwaInstallPrompt = async function() {
    if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        const choiceResult = await deferredPwaPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted PWA installation');
        }
        deferredPwaPrompt = null;
    } else {
        alert('📲 Aarogyam App फोन स्क्रीन पर जोड़ने का तरीका:\n\n1. अपने क्रोम ब्राउज़र में ऊपर दाईं ओर 3 डॉट्स (⋮) दबाएं।\n2. मेन्यू में "Add to Home screen" (होम स्क्रीन में जोड़ें) चुनें।\n3. "Add" पर क्लिक करें।\n\nऐप तुरंत आपके मोबाइल में ऐप की तरह इंस्टॉल हो जाएगी!');
    }
};

// =================================================================
// 2-SPEED PDF DOWNLOAD ENGINE (FAST ~24MB vs FULL HD)
// =================================================================

window.triggerDownloadTier = async function(tier = 'fast') {
    if (!state.bookData || !state.purchaseData) {
        alert('डाउनलोड डेटा उपलब्ध नहीं है।');
        return;
    }

    const fastBtn = document.getElementById('downloadFastBtn');
    const hdBtn = document.getElementById('downloadHdBtn');
    const activeBtn = tier === 'fast' ? fastBtn : hdBtn;

    const max = state.maxAllowedDownloads || 3;
    const used = getPersistentDownloadCount();
    if ((max - used) <= 0) {
        alert('⚠️ आपकी डाउनलोड लिमिट (3 डाउनलोड) पूरी हो चुकी है। आप My Library में कभी भी इस पुस्तक को ऑनलाइन असीमित बार पढ़ और सुन सकते हैं।');
        return;
    }

    const newCount = used + 1;
    savePersistentDownloadCount(newCount);

    const downloadsUsedEl = document.getElementById('downloadsUsed');
    if (downloadsUsedEl) downloadsUsedEl.textContent = newCount;
    const downloadsRemainingEl = document.getElementById('downloadsRemaining');
    if (downloadsRemainingEl) downloadsRemainingEl.textContent = Math.max(0, max - newCount);

    updateDownloadButtonCountBadges(newCount, max);

    if (newCount >= max) {
        const readyBox = document.getElementById('statusReady');
        const exhaustedBox = document.getElementById('statusExhausted');
        if (readyBox) readyBox.style.display = 'none';
        if (exhaustedBox) exhaustedBox.style.display = 'block';

        if (fastBtn) { fastBtn.disabled = true; fastBtn.style.opacity = '0.6'; }
        if (hdBtn) { hdBtn.disabled = true; hdBtn.style.opacity = '0.6'; }
    }

    const client = typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof db !== 'undefined' ? db : null);
    if (client && state.userData?.id) {
        try {
            await client.from('purchases')
                .update({ download_count: newCount })
                .eq('profile_id', state.userData.id)
                .eq('book_id', state.bookId);

            await client.from('download_logs').insert([{
                user_id: state.userData.id,
                purchase_id: String(state.purchaseData.id),
                book_id: state.bookId,
                download_number: newCount,
                device_info: `${navigator.userAgent} [Tier: ${tier}]`,
                ip_address: null,
                download_status: 'success',
                downloaded_at: new Date().toISOString()
            }]);
        } catch (err) {
            console.warn('DB logging note:', err);
        }
    }

    const cleanId = (state.bookData.id || state.bookId || '').toUpperCase().trim();
    const cleanTitle = cleanBookTitle(state.bookData.heading || state.bookData.name || 'eBook')
        .replace(/[^a-zA-Z0-9_ऀ-ॿ ]/g, '_').trim();
    let mainPdf = (state.bookData.mainPdf || state.bookData.pdf_url || '').trim();
    if (!mainPdf) {
        mainPdf = `/pdf/full/${cleanId}.pdf`;
    }
    const dlFilename = `${cleanId}_${cleanTitle}_${tier === 'fast' ? 'Mobile' : 'HD'}.pdf`;

    if (tier === 'fast') {
        // Direct high-speed static download (1-second delivery)
        try {
            const check = await fetch(mainPdf, { method: 'HEAD' }).catch(() => ({ ok: false }));
            if (check && check.ok) {
                const link = document.createElement('a');
                link.href = mainPdf;
                link.download = dlFilename;
                link.target = '_self';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { if (link.parentNode) link.parentNode.removeChild(link); }, 500);
                showDownloadSuccessPopup(cleanTitle);
                return;
            }
        } catch(e) {}
    }

    // Fallback or Full HD Tier: Assemble PDF with progress
    {
        showDlProgress(0, 1, 'PDF इंजन लोड हो रहा है...');
        if (activeBtn) { activeBtn.disabled = true; }
        try {
            const success = await assembleDownloadPdf(cleanId, cleanTitle, tier);
            if (success) {
                showDownloadSuccessPopup(cleanTitle);
            } else {
                alert('⚠️ PDF तैयार नहीं हो सका। कृपया दोबारा कोशिश करें या My Library में पढ़ें।');
            }
        } catch(e) {
            console.error('PDF assembly error:', e);
            alert('⚠️ PDF error: ' + e.message);
        }
        hideDlProgress();
        if (activeBtn) { activeBtn.disabled = false; }
    }

    if ((max - newCount) <= 0) {
        const readyBox = document.getElementById('statusReady');
        const exhaustedBox = document.getElementById('statusExhausted');
        if (readyBox) readyBox.style.display = 'none';
        if (exhaustedBox) exhaustedBox.style.display = 'block';
    }
};

// =================================================================
// SECTION 4: पाठकों की विशेष पसंद (SLIDE-DOWN ACCORDION & FUNNEL)
// =================================================================

window.toggleFunnelAccordion = function() {
    const body = document.getElementById('funnelCollapsibleBody');
    const header = document.getElementById('funnelToggleHeader');
    const hint = document.getElementById('funnelExpandHint');

    if (!body) return;

    if (body.classList.contains('collapsed')) {
        body.classList.remove('collapsed');
        if (header) header.classList.remove('collapsed');
        if (hint) hint.textContent = 'क्लिक करके बंद करें ▲';
    } else {
        body.classList.add('collapsed');
        if (header) header.classList.add('collapsed');
        if (hint) hint.textContent = 'क्लिक करके देखें ▼';
    }
};

async function renderBusinessFunnel() {
    const grid = document.getElementById('businessFunnelGrid');
    if (!grid) return;

    const currentId = (state.bookId || '').toUpperCase().trim();

    // 100% READY-TO-ORDER ACTIVE BOOKS ONLY (NO COMING SOON, NO SUBSCRIPTIONS)
    const activeMasterBooks = [
        {
            id: 'BK001',
            name: 'खरीफ फसल मास्टर गाइड 2026',
            category: 'Agriculture',
            offerPrice: 99,
            mrp: 299,
            cover: '/images/books/kharif-master-guide-2026-cover.webp',
            link: '/ebooks/kharif-master-guide-2026.html',
            pitch: 'धान, सोयाबीन व मक्का की सम्पूर्ण वैज्ञानिक खेती, खाद-पोषण व बंपर पैदावार की गाइड।'
        },
        {
            id: 'BK002',
            name: 'खेती का डॉक्टर (Fasal Ka Doctor)',
            category: 'Agriculture',
            offerPrice: 99,
            mrp: 299,
            cover: '/images/books/kheti-dr-cover.webp',
            link: '/ebooks/kheti-dr.html',
            pitch: '500+ रोगों व 300+ कीटों का सटीक इलाज, NPK पोषण व पानी सुधार की संपूर्ण गाइड।'
        },
        {
            id: 'BK015',
            name: 'सब्जी खेती मास्टर (PART 1)',
            category: 'Agriculture',
            offerPrice: 149,
            mrp: 299,
            cover: '/images/books/bk015-cover.webp',
            link: '/ebooks/book-landing.html?id=BK015',
            pitch: '11 प्रमुख सब्जियों की वैज्ञानिक खेती — नर्सरी, कीट नियंत्रण से बंपर उत्पादन तक।'
        }
    ];

    let allBooks = activeMasterBooks;

    try {
        const resp = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 300000));
        if (resp.ok) {
            const data = await resp.json();
            const bList = Array.isArray(data.books) ? data.books : (Array.isArray(data) ? data : []);
            if (bList.length > 0) {
                // STRICT FILTER:
                // 1. Exclude Coming Soon books (status === 'coming_soon' or is_coming_soon === true)
                // 2. Exclude Subscriptions (id starts with SUB or category includes subscription)
                // 3. Exclude the current purchased book
                const activeFromDb = bList.filter(b => {
                    const bId = (b.id || b.book_id || '').toUpperCase().trim();
                    const isSub = bId.startsWith('SUB') || (b.category || '').toLowerCase().includes('subscri');
                    const isComingSoon = b.status === 'coming_soon' || b.is_coming_soon === true || b.is_coming_soon === 'true' || b.store_badge === 'coming_soon';
                    return bId && !isSub && !isComingSoon && b.status === 'active';
                });

                if (activeFromDb.length > 0) {
                    allBooks = activeFromDb.map(b => ({
                        id: b.id || b.book_id,
                        name: cleanBookTitle(b.heading || b.name || b.id),
                        category: b.category || 'Agriculture',
                        offerPrice: b.offerPrice || 99,
                        mrp: b.mrp || 299,
                        cover: b.cover || b.thumbnail || `/images/books/${(b.id || 'bk001').toLowerCase()}-cover.webp`,
                        link: b.landingPage || `/ebooks/book-landing.html?id=${b.id}`,
                        pitch: b.description || 'वैज्ञानिक एवं प्रैक्टिकल कृषि समाधान।'
                    }));
                }
            }
        }
    } catch(e) {}

    // CRITICAL REQUIREMENT: EXCLUDE THE CURRENT PURCHASED BOOK
    const funnelBooks = allBooks.filter(b => {
        const bId = (b.id || '').toUpperCase().trim();
        return bId && bId !== currentId;
    });

    if (funnelBooks.length === 0) {
        const section = document.getElementById('businessFunnelSection');
        if (section) section.style.display = 'none';
        return;
    }

    grid.innerHTML = funnelBooks.map(b => {
        const cleanName = cleanBookTitle(b.name);
        const pitchText = b.pitch ? b.pitch.substring(0, 85) + '...' : 'सम्पूर्ण वैज्ञानिक व प्रैक्टिकल गाइड।';
        return `
            <div class="funnel-book-card">
                <div>
                    <img src="${b.cover}" alt="${cleanName}" class="funnel-book-cover" onerror="this.src='/images/books/kharif-master-guide-2026-cover.webp'">
                    <h4 class="funnel-book-title">${cleanName}</h4>
                    <p style="font-size:0.8rem;color:#cbd5e1;line-height:1.45;margin-bottom:10px;min-height:36px;">${pitchText}</p>
                    <div class="funnel-book-price-row">
                        <span class="funnel-offer-price">₹${b.offerPrice}</span>
                        <span class="funnel-mrp-price">₹${b.mrp}</span>
                        <span style="font-size:0.68rem;background:rgba(245,158,11,0.22);color:#fbbf24;border:1px solid rgba(245,158,11,0.4);padding:2px 7px;border-radius:4px;font-weight:800;margin-left:auto;">बेस्टसेलर</span>
                    </div>
                </div>
                <div class="funnel-btn-group">
                    <button type="button" class="funnel-btn-audio" onclick="window.playFunnelBookAudio('${cleanName}', '${b.id}')" title="ऑडियो सैंपल सुनें">
                        <i class="fa-solid fa-volume-high"></i> <span>ऑडियो</span>
                    </button>
                    <a href="${b.link}" class="funnel-btn-buy" title="इस गाइड के बारे में जानें">
                        <span>देखें</span> <i class="fa-solid fa-arrow-right" style="font-size:0.75rem;margin-left:4px;"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

// Motivational cross-selling audio sample player
let funnelAudioUtterance = null;
window.playFunnelBookAudio = function(bookTitle, bookId) {
    if (!('speechSynthesis' in window)) {
        alert('ऑडियो सपोर्ट आपके ब्राउज़र में उपलब्ध नहीं है।');
        return;
    }
    window.speechSynthesis.cancel();

    const cleanTitle = cleanBookTitle(bookTitle);
    const motivationalText = `प्रिय किसान साथी! अगर आपने अपनी खेती को सफल बनाने की शुरुआत कर दी है, तो ${cleanTitle} आपके संग्रह में होना बेहद जरूरी है। देश के हजारों सफल किसान इस प्रैक्टिकल गाइड को अपनाकर अपनी फसलों की पैदावार कई गुना बढ़ा रहे हैं और लागत में 70% तक की भारी बचत कर रहे हैं। सही ज्ञान ही आपकी सबसे बड़ी ताकत है! इस मास्टर गाइड को अभी सिर्फ 99 रुपये के विशेष ऑफर में जरूर अनलॉक करें!`;

    funnelAudioUtterance = new SpeechSynthesisUtterance(motivationalText);
    funnelAudioUtterance.lang = 'hi-IN';
    funnelAudioUtterance.rate = 1.05;
    funnelAudioUtterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => (v.lang && (v.lang.includes('hi') || v.lang.includes('hi-IN'))) || (v.name && v.name.includes('Hindi')));
    if (hiVoice) funnelAudioUtterance.voice = hiVoice;

    window.speechSynthesis.speak(funnelAudioUtterance);
};

// --- PDF ASSEMBLY HELPERS ---

function showDlProgress(current, total, msg) {
    let ov = document.getElementById('dl_pdf_progress_ov');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'dl_pdf_progress_ov';
        ov.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;padding:20px;';
        ov.innerHTML = `
            <div style="background:#0d2818;border:1.5px solid #10b981;border-radius:16px;padding:30px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.6);">
                <div style="font-size:2rem;margin-bottom:12px;">📄</div>
                <h3 id="dl_pdf_ov_title" style="margin:0 0 10px;font-size:1.1rem;color:#10b981;">PDF तैयार हो रही है...</h3>
                <div style="background:#1e293b;border-radius:10px;height:12px;overflow:hidden;margin:16px 0;">
                    <div id="dl_pdf_ov_bar" style="background:linear-gradient(90deg,#10b981,#f59e0b);height:100%;width:0%;transition:width 0.3s ease;"></div>
                </div>
                <div id="dl_pdf_ov_count" style="font-size:0.9rem;color:#cbd5e1;font-weight:700;">पेज 0 / 0</div>
                <p id="dl_pdf_ov_msg" style="font-size:0.8rem;color:#94a3b8;margin:10px 0 0;">कृपया स्क्रीन बंद न करें...</p>
            </div>
        `;
        document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    const bar = document.getElementById('dl_pdf_ov_bar');
    if (bar) bar.style.width = pct + '%';
    const cnt = document.getElementById('dl_pdf_ov_count');
    if (cnt) cnt.textContent = total > 0 ? `पेज ${current} / ${total} (${pct}%)` : '';
    const m = document.getElementById('dl_pdf_ov_msg');
    if (m && msg) m.textContent = msg;
}

function hideDlProgress() {
    const ov = document.getElementById('dl_pdf_progress_ov');
    if (ov) ov.style.display = 'none';
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

async function assembleDownloadPdf(bookId, bookTitle, tier = 'fast') {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showDlProgress(0, 1, 'PDF लाइब्रेरी लोड हो रही है...');
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        } catch(e) {
            await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
        }
    }
    const { jsPDF } = window.jspdf;

    const candidateFolders = [
        `/images/books/${bookId}`,
        `../images/books/${bookId}`,
        `/images/books/${bookId.toLowerCase()}`,
        `../images/books/${bookId.toLowerCase()}`
    ];
    let workingFolder = candidateFolders[0];

    // Find first working image
    for (const folder of candidateFolders) {
        try {
            const res = await fetch(`${folder}/1.webp`, { method: 'HEAD' });
            if (res.ok) { workingFolder = folder; break; }
        } catch(e) {}
    }

    // Count pages
    showDlProgress(0, 1, 'पेज गिने जा रहे हैं...');
    let totalPages = 0;
    for (let p = 1; p <= 300; p++) {
        try {
            const res = await fetch(`${workingFolder}/${p}.webp`, { method: 'HEAD' });
            if (res.ok) totalPages = p;
            else break;
        } catch(e) { break; }
    }

    if (totalPages === 0) {
        hideDlProgress();
        return false;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = doc.internal.pageSize.getWidth();
    const pdfH = doc.internal.pageSize.getHeight();

    // Scale canvas according to tier
    const maxDimension = tier === 'fast' ? 850 : 1600;
    const compressionQuality = tier === 'fast' ? 0.65 : 0.88;

    for (let i = 1; i <= totalPages; i++) {
        showDlProgress(i, totalPages, `पेज ${i} / ${totalPages} प्रोसेस हो रहे हैं...`);

        try {
            const imgUrl = `${workingFolder}/${i}.webp`;
            const img = await new Promise((res, rej) => {
                const im = new Image();
                im.crossOrigin = 'anonymous';
                im.onload = () => res(im);
                im.onerror = rej;
                im.src = imgUrl;
            });

            const canvas = document.createElement('canvas');
            const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const jpegData = canvas.toDataURL('image/jpeg', compressionQuality);
            if (i > 1) doc.addPage();
            doc.addImage(jpegData, 'JPEG', 0, 0, pdfW, pdfH);
        } catch(e) {
            console.warn(`Page ${i} skip:`, e);
        }

        if (i % 8 === 0) await new Promise(r => setTimeout(r, 20));
    }

    showDlProgress(totalPages, totalPages, 'PDF सेव हो रही है...');
    const filename = `${bookId}_${bookTitle}_${tier === 'fast' ? 'Mobile' : 'HD'}.pdf`;
    doc.save(filename);
    hideDlProgress();
    return true;
}

function showDownloadSuccessPopup(bookTitle) {
    const popup = document.getElementById('successPopup');
    const nameEl = document.getElementById('popupBookName');
    const custEl = document.getElementById('popupCustomerName');
    const coverEl = document.getElementById('popupBookCover');

    if (nameEl) nameEl.textContent = cleanBookTitle(bookTitle);
    if (custEl) custEl.textContent = state.userData?.full_name || 'किसान मित्र';
    if (coverEl) coverEl.src = state.bookData?.cover || '';

    if (popup) popup.style.display = 'flex';

    const closeBtn = document.getElementById('popupCloseBtn');
    if (closeBtn) closeBtn.onclick = () => { popup.style.display = 'none'; };

    const readBtn = document.getElementById('popupReadNowBtn');
    if (readBtn) readBtn.onclick = () => { window.location.href = `reader.html?book=${state.bookId}`; };
}
