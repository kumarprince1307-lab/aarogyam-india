/* ==========================================
   AAROGYAM INDIA
   CHECKOUT.JS (Complete & Clean - Updated)
========================================= */

document.addEventListener("DOMContentLoaded", loadBook);

async function loadBook() {
    try {
        const params = new URLSearchParams(window.location.search);
        // Universal book_id or id support
        const bookId = params.get("book_id") || params.get("id") || "BK001";

        // Load Master Book Data from books.json
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

        // Save globally
        window.currentCheckoutBook = {
            id: book.id || book.book_id,
            title: bookName,
            mrp: bookMrp,
            offerPrice: bookOffer,
            cover: bookCover
        };

        // UI Binding
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
    // 1. Check direct LocalStorage first (AI_USER or AI_PROFILE)
    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const nameVal = storedUser.full_name || storedUser.name || "";
    const mobileVal = storedUser.mobile || "";
    const emailVal = storedUser.email || "";

    if (nameVal && document.getElementById("customerName")) {
        document.getElementById("customerName").value = nameVal;
    }
    if (mobileVal && document.getElementById("customerMobile")) {
        document.getElementById("customerMobile").value = mobileVal;
    }
    if (emailVal && document.getElementById("customerEmail")) {
        document.getElementById("customerEmail").value = emailVal;
    }

    // 2. Fallback to getCurrentUser function if available
    if (typeof getCurrentUser === "function") {
        const user = getCurrentUser();
        if (user) {
            if (user.full_name && document.getElementById("customerName")) document.getElementById("customerName").value = user.full_name;
            if (user.mobile && document.getElementById("customerMobile")) document.getElementById("customerMobile").value = user.mobile;
            if (user.email && document.getElementById("customerEmail")) document.getElementById("customerEmail").value = user.email;
        }
    }
}

// Pay Now Button Logic
document.getElementById("payNowBtn").addEventListener("click", async function () {
    const name = document.getElementById("customerName").value.trim();
    const mobile = document.getElementById("customerMobile").value.trim();
    const email = document.getElementById("customerEmail").value.trim();

    if (name === "" || mobile.length !== 10) {
        alert("Please enter a valid name and 10-digit mobile number.");
        return;
    }

    const payBtn = document.getElementById("payNowBtn");
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    try {
        const regResult = await registerUser({
            fullName: name,
            mobile: mobile,
            email: email,
            source: "checkout"
        });

        if (!regResult.success) {
            alert(regResult.message || "User registration failed.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
            return;
        }

        const user = getCurrentUser();
        if (!user) {
            alert("Could not retrieve user details after registration. Please try again.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
            return;
        }

        const orderData = {
            bookId: window.currentCheckoutBook.id,
            title: window.currentCheckoutBook.title,
            amount: window.currentCheckoutBook.offerPrice
        };

        const paymentResult = startPayment(orderData, user);

        if (!paymentResult.success) {
            alert(paymentResult.message || "Failed to initialize payment.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }

    } catch (error) {
        console.error("Payment Error:", error);
        alert("An unexpected error occurred. Please try again.");
        payBtn.disabled = false;
        payBtn.textContent = "Pay Now";
    }
});

// Extra Window focus/blur listener ताकि Razorpay पॉपअप कटने या कैंसिल होने पर 'Processing' हट जाए
window.addEventListener('focus', function() {
    const payBtn = document.getElementById("payNowBtn");
    if (payBtn && payBtn.textContent === "Processing...") {
        // यदि यूजर ने पेमेंट विंडो बंद कर दी है, तो बटन तुरंत सामान्य हो जाएगा
        setTimeout(() => {
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }, 1000);
    }
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('PWA Service Worker Active'))
      .catch(err => console.log('PWA Error:', err));
  });
}