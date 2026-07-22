/*=========================================
AAROGYAM INDIA
PAYMENT SUCCESS JS V1
=========================================*/

document.addEventListener("DOMContentLoaded", loadSuccessPage);

async function loadSuccessPage() {

    try {

        // =========================
        // URL PARAMETERS
        // Example:
        // payment-success.html?id=BK001&amount=99&order=ORD12345
        // =========================

        const params = new URLSearchParams(window.location.search);

        const bookId = params.get("id") || "BK001";

        const amount = params.get("amount") || "0";

        const orderId = params.get("order") || "Not Available";

        // =========================
        // LOAD BOOK DATA
        // =========================

        const response = await fetch("../data/books.json");

        const data = await response.json();

        const book = data.books.find(item => item.id === bookId);

        if (!book) {

            alert("Book Not Found");

            return;

        }

        // =========================
        // UPDATE PAGE
        // =========================

        document.getElementById("bookName").textContent =
            book.name;

        document.getElementById("amountPaid").textContent =
            "₹" + amount;

        document.getElementById("orderId").textContent =
            orderId;

    }

    catch (error) {

        console.error(error);

        alert("Unable To Load Order Details");

    }

}

/*=========================================
GO TO LIBRARY
=========================================*/

const libraryBtn = document.querySelector(".library-btn");

if (libraryBtn) {

    libraryBtn.addEventListener("click", function () {

        console.log("Opening My Library");

    });

}

/*=========================================
CONTINUE SHOPPING
=========================================*/

const shoppingBtn = document.querySelector(".shopping-btn");

if (shoppingBtn) {

    shoppingBtn.addEventListener("click", function () {

        console.log("Continue Shopping");

    });

}
