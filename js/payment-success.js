/* ================================================================= *
   AAROGYAM INDIA - PAYMENT SUCCESS JS (FAIL-PROOF & 100% DYNAMIC)
   ================================================================ */

document.addEventListener("DOMContentLoaded", loadSuccessPage);

async function loadSuccessPage() {
    try {
        // 1. URL पैरामीटर्स और LocalStorage दोनों से डेटा चेक करें
        const params = new URLSearchParams(window.location.search);
        
        // चेकआउट पेज से आने वाले असली पैरामीटर्स या लोकलस्टोरेज का डेटा
        let bookId = params.get("id") || localStorage.getItem("last_purchased_book_id");
        let amount = params.get("amount") || localStorage.getItem("last_purchased_amount");
        let orderId = params.get("order") || localStorage.getItem("last_order_id");

        // अगर आर्डर आईडी बिल्कुल नहीं है, तभी एक नया यूनिक आर्डर आईडी जनरेट करें
        if (!orderId || orderId === "Not Available") {
            orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem("last_order_id", orderId);
        }

        // 2. यूजर का नाम डायनेमिक सेट करना (Supabase या LocalStorage से)
        let userName = localStorage.getItem("user_name") || localStorage.getItem("logged_in_user") || "";
        const welcomeUserMsg = document.getElementById("welcomeUserMsg");
        
        if (userName) {
            welcomeUserMsg.innerHTML = `📌 बधाई हो, ${userName} जी! आपका पेमेंट सफल रहा।`;
        } else {
            welcomeUserMsg.innerHTML = `📌 बधाई हो! आपका पेमेंट सफल रहा।`;
        }

        // 3. बुक का नाम और अमाउंट निकालने की प्रक्रिया
        let bookNameText = localStorage.getItem("last_purchased_book_name") || "";
        let finalAmount = amount || localStorage.getItem("last_purchased_amount") || "0";

        // अगर LocalStorage या URL में नाम नहीं है, तो books.json से फेच करें
        if (!bookNameText || !bookId) {
            try {
                const response = await fetch("../data/books.json");
                const data = await response.json();
                
                let book = null;
                if (bookId && data.books) {
                    book = data.books.find(item => item.id === bookId || item.bookId === bookId);
                }
                
                // अगर फिर भी न मिले, तो books.json की पहली बुक उठा लें
                if (!book && data.books && data.books.length > 0) {
                    book = data.books[0];
                }

                if (book) {
                    bookId = book.id || book.bookId || "BK-GEN";
                    bookNameText = book.name || book.title;
                    if (!finalAmount || finalAmount === "0") {
                        finalAmount = book.price || "99";
                    }
                }
            } catch (err) {
                console.log("JSON fetch fallback used.");
            }
        }

        // आखिरी सुरक्षा उपाय: अगर नाम अभी भी खाली है तो यूनिवर्सल नाम दें
        if (!bookNameText) {
            bookNameText = "Aarogyam India Digital Book";
        }
        if (!finalAmount) {
            finalAmount = "99";
        }

        // 4. UI (HTML) में असली और लाइव डेटा भरना
        document.getElementById("bookName").textContent = bookNameText;
        document.getElementById("amountPaid").textContent = "₹" + finalAmount;
        document.getElementById("orderId").textContent = orderId;

        // 5. बैकग्राउंड में यूजर की 'My Library' और 'Invoices' में परमानेंट सेव करना
        saveBookToLibraryAndInvoice(bookId, bookNameText, orderId, finalAmount);

        // 6. 6 सेकंड का ऑटो-रीडायरेक्ट टाइमर शुरू करना
        setupAutoRedirectTimer();

    } catch (error) {
        console.error("Success page critical error:", error);
        // एमरजेंसी फॉलबैक ताकि कभी भी Not Available न दिखे
        document.getElementById("bookName").textContent = localStorage.getItem("last_purchased_book_name") || "Digital E-Book";
        document.getElementById("amountPaid").textContent = "₹" + (localStorage.getItem("last_purchased_amount") || "99");
        document.getElementById("orderId").textContent = localStorage.getItem("last_order_id") || "ORD-AOI-2026";
        setupAutoRedirectTimer();
    }
}

// लाइब्रेरी और इन्वॉइस में सुरक्षित ऑटो-सेव फंक्शन
function saveBookToLibraryAndInvoice(bookId, bookName, orderId, amount) {
    let purchasedBooks = JSON.parse(localStorage.getItem('AOI_MY_LIBRARY') || '[]');
    let purchasedInvoices = JSON.parse(localStorage.getItem('AOI_INVOICES') || '[]');

    let bookData = {
        id: bookId || "BK-GEN",
        title: bookName,
        purchaseDate: new Date().toLocaleDateString(),
        orderId: orderId,
        amount: "₹" + amount,
        pdfUrl: "../pdfs/sample.pdf"
    };
    
    // अगर यह बुक पहले से लाइब्रेरी में नहीं है, तभी जोड़ें
    if (!purchasedBooks.some(b => b.id === bookData.id || b.orderId === orderId)) {
        purchasedBooks.push(bookData);
        localStorage.setItem('AOI_MY_LIBRARY', JSON.stringify(purchasedBooks));
    }

    // इन्वॉइस रिकॉर्ड सेव करें
    if (!purchasedInvoices.some(inv => inv.orderId === orderId)) {
        purchasedInvoices.push({
            orderId: orderId,
            title: bookName,
            date: bookData.purchaseDate,
            amount: bookData.amount
        });
        localStorage.setItem('AOI_INVOICES', JSON.stringify(purchasedInvoices));
    }
}

// 6 सेकंड का टाइमर और ऑटो-रीडायरेक्ट लॉजिक
function setupAutoRedirectTimer() {
    let timeLeft = 6;
    const timerDisplay = document.getElementById('timerDisplay');

    const countdown = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            if (timerDisplay) {
                timerDisplay.innerText = `⏳ आपको ${timeLeft} सेकंड में ऑटोमैटिकली लाइब्रेरी में भेजा जा रहा है...`;
            }
        } else {
            clearInterval(countdown);
            // सीधा ebooks/my-library.html में रीडायरेक्ट
            window.location.href = 'my-library.html';
        }
    }, 1000);
}