/* ===========================================================
   AAROGYAM INDIA - SUPABASE ENGINE (100% COMPLETE & MUGGACHH FIXED)
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
        const activeDb = window.dbClient || window.supabase;
        if (activeDb && typeof activeDb.from === "function") {
            const tableName = "share_logs"; 
            const { error } = await activeDb.from(tableName).insert([payload]);
            if (error) {
                console.error("❌ Error saving share log to DB:", error.message);
            } else {
                console.log("🔥 SUCCESS: Share log saved to Supabase!");
            }
        }
    } catch (error) {
        console.warn("Share event persistence skipped:", error.message || error);
    }

    return { success: true, queued: true, payload };
}

try {
    if (!window.dbClient && typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
        window.dbClient = window.supabase.createClient(
            SUPABASE_CONFIG.URL,
            SUPABASE_CONFIG.KEY
        );
    }
} catch (e) {
    console.warn("Supabase client init notice:", e);
}

const db = window.dbClient;


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

const MASTER_ACCOUNT = {
    UUID: "52ef705c-bb45-4137-bee4-a3f8df73b676",
    SHARE_ID: "AI000004",
    MOBILE: "7974422572"
};

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

        // 1. यदि रेफरल कोड AI000004 है या डायरेक्ट विज़िटर है, तो बिना DB क्वेरी किए मास्टर अकाउंट से मैप करें (Zero Egress)
        if (incomingReferralCode === 'AI000004' || incomingReferralCode === MASTER_ACCOUNT.SHARE_ID) {
            referrerProfileId = MASTER_ACCOUNT.UUID;
            referralCodeMobile = referralCodeMobile || MASTER_ACCOUNT.MOBILE;
            incomingReferralCode = MASTER_ACCOUNT.SHARE_ID;
        } 
        // 2. यदि किसी अन्य यूजर का मोबाइल नंबर दिया गया है
        else if (!referrerProfileId && referralCodeMobile && /^[6-9]\d{9}$/.test(referralCodeMobile)) {
            const referrer = await isMobileRegistered(referralCodeMobile);
            if (referrer) {
                referrerProfileId = referrer.id;
                incomingReferralCode = referrer.share_id || referrer.referral_code || incomingReferralCode;
            }
        } 
        // 3. यदि किसी अन्य यूजर का Share ID दिया गया है
        else if (!referrerProfileId && incomingReferralCode) {
            try {
                const { data: refUser } = await db
                    .from("profiles")
                    .select("id, mobile, share_id, referral_code")
                    .or(`share_id.eq.${incomingReferralCode},referral_code.eq.${incomingReferralCode}`)
                    .limit(1)
                    .maybeSingle();
                if (refUser) {
                    referrerProfileId = refUser.id;
                    referralCodeMobile = refUser.mobile;
                    incomingReferralCode = refUser.share_id || refUser.referral_code || incomingReferralCode;
                }
            } catch (queryErr) {
                console.warn("Referrer share_id query notice:", queryErr);
            }
        }

        // 4. डिफ़ॉल्ट फॉलबैक: यदि कोई भी स्पॉन्सर नहीं मिला (Direct/Organic Traffic), तो मास्टर अकाउंट (AI000004) को स्पॉन्सर बनाएं
        if (!referrerProfileId) {
            referrerProfileId = MASTER_ACCOUNT.UUID;
            incomingReferralCode = MASTER_ACCOUNT.SHARE_ID;
            referralCodeMobile = referralCodeMobile || MASTER_ACCOUNT.MOBILE;
        }

        const sponsorShareCode = incomingReferralCode || MASTER_ACCOUNT.SHARE_ID;
        // प्रत्येक नए यूजर की अपनी यूनिक Share ID होगी (ताकि Postgres UNIQUE constraint "profiles_share_id_idx" वायलेट न हो)
        const userUniqueShareId = "AI" + Math.floor(100000 + Math.random() * 900000);

        const { data, error } = await db
            .from("profiles")
            .insert([{
                full_name: userData.fullName || userData.name,
                mobile: userData.mobile,
                email: userData.email || null,
                gender: userData.gender || null,
                State: userData.state || userData.State || null,
                district: userData.district || null,
                share_id: userUniqueShareId,
                referral_code: sponsorShareCode,          
                referral_mobile: referralCodeMobile,     
                referred_by: referrerProfileId,
                registration_source: attribution.source || userData.source || "direct",
                profile_complete: false,
                is_active: false
            }])
            .select()
            .single();
            
        if (error) throw error;

        if (data && data.id) {
            try {
                await db.from("referrals").insert([{
                    referred_by: referrerProfileId,
                    referral_code: sponsorShareCode,          
                    status: "success",
                    joined_at: new Date().toISOString()
                }]);
                console.log("✅ Successfully logged entry in referrals table!");
            } catch (refErr) {
                console.warn("Referral table log warning:", refErr.message);
            }
        }

        try {
            await trackAttributionEvent({
                event_type: "registration",
                profile_id: data?.id || null,
                mobile: userData.mobile,
                email: userData.email || null,
                referral_code: sponsorShareCode,
                source: attribution.source || userData.source || "direct"
            });
        } catch (trackErr) {
            console.warn("Attribution track notice:", trackErr);
        }

        return data;
    } catch (error) {
        console.error("Create Profile Error:", error);
        return null;
    }
}

function createLoginSession(profile) {
    const session = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('SES_' + Date.now()),
        userId: profile.id,
        user_id: profile.id,
        mobile: profile.mobile,
        share_id: profile.share_id || profile.referral_code || 'AI000004',
        loginTime: new Date().toISOString(),
        active: true
    };
    try {
        localStorage.setItem("AI_SESSION", JSON.stringify(session));
        localStorage.setItem("AI_USER", JSON.stringify(profile));
        localStorage.setItem("AI_PROFILE", JSON.stringify(profile));
        localStorage.setItem("UCAS_USER", JSON.stringify(profile));
        localStorage.setItem("aim_user_mobile", profile.mobile || '');
    } catch (e) {
        console.warn("Storage save notice:", e);
    }
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
   ENGINE 7: RAZORPAY PAYMENT GATEWAY (Fixed handler duplication)
=========================================================== */
const PAYMENT = { STATUS_PENDING: "pending", STATUS_SUCCESS: "success", STATUS_FAILED: "failed" };
const RAZORPAY = { KEY_ID: "rzp_live_TOlsqOqkmxYCWP" };
let currentPayment = null;

async function sendDirectCheckoutLog(statusValue) {
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) {
            console.error("❌ Database client not found for logging!");
            return null;
        }

        let uId = null;
        const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        if (storedUser && storedUser.id) {
            uId = storedUser.id;
        }
        
        if (!uId && window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') {
            uId = window.V1_SESSION.getUserId();
        }

        let bId = null;
        if (window.currentOrder && window.currentOrder.bookId) {
            bId = window.currentOrder.bookId;
        } else if (window.currentCheckoutBook && window.currentCheckoutBook.id) {
            bId = window.currentCheckoutBook.id;
        } else {
            const savedOrder = JSON.parse(localStorage.getItem("AI_CURRENT_ORDER") || '{}');
            bId = savedOrder.bookId || savedOrder.orderId;
        }

        if (!uId || !bId) {
            console.warn("⚠️ Missing IDs for checkout log:", { uId, bId, statusValue });
            return null;
        }

        console.log(`📤 Sending checkout log [${uId}, ${bId}, ${statusValue}] to Supabase...`);

        const { data, error } = await activeDb
            .from("checkout_logs")
            .insert([{
                profile_id: uId,
                book_id: bId,
                status: statusValue 
            }])
            .select();

        if (error) {
            console.error(`❌ Failed to save [${statusValue}] log:`, error.message);
            return null;
        } else {
            console.log(`✅ SUCCESS: Checkout log status [${statusValue}] saved successfully!`, data);
            if (data && data.length > 0) {
                return data[0].order_id;
            }
        }
    } catch (err) {
        console.error("❌ Direct log exception:", err);
        return null;
    }
}

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
    
    const currentBookId = window.currentOrder.bookId;
    const currentAmount = window.currentOrder.amount;
    const currentInvoiceNo = "INV_" + Date.now(); 
    
    const options = {
        key: RAZORPAY.KEY_ID,
        amount: currentAmount * 100,
        currency: "INR",
        name: "Aarogyam India",
        description: window.currentOrder.title,
        notes: {
            book_id: currentBookId,
            invoice_number: currentInvoiceNo
        },
        handler: async function (response) {
            currentPayment.status = PAYMENT.STATUS_SUCCESS;
            currentPayment.paymentId = response.razorpay_payment_id;
            
            localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));

            try {
                const generatedOrderId = await sendDirectCheckoutLog('success');
                const currentUser = typeof getCurrentUserProfile === "function" ? getCurrentUserProfile() : null;
                const storedUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
                
                window.currentPurchase = {
                    purchaseId: "PUR_" + Date.now(),
                    profileId: currentUser ? currentUser.id : (storedUser ? storedUser.id : null),
                    bookId: currentBookId,
                    paymentId: response.razorpay_payment_id,
                    amount: currentAmount,
                    orderId: generatedOrderId,       
                    invoice_number: currentInvoiceNo, 
                    purchasedAt: new Date().toISOString()
                };

                if (typeof savePurchase === "function") {
                    await savePurchase();
                }
            } catch (err) {
                console.error("❌ Exception during purchase save:", err);
            }

            setTimeout(() => {
                window.location.href = `payment-success.html?book_id=${currentBookId}`; 
            }, 1000);
        },
        modal: {
            ondismiss: function() {
                currentPayment.status = PAYMENT.STATUS_FAILED;
                localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));
                localStorage.setItem("AI_LAST_DROPPED_BOOK", currentBookId);

                sendDirectCheckoutLog('dropped').catch(err => console.error("Dismiss log error:", err));

                const payBtn = document.getElementById("payNowBtn");
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.textContent = "Pay Now";
                }

                setTimeout(() => {
                    window.location.href = `payment-failed.html?book_id=${currentBookId}&amount=${currentAmount}`;
                }, 500);
            }
        }
    };
    
    try {
        const payment = new Razorpay(options);
        
        payment.on('payment.failed', function (response) {
            currentPayment.status = PAYMENT.STATUS_FAILED;
            localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));

            sendDirectCheckoutLog('failed').catch(err => console.error("Failed log error:", err));

            const payBtn = document.getElementById("payNowBtn");
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
            }

            setTimeout(() => {
                window.location.href = `payment-failed.html?book_id=${currentBookId}&amount=${currentAmount}`;
            }, 500);
        });

        payment.open();
        return { success: true };
    } catch (error) {
        console.error("Razorpay Error:", error);
        return { success: false, message: "Failed to open payment gateway." };
    }
}
console.log("✅ Razorpay Payment Module Loaded");


/* ===========================================================
   ENGINE 8: PURCHASES & ORDERS (Updated with order_id & invoice_number)
=========================================================== */
async function savePurchase() {
    try {
        if (!window.currentPurchase) {
            console.warn("⚠️ No active currentPurchase object found to save.");
            return;
        }

        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        const purchasePayload = {
            profile_id: window.currentPurchase.profileId,
            book_id: window.currentPurchase.bookId,
            payment_id: window.currentPurchase.paymentId,
            amount: window.currentPurchase.amount,
            order_id: window.currentPurchase.orderId,            
            invoice_number: window.currentPurchase.invoice_number, 
            download_count: 0, 
            payment_status: PAYMENT.STATUS_SUCCESS 
        };

        console.log("📤 Saving purchase to Supabase with Order ID & Invoice:", purchasePayload);

        const { data, error } = await activeDb
            .from("purchases")
            .insert([purchasePayload])
            .select();

        if (error) {
            console.error("❌ Save Purchase DB Error:", error.message);
        } else {
            console.log("✅ SUCCESS: Purchase saved successfully with Order ID and Invoice Number!", data);
            // After a successful purchase, set the user's status to active.
            if (purchasePayload.profile_id) {
                const { error: updateError } = await activeDb
                    .from('profiles')
                    .update({ is_active: true })
                    .eq('id', purchasePayload.profile_id);
                if (updateError) console.error("❌ Failed to update user status to active:", updateError.message);
                else console.log(`✅ User ${purchasePayload.profile_id} status set to ACTIVE.`);
            }
        }
    } catch (err) {
        console.error("❌ Exception during savePurchase execution:", err);
    }
}
console.log("✅ Purchases Module Loaded");


/* ===========================================================
   ENGINE 10: PDF READER
=========================================================== */
let reader = { bookId: null, pdf: null, page: 1, totalPages: 0, zoom: 1 };

async function loadReader(bookId) {
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
// Global window exports
if (typeof window !== 'undefined') {
    window.supabase = window.dbClient || window.supabase;
    window.dbClient = window.dbClient || window.supabase;
    window.isMobileRegistered = isMobileRegistered;
    window.createLoginSession = createLoginSession;
}