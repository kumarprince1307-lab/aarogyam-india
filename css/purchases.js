/* =================================================================
   AAROGYAM INDIA - PURCHASES & INVOICES JS (V2 - Safe Null Check)
================================================================= */

document.addEventListener("DOMContentLoaded", () => {
    fetchUserPurchases();
    initInvoiceModalClose();
});

async function fetchUserPurchases() {
    const purchasesList = document.getElementById('purchasesList');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');

    if (!purchasesList || !loadingState || !emptyState) {
        return; // Exit safely if elements aren't on this page
    }

    try {
        const user = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
        if (!user || !user.id) {
            loadingState.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        const { data: purchases, error } = await db
            .from('purchases')
            .select(`
                *,
                books (
                    title,
                    cover_image
                )
            `)
            .eq('profile_id', user.id)
            .order('purchase_date', { ascending: false });

        if (error) throw error;

        loadingState.style.display = 'none';
        if (!purchases || purchases.length === 0) {
            emptyState.style.display = 'block';
        } else {
            renderPurchaseCards(purchases);
        }
    } catch (err) {
        console.error("Error fetching purchases:", err.message);
        loadingState.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const titleEl = emptyState.querySelector('h3');
            const descEl = emptyState.querySelector('p');
            if (titleEl) titleEl.textContent = "An Error Occurred";
            if (descEl) descEl.textContent = "Could not load your purchase history. Please try again later.";
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

        const bookTitle = purchase.books ? purchase.books.title : 'E-Book';
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

    const user = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');

    setElementText('modalOrderId', purchase.order_id || 'N/A');
    setElementText('modalPurchaseDate', purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-GB') : 'N/A');
    setElementText('modalUserName', user.full_name || 'Valued Customer');
    setElementText('modalUserMobile', user.mobile || '');
    setElementText('modalBookTitle', purchase.books ? purchase.books.title : 'E-Book');
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
