/* ==========================================================================
   UCAS PHONEBOOK ENGINE
   Mobile-First Contact Management
   - Native Contact Picker API (navigator.contacts.select) with Multiple Selection
   - Intelligent Indian Mobile Number Normalization
   - Duplicate Detection against Existing Records & Current Batch
   - Friendly VCF (vCard) Fallback Modal with Instructions
   - CSV Import & Column Validator
   - Preview Summary with 4-Counter Breakdown & 1-Click Batch Insert
   ========================================================================== */

(function (window) {
  'use strict';

  let contactsList = [];
  let pendingImportList = [];

  function initPhonebookModule() {
    bindPhonebookEvents();
    loadPhonebook();
  }

  function bindPhonebookEvents() {
    // Manual Form Add
    const manualForm = document.getElementById('ucas-phonebook-manual-form');
    if (manualForm) {
      manualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleManualAdd();
      });
    }

    // CSV File Input
    const csvInput = document.getElementById('ucas-phonebook-csv-file');
    if (csvInput) {
      csvInput.addEventListener('change', handleCSVFileSelected);
    }

    // vCard File Input
    const vcfInput = document.getElementById('ucas-phonebook-vcf-file');
    if (vcfInput) {
      vcfInput.addEventListener('change', handleVCFFileSelected);
    }
  }

  async function loadPhonebook() {
    const profileId = window.UCAS_SESSION.getUserId();
    const res = await window.UCAS_DB.getPhonebook(profileId);
    if (res.success) {
      contactsList = res.data || [];
      renderContactsTable(contactsList);
      updatePhonebookStats();
    }
    return contactsList;
  }

  function updatePhonebookStats() {
    const totalEl = document.getElementById('ucas-phonebook-total-count');
    if (totalEl) totalEl.textContent = contactsList.length;

    const phoneCount = contactsList.filter(c => c.source === 'phonebook').length;
    const manualCount = contactsList.filter(c => c.source === 'manual').length;
    const csvCount = contactsList.filter(c => c.source === 'csv').length;

    const phoneEl = document.getElementById('ucas-pb-stat-phone');
    const manualEl = document.getElementById('ucas-pb-stat-manual');
    const csvEl = document.getElementById('ucas-pb-stat-csv');

    if (phoneEl) phoneEl.textContent = phoneCount;
    if (manualEl) manualEl.textContent = manualCount;
    if (csvEl) csvEl.textContent = csvCount;
  }

  function renderContactsTable(contacts) {
    const tbody = document.getElementById('ucas-phonebook-table-body');
    if (!tbody) return;

    if (contacts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:2rem;color:var(--text-muted);">
            📇 अभी कोई संपर्क नहीं हैं। '📱 फोन से Contacts Import करें' या 'Add Contact' से संपर्क जोड़ें।
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = contacts.map((c, idx) => {
      const srcBadge = c.source === 'phonebook' 
        ? '<span style="background:#DCFCE7;color:#15803D;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">📱 Phonebook</span>'
        : c.source === 'csv'
        ? '<span style="background:#E0F2FE;color:#0369A1;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">📊 CSV</span>'
        : '<span style="background:#F1F5F9;color:#475569;padding:2px 6px;border-radius:4px;font-size:0.75rem;font-weight:700;">✍️ Manual</span>';

      const cleanMob = normalizeIndianMobile(c.mobile);
      const mobileActionHtml = cleanMob ? `
        <div style="display:inline-flex;align-items:center;gap:8px;">
          <a href="tel:${cleanMob}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:4px;" title="कॉल करें">
            <i class="fa-solid fa-phone" style="color:var(--primary);font-size:0.85rem;"></i> <code>${cleanMob}</code>
          </a>
          <a href="https://wa.me/91${cleanMob}" target="_blank" class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" style="padding:2px 8px;font-size:0.72rem;border-radius:4px;display:inline-flex;align-items:center;gap:4px;" title="WhatsApp खोलें">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp
          </a>
        </div>
      ` : `
        <span style="color:var(--text-muted);font-size:0.85rem;">
          <code>${c.mobile || '-'}</code> (Invalid)
        </span>
      `;

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${c.name}</div>
          </td>
          <td>${mobileActionHtml}</td>
          <td>${c.place || '-'}</td>
          <td>${srcBadge}</td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // NUMBER NORMALIZATION HELPER
  // ==========================================

  function normalizeIndianMobile(rawTel) {
    if (!rawTel) return null;
    let str = String(rawTel).trim();

    // Strip all non-digits
    let digits = str.replace(/\D/g, '');

    // If starts with 0091 or +91 or 91
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    } else if (digits.length === 13 && digits.startsWith('091')) {
      digits = digits.slice(3);
    } else if (digits.length === 14 && digits.startsWith('0091')) {
      digits = digits.slice(4);
    }

    // Must be exactly 10 digits and start with 6, 7, 8, or 9 (Indian Mobile Standards)
    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
      return digits;
    }

    return null;
  }

  // ==========================================
  // 1. PRIMARY: NATIVE CONTACT PICKER API
  // ==========================================

  async function startNativeContactImport() {
    if (!window.UCAS_PERMISSIONS.hasPermission('phonebook_import')) {
      window.UCAS_APP.showToast('आपको फोनबुक इम्पोर्ट की अनुमति नहीं है।', 'error');
      return;
    }

    // Check if Contact Picker API is supported
    const isSupported = ('contacts' in navigator) && (typeof navigator.contacts?.select === 'function');

    if (isSupported) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: true };
        
        // Open native contact picker
        const selectedContacts = await navigator.contacts.select(props, opts);

        if (!selectedContacts || selectedContacts.length === 0) {
          window.UCAS_APP.showToast('कोई संपर्क नहीं चुना गया।', 'info');
          return;
        }

        processRawPhonebookContacts(selectedContacts, 'phonebook');
        return;
      } catch (err) {
        console.warn('Contact picker cancelled or blocked:', err);
        // If user cancelled, don't force open fallback unless error occurred
        if (err.name !== 'AbortError') {
          openVcfModal();
        }
        return;
      }
    }

    // If Contact Picker is NOT supported (Desktop / Unsupported browser), show friendly VCF fallback
    openVcfModal();
  }

  function openVcfModal() {
    window.UCAS_APP.openModal('ucas-modal-import-phonebook');
  }

  // ==========================================
  // 2. CONTACT PROCESSING & NORMALIZATION
  // ==========================================

  function processRawPhonebookContacts(rawContacts, source = 'phonebook') {
    const profileId = window.UCAS_SESSION.getUserId();
    const existingMobiles = new Set(contactsList.map(c => c.mobile));
    const batchMobiles = new Set();
    const processed = [];

    let totalFound = 0;
    let duplicates = 0;
    let invalid = 0;

    rawContacts.forEach(rc => {
      // Extract Name
      let rawName = 'Unknown Contact';
      if (Array.isArray(rc.name) && rc.name.length > 0) {
        rawName = rc.name[0];
      } else if (typeof rc.name === 'string') {
        rawName = rc.name;
      }
      rawName = (rawName || 'Unknown Contact').trim();

      // Extract Telephones
      let telList = [];
      if (Array.isArray(rc.tel)) {
        telList = rc.tel;
      } else if (typeof rc.tel === 'string') {
        telList = [rc.tel];
      }

      if (telList.length === 0) {
        totalFound++;
        invalid++;
        return;
      }

      telList.forEach(rawTel => {
        totalFound++;
        const cleanMobile = normalizeIndianMobile(rawTel);

        if (!cleanMobile) {
          invalid++;
          return;
        }

        // Duplicate Check against DB or current batch
        if (existingMobiles.has(cleanMobile) || batchMobiles.has(cleanMobile)) {
          duplicates++;
          return;
        }

        batchMobiles.add(cleanMobile);
        processed.push({
          profile_id: profileId,
          name: rawName,
          mobile: cleanMobile,
          place: rc.place || '',
          source: source
        });
      });
    });

    showImportPreviewModal(processed, totalFound, duplicates, invalid, source);
  }

  // ==========================================
  // 3. VCF (vCard) PARSER FALLBACK
  // ==========================================

  function handleVCFFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const content = event.target.result;
      parseVCFContent(content);
    };
    reader.readAsText(file, 'UTF-8');
  }

  function parseVCFContent(vcfText) {
    if (!vcfText || !vcfText.includes('VCARD')) {
      window.UCAS_APP.showToast('चुनी गई फाइल मान्य vCard (.vcf) फाइल नहीं है।', 'error');
      return;
    }

    const cards = vcfText.split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);
    const rawContacts = [];

    cards.forEach(card => {
      // Parse Name (FN or N)
      let name = 'Unknown Contact';
      const fnMatch = card.match(/(?:FN|fn)(?:;[^:]*)?:(.*)/i);
      if (fnMatch && fnMatch[1]) {
        name = fnMatch[1].replace(/\\n|\\r/g, '').trim();
      } else {
        const nMatch = card.match(/(?:N|n)(?:;[^:]*)?:(.*)/i);
        if (nMatch && nMatch[1]) {
          const parts = nMatch[1].split(';').filter(p => p.trim().length > 0);
          name = parts.reverse().join(' ').trim();
        }
      }

      // Parse all TEL numbers in this card
      const telMatches = card.matchAll(/(?:TEL|tel)(?:;[^:]*)?:(.*)/gi);
      const tels = [];
      for (const tm of telMatches) {
        if (tm[1]) {
          tels.push(tm[1].trim());
        }
      }

      if (tels.length > 0) {
        rawContacts.push({ name: name || 'Unknown Contact', tel: tels });
      }
    });

    if (rawContacts.length === 0) {
      window.UCAS_APP.showToast('VCF फाइल में कोई संपर्क नंबर नहीं मिला।', 'warning');
      return;
    }

    processRawPhonebookContacts(rawContacts, 'phonebook');
  }

  // ==========================================
  // 4. CSV PARSER
  // ==========================================

  function handleCSVFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      window.UCAS_APP.showToast('कृपया केवल .CSV फाइल चुनें।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const csvText = event.target.result;
      parseAndValidateCSV(csvText);
    };
    reader.readAsText(file, 'UTF-8');
  }

  function parseAndValidateCSV(csvText) {
    const lines = csvText.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      window.UCAS_APP.showToast('CSV फाइल खाली है या कोई रिकॉर्ड नहीं है।', 'error');
      return;
    }

    // Header Detection
    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

    let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('नाम'));
    let mobileIdx = headers.findIndex(h => h.includes('mobile') || h.includes('phone') || h.includes('मोबाइल') || h.includes('tel'));
    let placeIdx = headers.findIndex(h => h.includes('place') || h.includes('city') || h.includes('village') || h.includes('स्थान') || h.includes('जिला'));

    if (nameIdx === -1) nameIdx = 0;
    if (mobileIdx === -1) mobileIdx = 1;
    if (placeIdx === -1) placeIdx = 2;

    const rawContacts = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''));
      const name = row[nameIdx] || 'Unknown Contact';
      const rawTel = row[mobileIdx] || '';
      const place = row[placeIdx] || '';

      if (rawTel) {
        rawContacts.push({ name, tel: rawTel, place });
      }
    }

    processRawPhonebookContacts(rawContacts, 'csv');
  }

  // ==========================================
  // 5. PREVIEW & CONFIRM MODAL
  // ==========================================

  function showImportPreviewModal(validList, totalFound, dupCount, invCount, source) {
    pendingImportList = validList;

    const modal = document.getElementById('ucas-modal-import-preview');
    const summaryEl = document.getElementById('ucas-import-preview-summary');
    const tableBody = document.getElementById('ucas-import-preview-table-body');
    const confirmBtn = document.getElementById('ucas-import-confirm-btn');

    if (!modal || !summaryEl || !tableBody) return;

    summaryEl.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;margin-bottom:14px;text-align:center;">
        <div style="background:#F1F5F9;padding:10px;border-radius:8px;border:1px solid #E2E8F0;">
          <div style="font-size:1.45rem;font-weight:800;color:var(--text-main);">${totalFound}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">📇 कुल मिले (Total)</div>
        </div>
        <div style="background:#DCFCE7;padding:10px;border-radius:8px;border:1px solid #BBF7D0;">
          <div style="font-size:1.45rem;font-weight:800;color:#15803D;">${validList.length}</div>
          <div style="font-size:0.75rem;color:#15803D;font-weight:700;">✅ नए Contacts (New)</div>
        </div>
        <div style="background:#FEF3C7;padding:10px;border-radius:8px;border:1px solid #FDE68A;">
          <div style="font-size:1.45rem;font-weight:800;color:#B45309;">${dupCount}</div>
          <div style="font-size:0.75rem;color:#B45309;font-weight:600;">♻️ पहले से मौजूद (Duplicate)</div>
        </div>
        <div style="background:#FEE2E2;padding:10px;border-radius:8px;border:1px solid #FECACA;">
          <div style="font-size:1.45rem;font-weight:800;color:#B91C1C;">${invCount}</div>
          <div style="font-size:0.75rem;color:#B91C1C;font-weight:600;">⚠️ अमान्य नंबर (Invalid)</div>
        </div>
      </div>
    `;

    if (validList.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--danger);font-weight:600;">इम्पोर्ट के लिए कोई नया वैध संपर्क नहीं मिला।</td></tr>`;
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = 'कोई नया संपर्क नहीं मिला';
      }
    } else {
      const previewRows = validList.slice(0, 20);
      tableBody.innerHTML = previewRows.map((c, i) => `
        <tr>
          <td><strong>#${i + 1}</strong></td>
          <td><strong>${c.name}</strong></td>
          <td><code>${c.mobile}</code></td>
        </tr>
      `).join('');

      if (validList.length > 20) {
        tableBody.innerHTML += `
          <tr>
            <td colspan="3" style="text-align:center;color:var(--text-muted);font-size:0.8rem;padding:8px;background:#F8FAFC;">
              ... और <strong>${validList.length - 20}</strong> अन्य संपर्क
            </td>
          </tr>
        `;
      }

      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> ${validList.length} Contacts Import करें`;
      }
    }

    modal.classList.add('active');
  }

  async function confirmPendingImport() {
    if (pendingImportList.length === 0) return;

    const confirmBtn = document.getElementById('ucas-import-confirm-btn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सुरक्षित रूप से इम्पोर्ट हो रहा है...';
    }

    try {
      const res = await window.UCAS_DB.bulkAddPhonebookContacts(pendingImportList);
      if (res.success) {
        const count = res.count || pendingImportList.length;
        window.UCAS_APP.showToast(`🎉 ${count} Contacts सफलतापूर्वक Import हुए!`, 'success');
        
        window.UCAS_APP.closeModal('ucas-modal-import-preview');
        window.UCAS_APP.closeModal('ucas-modal-import-phonebook');
        window.UCAS_APP.closeModal('ucas-modal-import-csv');
        
        pendingImportList = [];
        await loadPhonebook();

        if (window.UCAS_APP && window.UCAS_APP.refreshDashboardKPIs) {
          window.UCAS_APP.refreshDashboardKPIs();
        }
      } else {
        window.UCAS_APP.showToast('इम्पोर्ट में त्रुटि: ' + (res.message || ''), 'error');
      }
    } catch (e) {
      console.error('Import error:', e);
      window.UCAS_APP.showToast('इम्पोर्ट कनेक्शन में त्रुटि हुई।', 'error');
    } finally {
      if (confirmBtn) {
        confirmBtn.disabled = false;
      }
    }
  }

  // ==========================================
  // 6. MANUAL CONTACT ADD
  // ==========================================

  async function handleManualAdd() {
    if (!window.UCAS_PERMISSIONS.hasPermission('phonebook_import')) {
      window.UCAS_APP.showToast('आपको संपर्क जोड़ने की अनुमति नहीं है।', 'error');
      return;
    }

    const name = (document.getElementById('pb_add_name')?.value || '').trim();
    const rawMobile = (document.getElementById('pb_add_mobile')?.value || '').trim();
    const place = (document.getElementById('pb_add_place')?.value || '').trim();

    if (!name) {
      window.UCAS_APP.showToast('कृपया संपर्क का नाम दर्ज करें।', 'error');
      return;
    }

    const cleanMobile = normalizeIndianMobile(rawMobile);
    if (!cleanMobile) {
      window.UCAS_APP.showToast('कृपया सही 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।', 'error');
      return;
    }

    // Duplicate Check
    const exists = contactsList.some(c => c.mobile === cleanMobile);
    if (exists) {
      window.UCAS_APP.showToast('यह मोबाइल नंबर पहले से आपकी फोनबुक में मौजूद है।', 'warning');
      return;
    }

    const profileId = window.UCAS_SESSION.getUserId();
    const payload = {
      profile_id: profileId,
      name,
      mobile: cleanMobile,
      place,
      source: 'manual'
    };

    const res = await window.UCAS_DB.addPhonebookContact(payload);
    if (res.success) {
      window.UCAS_APP.showToast('✅ संपर्क सफलतापूर्वक जोड़ा गया!', 'success');
      document.getElementById('ucas-phonebook-manual-form')?.reset();
      window.UCAS_APP.closeModal('ucas-modal-add-contact');
      await loadPhonebook();
      if (window.UCAS_APP && window.UCAS_APP.refreshDashboardKPIs) {
        window.UCAS_APP.refreshDashboardKPIs();
      }
    } else {
      window.UCAS_APP.showToast('संपर्क जोड़ने में त्रुटि: ' + (res.message || ''), 'error');
    }
  }

  function searchPhonebook(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderContactsTable(contactsList);
      return;
    }
    const filtered = contactsList.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q)) ||
      (c.place && c.place.toLowerCase().includes(q)) ||
      (c.source && c.source.toLowerCase().includes(q))
    );
    renderContactsTable(filtered);
  }

  window.UCAS_PHONEBOOK = {
    init: initPhonebookModule,
    loadPhonebook,
    startNativeContactImport,
    openVcfModal,
    confirmPendingImport,
    searchPhonebook,
    normalizeIndianMobile,
    getContactsList: () => contactsList
  };

  console.log('✅ UCAS Phonebook Engine (Native Contact Picker + VCF Fallback) Ready.');
})(window);
