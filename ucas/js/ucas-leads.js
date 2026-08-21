/* ==========================================================================
   UCAS MY SHARE LEADS ENGINE
   Follow-up & pipeline management:
   Statuses: New, Contacted, Interested, Follow-up, Converted, Not Interested,
             Wrong Number, Not Relevant
   Actions: Direct Call, WhatsApp, SMS, Feedback Notes
   ========================================================================== */

(function (window) {
  'use strict';

  let leadsList = [];
  let currentActiveLeadId = null;

  const LEAD_STATUSES = [
    { key: 'new', label: 'New', color: 'status-new' },
    { key: 'contacted', label: 'Contacted', color: 'status-contacted' },
    { key: 'interested', label: 'Interested', color: 'status-interested' },
    { key: 'followup', label: 'Follow-up', color: 'status-followup' },
    { key: 'converted', label: 'Converted', color: 'status-converted' },
    { key: 'notinterested', label: 'Not Interested', color: 'status-notinterested' },
    { key: 'wrongnumber', label: 'Wrong Number', color: 'status-wrongnumber' },
    { key: 'notrelevant', label: 'Not Relevant', color: 'status-notrelevant' }
  ];

  function initLeadsModule() {
    bindLeadEvents();
    loadLeads();
  }

  function bindLeadEvents() {
    const filterSelect = document.getElementById('ucas-leads-status-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        filterLeadsByStatus(e.target.value);
      });
    }

    const feedbackForm = document.getElementById('ucas-lead-feedback-form');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveLeadFeedback();
      });
    }
  }

  async function loadLeads() {
    const profileId = window.UCAS_SESSION.getUserId();
    if (!profileId) {
      renderLeadsList([]);
      return [];
    }

    let surveys = [];
    let phonebook = [];

    // Directly query database to ensure always fresh and synchronous
    try {
      const [surveysRes, phonebookRes] = await Promise.all([
        window.UCAS_DB.getSurveys(profileId),
        window.UCAS_DB.getPhonebook(profileId)
      ]);
      surveys = surveysRes.data || [];
      phonebook = phonebookRes.data || [];
    } catch (e) {
      console.warn('Direct DB fetch in leads failed, falling back to module stores', e);
      surveys = window.UCAS_SURVEY ? window.UCAS_SURVEY.getSurveysList() : [];
      phonebook = window.UCAS_PHONEBOOK ? window.UCAS_PHONEBOOK.getContactsList() : [];
    }

    // Stored lead metadata (status + feedback notes) in local lead tracking store
    const leadMetaStore = JSON.parse(localStorage.getItem(`UCAS_LEAD_META_${profileId}`) || '{}');

    const combinedMap = new Map();

    // 1. Ingest surveys as rich leads
    surveys.forEach(s => {
      if (!s || !s.mobile) return;
      const id = 'survey_' + s.id;
      const meta = leadMetaStore[id] || {};
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || 'General');
      
      combinedMap.set(s.mobile, {
        id,
        rawId: s.id,
        name: s.name || 'Survey Contact',
        mobile: s.mobile,
        category: cats,
        place: s.village || s.district || s.state || '',
        source: 'Survey Form',
        status: meta.status || (s.category_answers?.status || 'new'),
        notes: meta.notes || '',
        lastActivity: meta.lastActivity || s.created_at,
        created_at: s.created_at
      });
    });

    // 2. Ingest phonebook contacts as leads if not already present
    phonebook.forEach(p => {
      if (!p || !p.mobile) return;
      if (!combinedMap.has(p.mobile)) {
        const id = 'pb_' + p.id;
        const meta = leadMetaStore[id] || {};
        combinedMap.set(p.mobile, {
          id,
          rawId: p.id,
          name: p.name || 'Phonebook Contact',
          mobile: p.mobile,
          category: 'Phonebook Contact',
          place: p.place || '',
          source: p.source === 'csv' ? 'CSV Import' : (p.source === 'phonebook' ? 'Phonebook' : 'Manual'),
          status: meta.status || 'new',
          notes: meta.notes || '',
          lastActivity: meta.lastActivity || p.created_at,
          created_at: p.created_at
        });
      }
    });

    leadsList = Array.from(combinedMap.values());
    renderLeadsList(leadsList);
    updateLeadsStats();
    return leadsList;
  }

  function updateLeadsStats() {
    const totalEl = document.getElementById('ucas-leads-total-count');
    const interestedEl = document.getElementById('ucas-leads-interested-count');
    const convertedEl = document.getElementById('ucas-leads-converted-count');

    const interestedCount = leadsList.filter(l => l.status === 'interested' || l.status === 'followup').length;
    const convertedCount = leadsList.filter(l => l.status === 'converted').length;

    if (totalEl) totalEl.textContent = leadsList.length;
    if (interestedEl) interestedEl.textContent = interestedCount;
    if (convertedEl) convertedEl.textContent = convertedCount;
  }

  function renderLeadsList(list) {
    const container = document.getElementById('ucas-leads-container');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2.5rem;background:#fff;border-radius:var(--radius-lg);border:1px solid var(--border);color:var(--text-muted);">
          <i class="fa-solid fa-user-group" style="font-size:2.2rem;color:var(--text-subtle);margin-bottom:8px;display:block;"></i>
          <p style="font-weight:700;font-size:1rem;color:var(--text-main);">कोई लीड उपलब्ध नहीं है</p>
          <p style="font-size:0.84rem;margin-top:4px;color:var(--text-muted);">
            सर्वे फॉर्म भरने या फोनबुक में संपर्क जोड़ने पर सभी लीड्स यहाँ ऑटोमैटिकली दिखाई देंगी।
          </p>
          <div style="margin-top:1rem;display:flex;justify-content:center;gap:8px;">
            <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="UCAS_APP.switchView('survey')">
              <i class="fa-solid fa-clipboard-list"></i> नया सर्वे भरें
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-secondary" onclick="UCAS_APP.switchView('phonebook')">
              <i class="fa-solid fa-address-book"></i> फोनबुक खोलें
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(lead => {
      const statusObj = LEAD_STATUSES.find(s => s.key === lead.status) || LEAD_STATUSES[0];
      const dateStr = lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString('hi-IN') : '-';

      return `
        <div class="ucas-lead-card">
          <div class="ucas-lead-header">
            <div>
              <div class="ucas-lead-name">${lead.name}</div>
              <div class="ucas-lead-meta">
                <span>📱 <code>${lead.mobile}</code></span>
                ${lead.place ? `<span>📍 ${lead.place}</span>` : ''}
                <span>🏷️ ${lead.category}</span>
                <span>📥 ${lead.source}</span>
              </div>
            </div>
            <span class="ucas-status-badge ${statusObj.color}">
              ● ${statusObj.label}
            </span>
          </div>

          ${lead.notes ? `
            <div style="background:#F8FAFC;padding:8px 12px;border-radius:var(--radius-sm);font-size:0.8rem;border-left:3px solid var(--secondary);">
              <strong>नोट:</strong> ${lead.notes}
            </div>
          ` : ''}

          <div class="ucas-lead-actions">
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LEADS.callLead('${lead.mobile}')" title="Call">
              <i class="fa-solid fa-phone" style="color:var(--primary);"></i> Call
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_LEADS.whatsappLead('${lead.mobile}', '${escapeHtml(lead.name)}')" title="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LEADS.smsLead('${lead.mobile}')" title="SMS">
              <i class="fa-solid fa-comment-sms" style="color:var(--accent-blue);"></i> SMS
            </button>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LEADS.openFeedbackModal('${lead.id}')" title="Update Status">
              <i class="fa-solid fa-pen-to-square" style="color:var(--secondary-dark);"></i> Status / Note
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterLeadsByStatus(statusKey) {
    if (statusKey === 'all') {
      renderLeadsList(leadsList);
    } else {
      const filtered = leadsList.filter(l => l.status === statusKey);
      renderLeadsList(filtered);
    }
  }

  function searchLeads(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderLeadsList(leadsList);
      return;
    }
    const filtered = leadsList.filter(l => 
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.mobile && l.mobile.includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q)) ||
      (l.place && l.place.toLowerCase().includes(q))
    );
    renderLeadsList(filtered);
  }

  // ==========================================
  // LEAD ACTIONS (CALL, WHATSAPP, SMS, FEEDBACK)
  // ==========================================

  function callLead(mobile) {
    if (!window.UCAS_PERMISSIONS.hasPermission('call')) {
      window.UCAS_APP.showToast('कॉल करने की अनुमति नहीं है।', 'error');
      return;
    }
    window.location.href = `tel:${mobile}`;
  }

  function whatsappLead(mobile, name) {
    if (!window.UCAS_PERMISSIONS.hasPermission('whatsapp')) {
      window.UCAS_APP.showToast('व्हाट्सएप संदेश की अनुमति नहीं है।', 'error');
      return;
    }
    const shareId = window.UCAS_SESSION.getShareId();
    const myName = window.UCAS_SESSION.getName();
    const cleanMobile = mobile.replace(/\D/g, '');
    const intlMobile = cleanMobile.startsWith('91') ? cleanMobile : '91' + cleanMobile;

    const msg = `नमस्ते ${name} जी! 🙏\n\nमैं ${myName} (Aarogyam India) से बात कर रहा हूँ। क्या आप कृषि/स्वास्थ्य की संपूर्ण जानकारी प्राप्त करना चाहते हैं?\n\nअधिक जानकारी के लिए क्लिक करें: https://aarogyamindia.online/?share=${shareId}`;
    
    window.open(`https://wa.me/${intlMobile}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function smsLead(mobile) {
    if (!window.UCAS_PERMISSIONS.hasPermission('message')) {
      window.UCAS_APP.showToast('SMS भेजने की अनुमति नहीं है।', 'error');
      return;
    }
    window.location.href = `sms:${mobile}`;
  }

  function openFeedbackModal(leadId) {
    currentActiveLeadId = leadId;
    const lead = leadsList.find(l => l.id === leadId);
    if (!lead) return;

    const nameEl = document.getElementById('feedback_lead_name');
    const statusSelect = document.getElementById('feedback_status');
    const notesTextarea = document.getElementById('feedback_notes');

    if (nameEl) nameEl.textContent = `${lead.name} (${lead.mobile})`;
    if (statusSelect) statusSelect.value = lead.status || 'new';
    if (notesTextarea) notesTextarea.value = lead.notes || '';

    window.UCAS_APP.openModal('ucas-modal-lead-feedback');
  }

  async function saveLeadFeedback() {
    if (!currentActiveLeadId) return;

    const profileId = window.UCAS_SESSION.getUserId();
    const status = document.getElementById('feedback_status')?.value || 'new';
    const notes = (document.getElementById('feedback_notes')?.value || '').trim();

    const leadMetaStore = JSON.parse(localStorage.getItem(`UCAS_LEAD_META_${profileId}`) || '{}');
    leadMetaStore[currentActiveLeadId] = {
      status,
      notes,
      lastActivity: new Date().toISOString()
    };

    localStorage.setItem(`UCAS_LEAD_META_${profileId}`, JSON.stringify(leadMetaStore));

    // Update in-memory lead
    const lead = leadsList.find(l => l.id === currentActiveLeadId);
    if (lead) {
      lead.status = status;
      lead.notes = notes;
      lead.lastActivity = new Date().toISOString();
    }

    window.UCAS_APP.showToast('✅ लीड स्थिति सफलतापूर्वक अपडेट हुई!', 'success');
    window.UCAS_APP.closeModal('ucas-modal-lead-feedback');
    
    renderLeadsList(leadsList);
    updateLeadsStats();
    if (window.UCAS_APP && window.UCAS_APP.refreshDashboardKPIs) {
      window.UCAS_APP.refreshDashboardKPIs();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  window.UCAS_LEADS = {
    init: initLeadsModule,
    loadLeads,
    callLead,
    whatsappLead,
    smsLead,
    openFeedbackModal,
    saveLeadFeedback,
    filterLeadsByStatus,
    searchLeads
  };

  console.log('✅ UCAS My Share Leads Engine Ready.');
})(window);
