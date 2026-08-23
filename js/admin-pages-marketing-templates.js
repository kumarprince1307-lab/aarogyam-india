/* Admin Marketing Templates Page — CRUD for Hook Messages & Shayaris & Categories */
import { initAdminLayout, showToast } from './admin-main.js';

let allCategories = [];
let activeCatFilter = 'all';
let currentSearchQuery = '';

const DEFAULT_CATEGORIES = [
  {
    id: 'agriculture',
    name: '🌾 Agriculture (कृषि)',
    templates: [
      {
        id: 'ag_001',
        title: 'फसल की पैदावार 30% तक बढ़ाएं',
        hook: '🌾 क्या आपकी फसल में पीलापन या इल्ली की समस्या है?\nरासायनिक दवाओं का भारी खर्च बंद करें और जैविक तकनीक से फसल की पैदावार 30% तक बढ़ाएं।',
        shayari: 'पसीने की हर बूंद से जो सींचता है धरा को, वही अन्नदाता भरता है हर घर के थाल को। 🌱',
        cta: '👉 अभी पूरी जानकारी देखें और निःशुल्क गाइड प्राप्त करें:'
      },
      {
        id: 'ag_002',
        title: 'कीटनाशक खर्च आधा करने का फॉर्मूला',
        hook: '👨‍🌾 किसान भाइयों के लिए विशेष जैविक समाधान! रासायनिक खाद से खराब हो रही जमीन को सुधारें और उपज दोगुनी करें।',
        shayari: 'माटी सोना उगलेगी, जब जैविक खाद अपनाओगे। खुशहाली घर आएगी, जब प्रकृति संग जुड़ जाओगे।',
        cta: '👉 अभी ई-बुक गाइड यहाँ पढ़ें:'
      }
    ]
  },
  {
    id: 'healthcare',
    name: '❤️ Healthcare (स्वास्थ्य)',
    templates: [
      {
        id: 'hl_001',
        title: 'डायबिटीज व बीपी से स्थाई राहत',
        hook: '❤️ क्या आप या आपके परिवार में कोई जोड़ों के दर्द, गैस, बीपी या डायबिटीज से परेशान है?\nआयुर्वेद के प्राकृतिक उपायों से पाएं स्थाई स्वास्थ्य।',
        shayari: 'पहला सुख निरोगी काया, दूजा सुख घर में हो माया। स्वास्थ्य ही जीवन की सबसे बड़ी पूंजी है। 🌿',
        cta: '👉 प्राकृतिक स्वास्थ्य परामर्श यहाँ प्राप्त करें:'
      }
    ]
  },
  {
    id: 'motivation',
    name: '🔥 Motivation (प्रेरणा)',
    templates: [
      {
        id: 'mt_001',
        title: 'सफलता की नई उड़ान',
        hook: '🔥 मुश्किलों से भाग जाना आसान होता है, हर पहलू जिंदगी का इम्तिहान होता है।\nअपने सपनों को सच करने का आज ही फैसला लें!',
        shayari: 'मंजिल उन्हीं को मिलती है जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है! 🦅',
        cta: '👉 अपना डिजिटल बिजनेस आज ही शुरू करें:'
      }
    ]
  },
  {
    id: 'business',
    name: '💼 Business (व्यापार)',
    templates: [
      {
        id: 'bz_001',
        title: 'पार्ट-टाइम कमाई का सुनहरा अवसर',
        hook: '💼 नौकरी या पढ़ाई के साथ ₹25,000 - ₹50,000 महीना कमाने का शानदार अवसर!\nAarogyam India के साथ डिजिटल बिजनेस शुरू करें।',
        shayari: 'रास्ते बदलो मत, रास्ते नए बनाओ, जो कल तक ख्वाब थे, उन्हें आज सच कर दिखाओ। 🚀',
        cta: '👉 पूरा बिजनेस प्लान यहाँ देखें:'
      }
    ]
  },
  {
    id: 'shayari',
    name: '🎭 Shayari (शायरी संग्रह)',
    templates: [
      {
        id: 'sh_001',
        title: 'विश्वास और सफलता पर शायरी',
        hook: '🌟 जिंदगी में रिस्क लेना सीखो, जीत गए तो कप्तान बनोगे, हार गए तो सलाहकार!',
        shayari: 'संबंध वही सच्चे होते हैं जो वक्त पर काम आएं, भरोसा वही अटूट होता है जो हर कदम पर साथ निभाए। 🤝',
        cta: '👉 हमसे जुड़ने के लिए यहाँ क्लिक करें:'
      }
    ]
  },
  {
    id: 'festivals',
    name: '🌺 Festivals (त्यौहार)',
    templates: [
      {
        id: 'fs_001',
        title: 'त्यौहारों पर विशेष स्वास्थ्य ऑफर',
        hook: '🎉 इस पावन त्यौहार पर अपने परिवार को दें उत्तम स्वास्थ्य का उपहार! विशेष 50% छूट उपलब्ध।',
        shayari: 'हर दिन खुशियों का मेला हो, कभी न कोई अकेला हो। आरोग्यम का यह उपहार, लाए खुशियां अपार। 🪔',
        cta: '👉 विशेष ऑफर का लाभ उठाएं:'
      }
    ]
  }
];

export async function initMarketingTemplatesPage() {
  initAdminLayout('Hook Templates & Shayari', 'Manage pre-built and custom marketing hooks, shayaris, categories and promotional messages.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <!-- Top Action Banner -->
    <div class="admin-section" style="margin-bottom: 14px; background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); border-radius: 12px; padding: 16px 20px; border: 1px solid #4338CA; color: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-pen-nib" style="color: #A78BFA;"></i> ✍️ हुक मैसेज एवं शायरी टेम्पलेट्स (Hook Templates & Shayari Hub)
          </div>
          <p style="font-size: 0.85rem; color: #C7D2FE; margin: 4px 0 0 0;">
            यूज़र्स के मार्केटिंग इंजन और लैंडिंग पेजों के लिए उच्च-परिवर्तनकारी (High-Converting) हुक, शायरी और श्रेणियां (Categories) प्रबंधित करें।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn_admin_manage_categories" class="admin-button" style="background: #059669; border-color: #047857; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-folder-plus"></i> 📁 श्रेणियां जोड़ें / एडिट करें (Categories)
          </button>
          <button type="button" id="btn_admin_add_template" class="admin-button" style="background: #8B5CF6; border-color: #7C3AED; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-plus"></i> नया टेम्पलेट जोड़ें (Add Template)
          </button>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div class="admin-card" style="background: var(--admin-surface, #1E293B); border: 1px solid var(--admin-border, #334155); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div id="admin_template_cat_filters" style="display: flex; gap: 6px; flex-wrap: wrap;">
        <!-- Rendered dynamically -->
      </div>

      <div style="min-width: 200px; flex: 1; max-width: 280px;">
        <input type="text" id="admin_template_search" class="admin-input" placeholder="🔍 शीर्षक या शायरी खोजें..." style="width: 100%; padding: 6px 12px; font-size: 0.82rem;">
      </div>
    </div>

    <!-- Templates Grid -->
    <div id="admin_templates_grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-bottom: 24px;">
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--admin-muted);">लोड हो रहा है...</div>
    </div>

    <!-- 1. Category Manager Modal (Add / Edit / Delete Categories) -->
    <div id="admin_category_manager_modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 14px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 14px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-folder-open" style="color: #059669;"></i> हुक व शायरी श्रेणियां (Categories Manager)
          </h3>
          <button type="button" onclick="document.getElementById('admin_category_manager_modal').style.display='none'" style="background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <!-- Add / Edit Category Form Box -->
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-weight: 800; font-size: 0.92rem; color: #1E293B; margin-bottom: 10px;" id="cat_form_title">
            ➕ नई श्रेणी जोड़ें (Add New Category)
          </div>
          <form id="admin_add_category_form" onsubmit="return false;">
            <input type="hidden" id="cat_edit_id" value="">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी ID / Slug (उदा. spiritual): *</label>
                <input type="text" id="cat_input_id" class="admin-input" placeholder="spiritual" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी का नाम व इमोजी: *</label>
                <input type="text" id="cat_input_name" class="admin-input" placeholder="🕉️ अध्यात्म व योग" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" id="btn_cancel_cat_edit" class="admin-button small-button" style="display: none; background: #E2E8F0; color: #475569;">रद्द करें</button>
              <button type="button" id="btn_save_category" class="admin-button small-button" style="background: #059669; border-color: #047857; color: #fff; font-weight: 800;">
                💾 श्रेणी सुरक्षित करें
              </button>
            </div>
          </form>
        </div>

        <!-- Current Categories List -->
        <div style="font-weight: 800; font-size: 0.88rem; color: #334155; margin-bottom: 8px;">
          वर्तमान श्रेणियां (Current Active Categories):
        </div>
        <div id="admin_categories_list_wrap" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>

    <!-- 2. Template Create/Edit Modal -->
    <div id="admin_template_modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 9999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 12px; max-width: 540px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 14px;">
          <h3 id="admin_modal_title" style="margin: 0; font-size: 1.1rem; font-weight: 800; color: #0F172A;">नया हुक टेम्पलेट जोड़ें</h3>
          <button type="button" onclick="document.getElementById('admin_template_modal').style.display='none'" style="background: transparent; border: none; font-size: 1.4rem; color: #64748B; cursor: pointer;">&times;</button>
        </div>

        <form id="admin_template_form" onsubmit="return false;">
          <input type="hidden" id="tmpl_id" value="">

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 4px;">कैटेगरी (Category): *</label>
              <select id="tmpl_category" class="admin-select" style="width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px;">
                <!-- Populated dynamically -->
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 4px;">शीर्षक (Title): *</label>
              <input type="text" id="tmpl_title" class="admin-input" placeholder="उदा. फसल सुरक्षा विशेष" required style="width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px;">
            </div>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 4px;">हुक मैसेज (Hook Message Content): *</label>
            <textarea id="tmpl_hook" class="admin-input" rows="3" placeholder="यहाँ मुख्य हुक संदेश लिखें..." required style="width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px; font-family: inherit;"></textarea>
          </div>

          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 4px;">शायरी / पंचलाइन (Shayari - Optional):</label>
            <textarea id="tmpl_shayari" class="admin-input" rows="2" placeholder="यहाँ 2 लाइन की शायरी या प्रेरणादायक दोहा लिखें..." style="width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px; font-family: inherit;"></textarea>
          </div>

          <div style="margin-bottom: 16px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 4px;">कॉल टू एक्शन (Call To Action - CTA):</label>
            <input type="text" id="tmpl_cta" class="admin-input" value="📲 अभी पूरी जानकारी के लिए क्लिक करें:" style="width: 100%; padding: 8px; border: 1px solid #CBD5E1; border-radius: 6px;">
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" onclick="document.getElementById('admin_template_modal').style.display='none'" class="admin-button small-button" style="background: #E2E8F0; color: #475569;">रद्द करें</button>
            <button type="button" id="btn_save_template" class="admin-button small-button" style="background: #8B5CF6; border-color: #7C3AED; color: #fff; font-weight: 800;">
              💾 टेम्पलेट सुरक्षित करें
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  await loadTemplates();
  bindEvents();
}

async function loadTemplates() {
  try {
    const local = localStorage.getItem('AAROGYAM_MARKETING_TEMPLATES');
    if (local) {
      const parsed = JSON.parse(local);
      allCategories = Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES;
    } else {
      allCategories = DEFAULT_CATEGORIES;
      localStorage.setItem('AAROGYAM_MARKETING_TEMPLATES', JSON.stringify({ categories: allCategories }));
    }
  } catch (e) {
    allCategories = DEFAULT_CATEGORIES;
  }

  // Ensure global categories list is synced
  syncGlobalCategoriesStore();
  renderCategoryFilterTabs();
  renderTemplatesGrid();
}

function syncGlobalCategoriesStore() {
  try {
    const hookCats = allCategories.map(c => ({ id: c.id, name: c.name }));
    localStorage.setItem('AAROGYAM_GLOBAL_HOOK_CATEGORIES', JSON.stringify(hookCats));
  } catch (e) {}
}

function renderCategoryFilterTabs() {
  const filterWrap = document.getElementById('admin_template_cat_filters');
  const modalCatSelect = document.getElementById('tmpl_category');
  if (!filterWrap) return;

  filterWrap.innerHTML = `
    <button type="button" class="admin-button small-button ${activeCatFilter === 'all' ? 'active' : ''}" data-cat="all" style="font-size: 0.78rem;">
      <i class="fa-solid fa-list"></i> सभी (All)
    </button>
    ${allCategories.map(cat => `
      <button type="button" class="admin-button small-button ${activeCatFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}" style="font-size: 0.78rem;">
        ${cat.name}
      </button>
    `).join('')}
  `;

  if (modalCatSelect) {
    modalCatSelect.innerHTML = allCategories.map(cat => `
      <option value="${cat.id}">${cat.name}</option>
    `).join('');
  }
}

function bindEvents() {
  // Category filter tabs
  const catFilters = document.getElementById('admin_template_cat_filters');
  catFilters?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cat = btn.getAttribute('data-cat');
    activeCatFilter = cat;
    catFilters.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTemplatesGrid();
  });

  // Search input
  const searchInput = document.getElementById('admin_template_search');
  searchInput?.addEventListener('input', (e) => {
    currentSearchQuery = (e.target.value || '').toLowerCase().trim();
    renderTemplatesGrid();
  });

  // Add Template button
  document.getElementById('btn_admin_add_template')?.addEventListener('click', () => {
    openTemplateModal();
  });

  // Manage Categories button
  document.getElementById('btn_admin_manage_categories')?.addEventListener('click', () => {
    openCategoryManagerModal();
  });

  // Save category button
  document.getElementById('btn_save_category')?.addEventListener('click', saveCategory);

  // Cancel edit category button
  document.getElementById('btn_cancel_cat_edit')?.addEventListener('click', resetCategoryForm);

  // Save template in modal
  document.getElementById('btn_save_template')?.addEventListener('click', saveTemplate);
}

function renderTemplatesGrid() {
  const container = document.getElementById('admin_templates_grid');
  if (!container) return;

  let flatTemplates = [];
  allCategories.forEach(cat => {
    (cat.templates || []).forEach(t => {
      flatTemplates.push({ ...t, category_id: cat.id, category_name: cat.name });
    });
  });

  if (activeCatFilter !== 'all') {
    flatTemplates = flatTemplates.filter(t => t.category_id === activeCatFilter);
  }

  if (currentSearchQuery) {
    flatTemplates = flatTemplates.filter(t => 
      (t.title || '').toLowerCase().includes(currentSearchQuery) ||
      (t.hook || '').toLowerCase().includes(currentSearchQuery) ||
      (t.shayari || '').toLowerCase().includes(currentSearchQuery)
    );
  }

  if (flatTemplates.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: var(--admin-surface, #1E293B); border: 1.5px dashed var(--admin-border, #334155); border-radius: 12px; color: var(--admin-muted);">
        <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 2rem; color: #64748B; margin-bottom: 8px; display: block;"></i>
        <strong style="color: var(--admin-text);">इस श्रेणी में कोई टेम्पलेट नहीं मिला।</strong>
        <p style="font-size: 0.84rem; margin-top: 4px;">ऊपर "+ नया टेम्पलेट जोड़ें" पर क्लिक करके नया हुक मैसेज या शायरी बनाएं।</p>
      </div>
    `;
    return;
  }

  container.innerHTML = flatTemplates.map((t) => `
    <div style="background: var(--admin-surface, #1E293B); border: 1px solid var(--admin-border, #334155); border-radius: 12px; padding: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 8px;">
          <span style="background: rgba(139,92,246,0.15); color: #A78BFA; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 6px;">
            ${t.category_name || t.category_id}
          </span>
          <span style="font-family: monospace; font-size: 0.72rem; color: var(--admin-muted);">${t.id}</span>
        </div>
        <div style="font-weight: 800; font-size: 1rem; color: var(--admin-text, #F8FAFC); margin-bottom: 8px; line-height: 1.35;">
          ${t.title}
        </div>
        <div style="background: var(--admin-surface-2, #0F172A); border-left: 3px solid #10B981; padding: 10px; border-radius: 6px; font-size: 0.82rem; color: #CBD5E1; margin-bottom: 8px; white-space: pre-wrap; max-height: 140px; overflow-y: auto; line-height: 1.45;">
${t.hook}
        </div>
        ${t.shayari ? `
          <div style="background: rgba(245,158,11,0.1); border: 1px dashed rgba(245,158,11,0.4); padding: 8px 10px; border-radius: 6px; font-size: 0.8rem; color: #FBBF24; margin-bottom: 10px; font-style: italic; line-height: 1.4;">
            ✨ ${t.shayari}
          </div>
        ` : ''}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--admin-border, #334155); padding-top: 10px; margin-top: 6px;">
        <button type="button" class="admin-button small-button" onclick="window.copyTemplateAdminText('${t.id}')" style="font-size: 0.75rem; background: #2563EB; color: #fff; padding: 4px 8px;">
          <i class="fa-solid fa-copy"></i> कॉपी
        </button>
        <div style="display: flex; gap: 6px;">
          <button type="button" class="admin-button small-button" onclick="window.editTemplateAdmin('${t.id}')" style="padding: 4px 8px; font-size: 0.75rem; background: transparent; border: 1px solid var(--admin-border); color: var(--admin-text);">
            <i class="fa-solid fa-pen-to-square"></i> एडिट
          </button>
          <button type="button" class="admin-button small-button" onclick="window.deleteTemplateAdmin('${t.id}')" style="padding: 4px 8px; font-size: 0.75rem; background: #FEE2E2; color: #DC2626; border: none;">
            <i class="fa-solid fa-trash-can"></i> हटाएं
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================

function openCategoryManagerModal() {
  const modal = document.getElementById('admin_category_manager_modal');
  if (!modal) return;
  resetCategoryForm();
  renderCategoriesListInModal();
  modal.style.display = 'flex';
}

function renderCategoriesListInModal() {
  const container = document.getElementById('admin_categories_list_wrap');
  if (!container) return;

  container.innerHTML = allCategories.map(cat => `
    <div style="background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="font-size: 0.9rem; color: #1E293B;">${cat.name}</strong>
        <span style="font-size: 0.75rem; color: #64748B; font-family: monospace; margin-left: 6px;">(ID: ${cat.id})</span>
        <span style="font-size: 0.72rem; background: #E0E7FF; color: #4338CA; padding: 1px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px;">
          ${(cat.templates || []).length} टेम्पलेट्स
        </span>
      </div>
      <div style="display: flex; gap: 4px;">
        <button type="button" onclick="window.editCategoryAdmin('${cat.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #3B82F6; color: #fff;">
          ✏️ एडिट
        </button>
        <button type="button" onclick="window.deleteCategoryAdmin('${cat.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #EF4444; color: #fff;">
          🗑️ हटाएं
        </button>
      </div>
    </div>
  `).join('');
}

function saveCategory() {
  const editId = document.getElementById('cat_edit_id')?.value.trim();
  const idInput = document.getElementById('cat_input_id')?.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const nameInput = document.getElementById('cat_input_name')?.value.trim();

  if (!idInput || !nameInput) {
    showToast('कृपया कैटेगरी ID और नाम दोनों दर्ज करें।', 'error');
    return;
  }

  if (editId) {
    // Edit existing category
    const cat = allCategories.find(c => c.id === editId);
    if (cat) {
      cat.name = nameInput;
      cat.id = idInput;
    }
  } else {
    // Check if ID already exists
    if (allCategories.some(c => c.id === idInput)) {
      showToast('यह कैटेगरी ID पहले से मौजूद है। कृपया दूसरी ID चुनें।', 'error');
      return;
    }
    allCategories.push({
      id: idInput,
      name: nameInput,
      templates: []
    });
  }

  localStorage.setItem('AAROGYAM_MARKETING_TEMPLATES', JSON.stringify({ categories: allCategories }));
  syncGlobalCategoriesStore();
  resetCategoryForm();
  renderCategoriesListInModal();
  renderCategoryFilterTabs();
  renderTemplatesGrid();
  showToast('✅ श्रेणी सफलतापूर्वक सुरक्षित हो गई और सभी यूज़र्स के लिए अपडेट हो गई!', 'success');
}

function resetCategoryForm() {
  const editId = document.getElementById('cat_edit_id');
  const idInput = document.getElementById('cat_input_id');
  const nameInput = document.getElementById('cat_input_name');
  const formTitle = document.getElementById('cat_form_title');
  const cancelBtn = document.getElementById('btn_cancel_cat_edit');

  if (editId) editId.value = '';
  if (idInput) { idInput.value = ''; idInput.disabled = false; }
  if (nameInput) nameInput.value = '';
  if (formTitle) formTitle.textContent = '➕ नई श्रेणी जोड़ें (Add New Category)';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

window.editCategoryAdmin = function(catId) {
  const cat = allCategories.find(c => c.id === catId);
  if (!cat) return;

  const editId = document.getElementById('cat_edit_id');
  const idInput = document.getElementById('cat_input_id');
  const nameInput = document.getElementById('cat_input_name');
  const formTitle = document.getElementById('cat_form_title');
  const cancelBtn = document.getElementById('btn_cancel_cat_edit');

  if (editId) editId.value = cat.id;
  if (idInput) { idInput.value = cat.id; idInput.disabled = true; }
  if (nameInput) nameInput.value = cat.name;
  if (formTitle) formTitle.textContent = `✏️ श्रेणी एडिट करें: ${cat.name}`;
  if (cancelBtn) cancelBtn.style.display = 'inline-block';
};

window.deleteCategoryAdmin = function(catId) {
  if (allCategories.length <= 1) {
    showToast('कम से कम एक श्रेणी होना आवश्यक है।', 'error');
    return;
  }
  if (!confirm(`क्या आप वाकई श्रेणी ${catId} को हटाना चाहते हैं? इसके अंदर की टेम्पलेट्स भी हट जाएंगी।`)) return;

  allCategories = allCategories.filter(c => c.id !== catId);
  if (activeCatFilter === catId) activeCatFilter = 'all';

  localStorage.setItem('AAROGYAM_MARKETING_TEMPLATES', JSON.stringify({ categories: allCategories }));
  syncGlobalCategoriesStore();
  renderCategoriesListInModal();
  renderCategoryFilterTabs();
  renderTemplatesGrid();
  showToast('🗑️ श्रेणी हटा दी गई।', 'info');
};

// ==========================================
// TEMPLATE MANAGEMENT
// ==========================================

function openTemplateModal(tmpl = null) {
  const modal = document.getElementById('admin_template_modal');
  const titleEl = document.getElementById('admin_modal_title');
  const idInput = document.getElementById('tmpl_id');
  const catInput = document.getElementById('tmpl_category');
  const titleInput = document.getElementById('tmpl_title');
  const hookInput = document.getElementById('tmpl_hook');
  const shayariInput = document.getElementById('tmpl_shayari');
  const ctaInput = document.getElementById('tmpl_cta');

  if (!modal) return;

  if (tmpl) {
    titleEl.textContent = 'टेम्पलेट एडिट करें (' + tmpl.id + ')';
    idInput.value = tmpl.id;
    catInput.value = tmpl.category_id || allCategories[0]?.id || 'agriculture';
    titleInput.value = tmpl.title || '';
    hookInput.value = tmpl.hook || '';
    shayariInput.value = tmpl.shayari || '';
    ctaInput.value = tmpl.cta || '';
  } else {
    titleEl.textContent = 'नया हुक टेम्पलेट जोड़ें';
    idInput.value = '';
    catInput.value = activeCatFilter !== 'all' ? activeCatFilter : (allCategories[0]?.id || 'agriculture');
    titleInput.value = '';
    hookInput.value = '';
    shayariInput.value = '';
    ctaInput.value = '📲 अभी पूरी जानकारी के लिए क्लिक करें:';
  }

  modal.style.display = 'flex';
}

function saveTemplate() {
  const idInput = document.getElementById('tmpl_id')?.value.trim();
  const catInput = document.getElementById('tmpl_category')?.value || (allCategories[0]?.id || 'agriculture');
  const titleInput = document.getElementById('tmpl_title')?.value.trim();
  const hookInput = document.getElementById('tmpl_hook')?.value.trim();
  const shayariInput = document.getElementById('tmpl_shayari')?.value.trim();
  const ctaInput = document.getElementById('tmpl_cta')?.value.trim();

  if (!titleInput || !hookInput) {
    showToast('कृपया शीर्षक और हुक संदेश अवश्य दर्ज करें।', 'error');
    return;
  }

  let catObj = allCategories.find(c => c.id === catInput);
  if (!catObj) {
    catObj = { id: catInput, name: catInput, templates: [] };
    allCategories.push(catObj);
  }
  if (!catObj.templates) catObj.templates = [];

  if (idInput) {
    // Update existing
    for (let c of allCategories) {
      const idx = (c.templates || []).findIndex(t => t.id === idInput);
      if (idx !== -1) {
        c.templates.splice(idx, 1);
        break;
      }
    }
    catObj.templates.unshift({
      id: idInput,
      title: titleInput,
      hook: hookInput,
      shayari: shayariInput,
      cta: ctaInput
    });
  } else {
    // Add new
    const newId = `${catInput.slice(0, 2)}_${Date.now().toString().slice(-4)}`;
    catObj.templates.unshift({
      id: newId,
      title: titleInput,
      hook: hookInput,
      shayari: shayariInput,
      cta: ctaInput
    });
  }

  localStorage.setItem('AAROGYAM_MARKETING_TEMPLATES', JSON.stringify({ categories: allCategories }));
  syncGlobalCategoriesStore();
  const modal = document.getElementById('admin_template_modal');
  if (modal) modal.style.display = 'none';

  renderTemplatesGrid();
  showToast('✅ टेम्पलेट सफलतापूर्वक सुरक्षित हो गया!', 'success');
}

window.copyTemplateAdminText = function(tmplId) {
  let found = null;
  for (let cat of allCategories) {
    const t = (cat.templates || []).find(item => item.id === tmplId);
    if (t) {
      found = t;
      break;
    }
  }
  if (!found) return;

  const fullText = `${found.title}\n\n${found.hook}${found.shayari ? '\n\n✨ ' + found.shayari : ''}\n\n${found.cta || ''}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('📋 टेम्पलेट टेक्स्ट कॉपी हो गया!', 'success');
    });
  }
};

window.editTemplateAdmin = function(tmplId) {
  let found = null;
  for (let cat of allCategories) {
    const t = (cat.templates || []).find(item => item.id === tmplId);
    if (t) {
      found = { ...t, category_id: cat.id };
      break;
    }
  }
  if (found) openTemplateModal(found);
};

window.deleteTemplateAdmin = function(tmplId) {
  if (!confirm(`क्या आप वाकई टेम्पलेट ${tmplId} को हटाना चाहते हैं?`)) return;

  for (let cat of allCategories) {
    const idx = (cat.templates || []).findIndex(t => t.id === tmplId);
    if (idx !== -1) {
      cat.templates.splice(idx, 1);
      break;
    }
  }

  localStorage.setItem('AAROGYAM_MARKETING_TEMPLATES', JSON.stringify({ categories: allCategories }));
  syncGlobalCategoriesStore();
  renderTemplatesGrid();
  showToast('🗑️ टेम्पलेट हटा दिया गया।', 'info');
};
