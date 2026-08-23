/* ==========================================
   AAROGYAM INDIA - PAYMENT SUCCESS JS V2
   (URL Params + LocalStorage + 6 Sec Timer)
========================================== */

"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    await loadSuccessPage();
    startRedirectTimer(6); // 6 सेकंड का ऑटोमैटिक टाइमर
});

async function loadSuccessPage() {
    try {
        // 1. URL Parameters से डेटा चेक करें
        const params = new URLSearchParams(window.location.search);
        let bookId = params.get("id") || params.get("bookId");
        let amount = params.get("amount");
        let orderId = params.get("order") || params.get("orderId");

        // 2. अगर URL में नहीं है, तो LocalStorage (AI_CURRENT_ORDER) से उठाएं
        const storedOrder = JSON.parse(localStorage.getItem("AI_CURRENT_ORDER") || "{}");
        const currentUser = JSON.parse(localStorage.getItem("AI_USER") || localStorage.getItem("AI_PROFILE") || "{}");

        bookId = bookId || storedOrder.bookId || "BK001";
        amount = amount || storedOrder.amount || storedOrder.offerPrice || "99";
        orderId = orderId || storedOrder.orderId || storedOrder.paymentId || ("TXN_" + Math.floor(100000000 + Math.random() * 900000000));

        // 3. Books JSON से बुक का नाम लोड करें
        let bookName = "Aarogyam Digital eBook";
        try {
            const response = await fetch("../data/books.json");
            const data = await response.json();
            const booksList = data.books || data;
            const book = booksList.find(item => item.book_id === bookId || item.id === bookId);
            if (book) {
                bookName = book.title || book.name;
            }
        } catch (fetchErr) {
            console.warn("Could not fetch books.json, using fallback name:", fetchErr);
        }

        // 4. पेज के एलिमेंट्स में वैल्यू अपडेट करना
        document.getElementById("bookName").textContent = bookName;
        document.getElementById("amountPaid").textContent = "₹" + amount;
        document.getElementById("orderId").textContent = orderId;

        // यूजर का नाम वेलकम मैसेज में दिखाना
        const welcomeMsgEl = document.getElementById("welcomeUserMsg");
        if (welcomeMsgEl && (currentUser.full_name || currentUser.name)) {
            const userName = currentUser.full_name || currentUser.name;
            welcomeMsgEl.innerHTML = `📌 बधाई हो, ${userName} जी! आपका पेमेंट सफल रहा।`;
        }

        // 5. Save Purchase Record and Activate User
        try {
            const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
            const exists = localPurchases.some(p => p.book_id === bookId || p.order_id === orderId);
            if (!exists) {
                localPurchases.push({
                    book_id: bookId,
                    title: bookName,
                    amount: amount,
                    order_id: orderId,
                    created_at: new Date().toISOString()
                });
                localStorage.setItem('AI_PURCHASES', JSON.stringify(localPurchases));
                localStorage.setItem('purchases', JSON.stringify(localPurchases));
            }

            const isSub = (bookId === 'SUB001' || parseInt(amount, 10) >= 999);
            const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
            userObj.is_active = true;
            if (isSub) userObj.is_subscriber = true;
            localStorage.setItem('AI_USER', JSON.stringify(userObj));
            localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
            localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
            localStorage.setItem('user_is_active', 'true');
            if (isSub) localStorage.setItem('user_is_subscriber', 'true');
        } catch (e) {}

        // 6. फेसबुक पिक्सेल को सही डेटा भेजने के लिए (Purchase Event)
        if (typeof fbq === 'function') {
            fbq('track', 'Purchase', {
                value: parseFloat(amount),
                currency: 'INR',
                content_ids: [bookId],
                content_type: 'product',
                order_id: orderId
            });
        }

    } catch (error) {
        console.error("Success Page Load Error:", error);
    }
}

/* ==========================================
   6 SECONDS AUTOMATIC REDIRECT TIMER
========================================================== */
function startRedirectTimer(durationInSeconds) {
    let timeLeft = durationInSeconds;
    const timerDisplay = document.getElementById("timerDisplay");

    if (!timerDisplay) return;

    const countdownInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft > 0) {
            timerDisplay.innerHTML = `⏳ आपको ${timeLeft} सेकंड में ऑटोमैटिकली लाइब्रेरी में भेजा जा रहा है...`;
        } else {
            clearInterval(countdownInterval);
            timerDisplay.innerHTML = `🚀 आपको अब लाइब्रेरी पर भेजा जा रहा है...`;
            
            setTimeout(() => {
                window.location.href = "my-library.html";
            }, 1000);
        }
    }, 1000);
}

/* ==========================================
   BUTTON CLICK HANDLERS
========================================================== */
const libraryBtn = document.querySelector(".library-btn");
if (libraryBtn) {
    libraryBtn.addEventListener("click", () => {
        console.log("Opening My Library");
    });
}

const shoppingBtn = document.querySelector(".shopping-btn");
if (shoppingBtn) {
    shoppingBtn.addEventListener("click", () => {
        console.log("Continue Shopping");
    });
}