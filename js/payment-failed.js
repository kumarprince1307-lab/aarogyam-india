/*=========================================
AAROGYAM INDIA
PAYMENT FAILED JS (Final Clean Version)
=========================================*/

document.addEventListener("DOMContentLoaded", loadFailedPage);

async function loadFailedPage() {
    try {
        const params = new URLSearchParams(window.location.search);

        const bookId = params.get("book_id") || params.get("id") || "BK001";
        const amount = params.get("amount") || "0";
        const orderId = params.get("order") || params.get("payment_id") || "Not Available";

        let bookTitle = "Aarogyam E-Book";

        // Load Book Data from JSON
        try {
            const response = await fetch("../data/books.json");
            const data = await response.json();
            const booksArray = Array.isArray(data) ? data : (data.books || []);
            
            const book = booksArray.find(item => item.id === bookId || item.book_id === bookId);

            if (book) {
                bookTitle = book.name || book.title || bookTitle;
            }
        } catch (e) {
            console.warn("Could not fetch books.json, using fallback title");
        }

        // UI में वैल्यू सेट करना
        const bookNameEl = document.getElementById("bookName");
        if (bookNameEl) bookNameEl.textContent = bookTitle;

        const amountEl = document.getElementById("amount");
        if (amountEl) amountEl.textContent = "₹" + amount;

        const orderIdEl = document.getElementById("orderId");
        if (orderIdEl) orderIdEl.textContent = orderId;

        // WhatsApp सपोर्ट लिंक सेटअप करना (बिना आईडी के, सिर्फ साफ नाम के साथ)
        setupWhatsAppSupport(bookTitle);

        // नेविगेशन बटन (Retry और Back to Store) सेटअप करना
        setupNavigationButtons(bookId, amount);

    } catch(error) {
        console.error("Payment Failed Page Error:", error);
    }
}

/*=========================================
DYNAMIC WHATSAPP SUPPORT (7974422572)
=========================================*/
function setupWhatsAppSupport(bookTitle) {
    const whatsappBtn = document.getElementById("whatsappSupportBtn") || document.querySelector(".whatsapp-btn");
    
    let userName = "ग्राहक";
    try {
        const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        userName = storedUser.full_name || storedUser.name || "ग्राहक";
    } catch(e) {}

    const phone = "917974422572";
    const message = `नमस्ते आरोग्यम इंडिया, मेरा नाम ${userName} है। मैं "${bookTitle}" बुक खरीदना चाहता था, लेकिन मेरा पेमेंट फेल हो गया है। कृपया इस ऑर्डर को पूरा करने में मेरी मदद करें।`;

    if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
}

/* =========================================
   NAVIGATION BUTTONS (Absolute Safe Back Redirect)
========================================= */
function setupNavigationButtons(bookId, amount) {
    // Retry Button -> सही book_id के साथ checkout.html पर जाएं
    const retryBtn = document.getElementById("retryBtn") || document.querySelector(".retry-btn");
    if (retryBtn) {
        retryBtn.addEventListener("click", function(e) {
            e.preventDefault();
            window.location.href = `checkout.html?book_id=${bookId}&amount=${amount}`;
        });
    }

    // Back To Store -> यूजर जिस भी पिछले पेज या बुक से आया था, वहीं वापस भेजना
    const backBtn = document.getElementById("backStoreBtn") || document.querySelector(".back-btn");
    if (backBtn) {
        backBtn.addEventListener("click", function(e) {
            e.preventDefault();
            
            let targetPage = sessionStorage.getItem("AI_PREV_STORE_PAGE");
            
            // यदि सेशन में पिछला पेज नहीं है या वह खुद चेकआउट/फेल पेज है, तो पिछले ब्राउज़र हिस्ट्री या fallback का इस्तेमाल करें
            if (!targetPage || targetPage.includes("payment-failed.html") || targetPage.includes("checkout.html")) {
                if (document.referrer && !document.referrer.includes("payment-failed.html") && !document.referrer.includes("checkout.html")) {
                    targetPage = document.referrer;
                } else {
                    targetPage = "ebook.html"; // फाइनल फॉलबैक
                }
            }

            window.location.href = targetPage;
        });
    }
}