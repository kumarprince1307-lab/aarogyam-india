/* ==========================================================================
   UCAS MARKETING ENGINE
   Core Customer Acquisition Workflow: SEARCH → FILTER → SEND
   - Landing Page Catalog
   - Compact Area & Category-wise Filtering
   - Real-Time Matching Counter
   - Message Builder with Placeholder Personalization ({name}, {place}, {link}, {my_name})
   - Clickable Call & WhatsApp Actions on every Recipient
   - Existing Share Engine & Share ID Integration
   - 1-Click Official Deep Links (WhatsApp, Native Share, Facebook, Telegram)
   ========================================================================== */

(function (window) {
  'use strict';

  const LANDING_PAGES = [
    {
      id: 'kharif_guide',
      title: '🌾 खरीफ मास्टर गाइड 2026',
      category: 'agriculture',
      path: '/ebooks/kharif-master-guide-2026.html',
      badge: 'Bestseller',
      defaultHook: 'फसल की पैदावार 30% तक बढ़ाएं और कीटनाशक का खर्च आधा करें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप इस सीजन में अपनी फसल (सोयाबीन/मक्का/धान) से अधिकतम उत्पादन लेना चाहते हैं?\n\nAarogyam India की प्रामाणिक "खरीफ मास्टर गाइड 2026" ई-बुक अब उपलब्ध है।\n\n👉 अभी गाइड पढ़ें:\n{link}\n\nधन्यवाद,\n{my_name}'
    },
    {
      id: 'kheti_dr',
      title: '👨‍⚕️ खेती डॉक्टर — सम्पूर्ण फसल सुरक्षा',
      category: 'agriculture',
      path: '/ebooks/kheti-dr.html',
      badge: 'Popular',
      defaultHook: 'फसल में लगने वाले हर कीट व रोग का सटीक और प्राकृतिक समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nफसलों में कीट, इल्ली व पीलापन की समस्या से परेशान हैं? "खेती डॉक्टर" से पाएं वैज्ञानिक व जैविक समाधान।\n\n👉 यहाँ देखें सम्पूर्ण जानकारी:\n{link}\n\nसम्पर्क: {my_name}'
    },
    {
      id: 'health_ayurveda',
      title: '❤️ सम्पूर्ण स्वास्थ्य एवं आयुर्वेद समाधान',
      category: 'healthcare',
      path: '/ebooks/health.html',
      badge: 'Wellness',
      defaultHook: 'डायबिटीज, बीपी और जोड़ों के दर्द का सुरक्षित व प्राकृतिक उपचार!',
      defaultMsg: 'नमस्ते {name} जी,\n\nस्वस्थ और रोगमुक्त जीवन के लिए Aarogyam India का विशेष स्वास्थ्य परामर्श और आयुर्वेदिक ई-बुक गाइड देखें।\n\n👉 अपनी हेल्थ गाइड अभी पढ़ें:\n{link}\n\nशुभकामनाएं,\n{my_name}'
    },
    {
      id: 'netsurf_biz',
      title: '💼 NetSurf बिजनेस एवं साइड इनकम अवसर',
      category: 'netsurf',
      path: '/ebooks/netsurf.html',
      badge: 'Income Opportunity',
      defaultHook: 'घर बैठे पार्ट-टाइम काम करके ₹25,000 - ₹50,000 महीना कमाएं!',
      defaultMsg: 'नमस्ते {name} जी,\n\nक्या आप बिना किसी बड़े निवेश के अपने खाली समय में एक बेहतरीन साइड इनकम शुरू करना चाहते हैं?\n\nNetSurf एवं Aarogyam India के साथ आत्मनिर्भर बिजनेस की शुरुआत करें।\n\n👉 पूरा बिजनेस प्लान यहाँ देखें:\n{link}\n\nसादर,\n{my_name}'
    },
    {
      id: 'free_registration',
      title: '📚 फ्री रजिस्ट्रेशन एवं डिजिटल लाइब्रेरी',
      category: 'other',
      path: '/registration.html',
      badge: 'Free Access',
      defaultHook: 'Aarogyam India पर फ्री अकाउंट बनाएं और सभी डेमो बुक्स तुरंत पढ़ें!',
      defaultMsg: 'नमस्ते {name} जी,\n\nAarogyam India डिजिटल लाइब्रेरी में आपका स्वागत है। नीचे दिए गए लिंक से फ्री में रजिस्टर करें और डेमो बुक्स का लाभ उठाएं।\n\n👉 फ्री साइन-अप लिंक:\n{link}\n\nधन्यवाद,\n{my_name}'
    },
    {
      id: 'main_home',
      title: '🏡 Aarogyam India मुख्य पोर्टल',
      category: 'other',
      path: '/index.html',
      badge: 'Official',
      defaultHook: 'कृषि, स्वास्थ्य और प्राकृतिक जीवनशैली का संपूर्ण समाधान!',
      defaultMsg: 'नमस्ते {name} जी,\n\nAarogyam India के आधिकारिक पोर्टल पर आपका स्वागत है।\n\n👉 विजिट करें:\n{link}\n\n{my_name}'
    }
  ];

  let selectedLandingPage = LANDING_PAGES[0];
  let allRecipientsList = [];
  let filteredContacts = [];

  function initMarketingModule() {
    renderLandingPageCards();
    bindMarketingEvents();
    updateMarketingEngine();
    if (window.UCAS_LANDING_BUILDER) {
      window.UCAS_LANDING_BUILDER.init();
    }
  }

  function renderLandingPageCards() {
    const container = document.getElementById('ucas-marketing-landing-pages');
    if (!container) return;

    container.innerHTML = LANDING_PAGES.map(lp => {
      const isSelected = selectedLandingPage.id === lp.id;
      return `
        <div class="ucas-card ${isSelected ? 'selected' : ''}" style="cursor:pointer;border-width:2px;${isSelected ? 'border-color:var(--primary);background:var(--primary-subtle);' : ''}" onclick="UCAS_MARKETING.selectLandingPage('${lp.id}')">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div style="font-weight:700;font-size:0.95rem;color:var(--text-main);">${lp.title}</div>
            <span style="font-size:0.7rem;background:var(--secondary-subtle);color:var(--secondary-dark);padding:2px 6px;border-radius:4px;font-weight:700;">${lp.badge}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${lp.defaultHook}</div>
        </div>
      `;
    }).join('');
  }

  function selectLandingPage(lpId) {
    const found = LANDING_PAGES.find(p => p.id === lpId);
    if (!found) return;
    selectedLandingPage = found;
    renderLandingPageCards();

    // Auto-set default message
    const msgTextarea = document.getElementById('ucas-marketing-message-box');
    if (msgTextarea) {
      msgTextarea.value = selectedLandingPage.defaultMsg;
    }

    updateMarketingEngine();
  }

  function bindMarketingEvents() {
    const areaFilter = document.getElementById('mkt_filter_compact_area');
    const catFilter = document.getElementById('mkt_filter_compact_category');
    const msgTextarea = document.getElementById('ucas-marketing-message-box');

    const updateTrigger = () => filterTargetAudience();

    areaFilter?.addEventListener('change', updateTrigger);
    catFilter?.addEventListener('change', updateTrigger);
    msgTextarea?.addEventListener('input', updateLiveMessagePreview);
  }

  async function updateMarketingEngine() {
    await populateRecipientsAndFilterOptions();
    filterTargetAudience();
    updateReferralLink();
    updateLiveMessagePreview();
  }

  function normalizeIndianMobile(rawTel) {
    if (!rawTel) return null;
    let digits = String(rawTel).replace(/\D/g, '').trim();
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    else if (digits.length === 13 && digits.startsWith('091')) digits = digits.slice(3);
    else if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4);
    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return digits;
    return null;
  }

  // ==========================================
  // COMPACT FILTER & RECIPIENT INGESTION
  // ==========================================

  async function populateRecipientsAndFilterOptions() {
    const profileId = window.UCAS_SESSION.getUserId();
    let surveys = [];
    let phonebook = [];

    try {
      const [surveysRes, phonebookRes] = await Promise.all([
        window.UCAS_DB.getSurveys(profileId),
        window.UCAS_DB.getPhonebook(profileId)
      ]);
      surveys = surveysRes.data || [];
      phonebook = phonebookRes.data || [];
    } catch (e) {
      surveys = window.UCAS_SURVEY ? window.UCAS_SURVEY.getSurveysList() : [];
      phonebook = window.UCAS_PHONEBOOK ? window.UCAS_PHONEBOOK.getContactsList() : [];
    }

    const combined = [];
    const seenMobiles = new Set();
    const uniqueAreas = new Set();

    // 1. Ingest Surveys
    surveys.forEach(s => {
      if (!s || !s.mobile || seenMobiles.has(s.mobile)) return;
      seenMobiles.add(s.mobile);

      const cats = Array.isArray(s.selected_categories) ? s.selected_categories : [s.selected_categories || 'General'];
      const area = (s.village || s.district || s.state || '').trim();
      if (area) uniqueAreas.add(area);

      combined.push({
        name: s.name || 'Survey Contact',
        mobile: s.mobile,
        place: area,
        categories: cats,
        categoryDisplay: cats.join(', '),
        source: 'Survey'
      });
    });

    // 2. Ingest Phonebook
    phonebook.forEach(p => {
      if (!p || !p.mobile || seenMobiles.has(p.mobile)) return;
      seenMobiles.add(p.mobile);

      const area = (p.place || '').trim();
      if (area) uniqueAreas.add(area);

      combined.push({
        name: p.name || 'Phonebook Contact',
        mobile: p.mobile,
        place: area,
        categories: ['phonebook'],
        categoryDisplay: 'Phonebook',
        source: p.source || 'Phonebook'
      });
    });

    allRecipientsList = combined;

    // Populate Area dropdown
    const areaSelect = document.getElementById('mkt_filter_compact_area');
    if (areaSelect) {
      const currentArea = areaSelect.value || 'all';
      const sortedAreas = Array.from(uniqueAreas).sort();
      areaSelect.innerHTML = `<option value="all">📍 सभी स्थान (All Areas)</option>` +
        sortedAreas.map(a => `<option value="${escapeHtml(a.toLowerCase())}">${escapeHtml(a)}</option>`).join('');
      areaSelect.value = currentArea;
    }
  }

  function filterTargetAudience() {
    const areaVal = (document.getElementById('mkt_filter_compact_area')?.value || 'all').toLowerCase();
    const catVal = (document.getElementById('mkt_filter_compact_category')?.value || 'all').toLowerCase();

    filteredContacts = allRecipientsList.filter(contact => {
      // 1. Area Match
      let matchArea = true;
      if (areaVal !== 'all') {
        matchArea = (contact.place || '').toLowerCase().includes(areaVal);
      }

      // 2. Category Match
      let matchCat = true;
      if (catVal !== 'all') {
        matchCat = contact.categories.some(c => c && c.toLowerCase().includes(catVal));
      }

      return matchArea && matchCat;
    });

    renderFilteredRecipients(filteredContacts);
    updateLiveMessagePreview();
  }

  function renderFilteredRecipients(list) {
    const counterEl = document.getElementById('ucas-marketing-match-counter');
    const container = document.getElementById('ucas-marketing-recipients-list');

    if (counterEl) {
      counterEl.textContent = `🎯 ${list.length} Matching Contacts Found`;
    }

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.85rem;">
          कोई मेल खाने वाला संपर्क नहीं मिला। कृपया ऊपर से फ़िल्टर बदलें।
        </div>
      `;
      return;
    }

    const previewList = list.slice(0, 25);
    container.innerHTML = previewList.map((contact, idx) => {
      const cleanMob = normalizeIndianMobile(contact.mobile);
      const callLink = cleanMob ? `tel:${cleanMob}` : '#';

      return `
        <div class="ucas-recipient-item">
          <div>
            <div style="font-weight:700;font-size:0.92rem;color:var(--text-main);">${contact.name}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;gap:8px;margin-top:2px;flex-wrap:wrap;">
              <a href="${callLink}" style="color:var(--primary-dark);font-weight:700;text-decoration:none;display:inline-flex;align-items:center;gap:3px;" title="कॉल करें">
                <i class="fa-solid fa-phone" style="color:var(--primary);"></i> <code>${contact.mobile}</code>
              </a>
              ${contact.place ? `<span>• 📍 ${contact.place}</span>` : ''}
              <span>• 🏷️ ${contact.categoryDisplay}</span>
            </div>
          </div>
          <div class="ucas-recipient-actions">
            <a href="${callLink}" class="ucas-btn ucas-btn-sm ucas-btn-outline" style="padding:5px 12px;" title="कॉल करें">
              <i class="fa-solid fa-phone" style="color:var(--primary);"></i> Call
            </a>
            <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_MARKETING.sendToOne('${contact.mobile}', '${encodeURIComponent(contact.name)}', '${encodeURIComponent(contact.place)}')" title="व्यक्तिगत WhatsApp भेजें" style="padding:5px 12px;">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp भेजें
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (list.length > 25) {
      container.innerHTML += `
        <div style="text-align:center;font-size:0.8rem;color:var(--text-muted);padding:8px;background:#F1F5F9;border-radius:var(--radius-md);">
          ... और कुल <strong>${list.length}</strong> में से शेष संपर्क
        </div>
      `;
    }
  }

  // ==========================================
  // REFERRAL LINK BUILDER (Existing Share Engine)
  // ==========================================

  function getGeneratedReferralLink() {
    const origin = window.location.origin || 'https://aarogyamindia.in';
    const shareId = window.UCAS_SESSION.getShareId();
    const landingPath = selectedLandingPage.path;
    const url = new URL(landingPath, origin);
    url.searchParams.set('share_id', shareId);
    url.searchParams.set('src', `ucas_mkt:${selectedLandingPage.id}`);
    return url.toString();
  }

  function updateReferralLink() {
    const linkInput = document.getElementById('ucas-marketing-referral-link');
    if (linkInput) {
      linkInput.value = getGeneratedReferralLink();
    }
  }

  function copyReferralLink() {
    const link = getGeneratedReferralLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        window.UCAS_APP.showToast('✅ रेफरल लिंक कॉपी हो गया!', 'success');
      });
    } else {
      window.UCAS_APP.showToast('लिंक: ' + link, 'info');
    }
  }

  // ==========================================
  // MESSAGE BUILDER & LIVE PREVIEW
  // ==========================================

  function buildPersonalizedMessage(name = '{name}', place = '{place}') {
    const rawTemplate = document.getElementById('ucas-marketing-message-box')?.value || selectedLandingPage.defaultMsg;
    const shareLink = getGeneratedReferralLink();
    const myName = window.UCAS_SESSION.getName();

    let msg = rawTemplate
      .replace(/{name}/g, name)
      .replace(/{place}/g, place)
      .replace(/{link}/g, shareLink)
      .replace(/{my_name}/g, myName)
      .replace(/{category}/g, selectedLandingPage.title);

    return msg;
  }

  function updateLiveMessagePreview() {
    const previewBox = document.getElementById('ucas-marketing-preview-bubble');
    if (!previewBox) return;

    const sampleContact = filteredContacts[0] || { name: 'राजेश पटेल', place: 'रीवा' };
    const personalized = buildPersonalizedMessage(sampleContact.name, sampleContact.place);

    previewBox.innerHTML = personalized.replace(/\n/g, '<br>');
  }

  // ==========================================
  // SEND & SHARE ACTIONS
  // ==========================================

  function sendToOne(rawMobile, encodedName, encodedPlace) {
    const cleanMobile = normalizeIndianMobile(rawMobile);
    if (!cleanMobile) {
      window.UCAS_APP.showToast('अमान्य मोबाइल नंबर।', 'error');
      return;
    }

    const name = decodeURIComponent(encodedName);
    const place = decodeURIComponent(encodedPlace);
    const msg = buildPersonalizedMessage(name, place);

    // Track attribution event via existing engine
    if (typeof trackAttributionEvent === 'function') {
      trackAttributionEvent({
        event_type: 'share',
        share_channel: 'whatsapp_marketing',
        asset_id: selectedLandingPage.path,
        asset_title: selectedLandingPage.title
      });
    }

    window.open(`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  function shareNative() {
    const link = getGeneratedReferralLink();
    const text = buildPersonalizedMessage('साथी', '');

    if (navigator.share) {
      navigator.share({
        title: selectedLandingPage.title,
        text: text,
        url: link
      }).catch(err => console.log('Native share closed', err));
    } else {
      copyReferralLink();
    }
  }

  function shareWhatsAppBroadcast() {
    const text = buildPersonalizedMessage('साथी', '');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareFacebook() {
    const link = getGeneratedReferralLink();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
  }

  function shareTelegram() {
    const link = getGeneratedReferralLink();
    const text = buildPersonalizedMessage('साथी', '');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  window.UCAS_MARKETING = {
    init: initMarketingModule,
    selectLandingPage,
    updateMarketingEngine,
    sendToOne,
    shareNative,
    shareWhatsAppBroadcast,
    shareFacebook,
    shareTelegram,
    copyReferralLink
  };

  console.log('✅ UCAS Marketing Engine (Compact Area/Category Filter + Direct Actions) Ready.');
})(window);
