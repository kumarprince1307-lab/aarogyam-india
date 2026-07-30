/*=========================================
AAROGYAM INDIA
PAYMENT FAILED JS V1
=========================================*/

document.addEventListener("DOMContentLoaded", loadFailedPage);

async function loadFailedPage() {

    try {

        // Example:
        // payment-failed.html?id=BK001&amount=99&order=ORD12345

        const params = new URLSearchParams(window.location.search);

        const bookId = params.get("id") || "BK001";
        const amount = params.get("amount") || "0";
        const orderId = params.get("order") || "Not Available";

        // Load Book Data

        const response = await fetch("../data/books.json");

        const data = await response.json();

        const book = data.books.find(item => item.id === bookId);

        if(book){

            document.getElementById("bookName").textContent =
            book.name;

        }

        document.getElementById("amount").textContent =
        "₹" + amount;

        document.getElementById("orderId").textContent =
        orderId;

    }

    catch(error){

        console.error(error);

    }

}

/*=========================================
RETRY PAYMENT
=========================================*/

const retryBtn = document.querySelector(".retry-btn");

if(retryBtn){

    retryBtn.addEventListener("click",function(e){

        e.preventDefault();

        const params = window.location.search;

        window.location.href =
        "checkout.html" + params;

    });

}

/*=========================================
BACK TO STORE
=========================================*/

const backBtn = document.querySelector(".back-btn");

if(backBtn){

    backBtn.addEventListener("click",function(e){

        e.preventDefault();

        window.location.href =
        "ebook.html";

    });

}