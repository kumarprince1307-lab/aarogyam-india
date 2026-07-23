console.log("✅ supabase.js Loaded Successfully");

/* ==========================================================
   Aarogyam India
   Supabase Master File (V1)
   Part 1
   ========================================================== */

/* ================================
   Supabase Configuration
================================ */

const SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co";

const SUPABASE_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
console.log("✅ Supabase Client Created");
console.log(supabase);
/* ================================
   Global Variables
================================ */

const APP_NAME = "Aarogyam India";

const DOWNLOAD_LIMIT = 3;

let currentUser = null;

let currentProfile = null;

let currentBook = null;

/* ================================
   Console Banner
================================ */

console.log("================================");
console.log(APP_NAME);
console.log("Supabase V1 Connected");
console.log("================================");

/* ================================
   Connection Test
================================ */

async function testConnection() {

    try {

        const { error } = await supabase
            .from("books")
            .select("id")
            .limit(1);

        if (error) {

            console.error(error);

            return false;

        }

        console.log("Database Connected");

        return true;

    } catch (err) {

        console.error(err);

        return false;

    }

}

/* ================================
   Error Handler
================================ */

function showDatabaseError(error) {

    console.error(error);

    if (typeof showToast === "function") {

        showToast(
            error.message ||
            "Something went wrong."
        );

    }

}

/* ================================
   Mobile Validation
================================ */

function isValidMobile(mobile) {

    const regex = /^[6-9]\d{9}$/;

    return regex.test(
        String(mobile).trim()
    );

}

/* ================================
   Email Validation
================================ */

function isValidEmail(email) {

    if (!email) return true;

    const regex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

}

/* ================================
   Clean String
================================ */

function cleanValue(value) {

    if (value === null) return "";

    if (value === undefined) return "";

    return String(value).trim();

}

/* ================================
   Loader
================================ */

function startLoader() {

    if (typeof showLoader === "function") {

        showLoader();

    }

}

function stopLoader() {

    if (typeof hideLoader === "function") {

        hideLoader();

    }

}

/* ================================
   Current Date
================================ */

function getCurrentDateTime() {

    return new Date().toISOString();

}

/* ================================
   Generate Order ID
================================ */

function generateOrderId() {

    return "AI-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 10000
        );

}

/* ================================
   Generate Referral Code
================================ */

function generateReferralCode(name) {

    const first = cleanValue(name)
        .replace(/\s/g, "")
        .substring(0, 4)
        .toUpperCase();

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return first + random;

}

/* ================================
   Check Internet
================================ */

function isOnline() {

    return navigator.onLine;

}

/* ================================
   Initialize
================================ */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await testConnection();

    }
);
/* ==========================================================
   PART 2
   Profile & Demo User Functions
   ========================================================== */

/* ================================
   Find Profile By Mobile
================================ */

async function getProfileByMobile(mobile) {

    try {

        mobile = cleanValue(mobile);

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("mobile", mobile)
            .maybeSingle();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Find Profile By ID
================================ */

async function getProfileById(profileId) {

    try {

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", profileId)
            .maybeSingle();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Create Profile
================================ */

async function createProfile(userData) {

    try {

        const profile = {

            full_name: cleanValue(userData.full_name),

            mobile: cleanValue(userData.mobile),

            email: cleanValue(userData.email),

            state: cleanValue(userData.state),

            district: cleanValue(userData.district),

            referral_code:
                generateReferralCode(
                    userData.full_name
                ),

            created_at:
                getCurrentDateTime()

        };

        const { data, error } = await supabase
            .from("profiles")
            .insert(profile)
            .select()
            .single();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Update Profile
================================ */

async function updateProfile(profileId, userData) {

    try {

        const updateData = {

            full_name:
                cleanValue(userData.full_name),

            email:
                cleanValue(userData.email),

            state:
                cleanValue(userData.state),

            district:
                cleanValue(userData.district),

            updated_at:
                getCurrentDateTime()

        };

        const { data, error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", profileId)
            .select()
            .single();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Create Or Update Profile
================================ */

async function saveProfile(userData) {

    try {

        let profile =
            await getProfileByMobile(
                userData.mobile
            );

        if (!profile) {

            profile =
                await createProfile(userData);

        } else {

            profile =
                await updateProfile(
                    profile.id,
                    userData
                );

        }

        currentProfile = profile;

        return profile;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Save Demo User
================================ */

async function saveDemoUser(formData) {

    try {

        const demoData = {

            full_name:
                cleanValue(formData.full_name),

            mobile:
                cleanValue(formData.mobile),

            email:
                cleanValue(formData.email),

            state:
                cleanValue(formData.state),

            district:
                cleanValue(formData.district),

            created_at:
                getCurrentDateTime()

        };

        const { data, error } = await supabase
            .from("demo_users")
            .insert(demoData)
            .select()
            .single();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Demo Registration
================================ */

async function registerDemoUser(formData) {

    try {

        startLoader();

        if (!isValidMobile(formData.mobile)) {

            stopLoader();

            throw new Error(
                "Invalid Mobile Number"
            );

        }

        if (!isValidEmail(formData.email)) {

            stopLoader();

            throw new Error(
                "Invalid Email Address"
            );

        }

        await saveProfile(formData);

        await saveDemoUser(formData);

        stopLoader();

        return true;

    } catch (error) {

        stopLoader();

        showDatabaseError(error);

        return false;

    }

}
/* ==========================================================
   PART 3
   Books, Purchases & My Library
   ========================================================== */

/* ================================
   Get All Active Books
================================ */

async function getBooks() {

    try {

        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("status", "Active")
            .order("id");

        if (error) throw error;

        return data || [];

    } catch (error) {

        showDatabaseError(error);

        return [];

    }

}

/* ================================
   Get Book By ID
================================ */

async function getBook(bookId) {

    try {

        const { data, error } = await supabase
            .from("books")
            .select("*")
            .eq("id", bookId)
            .single();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Save Purchase
================================ */

async function savePurchase(orderData) {

    try {

        const purchase = {

            order_id: generateOrderId(),

            profile_id: orderData.profile_id,

            book_id: orderData.book_id,

            payment_id: cleanValue(orderData.payment_id),

            payment_method: cleanValue(orderData.payment_method),

            amount: orderData.amount,

            payment_status: "Success",

            purchase_date: getCurrentDateTime()

        };

        const { data, error } = await supabase
            .from("purchases")
            .insert(purchase)
            .select()
            .single();

        if (error) throw error;

        return data;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Check Purchase
================================ */

async function hasPurchased(profileId, bookId) {

    try {

        const { data, error } = await supabase
            .from("purchases")
            .select("id")
            .eq("profile_id", profileId)
            .eq("book_id", bookId)
            .eq("payment_status", "Success")
            .maybeSingle();

        if (error) throw error;

        return !!data;

    } catch (error) {

        showDatabaseError(error);

        return false;

    }

}

/* ================================
   Book Access
================================ */

async function hasBookAccess(profileId, bookId) {

    return await hasPurchased(
        profileId,
        bookId
    );

}

/* ================================
   Get User Library
================================ */

async function getMyLibrary(profileId) {

    try {

        const { data, error } = await supabase
            .from("purchases")
            .select(`
                *,
                books(*)
            `)
            .eq("profile_id", profileId)
            .eq("payment_status", "Success")
            .order("purchase_date", {
                ascending: false
            });

        if (error) throw error;

        return data || [];

    } catch (error) {

        showDatabaseError(error);

        return [];

    }

}

/* ================================
   Get Purchased Book IDs
================================ */

async function getPurchasedBookIds(profileId) {

    try {

        const { data, error } = await supabase
            .from("purchases")
            .select("book_id")
            .eq("profile_id", profileId)
            .eq("payment_status", "Success");

        if (error) throw error;

        return (data || []).map(item => item.book_id);

    } catch (error) {

        showDatabaseError(error);

        return [];

    }

}

/* ================================
   Open Book
================================ */

async function openBook(profileId, bookId) {

    try {

        const access =
            await hasBookAccess(
                profileId,
                bookId
            );

        if (!access) {

            throw new Error(
                "Book access denied."
            );

        }

        const book =
            await getBook(bookId);

        if (!book) {

            throw new Error(
                "Book not found."
            );

        }

        currentBook = book;

        window.location.href =
            book.read_url;

    } catch (error) {

        showDatabaseError(error);

    }

}

/* ================================
   Purchase Book
================================ */

async function purchaseBook(orderData) {

    try {

        startLoader();

        const purchase =
            await savePurchase(orderData);

        stopLoader();

        return purchase;

    } catch (error) {

        stopLoader();

        showDatabaseError(error);

        return null;

    }

}
/* ==========================================================
   PART 4
   PDF Download, Download Logs & Final Utilities
   ========================================================== */

/* ================================
   Get Download Count
================================ */

async function getDownloadCount(profileId, bookId) {

    try {

        const { data, error } = await supabase
            .from("download_logs")
            .select("download_count")
            .eq("profile_id", profileId)
            .eq("book_id", bookId)
            .maybeSingle();

        if (error) throw error;

        if (!data) return 0;

        return data.download_count || 0;

    } catch (error) {

        showDatabaseError(error);

        return 0;

    }

}

/* ================================
   Create Download Record
================================ */

async function createDownloadRecord(profileId, bookId) {

    try {

        const record = {

            profile_id: profileId,

            book_id: bookId,

            download_count: 1,

            last_download: getCurrentDateTime(),

            created_at: getCurrentDateTime()

        };

        const { error } = await supabase
            .from("download_logs")
            .insert(record);

        if (error) throw error;

        return true;

    } catch (error) {

        showDatabaseError(error);

        return false;

    }

}

/* ================================
   Increase Download Count
================================ */

async function increaseDownloadCount(profileId, bookId) {

    try {

        const count = await getDownloadCount(
            profileId,
            bookId
        );

        if (count === 0) {

            return await createDownloadRecord(
                profileId,
                bookId
            );

        }

        const { error } = await supabase
            .from("download_logs")
            .update({

                download_count: count + 1,

                last_download: getCurrentDateTime()

            })
            .eq("profile_id", profileId)
            .eq("book_id", bookId);

        if (error) throw error;

        return true;

    } catch (error) {

        showDatabaseError(error);

        return false;

    }

}

/* ================================
   Can Download
================================ */

async function canDownload(profileId, bookId) {

    const count = await getDownloadCount(
        profileId,
        bookId
    );

    return count < DOWNLOAD_LIMIT;

}

/* ================================
   Download PDF
================================ */

async function downloadBook(profileId, bookId) {

    try {

        startLoader();

        const access =
            await hasBookAccess(
                profileId,
                bookId
            );

        if (!access) {

            throw new Error(
                "Book access denied."
            );

        }

        const allowed =
            await canDownload(
                profileId,
                bookId
            );

        if (!allowed) {

            throw new Error(
                "Download limit reached."
            );

        }

        const book =
            await getBook(bookId);

        if (!book) {

            throw new Error(
                "Book not found."
            );

        }

        await increaseDownloadCount(
            profileId,
            bookId
        );

        stopLoader();

        window.open(
            book.pdf_url,
            "_blank"
        );

    } catch (error) {

        stopLoader();

        showDatabaseError(error);

    }

}

/* ================================
   Remaining Downloads
================================ */

async function getRemainingDownloads(profileId, bookId) {

    const count =
        await getDownloadCount(
            profileId,
            bookId
        );

    return DOWNLOAD_LIMIT - count;

}

/* ================================
   Logout
================================ */

function logoutUser() {

    currentUser = null;

    currentProfile = null;

    currentBook = null;

    localStorage.removeItem(
        "aarogyam_profile"
    );

}

/* ================================
   Save Current Profile
================================ */

function saveCurrentProfile(profile) {

    currentProfile = profile;

    localStorage.setItem(
        "aarogyam_profile",
        JSON.stringify(profile)
    );

}

/* ================================
   Load Current Profile
================================ */

function loadCurrentProfile() {

    const data =
        localStorage.getItem(
            "aarogyam_profile"
        );

    if (!data) return null;

    currentProfile =
        JSON.parse(data);

    return currentProfile;

}

/* ================================
   Auto Restore User
================================ */

loadCurrentProfile();

/* ================================
   End Of File
================================ */

console.log(
    "================================"
);

console.log(
    "Supabase Master File Loaded"
);

console.log(
    "Version : V1"
);

console.log(
    "Status : Ready"
);

console.log(
    "================================"
);
/* ==========================================================
   PART 5A
   Session Management Functions
   ========================================================== */

/* ================================
   Save User Session
================================ */

async function saveUserSession(profile) {

    try {

        if (!profile) return false;

        localStorage.setItem(
            "ai_current_profile",
            JSON.stringify(profile)
        );

        localStorage.setItem(
            "ai_logged_in",
            "true"
        );

        currentProfile = profile;

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}

/* ================================
   Load User Session
================================ */

function loadUserSession() {

    try {

        const session =
            localStorage.getItem(
                "ai_current_profile"
            );

        if (!session) return null;

        const profile =
            JSON.parse(session);

        currentProfile = profile;

        return profile;

    } catch (error) {

        console.error(error);

        return null;

    }

}

/* ================================
   Check Login
================================ */

function isLoggedIn() {

    return localStorage.getItem(
        "ai_logged_in"
    ) === "true";

}

/* ================================
   Restore Session
================================ */

async function restoreUserSession() {

    try {

        if (!isLoggedIn()) {

            return null;

        }

        const profile =
            loadUserSession();

        if (!profile) {

            return null;

        }

        const latestProfile =
            await getProfileById(
                profile.id
            );

        if (latestProfile) {

            currentProfile =
                latestProfile;

            localStorage.setItem(
                "ai_current_profile",
                JSON.stringify(
                    latestProfile
                )
            );

            return latestProfile;

        }

        return profile;

    } catch (error) {

        console.error(error);

        return null;

    }

}

/* ================================
   Clear Session
================================ */

function clearUserSession() {

    localStorage.removeItem(
        "ai_current_profile"
    );

    localStorage.removeItem(
        "ai_logged_in"
    );

    currentProfile = null;

}

/* ================================
   Logout
================================ */

function logoutUser() {

    clearUserSession();

    window.location.href =
        "registration.html";

}
/* ==========================================================
   PART 5B
   Referral, Auto Login & Redirect Functions
========================================================== */

/* ================================
   Get Referral Profile
================================ */

async function getReferralProfile(referralMobile) {

    try {

        referralMobile = cleanValue(referralMobile);

        if (!referralMobile) return null;

        const profile =
            await getProfileByMobile(referralMobile);

        return profile;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Process Referral
================================ */

async function processReferral(profile, referralMobile) {

    try {

        referralMobile =
            cleanValue(referralMobile);

        if (!referralMobile) {

            return true;

        }

        const referrer =
            await getReferralProfile(
                referralMobile
            );

        if (!referrer) {

            console.warn(
                "Referral Mobile Not Found"
            );

            return false;

        }

        const { error } =
            await supabase
            .from("profiles")
            .update({

                referred_by:
                    referrer.id,

                referral_mobile:
                    referrer.mobile,

                updated_at:
                    getCurrentDateTime()

            })
            .eq("id", profile.id);

        if (error) throw error;

        return true;

    } catch (error) {

        showDatabaseError(error);

        return false;

    }

}

/* ================================
   Auto Login
================================ */

async function autoLogin(mobile) {

    try {

        const profile =
            await getProfileByMobile(mobile);

        if (!profile) {

            return null;

        }

        await saveUserSession(profile);

        return profile;

    } catch (error) {

        showDatabaseError(error);

        return null;

    }

}

/* ================================
   Redirect After Login
================================ */

function redirectAfterLogin(page = "index.html") {

    window.location.href = page;

}

/* ================================
   Redirect After Registration
================================ */

function redirectAfterRegistration(page = "index.html") {

    window.location.href = page;

}

/* ================================
   Future Hook
   My Library / Wallet / Membership
================================ */

async function afterSuccessfulRegistration(profile) {

    console.log(
        "Future Modules Ready",
        profile
    );

    /*
        Future

        Wallet

        Membership

        My Library

        Notification

        Activity Log

    */

    return true;

}
