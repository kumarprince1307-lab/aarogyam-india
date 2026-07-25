/* ==========================================
   AAROGYAM INDIA
   CHECKOUT.JS (Complete & Clean)
========================================= */

document.addEventListener("DOMContentLoaded", loadBook);

async function loadBook() {
    try {
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id") || "BK001";

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
        document.getElementById("bookCover").src = bookCover;
        document.getElementById("bookName").textContent = bookName;
        document.getElementById("bookMrp").textContent = "₹" + bookMrp;
        document.getElementById("bookPrice").textContent = "₹" + bookOffer;

        document.getElementById("summaryBook").textContent = bookName;
        document.getElementById("summaryMrp").textContent = "₹" + bookMrp;
        document.getElementById("summaryPrice").textContent = "₹" + bookOffer;
        document.getElementById("totalPrice").textContent = "₹" + bookOffer;

        autoFillUserData();

    } catch (error) {
        console.error("Book Load Error:", error);
        alert("Unable to Load Book Data");
    }
}

function autoFillUserData() {
    if (typeof getCurrentUser === "function") {
        const user = getCurrentUser();
        if (user) {
            if (user.full_name) document.getElementById("customerName").value = user.full_name;
            if (user.mobile) document.getElementById("customerMobile").value = user.mobile;
            if (user.email) document.getElementById("customerEmail").value = user.email;
        }
    }
}

// Pay Now Button Logic
document.getElementById("payNowBtn").addEventListener("click", async function () {
    const name = document.getElementById("customerName").value.trim();
    const mobile = document.getElementById("customerMobile").value.trim();
    const email = document.getElementById("customerEmail").value.trim();

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
        if (typeof registerUser === "function") {
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
        }

        const orderData = {
            bookId: window.currentCheckoutBook ? window.currentCheckoutBook.id : "BK001",
            title: window.currentCheckoutBook ? window.currentCheckoutBook.title : document.getElementById("bookName").textContent,
            amount: window.currentCheckoutBook ? window.currentCheckoutBook.offerPrice : 99,
            customerName: name,
            mobile: mobile,
            email: email
        };

        window.currentOrder = orderData;
        localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(orderData));

        if (typeof startPayment === "function") {
            const res = startPayment();
            if (res && !res.success) {
                alert(res.message || "Payment initialization failed.");
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
            }
        } else {
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