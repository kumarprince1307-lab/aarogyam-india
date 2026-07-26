/* ===========================================================
    AAROGYAM INDIA - SUPABASE ENGINE (SAFE VERSION)
=========================================================== */

const APP_CONFIG = {
    PROJECT_NAME: "Aarogyam India",
    VERSION: "1.0.0"
};

const SUPABASE_CONFIG = {
    URL: "https://qjhjrzsnrtahmhswxyvb.supabase.co",
    KEY: "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU"
};

// यहाँ हम 'supabase' की जगह 'dbClient' इस्तेमाल कर रहे हैं ताकि कभी डुप्लीकेट एरर न आए
window.dbClient = window.dbClient || window.supabase.createClient(
    SUPABASE_CONFIG.URL,
    SUPABASE_CONFIG.KEY
);

const db = window.dbClient;

console.log("DB CLIENT INITIALIZED SUCCESSFULLY");

// कनेक्शन टेस्ट
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

// रजिस्ट्रेशन के लिए फंक्शंस
async function isMobileRegistered(mobile) {
    try {
        const { data, error } = await db
            .from("profiles")
            .select("id,mobile")
            .eq("mobile", mobile)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Mobile Check Error :", error);
        return null;
    }
}

async function createUserProfile(userData) {
    try {
        const { data, error } = await db
            .from("profiles")
            .insert([{
                full_name: userData.fullName,
                mobile: userData.mobile,
                email: userData.email || null,
                referral_code: userData.referralCode || null,
                registration_source: userData.source || "registration",
                profile_complete: false,
                is_active: true
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Create Profile Error :", error);
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
        const existingUser = await isMobileRegistered(formData.mobile);
        if (existingUser) {
            createLoginSession(existingUser);
            return { success: true, type: "existing", profile: existingUser };
        }
        const profile = await createUserProfile(formData);
        if (!profile) {
            return { success: false, message: "Profile creation failed." };
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
/* ===========================================================
   PROJECT         : Aarogyam India Mission (AIM)
   MODULE          : Universal Modules Engine (Post-Registration)
   VERSION         : 1.0.2 (Optimized & Modular)
   NOTE            : Supabase Client & Registration already loaded.
=========================================================== */


/* ===========================================================
   MODULE 1: AUTHENTICATION & SESSION BASE
=========================================================== */
const AUTH = {
    LOGIN_STATUS: "AI_LOGIN_STATUS",
    SESSION_KEY: "AI_SESSION",
    USER_KEY: "AI_USER",
    PROFILE_KEY: "AI_PROFILE",
    SESSION_EXPIRE_DAYS: 30
};

const SESSION = {
    id: null,
    userId: null,
    mobile: null,
    loginTime: null,
    expireTime: null,
    active: false
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

function isLoggedIn() { return SessionManager.exists(); }
function logoutUser() {
    SessionManager.remove();
    UserStorage.remove();
    ProfileStorage.remove();
    return true;
}
console.log("✅ Auth & Session Module Loaded");
/* ===========================================================
   END OF MODULE 1: AUTHENTICATION & SESSION BASE
=========================================================== */
/* ===========================================================
   लॉगिन पॉपअप और Supabase चेक करने का लॉजिक (Login & Popup Integration)
=========================================================== */

// 1. पेज लोड होते ही चेक करें कि यूजर पहले से लॉगिन है या नहीं
document.addEventListener("DOMContentLoaded", function() {
    checkAndControlLoginPopup();
});

function checkAndControlLoginPopup() {
    const popupOverlay = document.getElementById('login-popup-overlay');
    
    if (!popupOverlay) return; // अगर उस पेज पर पॉपअप नहीं है, तो कुछ न करें

    // isLoggedIn() फंक्शन आपके ऊपर वाले मॉड्यूल में पहले से मौजूद है!
    if (isLoggedIn()) {
        // अगर यूजर पहले से लॉगिन है, तो पॉपअप छुपा दें
        popupOverlay.style.display = 'none';
        console.log("User is already logged in. Popup hidden.");
    } else {
        // अगर यूजर लॉगिन नहीं है, तो पॉपअप दिखा दें
        popupOverlay.style.display = 'flex';
        console.log("User not logged in. Showing login popup.");
    }
}

// 2. जब यूजर मोबाइल नंबर डालकर 'लॉगिन करें' बटन दबाएगा
async function checkUserLogin() {
    const mobileInput = document.getElementById('login-mobile').value.trim();
    
    if (mobileInput.length !== 10) {
        alert("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।");
        return;
    }

    try {
        // Supabase डेटाबेस में मोबाइल नंबर चेक करना
        const { data, error } = await supabaseClient
            .from('users') // आपकी डेटाबेस टेबल का नाम
            .select('*')
            .eq('mobile', mobileInput)
            .single();

        if (error || !data) {
            alert("यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया पहले साइन अप करें।");
            return;
        }

        // अगर यूजर मिल गया, तो आपके बनाए गए Storage टूल का इस्तेमाल करके डेटा सेव कर लेंगे
        SessionManager.save({
            mobile: data.mobile,
            loginTime: new Date().toISOString(),
            active: true
        });
        
        UserStorage.save(data);

        // पॉपअप बंद कर दें
        const popupOverlay = document.getElementById('login-popup-overlay');
        if (popupOverlay) {
            popupOverlay.style.display = 'none';
        }
        
        alert("स्वागत है, " + (data.name || 'यूजर') + " जी!");
        window.location.reload(); // पेज रिफ्रेश करें ताकि लाइब्रेरी लोड हो जाए

    } catch (err) {
        console.error("Login Error:", err);
        alert("लॉगिन करने में कुछ समस्या आई, कृपया पुनः प्रयास करें।");
    }
}

/* ===========================================================
   MODULE 2: PROFILE MANAGEMENT
=========================================================== */
const PROFILE = { TABLE: "profiles" };
let currentProfile = null;

async function getProfileById(userId) {
    try {
        const { data, error } = await supabase.from(PROFILE.TABLE).select("*").eq("id", userId).single();
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
        const { data, error } = await supabase.from(PROFILE.TABLE).update(profileData).eq("id", userId).select().single();
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
   END OF MODULE 2: PROFILE MANAGEMENT
=========================================================== */


/* ===========================================================
   MODULE 3: INTEREST FORM SYSTEM
=========================================================== */
const INTEREST = { TABLE: "interested_users", DEFAULT_STATUS: "new" };

async function saveInterest(data) {
    try {
        const { data: result, error } = await supabase.from(INTEREST.TABLE).insert([{
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
   END OF MODULE 3: INTEREST FORM SYSTEM
=========================================================== */

/* ===========================================================
   MODULE 4: DEMO SYSTEM (EXACT WORKING MATCH + MOBILE CLEANER)
=========================================================== */
const DEMO = { TABLE: "demo_users", STATUS: "viewed" };

async function saveDemoUser(data) {
    try {
        // 1. मोबाइल नंबर को साफ़ करने का लॉजिक (0 या 91 हटाने के लिए)
        let cleanMobile = String(data.mobile || "").trim();
        if (cleanMobile.startsWith("+91")) {
            cleanMobile = cleanMobile.slice(3);
        } else if (cleanMobile.startsWith("91") && cleanMobile.length === 12) {
            cleanMobile = cleanMobile.slice(2);
        }
        if (cleanMobile.startsWith("0") && cleanMobile.length === 11) {
            cleanMobile = cleanMobile.slice(1);
        }

        console.log("Saving demo user with data:", { ...data, mobile: cleanMobile });

        // ठीक वैसे ही जैसे मॉड्यूल 8 में 'db.from' का उपयोग किया गया है
        const { data: result, error } = await db.from(DEMO.TABLE).insert([{
            profile_id: data.profileId || null,
            name: data.name,
            mobile: cleanMobile, // यहाँ बिल्कुल साफ़ किया हुआ 10 अंकों का नंबर जाएगा
            email: data.email || null,
            state: data.state || null,
            district: data.district || null,
            demo_book_id: data.bookId,
            demo_viewed_at: new Date().toISOString()
        }]).select();

        if (error) {
            console.error("Supabase Error Details:", error);
            throw error;
        }

        console.log("✅ Data saved successfully to Supabase:", result);
        return { success: true, data: result };
    } catch (error) {
        console.error("❌ Supabase Save Exception:", error.message);
        return { success: false, message: error.message };
    }
}
console.log("✅ Demo Module Loaded");
/* ===========================================================
   END OF MODULE 4: DEMO SYSTEM
=========================================================== */

/* ===========================================================
   MODULE 5: BOOKS ENGINE (books.json Driven)
=========================================================== */
const BOOK = { JSON: "data/books.json", CACHE_KEY: "AI_BOOKS" };
let booksCache = [];
let currentBook = null;

async function loadBooks() {
    try {
        const response = await fetch(BOOK.JSON);
        if (!response.ok) throw new Error("Books JSON not found.");
        const books = await response.json();
        booksCache = books;
        localStorage.setItem(BOOK.CACHE_KEY, JSON.stringify(books));
        return books;
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
    return books.find(book => book.book_id === bookId) || null;
}
console.log("✅ Books Engine Module Loaded");
/* ===========================================================
   END OF MODULE 5: BOOKS ENGINE
=========================================================== */


/* ===========================================================
   MODULE 6: UNIVERSAL CHECKOUT
=========================================================== */
const CHECKOUT = { CURRENCY: "INR", STATUS: "pending" };
let currentOrder = null;

async function createCheckout(bookId) {
    const book = await getBookById(bookId);
    if (!book) return { success: false, message: "Book not found." };

    currentOrder = {
        bookId: book.book_id,
        title: book.title,
        mrp: Number(book.mrp),
        offerPrice: Number(book.offer_price),
        amount: Number(book.offer_price),
        paymentStatus: CHECKOUT.STATUS,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(currentOrder));
    return { success: true, order: currentOrder };
}
console.log("✅ Checkout Module Loaded");
/* ===========================================================
   END OF MODULE 6: UNIVERSAL CHECKOUT
=========================================================== */


/* ===========================================================
   MODULE 7: RAZORPAY PAYMENT GATEWAY (Finalized)
=========================================================== */
const PAYMENT = { STATUS_PENDING: "pending", STATUS_SUCCESS: "success", STATUS_FAILED: "failed" };
const RAZORPAY = { KEY_ID: "rzp_test_TGobxnVbAWYkz7" };
let currentPayment = null;

function startPayment() {
    // अगर आर्डर की जानकारी ऊपर से नहीं मिली, तो localStorage से उठा लेगा
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
            console.log("🚀 Razorpay Payment Success Callback Triggered!", response);
            
            currentPayment.status = PAYMENT.STATUS_SUCCESS;
            currentPayment.paymentId = response.razorpay_payment_id;
            
            // 1. LocalStorage में बैकअप सेव करें
            localStorage.setItem("AI_CURRENT_PAYMENT", JSON.stringify(currentPayment));

            // 2. आपके अपने Module 8 के 'savePurchase' फंक्शन को यहाँ कॉल करें
            try {
                const currentUser = typeof getCurrentUser === "function" ? getCurrentUser() : null;
                
                window.currentPurchase = {
                    purchaseId: "PUR_" + Date.now(),
                    profileId: currentUser ? currentUser.id : null,
                    bookId: window.currentOrder.bookId,
                    paymentId: response.razorpay_payment_id,
                    amount: window.currentOrder.amount,
                    purchasedAt: new Date().toISOString()
                };

                console.log("💾 Saving purchase data to Supabase...", window.currentPurchase);

                if (typeof savePurchase === "function") {
                    const saveResult = await savePurchase();
                    if (!saveResult.success) {
                        console.error("❌ Failed to save purchase to database:", saveResult.message);
                        alert("पेमेंट सफल हो गया, लेकिन डेटाबेस में सेव करने में समस्या आई: " + saveResult.message);
                    } else {
                        console.log("✅ Purchase successfully saved via Module 8!");
                    }
                } else {
                    console.error("❌ savePurchase function not found!");
                }
            } catch (err) {
                console.error("❌ Exception during purchase save:", err);
            }

            // 3. 1 सेकंड का डिले देकर पेमेंट सक्सेस पेज पर रीडायरेक्ट करें
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
   END OF MODULE 7: RAZORPAY PAYMENT GATEWAY
=========================================================== */

/* ===========================================================
   MODULE 8: PURCHASES ENGINE (Profile ID Fix)
=========================================================== */
let currentPurchase = null;

async function savePurchase() {
    if (!currentPurchase && window.currentPurchase) {
        currentPurchase = window.currentPurchase;
    }
    if (!currentPurchase && window.currentOrder) {
        currentPurchase = {
            purchaseId: "PUR_" + Date.now(),
            bookId: window.currentOrder.bookId,
            amount: window.currentOrder.amount,
            purchasedAt: new Date().toISOString()
        };
    }

    if (!currentPurchase) return { success: false, message: "Purchase not found." };
    
    // लोकल स्टोरेज से लॉगिन यूजर की आईडी ढूंढने की कोशिश करें
    let userProfileId = currentPurchase.profileId;
    if (!userProfileId) {
        const localUser = localStorage.getItem("AI_USER");
        if (localUser) {
            try {
                const parsedUser = JSON.parse(localUser);
                userProfileId = parsedUser.id || parsedUser.userId;
            } catch (e) {}
        }
    }

    // अगर फिर भी आईडी न मिले, तो एक डिफ़ॉल्ट या गेस्ट आईडी सेट कर दें ताकि एरर न आए
    if (!userProfileId) {
        userProfileId = "00000000-0000-0000-0000-000000000000"; // या अपनी टेबल के हिसाब से कोई वैलिड UUID
    }
    
    const { data, error } = await db.from("purchases").insert([{
        profile_id: userProfileId,
        order_id: currentPurchase.purchaseId,
        book_id: currentPurchase.bookId,
        payment_id: currentPurchase.paymentId || "PAY_TEST",
        amount: currentPurchase.amount,
        payment_status: "success",
        purchase_date: currentPurchase.purchasedAt
    }]).select();
    
    if (error) {
        console.error("Supabase Insert Detailed Error:", error);
        alert("डेटाबेस एरर: " + error.message);
        return { success: false, message: error.message };
    }
    
    console.log("✅ Supabase Insert Success Data:", data);
    return { success: true };
}

async function hasPurchased(bookId) {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user) return false;
    
    const { data } = await db.from("purchases").select("*").eq("book_id", bookId).eq("payment_status", "success").maybeSingle();
    return data !== null;
}
console.log("✅ Purchases Module Loaded");
/* ===========================================================
   END OF MODULE 8: PURCHASES ENGINE
=========================================================== */
/* ===========================================================
   MODULE 9: MY LIBRARY
=========================================================== */
let currentLibrary = [];

async function loadLibrary() {
    const user = UserStorage.get();
    if (!user) return [];
    const { data } = await supabase.from("purchases").select("*").eq("profile_id", user.id).eq("status", "active");
    currentLibrary = data || [];
    return currentLibrary;
}
console.log("✅ My Library Module Loaded");
/* ===========================================================
   END OF MODULE 9: MY LIBRARY
=========================================================== */


/* ===========================================================
   MODULE 10: PDF READER
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
   END OF MODULE 10: PDF READER
=========================================================== */


/* ===========================================================
   MODULE 11: PDF DOWNLOAD & DOWNLOAD LOGS (Limit = 3)
=========================================================== */
const DOWNLOAD = { LIMIT: 3 };

async function canDownloadBook(bookId) {
    const user = UserStorage.get();
    if (!user) return false;
    const { data } = await supabase.from("purchases").select("download_count").eq("profile_id", user.id).eq("book_id", bookId).single();
    if (!data) return false;
    return (data.download_count || 0) < DOWNLOAD.LIMIT;
}

async function processDownload(bookId) {
    const allowed = await canDownloadBook(bookId);
    if (!allowed) return { success: false, message: "Download limit exceeded (Max 3)." };

    const user = UserStorage.get();
    // Log entry
    await supabase.from("download_logs").insert({
        profile_id: user.id,
        book_id: bookId,
        downloaded_at: new Date().toISOString(),
        status: "success"
    });

    // Increment count
    const { data: purchase } = await supabase.from("purchases").select("purchase_id, download_count").eq("profile_id", user.id).eq("book_id", bookId).single();
    const newCount = (purchase.download_count || 0) + 1;
    
    await supabase.from("purchases").update({ download_count: newCount }).eq("purchase_id", purchase.purchase_id);

    const book = await getBookById(bookId);
    window.open(book.pdf_url, "_blank");
    return { success: true, remaining: DOWNLOAD.LIMIT - newCount };
}
console.log("✅ PDF Download & Logs Module Loaded");
/* ===========================================================
   END OF MODULE 11: PDF DOWNLOAD & DOWNLOAD LOGS
=========================================================== */