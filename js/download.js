/* =================================================================
    AAROGYAM INDIA - PREMIUM DOWNLOAD EXPERIENCE & BUSINESS FUNNEL
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

document.addEventListener('DOMContentLoaded', async () => {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
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

        if (state.bookData.downloadEnabled === false) {
            throw new Error('इस ई-बुक का डाउनलोड वर्तमान में एडमिन द्वारा बंद है।');
        }

        populateUI();
        renderBusinessFunnel();

        if (loadingState) loadingState.style.display = 'none';
        if (downloadCard) downloadCard.style.display = 'block';

    } catch (err) {
        console.error('Initialization Error:', err);
        showError('त्रुटि हुई', err.message);
    }
});

// --- DATA FETCHING FUNCTIONS ---

async function fetchBookData(bookId) {
    const cleanId = String(bookId || '').toUpperCase().trim();
    // 1. Check local landing pages
    try {
        const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
        if (Array.isArray(localLp)) {
            const foundLp = localLp.find(p => (p.id || '').toUpperCase() === cleanId);
            if (foundLp) {
                return {
                    id: cleanId,
                    heading: foundLp.title || foundLp.heading || cleanId,
                    name: foundLp.title || cleanId,
                    category: foundLp.category || 'कृषि मास्टर गाइड',
                    cover: foundLp.hero?.cover_image || `/images/books/${cleanId.toLowerCase()}-cover.webp`,
                    mainPdf: foundLp.mainPdf || foundLp.pdf_url || '',
                    totalPages: foundLp.totalPages || 0,
                    downloadLimit: 3
                };
            }
        }
    } catch(e) {}

    // 2. Check universal-book-landing-pages.json
    try {
        const lpResp = await fetch('/data/universal-book-landing-pages.json?v=' + Math.floor(Date.now() / 300000));
        if (lpResp.ok) {
            const lpData = await lpResp.json();
            const list = lpData.bookLandingPages || [];
            const match = list.find(p => (p.id || '').toUpperCase() === cleanId);
            if (match) {
                return {
                    id: cleanId,
                    heading: match.title || match.heading || cleanId,
                    name: match.title || cleanId,
                    category: match.category || 'कृषि मास्टर गाइड',
                    cover: match.hero?.cover_image || `/images/books/${cleanId.toLowerCase()}-cover.webp`,
                    mainPdf: match.mainPdf || match.pdf_url || '',
                    totalPages: match.totalPages || 0,
                    downloadLimit: 3
                };
            }
        }
    } catch(e) {}

    // 3. Check books.json
    try {
        const response = await fetch('/data/books.json?v=' + Math.floor(Date.now() / 300000));
        if (response.ok) {
            const data = await response.json();
            const list = Array.isArray(data.books) ? data.books : (Array.isArray(data) ? data : []);
            const match = list.find(book => (book.id && book.id.toUpperCase() === cleanId) || (book.book_id && book.book_id.toUpperCase() === cleanId));
            if (match) return match;
        }
    } catch(e) {}

    return {
        id: cleanId,
        heading: cleanId,
        name: cleanId,
        category: 'कृषि ई-बुक',
        cover: `/images/books/${cleanId.toLowerCase()}-cover.webp`,
        totalPages: 100,
        downloadLimit: 3
    };
}

async function fetchPurchaseRecord(userId, bookId) {
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

// --- UI MANIPULATION ---

function populateUI() {
    const bookCover = document.getElementById('bookCover');
    if (bookCover) bookCover.src = state.bookData.cover || `/images/books/${(state.bookId || 'bk001').toLowerCase()}-cover.webp`;
    
    const bookName = document.getElementById('bookName');
    if (bookName) bookName.textContent = state.bookData.heading || state.bookData.name || 'Aarogyam India E-Book';
    
    const bookCategory = document.getElementById('bookCategory');
    if (bookCategory) bookCategory.textContent = state.bookData.category || 'कृषि मास्टर गाइड';

    const customerName = document.getElementById('customerName');
    if (customerName) customerName.textContent = state.userData.full_name || state.userData.email || 'किसान मित्र';
    
    const customerMobile = document.getElementById('customerMobile');
    if (customerMobile) customerMobile.textContent = state.userData.mobile || 'वेरिफाइड पाठक';
    
    const bookIdEl = document.getElementById('bookId');
    if (bookIdEl) bookIdEl.textContent = state.bookData.id || state.bookId;
    
    const purchaseDateEl = document.getElementById('purchaseDate');
    if (purchaseDateEl && state.purchaseData.purchase_date) {
        purchaseDateEl.textContent = new Date(state.purchaseData.purchase_date).toLocaleDateString('hi-IN');
    }

    const used = state.purchaseData.download_count || 0;
    const max = state.maxAllowedDownloads;
    const remaining = Math.max(0, max - used);

    const downloadsUsed = document.getElementById('downloadsUsed');
    if (downloadsUsed) downloadsUsed.textContent = used;

    const downloadsRemaining = document.getElementById('downloadsRemaining');
    if (downloadsRemaining) downloadsRemaining.textContent = remaining;

    const downloadsMax = document.getElementById('downloadsMax');
    if (downloadsMax) downloadsMax.textContent = max;

    const readNowBtn = document.getElementById('readNowBtn');
    if (readNowBtn) {
        readNowBtn.onclick = () => {
            window.location.href = `reader.html?book=${state.bookId}`;
        };
    }

    if (remaining <= 0) {
        disableDownloadButton('डाउनलोड लिमिट पूरी हो चुकी है');
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
// AUDIO GUIDANCE PLAYER & PWA INSTALL ENGINE
// =================================================================
let isAudioGuidancePlaying = false;
let audioGuidanceUtterance = null;

window.toggleAudioGuidance = function() {
    const statusEl = document.getElementById('audioGuideStatus');
    const iconEl = document.getElementById('audioGuideIcon');
    const bars = document.querySelectorAll('.sound-bar');

    if (isAudioGuidancePlaying) {
        window.speechSynthesis.cancel();
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (statusEl) statusEl.textContent = 'क्लिक करके 30-सेकंड की ऑडियो गाइडेंस सुनें (Hindi Voice)';
        bars.forEach(b => b.classList.remove('animating'));
        return;
    }

    if (!('speechSynthesis' in window)) {
        alert('ऑडियो सपोर्ट आपके ब्राउज़र में उपलब्ध नहीं है। कृपया नीचे दिए गए 3 आसान स्टेप्स पढ़कर ऐप इंस्टॉल करें।');
        return;
    }

    window.speechSynthesis.cancel();
    const guideText = 'नमस्ते किसान भाइयों व पाठकों! Aarogyam India में आपका स्वागत है। अगर आप बार-बार PDF डाउनलोड करने और मोबाइल की मेमोरी भरने के झंझट से बचना चाहते हैं, तो आप Aarogyam App को सीधे अपने मोबाइल की होम स्क्रीन पर इंस्टॉल कर सकते हैं! ऐप में आप जब चाहें बिना इंटरनेट भी अपनी किताबें पढ़ सकते हैं, ज़ूम कर सकते हैं और लाइव ऑडियो सुन सकते हैं। यदि आपको PDF फाइल चाहिए तो नीचे दिए गए फास्ट मोबाइल PDF बटन पर क्लिक करें!';

    audioGuidanceUtterance = new SpeechSynthesisUtterance(guideText);
    audioGuidanceUtterance.lang = 'hi-IN';
    audioGuidanceUtterance.rate = 0.95;
    audioGuidanceUtterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => (v.lang && v.lang.includes('hi')) || (v.name && v.name.includes('Hindi')));
    if (hiVoice) audioGuidanceUtterance.voice = hiVoice;

    audioGuidanceUtterance.onstart = () => {
        isAudioGuidancePlaying = true;
        if (iconEl) iconEl.className = 'fa-solid fa-pause';
        if (statusEl) statusEl.textContent = '🔊 गाइडेंस बज रही है... (रोकने के लिए दोबारा क्लिक करें)';
        bars.forEach(b => b.classList.add('animating'));
    };

    audioGuidanceUtterance.onend = () => {
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        if (statusEl) statusEl.textContent = 'गाइडेंस समाप्त। ऐप इंस्टॉल करने के लिए नीचे दिए गए बटन पर क्लिक करें!';
        bars.forEach(b => b.classList.remove('animating'));
    };

    audioGuidanceUtterance.onerror = () => {
        isAudioGuidancePlaying = false;
        if (iconEl) iconEl.className = 'fa-solid fa-volume-high';
        bars.forEach(b => b.classList.remove('animating'));
    };

    window.speechSynthesis.speak(audioGuidanceUtterance);
};

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
// 2-SPEED PDF DOWNLOAD ENGINE (FAST ~15MB vs FULL HD)
// =================================================================

window.triggerDownloadTier = async function(tier = 'fast') {
    if (!state.bookData || !state.purchaseData) {
        alert('डाउनलोड डेटा उपलब्ध नहीं है।');
        return;
    }

    const fastBtn = document.getElementById('downloadFastBtn');
    const hdBtn = document.getElementById('downloadHdBtn');
    const activeBtn = tier === 'fast' ? fastBtn : hdBtn;

    const used = state.purchaseData.download_count || 0;
    const max = state.maxAllowedDownloads;
    if ((max - used) <= 0) {
        alert('⚠️ आपकी डाउनलोड लिमिट समाप्त हो चुकी है। आप My Library में कभी भी इस पुस्तक को ऑनलाइन पढ़ और सुन सकते हैं।');
        return;
    }

    const newCount = used + 1;
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

    state.purchaseData.download_count = newCount;
    const downloadsUsedEl = document.getElementById('downloadsUsed');
    if (downloadsUsedEl) downloadsUsedEl.textContent = newCount;
    const downloadsRemainingEl = document.getElementById('downloadsRemaining');
    if (downloadsRemainingEl) downloadsRemainingEl.textContent = Math.max(0, max - newCount);

    const cleanId = (state.bookData.id || state.bookId || '').toUpperCase().trim();
    const cleanTitle = (state.bookData.heading || state.bookData.name || 'eBook')
        .replace(/[^a-zA-Z0-9_ऀ-ॿ ]/g, '_').trim();
    let mainPdf = (state.bookData.mainPdf || state.bookData.pdf_url || '').trim();
    if (!mainPdf) {
        mainPdf = `/pdf/full/${cleanId}.pdf`;
    }
    const dlFilename = `${cleanId}_${cleanTitle}_${tier === 'fast' ? 'Mobile' : 'HD'}.pdf`;

    if (tier === 'fast') {
        // Try direct high-speed static download first (1-second delivery)
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
                showDownloadSuccessPopup(state.bookData.heading || state.bookData.name || 'Aarogyam India E-Book');
                return;
            }
        } catch(e) {}
    }
    // Fallback or HD Tier: Assemble PDF with progress
    {
        // Image-to-PDF assembly with selected tier
        showDlProgress(0, 1, 'PDF इंजन लोड हो रहा है...');
        if (activeBtn) { activeBtn.disabled = true; }
        try {
            const success = await assembleDownloadPdf(cleanId, cleanTitle, tier);
            if (success) {
                showDownloadSuccessPopup(state.bookData.heading || state.bookData.name || 'Aarogyam India E-Book');
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
        disableDownloadButton('डाउनलोड लिमिट पूरी हो चुकी है');
    }
};

// Backward-compatibility alias
window.triggerDownload = function() {
    window.triggerDownloadTier('fast');
};

// ── PDF from Images: Progress Overlay ──────────────────────────────────────
function showDlProgress(current, total, msg) {
    let ov = document.getElementById('dl_pdf_progress_ov');
    if (!ov) {
        ov = document.createElement('div');
        ov.id = 'dl_pdf_progress_ov';
        ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif;backdrop-filter:blur(6px);';
        ov.innerHTML = `
            <div style="background:#0f172a;border-radius:18px;padding:32px 28px;max-width:340px;width:90%;text-align:center;color:#fff;border:1px solid #334155;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
                <div style="font-size:2.6rem;margin-bottom:12px;">⚡</div>
                <div id="dl_pdf_msg" style="font-size:1rem;font-weight:700;margin-bottom:16px;"></div>
                <div style="background:#1e293b;border-radius:8px;height:12px;overflow:hidden;margin-bottom:10px;">
                    <div id="dl_pdf_bar" style="height:100%;background:linear-gradient(90deg,#e86a17,#16a34a);border-radius:8px;transition:width 0.3s;width:0%;"></div>
                </div>
                <div id="dl_pdf_count" style="font-size:0.85rem;color:#94a3b8;font-weight:600;"></div>
                <div style="font-size:0.75rem;color:#64748b;margin-top:12px;">📵 कृपया स्क्रीन बंद न करें, कुछ ही सेकंड लगेंगे</div>
            </div>`;
        document.body.appendChild(ov);
    }
    const bar = document.getElementById('dl_pdf_bar');
    const msgEl = document.getElementById('dl_pdf_msg');
    const cntEl = document.getElementById('dl_pdf_count');
    if (bar && total > 0) bar.style.width = Math.round((current / total) * 100) + '%';
    if (msgEl) msgEl.textContent = msg || 'PDF बन रहा है...';
    if (cntEl && total > 0) cntEl.textContent = `पेज ${current} / ${total} तैयार`;
}

function hideDlProgress() {
    const ov = document.getElementById('dl_pdf_progress_ov');
    if (ov) ov.remove();
}

async function loadDlJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    const cdns = [
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'
    ];
    for (const src of cdns) {
        try {
            await new Promise((res, rej) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = () => (window.jspdf && window.jspdf.jsPDF) ? res() : rej();
                s.onerror = rej;
                document.head.appendChild(s);
            });
            if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
        } catch(e) {}
    }
    throw new Error('jsPDF load failed');
}

function convertDlBlobToJpegDataUrl(blob, isFast = true) {
    return new Promise((resolve) => {
        const objUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            try {
                let w = img.naturalWidth || 800;
                let h = img.naturalHeight || 1200;
                if (isFast && w > 850) {
                    const ratio = 850 / w;
                    w = 850;
                    h = Math.round(h * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, h);
                ctx.drawImage(img, 0, 0, w, h);
                const quality = isFast ? 0.65 : 0.85;
                const jpeg = canvas.toDataURL('image/jpeg', quality);
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

// ── Assemble PDF from images ───────────────────────────────────────────────
async function assembleDownloadPdf(cleanId, cleanTitle, tier = 'fast') {
    const isFast = tier === 'fast';
    showDlProgress(0, 1, 'PDF इंजन लोड हो रहा है...');
    const jsPDF = await loadDlJsPdf();

    let total = state.bookData?.totalPages || 0;
    const pageUrls = [];

    if (total > 0) {
        for (let i = 1; i <= total; i++) {
            pageUrls.push(`/images/books/${cleanId}/${i}.webp`);
        }
    } else {
        showDlProgress(0, 1, 'पेज गिने जा रहे हैं...');
        for (let n = 1; n <= 300; n++) {
            try {
                const r = await fetch(`/images/books/${cleanId}/${n}.webp`, { method: 'HEAD' }).catch(() => ({ ok: false }));
                if (r.ok) pageUrls.push(`/images/books/${cleanId}/${n}.webp`);
                else break;
            } catch(e) { break; }
        }
        total = pageUrls.length;
    }

    if (pageUrls.length === 0) return false;

    showDlProgress(0, total, `${total} पेज मिले, ${isFast ? 'फास्ट PDF (~15MB)' : 'फुल HD PDF'} बन रही है...`);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210, H = 297;
    const BATCH = isFast ? 6 : 3;
    let processedCount = 0;

    for (let i = 0; i < pageUrls.length; i += BATCH) {
        const batchUrls = pageUrls.slice(i, i + BATCH);
        const blobs = await Promise.all(
            batchUrls.map(url =>
                fetch(url).then(r => r.ok ? r.blob() : null).catch(() => null)
            )
        );
        for (let j = 0; j < blobs.length; j++) {
            const blob = blobs[j];
            if (!blob) continue;
            const jpegDataUrl = await convertDlBlobToJpegDataUrl(blob, isFast);
            if (!jpegDataUrl) continue;
            if (processedCount > 0) doc.addPage('a4', 'portrait');
            doc.addImage(jpegDataUrl, 'JPEG', 0, 0, W, H, undefined, 'FAST');
            processedCount++;
            showDlProgress(processedCount, total, `${isFast ? 'फास्ट PDF' : 'HD PDF'} तैयार हो रहा है...`);
        }
    }

    if (processedCount === 0) {
        hideDlProgress();
        return false;
    }

    showDlProgress(total, total, 'PDF सुरक्षित की जा रही है...');
    doc.save(`${cleanId}_${cleanTitle}_${isFast ? 'Mobile' : 'HD'}.pdf`);
    hideDlProgress();
    return true;
}

function disableDownloadButton(message) {
    const fastBtn = document.getElementById('downloadFastBtn');
    const hdBtn = document.getElementById('downloadHdBtn');
    [fastBtn, hdBtn].forEach(btn => {
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
        }
    });
}

// =================================================================
// BUSINESS FUNNEL / CROSS-SELLING ENGINE
// =================================================================
let currentPlayingFunnelBtn = null;

async function renderBusinessFunnel() {
    const container = document.getElementById('businessFunnelGrid');
    if (!container) return;

    let funnelBooks = [];
    try {
        const cacheTime = Math.floor(Date.now() / 300000);
        const [booksResp, lpResp] = await Promise.all([
            fetch('/data/books.json?v=' + cacheTime).catch(() => ({ ok: false })),
            fetch('/data/universal-book-landing-pages.json?v=' + cacheTime).catch(() => ({ ok: false }))
        ]);

        let allB = [];
        if (booksResp.ok) {
            const bData = await booksResp.json();
            allB = bData.books || bData || [];
        }

        let allLp = [];
        if (lpResp.ok) {
            const lpData = await lpResp.json();
            allLp = lpData.bookLandingPages || lpData || [];
        }

        // Overlay localStorage from Admin
        try {
            const localLp = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            if (Array.isArray(localLp)) {
                localLp.forEach(p => {
                    const idx = allLp.findIndex(x => x.id === p.id);
                    if (idx >= 0) allLp[idx] = p;
                    else allLp.push(p);
                });
            }
        } catch(e) {}

        const currentBookId = (state.bookId || '').toUpperCase();
        allLp.forEach(lp => {
            const bId = (lp.id || '').toUpperCase();
            if (bId === currentBookId) return; // Don't cross-sell the same book
            const targets = lp.publish_targets || [];
            const isFunnelTarget = targets.includes('download_funnel');
            const isLive = lp.status !== 'inactive' && lp.status !== 'draft';
            if (isLive && (isFunnelTarget || ['BK001', 'BK002', 'BK015', 'BK006'].includes(bId))) {
                const existing = allB.find(x => (x.id || '').toUpperCase() === bId) || {};
                funnelBooks.push({
                    id: bId,
                    title: lp.title || lp.heading || existing.heading || existing.title || bId,
                    description: lp.hero?.subtitle || lp.hero?.description || existing.features?.[0] || 'सम्पूर्ण सचित्र प्रैक्टिकल कृषि गाइड।',
                    cover: lp.hero?.cover_image || existing.cover || existing.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
                    offerPrice: lp.pricing?.offer_price || existing.offerPrice || 99,
                    mrp: lp.pricing?.original_price || existing.mrp || 299,
                    audioText: lp.audio_layer?.tts_text || lp.audio_layer?.story_text || lp.audio_layer?.main_subtitle || '',
                    landingPage: `/ebooks/book-landing.html?id=${bId}`,
                    checkoutPage: `/ebooks/checkout.html?product=${bId}`,
                    badge: lp.store_badge === 'new_arrival' ? '🆕 New Arrival' : (bId === 'BK015' ? '🌿 सब्जी व कीट मास्टर' : (bId === 'BK001' ? '🌾 खरीफ मास्टर' : '⭐ Best Seller'))
                });
            }
        });
    } catch(e) {
        console.warn('Funnel loading note:', e);
    }

    if (funnelBooks.length === 0) {
        const sec = document.getElementById('businessFunnelSection');
        if (sec) sec.style.display = 'none';
        return;
    }

    container.innerHTML = funnelBooks.map(book => `
        <div class="funnel-book-item">
            <div class="funnel-book-top">
                <img src="${book.cover}" alt="${book.title}" class="funnel-book-cover" onclick="window.openImageZoom?.('${book.cover}')">
                <div class="funnel-book-info">
                    <span style="display:inline-block;font-size:0.68rem;background:#fef3c7;color:#b45309;padding:2px 6px;border-radius:4px;font-weight:800;margin-bottom:4px;">${book.badge}</span>
                    <h4>${book.title}</h4>
                    <p class="funnel-book-desc">${book.description}</p>
                    <div class="funnel-book-prices">
                        <span class="funnel-price-offer">₹${book.offerPrice}</span>
                        <span class="funnel-price-mrp">₹${book.mrp}</span>
                    </div>
                </div>
            </div>
            <div class="funnel-book-actions">
                <button type="button" class="btn-funnel-audio" onclick="window.playFunnelBookAudio('${book.id}', '${book.title.replace(/'/g, "\'")}', '${(book.audioText || book.description).replace(/'/g, "\'")}', this)">
                    <i class="fa-solid fa-volume-high"></i> <span>🔊 सैंपल ऑडियो सुनें</span>
                </button>
                <div class="funnel-cta-group">
                    <a href="${book.landingPage}" class="btn-funnel-know-more">
                        <i class="fa-solid fa-circle-info"></i> अधिक जानें
                    </a>
                    <a href="${book.checkoutPage}" class="btn-funnel-buy">
                        <i class="fa-solid fa-bolt"></i> अभी खरीदें
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

window.playFunnelBookAudio = function(bookId, bookTitle, sampleText, btnEl) {
    if (window.speechSynthesis) {
        if (currentPlayingFunnelBtn === btnEl && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            btnEl.classList.remove('playing');
            btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>🔊 सैंपल ऑडियो सुनें</span>';
            currentPlayingFunnelBtn = null;
            return;
        }

        window.speechSynthesis.cancel();
        if (currentPlayingFunnelBtn) {
            currentPlayingFunnelBtn.classList.remove('playing');
            currentPlayingFunnelBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>🔊 सैंपल ऑडियो सुनें</span>';
        }

        const utterText = `${bookTitle}। ${sampleText}`;
        const utter = new SpeechSynthesisUtterance(utterText);
        utter.lang = 'hi-IN';
        utter.rate = 0.95;

        utter.onstart = () => {
            btnEl.classList.add('playing');
            btnEl.innerHTML = '<i class="fa-solid fa-pause"></i> <span>ऑडियो चल रहा है (Pause)</span>';
            currentPlayingFunnelBtn = btnEl;
        };

        utter.onend = () => {
            btnEl.classList.remove('playing');
            btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>🔊 सैंपल ऑडियो सुनें</span>';
            currentPlayingFunnelBtn = null;
        };

        utter.onerror = () => {
            btnEl.classList.remove('playing');
            btnEl.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span>🔊 सैंपल ऑडियो सुनें</span>';
            currentPlayingFunnelBtn = null;
        };

        window.speechSynthesis.speak(utter);
    }
};

function showDownloadSuccessPopup(bookTitle) {
    const old = document.getElementById('proDownloadPopup');
    if (old) old.remove();

    const popup = document.createElement('div');
    popup.id = 'proDownloadPopup';
    popup.style.cssText = `
        position:fixed;
        left:0;
        top:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,.75);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:999999;
        backdrop-filter:blur(8px);
        padding:20px;
    `;

    popup.innerHTML = `
        <div style="max-width:430px; width:100%; background:#fff; border-radius:28px; overflow:hidden; box-shadow:0 25px 60px rgba(0,0,0,.35); animation:popup .35s ease;">
            <div style="background:linear-gradient(135deg,#138A36,#0F6A29); padding:28px; text-align:center; color:white;">
                <div style="font-size:65px; margin-bottom:10px;">✅</div>
                <h2 style="margin:0; font-size:24px; font-weight:800;">PDF डाउनलोड शुरू हो गया!</h2>
                <p style="margin-top:8px; font-size:14px; opacity:.95;">आपकी ई-बुक फाइल तैयार है</p>
            </div>
            <div style="padding:24px;">
                <div style="background:#F8FAFC; border-radius:14px; padding:14px; margin-bottom:14px;">
                    <div style="font-size:13px; color:#64748b;">पुस्तक का नाम</div>
                    <div style="font-size:16px; font-weight:800; margin-top:4px; color:#1e293b;">${bookTitle}</div>
                </div>
                <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:14px; border-radius:14px; margin-bottom:18px;">
                    <div style="font-size:14px; font-weight:800; color:#138A36; margin-bottom:6px;">🎉 बधाई हो!</div>
                    <div style="font-size:13px; line-height:1.6; color:#334155;">
                        यह खरीद आपके अकाउंट में <strong>लाइफटाइम सुरक्षित</strong> है。<br>
                        आप जब चाहें My Library में इसे ऑनलाइन भी पढ़ व सुन सकते हैं।
                    </div>
                </div>
                <button onclick="window.location.href='../ebooks/my-library.html'" style="width:100%; padding:14px; border:none; border-radius:12px; background:linear-gradient(135deg,#138A36,#0E6527); color:white; font-size:16px; font-weight:700; cursor:pointer;">
                    📚 My Library में जाएं
                </button>
                <button onclick="document.getElementById('proDownloadPopup').remove()" style="margin-top:10px; width:100%; padding:12px; border-radius:12px; border:1.5px solid #cbd5e1; background:white; font-size:14px; font-weight:700; cursor:pointer;">
                    बंद करें (Close)
                </button>
            </div>
        </div>
        <style>
            @keyframes popup {
                from { opacity:0; transform:scale(.85); }
                to { opacity:1; transform:scale(1); }
            }
        </style>
    `;

    document.body.appendChild(popup);
}
