/* ===========================================================
    AAROGYAM INDIA - SUPABASE ENGINE (REFACTORED V1.5)
=========================================================== */

// -----------------------------------------------------------
// MODULE 1: INITIALIZATION & CONFIG
// -----------------------------------------------------------
const SUPABASE_URL = "https://qjhjrzsnrtahmhswxyvb.supabase.co";
const SUPABASE_KEY = "sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase Client Initialized.");

// -----------------------------------------------------------
// MODULE 2: AUTHENTICATION & SESSION MANAGEMENT
// -----------------------------------------------------------
const AUTH_KEYS = {
    SESSION: "AI_SESSION",
    USER: "AI_USER"
};

function getCurrentUser() {
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function createLoginSession(profile) {
    const session = {
        userId: profile.id,
        mobile: profile.mobile,
        loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(profile));
    return { session, profile };
}

function logoutUser() {
    localStorage.removeItem(AUTH_KEYS.SESSION);
    localStorage.removeItem(AUTH_KEYS.USER);
    console.log("User logged out successfully.");
    window.location.reload();
}

// -----------------------------------------------------------
// MODULE 3: USER & PROFILE ACTIONS
// -----------------------------------------------------------
async function findExistingProfile({ mobile, email }) {
    const normalizedMobile = (mobile || "").replace(/\D/g, "").slice(-10);
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (normalizedMobile) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("mobile", normalizedMobile)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Profile lookup error:", error);
            return { data: null, error };
        }

        if (data) {
            return { data, error: null };
        }
    }

    if (normalizedEmail) {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", normalizedEmail)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Profile lookup error:", error);
            return { data: null, error };
        }

        if (data) {
            return { data, error: null };
        }
    }

    return { data: null, error: null };
}

async function isMobileRegistered(mobile) {
    return await findExistingProfile({ mobile });
}

async function getProfileById(userId) {
    if (!userId) return { data: null, error: null };

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .maybeSingle();

    return { data, error };
}

async function createUserProfile(userData) {
    const normalizedMobile = (userData.mobile || "").replace(/\D/g, "").slice(-10);
    const normalizedEmail = (userData.email || "").trim().toLowerCase();

    const { data: existingProfile } = await findExistingProfile({
        mobile: normalizedMobile,
        email: normalizedEmail
    });

    if (existingProfile) {
        return { data: existingProfile, error: null, existing: true };
    }

    const profileData = {
        full_name: userData.fullName,
        mobile: normalizedMobile,
        email: normalizedEmail || null,
        referral_code: userData.referralCode || null,
        registration_source: userData.source || "registration",
        profile_complete: false,
        is_active: true
    };
    return await supabase.from("profiles").insert(profileData).select().single();
}

async function registerUser(formData) {
    const { data: existingUser, error: findError } = await findExistingProfile({
        mobile: formData.mobile,
        email: formData.email
    });

    if (findError) {
        console.error("Profile lookup failed:", findError);
        return { success: false, message: "Profile lookup failed." };
    }

    if (existingUser) {
        console.log("Existing user found. Logging in.", existingUser);
        createLoginSession(existingUser);
        return { success: true, type: "existing", profile: existingUser };
    }

    const { data: newUser, error: createError } = await createUserProfile(formData);

    if (createError) {
        console.error("Profile creation failed:", createError);
        return { success: false, message: "Profile creation failed." };
    }

    console.log("New user created. Logging in.", newUser);
    createLoginSession(newUser);
    return { success: true, type: "new", profile: newUser };
}

async function updateProfile(userId, profileData) {
    if (!userId) return { success: false, message: "User ID not provided." };

    const sanitizedProfileData = {
        ...profileData,
        profile_complete: Boolean(profileData.full_name && profileData.mobile),
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from("profiles")
        .update(sanitizedProfileData)
        .eq("id", userId)
        .select()
        .single();

    if (error) {
        console.error("Update Profile Error:", error);
        return { success: false, message: error.message };
    }

    const { data: freshProfile, error: refreshError } = await getProfileById(userId);
    const persistedProfile = refreshError || !freshProfile ? data : freshProfile;

    // Update user data in local storage
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(persistedProfile));
    return { success: true, profile: persistedProfile };
}

// -----------------------------------------------------------
// MODULE 4: PURCHASE & LIBRARY
// -----------------------------------------------------------
async function savePurchase(purchaseData) {
    const { profileId, bookId, paymentId, amount } = purchaseData;

    if (!profileId || !bookId || !paymentId) {
        return { success: false, message: "Missing required purchase data." };
    }

    // Check for duplicate purchase by payment_id
    const { data: existingPurchase, error: findError } = await supabase
        .from("purchases")
        .select("id")
        .eq("payment_id", paymentId)
        .single();

    if (existingPurchase) {
        console.warn("Duplicate purchase attempt detected for payment_id:", paymentId);
        return { success: true, message: "Purchase already recorded." };
    }

    const { data, error } = await supabase.from("purchases").insert([{
        profile_id: profileId,
        book_id: bookId,
        payment_id: paymentId,
        amount: amount,
        payment_status: "success",
        purchase_date: new Date().toISOString()
    }]).select().single();

    if (error) {
        console.error("Save Purchase Error:", error);
        return { success: false, message: error.message };
    }

    return { success: true, data };
}

async function getUserPurchases(userId) {
    if (!userId) return { data: [], error: null };
    return await supabase.from("purchases").select("book_id").eq("profile_id", userId).eq("payment_status", "success");
}


// -----------------------------------------------------------
// MODULE 5: DOWNLOAD MANAGEMENT
// -----------------------------------------------------------
const DOWNLOAD_LIMIT = 3;

async function getPurchaseForDownload(userId, bookId) {
    if (!userId || !bookId) return null;

    const { data, error } = await supabase
        .from("purchases")
        .select("id, download_count")
        .eq("profile_id", userId)
        .eq("book_id", bookId)
        .eq("payment_status", "success")
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Error fetching purchase for download:", error);
        return null;
    }
    return data;
}

async function processDownload(userId, bookId) {
    const purchase = await getPurchaseForDownload(userId, bookId);

    if (!purchase) {
        return { success: false, message: "You have not purchased this book." };
    }

    const currentCount = purchase.download_count || 0;
    if (currentCount >= DOWNLOAD_LIMIT) {
        return { success: false, message: `Download limit of ${DOWNLOAD_LIMIT} has been reached.` };
    }

    // Increment download count
    const newCount = currentCount + 1;
    const { error: updateError } = await supabase
        .from("purchases")
        .update({ download_count: newCount })
        .eq("id", purchase.id);

    if (updateError) {
        console.error("Failed to update download count:", updateError);
        return { success: false, message: "Could not update download count. Please try again." };
    }

    // Log the download
    await supabase.from("download_logs").insert({
        profile_id: userId,
        book_id: bookId,
        downloaded_at: new Date().toISOString(),
        status: "success"
    });

    console.log(`Download successful. New count: ${newCount}`);
    return { success: true, remaining: DOWNLOAD_LIMIT - newCount };
}


// -----------------------------------------------------------
// MODULE 6: DEMO USER (Simplified)
// -----------------------------------------------------------
async function saveDemoUser(demoData) {
    const { data: existingUser } = await isMobileRegistered(demoData.mobile);
    if (existingUser) {
        console.log("Demo user already exists in profiles.");
        return { success: true, message: "Already exists" };
    }
    
    return await supabase.from("profiles").insert({
        full_name: demoData.name,
        mobile: demoData.mobile,
        email: demoData.email || null,
        State: demoData.state || null,
        district: demoData.district || null,
        registration_source: 'demo'
    }).select().single();
}


// -----------------------------------------------------------
// MODULE 7: RAZORPAY PAYMENT GATEWAY
// -----------------------------------------------------------
function startPayment(order, user) {
    if (!order || !user) {
        return { success: false, message: "Order or user details missing." };
    }

    const options = {
        key: "rzp_test_TGobxnVbAWYkz7",
        amount: order.amount * 100,
        currency: "INR",
        name: "Aarogyam India",
        description: `Purchase of ${order.title}`,
        prefill: {
            name: user.full_name,
            email: user.email,
            contact: user.mobile
        },
        handler: async function (response) {
            console.log("Razorpay Payment Success:", response);
            
            const purchaseResult = await savePurchase({
                profileId: user.id,
                bookId: order.bookId,
                paymentId: response.razorpay_payment_id,
                amount: order.amount
            });

            if (purchaseResult.success) {
                console.log("Purchase saved successfully.");
                window.location.href = "payment-success.html";
            } else {
                console.error("Failed to save purchase:", purchaseResult.message);
                alert("Payment was successful, but there was an error saving your purchase. Please contact support.");
            }
        },
        modal: {
            ondismiss: function() {
                console.log("Payment modal dismissed.");
            }
        }
    };
    
    try {
        const rzp = new Razorpay(options);
        rzp.open();
        return { success: true };
    } catch (error) {
        console.error("Razorpay Error:", error);
        return { success: false, message: "Failed to open payment gateway." };
    }
}
