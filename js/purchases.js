/* =================================================================
    AAROGYAM INDIA - PURCHASES & INVOICES JS (FINAL ROBUST FIX)
================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    fetchUserPurchases();
    initInvoiceModalClose();
});

// --- SAFE SESSION & DB HELPER ---
const getPurchasesClient = () => {
    return typeof supabaseClient !== 'undefined' ? supabaseClient : (typeof db !== 'undefined' ? db : null);
};

const getPurchasesCurrentUser = () => {
    try {
        // 1. सबसे पहले direct AI_USER चेक करें जो supabase.js सेव करता है
        const aiUser = localStorage.getItem("AI_USER");
        if (aiUser) {
            const parsedUser = JSON.parse(aiUser);
            if (parsedUser && parsedUser.id) {
                return parsedUser;
            }
        }

        if (typeof V1_SESSION !== "undefined" && typeof V1_SESSION.getCurrentUser === "function") {
            const u = V1_SESSION.getCurrentUser();
            if (u) return u;
        }
        if (window.V1_SESSION && typeof window.V1_SESSION.getCurrentUser === "function") {
            const u = window.V1_SESSION.getCurrentUser();
            if (u) return u;
        }

        // Fallback from localStorage
        const rawData = localStorage.getItem("supabase.auth.token") || localStorage.getItem("current_user");
        if (rawData) {
            const parsed = JSON.parse(rawData);
            return parsed.currentSession?.user || parsed.user || parsed;
        }
    } catch (e) {
        console.warn("Session retrieval warning:", e);
    }

    // 🟢 सुरक्षित फॉलबैक (डमी टेक्स्ट "avinish_user_123" को पूरी तरह हटा दिया गया है)
    return {
        id: localStorage.getItem("user_id") || localStorage.getItem("profile_id") || null,
        full_name: localStorage.getItem("user_name") || "Valued Customer",
        mobile: localStorage.getItem("user_mobile") || null
    };
};

async function fetchUserPurchases() {
    const purchasesList = document.getElementById('purchasesList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');

    if (!purchasesList || !loadingState || !emptyState) {
        return; 
    }

    try {
        const user = getPurchasesCurrentUser();
        if (!user || !user.id) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        // 1. Fetch all book data from JSON safely
        let booksMap = new Map();
        try {
            const booksResponse = await fetch('../data/books.json');
            if (booksResponse.ok) {
                const booksData = await booksResponse.json();
                if (booksData && booksData.books) {
                    booksMap = new Map(booksData.books.map(book => [book.id, book]));
                }
            }
        } catch (err) {
            console.warn("Could not load books.json, proceeding without master data:", err);
        }

        // 2. Fetch purchase records from Supabase using safe client
        const client = getPurchasesClient();
        if (!client) {
            throw new Error("Database client (Supabase) is not initialized.");
        }

        const { data: purchases, error } = await client
            .from('purchases')
            .select('*')
            .eq('profile_id', user.id)
            .order('purchase_date', { ascending: false });

        if (error) throw error;

        // 3. Combine purchase data with book master data
        const enrichedPurchases = (purchases || []).map(purchase => {
            return {
                ...purchase,
                books: booksMap.get(purchase.book_id) || { title: purchase.book_id || 'E-Book' }
            };
        });

        loadingState.style.display = 'none';
        if (!enrichedPurchases || enrichedPurchases.length === 0) {
            emptyState.style.display = 'block';
        } else {
            renderPurchaseCards(enrichedPurchases);
        }

    } catch (err) {
        console.error("Error fetching purchases:", err.message || err);
        loadingState.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const titleEl = emptyState.querySelector('h3');
            const descEl = emptyState.querySelector('p');
            if (titleEl) titleEl.textContent = "Purchase History";
            if (descEl) descEl.textContent = "कोई परचेस रिकॉर्ड नहीं मिला या डेटा लोड करने में समस्या आई।";
        }
    }
}

function renderPurchaseCards(purchases) {
    const purchasesList = document.getElementById('purchasesList');
    if (!purchasesList) return;

    purchasesList.innerHTML = '';

    purchases.forEach(purchase => {
        const card = document.createElement('div');
        card.className = 'purchase-card';

        const bookTitle = purchase.books ? (purchase.books.heading || purchase.books.name || purchase.books.title) : 'E-Book';
        const orderId = purchase.order_id || 'N/A';
        const purchaseDate = purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-GB') : 'N/A';
        const amount = purchase.amount || '0';

        card.innerHTML = `
            <div class="purchase-info">
                <div class="purchase-book-icon">
                    <i class="fa-solid fa-book-open-reader"></i>
                </div>
                <div class="purchase-details">
                    <h3>${bookTitle}</h3>
                    <p>Order ID: ${orderId}</p>
                    <p>Date: ${purchaseDate} | Amount: ₹${amount}</p>
                </div>
            </div>
            <button class="invoice-btn">
                <i class="fa-solid fa-file-invoice"></i> View Invoice
            </button>
        `;

        const invoiceBtn = card.querySelector('.invoice-btn');
        if (invoiceBtn) {
            invoiceBtn.addEventListener('click', () => {
                showInvoiceModal(purchase);
            });
        }

        purchasesList.appendChild(card);
    });
}

function showInvoiceModal(purchase) {
    const modal = document.getElementById('invoiceModal');
    if (!modal) return;

    const user = getPurchasesCurrentUser();
    const bookTitle = purchase.books ? (purchase.books.heading || purchase.books.name || purchase.books.title) : 'E-Book';

    setElementText('modalOrderId', purchase.order_id || 'N/A');
    setElementText('modalPurchaseDate', purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-GB') : 'N/A');
    setElementText('modalUserName', user.full_name || 'Valued Customer');
    setElementText('modalUserMobile', user.mobile || '');
    setElementText('modalBookTitle', bookTitle);
    setElementText('modalAmount', `₹${purchase.amount || 0}`);
    setElementText('modalPaymentId', purchase.payment_id || 'N/A');
    setElementText('modalPaymentStatus', purchase.payment_status || 'Success');

    modal.style.display = 'flex';
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function initInvoiceModalClose() {
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeInvoiceModal();
            }
        });
    }
}

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}