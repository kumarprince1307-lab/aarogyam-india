/* ==========================================
   AAROGYAM INDIA
   DEMO-BOOK.JS (Complete & Final - With Smart Referral, Session Landing Page & Demo Engine)
========================================== */

"use strict";

let currentBookData = null;
let previewImages = [];
let currentIndex = 0;
let referrerDisplay = null;

document.addEventListener("DOMContentLoaded", async () => {
    showLoader();
    syncDemoShareContext(); // URL और सेशन से शेयर आईडी और सोर्स रिकवर करना
    await loadBookData();
    initializePage();
    setupEventListeners();
});

/*==================================================
  0. SYNC SHARE CONTEXT & REFERRAL LOOKUP
==================================================*/
function syncDemoShareContext() {
    const params = new URLSearchParams(window.location.search);
    
    const session = (window.V1_SESSION && typeof window.V1_SESSION.getSession === 'function') 
        ? window.V1_SESSION.getSession() : {};

    const sessionReferralId = session.referral_share_id || (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function' ? window.V1_SESSION.getReferralId() : null);

    const shareTokenFromUrl = params.get('share_token') || params.get('share_id') || params.get('tracking_token');
    const referralMobileParam = params.get('referral_mobile') || params.get('referral');

    // सेशन या URL से सही सोर्स और लैंडिंग पेज उठाना
    const sourceVal = params.get("source") || params.get("utm_source") || session.registration_source || "demo";
    const landingUrlVal = session.landing_page || window.location.href || null;

    const shareContext = {
        source: sourceVal,
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_url: window.location.href || null,
        landing_url: landingUrlVal
    };

    if (typeof persistShareContext === "function") {
        persistShareContext(shareContext);
    }

    const demoRefInput = document.getElementById("referralMobile");
    if (demoRefInput) {
        if (!demoRefInput.value) {
            demoRefInput.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }

        if (demoRefInput.value) {
            lookupReferrerName(demoRefInput.value.trim());
        }
    }

    return shareContext;
}

// स्मार्ट डेटा बाइंडिंग बंडल
window.currentReferrerData = {
    uuid: null,
    name: null,
    mobile: null,
    shareId: null
};

async function lookupReferrerName(identifier) {
    if (!identifier) return;

    if (identifier === "AI000004") {
        window.currentReferrerData = {
            uuid: "52ef705c-bb45-4137-bee4-a3f8df73b676",
            name: "Aarogyam India",
            mobile: "7974422572",
            shareId: "AI000004"
        };
        showReferrerGreen(`✔ Master Partner: Aarogyam India (7974422572)`);
        return;
    }
    
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let data = null;

        if (/^[6-9]\d{9}$/.test(identifier)) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("mobile", identifier)
                .order("is_active", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            data = res.data;
        } 
        
        if (!data) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("share_id", identifier)
                .order("is_active", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            data = res.data;
        }

        if (data) {
            window.currentReferrerData = {
                uuid: data.id,
                name: data.full_name || "Aarogyam Member",
                mobile: data.mobile,
                shareId: data.share_id
            };
            showReferrerGreen(`✔ Referred by: ${data.full_name} (${data.mobile || 'No Mobile'})`);
        } else {
            window.currentReferrerData = { uuid: null, name: null, mobile: null, shareId: null };
            showReferrerRed("✖ Invalid Share ID/Mobile");
        }
    } catch (err) {
        console.error("Referrer lookup exception:", err);
    }
}

function showReferrerGreen(text) {
    referrerDisplay = document.getElementById("referrerDisplayName");
    if (referrerDisplay) {
        referrerDisplay.style.color = "#28a745"; 
        referrerDisplay.textContent = text;
    }
}

function showReferrerRed(text) {
    referrerDisplay = document.getElementById("referrerDisplayName");
    if (referrerDisplay) {
        referrerDisplay.style.color = "#dc3545"; 
        referrerDisplay.textContent = text;
    }
}

/*==================================================
  1. LOAD BOOK DATA FROM books.json, LANDING PAGES & STUDIO
==================================================*/
let demoAudioInstance = null;
let isDemoAudioPlaying = false;

async function loadBookData() {
    try {
        const params = new URLSearchParams(window.location.search);
        const bookId = (params.get("book") || params.get("id") || "BK001").trim();
        const targetKey = String(bookId).toUpperCase();

        let booksArray = [];
        try {
            const response = await fetch("../data/books.json?v=" + Date.now());
            if (response.ok) {
                const jsonResult = await response.json();
                booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
            }
        } catch (fe) {}

        let landingArray = [];
        try {
            const lRes = await fetch("../data/universal-book-landing-pages.json?v=" + Date.now());
            if (lRes.ok) {
                const lJson = await lRes.json();
                landingArray = Array.isArray(lJson) ? lJson : (lJson.bookLandingPages || lJson.pages || []);
            }
        } catch (le) {}

        // Overlay LocalStorage landing pages
        try {
            const localLanding = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            if (Array.isArray(localLanding)) {
                localLanding.forEach(lp => {
                    if (lp && lp.id) {
                        const idx = landingArray.findIndex(x => x && x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                        if (idx >= 0) landingArray[idx] = { ...landingArray[idx], ...lp };
                        else landingArray.push(lp);
                    }
                });
            }
        } catch(e) {}

        // Overlay custom and studio demo books
        try {
            const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            if (Array.isArray(customBooks)) {
                customBooks.forEach(cb => {
                    const idx = booksArray.findIndex(x => x && x.id && x.id.toUpperCase() === cb.id.toUpperCase());
                    if (idx >= 0) booksArray[idx] = { ...booksArray[idx], ...cb };
                    else booksArray.push(cb);
                });
            }
        } catch (e) {}

        try {
            const freeDemoBooks = JSON.parse(localStorage.getItem('AAROGYAM_FREE_DEMO_BOOKS') || '[]');
            if (Array.isArray(freeDemoBooks)) {
                freeDemoBooks.forEach(fb => {
                    const idx = booksArray.findIndex(x => x && x.id && x.id.toUpperCase() === fb.id.toUpperCase());
                    if (idx >= 0) booksArray[idx] = { ...booksArray[idx], ...fb };
                    else booksArray.push(fb);
                });
            }
        } catch (e) {}

        // Match Landing Data
        const matchedLanding = landingArray.find(p => 
            (p.id && p.id.toUpperCase() === targetKey) ||
            (p.slug && p.slug.toLowerCase() === String(bookId).toLowerCase())
        );

        // Match Book Data
        const matchedBook = booksArray.find(item => 
            (item.id && item.id.toUpperCase() === targetKey) || 
            (item.book_id && item.book_id.toUpperCase() === targetKey) ||
            (item.slug && item.slug.toLowerCase() === String(bookId).toLowerCase())
        );

        const lHero = matchedLanding?.hero || {};

        currentBookData = {
            id: targetKey,
            name: lHero.title || matchedLanding?.title || matchedBook?.heading || matchedBook?.name || `Aarogyam Demo Book (${targetKey})`,
            heading: lHero.title || matchedLanding?.title || matchedBook?.heading || matchedBook?.name || `Aarogyam Demo Book (${targetKey})`,
            subtitle: lHero.subtitle || matchedLanding?.subtitle || matchedBook?.subtitle || 'सम्पूर्ण सचित्र प्रैक्टिकल डेमो प्रिव्यू',
            cover: lHero.cover_image || matchedLanding?.cover_image || matchedBook?.cover || matchedBook?.thumbnail || '/images/books/kharif-master-guide-2026-cover.webp',
            mrp: lHero.mrp || matchedLanding?.pricing?.original_price || matchedBook?.mrp || 299,
            offerPrice: lHero.offer_price || matchedLanding?.pricing?.offer_price || matchedBook?.offerPrice || 99,
            targetMainBook: matchedBook?.targetMainBook || (targetKey === 'BK002' ? 'BK002' : (targetKey.startsWith('BK') ? targetKey : 'BK001')),
            demoImages: matchedLanding?.demo_images || matchedLanding?.preview_images || matchedBook?.demoImages || matchedBook?.preview_images || [
                '../images/books/kharif-master-guide-2026-preview-01.webp',
                '../images/books/kharif-master-guide-2026-preview-02.webp',
                '../images/books/kharif-master-guide-2026-preview-03.webp',
                '../images/books/kharif-master-guide-2026-preview-04.webp'
            ],
            faqs: matchedLanding?.faqs || matchedBook?.faqs || [],
            customer_reviews: matchedLanding?.customer_reviews || matchedBook?.customer_reviews || [],
            audio_layer: matchedLanding?.audio_layer || matchedBook?.audio_layer || null,
            hasAudioBook: Boolean(matchedLanding?.audio_layer?.enabled !== false || matchedBook?.hasAudioBook || matchedBook?.audioUrl)
        };

        document.title = `${currentBookData.heading} (Free Demo) | Aarogyam India`;
        
        const coverEl = document.getElementById("bookCover");
        if (coverEl) coverEl.src = currentBookData.cover;

        const titleEl = document.getElementById("bookTitle");
        if (titleEl) titleEl.textContent = currentBookData.heading;

        const subTitleEl = document.getElementById("bookSubtitle");
        if (subTitleEl) subTitleEl.textContent = currentBookData.subtitle;

        const mrpEl = document.getElementById("bookMrp");
        if (mrpEl) mrpEl.textContent = "₹" + currentBookData.mrp;

        const priceEl = document.getElementById("bookPrice");
        if (priceEl) priceEl.textContent = "₹" + currentBookData.offerPrice;

        const barMrp = document.getElementById("barMrp");
        if (barMrp) barMrp.textContent = "₹" + currentBookData.mrp;

        const barOffer = document.getElementById("barOffer");
        if (barOffer) barOffer.textContent = "₹" + currentBookData.offerPrice;

        // Render Preview Slider Images
        const sliderContainer = document.querySelector(".slider-container");
        const imagesToUse = Array.isArray(currentBookData.demoImages) && currentBookData.demoImages.length > 0 
            ? currentBookData.demoImages 
            : [
                '../images/books/kharif-master-guide-2026-preview-01.webp',
                '../images/books/kharif-master-guide-2026-preview-02.webp'
            ];

        if (sliderContainer) {
            sliderContainer.innerHTML = "";
            imagesToUse.forEach((imgPath, index) => {
                let imgTag = document.createElement("img");
                let cleanSrc = (imgPath || '').trim();
                if (cleanSrc && !cleanSrc.startsWith('http') && !cleanSrc.startsWith('../') && !cleanSrc.startsWith('/')) {
                    cleanSrc = '../' + cleanSrc;
                }
                imgTag.src = cleanSrc;
                imgTag.className = index === 0 ? "preview-image active" : "preview-image";
                imgTag.alt = `Preview Page ${index + 1}`;
                imgTag.oncontextmenu = (e) => e.preventDefault();
                sliderContainer.appendChild(imgTag);
            });
        }

        // Setup Audio Section
        const audioSec = document.getElementById('demoAudioSection');
        if (audioSec) {
            if (currentBookData.hasAudioBook) {
                audioSec.style.display = 'block';
            } else {
                audioSec.style.display = 'none';
            }
        }

        // Render Dynamic Customer Reviews
        renderDemoCustomerReviews(currentBookData.customer_reviews);

        // Render Dynamic FAQs
        renderDemoFaqsList(currentBookData.faqs);

        // Setup Banner Image
        const bannerUrl = lHero.banner_image || matchedLanding?.banner_image || matchedBook?.banner || '';
        const bannerWrap = document.getElementById("demoHeroBannerWrap");
        const bannerImg = document.getElementById("demoHeroBannerImg");
        if (bannerWrap && bannerImg) {
            if (bannerUrl) {
                bannerImg.src = bannerUrl;
                bannerWrap.style.display = 'block';
            } else {
                bannerWrap.style.display = 'none';
            }
        }

        // Setup Hero Read Now Button
        const heroReadBtn = document.getElementById("demoHeroReadBtn");
        if (heroReadBtn) {
            heroReadBtn.href = `/ebooks/reader.html?book=${encodeURIComponent(targetKey)}&demo=1`;
        }

        const isFreeBook = matchedBook?.isFree === true || matchedBook?.type === 'bonus_free' || currentBookData.offerPrice === 0 || targetKey.startsWith('BONUS') || targetKey.startsWith('FREE');
        const targetMain = currentBookData.targetMainBook || (targetKey === 'BK002' ? 'BK002' : 'BK001');

        // Setup Hero Buy vs Free Download Buttons
        const heroBuyBtn = document.getElementById("demoHeroBuyBtn");
        const heroDownloadBtn = document.getElementById("demoHeroDownloadBtn");
        const buyBtn = document.getElementById("stickyBuyBtn");

        if (isFreeBook) {
            if (heroBuyBtn) heroBuyBtn.style.display = 'none';
            if (heroDownloadBtn) {
                heroDownloadBtn.style.display = 'inline-flex';
                heroDownloadBtn.href = `/ebooks/download.html?book=${encodeURIComponent(targetKey)}`;
            }
            if (buyBtn) {
                buyBtn.innerHTML = '📥 Free PDF Download';
                buyBtn.href = `/ebooks/download.html?book=${encodeURIComponent(targetKey)}`;
                buyBtn.style.background = '#ea580c';
            }
        } else {
            if (heroBuyBtn) {
                heroBuyBtn.style.display = 'inline-flex';
                heroBuyBtn.href = `../ebooks/checkout.html?product=${encodeURIComponent(targetMain)}`;
            }
            if (heroDownloadBtn) heroDownloadBtn.style.display = 'none';
            if (buyBtn) {
                buyBtn.innerHTML = '🛒 Buy Now (मात्र ₹' + currentBookData.offerPrice + ')';
                buyBtn.href = `../ebooks/checkout.html?product=${encodeURIComponent(targetMain)}`;
                buyBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
            }
        }

        const backBtn = document.getElementById("backBtn");
        if(backBtn) {
            backBtn.href = "../ebooks/my-library.html";
        }

    } catch (error) {
        console.error("Error loading book data:", error);
        showToast("डेटा लोड करने में समस्या हुई।");
    }
}

function renderDemoCustomerReviews(reviews) {
    const wrap = document.getElementById('demoReviewsContainer');
    if (!wrap) return;

    const defaultReviews = [
        { name: 'रामेश्वर पटेल', role: 'प्रगतिशील किसान, इंदौर', comment: 'यह पुस्तक बहुत ही उपयोगी है। इसमें दी गई दवाइयों की मात्रा और स्प्रे का समय बिल्कुल सटीक है।' },
        { name: 'विकास शर्मा', role: 'कृषि सलाहकार, उज्जैन', comment: 'रंगीन तस्वीरों के साथ रोगों की पहचान इतनी आसान हो गई है कि कोई भी किसान खुद समस्या समझ सकता है।' },
        { name: 'दिनेश कुमार', role: 'कृषक, जबलपुर', comment: 'मात्र ₹99 में इतनी बहुमूल्य जानकारी मिलना बहुत बड़ी बात है। सभी किसान भाइयों को पढ़ना चाहिए।' }
    ];

    const list = Array.isArray(reviews) && reviews.length > 0 ? reviews : defaultReviews;
    wrap.innerHTML = list.map(r => `
        <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #16a34a;border-radius:10px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            <div style="color:#f59e0b;font-size:0.95rem;margin-bottom:4px;">★★★★★</div>
            <p style="color:#334155;font-size:0.9rem;line-height:1.5;margin:0 0 8px 0;font-style:italic;">"${escapeHtml(r.comment || r.text || '')}"</p>
            <div style="font-weight:800;color:#0f172a;font-size:0.86rem;">${escapeHtml(r.name || 'किसान मित्र')} <span style="font-weight:400;color:#64748b;font-size:0.78rem;">• ${escapeHtml(r.role || r.location || 'सत्यापित पाठक')}</span></div>
        </div>
    `).join('');
}

function renderDemoFaqsList(faqs) {
    const wrap = document.getElementById('demoFaqContainer');
    if (!wrap) return;

    const defaultFaqs = [
        { question: 'क्या पेमेंट के बाद किताब तुरंत मिल जाएगी?', answer: 'हाँ, पेमेंट सफल होते ही पुस्तक तुरंत आपकी My Library में सक्रिय हो जाएगी और आप इसे कभी भी पढ़ सकते हैं।' },
        { question: 'क्या मैं इसे अपने मोबाइल में पढ़ सकता/सकती हूँ?', answer: 'हाँ, यह संपूर्ण रूप से मोबाइल फ्रेंडली है और सभी स्मार्टफोन्स पर आसानी से खुलती है।' },
        { question: 'क्या इसके साथ ऑडियो भी उपलब्ध है?', answer: 'हाँ, ऑडियो बुक नरेशन के साथ आप किताब पढ़ते हुए प्राकृतिक आवाज में सुन भी सकते हैं।' }
    ];

    const list = Array.isArray(faqs) && faqs.length > 0 ? faqs : defaultFaqs;
    wrap.innerHTML = list.map((f, i) => `
        <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;cursor:pointer;">
            <summary style="font-weight:700;color:#1e293b;font-size:0.92rem;outline:none;">${i+1}. ${escapeHtml(f.question || f.q || '')}</summary>
            <p style="color:#475569;font-size:0.86rem;line-height:1.5;margin:8px 0 0 0;">${escapeHtml(f.answer || f.a || '')}</p>
        </details>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/*==================================================
  AUDIO PLAYER ENGINE FOR DEMO PREVIEW
==================================================*/
window.toggleDemoAudioPlay = function() {
    const playBtn = document.getElementById('demoPlayAudioBtn');
    const playIcon = document.getElementById('demoAudioPlayIcon');
    const playText = document.getElementById('demoAudioPlayText');

    if (isDemoAudioPlaying) {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (demoAudioInstance) {
            try { demoAudioInstance.pause(); } catch(e) {}
        }
        isDemoAudioPlaying = false;
        if (playIcon) playIcon.textContent = '▶️';
        if (playText) playText.textContent = 'ऑडियो सुनें';
        showToast('⏹️ ऑडियो रोक दिया गया');
        return;
    }

    const title = currentBookData?.heading || 'आरोग्यम इंडिया ई-बुक';
    const subtitle = currentBookData?.subtitle || '';
    const textToSpeak = `नमस्ते! आरोग्यम इंडिया में आपका स्वागत है। आप सुन रहे हैं ${title} का डेमो प्रिव्यू। ${subtitle}। संपूर्ण प्रैक्टिकल गाइड प्राप्त करने के लिए नीचे दिए गए Buy Now बटन पर क्लिक करें।`;

    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            isDemoAudioPlaying = false;
            if (playIcon) playIcon.textContent = '▶️';
            if (playText) playText.textContent = 'ऑडियो सुनें';
        };

        utterance.onerror = () => {
            isDemoAudioPlaying = false;
            if (playIcon) playIcon.textContent = '▶️';
            if (playText) playText.textContent = 'ऑडियो सुनें';
        };

        window.speechSynthesis.speak(utterance);
        isDemoAudioPlaying = true;
        if (playIcon) playIcon.textContent = '⏸️';
        if (playText) playText.textContent = 'रोकें (Pause)';
        showToast('🎧 ऑडियो चालू है...');
    } else {
        showToast('आपके ब्राउज़र में स्पीच ऑडियो समर्थित नहीं है');
    }
};

/*==================================================
  DEMO SMART REFERRAL SHARING FUNCTION
==================================================*/
window.handleDemoBookShare = function() {
    const bId = (currentBookData?.id || 'BK001').toUpperCase();
    const title = currentBookData?.heading || currentBookData?.name || 'Aarogyam India eBook Demo';
    let userShareId = 'AI000004';
    try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        if (u.share_id || u.ref_code || u.phone || u.mobile) {
            userShareId = u.share_id || u.ref_code || u.phone || u.mobile;
        }
    } catch(e) {}

    const origin = (window.location.origin && window.location.origin !== 'null') ? window.location.origin : 'https://aarogyamindia.online';
    const shareUrl = `${origin}/ebooks/demo-kharif.html?id=${encodeURIComponent(bId)}&share_id=${encodeURIComponent(userShareId)}&source=demo_share`;
    const shareText = `🌾 *${title}* का फ्री डेमो प्रिव्यू देखें!\n\n👉 यहाँ क्लिक करके तुरंत फ्री डेमो पढ़ें:\n${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText,
            url: shareUrl
        }).catch(() => {});
        return;
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('📋 शेयर लिंक व संदेश कॉपी हो गया!');
        }).catch(() => {});
    }

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    const waUrl = isMobile 
        ? `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}` 
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
};

/*==================================================
  2. DOM ELEMENTS & UTILITIES
==================================================*/
const demoForm = document.getElementById("demoForm");
const formSection = document.querySelector(".demo-form-section");
const demoPreview = document.getElementById("demoPreview");
const previewSlider = document.querySelector(".preview-slider");
const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const emailInput = document.getElementById("email");
const stateInput = document.getElementById("state");
const districtInput = document.getElementById("district");
const refInputEl = document.getElementById("referralMobile");

function showLoader() { if(loader) loader.style.display = "flex"; }
function hideLoader() { if(loader) loader.style.display = "none"; }

function showToast(message) {
    if(!toast) return;
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/*==================================================
  INITIALIZE PAGE: AUTO-UNLOCK IF ALREADY LOGGED IN
==================================================*/
function initializePage() {
    hideLoader();

    // Check if user is ALREADY registered / logged in
    let isLoggedIn = false;
    try {
        const localUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        if (localUser && (localUser.mobile || localUser.phone || localUser.id || localUser.name)) {
            isLoggedIn = true;
        }
    } catch (e) {}

    if (isLoggedIn) {
        // User is already logged in -> auto-unlock demo preview without showing form!
        console.log("⚡ Logged in user detected. Auto-unlocking demo preview.");
        unlockDemo(true);
    } else {
        // New user -> show lead registration form
        if(demoPreview) demoPreview.style.display = "none";
        if(previewSlider) previewSlider.style.display = "none";
        if(formSection) formSection.style.display = "block";
    }
}

/*==================================================
  3. VALIDATION & SUPABASE DATA SAVE
==================================================*/
function validateForm() {
    const name = nameInput.value.trim();
    if (name.length < 3) {
        showToast("कृपया पूरा नाम दर्ज करें");
        nameInput.focus();
        return false;
    }

    const mobile = mobileInput.value.trim();
    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobilePattern.test(mobile)) {
        showToast("सही 10 अंकों का मोबाइल नंबर दर्ज करें");
        mobileInput.focus();
        return false;
    }
    return true;
}

/* ==================================================
  4. FORM SUBMIT EVENT (डेमो फॉर्म सबमिट और स्मार्ट रेफरल बाइंडिंग)
================================================== */
if(demoForm) {
    demoForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!validateForm()) return;

        showLoader();

        const shareContextData = syncDemoShareContext();
        const enteredReferral = refInputEl ? refInputEl.value.trim() : 'AI000004';
        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || enteredReferral;
        const sourceVal = shareContextData.source || "demo";
        const landingPageVal = shareContextData.landing_url || window.location.pathname;

        const userName = nameInput.value.trim();
        const userMobile = mobileInput.value.trim();

        const userData = {
            bookId: currentBookData ? currentBookData.id : "BK001",
            name: userName,
            mobile: userMobile,
            email: emailInput.value.trim(),
            state: stateInput.value.trim(),
            district: districtInput.value.trim(),
            referred_by: finalUuid,
            referralMobile: finalReferralMobile,
            referralCode: finalReferralCode,
            source: sourceVal,
            landing_page: landingPageVal
        };

        // Save into local session as logged-in user so they don't have to fill again
        try {
            const userProfile = {
                id: 'usr_' + userMobile,
                full_name: userName,
                name: userName,
                mobile: userMobile,
                phone: userMobile,
                email: userData.email,
                state: userData.state,
                district: userData.district,
                is_active: true,
                created_at: new Date().toISOString()
            };
            localStorage.setItem('AI_USER', JSON.stringify(userProfile));
            localStorage.setItem('AI_PROFILE', JSON.stringify(userProfile));
        } catch (e) {}

        // Main Registration Sync
        if (typeof registerUser === "function") {
            try {
                await registerUser({
                    fullName: userData.name,
                    mobile: userData.mobile,
                    email: userData.email,
                    referred_by: userData.referred_by,
                    referralMobile: userData.referralMobile,
                    referralCode: userData.referralCode,
                    source: sourceVal,
                    landing_page: landingPageVal
                });
            } catch (regErr) {
                console.log("Demo reg sync note:", regErr);
            }
        }

        // Demo User Database Log
        if (typeof saveDemoUser === "function") {
            try {
                await saveDemoUser(userData);
            } catch (e) {}
        }

        hideLoader();
        unlockDemo(false); 
    });
}

/* ==================================================
  DEMO UNLOCK FUNCTION (डेमो स्क्रीन दिखाने का फंक्शन)
================================================== */
function unlockDemo(silent = false) {
    if(formSection) formSection.style.display = "none"; 
    if(demoPreview) demoPreview.style.display = "block";
    if(previewSlider) previewSlider.style.display = "block"; 
    if (!silent) {
        showToast("🎉 Demo सफलतापूर्वक Unlock हो गया!");
    }
    setupSliderImages();
}

/* ==================================================
  5. IMAGE SLIDER & VIEWER LOGIC
================================================== */
let prevBtn, nextBtn;

function setupEventListeners() {
    setupSliderImages();
}

function setupSliderImages() {
    previewImages = document.querySelectorAll(".preview-image");
    prevBtn = document.querySelector(".prev-btn");
    nextBtn = document.querySelector(".next-btn");

    if(nextBtn) nextBtn.onclick = nextImage;
    if(prevBtn) prevBtn.onclick = previousImage;

    if(previewSlider) {
        let touchStartX = 0;
        let touchEndX = 0;
        previewSlider.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        previewSlider.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) nextImage();
            else if (touchEndX - touchStartX > 50) previousImage();
        });
    }

    previewImages.forEach((image, index) => {
        image.onclick = () => {
            currentIndex = index;
            openViewer();
        };
    });
}

function showImage(index) {
    previewImages.forEach((image) => image.classList.remove("active"));
    if(previewImages[index]) previewImages[index].classList.add("active");
}

function nextImage() {
    if(previewImages.length === 0) return;
    currentIndex++;
    if (currentIndex >= previewImages.length) currentIndex = 0;
    showImage(currentIndex);
    updateViewerImage();
}

function previousImage() {
    if(previewImages.length === 0) return;
    currentIndex--;
    if (currentIndex < 0) currentIndex = previewImages.length - 1;
    showImage(currentIndex);
    updateViewerImage();
}

const imageViewer = document.getElementById("imageViewer");
const viewerImage = document.getElementById("viewerImage");
const viewerPrev = document.querySelector(".viewer-prev");
const viewerNext = document.querySelector(".viewer-next");
const closeViewer = document.querySelector(".close-viewer");

function openViewer() {
    if(!imageViewer || !viewerImage) return;
    viewerImage.src = previewImages[currentIndex].src;
    imageViewer.style.display = "flex";
    viewerImage.oncontextmenu = (e) => e.preventDefault();
}

if(viewerNext) viewerNext.onclick = () => { nextImage(); };
if(viewerPrev) viewerPrev.onclick = () => { previousImage(); };
if(closeViewer) closeViewer.onclick = () => { closeImageModal(); };

if(imageViewer) {
    imageViewer.onclick = (e) => {
        if (e.target === imageViewer) closeImageModal();
    };
}

function closeImageModal() {
    if(imageViewer) imageViewer.style.display = "none";
    resetViewerZoom();
}

document.addEventListener("keydown", (event) => {
    if (!imageViewer || imageViewer.style.display !== "flex") return;
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "Escape") closeImageModal();
});

let zoomed = false;
let startX = 0, startY = 0, currentX = 0, currentY = 0, isDragging = false;

if(viewerImage) {
    viewerImage.ondblclick = () => {
        zoomed = !zoomed;
        if (zoomed) {
            viewerImage.style.transform = "scale(2)";
            viewerImage.style.cursor = "zoom-out";
        } else {
            resetViewerZoom();
        }
    };

    viewerImage.addEventListener("touchstart", (e) => {
        if (!zoomed) return;
        isDragging = true;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
    });

    viewerImage.addEventListener("touchmove", (e) => {
        if (!zoomed || !isDragging) return;
        e.preventDefault();
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
        viewerImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(2)`;
    }, { passive: false });

    viewerImage.addEventListener("touchend", () => { isDragging = false; });
}

function updateViewerImage() {
    if (imageViewer && imageViewer.style.display === "flex" && viewerImage) {
        viewerImage.src = previewImages[currentIndex].src;
    }
}

function resetViewerZoom() {
    zoomed = false;
    currentX = 0;
    currentY = 0;
    if(viewerImage) {
        viewerImage.style.transform = "scale(1)";
        viewerImage.style.cursor = "zoom-in";
    }
}

closeViewer.addEventListener("click", resetViewerZoom);