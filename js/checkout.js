/* ==========================================
   AAROGYAM INDIA
   CHECKOUT.JS (Complete & Final - With Smart Referral Engine)
========================================== */

"use strict";

let referrerDisplay = document.getElementById("referrerDisplayName");

document.addEventListener("DOMContentLoaded", () => {
    loadBook();
    syncCheckoutShareContext();
});

function syncCheckoutShareContext() {
    const params = new URLSearchParams(window.location.search);
    
    const sessionReferralId = (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function') 
        ? window.V1_SESSION.getReferralId() : null;

    const shareTokenFromUrl = params.get('share_token') || params.get('share_id') || params.get('tracking_token');
    const referralMobileParam = params.get('referral_mobile') || params.get('referral');

    const shareContext = {
        source: params.get("source") || params.get("utm_source") || "checkout",
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_type: params.get("asset_type") || null,
        asset_id: params.get("asset_id") || null,
        asset_title: params.get("asset_title") || null,
        asset_url: window.location.href || null,
        referrer: document.referrer || null,
        landing_url: window.location.href || null
    };

    if (typeof persistShareContext === "function") {
        persistShareContext(shareContext);
    }

    // यदि चेकआउट फॉर्म में रेफरल इनपुट है, तो उसे ऑटो-फिल करें और लुकअप चलाएं
    const checkoutRefInput = document.getElementById("referralMobile");
    if (checkoutRefInput) {
        if (!checkoutRefInput.value) {
            checkoutRefInput.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }
        // रीड-ऑनली बनाना चाहें तो यह लाइन ऑन कर सकते हैं:
        // checkoutRefInput.setAttribute("readonly", true);

        if (checkoutRefInput.value) {
            lookupReferrerName(checkoutRefInput.value.trim());
        }
    }

    return typeof getCurrentShareContext === "function" ? getCurrentShareContext() : shareContext;
}

// स्मार्ट डेटा बाइंडिंग बंडल
window.currentReferrerData = {
    uuid: null,
    name: null,
    mobile: null,
    shareId: null
};

// डेटाबेस से रेफरर का नाम ढूंढने वाला फंक्शन
async function lookupReferrerName(identifier) {
    if (!identifier) return;
    
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let data = null;

        if (/^[6-9]\d{9}$/.test(identifier)) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("mobile", identifier)
                .maybeSingle();
            data = res.data;
        } 
        
        if (!data) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("share_id", identifier)
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

function createReferrerSpanElement() {
    const refInput = document.getElementById("referralMobile");
    if (refInput && !document.getElementById("referrerDisplayName")) {
        referrerDisplay = document.createElement("div");
        referrerDisplay.id = "referrerDisplayName";
        referrerDisplay.style.fontSize = "13px";
        referrerDisplay.style.marginTop = "4px";
        referrerDisplay.style.fontWeight = "600";
        refInput.parentNode.appendChild(referrerDisplay);
    }
}

async function loadBook() {
    try {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("book_id") || params.get("id") || "BK001";

        const response = await fetch("../data/books.json");
        const jsonResult = await response.json();

        const booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
        const book = booksArray.find(item => item.id === bookId || item.book_id === bookId);

        if (!book) {
            alert("Book Not Found");
            return;
        }

        const bookCover = book.cover || book.cover_image || "";
        const bookName = book.name || book.title || "";
        const bookMrp = book.mrp || 0;
        const bookOffer = book.offer_price || book.offerPrice || 0;

        window.currentCheckoutBook = {
            id: book.id || book.book_id,
            title: bookName,
            mrp: bookMrp,
            offerPrice: bookOffer,
            cover: bookCover
        };

        const coverEl = document.getElementById("bookCover");
        if (coverEl) coverEl.src = bookCover;
        
        const nameEl = document.getElementById("bookName");
        if (nameEl) nameEl.textContent = bookName;
        
        const mrpEl = document.getElementById("bookMrp");
        if (mrpEl) mrpEl.textContent = "₹" + bookMrp;
        
        const priceEl = document.getElementById("bookPrice");
        if (priceEl) priceEl.textContent = "₹" + bookOffer;

        const sumBook = document.getElementById("summaryBook");
        if (sumBook) sumBook.textContent = bookName;
        
        const sumMrp = document.getElementById("summaryMrp");
        if (sumMrp) sumMrp.textContent = "₹" + bookMrp;
        
        const sumPrice = document.getElementById("summaryPrice");
        if (sumPrice) sumPrice.textContent = "₹" + bookOffer;
        
        const totPrice = document.getElementById("totalPrice");
        if (totPrice) totPrice.textContent = "₹" + bookOffer;

        autoFillUserData();

    } catch (error) {
        console.error("Book Load Error:", error);
        alert("Unable to Load Book Data");
    }
}

function autoFillUserData() {
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const nameVal = storedUser.full_name || storedUser.name || "";
    const mobileVal = storedUser.mobile || "";
    const emailVal = storedUser.email || "";

    if (nameVal && document.getElementById("customerName")) document.getElementById("customerName").value = nameVal;
    if (mobileVal && document.getElementById("customerMobile")) document.getElementById("customerMobile").value = mobileVal;
    if (emailVal && document.getElementById("customerEmail")) document.getElementById("customerEmail").value = emailVal;

    if (typeof getCurrentUser === "function") {
        const user = getCurrentUser();
        if (user) {
            if (user.full_name && document.getElementById("customerName")) document.getElementById("customerName").value = user.full_name;
            if (user.mobile && document.getElementById("customerMobile")) document.getElementById("customerMobile").value = user.mobile;
            if (user.email && document.getElementById("customerEmail")) document.getElementById("customerEmail").value = user.email;
        }
    }
}

// Pay Now Button Logic with Smart Referral Payload
document.getElementById("payNowBtn").addEventListener("click", async function () {
    const name = document.getElementById("customerName").value.trim();
    const mobile = document.getElementById("customerMobile").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const refInputEl = document.getElementById("referralMobile");
    const enteredReferral = refInputEl ? refInputEl.value.trim() : 'AI000004';

    if (name === "") {
        alert("Please Enter Full Name");
        return;
    }

    if (mobile.length !== 10) {
        alert("Enter Valid Mobile Number");
        return;
    }

    const payBtn = document.getElementById("payNowBtn");
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    try {
        syncCheckoutShareContext();

        // सही रेफरल डेटा तैयार करना
        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || enteredReferral;

        if (typeof registerUser === "function") {
            const regResult = await registerUser({
                fullName: name,
                mobile: mobile,
                email: email,
                referred_by: finalUuid,
                referralMobile: finalReferralMobile,
                referralCode: finalReferralCode,
                source: "checkout"
            });

            const isAlreadyExists = regResult.message && regResult.message.toLowerCase().includes("already");

            if (!regResult.success && !isAlreadyExists) {
                alert(regResult.message || "User registration failed.");
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                return;
            }
        }

        const attributionContext = typeof getCurrentShareContext === "function" ? getCurrentShareContext() : {};
        const orderData = {
            bookId: window.currentCheckoutBook ? window.currentCheckoutBook.id : "BK001",
            title: window.currentCheckoutBook ? window.currentCheckoutBook.title : document.getElementById("bookName").textContent,
            amount: window.currentCheckoutBook ? window.currentCheckoutBook.offerPrice : 99,
            customerName: name,
            mobile: mobile,
            email: email,
            referred_by: finalUuid,
            referralMobile: finalReferralMobile,
            referralCode: finalReferralCode,
            attribution: attributionContext,
            source: attributionContext.source || "checkout"
        };

        window.currentOrder = orderData;
        localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(orderData));

        if (typeof startPayment === "function") {
            const res = startPayment();
            
            if (res && typeof res === 'object' && res.success === false) {
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                if (res.message) alert(res.message);
            }
        } else {
            setTimeout(() => {
                if (payBtn.textContent === "Processing...") {
                    payBtn.disabled = false;
                    payBtn.textContent = "Pay Now";
                }
            }, 3000);

            alert("Error: Payment module not loaded properly.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Something went wrong.");
        payBtn.disabled = false;
        payBtn.textContent = "Pay Now";
    }
});

window.addEventListener('focus', function() {
    const payBtn = document.getElementById("payNowBtn");
    if (payBtn && payBtn.textContent === "Processing...") {
        setTimeout(() => {
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }, 1000);
    }
});