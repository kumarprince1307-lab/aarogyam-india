/* Admin Dedicated Product Landing Pages Hub */

import { initAdminLayout } from './admin-main.js';
import { fetchUsers } from './admin-api.js';

const PAGE_SIZE = 20;

function getAdminDb() {
  if (window.dbClient) return window.dbClient;
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.from === 'function') return window.supabase;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.dbClient = window.supabase.createClient(
      'https://qjhjrzsnrtahmhswxyvb.supabase.co',
      'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
    );
    return window.dbClient;
  }
  return null;
}

export async function initProductLandingPages() {
  initAdminLayout('Product Landing Pages Hub', 'Create and manage dedicated product campaigns, MRP, offer prices, and affiliate buy-now links with direct lead attribution.');

  const content = document.getElementById('page-content');
  if (!content) return;

  let currentPage = 1;
  let allProductPages = [];
  let allUsers = [];
  let allProductLeads = [];

  let editingPageId = null;
  let uploadedImageData = null;
  let uploadedCustomThumbData = null;

  // Target User Mode: 'single' | 'multi' | 'all'
  let targetUserMode = 'single';
  let multiSelectedUserIds = new Set();
  let selectedPageIds = new Set();

  content.innerHTML = `
    <!-- Top Header & Action Controls -->
    <div class="admin-section" style="margin-bottom: 14px;">
      <div class="admin-section-header" style="flex-wrap: wrap; gap: 10px;">
        <div>
          <div class="admin-section-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🛍️ Product Landing Pages Hub</span>
            <span style="font-size: 0.75rem; background: rgba(245,158,11,0.15); color: #f59e0b; padding: 2px 8px; border-radius: 12px; font-weight: 700;">Affiliate & E-Commerce</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--admin-muted); margin: 0;">
            विभिन्न उत्पादों के आकर्षक लैंडिंग पेज बनाएं, MRP व ऑफर मूल्य तय करें और थर्ड-पार्टी "Buy Now" लिंक जोड़ें।
          </p>
        </div>
        <div style="display:flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-manage-prod-categories" class="admin-button" style="background: #0d9488; border-color: #0f766e; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <span>📁</span> <span>श्रेणियां जोड़ें / एडिट करें (Categories)</span>
          </button>
          <button id="btn-toggle-prod-builder" class="admin-button" style="background: #f59e0b; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
            <span>✨</span> <span>+ नया प्रोडक्ट लैंडिंग पेज बनाएं</span>
          </button>
          <button id="prod-refresh-btn" class="admin-button small-button">🔄 Refresh Data</button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-top: 14px;">
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #f59e0b;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🛍️ कुल प्रोडक्ट पेजेस</div>
          <div id="kpi-prod-total" style="font-size: 1.6rem; font-weight: 800; color: #f59e0b; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #10b981;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🟢 एक्टिव (Live / Active)</div>
          <div id="kpi-prod-active" style="font-size: 1.6rem; font-weight: 800; color: #10b981; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #ef4444;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">🔴 ब्लॉक / निष्क्रिय</div>
          <div id="kpi-prod-blocked" style="font-size: 1.6rem; font-weight: 800; color: #ef4444; margin-top: 4px;">0</div>
        </div>
        <div class="admin-card" style="padding: 14px; background: var(--admin-surface-2, #0f172a); border-left: 4px solid #3b82f6;">
          <div style="font-size: 0.8rem; color: var(--admin-muted); font-weight: 700;">📥 कुल Buy Now लीड्स</div>
          <div id="kpi-prod-leads" style="font-size: 1.6rem; font-weight: 800; color: #3b82f6; margin-top: 4px;">0</div>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         PRODUCT LANDING PAGE CREATOR / EDITOR DRAWER
         ========================================================================= -->
    <div id="admin-prod-builder-card" class="admin-card" style="display: none; margin-bottom: 20px; background: var(--admin-surface-2, #0f172a); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--admin-border, #334155); padding-bottom: 12px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">🛍️</span>
          <h3 id="admin-prod-builder-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--admin-text);">
            नया प्रोडक्ट लैंडिंग पेज बनाएं (Product Creator)
          </h3>
        </div>
        <button type="button" id="btn-close-prod-builder" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted); font-weight: 700;">
          &times; बंद करें (Close)
        </button>
      </div>

      <form id="admin-prod-form" onsubmit="return false;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
          
          <!-- 1. Target User Mode -->
          <div class="admin-form-group" style="grid-column: 1 / -1; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
              <label class="admin-label" style="font-weight: 800; color: #f59e0b; display: flex; align-items: center; gap: 6px; font-size: 0.92rem; margin: 0;">
                <span>👥 किन यूजर्स के लिए प्रोडक्ट पेज बनाना है? (Referral Attribution) *</span>
              </label>
              
              <div style="display: flex; gap: 6px; background: var(--admin-surface, #1e293b); padding: 4px; border-radius: 8px; border: 1px solid var(--admin-border);">
                <button type="button" id="prod_mode_single" class="admin-button small-button" style="background: #f59e0b; color: #fff; font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  👤 सिंगल यूजर
                </button>
                <button type="button" id="prod_mode_multi" class="admin-button small-button" style="background: transparent; color: var(--admin-text); font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  👥 मल्टी-सेलेक्ट
                </button>
                <button type="button" id="prod_mode_all" class="admin-button small-button" style="background: transparent; color: var(--admin-text); font-weight: 700; font-size: 0.78rem; padding: 4px 10px;">
                  🌐 सभी यूजर्स (All Users)
                </button>
              </div>
            </div>

            <!-- Single User Dropdown -->
            <div id="prod_user_single_wrap">
              <select id="prod_lp_user_select" class="admin-select" style="width: 100%; font-weight: 600; padding: 10px 12px;">
                <option value="">-- यूजर चुनें (Select User: Name, Mobile, Share ID) --</option>
              </select>
            </div>

            <!-- Multi-Select Users -->
            <div id="prod_user_multi_wrap" style="display: none; margin-top: 8px;">
              <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; align-items: center;">
                <input type="text" id="prod_multi_search_input" class="admin-input" placeholder="🔍 नाम, मोबाइल या Share ID से खोजें..." style="flex: 2; min-width: 200px; padding: 6px 10px; font-size: 0.85rem;" />
                <button type="button" id="prod_btn_select_all_users" class="admin-button small-button" style="background: #f59e0b; color: #fff; font-size: 0.78rem;">✓ Select All</button>
                <button type="button" id="prod_btn_deselect_all_users" class="admin-button small-button" style="background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted); font-size: 0.78rem;">✕ Clear</button>
                <span id="prod_multi_count_badge" style="font-size: 0.82rem; font-weight: 800; color: #f59e0b; margin-left: auto;">0 यूजर्स चुने गए</span>
              </div>
              <div id="prod_multi_user_list" style="max-height: 200px; overflow-y: auto; background: var(--admin-surface, #1e293b); border: 1px solid var(--admin-border, #334155); border-radius: 8px; padding: 8px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px;"></div>
            </div>

            <!-- All Users Notification Banner -->
            <div id="prod_user_all_wrap" style="display: none; background: rgba(245,158,11,0.12); border: 1.5px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 6px;">
              <div style="font-weight: 800; color: #f59e0b; font-size: 0.92rem;">
                🌐 सभी यूजर्स (All Users Broadcast):
              </div>
              <p style="font-size: 0.84rem; color: var(--admin-text); margin: 4px 0 0 0;">
                यह प्रोडक्ट लैंडिंग पेज सिस्टम के <strong>सभी <span id="prod_all_users_count">0</span> यूजर्स</strong> के लिए उनके व्यक्तिगत Share ID के साथ स्वतः बन जाएगा।
              </p>
            </div>
          </div>

          <!-- 2. Product Name / Title -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">प्रोडक्ट का नाम / शीर्षक (Product Title) *</label>
            <input type="text" id="prod_lp_title" class="admin-input" placeholder="उदा. Aarogyam India संपूर्ण जैविक कृषि किट (50% Off)" style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 10px 12px;" required />
          </div>

          <!-- 3. Category Selector with Quick Manage Button -->
          <div class="admin-form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="admin-label" style="font-weight: 700;">कैटेगरी (Product Category)</label>
              <button type="button" id="btn-quick-manage-prod-cat" class="admin-button small-button" style="font-size: 0.72rem; padding: 2px 8px; background: #0d9488; color: #fff;">
                📁 श्रेणियां मैनेज करें
              </button>
            </div>
            <select id="prod_lp_category" class="admin-select" style="width: 100%; padding: 10px 12px; margin-top: 6px;">
              <!-- Populated dynamically -->
            </select>
          </div>

          <!-- 4. Pricing: MRP & Offer Price -->
          <div class="admin-form-group">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <label class="admin-label" style="font-weight: 700;">असली MRP (₹):</label>
                <input type="number" id="prod_lp_mrp" class="admin-input" placeholder="1999" style="width: 100%; padding: 10px 12px;" />
              </div>
              <div>
                <label class="admin-label" style="font-weight: 700; color:#10b981;">ऑफर मूल्य (₹): *</label>
                <input type="number" id="prod_lp_offer_price" class="admin-input" placeholder="999" style="width: 100%; padding: 10px 12px; font-weight: 700;" required />
              </div>
            </div>
          </div>

          <!-- 5. Third-Party Buy Now URL -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700; color:#f59e0b;">🔗 थर्ड-पार्टी "Buy Now" लिंक (External Affiliate / Checkout URL) *</label>
            <input type="url" id="prod_lp_buynow_url" class="admin-input" placeholder="https://store.example.com/checkout/product-101" style="width: 100%; padding: 10px 12px; font-weight: 600;" required />
            <div style="font-size: 0.75rem; color: var(--admin-muted); margin-top: 4px;">
              💡 जब ग्राहक "Buy Now" पर क्लिक करेगा, उसकी लीड तुरंत सिस्टम में रिकॉर्ड होगी और वह इस लिंक पर चला जाएगा।
            </div>
          </div>

          <!-- 6. Description / Highlights -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">प्रोडक्ट का विवरण व मुख्य विशेषताएं (Description / Highlights) *</label>
            <textarea id="prod_lp_message" class="admin-textarea" rows="3" placeholder="फसलों की पैदावार दोगुनी करने और मिट्टी की उर्वरक शक्ति बढ़ाने के लिए प्रमाणित जैविक किट। अभी ऑर्डर करें और पाएं 50% विशेष छूट..." style="width: 100%; padding: 10px 12px;" required></textarea>
          </div>

          <!-- 7. Product Image & Social OG Poster -->
          <div class="admin-form-group" style="grid-column: 1 / -1;">
            <label class="admin-label" style="font-weight: 700;">📸 प्रोडक्ट मुख्य इमेज (Product Main Image) *</label>
            <input type="file" id="prod_lp_image_file" accept="image/*" class="admin-input" style="width: 100%; padding: 8px 12px;" />
            <div id="prod_lp_img_preview_wrap" style="display:none; margin-top: 10px;">
              <img id="prod_lp_img_preview" src="" alt="Product Preview" style="max-height: 180px; border-radius: 8px; border: 1px solid var(--admin-border);" />
            </div>
          </div>

          <!-- 8. Status -->
          <div class="admin-form-group">
            <label class="admin-label" style="font-weight: 700;">स्टेटस (Status)</label>
            <select id="prod_lp_status" class="admin-select" style="width: 100%; padding: 10px 12px;">
              <option value="active">🟢 Active / Live</option>
              <option value="pending_review">⏳ Pending Review</option>
              <option value="blocked">🔴 Blocked / Disabled</option>
            </select>
          </div>

        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px; border-top: 1px solid var(--admin-border, #334155); padding-top: 16px;">
          <button type="submit" id="prod_btn_save_lp" class="admin-button" style="background: #f59e0b; color: #fff; font-weight: 800; padding: 10px 24px;">
            ✨ Generate & Save Product Page
          </button>
          <button type="button" id="prod_btn_cancel_edit" class="admin-button" style="display:none; background: transparent; border: 1px solid var(--admin-border); color: var(--admin-muted);">
            ✕ Cancel Edit
          </button>
        </div>
      </form>

      <!-- Result Link Box -->
      <div id="prod-lp-result-card" style="display:none; margin-top:16px; background:rgba(16,185,129,0.12); border:1.5px solid #10b981; border-radius:10px; padding:14px;">
        <div style="font-weight:800; color:#10b981; margin-bottom:8px;" id="prod_result_header_msg">
          🎉 प्रोडक्ट लैंडिंग पेज सफलतापूर्वक बन गया!
        </div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <input type="text" id="prod_lp_result_url" class="admin-input" readonly style="flex:2; min-width:260px; font-weight:700; color:#10b981;" />
          <button type="button" id="prod_btn_copy_url" class="admin-button small-button" style="background:#10b981;color:#fff;">📋 Copy Link</button>
          <button type="button" id="prod_btn_wa_share" class="admin-button small-button" style="background:#25D366;color:#fff;">💬 WhatsApp</button>
          <button type="button" id="prod_btn_open_public" class="admin-button small-button" style="background:var(--admin-surface);color:var(--admin-text);border:1px solid var(--admin-border);">👁️ Open URL</button>
        </div>
      </div>
    </div>

    <!-- =========================================================================
         FILTER BAR
         ========================================================================= -->
    <div class="admin-card admin-controls" style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 12px; background: var(--admin-surface-2, #0f172a);">
      <input id="prod-search-box" type="search" placeholder="🔍 प्रोडक्ट नाम, यूजर, Share ID से खोजें..." class="admin-input" style="flex: 2; min-width: 200px;" />
      
      <select id="prod-category-filter" class="admin-select" style="flex: 1.2; min-width: 160px;">
        <option value="all">📂 All Categories (सभी)</option>
        <option value="product">🛒 जनरल प्रोडक्ट</option>
        <option value="agriculture">🌾 कृषि उत्पाद</option>
        <option value="healthcare">🩺 स्वास्थ्य उत्पाद</option>
        <option value="beautycare">✨ सौंदर्य उत्पाद</option>
        <option value="cattlecare">🐄 पशु पोषण</option>
      </select>

      <select id="prod-status-filter" class="admin-select" style="flex: 1; min-width: 140px;">
        <option value="all">⚡ All Statuses</option>
        <option value="active">🟢 Active</option>
        <option value="pending_review">⏳ Pending Review</option>
        <option value="blocked">🔴 Blocked</option>
      </select>
    </div>

    <!-- Table Container -->
    <div id="prod-table-container" style="margin-top: 14px;"></div>

    <!-- Leads Viewer Drawer -->
    <div id="prod-drawer-overlay" class="admin-drawer-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:999; justify-content:flex-end;">
      <div class="admin-drawer" style="width:100%; max-width:550px; background:var(--admin-surface, #1e293b); height:100%; overflow-y:auto; padding:24px; box-shadow:-4px 0 25px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--admin-border); padding-bottom:12px; margin-bottom:16px;">
          <h3 id="prod-drawer-title" style="margin:0; font-size:1.15rem; font-weight:800; color:var(--admin-text);"></h3>
          <button type="button" id="prod-drawer-close" class="admin-button small-button" style="background:transparent; border:1px solid var(--admin-border); color:var(--admin-muted);">&times; Close</button>
        </div>
        <div id="prod-drawer-body"></div>
      </div>
    </div>

    <!-- Modal: Product Category Manager (Add / Edit / Delete) -->
    <div id="admin_prod_category_modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 99999; align-items: center; justify-content: center; padding: 16px;">
      <div style="background: #fff; border-radius: 14px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); padding: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 10px; margin-bottom: 14px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-folder-open" style="color: #0d9488;"></i> प्रोडक्ट श्रेणियां (Product Categories Manager)
          </h3>
          <button type="button" id="btn_close_prod_cat_modal" style="background: transparent; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; line-height: 1;">&times;</button>
        </div>

        <!-- Add / Edit Category Form Box -->
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
          <div style="font-weight: 800; font-size: 0.92rem; color: #1E293B; margin-bottom: 10px;" id="prod_cat_form_title">
            ➕ नई प्रोडक्ट श्रेणी जोड़ें (Add New Category)
          </div>
          <form id="admin_add_prod_category_form" onsubmit="return false;">
            <input type="hidden" id="prod_cat_edit_id" value="">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी ID / Slug: *</label>
                <input type="text" id="prod_cat_input_id" class="admin-input" placeholder="bio_fertilizer" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
              <div>
                <label class="admin-label" style="font-size: 0.78rem; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">कैटेगरी का नाम व इमोजी: *</label>
                <input type="text" id="prod_cat_input_name" class="admin-input" placeholder="🌱 बायो-फर्टिलाइजर व कीटनाशक" required style="width: 100%; padding: 6px 10px; font-size: 0.85rem;">
              </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" id="btn_cancel_prod_cat_edit" class="admin-button small-button" style="display: none; background: #E2E8F0; color: #475569;">रद्द करें</button>
              <button type="button" id="btn_save_prod_category" class="admin-button small-button" style="background: #0d9488; border-color: #0f766e; color: #fff; font-weight: 800;">
                💾 श्रेणी सुरक्षित करें
              </button>
            </div>
          </form>
        </div>

        <!-- Current Categories List -->
        <div style="font-weight: 800; font-size: 0.88rem; color: #334155; margin-bottom: 8px;">
          वर्तमान प्रोडक्ट श्रेणियां (Active Product Categories):
        </div>
        <div id="admin_prod_categories_list_wrap" style="max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Elements
  const tableContainer = document.getElementById('prod-table-container');
  const searchInput = document.getElementById('prod-search-box');
  const categoryFilter = document.getElementById('prod-category-filter');
  const statusFilter = document.getElementById('prod-status-filter');
  const refreshBtn = document.getElementById('prod-refresh-btn');

  const builderCard = document.getElementById('admin-prod-builder-card');
  const toggleBuilderBtn = document.getElementById('btn-toggle-prod-builder');
  const closeBuilderBtn = document.getElementById('btn-close-prod-builder');
  const builderTitle = document.getElementById('admin-prod-builder-title');
  const form = document.getElementById('admin-prod-form');

  const userSingleWrap = document.getElementById('prod_user_single_wrap');
  const userMultiWrap = document.getElementById('prod_user_multi_wrap');
  const userAllWrap = document.getElementById('prod_user_all_wrap');
  const userSelect = document.getElementById('prod_lp_user_select');
  const multiSearchInput = document.getElementById('prod_multi_search_input');
  const multiUserList = document.getElementById('prod_multi_user_list');
  const multiCountBadge = document.getElementById('prod_multi_count_badge');
  const btnSelectAllUsers = document.getElementById('prod_btn_select_all_users');
  const btnDeselectAllUsers = document.getElementById('prod_btn_deselect_all_users');
  const allUsersCountEl = document.getElementById('prod_all_users_count');

  const btnModeSingle = document.getElementById('prod_mode_single');
  const btnModeMulti = document.getElementById('prod_mode_multi');
  const btnModeAll = document.getElementById('prod_mode_all');

  const titleInput = document.getElementById('prod_lp_title');
  const categorySelect = document.getElementById('prod_lp_category');
  const mrpInput = document.getElementById('prod_lp_mrp');
  const offerPriceInput = document.getElementById('prod_lp_offer_price');
  const buyNowUrlInput = document.getElementById('prod_lp_buynow_url');
  const messageInput = document.getElementById('prod_lp_message');
  const imgFileInput = document.getElementById('prod_lp_image_file');
  const imgPreviewWrap = document.getElementById('prod_lp_img_preview_wrap');
  const imgPreview = document.getElementById('prod_lp_img_preview');
  const statusSelect = document.getElementById('prod_lp_status');
  const saveBtn = document.getElementById('prod_btn_save_lp');
  const cancelEditBtn = document.getElementById('prod_btn_cancel_edit');

  const resultCard = document.getElementById('prod-lp-result-card');
  const resultHeaderMsg = document.getElementById('prod_result_header_msg');
  const resultUrlInput = document.getElementById('prod_lp_result_url');

  const drawerOverlay = document.getElementById('prod-drawer-overlay');
  const drawerCloseBtn = document.getElementById('prod-drawer-close');
  const drawerTitle = document.getElementById('prod-drawer-title');
  const drawerBody = document.getElementById('prod-drawer-body');

  drawerCloseBtn?.addEventListener('click', () => { if (drawerOverlay) drawerOverlay.style.display = 'none'; });
  drawerOverlay?.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.style.display = 'none';
  });

  // ==========================================
  // PRODUCT CATEGORIES MANAGEMENT (CRUD)
  // ==========================================
  const DEFAULT_PROD_CATEGORIES = [
    { id: 'product', name: '🛒 जनरल प्रोडक्ट (General Product)' },
    { id: 'agriculture', name: '🌾 कृषि उत्पाद (Agriculture)' },
    { id: 'healthcare', name: '🩺 स्वास्थ्य उत्पाद (Healthcare)' },
    { id: 'beautycare', name: '✨ सौंदर्य व स्किनकेयर (Beauty & Personal)' },
    { id: 'cattlecare', name: '🐄 पशु पोषण किट (Cattle Care)' },
    { id: 'netsurf', name: '💼 NetSurf Products' },
    { id: 'other', name: '📦 अन्य उत्पाद' }
  ];

  function getProductCategories() {
    try {
      const stored = localStorage.getItem('AAROGYAM_PROD_CATEGORIES') || localStorage.getItem('AAROGYAM_LP_CATEGORIES');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_PROD_CATEGORIES;
  }

  function syncProductCategories(cats) {
    try {
      localStorage.setItem('AAROGYAM_PROD_CATEGORIES', JSON.stringify(cats));
    } catch (e) {}
  }

  function populateProductCategoryDropdowns() {
    const cats = getProductCategories();
    const select = document.getElementById('prod_lp_category');
    const filterSelect = document.getElementById('prod-category-filter');

    if (select) {
      const cur = select.value;
      select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if (cur && cats.some(c => c.id === cur)) select.value = cur;
    }

    if (filterSelect) {
      const curFilter = filterSelect.value;
      filterSelect.innerHTML = `<option value="all">🛍️ सभी कैटेगरी (All Categories)</option>` +
        cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if (curFilter) filterSelect.value = curFilter;
    }
  }

  function openProdCategoryModal() {
    const modal = document.getElementById('admin_prod_category_modal');
    if (!modal) return;
    resetProdCategoryForm();
    renderProdCategoriesListInModal();
    modal.style.display = 'flex';
  }

  function closeProdCategoryModal() {
    const modal = document.getElementById('admin_prod_category_modal');
    if (modal) modal.style.display = 'none';
  }

  function renderProdCategoriesListInModal() {
    const wrap = document.getElementById('admin_prod_categories_list_wrap');
    if (!wrap) return;
    const cats = getProductCategories();

    wrap.innerHTML = cats.map(c => `
      <div style="background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 0.9rem; color: #1E293B;">${c.name}</strong>
          <span style="font-size: 0.75rem; color: #64748B; font-family: monospace; margin-left: 6px;">(ID: ${c.id})</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button type="button" onclick="window.editProdCategoryAdmin('${c.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #3B82F6; color: #fff;">
            ✏️ एडिट
          </button>
          <button type="button" onclick="window.deleteProdCategoryAdmin('${c.id}')" class="admin-button small-button" style="padding: 2px 8px; font-size: 0.72rem; background: #EF4444; color: #fff;">
            🗑️ हटाएं
          </button>
        </div>
      </div>
    `).join('');
  }

  function resetProdCategoryForm() {
    const editId = document.getElementById('prod_cat_edit_id');
    const idInput = document.getElementById('prod_cat_input_id');
    const nameInput = document.getElementById('prod_cat_input_name');
    const formTitle = document.getElementById('prod_cat_form_title');
    const cancelBtn = document.getElementById('btn_cancel_prod_cat_edit');

    if (editId) editId.value = '';
    if (idInput) { idInput.value = ''; idInput.disabled = false; }
    if (nameInput) nameInput.value = '';
    if (formTitle) formTitle.textContent = '➕ नई प्रोडक्ट श्रेणी जोड़ें (Add New Category)';
    if (cancelBtn) cancelBtn.style.display = 'none';
  }

  function saveProdCategory() {
    const editId = document.getElementById('prod_cat_edit_id')?.value.trim();
    const idInput = document.getElementById('prod_cat_input_id')?.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const nameInput = document.getElementById('prod_cat_input_name')?.value.trim();

    if (!idInput || !nameInput) {
      if (typeof window.showToast === 'function') window.showToast('कृपया कैटेगरी ID और नाम दोनों दर्ज करें।', 'error');
      else alert('कृपया कैटेगरी ID और नाम दोनों दर्ज करें।');
      return;
    }

    let cats = getProductCategories();
    if (editId) {
      const target = cats.find(c => c.id === editId);
      if (target) {
        target.name = nameInput;
        target.id = idInput;
      }
    } else {
      if (cats.some(c => c.id === idInput)) {
        if (typeof window.showToast === 'function') window.showToast('यह श्रेणी ID पहले से मौजूद है।', 'error');
        else alert('यह श्रेणी ID पहले से मौजूद है।');
        return;
      }
      cats.push({ id: idInput, name: nameInput });
    }

    syncProductCategories(cats);
    resetProdCategoryForm();
    renderProdCategoriesListInModal();
    populateProductCategoryDropdowns();
    if (typeof window.showToast === 'function') window.showToast('✅ प्रोडक्ट श्रेणी सफलतापूर्वक सुरक्षित हो गई!', 'success');
  }

  window.editProdCategoryAdmin = function(catId) {
    const cats = getProductCategories();
    const target = cats.find(c => c.id === catId);
    if (!target) return;

    const editId = document.getElementById('prod_cat_edit_id');
    const idInput = document.getElementById('prod_cat_input_id');
    const nameInput = document.getElementById('prod_cat_input_name');
    const formTitle = document.getElementById('prod_cat_form_title');
    const cancelBtn = document.getElementById('btn_cancel_prod_cat_edit');

    if (editId) editId.value = target.id;
    if (idInput) { idInput.value = target.id; idInput.disabled = true; }
    if (nameInput) nameInput.value = target.name;
    if (formTitle) formTitle.textContent = `✏️ श्रेणी एडिट करें: ${target.name}`;
    if (cancelBtn) cancelBtn.style.display = 'inline-block';
  };

  window.deleteProdCategoryAdmin = function(catId) {
    let cats = getProductCategories();
    if (cats.length <= 1) {
      if (typeof window.showToast === 'function') window.showToast('कम से कम एक श्रेणी होना आवश्यक है।', 'error');
      return;
    }
    if (!confirm(`क्या आप वाकई श्रेणी ${catId} को हटाना चाहते हैं?`)) return;

    cats = cats.filter(c => c.id !== catId);
    syncProductCategories(cats);
    renderProdCategoriesListInModal();
    populateProductCategoryDropdowns();
    if (typeof window.showToast === 'function') window.showToast('🗑️ श्रेणी हटा दी गई।', 'info');
  };

  document.getElementById('btn-manage-prod-categories')?.addEventListener('click', openProdCategoryModal);
  document.getElementById('btn-quick-manage-prod-cat')?.addEventListener('click', openProdCategoryModal);
  document.getElementById('btn_close_prod_cat_modal')?.addEventListener('click', closeProdCategoryModal);
  document.getElementById('btn_save_prod_category')?.addEventListener('click', saveProdCategory);
  document.getElementById('btn_cancel_prod_cat_edit')?.addEventListener('click', resetProdCategoryForm);

  populateProductCategoryDropdowns();

  // Toggle Builder Card
  toggleBuilderBtn?.addEventListener('click', () => {
    if (builderCard.style.display === 'none') {
      resetBuilder();
      populateProductCategoryDropdowns();
      builderCard.style.display = 'block';
      builderCard.scrollIntoView({ behavior: 'smooth' });
    } else {
      builderCard.style.display = 'none';
      resetBuilder();
    }
  });

  closeBuilderBtn?.addEventListener('click', () => {
    builderCard.style.display = 'none';
    resetBuilder();
  });

  cancelEditBtn?.addEventListener('click', () => {
    builderCard.style.display = 'none';
    resetBuilder();
  });

  // User Mode Switcher
  btnModeSingle?.addEventListener('click', () => setUserTargetMode('single'));
  btnModeMulti?.addEventListener('click', () => setUserTargetMode('multi'));
  btnModeAll?.addEventListener('click', () => setUserTargetMode('all'));

  function setUserTargetMode(mode) {
    targetUserMode = mode;
    [btnModeSingle, btnModeMulti, btnModeAll].forEach(btn => {
      if (!btn) return;
      btn.style.background = 'transparent';
      btn.style.color = 'var(--admin-text)';
    });

    if (mode === 'single') {
      btnModeSingle.style.background = '#f59e0b';
      btnModeSingle.style.color = '#fff';
      userSingleWrap.style.display = 'block';
      userMultiWrap.style.display = 'none';
      userAllWrap.style.display = 'none';
    } else if (mode === 'multi') {
      btnModeMulti.style.background = '#f59e0b';
      btnModeMulti.style.color = '#fff';
      userSingleWrap.style.display = 'none';
      userMultiWrap.style.display = 'block';
      userAllWrap.style.display = 'none';
      renderMultiUserList();
    } else if (mode === 'all') {
      btnModeAll.style.background = '#10b981';
      btnModeAll.style.color = '#fff';
      userSingleWrap.style.display = 'none';
      userMultiWrap.style.display = 'none';
      userAllWrap.style.display = 'block';
      if (allUsersCountEl) allUsersCountEl.textContent = allUsers.length;
    }
  }

  // Multi User Select Actions
  btnSelectAllUsers?.addEventListener('click', () => {
    multiSelectedUserIds = new Set(allUsers.map(u => u.id));
    renderMultiUserList();
  });

  btnDeselectAllUsers?.addEventListener('click', () => {
    multiSelectedUserIds.clear();
    renderMultiUserList();
  });

  multiSearchInput?.addEventListener('input', () => {
    renderMultiUserList();
  });

  function renderMultiUserList() {
    if (!multiUserList) return;
    const q = (multiSearchInput?.value || '').toLowerCase().trim();
    const filtered = allUsers.filter(u => {
      if (!q) return true;
      const name = (u.name || u.full_name || '').toLowerCase();
      const mob = (u.mobile || '').toLowerCase();
      const sid = (u.share_id || '').toLowerCase();
      return name.includes(q) || mob.includes(q) || sid.includes(q);
    });

    if (filtered.length === 0) {
      multiUserList.innerHTML = '<div style="grid-column: 1 / -1; text-align:center; padding:1rem; color:var(--admin-muted); font-size:0.85rem;">कोई यूजर नहीं मिला</div>';
      return;
    }

    multiUserList.innerHTML = filtered.map(u => {
      const isChecked = multiSelectedUserIds.has(u.id);
      return `
        <label style="display:flex; align-items:center; justify-content:space-between; padding:6px 10px; background:var(--admin-surface-2, #0f172a); border:1px solid ${isChecked ? '#f59e0b' : 'var(--admin-border, #334155)'}; border-radius:6px; cursor:pointer;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" class="adm-prod-user-checkbox" value="${u.id}" ${isChecked ? 'checked' : ''} style="accent-color:#f59e0b;" />
            <div>
              <div style="font-weight:700; font-size:0.85rem; color:var(--admin-text);">${u.name || u.full_name || 'User'}</div>
              <div style="font-size:0.72rem; color:var(--admin-muted);">${u.mobile} • ${u.share_id || '-'}</div>
            </div>
          </div>
        </label>
      `;
    }).join('');

    multiUserList.querySelectorAll('.adm-prod-user-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) multiSelectedUserIds.add(e.target.value);
        else multiSelectedUserIds.delete(e.target.value);
        if (multiCountBadge) multiCountBadge.textContent = `${multiSelectedUserIds.size} / ${allUsers.length} यूजर्स चुने गए`;
      });
    });
  }

  // Image Upload Compression
  imgFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1280;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) { h = Math.round((h * MAX_DIM) / w); w = MAX_DIM; }
          else { w = Math.round((w * MAX_DIM) / h); h = MAX_DIM; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        uploadedImageData = canvas.toDataURL('image/jpeg', 0.90);
        if (imgPreview) imgPreview.src = uploadedImageData;
        if (imgPreviewWrap) imgPreviewWrap.style.display = 'block';
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ==========================================
  // LOAD DATA
  // ==========================================
  // Master Landing Page Runtime Switch (Set true to enable, false for Egress Safe Mode)
  const LANDING_PAGES_ENABLED = true;

  async function loadData() {
    if (!LANDING_PAGES_ENABLED) {
      tableContainer.innerHTML = `
        <div class="admin-card" style="text-align:center;padding:2.5rem 1.5rem;background:rgba(234,179,8,0.08);border:1.5px solid #eab308;border-radius:12px;margin-top:12px;">
          <div style="font-size:2.2rem;margin-bottom:8px;">🛡️</div>
          <h3 style="color:#eab308;font-size:1.15rem;font-weight:800;margin-bottom:6px;">
            Product Landing Pages — Egress Safe Mode (Controlled OFF)
          </h3>
          <p style="color:var(--admin-muted);max-width:550px;margin:0 auto 12px;font-size:0.88rem;line-height:1.5;">
            Supabase Egress नियंत्रण के तहत प्रोडक्ट लैंडिंग पेज क्वेरीज़ को अस्थायी रूप से रोका गया है। डेटाबेस में आपका सारा डेटा 100% सुरक्षित है।
          </p>
          <div style="font-size:0.8rem;color:#22c55e;font-weight:700;">
            ✅ Core Selling System (Books, Checkout, Purchases, My Library) पूर्ण रूप से सक्रिय है।
          </div>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = '<div class="admin-loading">डेटाबेस से प्रोडक्ट लैंडिंग पेज लोड हो रहे हैं…</div>';

    const db = getAdminDb();
    let pagesList = [];
    allUsers = [];
    allProductLeads = [];

    // 1. Fetch Users
    try {
      const userRes = await fetchUsers({ status: 'all' });
      if (userRes && userRes.success && Array.isArray(userRes.data)) {
        allUsers = userRes.data.map(u => ({
          id: u.id,
          name: u.name || u.full_name || 'User',
          full_name: u.name || u.full_name || 'User',
          mobile: u.mobile || '-',
          share_id: u.shareId || u.share_id || 'AI000000',
          is_active: u.status === 'active' || u.is_active === true
        }));
      }
    } catch (e) {
      console.warn('fetchUsers notice', e);
    }

    // Populate user dropdown
    if (userSelect) {
      userSelect.innerHTML = '<option value="">-- यूजर चुनें (Select User: Name, Mobile, Share ID) --</option>';
      allUsers.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.name || u.full_name} (${u.mobile}) — Share ID: ${u.share_id}`;
        userSelect.appendChild(opt);
      });
    }

    // 2. Fetch Product Landing Pages & Leads
    if (db) {
      try {
        const [regLpRes, surveysRes] = await Promise.all([
          db.from('landing_pages').select('id, profile_id, share_id, title, message, category, content_type, status, mrp, offer_price, buynow_url, created_at').or('content_type.eq.product,category.eq.product').order('created_at', { ascending: false }),
          db.from('surveys').select('id, profile_id, name, mobile, age, sex, state, district, village, occupation, category_answers, created_at').order('created_at', { ascending: false })
        ]);

        if (regLpRes && regLpRes.data) {
          regLpRes.data.forEach(p => {
            if (!pagesList.some(x => x.id === p.id)) pagesList.push(p);
          });
        }
        if (surveysRes && surveysRes.data) {
          allProductLeads = surveysRes.data.filter(s => s.category_answers?.landing_page_id || s.category === 'product');
        }
      } catch (err) {
        console.warn('Supabase product pages query notice:', err);
      }
    }

    // 3. LocalStorage scan
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES' || key === 'UCAS_PRODUCT_LANDING_PAGES')) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const arr = Array.isArray(list) ? list : [list];
            arr.forEach(p => {
              if (p && p.id && (p.content_type === 'product' || p.product_data || p.category === 'product')) {
                if (!pagesList.some(existing => existing.id === p.id)) {
                  pagesList.push(p);
                }
              }
            });
          } catch (e) {}
        }
        if (key && key.startsWith('UCAS_PRODUCT_LEADS_')) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            list.forEach(l => allProductLeads.push(l));
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 4. Default Seed if 0
    if (pagesList.length === 0) {
      pagesList = [
        {
          id: 'PR001001',
          title: 'जैविक कृषि संपूर्ण पोषण किट (50% विशेष छूट)',
          category: 'agriculture',
          content_type: 'product',
          media_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
          thumbnail_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
          mrp: 1999,
          offer_price: 999,
          buynow_url: 'https://aarogyamindia.in',
          message: 'फसलों की पैदावार दोगुनी करने और मिट्टी को उपजाऊ बनाने के लिए संपूर्ण जैविक किट। अभी ऑर्डर करें!',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
    }

    allProductPages = pagesList;
    updateKPIs();
    renderTable();
  }

  function updateKPIs() {
    const total = allProductPages.length;
    const active = allProductPages.filter(p => (p.status || 'active') === 'active').length;
    const blocked = allProductPages.filter(p => p.status === 'blocked' || p.status === 'disabled').length;
    const leads = allProductLeads.length;

    const elTotal = document.getElementById('kpi-prod-total');
    const elActive = document.getElementById('kpi-prod-active');
    const elBlocked = document.getElementById('kpi-prod-blocked');
    const elLeads = document.getElementById('kpi-prod-leads');

    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elBlocked) elBlocked.textContent = blocked;
    if (elLeads) elLeads.textContent = leads;
  }

  // ==========================================
  // RENDER TABLE
  // ==========================================
  function getFilteredPages() {
    const query = (searchInput.value || '').toLowerCase().trim();
    const catVal = categoryFilter.value;
    const statusVal = statusFilter.value;

    return allProductPages.filter(p => {
      const pStatus = p.status || 'active';
      if (catVal !== 'all' && p.category !== catVal) return false;
      if (statusVal !== 'all' && pStatus !== statusVal) return false;
      if (query) {
        const title = (p.title || '').toLowerCase();
        const id = (p.id || '').toLowerCase();
        const sid = (p.share_id || '').toLowerCase();
        return title.includes(query) || id.includes(query) || sid.includes(query);
      }
      return true;
    });
  }

  function renderTable() {
    const filtered = getFilteredPages();
    const total = filtered.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE, total);
    const pageItems = filtered.slice(startIndex, endIndex);

    if (total === 0) {
      tableContainer.innerHTML = `
        <div class="admin-card" style="text-align:center; padding:3rem 1.5rem; color:var(--admin-muted);">
          <div style="font-size:2.5rem; margin-bottom:10px;">🛍️</div>
          <h3 style="margin:0 0 6px 0; color:var(--admin-text);">कोई प्रोडक्ट लैंडिंग पेज नहीं मिला</h3>
          <p style="font-size:0.85rem; margin:0 0 16px 0;">ऊपर '+ नया प्रोडक्ट लैंडिंग पेज बनाएं' बटन दबाकर नया प्रोडक्ट पेज बनाएं।</p>
        </div>
      `;
      return;
    }

    tableContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--admin-muted); margin-bottom:8px;">
        <span>दिखा रहे हैं <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${total}</strong> प्रोडक्ट पेजेस</span>
      </div>

      <div class="admin-table-wrapper sticky-header-table">
        <table class="admin-table">
          <thead>
            <tr>
              <th style="width: 45px;">#</th>
              <th>Product & Poster</th>
              <th>Price & Offer</th>
              <th>Creator (Attribution)</th>
              <th>Buy Now URL</th>
              <th>Leads / Clicks</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${pageItems.map((p, idx) => {
              const rowNum = startIndex + idx + 1;
              const pStatus = p.status || 'active';
              const pData = p.product_data || {};
              const mrp = pData.mrp || p.mrp || '-';
              const offerPrice = pData.offer_price || p.offer_price || '-';
              const buyUrl = pData.buynow_url || p.buynow_url || '#';
              const imgUrl = pData.image || p.media_url || p.thumbnail_url || 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';

              const creator = allUsers.find(u => u.id === p.profile_id);
              const creatorName = creator ? (creator.name || creator.full_name) : 'Admin Store';
              const creatorShareId = p.share_id || creator?.share_id || 'ADMIN';

              const pageLeads = allProductLeads.filter(l => l.landing_id === p.id || l.product_name === p.title);
              const publicUrl = `https://aarogyamindia.online/ucas/landing.html?id=${p.id}${creatorShareId ? '&share_id=' + creatorShareId : ''}`;

              return `
                <tr>
                  <td><strong>#${rowNum}</strong></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:10px;">
                      <img src="${imgUrl}" alt="${p.title}" style="width:50px; height:50px; object-fit:cover; border-radius:8px; border:1px solid var(--admin-border);" onerror="this.src='https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';" />
                      <div>
                        <div style="font-weight:700; color:var(--admin-text); font-size:0.92rem;">${p.title}</div>
                        <div style="font-size:0.75rem; color:var(--admin-muted);">ID: <code>${p.id}</code> • Cat: <strong>${p.category || 'product'}</strong></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style="display:flex; align-items:baseline; gap:6px;">
                      <span style="font-size:1.05rem; font-weight:800; color:#10b981;">₹${offerPrice}</span>
                      ${mrp !== '-' ? `<span style="font-size:0.8rem; color:#94a3b8; text-decoration:line-through;">₹${mrp}</span>` : ''}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight:600; color:var(--admin-text); font-size:0.85rem;">${creatorName}</div>
                    <div style="font-size:0.75rem; color:#3b82f6;"><code>${creatorShareId}</code></div>
                  </td>
                  <td>
                    <a href="${buyUrl}" target="_blank" class="admin-subtle-link" style="font-size:0.78rem; max-width:140px; display:inline-block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${buyUrl}">
                      🔗 ${buyUrl}
                    </a>
                  </td>
                  <td>
                    <button type="button" class="btn-view-prod-leads admin-button small-button" data-page-id="${p.id}" style="background:rgba(59,130,246,0.15); color:#3b82f6; font-weight:800; border:1px solid rgba(59,130,246,0.3);">
                      📥 ${pageLeads.length} Leads
                    </button>
                  </td>
                  <td>
                    ${pStatus === 'active' ? `
                      <span style="background:rgba(16,185,129,0.15); color:#10b981; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;">🟢 Active</span>
                    ` : pStatus === 'pending_review' ? `
                      <span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;">⏳ Pending</span>
                    ` : `
                      <span style="background:rgba(239,68,68,0.15); color:#ef4444; padding:3px 8px; border-radius:12px; font-size:0.75rem; font-weight:700;">🔴 Blocked</span>
                    `}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px; align-items: center;">
                      <button type="button" class="btn-edit-prod admin-button small-button" data-page-id="${p.id}" style="background:#3b82f6; color:#fff;">
                        ✏️ Edit
                      </button>
                      <a href="${publicUrl}" target="_blank" class="admin-button small-button icon-button" title="Open Public URL" style="background:var(--admin-surface); color:var(--admin-text); border:1px solid var(--admin-border);">
                        👁️
                      </a>
                      <button type="button" class="btn-delete-prod admin-button small-button icon-button" data-page-id="${p.id}" title="Delete" style="color:#ef4444; border:1px solid rgba(239,68,68,0.3);">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Action listeners
    tableContainer.querySelectorAll('.btn-edit-prod').forEach(btn => {
      btn.addEventListener('click', () => startEditPage(btn.dataset.pageId));
    });

    tableContainer.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', () => deletePage(btn.dataset.pageId));
    });

    tableContainer.querySelectorAll('.btn-view-prod-leads').forEach(btn => {
      btn.addEventListener('click', () => openLeadsDrawer(btn.dataset.pageId));
    });
  }

  function startEditPage(pageId) {
    const page = allProductPages.find(p => p.id === pageId);
    if (!page) return;

    editingPageId = page.id;
    builderCard.style.display = 'block';
    builderTitle.textContent = `✏️ प्रोडक्ट संपादित करें: ${page.title || page.id}`;
    saveBtn.innerHTML = '💾 Update Product Page (अपडेट करें)';
    cancelEditBtn.style.display = 'inline-flex';

    setUserTargetMode('single');

    titleInput.value = page.title || '';
    categorySelect.value = page.category || 'product';
    const pData = page.product_data || {};
    mrpInput.value = pData.mrp || page.mrp || '';
    offerPriceInput.value = pData.offer_price || page.offer_price || '';
    buyNowUrlInput.value = pData.buynow_url || page.buynow_url || '';
    messageInput.value = page.message || '';
    statusSelect.value = page.status || 'active';

    if (userSelect && page.profile_id) {
      userSelect.value = page.profile_id;
    }

    uploadedImageData = pData.image || page.media_url || page.thumbnail_url;
    if (uploadedImageData && imgPreview) {
      imgPreview.src = uploadedImageData;
      imgPreviewWrap.style.display = 'block';
    }

    builderCard.scrollIntoView({ behavior: 'smooth' });
  }

  function resetBuilder() {
    editingPageId = null;
    builderTitle.textContent = 'नया प्रोडक्ट लैंडिंग पेज बनाएं (Product Creator)';
    saveBtn.innerHTML = '✨ Generate & Save Product Page';
    cancelEditBtn.style.display = 'none';
    resultCard.style.display = 'none';

    titleInput.value = '';
    categorySelect.value = 'product';
    mrpInput.value = '';
    offerPriceInput.value = '';
    buyNowUrlInput.value = '';
    messageInput.value = '';
    statusSelect.value = 'active';
    if (userSelect) userSelect.value = '';
    if (imgFileInput) imgFileInput.value = '';
    if (imgPreviewWrap) imgPreviewWrap.style.display = 'none';
    uploadedImageData = null;
  }

  async function deletePage(pageId) {
    if (!confirm(`क्या आप वाकई प्रोडक्ट पेज (${pageId}) को हटाना चाहते हैं?`)) return;

    const db = getAdminDb();
    if (db) {
      try {
        await db.from('landing_pages').delete().eq('id', pageId);
      } catch (e) {}
    }

    // LocalStorage delete
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_PRODUCT_LANDING_PAGES')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter(item => item.id !== pageId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      }
    } catch (e) {}

    allProductPages = allProductPages.filter(p => p.id !== pageId);
    updateKPIs();
    renderTable();
    alert('🗑️ प्रोडक्ट लैंडिंग पेज हटा दिया गया!');
  }

  function openLeadsDrawer(pageId) {
    const page = allProductPages.find(p => p.id === pageId);
    if (!page || !drawerOverlay || !drawerTitle || !drawerBody) return;

    const leads = allProductLeads.filter(l => l.landing_id === page.id || l.product_name === page.title);

    drawerTitle.innerHTML = `<span>🛍️ ${page.title} — Leads (${leads.length})</span>`;
    drawerBody.innerHTML = `
      <div style="background:var(--admin-surface-2, #0f172a); border:1px solid var(--admin-border); border-radius:10px; padding:12px; margin-bottom:14px;">
        <div style="font-weight:700; color:var(--admin-text);">${page.title}</div>
        <div style="font-size:0.8rem; color:#10b981; margin-top:2px;">Offer Price: ₹${page.offer_price || page.product_data?.offer_price || '-'} • MRP: ₹${page.mrp || page.product_data?.mrp || '-'}</div>
      </div>

      ${leads.length === 0 ? `
        <div class="admin-empty" style="text-align:center; padding:2rem; color:var(--admin-muted);">
          अभी तक इस प्रोडक्ट पर कोई Buy Now क्लिक / लीड प्राप्त नहीं हुई है।
        </div>
      ` : `
        <div class="admin-table-wrapper">
          <table class="admin-table" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th>#</th>
                <th>Buyer Name</th>
                <th>Mobile</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              ${leads.map((l, i) => `
                <tr>
                  <td><strong>#${i + 1}</strong></td>
                  <td style="font-weight:700;">${l.name || 'Buyer'}</td>
                  <td>
                    <a href="tel:${l.mobile}" class="admin-subtle-link">📞 ${l.mobile || '-'}</a>
                  </td>
                  <td style="font-size:0.75rem; color:var(--admin-muted);">${l.created_at ? new Date(l.created_at).toLocaleString('hi-IN') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `}
    `;

    drawerOverlay.style.display = 'flex';
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const mrp = mrpInput.value.trim();
    const offerPrice = offerPriceInput.value.trim();
    const buyNowUrl = buyNowUrlInput.value.trim();
    const message = messageInput.value.trim();
    const status = statusSelect.value;

    if (!title) { alert('कृपया प्रोडक्ट शीर्षक दर्ज करें।'); return; }
    if (!offerPrice) { alert('कृपया ऑफर मूल्य दर्ज करें।'); return; }
    if (!buyNowUrl) { alert('कृपया थर्ड-पार्टी Buy Now लिंक दर्ज करें।'); return; }

    let targetUsers = [];
    if (editingPageId) {
      const selId = userSelect.value;
      const selUser = allUsers.find(u => u.id === selId);
      targetUsers = selUser ? [selUser] : [{ id: 'admin_store', name: 'Admin Store', share_id: 'ADMIN' }];
    } else {
      if (targetUserMode === 'single') {
        const selId = userSelect.value;
        const selUser = allUsers.find(u => u.id === selId);
        targetUsers = selUser ? [selUser] : [{ id: 'admin_store', name: 'Admin Store', share_id: 'ADMIN' }];
      } else if (targetUserMode === 'multi') {
        targetUsers = allUsers.filter(u => multiSelectedUserIds.has(u.id));
      } else if (targetUserMode === 'all') {
        targetUsers = [...allUsers];
      }
    }

    const defaultBanner = 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';
    const finalMediaUrl = uploadedImageData || defaultBanner;
    const productData = {
      mrp: mrp,
      offer_price: offerPrice,
      buynow_url: buyNowUrl,
      image: finalMediaUrl
    };

    const db = getAdminDb();
    saveBtn.disabled = true;
    saveBtn.innerHTML = `⏳ सेव हो रहा है...`;

    try {
      if (editingPageId) {
        const targetUser = targetUsers[0];
        const updatePayload = {
          title: title,
          category: category,
          content_type: 'product',
          media_url: finalMediaUrl,
          thumbnail_url: finalMediaUrl,
          message: message,
          product_data: productData,
          mrp: mrp ? Number(mrp) : null,
          offer_price: Number(offerPrice),
          buynow_url: buyNowUrl,
          status: status,
          og_title: title.includes('Aarogyam India') ? title : `${title} | Aarogyam India`,
          og_description: message.slice(0, 160),
          og_image_url: finalMediaUrl,
          created_by_admin: true
        };

        if (db) {
          try {
            await Promise.all([
              db.from('product_landing_pages').update(updatePayload).eq('id', editingPageId),
              db.from('landing_pages').update(updatePayload).eq('id', editingPageId)
            ]);
          } catch (e) {}
        }

        // LocalStorage Sync
        try {
          const localKey = `UCAS_LP_${targetUser.id}`;
          const list = JSON.parse(localStorage.getItem(localKey) || '[]');
          const idx = list.findIndex(p => p.id === editingPageId);
          if (idx >= 0) list[idx] = { ...list[idx], ...updatePayload, id: editingPageId };
          localStorage.setItem(localKey, JSON.stringify(list));
        } catch (e) {}

        alert(`✅ प्रोडक्ट लैंडिंग पेज (${editingPageId}) अपडेट हो गया!`);
        showResult({ ...updatePayload, id: editingPageId, share_id: targetUser.share_id });
        await loadData();
      } else {
        const batch = [];
        const nowIso = new Date().toISOString();

        targetUsers.forEach(u => {
          const rand = Math.floor(100000 + Math.random() * 900000);
          const lpId = `PR${rand}`;
          const p = {
            id: lpId,
            profile_id: u.id,
            share_id: u.share_id || 'ADMIN',
            title: title,
            category: category,
            content_type: 'product',
            media_url: finalMediaUrl,
            thumbnail_url: finalMediaUrl,
            message: message,
            product_data: productData,
            mrp: mrp ? Number(mrp) : null,
            offer_price: Number(offerPrice),
            buynow_url: buyNowUrl,
            status: status,
            og_title: title.includes('Aarogyam India') ? title : `${title} | Aarogyam India`,
            og_description: message.slice(0, 160),
            og_image_url: finalMediaUrl,
            created_by_admin: true,
            created_at: nowIso
          };
          batch.push(p);

          try {
            const localKey = `UCAS_LP_${u.id}`;
            const list = JSON.parse(localStorage.getItem(localKey) || '[]');
            list.unshift(p);
            localStorage.setItem(localKey, JSON.stringify(list));
          } catch (e) {}
        });

        if (db) {
          try {
            await Promise.all([
              db.from('product_landing_pages').insert(batch),
              db.from('landing_pages').insert(batch)
            ]);
          } catch (e) {}
        }

        alert(`🎉 कुल ${batch.length} प्रोडक्ट लैंडिंग पेज सफलतापूर्वक बनाए गए!`);
        showResult(batch[0]);
        await loadData();
      }
    } catch (err) {
      console.error('Save product page error', err);
      alert('सेव करने में त्रुटि हुई।');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = editingPageId ? '💾 Update Product Page' : '✨ Generate & Save Product Page';
    }
  });

  function showResult(p) {
    const publicUrl = `https://aarogyamindia.online/ucas/landing.html?id=${p.id}&share_id=${p.share_id || 'ADMIN'}`;
    resultUrlInput.value = publicUrl;

    document.getElementById('prod_btn_copy_url').onclick = () => {
      navigator.clipboard.writeText(publicUrl);
      alert('📋 प्रोडक्ट शेयर लिंक कॉपी हो गया:\n' + publicUrl);
    };

    document.getElementById('prod_btn_wa_share').onclick = () => {
      const waMsg = `🛍️ *${p.title}*\n\n💰 विशेष ऑफर मूल्य: ₹${p.offer_price}\n\n👉 अभी ऑर्डर करें:\n${publicUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`, '_blank');
    };

    document.getElementById('prod_btn_open_public').onclick = () => {
      window.open(publicUrl, '_blank');
    };

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }

  // Filter Listeners
  searchInput?.addEventListener('input', () => { currentPage = 1; renderTable(); });
  categoryFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  statusFilter?.addEventListener('change', () => { currentPage = 1; renderTable(); });
  refreshBtn?.addEventListener('click', loadData);

  await loadData();
}
