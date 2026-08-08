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