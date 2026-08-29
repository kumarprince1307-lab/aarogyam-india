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
        let rawId = (params.get("book_id") || params.get("id") || params.get("product") || params.get("slug") || "").toLowerCase().trim();
        const rawIds = params.get("ids") || params.get("bundle_ids");
        const customTitle = params.get("title") || params.get("name");
        const customAmount = params.get("amount") || params.get("price");

        let booksArray = [];
        try {
            const response = await fetch("/data/books.json?v=" + Date.now());
            const jsonResult = await response.json();
            booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
        } catch (e) {
            try {
                const response2 = await fetch("../data/books.json?v=" + Date.now());
                const jsonResult2 = await response2.json();
                booksArray = Array.isArray(jsonResult2) ? jsonResult2 : (jsonResult2.books || []);
            } catch (e2) {
                console.warn("Local books.json fallback active");
            }
        }

        // Check custom books from localStorage
        try {
            const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            if (Array.isArray(customBooks)) {
                customBooks.forEach(cb => {
                    if (!cb || !cb.id) return;
                    const idx = booksArray.findIndex(x => x.id && x.id.toUpperCase() === cb.id.toUpperCase());
                    if (idx >= 0) booksArray[idx] = cb;
                    else booksArray.unshift(cb);
                });
            }
            const landingList = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            if (Array.isArray(landingList)) {
                landingList.forEach(lp => {
                    if (!lp || !lp.id) return;
                    const idx = booksArray.findIndex(x => x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                    const synth = {
                        id: lp.id,
                        name: lp.hero?.title || lp.id,
                        mrp: lp.hero?.mrp || 299,
                        offerPrice: lp.hero?.offer_price || 99,
                        cover: lp.hero?.cover_image || "/images/books/kharif-master-guide-2026-cover.webp"
                    };
                    if (idx >= 0) booksArray[idx] = Object.assign({}, booksArray[idx], synth);
                    else booksArray.unshift(synth);
                });
            }
        } catch (e) {}

        // Multi-Book Bundle Check
        if (rawIds) {
            const idList = rawIds.split(",").map(x => x.trim()).filter(Boolean);
            const matchedBooks = [];
            let totalMrp = 0;
            let totalOffer = 0;

            idList.forEach(id => {
                const b = booksArray.find(item => item.id && item.id.toLowerCase() === id.toLowerCase()) || {
                    id: id,
                    name: id === 'BK001' ? 'खरीफ फसल मास्टर गाइड 2026' : (id === 'BK002' ? 'खेती का डॉक्टर (Pocket Doctor)' : 'Aarogyam India eBook'),
                    mrp: 299,
                    offerPrice: 99,
                    cover: "/images/books/kharif-master-guide-2026-cover.webp"
                };
                matchedBooks.push(b);
                totalMrp += (b.mrp || 299);
                totalOffer += (b.offerPrice || 99);
            });

            window.currentCheckoutBookList = matchedBooks;
            window.currentCheckoutBook = {
                id: idList.join(","),
                title: `${matchedBooks.length} डिजिटल पुस्तकें बंडल`,
                mrp: totalMrp,
                offerPrice: totalOffer,
                cover: matchedBooks[0]?.cover || "/images/books/kharif-master-guide-2026-cover.webp"
            };

            const coverEl = document.getElementById("bookCover");
            if (coverEl) coverEl.src = window.currentCheckoutBook.cover;
            
            const nameEl = document.getElementById("bookName");
            if (nameEl) nameEl.innerHTML = `${matchedBooks.length} पुस्तकें बंडल <small style="display:block;font-size:0.8rem;color:#16a34a;font-weight:700;">(${matchedBooks.map(b => b.name || b.id).join(" + ")})</small>`;
            
            const mrpEl = document.getElementById("bookMrp");
            if (mrpEl) mrpEl.textContent = "₹" + totalMrp;
            
            const priceEl = document.getElementById("bookPrice");
            if (priceEl) priceEl.textContent = "₹" + totalOffer;

            const sumBook = document.getElementById("summaryBook");
            if (sumBook) sumBook.textContent = `${matchedBooks.length} ई-बुक्स कॉम्बो`;
            
            const sumMrp = document.getElementById("summaryMrp");
            if (sumMrp) sumMrp.textContent = "₹" + totalMrp;
            
            const sumPrice = document.getElementById("summaryPrice");
            if (sumPrice) sumPrice.textContent = "₹" + totalOffer;
            
            const totPrice = document.getElementById("totalPrice");
            if (totPrice) totPrice.textContent = "₹" + totalOffer;

            autoFillUserData();
            return;
        }

        // Single Book Lookup
        let targetId = rawId;
        if (rawId.includes("sub") || rawId === "subscription" || rawId === "pro-subscription") {
            targetId = "SUB001";
        } else if (rawId.includes("kheti") || rawId === "fasal-ka-doctor") {
            targetId = "BK002";
        } else if (rawId.includes("kharif")) {
            targetId = "BK001";
        }

        let book = null;
        if (targetId) {
            book = booksArray.find(item => 
                (item.id && item.id.toLowerCase() === targetId.toLowerCase()) || 
                (item.slug && item.slug.toLowerCase() === targetId.toLowerCase())
            );
        }

        if (!book && booksArray.length > 0 && !customTitle) {
            book = booksArray[0];
        }

        // If not found in JSON but custom params provided, build dynamic product
        if (!book) {
            const isSub = targetId === "SUB001" || (customTitle && customTitle.toLowerCase().includes("vip"));
            const defMrp = customAmount ? (parseInt(customAmount, 10) >= 999 ? 2999 : 299) : (isSub ? 2999 : 299);
            const defPrice = customAmount ? parseInt(customAmount, 10) : (isSub ? 999 : 99);
            const defTitle = customTitle || (isSub ? "👑 Aarogyam Pro VIP Annual Subscription" : "🌾 Aarogyam India ई-बुक मास्टरक्लास");

            book = {
                id: targetId || (isSub ? "SUB001" : "BK001"),
                name: defTitle,
                title: defTitle,
                mrp: defMrp,
                offerPrice: defPrice,
                cover: isSub ? "/images/banners/farmer-community-banner.jpeg" : "/images/books/kharif-master-guide-2026-cover.webp"
            };
        }

        // Override with explicit URL custom params if provided
        if (customTitle) book.name = customTitle;
        if (customAmount) book.offerPrice = parseInt(customAmount, 10);

        const bookCover = book.cover || book.thumbnail || book.cover_image || "/images/banners/farmer-community-banner.jpeg";
        const bookName = book.name || book.title || "Aarogyam India Digital Product";
        const bookMrp = book.mrp || (book.offerPrice ? book.offerPrice * 2 : 299);
        const bookOffer = book.offerPrice || book.offer_price || 99;

        window.currentCheckoutBookList = [book];
        window.currentCheckoutBook = {
            id: book.id || targetId || "BK001",
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

                    // Save purchase records for ALL books in bundle
                    try {
                        const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
                        const myPurchasedIds = JSON.parse(localStorage.getItem('my_purchased_book_ids') || '[]');
                        const booksToUnlock = (window.currentCheckoutBookList && window.currentCheckoutBookList.length > 0) 
                            ? window.currentCheckoutBookList 
                            : [{ id: bookIdToBuy, name: bookTitle, offerPrice: bookPrice }];

                        const db = window.dbClient || window.supabase;
                        const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');

                        for (const b of booksToUnlock) {
                            const bId = b.id || bookIdToBuy;
                            const bAmt = b.offerPrice || (bookPrice / booksToUnlock.length);

                            const newPurchase = {
                                book_id: bId,
                                title: b.name || b.title || bookTitle,
                                amount: bAmt,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id || ('ORD_' + Date.now()),
                                created_at: new Date().toISOString()
                            };
                            localPurchases.push(newPurchase);
                            if (!myPurchasedIds.includes(bId)) myPurchasedIds.push(bId);

                            if (db) {
                                await db.from('purchases').insert([{
                                    profile_id: activeUserId || userObj.id,
                                    book_id: bId,
                                    amount: bAmt,
                                    payment_id: response.razorpay_payment_id,
                                    status: 'completed'
                                }]);
                            }
                        }

                        localStorage.setItem('AI_PURCHASES', JSON.stringify(localPurchases));
                        localStorage.setItem('purchases', JSON.stringify(localPurchases));
                        localStorage.setItem('my_purchased_book_ids', JSON.stringify(myPurchasedIds));
                        localStorage.removeItem('AI_CART_ITEMS');

                        // Activate Membership in local session
                        const isSub = (bookIdToBuy.includes('SUB') || bookPrice >= 999);
                        userObj.is_active = true;
                        if (isSub) userObj.is_subscriber = true;
                        localStorage.setItem('AI_USER', JSON.stringify(userObj));
                        localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
                        localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
                        localStorage.setItem('user_is_active', 'true');
                        if (isSub) localStorage.setItem('user_is_subscriber', 'true');

                        if (db && (activeUserId || userObj.id)) {
                            await db.from('profiles').update({
                                is_active: true,
                                is_subscriber: isSub ? true : userObj.is_subscriber
                            }).eq('id', activeUserId || userObj.id);
                        }
                    } catch (saveErr) {
                        console.warn('Local purchase save note:', saveErr);
                    }

                    window.location.href = `/ebooks/payment-success.html?payment_id=${response.razorpay_payment_id}&book_id=${bookIdToBuy}&amount=${bookPrice}`;
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