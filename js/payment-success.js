/* =================================================================
   AAROGYAM INDIA - PREMIUM PAYMENT SUCCESS EXPERIENCE (V1)
================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    runSuccessAnimation();
});

async function runSuccessAnimation() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    let redirectTimeout;

    try {
        // --- Step 1: Show "Payment Successful" ---
        step1.style.display = 'block';

        // --- Fetch Data in Background ---
        const params = new URLSearchParams(window.location.search);
        const bookId = params.get("id") || localStorage.getItem("last_purchased_book_id") || "BK001";
        const bookData = await getBookData(bookId);

        await new Promise(resolve => setTimeout(resolve, 1200)); // Wait for initial message

        // --- Step 2: Prepare and Show Unlock Animation ---
        step1.style.display = 'none';
        step2.style.display = 'block';
        
        const mainBookCover = document.getElementById('mainBookCover');
        mainBookCover.src = bookData.cover;

        // Inject demo images
        const bookWrapper = document.querySelector('.book-unlock-wrapper');
        bookData.previews.slice(0, 5).forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.className = `demo-image pos-${index + 1}`;
            bookWrapper.appendChild(img);
        });

        // Trigger animations
        step2.classList.add('animate');

        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait for animations to complete

        // --- Step 3: Show Final Content ---
        step2.style.display = 'none';
        step3.style.display = 'block';

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

        // Start redirect timer
        let timeLeft = 8;
        const timerDisplay = document.getElementById('redirectTimer');
        timerDisplay.textContent = `Redirecting to My Library in ${timeLeft}...`;

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

    if (!book) throw new Error(`Book with ID ${bookId} not found.`);

    // Prepare a structured object for the UI
    return {
        id: book.id,
        cover: book.cover || "/images/books/default-cover.webp",
        previews: book.demoImages || []
    };
}