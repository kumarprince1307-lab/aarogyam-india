/* Admin User Details Page */

import { initAdminLayout } from './admin-main.js';
import { fetchUserDetails, updateUserStatus, fetchAvailableBooks, addManualPurchase, deletePurchase } from './admin-api.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderShareInformation() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Share Information</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Share ID</h4><p>N/A</p></div>
        <div class="admin-data-card"><h4>Total Shares</h4><p>0</p></div>
        <div class="admin-data-card"><h4>Total Clicks</h4><p>0</p></div>
      </div>
    </div>
  `;
}

function renderReferralInformation(detail) {
  const referrals = detail.directReferrals;
  const directReferralCount = referrals ? referrals.length : 0;

  const referredByName = detail.referredBy
    ? `<a href="#user-details?id=${detail.referredBy.id}" data-route="user-details" data-id="${detail.referredBy.id}" class="admin-subtle-link">${detail.referredBy.full_name}</a>`
    : 'N/A';

  let referralsTableHtml;
  if (!referrals || referrals.length === 0) {
    referralsTableHtml = '<div class="admin-empty"><strong>No direct referrals found for this user.</strong></div>';
  } else {
    referralsTableHtml = `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead><tr><th>Name</th><th>Mobile</th><th>Total Purchases</th></tr></thead>
          <tbody>
            ${referrals.map(ref => `
              <tr>
                <td><a href="#user-details?id=${ref.id}" data-route="user-details" data-id="${ref.id}" class="admin-subtle-link">${ref.name || 'N/A'}</a></td>
                <td>${ref.mobile || 'N/A'}</td>
                <td>${ref.totalPurchases || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  }
  
  return `
    <div class="admin-section">
      <div class="admin-section-title">Referral Information</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Referred By</h4><p>${referredByName}</p></div>
        <div class="admin-data-card"><h4>Direct Referrals</h4><p>${directReferralCount}</p></div>
        <div class="admin-data-card"><h4>Total Network</h4><p>${directReferralCount}</p></div>
      </div>
      <div class="admin-section-title" style="margin-top: 24px; margin-bottom: 16px;">Direct Referrals List</div>
      ${referralsTableHtml}
    </div>
  `;
}

function renderSharePerformance() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Share Performance</div>
      <div class="admin-empty"><strong>No Data Available</strong></div>
    </div>
  `;
}

function renderLeadInformation() {
  return `
    <div class="admin-section">
      <div class="admin-section-title">Lead Information</div>
      <div class="admin-empty"><strong>No Data Available</strong></div>
    </div>
  `;
}

function renderPermissions() {
    const permissions = [
        'Books', 'Library', 'Reports', 'Share', 'Downloads',
        'Products', 'Agriculture', 'Disease', 'Webinar', 'Business', 'Admin Access'
    ];
    return `
    <div class="admin-section">
      <div class="admin-section-title">Permissions</div>
      <div class="admin-data-grid">
        ${permissions.map(p => `<div class="admin-data-card"><h4>${p}</h4><p>N/A</p></div>`).join('')}
      </div>
    </div>
  `;
}

function renderProfile(detail) {
  if (!detail) return '<div class="admin-empty"><strong>User not found.</strong></div>';

  return `
    <div class="admin-section">
      <div class="admin-section-title">Profile</div>
      <div class="admin-data-grid">
        <div class="admin-data-card"><h4>Name</h4><p>${detail.name}</p></div>
        <div class="admin-data-card"><h4>Mobile</h4><p>${detail.mobile}</p></div>
        <div class="admin-data-card"><h4>Email</h4><p>${detail.email || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>Source</h4><p>${detail.source || 'N/A'}</p></div>
        <div class="admin-data-card">
          <h4>Status</h4>
          <div style="margin-top: 6px;">
            <button 
              class="admin-button small-button admin-status-toggle ${detail.status.toLowerCase()}"
              data-user-id="${detail.id}"
              data-current-status="${detail.status.toLowerCase()}"
              title="Click to toggle status"
            >
              ${detail.status}
            </button>
          </div>
        </div>
        <div class="admin-data-card"><h4>Joined Date</h4><p>${detail.joinedDate || detail.joined || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>Joined Time</h4><p>${detail.joinedTime || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>Referral Token</h4><p>${detail.referralToken || 'N/A'}</p></div>
        <div class="admin-data-card"><h4>कुल डाउनलोड</h4><p>${detail.totalDownloads || 0}</p></div>
        <div class="admin-data-card"><h4>डाउनलोड उपयोग (Used/Limit)</h4><p>${detail.totalDownloads || 0} / ${detail.downloadLimit || 0}</p></div>
      </div>
    </div>
    ${renderShareInformation()}
    ${renderReferralInformation(detail)}
    <div class="admin-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px;">
        <div class="admin-section-title" style="margin-bottom: 0;">Purchase Summary</div>
        <button id="btn-open-add-purchase" class="admin-button small-button" style="display: inline-flex; align-items: center; gap: 6px;">
          <span style="font-size: 1.1rem; font-weight: bold; line-height: 1;">+</span> Add Purchase
        </button>
      </div>
      ${renderPurchases(detail.purchases)}
    </div>
    <div class="admin-section">
      <div class="admin-section-title">Activity Summary</div>
      ${renderActivity(detail.activity)}
    </div>
    ${renderSharePerformance()}
    ${renderLeadInformation()}
    ${renderPermissions()}
  `;
}

function renderPurchases(purchases) {
  if (!purchases || purchases.length === 0) {
    return '<div class="admin-empty"><strong>No purchases found for this user.</strong></div>';
  }
  return `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Book</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>${purchases.map(p => `<tr>
          <td>${p.order}</td>
          <td>${p.book}</td>
          <td>${p.amount}</td>
          <td><span class="status-pill ${p.status.toLowerCase()}">${p.status}</span></td>
          <td>${p.date}</td>
          <td>
            <button 
              class="admin-button small-button admin-delete-purchase-btn" 
              data-purchase-id="${p.id || p.order}" 
              data-book-name="${p.book}" 
              style="background-color: var(--admin-danger, #ef4444); border-color: #d73737; padding: 6px 12px; font-size: 0.8rem; cursor: pointer;"
              title="Delete Purchase"
            >
              Delete
            </button>
          </td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

function renderActivity(activity) {
  if (!activity || activity.length === 0) {
    return '<div class="admin-empty"><strong>No activity recorded.</strong></div>';
  }
  return `<ul class="admin-activity-list">
    ${activity.map(item => `<li><strong>${item.date}</strong> — ${item.description}</li>`).join('')}
  </ul>`;
}

function renderAddPurchaseModalHtml() {
  return `
    <div id="add-purchase-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); display: none; justify-content: center; align-items: center; z-index: 10000; padding: 16px;">
      <div class="admin-card" style="width: 100%; max-width: 480px; background: var(--admin-surface-2); border: 1px solid var(--admin-border); border-radius: 16px; padding: 24px; box-shadow: var(--admin-shadow); position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--admin-border); padding-bottom: 12px;">
          <h3 style="margin: 0; font-size: 1.25rem; color: var(--admin-text);">Add Purchase</h3>
          <button type="button" id="btn-close-purchase-modal" style="background: transparent; border: none; font-size: 1.5rem; color: var(--admin-muted); cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <form id="manual-purchase-form" style="display: grid; gap: 16px;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Payment ID <span style="color: var(--admin-danger);">*</span></label>
            <input type="text" id="modal-payment-id" class="admin-input" placeholder="e.g. PAY_MANUAL_1001" required style="width: 100%;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Book <span style="color: var(--admin-danger);">*</span></label>
            <select id="modal-book-id" class="admin-select" required style="width: 100%;">
              <option value="">-- Select Book --</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Amount (₹) <span style="color: var(--admin-danger);">*</span></label>
            <input type="number" id="modal-amount" class="admin-input" min="0" step="1" placeholder="e.g. 99" required style="width: 100%;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Status</label>
            <input type="text" id="modal-status" class="admin-input" value="SUCCESS" readonly style="width: 100%; background: rgba(16,185,129,0.1); color: #34d399; font-weight: bold; border-color: rgba(16,185,129,0.3); cursor: not-allowed;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: var(--admin-muted); margin-bottom: 6px;">Purchase Date <span style="color: var(--admin-danger);">*</span></label>
            <input type="date" id="modal-purchase-date" class="admin-input" required style="width: 100%;" />
          </div>
          <div id="modal-form-error" style="display: none; color: var(--admin-danger); font-size: 0.9rem; padding: 8px; background: rgba(239,68,68,0.1); border-radius: 8px;"></div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 12px;">
            <button type="button" id="btn-cancel-purchase-modal" class="admin-button" style="background: var(--admin-surface-strong); border: 1px solid var(--admin-border); color: var(--admin-text);">Cancel</button>
            <button type="submit" id="btn-submit-purchase" class="admin-button" style="background: var(--admin-primary);">Save Purchase</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export async function initUserDetails() {
  initAdminLayout('User Details', 'Inspect an individual customer profile.');

  const content = document.getElementById('page-content');
  if (!content) return;

  // the user id can be provided via hash query or via selection from Users page
  const hash = window.location.hash || '';
  const queryString = hash.substring(hash.indexOf('?'));
  const params = new URLSearchParams(queryString);
  const userId = params.get('id');

  content.innerHTML = `
    <div class="admin-action-row">
      <button class="admin-button" data-route="users">Back to Users</button>
    </div>
    <div id="user-details-content"> <div class="admin-loading">Loading user details…</div> </div>
    ${renderAddPurchaseModalHtml()}
  `;

  const container = document.getElementById('user-details-content');
  if (!container) return;

  if (!userId) {
    container.innerHTML = '<div class="admin-error"><strong>No user ID provided.</strong><br>Please go back to the users list and select a user.</div>';
    return;
  }

  async function loadAndRender() {
    container.innerHTML = '<div class="admin-loading">Loading user details…</div>';
    const result = await fetchUserDetails(userId);

    if (!result.success || !result.data) {
      container.innerHTML = '<div class="admin-error"><strong>Unable to load user details.</strong></div>';
      return;
    }

    container.innerHTML = renderProfile(result.data);
  }

  await loadAndRender();

  // Handle status toggle and other container clicks
  container.addEventListener('click', async (e) => {
    // 1. Data route navigation
    const link = e.target.closest('[data-route="user-details"]');
    if (link && link.dataset.id) {
      window.location.hash = `user-details?id=${link.dataset.id}`;
      return;
    }

    // 2. Active / Inactive Status toggle
    const toggleBtn = e.target.closest('.admin-status-toggle');
    if (toggleBtn) {
      const uId = toggleBtn.dataset.userId || userId;
      const currentStatus = toggleBtn.dataset.currentStatus;
      const newStatusBool = currentStatus === 'inactive';

      const originalText = toggleBtn.textContent;
      toggleBtn.disabled = true;
      toggleBtn.textContent = '...';

      const result = await updateUserStatus(uId, newStatusBool);

      if (result.success) {
        const newStatusString = newStatusBool ? 'active' : 'inactive';
        toggleBtn.dataset.currentStatus = newStatusString;
        toggleBtn.textContent = newStatusString;
        toggleBtn.classList.remove('active', 'inactive');
        toggleBtn.classList.add(newStatusString);
      } else {
        alert('Failed to update status. Please try again.');
        toggleBtn.textContent = originalText;
      }
      toggleBtn.disabled = false;
      return;
    }

    // 3. Open Add Purchase Modal
    const openAddPurchaseBtn = e.target.closest('#btn-open-add-purchase');
    if (openAddPurchaseBtn) {
      openAddPurchaseModal();
      return;
    }

    // 4. Delete Purchase button
    const deleteBtn = e.target.closest('.admin-delete-purchase-btn');
    if (deleteBtn) {
      const purchaseId = deleteBtn.dataset.purchaseId;
      const confirmDelete = confirm("क्या आप यह Purchase हटाना चाहते हैं? यह कार्रवाई वापस नहीं की जा सकती।");
      if (!confirmDelete) return;

      deleteBtn.disabled = true;
      deleteBtn.textContent = '...';

      const result = await deletePurchase(purchaseId, userId);
      if (result.success) {
        alert("Purchase सफलतापूर्वक हटा दी गई है।");
        await loadAndRender();
      } else {
        alert("Purchase हटाने में त्रुटि: " + (result.error || "कृपया पुनः प्रयास करें।"));
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Delete';
      }
      return;
    }
  });

  // Modal elements & handlers
  const modalOverlay = document.getElementById('add-purchase-modal-overlay');
  const btnCloseModal = document.getElementById('btn-close-purchase-modal');
  const btnCancelModal = document.getElementById('btn-cancel-purchase-modal');
  const purchaseForm = document.getElementById('manual-purchase-form');
  const selectBook = document.getElementById('modal-book-id');
  const inputAmount = document.getElementById('modal-amount');
  const inputPaymentId = document.getElementById('modal-payment-id');
  const inputDate = document.getElementById('modal-purchase-date');
  const errorBox = document.getElementById('modal-form-error');
  const btnSubmit = document.getElementById('btn-submit-purchase');

  let availableBooksCache = [];

  async function openAddPurchaseModal() {
    if (!modalOverlay) return;

    // Reset form
    if (purchaseForm) purchaseForm.reset();
    if (errorBox) { errorBox.style.display = 'none'; errorBox.textContent = ''; }
    
    // Set default date to today YYYY-MM-DD
    if (inputDate) {
      inputDate.value = new Date().toISOString().split('T')[0];
    }
    
    // Generate suggested payment ID if empty
    if (inputPaymentId) {
      inputPaymentId.value = 'PAY_MANUAL_' + Math.floor(100000 + Math.random() * 900000);
    }

    // Load available books for dropdown
    if (selectBook) {
      selectBook.innerHTML = '<option value="">-- Loading Books... --</option>';
      if (availableBooksCache.length === 0) {
        const booksRes = await fetchAvailableBooks();
        if (booksRes.success && booksRes.data) {
          availableBooksCache = booksRes.data;
        }
      }

      selectBook.innerHTML = '<option value="">-- Select Book --</option>';
      availableBooksCache.forEach(book => {
        const opt = document.createElement('option');
        opt.value = book.id;
        opt.textContent = `${book.id} - ${book.title}`;
        opt.dataset.price = book.offerPrice || 99;
        selectBook.appendChild(opt);
      });
    }

    modalOverlay.style.display = 'flex';
  }

  function closeAddPurchaseModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeAddPurchaseModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeAddPurchaseModal);

  // Auto-fill price on book selection
  if (selectBook) {
    selectBook.addEventListener('change', () => {
      const selectedOption = selectBook.options[selectBook.selectedIndex];
      if (selectedOption && selectedOption.dataset.price && inputAmount) {
        inputAmount.value = selectedOption.dataset.price;
      }
    });
  }

  // Handle manual purchase submit
  if (purchaseForm) {
    purchaseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';

      const paymentId = inputPaymentId?.value?.trim();
      const bookId = selectBook?.value?.trim();
      const amount = inputAmount?.value?.trim();
      const purchaseDate = inputDate?.value;

      if (!paymentId) {
        showFormError('Payment ID is required.');
        return;
      }
      if (!bookId) {
        showFormError('Please select a book.');
        return;
      }
      if (!amount || isNaN(amount) || Number(amount) < 0) {
        showFormError('Please enter a valid amount.');
        return;
      }
      if (!purchaseDate) {
        showFormError('Please select a purchase date.');
        return;
      }

      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Saving...';

      try {
        const result = await addManualPurchase({
          profileId: userId,
          paymentId,
          bookId,
          amount: Number(amount),
          purchaseDate
        });

        if (result.success) {
          alert('Purchase successfully recorded! User has been activated.');
          closeAddPurchaseModal();
          await loadAndRender();
        } else {
          showFormError(result.error || 'Failed to save purchase. Please try again.');
        }
      } catch (err) {
        showFormError(err.message || 'An unexpected error occurred.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Save Purchase';
      }
    });
  }

  function showFormError(msg) {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = 'block';
    } else {
      alert(msg);
    }
  }
}

