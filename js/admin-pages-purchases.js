/* Admin Purchases Page */

import { initAdminLayout } from './admin-main.js';
import { fetchPurchases, fetchPurchaseFilterOptions } from './admin-api.js';

let currentPurchasesData = []; // For CSV export

function renderPurchaseRow(item) {
  const sanitizedMobile = String(item.mobile || '').replace(/\D/g, '');
  let whatsappBtnHTML = '';
  if (sanitizedMobile) {
    let waNum = sanitizedMobile;
    if (waNum.length === 10) waNum = '91' + waNum;
    const custName = item.customer || 'किसान साथी';
    const bookTitle = item.book || 'ई-बुक';

    const isSuccess = ['success', 'completed', 'paid'].includes(String(item.status || '').toLowerCase().trim());

    if (isSuccess) {
      const waMsg = `🙏 नमस्ते ${custName} जी!

🎉 बहुत-बहुत बधाई और स्वागत है! आप आरोग्यम इंडिया के सम्मानित सदस्य बन चुके हैं।

📚 आपकी ई-बुक: *${bookTitle}*
आपके खाते में सफलतापूर्वक सक्रिय (Activate) कर दी गई है।

📖 *1. My Library (ऑनलाइन पढ़ें व ऑडियो सुनें):*
आप अपनी ई-बुक को कभी भी, कहीं भी पढ़ने और ऑडियो सुनने के लिए नीचे दिए गए लिंक पर जाएं:
👉 https://aarogyamindia.online/my-library.html

📥 *2. PDF डाउनलोड करें:*
अपनी बुक को डाउनलोड करने के लिए My Library में जाकर 'डाउनलोड' बटन दबाएं:
👉 https://aarogyamindia.online/my-library.html

📲 *3. आरोग्यम इंडिया ऐप सीधे इंस्टॉल करें:*
बिना ब्राउज़र खोले 1-क्लिक में उपयोग करने हेतु ऐप इंस्टॉल करें:
👉 https://aarogyamindia.online/aarogyam-app.html

🌸 *4. 24x7 निःशुल्क 'आरोग्यम सखी AI' की सुविधा:*
फसलों के रोग, सही जैविक कीटनाशक स्प्रे चार्ट, पशुपालन या स्वास्थ्य का कोई भी सवाल पूछें या अपने खेत की फोटो भेजकर तुरंत वैज्ञानिक सलाह पाएं:
👉 https://aarogyamindia.online/aarogyam-sakhi.html

🎁 *विशेष ऑफर्स, छूट व किसी भी सहायता हेतु हमसे संपर्क करें:*
📞 WhatsApp / कॉल: +91 7974422572

आपका शुभचिंतक,  
*आरोग्यम इंडिया टीम* 🌿`;

      const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waMsg)}`;
      whatsappBtnHTML = `<a href="${waUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;border-color:#22c55e;font-weight:700;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;" title="सफलतापूर्वक खरीद का बधाई व स्वागत संदेश भेजें">💬 बधाई संदेश</a>`;
    } else {
      const followUpMsg = `🙏 नमस्ते ${custName} जी!

आशा है आप सपरिवार सकुशल व प्रसन्नचित्त होंगे 🌿

हमने देखा कि आप आरोग्यम इंडिया से *"${bookTitle}"* प्राप्त करने का प्रयास कर रहे थे, लेकिन किसी तकनीकी रुकावट, इंटरनेट समस्या या व्यस्तता के कारण आपका ऑर्डर अधूरा रह गया।

❤️ *हम आपके साथ हैं:*
यदि ऑनलाइन पेमेंट करने में कोई भी परेशानी या असुविधा आई हो, तो आप सीधे हमारे आधिकारिक UPI नंबर पर भी राशि भेज सकते हैं:

💳 *Google Pay / PhonePe / Paytm / BHIM UPI:*
👉 UPI No: *7049294111*

📸 *पेमेंट करने के बाद इसी नंबर पर स्क्रीनशॉट (Screenshot) भेजें*, हम तुरंत 2 मिनट में आपकी ई-बुक सक्रिय (Activate) करवा देंगे।

📲 *1. आरोग्यम इंडिया ऐप सीधे इंस्टॉल करें:*
अपने मोबाइल में बिना रुकावट तुरंत ऐप चलाने हेतु यहाँ से इंस्टॉल करें:
👉 https://aarogyamindia.online/aarogyam-app.html

🌸 *2. 24x7 निःशुल्क 'आरोग्यम सखी AI' की सुविधा:*
फसल की बीमारी, पत्ती पीली पड़ना, इल्ली का जैविक स्प्रे, पशुओं का दूध व स्वास्थ्य संबंधी कोई भी सवाल पूछें या फोटो भेजकर तुरंत वैज्ञानिक सलाह पाएं:
👉 https://aarogyamindia.online/aarogyam-sakhi.html

🎁 *विशेष डिस्काउंट व अतिरिक्त ऑफर्स के लिए हमसे अभी संपर्क करें:*
हम आपके लिए विशेष छूट व उपहार उपलब्ध करा सकते हैं।
📞 WhatsApp / कॉल: +91 7974422572

सप्रेम व आदर सहित,  
*आपकी आरोग्यम इंडिया टीम* 🌾`;

      const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(followUpMsg)}`;
      whatsappBtnHTML = `<a href="${waUrl}" target="_blank" class="admin-button small-button" style="background:#f59e0b;color:#000;border-color:#d97706;font-weight:700;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;" title="अधूरे ऑर्डर हेतु फॉलो-अप संदेश भेजें">💬 फॉलो-अप संदेश</a>`;
    }
  } else {
    whatsappBtnHTML = `<span class="admin-muted" style="font-size:0.75rem;">मोबाइल नहीं</span>`;
  }

  return `
    <tr>
      <td><strong>${item.order}</strong></td>
      <td>
        <div class="admin-user-name">${item.customer}</div>
        ${item.mobile ? `<div class="admin-user-email" style="font-size:0.78rem;"><a href="tel:${item.mobile}" class="admin-subtle-link">📞 ${item.mobile}</a></div>` : ''}
      </td>
      <td>${item.book}</td>
      <td><strong>${item.amount}</strong></td>
      <td>${item.source}</td>
      <td><span class="status-pill ${item.status}">${item.status}</span></td>
      <td>${item.date}</td>
      <td>${whatsappBtnHTML}</td>
    </tr>
  `;
}

function renderPurchasesTable(purchases) {
  currentPurchasesData = purchases; // Store for export
  if (!purchases || purchases.length === 0) {
    return '<div class="admin-empty"><strong>No purchases found.</strong><br>Adjust filters or search terms.</div>';
  }
  return `
    <div class="admin-table-wrapper sticky-header-table">
      <table class="admin-table">
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Book</th><th>Amount</th><th>Source</th><th>Status</th><th>Date</th><th>Action</th></tr>
        </thead>
        <tbody>${purchases.map(renderPurchaseRow).join('')}</tbody>
      </table>
    </div>`;
}

export async function initPurchases() {
  initAdminLayout('Purchases', 'Browse order history with status and source filters.');

  const content = document.getElementById('page-content');
  if (!content) return;
  content.innerHTML = `
    <div class="admin-section">
      <div class="admin-section-title">Purchases</div>
      <div class="admin-card admin-controls">
        <input id="purchase-search" type="search" placeholder="Search orders by ID, book or customer" class="admin-input" />
        <select id="purchase-status-filter" class="admin-select">
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <select id="purchase-date-filter" class="admin-select">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="thismonth">This Month</option>
            <option value="custom">Custom Date</option>
        </select>
        <input type="date" id="purchase-custom-date" class="admin-input" style="display: none;">
        <select id="purchase-source-filter" class="admin-select">
          <option value="all">All Sources</option>
        </select>
        <select id="purchase-book-filter" class="admin-select">
          <option value="all">All Books</option>
        </select>
        <button id="export-csv-btn" class="admin-button">Export CSV</button>
      </div>
      <div id="purchases-table" style="margin-top:12px;"></div>
    </div>
  `;

  const container = document.getElementById('purchases-table');
  const searchInput = document.getElementById('purchase-search');
  const statusSelect = document.getElementById('purchase-status-filter');
  const dateSelect = document.getElementById('purchase-date-filter');
  const customDateInput = document.getElementById('purchase-custom-date');
  const sourceSelect = document.getElementById('purchase-source-filter');
  const bookSelect = document.getElementById('purchase-book-filter');
  const exportBtn = document.getElementById('export-csv-btn');

  if (!container) return;

  async function populateFilters() {
    const result = await fetchPurchaseFilterOptions();
    if (result.success) {
      const { books, sources } = result.data;
      sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceSelect.appendChild(option);
      });
      books.forEach(bookId => {
        const option = document.createElement('option');
        option.value = bookId;
        option.textContent = bookId;
        bookSelect.appendChild(option);
      });
    }
  }

  async function reload(queryFromEvent) {
    container.innerHTML = '<div class="admin-loading">Loading purchases…</div>';

    const dateFilterValue = dateSelect.value;
    let startDate, endDate;
    const now = new Date();

    switch (dateFilterValue) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'last7days':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'thismonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
        case 'custom':
            if (customDateInput.value) {
                const selectedDate = new Date(customDateInput.value);
                startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
            }
            break;
    }

    const params = { 
      query: (queryFromEvent !== undefined) ? queryFromEvent : (searchInput?.value || ''), 
      status: statusSelect?.value || 'all',
      source: sourceSelect?.value || 'all',
      bookId: bookSelect?.value || 'all',
      startDate,
      endDate
    };
    const result = await fetchPurchases(params);
    container.innerHTML = result.success ? renderPurchasesTable(result.data) : '<div class="admin-error"><strong>Unable to load purchases.</strong></div>';
  }

  function exportToCsv() {
    if (currentPurchasesData.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ["Order", "Customer", "Book", "Amount", "Source", "Status", "Date"];
    const rows = currentPurchasesData.map(p => [
        `"${p.order || ''}"`,
        `"${(p.customer || '').replace(/"/g, '""')}"`,
        `"${(p.book || '').replace(/"/g, '""')}"`,
        `"${(p.amount || '').replace('₹', '')}"`,
        `"${p.source || ''}"`,
        `"${p.status || ''}"`,
        `"${p.date || ''}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aarogyam_purchases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (searchInput) searchInput.addEventListener('input', () => reload());
  if (statusSelect) statusSelect.addEventListener('change', () => reload());
  if (sourceSelect) sourceSelect.addEventListener('change', () => reload());
  if (bookSelect) bookSelect.addEventListener('change', () => reload());
  if (dateSelect) dateSelect.addEventListener('change', () => {
    customDateInput.style.display = dateSelect.value === 'custom' ? 'block' : 'none';
    if (dateSelect.value !== 'custom') reload();
  });
  if (customDateInput) customDateInput.addEventListener('change', () => reload());
  if (exportBtn) exportBtn.addEventListener('click', exportToCsv);

  document.addEventListener('admin:global-search', (e) => reload(e.detail?.query || ''));

  await populateFilters();
  await reload();
}

// TODO: add paging and date range filters in Phase-2
