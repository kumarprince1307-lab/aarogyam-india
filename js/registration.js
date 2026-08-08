/*=========================================================
  FILE NAME : registration.js
  PROJECT   : Aarogyam India V1
  MODULE    : Free Registration & Complete Smart Referral Engine
  VERSION   : 2.0.0 (Final - Share_ID Fix & Read-Only Input)
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

document.addEventListener("DOMContentLoaded", initializePage);

// [2] URL से शेयर आईडी लाना और इनपुट को Read-Only बनाना
function syncShareContextFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const sessionReferralId = (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function') 
        ? window.V1_SESSION.getReferralId() : null;

    const shareTokenFromUrl = urlParams.get('share_token') || urlParams.get('share_id') || urlParams.get('tracking_token');
    const referralMobileParam = urlParams.get('referral_mobile') || urlParams.get('referral');

    const shareContext = {
        source: urlParams.get('source') || urlParams.get('utm_source') || null,
        share_channel: urlParams.get('share_channel') || urlParams.get('channel') || urlParams.get('utm_medium') || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_url: window.location.href || null
    };

    if (typeof persistShareContext === 'function') persistShareContext(shareContext);

    if (referralMobile) {
        if (!referralMobile.value) {
            referralMobile.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }
        
        // **यहाँ शेयर आईडी को Read-Only (एडिट न हो सकने वाला) बनाया गया है**
        referralMobile.setAttribute("readonly", true);
        referralMobile.style.backgroundColor = "#e9ecef"; // डिसेबल दिखने के लिए हल्का ग्रे रंग
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
        returnUrl = urlParams.get('return');

        syncShareContextFromUrl();

        if (mobileParam && mobile) mobile.value = mobileParam;
        bindEvents();
    } catch (error) {
        console.error("Initialization Error :", error);
    }
}

function bindEvents() {
    if (form) form.addEventListener("submit", registerAccount);
    if (backBtn) backBtn.addEventListener("click", () => history.back());
    if (mobile) mobile.addEventListener('blur', checkExistingUser);
    
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

// [3] डेटाबेस में Share_ID और Mobile से सर्च करने वाला मुख्य फंक्शन
async function lookupReferrerName(identifier) {
    if (!identifier) return;
    
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
        
        // 3.2 अगर शेयर आईडी (जैसे AI000037) है, तो share_id कॉलम में खोजें
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
            // बंडल में डेटा सेव करना
            window.currentReferrerData = {
                uuid: data.id,                  // referred_by के लिए
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
                showMessage("This mobile number is already registered. Please login.");
                if(registerBtn) registerBtn.disabled = true;
            } else {
                if (formMessage.textContent === "This mobile number is already registered. Please login.") {
                    clearMessage();
                }
                if(registerBtn) registerBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error checking user:", error);
            if(registerBtn) registerBtn.disabled = false;
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

// [5] सबमिट लॉजिक - शत-प्रतिशत सही डेटा बाइंडिंग के साथ
async function registerAccount(event) {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
        const mobileNo = mobile.value.trim();
        const userExists = await isMobileRegistered(mobileNo);
        if (userExists) {
            showMessage("This mobile number is already registered. Please login.");
            setLoading(false);
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('source') || urlParams.get('utm_source') || 'registration';

        // **यहाँ सबसे महत्वपूर्ण सुधार किया गया है:**
        // अगर सर्च होकर currentReferrerData मिल चुका है, तो वही जाएगा। 
        // अगर किसी वजह से सर्च नहीं हुआ और इनपुट में शेयर आईडी है, तो वह जाएगी, वरना खाली रहेगा।
        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || (referralMobile ? referralMobile.value.trim() : null);

        const formData = {
            fullName: fullName.value.trim(),
            mobile: mobileNo,
            email: email.value.trim(),
            referred_by: finalUuid,             // अब यहाँ पक्का UUID जाएगा
            referralMobile: finalReferralMobile, // अब यहाँ पक्का मोबाइल नंबर जाएगा
            referralCode: finalReferralCode,     // अब यहाँ पक्का सही Share ID जाएगी (AI000004 जबरदस्ती नहीं घुसेगा)
            source: sourceParam
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
// [6] रजिस्ट्रेशन पूरा होने के बाद पेज रीडायरेक्ट करने वाला फंक्शन
function completeRegistration(result) {
    try {
        showMessage("Registration completed successfully.");
        setLoading(false);

        setTimeout(() => {
            if (returnUrl) {
                window.location.href = returnUrl;
            } else {
                window.location.href = "ebooks/my-library.html";
            }
        }, 1000);
    }
    catch (error) {
        console.error("Complete Registration Error :", error);
        showMessage("Unable to continue.");
        setLoading(false);
    }
}
console.log("✅ Registration Module Loaded");