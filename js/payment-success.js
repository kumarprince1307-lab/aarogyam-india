/* ================================================================= *
   AAROGYAM INDIA - PAYMENT SUCCESS JS (FAIL-PROOF & 100% DYNAMIC)
   ================================================================ */
/* =================================================================
   AAROGYAM INDIA - PREMIUM PAYMENT SUCCESS EXPERIENCE (V1)
================================================================= */

document.addEventListener("DOMContentLoaded", loadSuccessPage);
document.addEventListener("DOMContentLoaded", () => {
    runSuccessAnimation();
});

async function loadSuccessPage() {
async function runSuccessAnimation() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    let redirectTimeout;

    try {
        // 1. URL पैरामीटर्स और LocalStorage दोनों से डेटा चेक करें
        // --- Step 1: Show "Payment Successful" ---
        step1.style.display = 'block';

        // --- Fetch Data in Background ---
        const params = new URLSearchParams(window.location.search);
        
        // चेकआउट पेज से आने वाले असली पैरामीटर्स या लोकलस्टोरेज का डेटा
        let bookId = params.get("id") || localStorage.getItem("last_purchased_book_id");
        let amount = params.get("amount") || localStorage.getItem("last_purchased_amount");
        let orderId = params.get("order") || localStorage.getItem("last_order_id");
        const bookId = params.get("id") || localStorage.getItem("last_purchased_book_id") || "BK001";
        const bookData = await getBookData(bookId);

        // अगर आर्डर आईडी बिल्कुल नहीं है, तभी एक नया यूनिक आर्डर आईडी जनरेट करें
        if (!orderId || orderId === "Not Available") {
            orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
            localStorage.setItem("last_order_id", orderId);
        }
        await new Promise(resolve => setTimeout(resolve, 1200)); // Wait for initial message

        // 2. यूजर का नाम डायनेमिक सेट करना (Supabase या LocalStorage से)
        let userName = localStorage.getItem("user_name") || localStorage.getItem("logged_in_user") || "";
        const welcomeUserMsg = document.getElementById("welcomeUserMsg");
        // --- Step 2: Prepare and Show Unlock Animation ---
        step1.style.display = 'none';
        step2.style.display = 'block';
        
        if (userName) {
            welcomeUserMsg.innerHTML = `📌 बधाई हो, ${userName} जी! आपका पेमेंट सफल रहा।`;
        } else {
            welcomeUserMsg.innerHTML = `📌 बधाई हो! आपका पेमेंट सफल रहा।`;
        }
        const mainBookCover = document.getElementById('mainBookCover');
        mainBookCover.src = bookData.cover;

        // 3. बुक का नाम और अमाउंट निकालने की प्रक्रिया
        let bookNameText = localStorage.getItem("last_purchased_book_name") || "";
        let finalAmount = amount || localStorage.getItem("last_purchased_amount") || "0";
        // Inject demo images
        const bookWrapper = document.querySelector('.book-unlock-wrapper');
        bookData.previews.slice(0, 5).forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = `demo-image pos-${index + 1}`;
            bookWrapper.appendChild(img);
        });

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
        // Trigger animations
        step2.classList.add('animate');

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
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for animations to complete

        // आखिरी सुरक्षा उपाय: अगर नाम अभी भी खाली है तो यूनिवर्सल नाम दें
        if (!bookNameText) {
            bookNameText = "Aarogyam India Digital Book";
        }
        if (!finalAmount) {
            finalAmount = "99";
        }
        // --- Step 3: Show Final Content ---
        step2.style.display = 'none';
        step3.style.display = 'block';

        // 4. UI (HTML) में असली और लाइव डेटा भरना
        document.getElementById("bookName").textContent = bookNameText;
        document.getElementById("amountPaid").textContent = "₹" + finalAmount;
        document.getElementById("orderId").textContent = orderId;
        // Setup buttons
        document.getElementById('readNowBtn').onclick = () => {
            clearTimeout(redirectTimeout);
            window.location.href = `reader.html?book=${bookId}`;
        };
        document.getElementById('downloadBtn').onclick = () => {
            clearTimeout(redirectTimeout);
            window.location.href = `download.html?book=${bookId}`;
        };
        document.getElementById('libraryBtn').onclick = () => {
            clearTimeout(redirectTimeout);
        };

        // 5. बैकग्राउंड में यूजर की 'My Library' और 'Invoices' में परमानेंट सेव करना
        saveBookToLibraryAndInvoice(bookId, bookNameText, orderId, finalAmount);
        // Start redirect timer
        let timeLeft = 8;
        const timerDisplay = document.getElementById('redirectTimer');
        timerDisplay.textContent = `Redirecting to My Library in ${timeLeft}...`;

        // 6. 6 सेकंड का ऑटो-रीडायरेक्ट टाइमर शुरू करना
        setupAutoRedirectTimer();
        const countdown = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                timerDisplay.textContent = `Redirecting to My Library in ${timeLeft}...`;
            } else {
                clearInterval(countdown);
                window.location.href = 'my-library.html';
            }
        }, 1000);

        redirectTimeout = setTimeout(() => {
            clearInterval(countdown);
        }, timeLeft * 1000 + 500);

    } catch (error) {
        console.error("Success page critical error:", error);
        // एमरजेंसी फॉलबैक ताकि कभी भी Not Available न दिखे
        document.getElementById("bookName").textContent = localStorage.getItem("last_purchased_book_name") || "Digital E-Book";
        document.getElementById("amountPaid").textContent = "₹" + (localStorage.getItem("last_purchased_amount") || "99");
        document.getElementById("orderId").textContent = localStorage.getItem("last_order_id") || "ORD-AOI-2026";
        setupAutoRedirectTimer();
        // Fallback to a simple success message if animations or data fetching fail
        step1.style.display = 'block';
        step2.style.display = 'none';
        step3.style.display = 'none';
        document.querySelector('.success-container').innerHTML = `
            <h1>✅ Payment Successful</h1>
            <p>Your book has been added to your library.</p>
            <a href="my-library.html" class="btn btn-primary" style="margin-top: 20px;">Go To My Library</a>
        `;
    }
}

// लाइब्रेरी और इन्वॉइस में सुरक्षित ऑटो-सेव फंक्शन
function saveBookToLibraryAndInvoice(bookId, bookName, orderId, amount) {
    let purchasedBooks = JSON.parse(localStorage.getItem('AOI_MY_LIBRARY') || '[]');
    let purchasedInvoices = JSON.parse(localStorage.getItem('AOI_INVOICES') || '[]');
/**
 * Fetches the master book list and finds the specific book by its ID.
 * @param {string} bookId The ID of the book to find.
 * @returns {object} The book data object.
 */
async function getBookData(bookId) {
    const response = await fetch("../data/books.json");
    if (!response.ok) throw new Error("Could not load book data.");
    const data = await response.json();
    const book = data.books.find(b => b.id === bookId);

    let bookData = {
        id: bookId || "BK-GEN",
        title: bookName,
        purchaseDate: new Date().toLocaleDateString(),
        orderId: orderId,
        amount: "₹" + amount,
        pdfUrl: "../pdfs/sample.pdf"
    if (!book) throw new Error(`Book with ID ${bookId} not found.`);

    // Prepare a structured object for the UI
    return {
        id: book.id,
        cover: book.cover || "/images/books/default-cover.webp",
        previews: book.demoImages || []
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