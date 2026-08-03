/*=========================================================
  FILE NAME : registration.js
  PROJECT   : Aarogyam India V1
  MODULE    : Free Registration
  VERSION   : 1.0.1 (Fixed & Optimized)
=========================================================*/

"use strict";

let returnUrl = null; // This will hold the redirect URL after registration

const form = document.getElementById("registrationForm");
const fullName = document.getElementById("fullName");
const mobile = document.getElementById("mobile");
const email = document.getElementById("email");
const referralMobile = document.getElementById("referralMobile");
const agreeTerms = document.getElementById("agreeTerms");
const registerBtn = document.getElementById("registerBtn");
const formMessage = document.getElementById("formMessage");
const backBtn = document.getElementById("backBtn");

document.addEventListener("DOMContentLoaded", initializePage);

function syncShareContextFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareContext = {
        source: urlParams.get('source') || urlParams.get('utm_source') || null,
        share_channel: urlParams.get('share_channel') || urlParams.get('channel') || urlParams.get('utm_medium') || null,
        share_token: urlParams.get('share_token') || urlParams.get('share_id') || urlParams.get('tracking_token') || null,
        referral_mobile: urlParams.get('referral_mobile') || urlParams.get('referral') || null,
        asset_type: urlParams.get('asset_type') || null,
        asset_id: urlParams.get('asset_id') || null,
        asset_title: urlParams.get('asset_title') || null,
        asset_url: urlParams.get('asset_url') || null,
        referrer: document.referrer || null,
        landing_url: window.location.href || null
    };

    if (typeof persistShareContext === 'function') {
        persistShareContext(shareContext);
    }

    if (referralMobile && shareContext.referral_mobile && !referralMobile.value) {
        referralMobile.value = shareContext.referral_mobile;
    }
}

async function initializePage() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const mobileParam = urlParams.get('mobile');
        returnUrl = urlParams.get('return');

        syncShareContextFromUrl();

        if (mobileParam && mobile) {
            mobile.value = mobileParam;
        }

        bindEvents();
    }
    catch (error) {
        console.error("Initialization Error :", error);
    }
}

function bindEvents() {
    if (form) {
        form.addEventListener("submit", registerAccount);
    }
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            history.back();
        });
    }
    if(mobile) {
        mobile.addEventListener('blur', checkExistingUser);
    }
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
                // Only clear the message if it's the specific "already registered" message
                if (formMessage.textContent === "This mobile number is already registered. Please login.") {
                    clearMessage();
                }
                if(registerBtn) registerBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error checking user:", error);
            if(registerBtn) registerBtn.disabled = false; // Don't block registration on API error
        }
    }
}

function setLoading(status) {
    if (!registerBtn) return;
    registerBtn.disabled = status;
    registerBtn.textContent = status
        ? "Creating Account..."
        : "CREATE FREE ACCOUNT";
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

if (referralMobile) {
    referralMobile.addEventListener("input", () => {
        referralMobile.value = referralMobile.value.replace(/\D/g, "").slice(0, 10);
    });
}

function validateForm() {
    clearMessage();

    const name = fullName.value.trim();
    const mobileNo = mobile.value.trim();
    const emailId = email.value.trim();
    const referral = referralMobile.value.trim();

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

    if (referral !== "" && !/^[6-9]\d{9}$/.test(referral)) {
        showMessage("Please enter a valid referral mobile.");
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

async function registerAccount(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
        const mobileNo = mobile.value.trim();
        // Final check to prevent duplicate registration
        const userExists = await isMobileRegistered(mobileNo);
        if (userExists) {
            showMessage("This mobile number is already registered. Please login.");
            setLoading(false);
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sourceParam = urlParams.get('source') || urlParams.get('utm_source') || 'registration';

        const formData = {
            fullName: fullName.value.trim(),
            mobile: mobileNo,
            email: email.value.trim(),
            referralCode: referralMobile.value.trim(),
            source: sourceParam
        };

        if (typeof persistShareContext === 'function') {
            persistShareContext({
                source: sourceParam,
                referral_mobile: referralMobile.value.trim() || null
            });
        }

        // यह चेक करेगा कि registerUser फंक्शन उपलब्ध है या नहीं
        if (typeof registerUser !== "function") {
            throw new Error("Database engine not loaded properly.");
        }

        const result = await registerUser(formData);

        if (!result || !result.success) {
            // Display a more specific error message if available
            throw new Error(result?.message || "Registration failed on server.");
        }

        if (typeof showToast === "function") {
            showToast("Registration Successful");
        }

        showMessage("Registration Successful...");

        setTimeout(() => {
            completeRegistration(result);
        }, 800);

    }
    catch (error) {
        console.error("Registration Error :", error);
        showMessage(error.message || "Registration failed.");
        setLoading(false);
    }
}

function completeRegistration(result) {
    try {
        if (!result || !result.success) {
            throw new Error("Registration failed.");
        }

        if (typeof getCurrentUser === "function") {
            const user = getCurrentUser();
            console.log("Current User :", user);
        }

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

window.addEventListener("online", () => {
    clearMessage();
});

window.addEventListener("offline", () => {
    showMessage("No Internet Connection.");
});

console.log("Registration Module Ready");