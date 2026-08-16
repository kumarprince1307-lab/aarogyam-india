/* ==========================================
   AAROGYAM INDIA
   CHECKOUT.JS (Complete, Final & Butter-Smooth with Dynamic Book ID & Full Checkout Logs)
========================================== */
/* =========================================
   CHECKOUT.JS - PREV PAGE TRACKER
========================================= */

// जैसे ही चेकआउट पेज खुले, तुरंत पिछला स्टोर पेज सेव कर लें
document.addEventListener("DOMContentLoaded", () => {
    if (document.referrer && !document.referrer.includes("checkout.html") && !document.referrer.includes("payment-failed.html")) {
        sessionStorage.setItem("AI_PREV_STORE_PAGE", document.referrer);
    }
});
"use strict";

let referrerDisplay = document.getElementById("referrerDisplayName");

document.addEventListener("DOMContentLoaded", () => {
    loadBook();
    syncCheckoutShareContext();
});

function syncCheckoutShareContext() {
    const params = new URLSearchParams(window.location.search);
    
    const session = (window.V1_SESSION && typeof window.V1_SESSION.getSession === 'function') 
        ? window.V1_SESSION.getSession() : {};

    const sessionReferralId = session.referral_share_id || (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function' ? window.V1_SESSION.getReferralId() : null);

    const shareTokenFromUrl = params.get('share_token') || params.get('share_id') || params.get('tracking_token');
    const referralMobileParam = params.get('referral_mobile') || params.get('referral');

    // सेशन या URL से सही सोर्स और लैंडिंग पेज उठाना
    const sourceVal = params.get("source") || params.get("utm_source") || session.registration_source || "checkout";
    const landingUrlVal = session.landing_page || window.location.href || null;

    const shareContext = {
        source: sourceVal,
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_type: params.get("asset_type") || null,
        asset_id: params.get("asset_id") || null,
        asset_title: params.get("asset_title") || null,
        asset_url: window.location.href || null,
        referrer: document.referrer || null,
        landing_url: landingUrlVal
    };

    if (typeof persistShareContext === "function") {
        persistShareContext(shareContext);
    }

    const checkoutRefInput = document.getElementById("referralMobile");
    if (checkoutRefInput) {
        if (!checkoutRefInput.value) {
            checkoutRefInput.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }

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
        // यहाँ URL से जो ID मिलेगी (जैसे id=BK002 या book_id=BK003) वही मुख्य होगी
        const bookId = params.get("book_id") || params.get("id");

        const response = await fetch("../data/books.json");
        const jsonResult = await response.json();

        const booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
        
        // अगर URL में ID दी है तो उसे खोजें, नहीं तो एरे की पहली बुक को डिफ़ॉल्ट ले लें ताकि BK001 की गड़बड़ न हो
        let book = null;
        if (bookId) {
            book = booksArray.find(item => item.id === bookId || item.book_id === bookId);
        }
        if (!book && booksArray.length > 0) {
            book = booksArray[0]; // पहली उपलब्ध बुक
        }

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

// -------------------------------------------------------------
// CHECKOUT LOGS HELPER FUNCTION
// -------------------------------------------------------------
async function logCheckoutActivity(profileId, bookId, status) {
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let currentUuid = profileId;
        if (!currentUuid && window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') {
            currentUuid = window.V1_SESSION.getUserId();
        }

        if (!currentUuid) return;

        // अब यहाँ कभी भी फर्जी BK001 नहीं जाएगा, जो असली bookId होगी वही सेव होगी
        const targetBookId = bookId || (window.currentCheckoutBook ? window.currentCheckoutBook.id : null);
        if (!targetBookId) return;

        const { error } = await activeDb
            .from("checkout_logs")
            .insert([
                {
                    profile_id: currentUuid,
                    book_id: targetBookId,
                    status: status // 'initiated', 'success', 'failed', 'dropped'
                }
            ]);

        if (error) {
            console.error("Error inserting checkout log:", error);
        } else {
            console.log(`✅ Checkout log recorded: [${status}] for book ${targetBookId}`);
        }
    } catch (err) {
        console.error("Checkout log exception:", err);
    }
}

// Pay Now Button Logic with Smart Referral, Razorpay Integration & Full Activity Tracking
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

    // सुरक्षा चेक: बिना बुक लोड हुए पेमेंट प्रोसेस न हो
    if (!window.currentCheckoutBook || !window.currentCheckoutBook.id) {
        alert("Error: Book data not found. Please refresh the page.");
        return;
    }

    const payBtn = document.getElementById("payNowBtn");
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    try {
        const shareContextData = syncCheckoutShareContext();

        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || enteredReferral;
        const sourceVal = shareContextData.source || "checkout";
        const landingPageVal = shareContextData.landing_url || window.location.pathname;

        if (typeof registerUser === "function") {
            const regResult = await registerUser({
                fullName: name,
                mobile: mobile,
                email: email,
                referred_by: finalUuid,
                referralMobile: finalReferralMobile,
                referralCode: finalReferralCode,
                source: sourceVal,
                landing_page: landingPageVal
            });

            const isAlreadyExists = regResult.message && regResult.message.toLowerCase().includes("already");

            if (!regResult.success && !isAlreadyExists) {
                alert(regResult.message || "User registration failed.");
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                return;
            }
        }

        // सीधे JSON से उठाई गई असली बुक आईडी
        const bookIdToBuy = window.currentCheckoutBook.id;
        const bookTitle = window.currentCheckoutBook.title;
        const bookPrice = window.currentCheckoutBook.offerPrice;
        
        const orderData = {
            bookId: bookIdToBuy,
            title: bookTitle,
            amount: bookPrice,
            customerName: name,
            mobile: mobile,
            email: email,
            referred_by: finalUuid,
            referralMobile: finalReferralMobile,
            referralCode: finalReferralCode,
            attribution: shareContextData,
            source: sourceVal,
            landing_page: landingPageVal
        };

        window.currentOrder = orderData;
        localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(orderData));

        const activeUserId = (window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') ? window.V1_SESSION.getUserId() : finalUuid;
        
        // 📝 1. चेकआउट लॉग दर्ज करें: पेमेंट शुरू (initiated) - असली बुक आईडी के साथ
        await logCheckoutActivity(activeUserId, bookIdToBuy, 'initiated');

        if (typeof startPayment === "function") {
            const res = startPayment();
            if (res && typeof res === 'object' && res.success === false) {
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                await logCheckoutActivity(activeUserId, bookIdToBuy, 'failed');
                if (res.message) alert(res.message);
            }
        } 
        else if (typeof Razorpay !== "undefined") {
            var options = {
                "key": window.RAZORPAY_KEY || "rzp_live_TOlsqOqkmxYCWP",
                "amount": bookPrice * 100, // पैसों में कन्वर्ट करने के लिए 100 से गुणा
                "currency": "INR",
                "name": "Aarogyam India",
                "description": bookTitle,
                "handler": async function (response) {
                    // 🎉 2. पेमेंट सफल होने पर 'success' लॉग दर्ज करें
                    await logCheckoutActivity(activeUserId, bookIdToBuy, 'success');
                    window.location.href = `payment-success.html?payment_id=${response.razorpay_payment_id}&book_id=${bookIdToBuy}`;
                },
                "prefill": {
                    "name": name,
                    "email": email,
                    "contact": mobile
                },
                "theme": {
                    "color": "#2e7d32"
                },
                "modal": {
                    "ondismiss": async function() {
                        // ❌ 3. यूजर द्वारा पॉपअप बंद करने पर 'dropped' लॉग दर्ज करें
                        console.log("⚠️ Payment popup closed by user (Dropped)");
                        await logCheckoutActivity(activeUserId, bookIdToBuy, 'dropped');
                        payBtn.disabled = false;
                        payBtn.textContent = "Pay Now";
                    }
                }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', async function (response){
                // ⚠️ 4. पेमेंट फेल होने पर 'failed' लॉग दर्ज करें
                await logCheckoutActivity(activeUserId, bookIdToBuy, 'failed');
                alert("Payment Failed: " + response.error.description);
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
            });
            rzp1.open();
        } else {
            setTimeout(() => {
                if (payBtn.textContent === "Processing...") {
                    payBtn.disabled = false;
                    payBtn.textContent = "Pay Now";
                }
            }, 3000);

            alert("Error: Payment gateway not loaded properly.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }

    } catch (error) {
        console.error("Payment Error:", error);
        const activeUserId = (window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') ? window.V1_SESSION.getUserId() : null;
        const bookIdToBuy = window.currentCheckoutBook ? window.currentCheckoutBook.id : null;
        if (bookIdToBuy) {
            await logCheckoutActivity(activeUserId, bookIdToBuy, 'dropped');
        }

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

console.log("✅ Checkout Module Loaded Successfully");