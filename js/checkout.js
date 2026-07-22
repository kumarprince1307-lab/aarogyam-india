/*=========================================
AAROGYAM INDIA
CHECKOUT.JS V1
=========================================*/

document.addEventListener("DOMContentLoaded", loadBook);

async function loadBook() {

    try {

        // URL Example:
        // checkout.html?id=BK001

        const params = new URLSearchParams(window.location.search);

        const bookId = params.get("id") || "BK001";

        // Load Master Book Data

        const response = await fetch("../data/books.json");

        const data = await response.json();

        const book = data.books.find(item => item.id === bookId);

        if (!book) {

            alert("Book Not Found");

            return;

        }

        // Book Summary

        document.getElementById("bookCover").src = book.cover;

        document.getElementById("bookName").textContent = book.name;

        document.getElementById("bookMrp").textContent =
            "₹" + book.mrp;

        document.getElementById("bookPrice").textContent =
            "₹" + book.offerPrice;

        // Order Summary

        document.getElementById("summaryBook").textContent =
            book.name;

        document.getElementById("summaryMrp").textContent =
            "₹" + book.mrp;

        document.getElementById("summaryPrice").textContent =
            "₹" + book.offerPrice;

        document.getElementById("totalPrice").textContent =
            "₹" + book.offerPrice;

    }

    catch (error) {

        console.error(error);

        alert("Unable to Load Book Data");

    }

}


/*=========================================
PAY NOW
=========================================*/

document.getElementById("payNowBtn").addEventListener("click", function () {

    const name =
        document.getElementById("customerName").value.trim();

    const mobile =
        document.getElementById("customerMobile").value.trim();

    const email =
        document.getElementById("customerEmail").value.trim();

    if (name === "") {

        alert("Please Enter Full Name");

        return;

    }

    if (mobile.length !== 10) {

        alert("Enter Valid Mobile Number");

        return;

    }

    // Temporary

    alert("Razorpay Integration Coming Next");

});
