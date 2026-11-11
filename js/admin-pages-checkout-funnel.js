import { initAdminLayout } from './admin-main.js';
import { fetchCheckoutLogs, fetchAllBooks } from './admin-api.js';

let allLogs = [];
let currentLogsData = []; // For CSV export
let allBooks = [];
let currentTab = 'report'; // 'report' or 'logs'

const KNOWN_BOOK_NAMES = {
    'BK001': '🌾 खरीफ फसल मास्टर गाइड',
    'BK002': '🩺 खेती का डॉक्टर',
    'BK015': '🥬 11 सब्जी मास्टर गाइड',
    'BK016': '💊 कृषि दवा सलाहकार गाइड',
    'BK017': '🌾 गेहूँ की खेती सम्पूर्ण मार्गदर्शिका',
    'BK019': '🌱 चना की उन्नत खेती मार्गदर्शिका',
    'BK020': '🌼 सरसों की उन्नत खेती मार्गदर्शिका',
    'SUB001': '👑 Aarogyam Pro VIP सदस्यता',
    'BUNDLE_KISAN_5IN1': '📚 5-इन-1 सम्पूर्ण किसान कॉम्बो'
};

function getDisplayBookName(bookId) {
    if (!bookId) return 'अज्ञात ई-बुक';
    const clean = String(bookId).trim();
    if (KNOWN_BOOK_NAMES[clean]) return KNOWN_BOOK_NAMES[clean];
    if (clean.includes(',')) return '📚 5-इन-1 सम्पूर्ण किसान कॉम्बो';
    return clean;
}

function renderLayout() {
    const content = document.getElementById('checkout-funnel-page') || document.getElementById('page-content');
    if (!content) return;

    content.innerHTML = `
        <div class="admin-section" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: #f8fafc; margin: 0;">⚡ Checkout Funnel & Conversion Engine</h2>
                    <p style="color: #94a3b8; font-size: 0.85rem; margin: 4px 0 0 0;">चेकआउट आंकड़े, ड्रॉप-ऑफ विश्लेषण व सीधे व्हाट्सएप रिकवरी सिस्टम</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button id="tab-btn-report" class="funnel-tab-btn ${currentTab === 'report' ? 'active' : ''}">
                        📊 फ़नल रिपोर्ट व आंकड़े
                    </button>
                    <button id="tab-btn-logs" class="funnel-tab-btn ${currentTab === 'logs' ? 'active' : ''}">
                        📋 ग्राहक लॉग्स व संपर्क
                    </button>
                </div>
            </div>

            <!-- Global Controls / Filters -->
            <div class="admin-card admin-controls" style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; background: #0f172a; padding: 12px 16px; border-radius: 10px; border: 1px solid #1e293b;">
                <input id="search-input" type="search" placeholder="🔍 ग्राहक का नाम या मोबाइल नंबर खोजें..." class="admin-input" style="min-width: 220px; flex: 1;">
                <select id="status-filter" class="admin-select" style="min-width: 150px;"></select>
                <select id="date-filter" class="admin-select" style="min-width: 140px;"></select>
                <input type="date" id="custom-date-input" class="admin-input" style="display: none;">
                <select id="book-filter" class="admin-select" style="min-width: 180px;"></select>
                <button id="export-csv-btn" class="admin-button" style="background: #0284c7; color: #fff; font-weight: 700;">📥 Export CSV</button>
            </div>
        </div>

        <!-- Tab 1: Funnel Analytics Report Container -->
        <div id="funnel-report-view" style="${currentTab === 'report' ? 'display: block;' : 'display: none;'}">
            <div id="funnel-kpis-container" class="funnel-kpi-grid"></div>
            <div id="funnel-visual-container" class="funnel-progress-wrap"></div>
            <div id="funnel-books-breakdown" class="admin-section" style="margin-top: 16px;"></div>
        </div>

        <!-- Tab 2: Activity Logs Table Container -->
        <div id="funnel-logs-view" style="${currentTab === 'logs' ? 'display: block;' : 'display: none;'}">
            <div id="logs-table-container"></div>
        </div>
    `;

    // Bind tab clicks
    document.getElementById('tab-btn-report')?.addEventListener('click', () => switchTab('report'));
    document.getElementById('tab-btn-logs')?.addEventListener('click', () => switchTab('logs'));
}

function switchTab(tab) {
    currentTab = tab;
    const reportBtn = document.getElementById('tab-btn-report');
    const logsBtn = document.getElementById('tab-btn-logs');
    const reportView = document.getElementById('funnel-report-view');
    const logsView = document.getElementById('funnel-logs-view');

    if (tab === 'report') {
        reportBtn?.classList.add('active');
        logsBtn?.classList.remove('active');
        if (reportView) reportView.style.display = 'block';
        if (logsView) logsView.style.display = 'none';
        renderReportView(currentLogsData);
    } else {
        logsBtn?.classList.add('active');
        reportBtn?.classList.remove('active');
        if (logsView) logsView.style.display = 'block';
        if (reportView) reportView.style.display = 'none';
        renderTable(currentLogsData);
    }
}

function renderReportView(logs) {
    const kpiContainer = document.getElementById('funnel-kpis-container');
    const visualContainer = document.getElementById('funnel-visual-container');
    const breakdownContainer = document.getElementById('funnel-books-breakdown');
    if (!kpiContainer || !visualContainer || !breakdownContainer) return;

    if (!logs || logs.length === 0) {
        kpiContainer.innerHTML = '<div class="admin-empty">चयनित अवधि में कोई चेकआउट डेटा नहीं मिला।</div>';
        visualContainer.innerHTML = '';
        breakdownContainer.innerHTML = '';
        return;
    }

    // 1. Calculate Aggregated Funnel Stats
    let totalInitiated = 0;
    let totalSuccess = 0;
    let totalDropped = 0;
    let totalFailed = 0;

    const bookStatsMap = {};

    logs.forEach(log => {
        const status = (log.status || '').toLowerCase();
        const bookId = log.book_id || 'Unknown';
        const bookTitle = getDisplayBookName(bookId);

        if (!bookStatsMap[bookId]) {
            bookStatsMap[bookId] = { id: bookId, title: bookTitle, initiated: 0, success: 0, dropped: 0, failed: 0 };
        }

        if (status.includes('success') || status === 'paid' || status === 'completed') {
            totalSuccess++;
            bookStatsMap[bookId].success++;
        } else if (status.includes('fail')) {
            totalFailed++;
            bookStatsMap[bookId].failed++;
        } else if (status.includes('drop')) {
            totalDropped++;
            bookStatsMap[bookId].dropped++;
        } else {
            totalInitiated++;
            bookStatsMap[bookId].initiated++;
        }
    });

    const totalAttempts = totalInitiated + totalSuccess + totalDropped + totalFailed;
    const conversionRate = totalAttempts > 0 ? ((totalSuccess / totalAttempts) * 100).toFixed(1) : 0;
    const dropRate = totalAttempts > 0 ? ((totalDropped / totalAttempts) * 100).toFixed(1) : 0;

    // 2. Render KPI Summary Cards
    kpiContainer.innerHTML = `
        <div class="funnel-kpi-card" style="border-left: 4px solid #38bdf8;">
            <div class="funnel-kpi-title">🚀 कुल चेकआउट प्रयास</div>
            <div class="funnel-kpi-val">${totalAttempts}</div>
            <div class="funnel-kpi-sub">चेकआउट बटन क्लिक / फ़ॉर्म भरा</div>
        </div>
        <div class="funnel-kpi-card" style="border-left: 4px solid #22c55e;">
            <div class="funnel-kpi-title">✅ सफल खरीद (Paid)</div>
            <div class="funnel-kpi-val" style="color: #22c55e;">${totalSuccess}</div>
            <div class="funnel-kpi-sub">कन्वर्जन दर: <strong style="color:#22c55e;">${conversionRate}%</strong></div>
        </div>
        <div class="funnel-kpi-card" style="border-left: 4px solid #f59e0b;">
            <div class="funnel-kpi-title">⚠️ बीच में छूटे (Dropped)</div>
            <div class="funnel-kpi-val" style="color: #f59e0b;">${totalDropped}</div>
            <div class="funnel-kpi-sub">ड्रॉप-ऑफ दर: <strong style="color:#f59e0b;">${dropRate}%</strong></div>
        </div>
        <div class="funnel-kpi-card" style="border-left: 4px solid #ef4444;">
            <div class="funnel-kpi-title">❌ असफल भुगतान (Failed)</div>
            <div class="funnel-kpi-val" style="color: #ef4444;">${totalFailed}</div>
            <div class="funnel-kpi-sub">बैंक / UPI एरर</div>
        </div>
        <div class="funnel-kpi-card" style="border-left: 4px solid #a855f7;">
            <div class="funnel-kpi-title">🎯 समग्र कन्वर्जन</div>
            <div class="funnel-kpi-val" style="color: #a855f7;">${conversionRate}%</div>
            <div class="funnel-kpi-sub">${totalSuccess} / ${totalAttempts} आर्डर पूरे</div>
        </div>
    `;

    // 3. Render Visual Progress Funnel
    visualContainer.innerHTML = `
        <h3 style="margin: 0 0 14px 0; font-size: 1.05rem; font-weight: 700; color: #f8fafc;">📊 लाइव फ़नल स्टेज प्रगति (Conversion Stages)</h3>
        
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">
                <span>1. चेकआउट शुरू (Initiated)</span>
                <strong>${totalAttempts} (100%)</strong>
            </div>
            <div style="background: #1e293b; border-radius: 8px; height: 16px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #38bdf8, #0284c7); height: 100%; width: 100%;"></div>
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">
                <span>2. पेमेंट सफल (Success)</span>
                <strong style="color: #22c55e;">${totalSuccess} (${conversionRate}%)</strong>
            </div>
            <div style="background: #1e293b; border-radius: 8px; height: 16px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #22c55e, #16a34a); height: 100%; width: ${conversionRate}%;"></div>
            </div>
        </div>

        <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">
                <span>3. अधूरे छूटे (Dropped / Incomplete)</span>
                <strong style="color: #f59e0b;">${totalDropped} (${dropRate}%)</strong>
            </div>
            <div style="background: #1e293b; border-radius: 8px; height: 16px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, #f59e0b, #d97706); height: 100%; width: ${dropRate}%;"></div>
            </div>
        </div>
    `;

    // 4. Render Book-wise Breakdown Table
    const bookRows = Object.values(bookStatsMap).sort((a, b) => (b.success + b.dropped) - (a.success + a.dropped));
    breakdownContainer.innerHTML = `
        <div class="admin-section-title" style="margin-bottom: 12px; font-size: 1.05rem; font-weight: 700; color: #f8fafc;">
            📚 पुस्तक व बंडल अनुसार कन्वर्जन रिपोर्ट (Book-wise Performance)
        </div>
        <div class="admin-table-wrapper sticky-header-table" style="background: #0f172a; border-radius: 10px; border: 1px solid #1e293b;">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>पुस्तक / कॉम्बो नाम</th>
                        <th style="text-align:center;">कुल प्रयास</th>
                        <th style="text-align:center;">सफल खरीद</th>
                        <th style="text-align:center;">बीच में छूटे</th>
                        <th style="text-align:center;">विफल</th>
                        <th style="text-align:center;">कन्वर्जन %</th>
                        <th style="text-align:center;">सुझाव</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookRows.map(b => {
                        const bTotal = b.initiated + b.success + b.dropped + b.failed;
                        const bConv = bTotal > 0 ? ((b.success / bTotal) * 100).toFixed(1) : 0;
                        const bDrop = bTotal > 0 ? ((b.dropped / bTotal) * 100).toFixed(1) : 0;
                        return `
                            <tr>
                                <td>
                                    <strong style="color:#f8fafc;">${b.title}</strong>
                                    <div style="font-size:0.75rem; color:#64748b;">ID: ${b.id}</div>
                                </td>
                                <td style="text-align:center; font-weight:bold;">${bTotal}</td>
                                <td style="text-align:center; color:#22c55e; font-weight:bold;">${b.success}</td>
                                <td style="text-align:center; color:#f59e0b; font-weight:bold;">${b.dropped}</td>
                                <td style="text-align:center; color:#ef4444; font-weight:bold;">${b.failed}</td>
                                <td style="text-align:center;">
                                    <span class="admin-pill ${bConv >= 25 ? 'success' : (bConv > 0 ? 'warning' : 'default')}">
                                        ${bConv}%
                                    </span>
                                </td>
                                <td style="text-align:center;">
                                    ${b.dropped > 0 ? `<button onclick="window.filterDroppedByBook('${b.id}')" class="admin-button small-button" style="background:#f59e0b; color:#000; font-weight:700; padding:4px 8px; font-size:0.75rem;">📲 ${b.dropped} को फॉलो-अप भेजें</button>` : '<span style="color:#64748b; font-size:0.8rem;">-</span>'}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.filterDroppedByBook = function(bookId) {
    const bookFilter = document.getElementById('book-filter');
    const statusFilter = document.getElementById('status-filter');
    if (bookFilter) bookFilter.value = bookId;
    if (statusFilter) statusFilter.value = 'dropped';
    switchTab('logs');
    applyFiltersAndReload();
};

function renderTable(logs) {
    const container = document.getElementById('logs-table-container');
    if (!container) return;

    currentLogsData = logs; // Store for export

    if (logs.length === 0) {
        container.innerHTML = '<div class="admin-empty">चयनित फ़िल्टर के अनुसार कोई चेकआउट लॉग नहीं मिला।</div>';
        return;
    }

    const statusColors = {
        success: 'success',
        failed: 'danger',
        dropped: 'warning',
        initiated: 'info'
    };

    container.innerHTML = `
        <div class="admin-table-wrapper sticky-header-table">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>समय व दिनांक</th>
                        <th>ग्राहक</th>
                        <th>ई-बुक / बंडल</th>
                        <th>स्थिति</th>
                        <th>त्वरित संपर्क व फॉलो-अप</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(log => {
                        const statusValue = log.status.toLowerCase();
                        let pillClass;

                        if (statusValue.includes('/')) {
                            pillClass = 'warning'; 
                        } else {
                            pillClass = statusColors[statusValue] || 'default';
                        }

                        const sanitizedMobile = String(log.customer_mobile || '').replace(/\D/g, '');
                        
                        let callButtonHTML = '';
                        let whatsappButtonHTML = '';

                        if (sanitizedMobile) {
                            callButtonHTML = `<a href="tel:${sanitizedMobile}" class="admin-button small-button" style="background:#334155;color:#fff;">📞 Call</a>`;

                            let whatsappNumber = sanitizedMobile;
                            if (whatsappNumber.length === 10) {
                                whatsappNumber = '91' + whatsappNumber;
                            }
                            const customerName = log.customer_name || 'किसान साथी';
                            const bookTitle = getDisplayBookName(log.book_id || log.book_name);
                            const isSuccess = ['success', 'completed', 'paid'].includes(statusValue.trim());

                            if (isSuccess) {
                                const successMsg = `🙏 नमस्ते ${customerName} जी!

🎉 बहुत-बहुत बधाई और स्वागत है! आप आरोग्यम इंडिया के सम्मानित सदस्य बन चुके हैं।

📚 आपकी ई-बुक: *${bookTitle}*
आपके खाते में सफलतापूर्वक सक्रिय (Activate) कर दी गई है।

📖 *1. My Library (ऑनलाइन पढ़ें व ऑडियो सुनें):*
👉 https://aarogyamindia.online/my-library.html

📥 *2. PDF डाउनलोड करें:*
👉 https://aarogyamindia.online/my-library.html

📲 *3. आरोग्यम इंडिया ऐप सीधे इंस्टॉल करें:*
👉 https://aarogyamindia.online/aarogyam-app.html

🌸 *4. 24x7 निःशुल्क 'आरोग्यम सखी AI' की सुविधा:*
👉 https://aarogyamindia.online/aarogyam-sakhi.html

📞 सहायता WhatsApp / कॉल: +91 7974422572
आरोग्यम इंडिया टीम 🌿`;

                                const encodedMessage = encodeURIComponent(successMsg);
                                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                                whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button" style="background:#25D366;color:#fff;border-color:#22c55e;font-weight:700;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;" title="सफलतापूर्वक खरीद का बधाई व स्वागत संदेश भेजें">💬 बधाई संदेश</a>`;
                            } else {
                                const followUpMsg = `🙏 नमस्ते ${customerName} जी!

आशा है आप सपरिवार सकुशल व प्रसन्नचित्त होंगे 🌿

हमने देखा कि आप आरोग्यम इंडिया से *"${bookTitle}"* प्राप्त करने का प्रयास कर रहे थे, लेकिन किसी तकनीकी रुकावट, इंटरनेट समस्या या व्यस्तता के कारण आपका ऑर्डर अधूरा रह गया।

❤️ *हम आपके साथ हैं:*
यदि ऑनलाइन पेमेंट करने में कोई भी परेशानी या असुविधा आई हो, तो आप सीधे हमारे आधिकारिक UPI नंबर पर भी राशि भेज सकते हैं:

💳 *Google Pay / PhonePe / Paytm / BHIM UPI:*
👉 UPI No: *7049294111*

📸 *पेमेंट करने के बाद इसी नंबर पर स्क्रीनशॉट भेजें*, हम तुरंत आपकी ई-बुक सक्रिय (Activate) करवा देंगे।

📲 ऐप इंस्टॉल करें: https://aarogyamindia.online/aarogyam-app.html
📞 संपर्क: +91 7974422572

आपकी आरोग्यम इंडिया टीम 🌾`;

                                const encodedMessage = encodeURIComponent(followUpMsg);
                                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                                whatsappButtonHTML = `<a href="${whatsappUrl}" target="_blank" class="admin-button small-button" style="background:#f59e0b;color:#000;border-color:#d97706;font-weight:700;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;" title="अधूरे ऑर्डर हेतु फॉलो-अप संदेश भेजें">💬 फॉलो-अप संदेश</a>`;
                            }
                        }

                        const actionButtons = (callButtonHTML || whatsappButtonHTML)
                            ? `<div style="display: flex; gap: 8px; align-items: center;">${callButtonHTML}${whatsappButtonHTML}</div>`
                            : '<span class="admin-muted">No Action</span>';

                        const bookDisplayName = getDisplayBookName(log.book_id || log.book_name);

                        return `
                        <tr>
                            <td>${new Date(log.created_at).toLocaleString('en-IN')}</td>
                            <td>
                                <div class="admin-user-name" style="font-weight:700; color:#f8fafc;">${log.customer_name || 'Unknown Customer'}</div>
                                <div class="admin-user-email" style="color:#94a3b8; font-size:0.8rem;">${log.customer_mobile || 'No Mobile'}</div>
                            </td>
                            <td>
                                <strong style="color:#f8fafc;">${bookDisplayName}</strong>
                                <div style="font-size:0.75rem; color:#64748b;">ID: ${log.book_id || ''}</div>
                            </td>
                            <td><span class="admin-pill ${pillClass}">${log.status.toUpperCase()}</span></td>
                            <td>
                                ${actionButtons}
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function applyFiltersAndReload() {
    const tableContainer = document.getElementById('logs-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = '<div class="admin-loading">लोड हो रहा है...</div>';
    }

    const dateFilterValue = document.getElementById('date-filter')?.value || 'today';
    const customDateValue = document.getElementById('custom-date-input')?.value;
    let startDate, endDate;
    const now = new Date();

    switch (dateFilterValue) {
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
          if (customDateValue) {
            const selectedDate = new Date(customDateValue);
            startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
            endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
          }
          break;
        case 'alltime':
          startDate = null;
          endDate = null;
          break;
        case 'today':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
    }

    const params = {
        status: document.getElementById('status-filter')?.value || 'all',
        bookId: document.getElementById('book-filter')?.value || 'all',
        search: document.getElementById('search-input')?.value || '',
        startDate: startDate,
        endDate: endDate
    };

    const result = await fetchCheckoutLogs(params);

    if (result.success) {
        currentLogsData = result.data || [];
        renderReportView(currentLogsData);
        renderTable(currentLogsData);
    } else {
        if (tableContainer) {
            tableContainer.innerHTML = `<div class="admin-error"><strong>Error:</strong> ${result.error || 'लॉग लोड करने में समस्या आई।'}</div>`;
        }
    }
}

function exportToCsv() {
    if (currentLogsData.length === 0) {
        alert("एक्सपोर्ट के लिए कोई डेटा नहीं है।");
        return;
    }

    const headers = ["Date & Time", "Customer", "Mobile", "Book ID", "Book Name", "Status"];
    const rows = currentLogsData.map(log => [
        `"${new Date(log.created_at).toLocaleString('en-IN')}"`,
        `"${(log.customer_name || '').replace(/"/g, '""')}"`,
        `"${log.customer_mobile || ''}"`,
        `"${log.book_id || ''}"`,
        `"${(getDisplayBookName(log.book_id || log.book_name) || '').replace(/"/g, '""')}"`,
        `"${log.status || ''}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `aarogyam_checkout_funnel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function populateFilters(preselectedStatus) {
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const bookFilter = document.getElementById('book-filter');

    if (statusFilter) {
        statusFilter.innerHTML = `
            <option value="all">सभी स्थितियां (All Statuses)</option>
            <option value="followup">🔥 फ़ॉलो-अप आवश्यक (Incomplete / Dropped)</option>
            <option value="initiated">शुरू किया गया (Initiated)</option>
            <option value="dropped">छोड़ा गया (Dropped)</option>
            <option value="failed">विफल (Failed)</option>
            <option value="success">सफल भुगतान (Success)</option>
        `;
        if (preselectedStatus) {
            statusFilter.value = preselectedStatus;
        }
    }

    if (dateFilter) {
        dateFilter.innerHTML = `
            <option value="today">आज (Today)</option>
            <option value="yesterday">कल (Yesterday)</option>
            <option value="last7days">पिछले 7 दिन (Last 7 Days)</option>
            <option value="thismonth">इस माह (This Month)</option>
            <option value="alltime">सम्पूर्ण समय (All Time)</option>
            <option value="custom">कस्टम दिनांक (Custom Date)</option>
        `;
    }

    if (bookFilter) {
        bookFilter.innerHTML = `<option value="all">सभी पुस्तकें व बंडल (All Books)</option>` + 
        allBooks.map(book => `<option value="${book.id}">${book.name || book.title}</option>`).join('');
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const customDateInput = document.getElementById('custom-date-input');
    const bookFilter = document.getElementById('book-filter');
    const exportBtn = document.getElementById('export-csv-btn');

    let searchTimeout;
    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFiltersAndReload();
        }, 400);
    });

    statusFilter?.addEventListener('change', applyFiltersAndReload);
    dateFilter?.addEventListener('change', () => {
        if (dateFilter.value === 'custom') {
            customDateInput.style.display = 'inline-block';
        } else {
            customDateInput.style.display = 'none';
            applyFiltersAndReload();
        }
    });
    customDateInput?.addEventListener('change', applyFiltersAndReload);
    bookFilter?.addEventListener('change', applyFiltersAndReload);
    if (exportBtn) exportBtn.addEventListener('click', exportToCsv);
}

export async function initCheckoutFunnel() {
    initAdminLayout('Checkout Funnel', 'Track all checkout attempts from customers.');

    const content = document.getElementById('checkout-funnel-page') || document.getElementById('page-content');
    if (!content) return;

    renderLayout();

    // Show loading states
    const tableContainer = document.getElementById('logs-table-container');
    if (tableContainer) {
        tableContainer.innerHTML = '<div class="admin-loading">डेटा लोड हो रहा है...</div>';
    }

    // Fetch books for the filter
    const booksResult = await fetchAllBooks();
    if (booksResult.success) {
        allBooks = booksResult.data;
    } else {
        console.error("Could not load books for filter.");
    }

    // Check for pre-selected status from URL hash
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
    const preselectedStatus = urlParams.get('status');

    // Populate filters with data and pre-selections
    populateFilters(preselectedStatus);

    // Setup event listeners for filters
    setupEventListeners();

    // Initial data load
    await applyFiltersAndReload();
}

// Auto-run if loaded directly in browser
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('checkout-funnel-page') || document.getElementById('page-content')) {
                initCheckoutFunnel();
            }
        });
    } else {
        if (document.getElementById('checkout-funnel-page') || document.getElementById('page-content')) {
            initCheckoutFunnel();
        }
    }
}
