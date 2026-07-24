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