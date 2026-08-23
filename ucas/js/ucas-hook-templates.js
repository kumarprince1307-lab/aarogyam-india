/* ==========================================================================
   UCAS HOOK TEMPLATES & SHAYARI ENGINE
   Handles:
   - Categorized High-Converting Marketing Hooks & Shayari Library
   - Dynamic Categories loaded from Admin Configuration
   - Custom Hook & Shayari Creation (Title, Category, Content/Description)
   - 1-Click Actions: Copy to Clipboard, WhatsApp Share, Insert to Marketing Engine
   ========================================================================== */

(function (window) {
  'use strict';

  const DEFAULT_CATEGORIES = [
    { id: 'agriculture', name: '🌾 Agriculture (कृषि)' },
    { id: 'healthcare', name: '❤️ Healthcare (स्वास्थ्य)' },
    { id: 'motivation', name: '🔥 Motivation (प्रेरणा)' },
    { id: 'business', name: '💼 Business (व्यापार)' },
    { id: 'shayari', name: '🎭 Shayari (शायरी संग्रह)' },
    { id: 'festivals', name: '🌺 Festivals (त्यौहार)' }
  ];

  const DEFAULT_HOOK_TEMPLATES = [
    // 🌾 1. Agriculture
    {
      id: 'hk_agri_01',
      category: 'agriculture',
      type: 'hook',
      title: 'फसल की पैदावार 30% तक बढ़ाएं',
      content: '🌾 क्या आपकी फसल में पीलापन या इल्ली की समस्या है?\n\nरासायनिक दवाओं का भारी खर्च बंद करें और जैविक तकनीक से फसल की पैदावार 30% तक बढ़ाएं।\n\n👉 अभी पूरी जानकारी देखें और छोटा सर्वे भरें:\n{link}\n\n- {my_name}',
      isDefault: true
    },
    {
      id: 'hk_agri_02',
      category: 'agriculture',
      type: 'shayari',
      title: 'किसान की मेहनत और मिट्टी की खुशबू (शायरी)',
      content: '🌱 पसीने की हर बूंद से जो सींचता है धरा को,\nवही अन्नदाता भरता है हर घर के थाल को।\n\nआइए मिलकर बनाएं अपनी खेती को समृद्ध और प्राकृतिक।\n\n👉 विशेष जैविक कृषि गाइड यहाँ पढ़ें:\n{link}\n\nजय जवान, जय किसान! 🚜',
      isDefault: true
    },
    // ❤️ 2. Healthcare
    {
      id: 'hk_health_01',
      category: 'healthcare',
      type: 'hook',
      title: 'डायबिटीज व जोड़ों के दर्द का सुरक्षित समाधान',
      content: '❤️ क्या आप या आपके परिवार में कोई जोड़ों के दर्द, गैस, बीपी या डायबिटीज से परेशान है?\n\nआयुर्वेद के प्राकृतिक और असरदार उपायों से पाएं स्थाई राहत।\n\n👉 स्वास्थ्य परामर्श और ई-बुक गाइड यहाँ पढ़ें:\n{link}\n\nशुभकामनाएं - {my_name}',
      isDefault: true
    },
    {
      id: 'hk_health_02',
      category: 'healthcare',
      type: 'shayari',
      title: 'स्वस्थ जीवन की अनमोल शायरी',
      content: '🌿 पहला सुख निरोगी काया, दूजा सुख घर में हो माया।\nस्वास्थ्य ही सबसे बड़ा धन है, इसे संवारना हर इंसान का धर्म है।\n\nआयुर्वेद अपनाएं, स्वस्थ व दीर्घायु जीवन पाएं।\n👉 सम्पूर्ण स्वास्थ्य समाधान यहाँ देखें:\n{link}',
      isDefault: true
    },
    // 🔥 3. Motivation
    {
      id: 'hk_moti_01',
      category: 'motivation',
      type: 'shayari',
      title: 'मंजिल उन्हीं को मिलती है (जोश भरी शायरी)',
      content: '🔥 मंजिल उन्हीं को मिलती है जिनके सपनों में जान होती है,\nपंखों से कुछ नहीं होता, हौसलों से उड़ान होती है! 🦅\n\nखुद पर विश्वास रखें और आज ही अपने नए भविष्य की शुरुआत करें।\n👉 अधिक जानने के लिए यहाँ जुड़ें:\n{link}',
      isDefault: true
    },
    // 💼 4. Business
    {
      id: 'hk_biz_01',
      category: 'business',
      type: 'hook',
      title: 'घर बैठे पार्ट-टाइम कमाई का अवसर',
      content: '💼 नौकरी या पढ़ाई के साथ ₹25,000 - ₹50,000 महीना कमाने का शानदार अवसर!\n\nAarogyam India और NetSurf के साथ डिजिटल बिजनेस शुरू करें और अपने सपनों को साकार करें।\n\n👉 पूरी जानकारी यहाँ देखें:\n{link}\n\nसम्पर्क: {my_name}',
      isDefault: true
    },
    // 🎭 5. Shayari
    {
      id: 'hk_sh_01',
      category: 'shayari',
      type: 'shayari',
      title: 'सफलता की राह पर शायरी',
      content: '🌟 मुश्किलों से भाग जाना आसान होता है,\nहर पहलू जिंदगी का इम्तिहान होता है।\nडरने वालों को मिलता नहीं कुछ जिंदगी में,\nलड़ने वालों के कदमों में जहान होता है! 🏆\n\n👉 जीवन बदलने वाली जानकारी के लिए यहाँ क्लिक करें:\n{link}',
      isDefault: true
    },
    // 🌺 6. Festivals
    {
      id: 'hk_fest_01',
      category: 'festivals',
      type: 'hook',
      title: 'त्यौहारों पर विशेष स्वास्थ्य व उपहार ऑफर',
      content: '🎉 इस पावन पर्व पर अपने और अपनों के लिए लाएं स्वास्थ्य और खुशहाली का उपहार!\n\nआरोग्यम इंडिया की ओर से विशेष 50% तक की छूट और निःशुल्क परामर्श।\n\n👉 अभी ऑफर का लाभ उठाएं:\n{link}\n\nशुभकामनाएं - {my_name}',
      isDefault: true
    }
  ];

  let currentCategory = 'all';
  let userTemplates = [];
  let adminTemplates = [];
  let availableCategories = DEFAULT_CATEGORIES;

  function init() {
    bindEvents();
    loadCategoriesAndTemplates();
  }

  function getCategories() {
    try {
      const stored = localStorage.getItem('AAROGYAM_GLOBAL_HOOK_CATEGORIES');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const mktStored = localStorage.getItem('AAROGYAM_MARKETING_TEMPLATES');
      if (mktStored) {
        const parsed = JSON.parse(mktStored);
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          return parsed.categories.map(c => ({ id: c.id, name: c.name }));
        }
      }
    } catch (e) {}
    return DEFAULT_CATEGORIES;
  }

  function bindEvents() {
    const form = document.getElementById('ucas-hook-template-form');
    const searchInput = document.getElementById('hook_search_input');

    form?.addEventListener('submit', handleCreateTemplate);
    searchInput?.addEventListener('input', (e) => filterTemplates(currentCategory, e.target.value));
  }

  function loadCategoriesAndTemplates() {
    availableCategories = getCategories();
    renderCategoryFiltersUI();
    populateCategoryDropdown();

    // Load admin templates
    try {
      const mktStored = localStorage.getItem('AAROGYAM_MARKETING_TEMPLATES');
      if (mktStored) {
        const parsed = JSON.parse(mktStored);
        if (Array.isArray(parsed.categories)) {
          adminTemplates = [];
          parsed.categories.forEach(cat => {
            (cat.templates || []).forEach(t => {
              adminTemplates.push({
                id: t.id,
                category: cat.id,
                type: t.shayari ? 'shayari' : 'hook',
                title: t.title,
                content: `${t.hook}${t.shayari ? '\n\n✨ ' + t.shayari : ''}\n\n${t.cta || '👉 यहाँ क्लिक करें:'}\n{link}\n\n- {my_name}`,
                isAdmin: true
              });
            });
          });
        }
      }
    } catch (e) {}

    // Load user custom templates
    const profileId = window.UCAS_SESSION?.getUserId() || 'global';
    try {
      const local = JSON.parse(localStorage.getItem(`UCAS_CUSTOM_HOOKS_${profileId}`) || '[]');
      userTemplates = Array.isArray(local) ? local : [];
    } catch (e) {
      userTemplates = [];
    }

    renderTemplatesList();
  }

  function renderCategoryFiltersUI() {
    const container = document.getElementById('ucas-hook-category-filters');
    if (!container) return;

    container.innerHTML = `
      <button type="button" class="ucas-hook-filter-btn ${currentCategory === 'all' ? 'active' : ''}" data-category="all" onclick="window.UCAS_HOOK_TEMPLATES.filterTemplates('all')">
        <i class="fa-solid fa-list"></i> सभी (All)
      </button>
      ${availableCategories.map(cat => `
        <button type="button" class="ucas-hook-filter-btn ${currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}" onclick="window.UCAS_HOOK_TEMPLATES.filterTemplates('${cat.id}')">
          ${cat.name}
        </button>
      `).join('')}
    `;
  }

  function populateCategoryDropdown() {
    const select = document.getElementById('hook_select_category');
    if (!select) return;

    select.innerHTML = availableCategories.map(cat => `
      <option value="${cat.id}">${cat.name}</option>
    `).join('');
  }

  function filterTemplates(category, searchQuery = '') {
    currentCategory = category || 'all';

    // Update filter buttons UI
    document.querySelectorAll('.ucas-hook-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderTemplatesList(searchQuery);
  }

  function getAllTemplates() {
    const map = new Map();
    // 1. Defaults
    DEFAULT_HOOK_TEMPLATES.forEach(t => map.set(t.id, t));
    // 2. Admin templates override or add
    adminTemplates.forEach(t => map.set(t.id, t));
    // 3. User custom templates
    userTemplates.forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }

  function renderTemplatesList(query = '') {
    const container = document.getElementById('ucas-hook-templates-grid');
    if (!container) return;

    const all = getAllTemplates();
    const q = (query || document.getElementById('hook_search_input')?.value || '').toLowerCase().trim();

    let filtered = all.filter(t => {
      const matchCat = currentCategory === 'all' || t.category === currentCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (t.title || '').toLowerCase().includes(q) || (t.content || '').toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 2rem; background: var(--bg-subtle, #F8FAFC); border: 1.5px dashed var(--border); border-radius: 12px; color: var(--text-muted);">
          <i class="fa-solid fa-feather" style="font-size: 2rem; color: var(--primary); margin-bottom: 8px; display: block;"></i>
          <strong>कोई हुक या शायरी नहीं मिली।</strong>
          <p style="font-size: 0.8rem; margin-top: 4px;">ऊपर फॉर्म भरकर अपनी नई कस्टम हुक या शायरी बनाएं।</p>
        </div>
      `;
      return;
    }

    const typeIcons = {
      hook: { icon: '🎯', label: 'हुक मैसेज', color: '#2563EB', bg: '#EFF6FF' },
      shayari: { icon: '✨', label: 'शायरी संग्रह', color: '#D97706', bg: '#FEF3C7' },
      cta: { icon: '📢', label: 'कॉल टू एक्शन', color: '#059669', bg: '#ECFDF5' }
    };

    container.innerHTML = filtered.map(item => {
      const tInfo = typeIcons[item.type] || typeIcons.hook;
      const catObj = availableCategories.find(c => c.id === item.category);
      const catLabel = catObj ? catObj.name : item.category;
      const personalized = getPersonalizedContent(item);

      return `
        <div class="ucas-hook-card" style="background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.72rem; font-weight: 800; background: ${tInfo.bg}; color: ${tInfo.color}; padding: 2px 8px; border-radius: 4px;">
                ${tInfo.icon} ${tInfo.label}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-muted); background: var(--bg-subtle, #F1F5F9); padding: 2px 6px; border-radius: 4px;">
                ${catLabel}
              </span>
            </div>
            
            <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 8px; line-height: 1.35;">
              ${item.title}
            </div>

            <div style="background: var(--bg-subtle, #F8FAFC); border-left: 3px solid ${tInfo.color}; padding: 10px; border-radius: 6px; font-size: 0.82rem; color: var(--text-main); line-height: 1.45; white-space: pre-wrap; margin-bottom: 12px; max-height: 140px; overflow-y: auto;">
${personalized}
            </div>
          </div>

          <div style="display: flex; gap: 6px; border-top: 1px solid var(--border); padding-top: 10px; margin-top: 4px;">
            <button type="button" class="ucas-btn ucas-btn-secondary" onclick="window.UCAS_HOOK_TEMPLATES.copyTemplate('${item.id}')" style="flex: 1; padding: 6px 8px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-solid fa-copy"></i> कॉपी
            </button>
            <button type="button" class="ucas-btn" onclick="window.UCAS_HOOK_TEMPLATES.shareWhatsApp('${item.id}')" style="flex: 1.2; padding: 6px 8px; font-size: 0.75rem; font-weight: 700; background: #25D366; color: #fff; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-brands fa-whatsapp"></i> व्हाट्सएप
            </button>
            <button type="button" class="ucas-btn ucas-btn-primary" onclick="window.UCAS_HOOK_TEMPLATES.insertToMarketing('${item.id}')" style="flex: 1.3; padding: 6px 8px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
              <i class="fa-solid fa-paper-plane"></i> मार्केटिंग में भेजें
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function handleCreateTemplate(e) {
    if (e) e.preventDefault();

    const title = document.getElementById('hook_input_title')?.value.trim();
    const category = document.getElementById('hook_select_category')?.value || (availableCategories[0]?.id || 'agriculture');
    const type = document.getElementById('hook_select_type')?.value || 'hook';
    const content = document.getElementById('hook_input_content')?.value.trim();

    if (!title || !content) {
      window.UCAS_APP?.showToast('कृपया शीर्षक और हुक/शायरी विवरण भरें।', 'error');
      return;
    }

    const newTemplate = {
      id: 'custom_hk_' + Date.now(),
      title,
      category,
      type,
      content,
      created_at: new Date().toISOString()
    };

    const profileId = window.UCAS_SESSION?.getUserId() || 'global';
    userTemplates.unshift(newTemplate);
    try {
      localStorage.setItem(`UCAS_CUSTOM_HOOKS_${profileId}`, JSON.stringify(userTemplates));
    } catch (err) {}

    window.UCAS_APP?.showToast('🎉 नई हुक/शायरी टेम्पलेट सुरक्षित हो गई!', 'success');
    document.getElementById('ucas-hook-template-form')?.reset();
    renderTemplatesList();
  }

  function getPersonalizedContent(item) {
    const user = window.UCAS_SESSION?.getUser() || {};
    const name = user.full_name || 'प्रिय मित्र';
    const myName = user.full_name || 'Aarogyam India';
    const shareId = window.UCAS_SESSION?.getShareId() || 'AI000004';
    const origin = window.location.origin;
    const defaultLink = `${origin}/ebooks/my-library.html?ref=${shareId}`;

    return item.content
      .replace(/\{name\}/g, name)
      .replace(/\{my_name\}/g, myName)
      .replace(/\{link\}/g, defaultLink);
  }

  function copyTemplate(templateId) {
    const all = getAllTemplates();
    const item = all.find(t => t.id === templateId);
    if (!item) return;

    const personalized = getPersonalizedContent(item);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(personalized).then(() => {
        window.UCAS_APP?.showToast('📋 हुक/शायरी टेक्स्ट कॉपी हो गया!', 'success');
      });
    } else {
      window.UCAS_APP?.showToast('टेक्स्ट तैयार है।', 'info');
    }
  }

  function shareWhatsApp(templateId) {
    const all = getAllTemplates();
    const item = all.find(t => t.id === templateId);
    if (!item) return;

    const personalized = getPersonalizedContent(item);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(personalized)}`;
    window.open(waUrl, '_blank');
  }

  function insertToMarketing(templateId) {
    const all = getAllTemplates();
    const item = all.find(t => t.id === templateId);
    if (!item) return;

    const personalized = getPersonalizedContent(item);
    const mktMsgInput = document.getElementById('ucas-custom-message-input');
    if (mktMsgInput) {
      mktMsgInput.value = personalized;
      mktMsgInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (window.UCAS_APP?.switchView) {
      window.UCAS_APP.switchView('marketing');
      window.UCAS_APP.showToast('✅ टेम्पलेट मार्केटिंग इंजन में लोड हो गया!', 'success');
    }
  }

  window.UCAS_HOOK_TEMPLATES = {
    init,
    filterTemplates,
    copyTemplate,
    shareWhatsApp,
    insertToMarketing,
    refresh: loadCategoriesAndTemplates
  };

})(window);
