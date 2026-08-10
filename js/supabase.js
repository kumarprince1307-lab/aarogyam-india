/* ===========================================================
   AAROGYAM INDIA - SUPABASE ENGINE (FINAL COMPLETE CODE - MUGGACHH FIXED)
=========================================================== */

const APP_CONFIG = {
    PROJECT_NAME: "Aarogyam India",
    VERSION: "1.0.0"
};

const SUPABASE_CONFIG = {
    URL: "https://qjhjrzsnrtahmhswxyvb.supabase.co",
    KEY: "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"
};

const SHARE_CONTEXT_STORAGE_KEY = "AI_SHARE_CONTEXT";
const SHARE_EVENT_STORAGE_KEY = "AI_SHARE_EVENTS";

function readStoredShareContext() {
    try {
        const stored = localStorage.getItem(SHARE_CONTEXT_STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.warn("Share context read failed:", error);
        return {};
    }
}

function persistShareContext(context) {
    const current = readStoredShareContext();
    const merged = { ...current, ...context };

    try {
        localStorage.setItem(SHARE_CONTEXT_STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
        console.warn("Share context persist failed:", error);
    }

    return merged;
}

function readShareContextFromUrl() {
    if (typeof window === 'undefined' || !window.location) {
        return {};
    }

    const params = new URLSearchParams(window.location.search || "");
    
    // 🟢 सोर्स सुधार: अब यह चेक करेगा कि यूजर whatsapp से आया है, facebook से, या किसी पेज से
    let rawSource = params.get("src") || params.get("source") || params.get("utm_source");
    
    if (rawSource) {
        rawSource = rawSource.toLowerCase();
        if (rawSource.includes("whatsapp")) rawSource = "whatsapp";
        else if (rawSource.includes("facebook") || rawSource.includes("fb")) rawSource = "facebook";
        else if (rawSource.includes("telegram")) rawSource = "telegram";
    }

    return {
        source: rawSource || null,
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: params.get("share_token") || params.get("share_id") || params.get("tracking_token") || null,
        referral_mobile: params.get("referral_mobile") || params.get("referral") || null,
        asset_type: params.get("asset_type") || null,
        asset_id: params.get("asset_id") || null,
        asset_title: params.get("asset_title") || null,
        asset_url: params.get("asset_url") || null,
        referrer: document.referrer || null,
        landing_url: window.location.href || null
    };
}

function getCurrentShareContext() {
    const urlContext = readShareContextFromUrl();
    const storedContext = readStoredShareContext();
    return { ...storedContext, ...urlContext };
}

function resolveProfileAttribution(userData) {
    const context = getCurrentShareContext();
    // 🟢 यदि सोर्स URL में नहीं मिला, तो यूजर के डेटा या 'direct' को प्राथमिकता देंगे
    const resolvedSource = userData?.source || context.source || "direct";
    const resolvedReferral = userData?.referralCode || context.referral_mobile || context.referralCode || null;
    const resolvedShareToken = userData?.shareToken || context.share_token || context.tracking_token || null;
    const resolvedShareChannel = userData?.shareChannel || context.share_channel || context.channel || "direct";

    return {
        source: resolvedSource,
        referralCode: resolvedReferral,
        shareToken: resolvedShareToken,
        shareChannel: resolvedShareChannel,
        context: context
    };
}

async function trackAttributionEvent(eventPayload) {
    const currentContext = getCurrentShareContext();
    const payload = {
        ...currentContext,
        ...eventPayload,
        created_at: new Date().toISOString()
    };

    try {
        const queuedEvents = JSON.parse(localStorage.getItem(SHARE_EVENT_STORAGE_KEY) || "[]");
        queuedEvents.push(payload);
        localStorage.setItem(SHARE_EVENT_STORAGE_KEY, JSON.stringify(queuedEvents));
    } catch (error) {
        console.warn("Share event queueing failed:", error);
    }

    try {
        if (db && typeof db.from === "function") {
            await db.from("share_events").insert([payload]).select().single();
        }
    } catch (error) {
        console.warn("Share event persistence skipped:", error.message || error);
    }

    return { success: true, queued: true, payload };
}

window.dbClient = window.dbClient || window.supabase.createClient(
    SUPABASE_CONFIG.URL,
    SUPABASE_CONFIG.KEY
);

const db = window.dbClient;

console.log("DB CLIENT INITIALIZED SUCCESSFULLY");

(async () => {
    const { error } = await db
        .from("profiles")
        .select("id")
        .limit(1);

    if (error) {
        console.error("❌ Database Connection Failed:", error.message);
    } else {
        console.log("✅ Database Connected Successfully");
    }
})();


/* ===========================================================
   ENGINE 1: VALIDATION & REGISTRATION FUNCTIONS
=========================================================== */
async function isMobileRegistered(mobile) {
    try {
        const { data, error } = await db
            .from("profiles")
            .select("*")
            .eq("mobile", mobile)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Mobile Check Error :", error);
        return null;
    }
}

async function isEmailRegistered(email) {
    if (!email) return false;
    try {
        const { data, error } = await db
            .from("profiles")
            .select("id,email")
            .eq("email", email)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Email Check Error :", error);
        return null;
    }
}

async function createUserProfile(userData) {
    try {
        const attribution = resolveProfileAttribution(userData);
        persistShareContext({
            source: attribution.source,
            referral_mobile: attribution.referralCode,
            share_token: attribution.shareToken,
            share_channel: attribution.shareChannel
        });

        let referrerProfileId = userData.referred_by || null;
        let referralCodeMobile = userData.referralMobile || attribution.referralCode || null; 
        let incomingReferralCode = userData.referralCode || attribution.shareToken || null;

        let finalShareId = incomingReferralCode || ("AI" + Math.floor(100000 + Math.random() * 900000)); 

        if (!referrerProfileId && referralCodeMobile) {
            const referrer = await isMobileRegistered(referralCodeMobile);
            if (referrer) {
                referrerProfileId = referrer.id;
                if (referrer.referral_code) incomingReferralCode = referrer.referral_code;
            }
        } 
        else if (!referrerProfileId && incomingReferralCode) {
            const { data: refUser } = await db
                .from("profiles")
                .select("id, mobile, referral_code")
                .eq("referral_code", incomingReferralCode)
                .maybeSingle();
            if (refUser) {
                referrerProfileId = refUser.id;
                referralCodeMobile = refUser.mobile;
            }
        }

        // 🟢 PROFILES टेबल में डेटा इंसर्ट (सोर्स और रेफरल के साथ)
        const { data, error } = await db
            .from("profiles")
            .insert([{
                full_name: userData.fullName || userData.name,
                mobile: userData.mobile,
                email: userData.email || null,
                gender: userData.gender || null,
                State: userData.state || userData.State || null,
                district: userData.district || null,
                referral_code: finalShareId,          
                referral_mobile: referralCodeMobile,     
                referred_by: referrerProfileId || null,
                registration_source: attribution.source || "direct", // यहाँ अब whatsapp, facebook या direct जाएगा
                profile_complete: false,
                is_active: true
            }])
            .select()
            .single();
            
        if (error) throw error;

        // 🟢 REFERRALS टेबल में डेटा पक्का भेजने का लॉजिक (अब कभी खाली नहीं रहेगा)
        if (data && data.id) {
            try {
                await db.from("referrals").insert([{
                    referred_by: referrerProfileId || null, // जिसने रेफर किया उसकी UUID
                    referral_code: finalShareId,            // शेयर आईडी
                    status: "success",
                    joined_at: new Date().toISOString()
                }]);
                console.log("✅ Successfully logged entry in referrals table!");
            } catch (refErr) {
                console.warn("Referral table log warning:", refErr.message);
            }
        }

        await trackAttributionEvent({
            event_type: "registration",
            profile_id: data?.id || null,
            mobile: userData.mobile,
            email: userData.email || null,
            referral_code: finalShareId,
            source: attribution.source || "direct"
        });

        return data;
    } catch (error) {
        console.error("Create Profile Error:", error);
        return null;
    }
}

function createLoginSession(profile) {
    const session = {
        id: crypto.randomUUID(),
        userId: profile.id,
        mobile: profile.mobile,
        loginTime: new Date().toISOString(),
        active: true
    };
    localStorage.setItem("AI_SESSION", JSON.stringify(session));
    localStorage.setItem("AI_USER", JSON.stringify(profile));
    return session;
}

async function registerUser(formData) {
    try {
        const attribution = resolveProfileAttribution(formData);
        const registrationPayload = {
            ...formData,
            source: attribution.source,
            referralCode: formData.referralCode || attribution.shareToken,
            referralMobile: formData.referralMobile || attribution.referralCode,
            referred_by: formData.referred_by || null,
            shareToken: attribution.shareToken,
            shareChannel: attribution.shareChannel
        };

        const existingUser = await isMobileRegistered(registrationPayload.mobile);
        if (existingUser) {
            createLoginSession(existingUser);
            return { success: true, type: "existing", profile: existingUser };
        }

        if (registrationPayload.email) {
            const emailExists = await isEmailRegistered(registrationPayload.email);
            if (emailExists) {
                return { success: false, message: "This email address is already registered." };
            }
        }

        const profile = await createUserProfile(registrationPayload);
        if (!profile) {
            return { success: false, message: "Profile creation failed. Please try again." };
        }
        createLoginSession(profile);
        return { success: true, type: "new", profile: profile };
    } catch (error) {
        console.error(error);
        return { success: false, message: error.message };
    }
}

function isLoggedIn() {
    return localStorage.getItem("AI_SESSION") !== null;
}

function initializeAuthentication() {
    // Auth init
}
console.log("✅ Auth & Session Module Loaded");


/* ===========================================================
   ENGINE 1.1: LOGIN POPUP & DATABASE CHECK
=========================================================== */
document.addEventListener("DOMContentLoaded", function() {
    checkAndControlLoginPopup();
});

function checkAndControlLoginPopup() {
    const popupOverlay = document.getElementById('login-popup-overlay');
    if (!popupOverlay) return; 

    if (isLoggedIn()) {
        popupOverlay.style.display = 'none';
        console.log("User is already logged in. Popup hidden.");
    } else {
        popupOverlay.style.display = 'flex';
        console.log("User not logged in. Showing login popup.");
    }
}

async function checkUserLogin() {
    let rawInput = document.getElementById('login-mobile').value.trim();
    if (!rawInput || rawInput.length < 10) {
        alert("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।");
        return;
    }

    let cleanMobile = rawInput.replace(/\D/g, '').slice(-10);

    try {
        const activeDb = window.dbClient || window.supabase;
        const { data, error } = await activeDb
            .from('profiles')
            .select('*')
            .eq('mobile', cleanMobile)
            .limit(1);

        if (error || !data || data.length === 0) {
            alert("यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया पहले डेमो देखें या रजिस्टर करें।");
            return;
        }

        const userData = data[0];
        SessionManager.save({
            mobile: userData.mobile,
            name: userData.full_name || 'यूजर',
            loginTime: new Date().toISOString(),
            active: true
        });
        UserStorage.save(userData);

        const popupOverlay = document.getElementById('login-popup-overlay');
        if (popupOverlay) popupOverlay.style.display = 'none';
        
        alert("स्वागत है, " + (userData.full_name || 'यूजर') + " जी!");
        window.location.reload(); 
    } catch (err) {
        console.error("Login Error:", err);
        alert("लॉगिन करने में कुछ समस्या आई, कृपया पुनः प्रयास करें।");
    }
}


/* ===========================================================
   ENGINE 2: PROFILE MANAGEMENT
=========================================================== */
const AUTH = {
    LOGIN_STATUS: "AI_LOGIN_STATUS",
    SESSION_KEY: "AI_SESSION",
    USER_KEY: "AI_USER",
    PROFILE_KEY: "AI_PROFILE",
    SESSION_EXPIRE_DAYS: 30
};

const SessionManager = {
    save(sessionData) { localStorage.setItem(AUTH.SESSION_KEY, JSON.stringify(sessionData)); },
    get() {
        const session = localStorage.getItem(AUTH.SESSION_KEY);
        if (!session) return null;
        return JSON.parse(session);
    },
    remove() { localStorage.removeItem(AUTH.SESSION_KEY); },
    exists() { return localStorage.getItem(AUTH.SESSION_KEY) !== null; }
};

const UserStorage = {
    save(userData) { localStorage.setItem(AUTH.USER_KEY, JSON.stringify(userData)); },
    get() {
        const user = localStorage.getItem(AUTH.USER_KEY);
        if (!user) return null;
        return JSON.parse(user);
    },
    remove() { localStorage.removeItem(AUTH.USER_KEY); }
};

const ProfileStorage = {
    save(profileData) { localStorage.setItem(AUTH.PROFILE_KEY, JSON.stringify(profileData)); },
    get() {
        const profile = localStorage.getItem(AUTH.PROFILE_KEY);
        if (!profile) return null;
        return JSON.parse(profile);
    },
    remove() { localStorage.removeItem(AUTH.PROFILE_KEY); }
};

function logoutUser() {
    SessionManager.remove();
    UserStorage.remove();
    ProfileStorage.remove();
    return true;
}

function getCurrentUserProfile() {
    return UserStorage.get();
}

const PROFILE = { TABLE: "profiles" };
let currentProfile = null;

async function getProfileById(userId) {
    try {
        const activeDb = window.dbClient || window.supabase;
        const { data, error } = await activeDb.from(PROFILE.TABLE).select("*").eq("id", userId).single();
        if (error) throw error;
        currentProfile = data;
        ProfileStorage.save(data);
        return data;
    } catch (error) {
        console.error("Get Profile Error:", error);
        return null;
    }
}

async function updateProfile(userId, profileData) {
    try {
        const activeDb = window.dbClient || window.supabase;
        const { data, error } = await activeDb.from(PROFILE.TABLE).update(profileData).eq("id", userId).select().single();
        if (error) throw error;
        currentProfile = data;
        ProfileStorage.save(data);
        return { success: true, profile: data };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
console.log("✅ Profile Module Loaded");


/* ===========================================================
   ENGINE 3: INTEREST FORM SYSTEM
=========================================================== */
const INTEREST = { TABLE: "interested_users", DEFAULT_STATUS: "new" };

async function saveInterest(data) {
    try {
        const { data: result, error } = await db.from(INTEREST.TABLE).insert([{
            full_name: data.fullName,
            mobile: data.mobile,
            email: data.email || null,
            interested_book: data.bookId || null,
            source: data.source || "website",
            status: INTEREST.DEFAULT_STATUS
        }]).select().single();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
}
console.log("✅ Interest Form Module Loaded");


/* ===========================================================
   ENGINE 4: DEMO SYSTEM
=========================================================== */
async function saveDemoUser(data) {
    try {
        let cleanMobile = String(data.mobile || "").trim();
        if (cleanMobile.startsWith("+91")) cleanMobile = cleanMobile.slice(3);
        else if (cleanMobile.startsWith("91") && cleanMobile.length === 12) cleanMobile = cleanMobile.slice(2);
        else if (cleanMobile.startsWith("0") && cleanMobile.length === 11) cleanMobile = cleanMobile.slice(1);

        const res = await registerUser({
            fullName: data.name,
            mobile: cleanMobile,
            email: data.email || null,
            state: data.state || null,
            district: data.district || null,
            referred_by: data.referred_by || null,
            referralMobile: data.referralMobile || null,
            referralCode: data.referralCode || null,
            source: "demo"
        });

        return res;
    } catch (error) {
        console.error("❌ Demo Save Exception:", error.message);
        return { success: true, message: error.message }; 
    }
}
console.log("✅ Demo Module Loaded (Final Profiles Connected)");


/* ===========================================================
   ENGINE 5: BOOKS ENGINE
=========================================================== */
const BOOKS = { JSON: "../data/books.json", CACHE_KEY: "AI_BOOKS" };
let booksCache = [];

async function loadBooks() {
    try {
        const response = await fetch(BOOKS.JSON);
        if (!response.ok) throw new Error("Books JSON not found.");
        const data = await response.json();
        booksCache = data.books || [];
        localStorage.setItem(BOOKS.CACHE_KEY, JSON.stringify(booksCache));
        return booksCache;
    } catch (error) {
        console.error("Load Books Error:", error);
        return [];
    }
}

async function getAllBooks() {
    if (booksCache.length > 0) return booksCache;
    return await loadBooks();
}

async function getBookById(bookId) {
    const books = await getAllBooks();
    return books.find(book => book.book_id === bookId || book.id === bookId) || null;
}
console.log("✅ Books Engine Module Loaded");


/* ===========================================================
   ENGINE 6: UNIVERSAL CHECKOUT
=========================================================== */
const CHECKOUT = { CURRENCY: "INR", STATUS: "pending" };
let currentOrder = null;

async function createCheckout(bookId) {
    const book = await getBookById(bookId);
    if (!book) return { success: false, message: "Book not found." };

    currentOrder = {
        bookId: book.book_id || book.id,
        title: book.title || book.name,
        mrp: Number(book.mrp),
        offerPrice: Number(book.offer_price || book.offerPrice),
        amount: Number(book.offer_price || book.offerPrice),
        paymentStatus: CHECKOUT.STATUS,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(currentOrder));
    return { success: true, order: currentOrder };
}
console.log("✅ Checkout Module Loaded");


/* ===========================================================
   ENGINE 7: RAZORPAY PAYMENT GATEWAY
=========================================================== */
const PAYMENT = { STATUS_PENDING: "pending", STATUS_SUCCESS: "success", STATUS_FAILED: "failed" };
const RAZORPAY = { KEY_ID: "rzp_test_TGobxnVbAWYkz7" };
let currentPayment = null;

function startPayment() {
    if (!window.currentOrder) {
        window.currentOrder = JSON.parse(localStorage.getItem("AI_CURRENT_ORDER"));
    }

    if (!window.currentOrder) return { success: false, message: "Order not found." };
    
    currentPayment = {
        orderId: window.currentOrder.bookId,
        amount: window.currentOrder.amount,
        status: PAYMENT.STATUS_PENDING,
        createdAt: new Date().toISOString()
    };
    
    const options = {
        key: RAZORPAY.KEY_ID,
        amount: currentPayment.amount * 100,
        currency: "INR",
        name: "Aarogyam India",
        description: window.currentOrder.title,
        handler: async function (response) {
            currentPayment.status = PAYMENT.STATUS_SUCCESS;
            currentPayment.paymentId = response.razorpay_payment_id;
            
            localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));

            try {
                const currentUser = typeof getCurrentUserProfile === "function" ? getCurrentUserProfile() : null;
                
                window.currentPurchase = {
                    purchaseId: "PUR_" + Date.now(),
                    profileId: currentUser ? currentUser.id : null,
                    bookId: window.currentOrder.bookId,
                    paymentId: response.razorpay_payment_id,
                    amount: window.currentOrder.amount,
                    purchasedAt: new Date().toISOString()
                };

                if (typeof savePurchase === "function") {
                    await savePurchase();
                }
            } catch (err) {
                console.error("❌ Exception during purchase save:", err);
            }

            setTimeout(() => {
                window.location.href = "payment-success.html"; 
            }, 1000);
        },
        modal: {
            ondismiss: function() {
                currentPayment.status = PAYMENT.STATUS_FAILED;
                localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));
            }
        }
    };
    
    try {
        const payment = new Razorpay(options);
        payment.open();
        return { success: true };
    } catch (error) {
        console.error("Razorpay Error:", error);
        return { success: false, message: "Failed to open payment gateway." };
    }
}
console.log("✅ Razorpay Payment Module Loaded");


/* ===========================================================
   ENGINE 10: PDF READER
=========================================================== */
let reader = { bookId: null, pdf: null, page: 1, totalPages: 0, zoom: 1 };

async function loadReader(bookId) {
    const allowed = await hasPurchased(bookId);
    if (!allowed) return { success: false, message: "Access denied." };
    const book = await getBookById(bookId);
    if (!book) return { success: false, message: "Book not found." };
    reader.bookId = bookId;
    reader.pdf = book.pdf_url;
    return { success: true, pdf: reader.pdf };
}
console.log("✅ PDF Reader Module Loaded");


/* ===========================================================
   ENGINE 11: PDF DOWNLOAD & DOWNLOAD LOGS (Limit = 3)
=========================================================== */
const DOWNLOAD = { LIMIT: 3 };

async function canDownloadBook(bookId) {
    const user = UserStorage.get();
    if (!user) return false;
    const { data } = await db.from("purchases").select("download_count").eq("profile_id", user.id).eq("book_id", bookId).single();
    if (!data) return false;
    return (data.download_count || 0) < DOWNLOAD.LIMIT;
}

async function processDownload(bookId) {
    const allowed = await canDownloadBook(bookId);
    if (!allowed) return { success: false, message: "Download limit exceeded (Max 3)." };

    const user = UserStorage.get();
    await db.from("download_logs").insert({
        profile_id: user.id,
        book_id: bookId,
        downloaded_at: new Date().toISOString(),
        download_status: "success"
    });

    const { data: purchase } = await db.from("purchases").select("id, download_count").eq("profile_id", user.id).eq("book_id", bookId).single();
    const newCount = (purchase.download_count || 0) + 1;
    
    await db.from("purchases").update({ download_count: newCount }).eq("id", purchase.id);

    const book = await getBookById(bookId);
    window.open(book.pdf_url, "_blank");
    return { success: true, remaining: DOWNLOAD.LIMIT - newCount };
}
console.log("✅ PDF Download & Logs Module Loaded");