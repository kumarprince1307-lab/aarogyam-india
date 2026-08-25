/*=========================================================
  FILE NAME : registration.js
  PROJECT   : Aarogyam India V1
  MODULE    : Free Registration & Complete Smart Referral Engine
  VERSION   : 2.1.0 (Final - Master Default & User Share ID Perfect Fix)
===========================================================*/

"use strict";

let returnUrl = null; 

// [1] स्मार्ट डेटा बाइंडिंग बंडल - यहाँ UUID, Name, Mobile और ShareID सेव होगा
window.currentReferrerData = {
    uuid: null,
    name: null,
    mobile: null,
    shareId: null
};

const form = document.getElementById("registrationForm");
const fullName = document.getElementById("fullName");
const mobile = document.getElementById("mobile");
const email = document.getElementById("email");
const referralMobile = document.getElementById("referralMobile");
const agreeTerms = document.getElementById("agreeTerms");
const registerBtn = document.getElementById("registerBtn");
const formMessage = document.getElementById("formMessage");
const backBtn = document.getElementById("backBtn");
let referrerDisplay = document.getElementById("referrerDisplayName");

// Auth Mode Tabs & Quick Login Form Elements
const tabRegisterBtn = document.getElementById("tabRegisterBtn");
const tabLoginBtn = document.getElementById("tabLoginBtn");
const switchLoginLink = document.getElementById("switchLoginLink");
const switchRegisterLink = document.getElementById("switchRegisterLink");
const quickLoginForm = document.getElementById("quickLoginForm");
const loginMobileInput = document.getElementById("loginMobileInput");
const quickLoginSubmitBtn = document.getElementById("quickLoginSubmitBtn");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

document.addEventListener("DOMContentLoaded", initializePage);

// [1.5] टैब स्विचिंग फंक्शन (रजिस्ट्रेशन vs लॉगिन)
function switchAuthTab(mode) {
    clearMessage();
    if (mode === "login") {
        if (form) form.style.display = "none";
        if (quickLoginForm) quickLoginForm.style.display = "block";
        if (tabLoginBtn) {
            tabLoginBtn.style.background = "#1E40AF";
            tabLoginBtn.style.color = "#ffffff";
        }
        if (tabRegisterBtn) {
            tabRegisterBtn.style.background = "transparent";
            tabRegisterBtn.style.color = "#475569";
        }
        if (authTitle) authTitle.textContent = "Account Login";
        if (authSubtitle) authSubtitle.textContent = "Enter your registered 10-digit mobile number to login.";
        if (loginMobileInput) {
            if (mobile && mobile.value) loginMobileInput.value = mobile.value;
            loginMobileInput.focus();
        }
    } else {
        if (form) form.style.display = "block";
        if (quickLoginForm) quickLoginForm.style.display = "none";
        if (tabRegisterBtn) {
            tabRegisterBtn.style.background = "#169c55";
            tabRegisterBtn.style.color = "#ffffff";
        }
        if (tabLoginBtn) {
            tabLoginBtn.style.background = "transparent";
            tabLoginBtn.style.color = "#475569";
        }
        if (authTitle) authTitle.textContent = "Free Registration";
        if (authSubtitle) authSubtitle.textContent = "Register once and access Demo Books, eBooks and My Library.";
        if (mobile) mobile.focus();
    }
}

// [2] URL से शेयर आईडी लाना और इनपुट को Read-Only बनाना (Organic पर AI000004 और User पर उसकी Share ID)
function syncShareContextFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const sessionReferralId = (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function') 
        ? window.V1_SESSION.getReferralId() : null;

    const shareTokenFromUrl = urlParams.get('share_token') || urlParams.get('share_id') || urlParams.get('ref') || urlParams.get('tracking_token');
    const referralMobileParam = urlParams.get('referral_mobile') || urlParams.get('referral');

    // प्राथमिकता: 1. URL की शेयर आईडी, 2. Session/Storage की शेयर आईडी, 3. डिफ़ॉल्ट ऑर्गेनिक मास्टर आईडी (AI000004)
    let finalShareToken = shareTokenFromUrl || sessionReferralId || 'AI000004';

    // फॉर्मेट वैलिडेट और फिक्स करना (ताकि अधूरा कोड डेटाबेस में null न दे)
    const isValidShareIdFormat = (id) => id && /^AI\d{4,8}$/i.test(id);
    if (finalShareToken && isValidShareIdFormat(finalShareToken)) {
        let match = finalShareToken.match(/AI(\d+)/i);
        if (match && match[1].length < 6) {
            let paddedNum = match[1].padStart(6, '0');
            finalShareToken = `AI${paddedNum}`;
        }
    } else {
        finalShareToken = 'AI000004';
    }

    const shareContext = {
        source: urlParams.get('source') || urlParams.get('utm_source') || null,
        share_channel: urlParams.get('share_channel') || urlParams.get('channel') || urlParams.get('utm_medium') || null,
        share_token: finalShareToken,
        referral_mobile: referralMobileParam || null,
        asset_url: window.location.href || null
    };

    if (typeof persistShareContext === 'function') persistShareContext(shareContext);

    if (referralMobile) {
        if (!referralMobile.value) {
            referralMobile.value = shareContext.share_token;
        }
        
        // **यहाँ शेयर आईडी को Read-Only बनाया गया है**
        referralMobile.setAttribute("readonly", true);
        referralMobile.style.backgroundColor = "#e9ecef";
        referralMobile.style.cursor = "not-allowed";

        if (referralMobile.value) {
            lookupReferrerName(referralMobile.value.trim());
        }
    }
}

async function initializePage() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const mobileParam = urlParams.get('mobile');
        const modeParam = urlParams.get('mode');
        returnUrl = urlParams.get('return');

        syncShareContextFromUrl();

        if (mobileParam) {
            if (mobile) mobile.value = mobileParam;
            if (loginMobileInput) loginMobileInput.value = mobileParam;
        }

        bindEvents();

        if (modeParam === "login") {
            switchAuthTab("login");
        }
    } catch (error) {
        console.error("Initialization Error :", error);
    }
}

function bindEvents() {
    if (form) form.addEventListener("submit", registerAccount);
    if (quickLoginForm) quickLoginForm.addEventListener("submit", handleQuickLogin);
    if (backBtn) backBtn.addEventListener("click", () => history.back());
    if (mobile) mobile.addEventListener('blur', checkExistingUser);
    
    if (tabRegisterBtn) tabRegisterBtn.addEventListener("click", () => switchAuthTab("register"));
    if (tabLoginBtn) tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
    if (switchLoginLink) switchLoginLink.addEventListener("click", (e) => { e.preventDefault(); switchAuthTab("login"); });
    if (switchRegisterLink) switchRegisterLink.addEventListener("click", (e) => { e.preventDefault(); switchAuthTab("register"); });

    if (loginMobileInput) {
        loginMobileInput.addEventListener("input", () => {
            loginMobileInput.value = loginMobileInput.value.replace(/\D/g, "").slice(0, 10);
        });
    }

    if (referralMobile) {
        referralMobile.addEventListener("input", debounce(async function() {
            const query = referralMobile.value.trim();
            if (query.length >= 4) {
                await lookupReferrerName(query);
            } else {
                clearReferrerDisplay();
                window.currentReferrerData = { uuid: null, name: null, mobile: null, shareId: null };
            }
        }, 400));
    }
}

// [2.5] क्विक मोबाइल लॉगिन सबमिशन
async function handleQuickLogin(event) {
    event.preventDefault();
    clearMessage();

    const mobileNum = loginMobileInput ? loginMobileInput.value.trim() : "";
    if (!/^[6-9]\d{9}$/.test(mobileNum)) {
        showMessage("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।");
        if (loginMobileInput) loginMobileInput.focus();
        return;
    }

    if (quickLoginSubmitBtn) {
        quickLoginSubmitBtn.disabled = true;
        quickLoginSubmitBtn.textContent = "लॉगिन हो रहा है...";
    }

    try {
        if (typeof isMobileRegistered !== "function") {
            throw new Error("Database engine not loaded properly.");
        }

        const user = await isMobileRegistered(mobileNum);
        if (user) {
            if (typeof createLoginSession === "function") {
                createLoginSession(user);
            }
            if (typeof showToast === "function") showToast("लॉगिन सफल!");
            showMessage("लॉगिन सफल! रीडायरेक्ट किया जा रहा है...");
            setTimeout(() => completeRegistration({ success: true, profile: user }), 600);
        } else {
            showMessage("यह मोबाइल नंबर रजिस्टर्ड नहीं है। कृपया नया अकाउंट बनाएं।");
            if (quickLoginSubmitBtn) {
                quickLoginSubmitBtn.disabled = false;
                quickLoginSubmitBtn.textContent = "लॉगिन करें (LOGIN)";
            }
            setTimeout(() => {
                switchAuthTab("register");
                if (mobile) mobile.value = mobileNum;
            }, 1200);
        }
    } catch (err) {
        console.error("Quick Login Error:", err);
        showMessage(err.message || "लॉगिन में समस्या आई, पुनः प्रयास करें।");
        if (quickLoginSubmitBtn) {
            quickLoginSubmitBtn.disabled = false;
            quickLoginSubmitBtn.textContent = "लॉगिन करें (LOGIN)";
        }
    }
}

// [3] डेटाबेस में Share_ID और Mobile से सर्च करने वाला मुख्य फंक्शन (With Master Account Fallback)
async function lookupReferrerName(identifier) {
    if (!identifier) return;

    // यदि AI000004 है, तो सीधे मास्टर अकाउंट से बाइंड करें (Zero Egress DB query)
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

        console.log("🔍 Searching Share ID in database:", identifier);
        let data = null;

        // 3.1 अगर 10 अंकों का नंबर है, तो mobile कॉलम में खोजें
        if (/^[6-9]\d{9}$/.test(identifier)) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("mobile", identifier)
                .maybeSingle();
            data = res.data;
        } 
        
        // 3.2 अगर शेयर आईडी है, तो share_id कॉलम में खोजें
        if (!data) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("share_id", identifier)
                .maybeSingle();
            data = res.data;
        }

        console.log("📊 Database Response for Share ID:", data);

        if (data) {
            window.currentReferrerData = {
                uuid: data.id,             // referred_by के लिए
                name: data.full_name || "Aarogyam Member", 
                mobile: data.mobile,            // referral_mobile के लिए
                shareId: data.share_id          // referral_code के लिए
            };
            showReferrerGreen(`✔ Referred by: ${data.full_name} (${data.mobile || 'No Mobile'})`);
        } else {
            window.currentReferrerData = { uuid: null, name: null, mobile: null, shareId: null };
            showReferrerRed("✖ Invalid Share ID/Mobile");
        }
    } catch (err) {
        console.error("Referrer lookup exception:", err);
        showReferrerRed("✖ Invalid Share ID/Mobile");
    }
}

// [4] नाम का रंग हरा या लाल दिखाने वाले फंक्शन
function showReferrerGreen(text) {
    if (!referrerDisplay) createReferrerSpanElement();
    if (referrerDisplay) {
        referrerDisplay.style.color = "#28a745"; 
        referrerDisplay.textContent = text;
    }
}

function showReferrerRed(text) {
    if (!referrerDisplay) createReferrerSpanElement();
    if (referrerDisplay) {
        referrerDisplay.style.color = "#dc3545"; 
        referrerDisplay.textContent = text;
    }
}

function clearReferrerDisplay() {
    if (referrerDisplay) referrerDisplay.textContent = "";
}

function createReferrerSpanElement() {
    if (referralMobile && !document.getElementById("referrerDisplayName")) {
        referrerDisplay = document.createElement("div");
        referrerDisplay.id = "referrerDisplayName";
        referrerDisplay.style.fontSize = "13px";
        referrerDisplay.style.marginTop = "4px";
        referrerDisplay.style.fontWeight = "600";
        referralMobile.parentNode.appendChild(referrerDisplay);
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function checkExistingUser() {
    const mobileNo = mobile.value.trim();
    if (/^[6-9]\d{9}$/.test(mobileNo)) {
        try {
            const userExists = await isMobileRegistered(mobileNo);
            if (userExists) {
                showMessage("यह मोबाइल नंबर पहले से रजिस्टर्ड है। लॉगिन करने के लिए ऊपर 'लॉगिन' टैब दबाएं।");
                if (registerBtn) registerBtn.disabled = true;
            } else {
                if (formMessage.textContent.includes("पहले से रजिस्टर्ड") || formMessage.textContent.includes("already registered")) {
                    clearMessage();
                }
                if (registerBtn) registerBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error checking user:", error);
            if (registerBtn) registerBtn.disabled = false;
        }
    }
}

function setLoading(status) {
    if (!registerBtn) return;
    registerBtn.disabled = status;
    registerBtn.textContent = status ? "Creating Account..." : "CREATE FREE ACCOUNT";
}

function showMessage(message) {
    if (formMessage) formMessage.textContent = message;
}

function clearMessage() {
    if (formMessage) formMessage.textContent = "";
}

if (mobile) {
    mobile.addEventListener("input", () => {
        mobile.value = mobile.value.replace(/\D/g, "").slice(0, 10);
    });
}

function validateForm() {
    clearMessage();
    const name = fullName.value.trim();
    const mobileNo = mobile.value.trim();
    const emailId = email.value.trim();
    const referral = referralMobile ? referralMobile.value.trim() : '';

    if (name.length < 3) {
        showMessage("Please enter your full name.");
        fullName.focus();
        return false;
    }
    if (!/^[6-9]\d{9}$/.test(mobileNo)) {
        showMessage("Please enter a valid 10 digit mobile number.");
        mobile.focus();
        return false;
    }
    if (emailId !== "" && !/^\S+@\S+\.\S+$/.test(emailId)) {
        showMessage("Please enter a valid email address.");
        email.focus();
        return false;
    }
    const isValidMobileRef = /^[6-9]\d{9}$/.test(referral);
    const isValidShareIdRef = /^AI\d{4,8}$/i.test(referral);

    if (referral !== "" && !isValidMobileRef && !isValidShareIdRef) {
        showMessage("Please enter a valid referral mobile or share ID.");
        referralMobile.focus();
        return false;
    }
    if (!agreeTerms.checked) {
        showMessage("Please accept Terms & Privacy Policy.");
        agreeTerms.focus();
        return false;
    }
    return true;
}

// [5] सबमिट लॉजिक - शत-प्रतिशत सही डेटा बाइंडिंग और सेशन सोर्स/लैंडिंग पेज के साथ
async function registerAccount(event) {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
        const mobileNo = mobile.value.trim();
        const userExists = await isMobileRegistered(mobileNo);
        if (userExists) {
            showMessage("यह मोबाइल नंबर पहले से रजिस्टर्ड है। कृपया लॉगिन करें।");
            setLoading(false);
            setTimeout(() => {
                switchAuthTab("login");
                if (loginMobileInput) loginMobileInput.value = mobileNo;
            }, 800);
            return;
        }

        // सेशन या URL से मास्टर सोर्स और लैंडिंग पेज उठाना
        const session = (window.V1_SESSION && typeof window.V1_SESSION.getSession === 'function') 
            ? window.V1_SESSION.getSession() : {};

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('source') || urlParams.get('utm_source') || session.registration_source || 'organic';
        const landingPageParam = session.landing_page || window.location.pathname || '/';

        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || (referralMobile ? referralMobile.value.trim() : 'AI000004');

        const formData = {
            fullName: fullName.value.trim(),
            mobile: mobileNo,
            email: email.value.trim(),
            referred_by: finalUuid,             // UUID
            referralMobile: finalReferralMobile, // मोबाइल नंबर
            referralCode: finalReferralCode,     // सही Share ID (या AI000004)
            source: sourceParam,                 // ट्रैफिक सोर्स (facebook, whatsapp, organic आदि)
            landing_page: landingPageParam       // किस पेज से यूजर आया उसका पाथ
        };

        console.log("📦 Final Payload Being Sent to Database:", formData);

        if (typeof persistShareContext === 'function') {
            persistShareContext({ source: sourceParam, share_token: finalReferralCode });
        }
        if (typeof registerUser !== "function") {
            throw new Error("Database engine not loaded properly.");
        }

        const result = await registerUser(formData);
        if (!result || !result.success) throw new Error(result?.message || "Registration failed on server.");

        if (typeof showToast === "function") showToast("Registration Successful");
        showMessage("Registration Successful...");

        setTimeout(() => completeRegistration(result), 800);
    } catch (error) {
        console.error("Registration Error :", error);
        showMessage(error.message || "Registration failed.");
        setLoading(false);
    }
}

// [6] रजिस्ट्रेशन / लॉगिन पूरा होने के बाद पेज रीडायरेक्ट करने वाला फंक्शन
// Direct Registration -> My Profile (/ucas/index.html)
// Checkout Registration -> My Library (/ebooks/my-library.html)
function completeRegistration(result) {
    try {
        showMessage("Success! Redirecting...");
        setLoading(false);

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('source') || '';
        const isFromCheckout = sourceParam.includes('checkout') || (returnUrl && (returnUrl.includes('checkout') || returnUrl.includes('my-library')));

        setTimeout(() => {
            if (isFromCheckout) {
                window.location.href = "/ebooks/my-library.html";
            } else if (returnUrl && !returnUrl.includes('registration')) {
                window.location.href = returnUrl;
            } else {
                // डिफ़ॉल्ट डायरेक्ट रजिस्ट्रेशन -> My Profile
                window.location.href = "/ucas/index.html";
            }
        }, 800);
    }
    catch (error) {
        console.error("Complete Registration Error :", error);
        showMessage("Unable to continue.");
        setLoading(false);
    }
}

console.log("✅ Registration Module Loaded");