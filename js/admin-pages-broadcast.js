/* ==========================================================================
   ADMIN BROADCAST MESSAGING & NOTIFICATIONS ENGINE (ADVANCED TARGETING)
   Allows Admins to:
   - Compose & Dispatch Broadcast Notifications with Smart Filtering
   - Filters:
     1. 👥 All Users (सभी यूज़र्स)
     2. 🎂 Today's Birthday (आज जिनका जन्मदिन है)
     3. 🟢 Active Subscribers Only (सक्रिय मेंबर्स)
     4. 🔴 Inactive Users Only (इनएक्टिव यूज़र्स)
     5. 📚 Book Purchased Users (जिन्होंने ई-बुक खरीदी है)
     6. 🎯 Selected Specific Users (सर्च व मैन्युअल चेकलिस्ट चयन)
   - Direct sync to User Notifications, LocalStorage, and Supabase
   ========================================================================== */

import { initAdminLayout, showToast } from './admin-main.js';
import { fetchAllUsersAdmin } from './admin-api.js';

export async function initAdminBroadcast() {
  initAdminLayout('Broadcast Notifications', 'Send targeted broadcast announcements to all users or filtered audience segments.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let allUsers = [];
  let selectedUserIds = new Set();
  let currentAudienceFilter = 'all';

  content.innerHTML = `
    <!-- Top Action Banner -->
    <div class="admin-section" style="margin-bottom: 14px; background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); color: #fff; border-radius: 12px; padding: 16px 20px; border: 1px solid #334155;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-size: 1.2rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-bullhorn" style="color: #F43F5E;"></i> 📢 आरोग्यम इंडिया ब्रॉडकास्ट संदेश प्रणाली (Broadcast Center)
          </div>
          <p style="font-size: 0.85rem; color: #94A3B8; margin: 4px 0 0 0;">
            यहाँ से भेजा गया संदेश लक्षित यूज़र्स के नोटिफिकेशन और "आरोग्यम संदेश" नेविगेशन में तुरंत (1, 2, 3...) लाइव प्रदर्शित होगा।
          </p>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button type="button" id="btn_admin_manage_bc_categories" class="admin-button" style="background: #0d9488; border-color: #0f766e; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-folder-plus"></i> 📁 श्रेणियां जोड़ें / एडिट करें (Categories)
          </button>
          <button type="button" class="admin-button" onclick="document.getElementById('broadcast-composer-card')?.scrollIntoView({behavior:'smooth'})" style="background: #E11D48; border-color: #BE123C; color: #fff; font-weight: 800;">
            <i class="fa-solid fa-plus"></i> नया संदेश भेजें
          </button>
        </div>
      </div>
    </div>

    <!-- Main Grid: Composer (Left) & Sent History (Right) -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
      
      <!-- 1. Composer Card -->
      <div class="admin-card" id="broadcast-composer-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="font-size: 1.05rem; font-weight: 800; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-pen-nib" style="color: #2563EB;"></i> नया ब्रॉडकास्ट संदेश बनाएं (Compose Message)
        </div>

        <form id="admin-broadcast-form">
          <!-- Smart Target Audience Filter -->
          <div style="margin-bottom: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px;">
            <label class="admin-label" style="font-weight: 800; font-size: 0.88rem; display: block; margin-bottom: 6px; color: #1E293B;">
              🎯 प्राप्तकर्ता चुनें (Smart Target Audience): *
            </label>
            <select id="bc_target_filter" class="admin-select" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1.5px solid #CBD5E1; font-weight: 600;">
              <option value="all">👥 सभी यूज़र्स (All Users - 100% Reach)</option>
              <option value="birthday">🎂 आज जिनका जन्मदिन है (Today's Birthday Users)</option>
              <option value="active">🟢 केवल एक्टिव मेंबर्स (Active Subscribers Only)</option>
              <option value="inactive">🔴 केवल इनएक्टिव यूज़र्स (Inactive / Non-VIP Only)</option>
              <option value="purchased">📚 जिन्होंने ई-बुक खरीदी है (Book Purchased Users)</option>
              <option value="selected">🎯 विशिष्ट चुने हुए यूज़र्स (Custom Selected Checklist)</option>
            </select>

            <!-- Audience Summary Pill -->
            <div id="bc_audience_summary" style="margin-top: 8px; font-size: 0.8rem; color: #059669; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>👥 अनुमानित पहुंच:</span> <strong id="bc_reach_count">सभी यूज़र्स</strong>
            </div>
          </div>

          <!-- Specific Users Checklist Selector (Visible for 'selected' or filter exploration) -->
          <div id="bc_selected_users_container" style="display: none; background: #F1F5F9; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 4px;">
              <span style="font-size: 0.82rem; font-weight: 800; color: #334155;">
                यूजर चुनें (<span id="bc_selected_count" style="color: #2563EB;">0</span> चुने गए):
              </span>
              <div style="display: flex; gap: 4px;">
                <button type="button" id="bc_select_all_btn" class="admin-button small-button" style="font-size: 0.72rem; padding: 2px 6px;">सब चुनें</button>
                <button type="button" id="bc_deselect_all_btn" class="admin-button small-button" style="font-size: 0.72rem; padding: 2px 6px; background: transparent; border: 1px solid #CBD5E1; color: #64748B;">अनचेक करें</button>
              </div>
            </div>
            <input type="text" id="bc_user_search_input" class="admin-input" placeholder="🔍 नाम, मोबाइल या Share ID से खोजें..." style="width: 100%; margin-bottom: 8px; font-size: 0.82rem; padding: 6px 10px;">
            <div id="bc_users_checklist" style="max-height: 160px; overflow-y: auto; background: #fff; border: 1px solid #CBD5E1; border-radius: 6px; padding: 4px;">
              <div style="color: #94A3B8; font-size: 0.8rem; text-align: center; padding: 8px;">लोड हो रहा है...</div>
            </div>
          </div>

          <!-- Priority & Category -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; margin: 0;">श्रेणी (Category):</label>
                <button type="button" id="btn_quick_manage_bc_cat" class="admin-button small-button" style="font-size: 0.72rem; padding: 1px 6px; background: #0d9488; color: #fff;">
                  📁 मैनेज करें
                </button>
              </div>
              <select id="bc_category" class="admin-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
                <!-- Populated dynamically -->
              </select>
            </div>
            <div>
              <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">प्राथमिकता (Priority):</label>
              <select id="bc_priority" class="admin-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #CBD5E1;">
                <option value="normal">🟢 सामान्य (Normal)</option>
                <option value="important">🟠 महत्वपूर्ण (Important)</option>
                <option value="urgent">🔴 अति आवश्यक (Urgent Popup)</option>
              </select>
            </div>
          </div>

          <!-- Title -->
          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">संदेश शीर्षक (Title): *</label>
            <input type="text" id="bc_title" class="admin-input" placeholder="उदा. जन्मदिन की हार्दिक शुभकामनाएं! 🎉 या विशेष ऑफर" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #CBD5E1;">
          </div>

          <!-- Message Body -->
          <div style="margin-bottom: 12px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">संदेश विवरण (Message Content): *</label>
            <textarea id="bc_body" class="admin-input" rows="4" placeholder="यहाँ पूरा संदेश लिखें..." required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #CBD5E1; font-family: inherit; line-height: 1.4;"></textarea>
          </div>

          <!-- Action Button URL (Optional) -->
          <div style="margin-bottom: 16px;">
            <label class="admin-label" style="font-weight: 700; font-size: 0.85rem; display: block; margin-bottom: 4px;">🔗 एक्शन बटन लिंक (Action URL - Optional):</label>
            <input type="text" id="bc_action_url" class="admin-input" placeholder="/ebooks/my-library.html या /subscription.html" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #CBD5E1;">
            <span style="font-size: 0.75rem; color: #64748B; margin-top: 2px; display: block;">यदि आप यूज़र को किसी विशेष पेज या ई-बुक पर भेजना चाहते हैं।</span>
          </div>

          <!-- Submit Button -->
          <button type="submit" id="bc_submit_btn" class="admin-button" style="width: 100%; background: #E11D48; border-color: #BE123C; color: #fff; font-weight: 800; padding: 12px; font-size: 1rem; border-radius: 8px;">
            <i class="fa-solid fa-paper-plane"></i> 📢 संदेश ब्रॉडकास्ट करें (Send Broadcast Now)
          </button>
        </form>
      </div>

      <!-- 2. Broadcasts History & Real-Time Log -->
      <div class="admin-card" style="background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 1.05rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-clock-rotate-left" style="color: #059669;"></i> भेजे गए ब्रॉडकास्ट संदेश (Sent History)
          </div>
          <button type="button" id="bc_refresh_history_btn" class="admin-button small-button" style="font-size: 0.75rem;">
            🔄 रीफ्रेश
          </button>
        </div>

        <div id="bc_history_container" style="max-height: 520px; overflow-y: auto;">
          <div style="color: #94A3B8; font-size: 0.85rem; text-align: center; padding: 2rem;">लोड हो रहा है...</div>
        </div>
      </div>

    </div>

    <!-- Modal: Broadcast Category Manager (Add / Edit / Delete) -->
    <div id="admin_bc_category_modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 14px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 14px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-folder-open" style="color: #0d9488;"></i> ब्रॉडकास्ट श्रेणियां (Broadcast Categories Manager)
          </h3>
          <button type="button" id="btn_close_bc_cat_modal" style="background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <!-- Add / Edit Category Form Box -->
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-weight: 800; font-size: 0.92rem; color: #1E293B; margin-bottom: 10px;" id="bc_cat_form_title">
            ➕ नई ब्रॉडकास्ट श्रेणी जोड़ें (Add New Category)
          </div>
          <form id="admin_add_bc_category_form" onsubmit="return false;">
            <input type="hidden" id="bc_cat_edit_id" value="">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी ID / Slug: *</label>
                <input type="text" id="bc_cat_input_id" class="admin-input" placeholder="festival_wish" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी का नाम व इमोजी: *</label>
                <input type="text" id="bc_cat_input_name" class="admin-input" placeholder="🌺 त्यौहार बधाई संदेश" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" id="btn_cancel_bc_cat_edit" class="admin-button small-button" style="display: none; background: #E2E8F0; color: #475569;">रद्द करें</button>
              <button type="button" id="btn_save_bc_category" class="admin-button small-button" style="background: #0d9488; border-color: #0f766e; color: #fff; font-weight: 800;">
                💾 श्रेणी सुरक्षित करें
              </button>
            </div>
          </form>
        </div>

        <!-- Current Categories List -->
        <div style="font-weight: 800; font-size: 0.88rem; color: #334155; margin-bottom: 8px;">
          वर्तमान ब्रॉडकास्ट श्रेणियां (Active Broadcast Categories):
        </div>
        <div id="admin_bc_categories_list_wrap" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Setup Event Listeners & Load Data
  const targetSelect = document.getElementById('bc_target_filter');
  const userBox = document.getElementById('bc_selected_users_container');
  const form = document.getElementById('admin-broadcast-form');
  const userSearch = document.getElementById('bc_user_search_input');
  const selectAllBtn = document.getElementById('bc_select_all_btn');
  const deselectAllBtn = document.getElementById('bc_deselect_all_btn');
  const refreshBtn = document.getElementById('bc_refresh_history_btn');
  const categorySelect = document.getElementById('bc_category');

  // ==========================================
  // BROADCAST CATEGORIES MANAGEMENT (CRUD)
  // ==========================================
  const DEFAULT_BC_CATEGORIES = [
    { id: 'announcement', name: '📢 महत्वपूर्ण घोषणा (Announcement)' },
    { id: 'birthday', name: '🎂 जन्मदिन शुभकामना संदेश (Birthday Greeting)' },
    { id: 'offer', name: '🎉 विशेष ऑफर / डिस्काउंट (Special Offer)' },
    { id: 'webinar', name: '🎥 लाइव वेबिनार सूचना (Live Event)' },
    { id: 'update', name: '🚀 नया फीचर अपडेट (Feature Update)' },
    { id: 'alert', name: '⚠️ आवश्यक सूचना (Urgent Notice)' }
  ];

  function getBroadcastCategories() {
    try {
      const stored = localStorage.getItem('AAROGYAM_BROADCAST_CATEGORIES');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_BC_CATEGORIES;
  }

  function syncBroadcastCategories(cats) {
    try {
      localStorage.setItem('AAROGYAM_BROADCAST_CATEGORIES', JSON.stringify(cats));
      localStorage.setItem('AAROGYAM_GLOBAL_BC_CATEGORIES', JSON.stringify(cats));
    } catch (e) {}
  }

  function populateBroadcastCategoryDropdown() {
    const cats = getBroadcastCategories();
    const select = document.getElementById('bc_category');
    if (select) {
      const cur = select.value;
      select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if (cur && cats.some(c => c.id === cur)) select.value = cur;
    }
  }

  function openBcCategoryModal() {
    const modal = document.getElementById('admin_bc_category_modal');
    if (!modal) return;
    resetBcCategoryForm();
    renderBcCategoriesListInModal();
    modal.style.display = 'flex';
  }

  function closeBcCategoryModal() {
    const modal = document.getElementById('admin_bc_category_modal');
    if (modal) modal.style.display = 'none';
  }

  function renderBcCategoriesListInModal() {
    const wrap = document.getElementById('admin_bc_categories_list_wrap');
    if (!wrap) return;
    const cats = getBroadcastCategories();

    wrap.innerHTML = cats.map(c => `
      <div style="background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 0.9rem; color: #1E293B;">${c.name}</strong>
          <span style="font-size: 0.75rem; color: #64748B; font-family: monospace; margin-left: 6px;">(ID: ${c.id})</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" onclick="window.editBcCategoryAdmin('${c.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #3B82F6; color: #fff;">
            ✏️ एडिट
          </button>
          <button type="button" onclick="window.deleteBcCategoryAdmin('${c.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #EF4444; color: #fff;">
            🗑️ हटाएं
          </button>
        </div>
      </div>
    `).join('');
  }

  function resetBcCategoryForm() {
    const editId = document.getElementById('bc_cat_edit_id');
    const idInput = document.getElementById('bc_cat_input_id');
    const nameInput = document.getElementById('bc_cat_input_name');
    const formTitle = document.getElementById('bc_cat_form_title');
    const cancelBtn = document.getElementById('btn_cancel_bc_cat_edit');

    if (editId) editId.value = '';
    if (idInput) { idInput.value = ''; idInput.disabled = false; }
    if (nameInput) nameInput.value = '';
    if (formTitle) formTitle.textContent = '➕ नई ब्रॉडकास्ट श्रेणी जोड़ें (Add New Category)';
    if (cancelBtn) cancelBtn.style.display = 'none';
  }

  function saveBcCategory() {
    const editId = document.getElementById('bc_cat_edit_id')?.value.trim();
    const idInput = document.getElementById('bc_cat_input_id')?.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const nameInput = document.getElementById('bc_cat_input_name')?.value.trim();

    if (!idInput || !nameInput) {
      showToast('कृपया कैटेगरी ID और नाम दोनों दर्ज करें।', 'error');
      return;
    }

    let cats = getBroadcastCategories();
    if (editId) {
      const target = cats.find(c => c.id === editId);
      if (target) {
        target.name = nameInput;
        target.id = idInput;
      }
    } else {
      if (cats.some(c => c.id === idInput)) {
        showToast('यह श्रेणी ID पहले से मौजूद है। कृपया दूसरी ID चुनें।', 'error');
        return;
      }
      cats.push({ id: idInput, name: nameInput });
    }

    syncBroadcastCategories(cats);
    resetBcCategoryForm();
    renderBcCategoriesListInModal();
    populateBroadcastCategoryDropdown();
    showToast('✅ ब्रॉडकास्ट श्रेणी सफलतापूर्वक सुरक्षित हो गई!', 'success');
  }

  window.editBcCategoryAdmin = function(catId) {
    const cats = getBroadcastCategories();
    const target = cats.find(c => c.id === catId);
    if (!target) return;

    const editId = document.getElementById('bc_cat_edit_id');
    const idInput = document.getElementById('bc_cat_input_id');
    const nameInput = document.getElementById('bc_cat_input_name');
    const formTitle = document.getElementById('bc_cat_form_title');
    const cancelBtn = document.getElementById('btn_cancel_bc_cat_edit');

    if (editId) editId.value = target.id;
    if (idInput) { idInput.value = target.id; idInput.disabled = true; }
    if (nameInput) nameInput.value = target.name;
    if (formTitle) formTitle.textContent = `✏️ श्रेणी एडिट करें: ${target.name}`;
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
  };

  window.deleteBcCategoryAdmin = function(catId) {
    let cats = getBroadcastCategories();
    if (cats.length <= 1) {
      showToast('कम से कम एक श्रेणी होना आवश्यक है।', 'error');
      return;
    }
    if (!confirm(`क्या आप वाकई श्रेणी ${catId} को हटाना चाहते हैं?`)) return;

    cats = cats.filter(c => c.id !== catId);
    syncBroadcastCategories(cats);
    renderBcCategoriesListInModal();
    populateBroadcastCategoryDropdown();
    showToast('🗑️ श्रेणी हटा दी गई।', 'info');
  };

  document.getElementById('btn_admin_manage_bc_categories')?.addEventListener('click', openBcCategoryModal);
  document.getElementById('btn_quick_manage_bc_cat')?.addEventListener('click', openBcCategoryModal);
  document.getElementById('btn_close_bc_cat_modal')?.addEventListener('click', closeBcCategoryModal);
  document.getElementById('btn_save_bc_category')?.addEventListener('click', saveBcCategory);
  document.getElementById('btn_cancel_bc_cat_edit')?.addEventListener('click', resetBcCategoryForm);

  populateBroadcastCategoryDropdown();

  await loadAllUsers();
  loadBroadcastHistory();

  targetSelect?.addEventListener('change', (e) => {
    currentAudienceFilter = e.target.value;
    updateAudienceTargetUI();
  });

  categorySelect?.addEventListener('change', (e) => {
    if (e.target.value === 'birthday') {
      const titleInput = document.getElementById('bc_title');
      const bodyInput = document.getElementById('bc_body');
      if (titleInput && !titleInput.value) {
        titleInput.value = '🎂 जन्मदिन की हार्दिक शुभकामनाएं! 🎉';
      }
      if (bodyInput && !bodyInput.value) {
        bodyInput.value = 'प्रिय सदस्य, आरोग्यम इंडिया परिवार की ओर से आपको जन्मदिन की अशेष शुभकामनाएं! ईश्वर आपको उत्तम स्वास्थ्य, दीर्घायु और अपार खुशियां प्रदान करें। 🌿💐';
      }
    }
  });

  userSearch?.addEventListener('input', (e) => {
    renderUserChecklist(e.target.value);
  });

  selectAllBtn?.addEventListener('click', () => {
    const eligible = getEligibleUsersForFilter(currentAudienceFilter);
    eligible.forEach(u => selectedUserIds.add(u.id));
    updateSelectedCount();
    renderUserChecklist(userSearch?.value || '');
  });

  deselectAllBtn?.addEventListener('click', () => {
    selectedUserIds.clear();
    updateSelectedCount();
    renderUserChecklist(userSearch?.value || '');
  });

  refreshBtn?.addEventListener('click', loadBroadcastHistory);
  form?.addEventListener('submit', handleBroadcastSubmit);

  async function loadAllUsers() {
    try {
      const res = await fetchAllUsersAdmin();
      allUsers = res.data || [];
      updateAudienceTargetUI();
    } catch (e) {
      console.warn('Failed to load users for broadcast:', e);
    }
  }

  function isUserBirthdayToday(u) {
    if (!u.dob) return false;
    try {
      const today = new Date();
      const bdate = new Date(u.dob);
      if (isNaN(bdate.getTime())) return false;
      return bdate.getDate() === today.getDate() && bdate.getMonth() === today.getMonth();
    } catch (e) {
      return false;
    }
  }

  function getEligibleUsersForFilter(filter) {
    if (filter === 'all') return allUsers;
    if (filter === 'birthday') return allUsers.filter(isUserBirthdayToday);
    if (filter === 'active') return allUsers.filter(u => Boolean(u.is_active || u.is_subscriber));
    if (filter === 'inactive') return allUsers.filter(u => !Boolean(u.is_active || u.is_subscriber));
    if (filter === 'purchased') return allUsers.filter(u => Boolean(u.has_purchased || (u.purchases && u.purchases.length > 0)));
    return allUsers;
  }

  function updateAudienceTargetUI() {
    const reachEl = document.getElementById('bc_reach_count');
    const eligible = getEligibleUsersForFilter(currentAudienceFilter);

    if (currentAudienceFilter === 'selected') {
      if (userBox) userBox.style.display = 'block';
      if (reachEl) reachEl.innerHTML = `<span style="color:#2563EB;">${selectedUserIds.size} चुने गए यूज़र्स</span>`;
    } else {
      if (userBox) userBox.style.display = 'none';
      if (reachEl) {
        const labels = {
          all: `सभी ${allUsers.length} यूज़र्स (100% Reach)`,
          birthday: `${eligible.length} यूज़र्स (आज जन्मदिन वाले) 🎂`,
          active: `${eligible.length} एक्टिव मेंबर्स 🟢`,
          inactive: `${eligible.length} इनएक्टिव यूज़र्स 🔴`,
          purchased: `${eligible.length} ई-बुक खरीदार यूज़र्स 📚`
        };
        reachEl.textContent = labels[currentAudienceFilter] || `${eligible.length} यूज़र्स`;
      }
    }

    renderUserChecklist(userSearch?.value || '');
  }

  function renderUserChecklist(query = '') {
    const list = document.getElementById('bc_users_checklist');
    if (!list) return;

    const q = query.toLowerCase().trim();
    let displayList = currentAudienceFilter === 'selected' ? allUsers : getEligibleUsersForFilter(currentAudienceFilter);

    const filtered = displayList.filter(u => {
      if (!q) return true;
      const name = (u.full_name || u.name || '').toLowerCase();
      const mob = (u.mobile || '').toLowerCase();
      const share = (u.share_id || '').toLowerCase();
      return name.includes(q) || mob.includes(q) || share.includes(q);
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div style="color:#94A3B8;font-size:0.75rem;padding:6px;text-align:center;">कोई यूजर नहीं मिला।</div>';
      return;
    }

    list.innerHTML = filtered.map(u => {
      const isChecked = selectedUserIds.has(u.id);
      const isBday = isUserBirthdayToday(u);
      const isAct = Boolean(u.is_active || u.is_subscriber);
      const hasPurchased = Boolean(u.has_purchased || (u.purchases && u.purchases.length > 0));

      return `
        <label style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-bottom:1px solid #F1F5F9;font-size:0.8rem;cursor:pointer;background:${isChecked ? '#EFF6FF' : 'transparent'};">
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="checkbox" value="${u.id}" ${isChecked ? 'checked' : ''} onchange="window._onBcUserToggle('${u.id}', this.checked)">
            <div>
              <span style="font-weight:700;color:#1E293B;">${u.full_name || u.name || 'User'}</span>
              <span style="color:#64748B;font-family:monospace;font-size:0.75rem;">(📞 ${u.mobile || '-'} • 🆔 ${u.share_id || '-'})</span>
            </div>
          </div>
          <div style="display:flex;gap:4px;align-items:center;">
            ${isBday ? '<span style="font-size:0.68rem;background:#FEF3C7;color:#B45309;padding:1px 5px;border-radius:4px;font-weight:800;">🎂 Bday</span>' : ''}
            ${hasPurchased ? '<span style="font-size:0.68rem;background:#DCFCE7;color:#15803D;padding:1px 5px;border-radius:4px;font-weight:700;">📚 Book</span>' : ''}
            ${isAct ? '<span style="font-size:0.68rem;background:#DCFCE7;color:#15803D;padding:1px 5px;border-radius:4px;">🟢 Active</span>' : '<span style="font-size:0.68rem;background:#FEE2E2;color:#DC2626;padding:1px 5px;border-radius:4px;">🔴 Inactive</span>'}
          </div>
        </label>
      `;
    }).join('');
  }

  window._onBcUserToggle = (uId, checked) => {
    if (checked) selectedUserIds.add(uId);
    else selectedUserIds.delete(uId);
    updateSelectedCount();
  };

  function updateSelectedCount() {
    const countEl = document.getElementById('bc_selected_count');
    if (countEl) countEl.textContent = selectedUserIds.size;
    if (currentAudienceFilter === 'selected') {
      const reachEl = document.getElementById('bc_reach_count');
      if (reachEl) reachEl.innerHTML = `<span style="color:#2563EB;">${selectedUserIds.size} चुने गए यूज़र्स</span>`;
    }
  }

  async function handleBroadcastSubmit(e) {
    if (e) e.preventDefault();

    const target = document.getElementById('bc_target_filter')?.value || 'all';
    const category = document.getElementById('bc_category')?.value || 'announcement';
    const priority = document.getElementById('bc_priority')?.value || 'normal';
    const title = document.getElementById('bc_title')?.value.trim();
    const body = document.getElementById('bc_body')?.value.trim();
    const actionUrl = document.getElementById('bc_action_url')?.value.trim();
    const submitBtn = document.getElementById('bc_submit_btn');

    if (!title || !body) {
      showToast('कृपया शीर्षक और संदेश विवरण भरें।', 'error');
      return;
    }

    if (target === 'selected' && selectedUserIds.size === 0) {
      showToast('कृपया कम से कम एक यूजर का चयन करें।', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ब्रॉडकास्ट भेजा जा रहा है...';
    }

    // Determine target user IDs
    let recipientIds = [];
    if (target === 'selected') {
      recipientIds = Array.from(selectedUserIds);
    } else if (target === 'birthday') {
      recipientIds = allUsers.filter(isUserBirthdayToday).map(u => u.id);
    } else if (target === 'active') {
      recipientIds = allUsers.filter(u => Boolean(u.is_active || u.is_subscriber)).map(u => u.id);
    } else if (target === 'inactive') {
      recipientIds = allUsers.filter(u => !Boolean(u.is_active || u.is_subscriber)).map(u => u.id);
    } else if (target === 'purchased') {
      recipientIds = allUsers.filter(u => Boolean(u.has_purchased || (u.purchases && u.purchases.length > 0))).map(u => u.id);
    }

    const broadcastItem = {
      id: 'BC_' + Date.now(),
      title,
      body,
      category,
      priority,
      target,
      target_user_ids: recipientIds,
      action_url: actionUrl || null,
      created_at: new Date().toISOString(),
      sender: 'Admin Team (Aarogyam India)'
    };

    // 1. Insert into Supabase if table exists
    try {
      if (window.supabaseClient && typeof window.supabaseClient.from === 'function') {
        await window.supabaseClient.from('broadcast_notifications').insert(broadcastItem);
      }
    } catch (err) {
      console.warn('Supabase broadcast notice:', err);
    }

    // 2. Save to Global LocalStorage Broadcast store
    try {
      const stored = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
      stored.unshift(broadcastItem);
      localStorage.setItem('AAROGYAM_GLOBAL_BROADCASTS', JSON.stringify(stored));
    } catch (e) {}

    showToast('🎉 ब्रॉडकास्ट संदेश सफलतापूर्वक भेज दिया गया!', 'success');

    form?.reset();
    selectedUserIds.clear();
    updateSelectedCount();
    updateAudienceTargetUI();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 📢 संदेश ब्रॉडकास्ट करें (Send Broadcast Now)';
    }

    loadBroadcastHistory();
  }

  function loadBroadcastHistory() {
    const container = document.getElementById('bc_history_container');
    if (!container) return;

    let history = [];
    try {
      history = JSON.parse(localStorage.getItem('AAROGYAM_GLOBAL_BROADCASTS') || '[]');
    } catch (e) {}

    if (history.length === 0) {
      history = [
        {
          id: 'BC_SAMPLE_01',
          title: '🌾 खरीफ 2026 विशेष किसान जागरूकता अभियान',
          body: 'प्रिय सदस्यों, आधुनिक जैविक कृषि व फसलों की सुरक्षा पर हमारी विशेष ई-बुक अब डिजिटल लाइब्रेरी में उपलब्ध है। अभी पढ़ें और लाभ लें।',
          category: 'announcement',
          priority: 'normal',
          target: 'all',
          action_url: '/ebooks/my-library.html',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      try {
        localStorage.setItem('AAROGYAM_GLOBAL_BROADCASTS', JSON.stringify(history));
      } catch (e) {}
    }

    const priorityColors = {
      normal: { bg: '#DCFCE7', color: '#15803D', label: '🟢 Normal' },
      important: { bg: '#FEF3C7', color: '#B45309', label: '🟠 Important' },
      urgent: { bg: '#FEE2E2', color: '#DC2626', label: '🔴 Urgent' }
    };

    const targetLabels = {
      all: '👥 All Users (सभी)',
      birthday: '🎂 Today\'s Birthday Users',
      active: '🟢 Active Members Only',
      inactive: '🔴 Inactive Users Only',
      purchased: '📚 Book Purchased Users',
      selected: '🎯 Specific Selected Users'
    };

    container.innerHTML = history.map(item => {
      const pInfo = priorityColors[item.priority] || priorityColors.normal;
      const dateStr = new Date(item.created_at).toLocaleString('hi-IN', { dateStyle: 'short', timeStyle: 'short' });
      const targetTxt = targetLabels[item.target] || item.target;

      return `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid ${pInfo.color}; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4px;">
            <div style="font-weight: 800; font-size: 0.95rem; color: #0F172A;">${item.title}</div>
            <span style="font-size: 0.7rem; font-weight: 800; background: ${pInfo.bg}; color: ${pInfo.color}; padding: 2px 6px; border-radius: 4px; white-space: nowrap;">
              ${pInfo.label}
            </span>
          </div>
          <div style="font-size: 0.82rem; color: #334155; line-height: 1.4; margin-bottom: 6px; white-space: pre-wrap;">
${item.body}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #64748B; border-top: 1px dashed #CBD5E1; padding-top: 6px; flex-wrap: wrap; gap: 4px;">
            <span>🎯 ${targetTxt} ${item.target_user_ids?.length ? `(${item.target_user_ids.length} reach)` : ''}</span>
            <span>📅 ${dateStr}</span>
            ${item.action_url ? `<a href="${item.action_url}" target="_blank" style="color: #2563EB; font-weight: 700; text-decoration: none;">🔗 लिंक देखें</a>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}
