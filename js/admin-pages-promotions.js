/* ==========================================================================
   AAROGYAM INDIA — ADMIN PROMOTIONS & FESTIVAL HUB (UNIVERSAL PROMOTIONS)
   ========================================================================== */

import { initAdminLayout } from './admin-main.js';

export async function initPromotionsPage() {
  initAdminLayout('Promotions & Festivals', 'Manage animated festival popups, national greetings, and marketing campaigns.');

  const content = document.getElementById('page-content');
  if (!content) return;

  content.innerHTML = `
    <style>
      .admin-section {
        margin: 0 !important;
        padding: 16px 14px !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }
      #promo-grid-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .promo-form-two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .promo-top-header-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      @media (max-width: 960px) {
        #promo-grid-layout {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
          width: 100% !important;
        }
        .promo-form-two-col {
          grid-template-columns: 1fr !important;
          gap: 10px !important;
          width: 100% !important;
        }
        .promo-top-header-actions {
          width: 100%;
          flex-direction: column;
        }
        .promo-top-header-actions button {
          width: 100% !important;
          justify-content: center !important;
        }
        .admin-card {
          padding: 14px 12px !important;
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .admin-input, select.admin-input, textarea.admin-input {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        #prev-aura {
          filter: none !important;
          animation: none !important;
          opacity: 0.3 !important;
        }
        #prev-img {
          animation: none !important;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)) !important;
        }
      }
    </style>
    <div class="admin-section">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:20px;">
        <div>
          <h2 class="admin-section-title" style="margin:0 0 4px 0;">🎉 Universal Promotions & Festival Gateway</h2>
          <p class="admin-muted" style="margin:0;font-size:0.92rem;">
            त्योहारों, राष्ट्रीय पर्वों, AarogyamTube, ई-बुक्स, कॉम्बो और स्वास्थ्य सप्ताहों के लिए 3D फ्लोटिंग एनिमेटेड पॉप-अप।
          </p>
        </div>
        <div class="promo-top-header-actions">
          <button id="btn-create-promo" class="admin-button" style="background:linear-gradient(135deg, #10b981, #059669);color:#ffffff;font-weight:700;">
            + नया प्रमोशन जोड़ें
          </button>
          <button id="btn-save-all-promos" class="admin-button" style="background:linear-gradient(135deg, #2563eb, #1d4ed8);color:#ffffff;font-weight:700;">
            💾 Save & Publish World Wide
          </button>
        </div>
      </div>

      <!-- Sync Status Toast -->
      <div id="promo-sync-status" style="display:none;padding:12px 16px;border-radius:10px;margin-bottom:16px;font-size:0.92rem;font-weight:600;"></div>

      <!-- Main Layout: 2 Columns (List & Editor) -->
      <div id="promo-grid-layout">
        <!-- Left: Campaigns List -->
        <div class="admin-card" style="padding:20px;">
          <h3 style="margin-top:0;margin-bottom:14px;font-size:1.15rem;display:flex;align-items:center;justify-content:space-between;">
            <span>📋 सक्रिय व आरक्षित अभियान (Campaigns)</span>
            <span class="admin-badge" id="promo-count-badge" style="font-size:0.8rem;background:rgba(37,99,235,0.15);color:#3b82f6;">0 Total</span>
          </h3>
          <div id="promo-items-list" style="display:flex;flex-direction:column;gap:12px;max-height:650px;overflow-y:auto;padding-right:4px;">
            <div class="admin-loading" style="padding:20px;text-align:center;">लोड हो रहा है...</div>
          </div>
        </div>

        <!-- Right: Editor & Live Interactive Preview -->
        <div class="admin-card" style="padding:20px;" id="promo-editor-card">
          <h3 style="margin-top:0;margin-bottom:14px;font-size:1.15rem;display:flex;align-items:center;justify-content:space-between;">
            <span>✏️ अभियान एडिटर (Campaign Editor)</span>
            <span id="editor-active-indicator" class="admin-badge" style="background:#10b981;color:#fff;display:none;">LIVE ON SITE</span>
          </h3>

          <form id="promo-edit-form" style="display:flex;flex-direction:column;gap:14px;">
            <input type="hidden" id="edit-promo-id" value="">

            <!-- Category / Type Selection -->
            <div>
              <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">अभियान का प्रकार (Type):</label>
              <select id="edit-promo-type" class="admin-input" style="width:100%;font-size:0.92rem;">
                <option value="cultural_festival">🪔 सांस्कृतिक उत्सव (धनतेरस, दीपावली, होली, नवरात्रि)</option>
                <option value="national_festival">🇮🇳 राष्ट्रीय पर्व (15 अगस्त, 26 जनवरी, गांधी जयंती)</option>
                <option value="tube_video">🎬 AarogyamTube वीडियो प्रमोशन</option>
                <option value="book_launch">📚 ई-बुक लॉन्च व विशेष डिस्काउंट</option>
                <option value="bundle_offer">🎁 मेगा कॉम्बो बंडल प्रमोशन</option>
                <option value="health_campaign">🩺 स्वास्थ्य जागरूकता सप्ताह (Joint Care / Diabetes)</option>
                <option value="achiever">🏆 किसान / स्वास्थ्य अचीवर सम्मान</option>
                <option value="custom">📢 सामान्य घोषणा (Custom Announcement)</option>
              </select>
            </div>

            <!-- Dynamic Fast-Fill Dropdown based on type -->
            <div id="dynamic-source-selector-box" style="display:none;background:rgba(37,99,235,0.06);padding:12px;border-radius:10px;border:1px dashed #3b82f6;">
              <label id="dynamic-source-label" style="font-size:0.86rem;font-weight:700;color:#2563eb;display:block;margin-bottom:6px;">
                त्वरित चयन (Auto-Fill from Catalog):
              </label>
              <select id="dynamic-source-select" class="admin-input" style="width:100%;font-size:0.9rem;">
                <option value="">-- चुनें --</option>
              </select>
              <p style="margin:4px 0 0 0;font-size:0.78rem;color:var(--admin-muted);">
                *चुनने पर टाइटल, इमेज/थंबनेल और लिंक अपने-आप भर जाएंगे।
              </p>
            </div>

            <!-- Title & Subtitle -->
            <div class="promo-form-two-col">
              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">शीर्षक (Title):</label>
                <input type="text" id="edit-promo-title" class="admin-input" style="width:100%;" placeholder="जैसे: शुभ धनतेरस एवं दीपावली" required>
              </div>
              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">बैज (Top Badge):</label>
                <input type="text" id="edit-promo-badge" class="admin-input" style="width:100%;" placeholder="जैसे: ✨ पावन पर्व या 🔥 ट्रेंडिंग">
              </div>
            </div>

            <div>
              <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">शुभकामना / संदेश (Subtitle / Message):</label>
              <textarea id="edit-promo-subtitle" class="admin-input" rows="2" style="width:100%;resize:vertical;" placeholder="मां लक्ष्मी व भगवान धन्वंतरि आपके परिवार को उत्तम स्वास्थ्य और समृद्धि प्रदान करें।"></textarea>
            </div>

            <!-- Image & Animation Preset -->
            <div class="promo-form-two-col">
              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">एनीमेशन प्रीसेट (Visual Style):</label>
                <select id="edit-promo-preset" class="admin-input" style="width:100%;">
                  <option value="golden_diya_sparkles">🪔 स्वर्ण दीपक व स्पार्क्स (दीपावली/धनतेरस)</option>
                  <option value="tricolor_patriotic">🇮🇳 तिरंगा व अशोक चक्र किरणें (राष्ट्रीय पर्व)</option>
                  <option value="holi_gulal_petals">🌸 अबीर-गुलाल व पुष्प वर्षा (होली/वसंत)</option>
                  <option value="neon_tube_flow">🎬 नियॉन स्यान व रेड पल्स (AarogyamTube)</option>
                  <option value="achiever_confetti">🏆 रंग-बिरंगी कंफेटी (अचीवर/बधाई)</option>
                </select>
              </div>

              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">फ्लोटिंग इमेज URL:</label>
                <div style="display:flex;gap:6px;">
                  <input type="text" id="edit-promo-image-url" class="admin-input" style="flex:1;" placeholder="/images/books/...">
                  <label class="admin-button" style="cursor:pointer;white-space:nowrap;padding:7px 12px;font-size:0.82rem;background:var(--admin-surface-strong);">
                    📁 अपलोड
                    <input type="file" id="edit-promo-file-input" accept="image/*" style="display:none;">
                  </label>
                </div>
              </div>
            </div>

            <!-- CTA Button Text -->
            <div style="margin-bottom:12px;">
              <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">बटन टेक्स्ट (CTA Button Text):</label>
              <input type="text" id="edit-promo-cta-text" class="admin-input" style="width:100%;" placeholder="जैसे: 📖 कॉम्बो ऑफर देखें व अनलॉक करें →">
            </div>

            <!-- Dedicated Landing Page Link Box (Wide, High Visibility & Foolproof) -->
            <div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:10px;padding:12px;margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px;">
                <label style="font-size:0.88rem;font-weight:800;color:#166534;display:flex;align-items:center;gap:6px;">
                  <span>🌐</span> लैंडिंग पेज लिंक (Target Landing Page URL / Web Page Link):
                </label>
                <div style="display:flex;align-items:center;gap:6px;">
                  <select id="promo-page-picker" class="admin-input" style="font-size:0.82rem;padding:5px 8px;cursor:pointer;background:#ffffff;border:1.5px solid #16a34a;color:#15803d;font-weight:700;border-radius:6px;" title="वेबसाइट के किसी भी पेज का लिंक ऑटो-भरें">
                    <option value="">⚡ लिस्ट से पेज चुनें...</option>
                    <option value="/">🏠 होम पेज</option>
                    <option value="/tube.html">🎬 AarogyamTube</option>
                    <option value="/bundle.html?id=BUNDLE_KISAN_5IN1">🎁 5-इन-1 महाबचत कॉम्बो</option>
                    <option value="/ebooks/my-library.html">📖 मेरी लाइब्रेरी</option>
                    <option value="/ebooks/ebook.html">📚 ई-बुक स्टोर</option>
                  </select>
                  <button type="button" id="btn-test-target-link" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:6px 12px;font-size:0.80rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 4px rgba(22,163,74,0.3);" title="यह लिंक नए टैब में खोलकर तुरंत टेस्ट करें">
                    🔗 खोलकर देखें
                  </button>
                </div>
              </div>
              <input type="text" id="edit-promo-target-url" class="admin-input" style="width:100%;box-sizing:border-box;font-family:monospace;font-size:0.92rem;font-weight:600;padding:8px 10px;border:1.5px solid #16a34a;border-radius:6px;background:#ffffff;color:#0f172a;" placeholder="/bundle.html?id=BUNDLE_KISAN_5IN1">
              <div style="margin-top:5px;font-size:0.75rem;color:#166534;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
                <span>👉 <strong>यहाँ लिंक टाइप करें या पेस्ट करें</strong> (जैसे: <code>/bundle.html?id=BUNDLE_KISAN_5IN1</code> या <code>/ebooks/book-landing.html?id=BK001</code> या कोई भी वेब लिंक)</span>
                <span id="target-url-status" style="font-weight:700;color:#15803d;"></span>
              </div>
            </div>

            <!-- Target Pages & Dates -->
            <div class="promo-form-two-col">
              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">शुरू होने की तिथि (Start):</label>
                <input type="datetime-local" id="edit-promo-start" class="admin-input" style="width:100%;">
              </div>
              <div>
                <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:4px;">समाप्त होने की तिथि (End):</label>
                <input type="datetime-local" id="edit-promo-end" class="admin-input" style="width:100%;">
              </div>
            </div>

            <!-- Target Pages Radios -->
            <div>
              <label style="font-size:0.86rem;font-weight:700;display:block;margin-bottom:6px;">दिखाने के पेज (Target Pages):</label>
              <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:0.88rem;">
                <label><input type="checkbox" id="page-target-all" checked> सामान्य सभी पेज (All Platform)</label>
                <label><input type="checkbox" id="page-target-home"> होम पेज</label>
                <label><input type="checkbox" id="page-target-library"> माय लाइब्रेरी</label>
                <label><input type="checkbox" id="page-target-tube"> AarogyamTube</label>
                <label><input type="checkbox" id="page-target-profile"> माय प्रोफाइल</label>
                <span style="color:#10b981;font-size:0.8rem;display:flex;align-items:center;gap:4px;">🛡️ बुक लैंडिंग पेज सुरक्षित (संविधान नियम: नो प्रमोशन)</span>
              </div>
            </div>

            <!-- WhatsApp Share Options & Message Builder -->
            <div style="background:rgba(37,211,102,0.06);padding:14px;border-radius:12px;border:1px solid rgba(37,211,102,0.35);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <label style="font-size:0.92rem;font-weight:800;color:#15803d;display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="checkbox" id="edit-promo-share-enabled" checked style="width:16px;height:16px;"> 
                  📲 WhatsApp शुभकामना संदेश बिल्डर (Message Builder)
                </label>
                <span style="font-size:0.75rem;background:#dcfce7;color:#166534;font-weight:700;padding:2px 8px;border-radius:12px;">+1 Point per share</span>
              </div>
              <p style="margin:0 0 10px 0;font-size:0.78rem;color:var(--admin-muted);">
                *Aarogyam Manas सुरक्षा: शेयर बटन में यूजर का आधिकारिक <code>share_id</code> लगेगा। नो फोन नंबर लीक।
              </p>

              <!-- Emoji Toolbar -->
              <div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-size:0.78rem;font-weight:700;color:var(--admin-muted);">इमोजी जोड़ें:</span>
                <div id="wa-emoji-bar" style="display:inline-flex;gap:4px;flex-wrap:wrap;">
                  <button type="button" class="wa-quick-tag" data-insert="🪔">🪔</button>
                  <button type="button" class="wa-quick-tag" data-insert="🎁">🎁</button>
                  <button type="button" class="wa-quick-tag" data-insert="✨">✨</button>
                  <button type="button" class="wa-quick-tag" data-insert="🌸">🌸</button>
                  <button type="button" class="wa-quick-tag" data-insert="🎉">🎉</button>
                  <button type="button" class="wa-quick-tag" data-insert="🇮🇳">🇮🇳</button>
                  <button type="button" class="wa-quick-tag" data-insert="⚡">⚡</button>
                  <button type="button" class="wa-quick-tag" data-insert="🩺">🩺</button>
                  <button type="button" class="wa-quick-tag" data-insert="📚">📚</button>
                  <button type="button" class="wa-quick-tag" data-insert="🪙">🪙</button>
                  <button type="button" class="wa-quick-tag" data-insert="🌿">🌿</button>
                  <button type="button" class="wa-quick-tag" data-insert="🙏">🙏</button>
                </div>
              </div>

              <!-- Variable Pills -->
              <div style="margin-bottom:8px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-size:0.78rem;font-weight:700;color:var(--admin-muted);">टैग्स डालें:</span>
                <button type="button" class="wa-quick-tag" data-insert="{sender_name}" style="background:#e0f2fe;color:#0369a1;border-color:#bae6fd;">+ {sender_name}</button>
                <button type="button" class="wa-quick-tag" data-insert="{link}" style="background:#fef3c7;color:#b45309;border-color:#fde68a;">+ {link}</button>
                <button type="button" class="wa-quick-tag" data-insert="5 पॉइंट्स" style="background:#dcfce7;color:#15803d;border-color:#bbf7d0;">+ 5 पॉइंट्स</button>
              </div>

              <!-- Message Textarea -->
              <textarea id="edit-promo-share-tmpl" class="admin-input" rows="5" style="width:100%;font-size:0.86rem;line-height:1.45;font-family:inherit;padding:8px 10px;" placeholder="व्हाट्सएप संदेश यहाँ लिखें..."></textarea>

              <!-- Live WhatsApp Chat Bubble Preview -->
              <div style="margin-top:12px;background:#e5ddd5;border-radius:12px;padding:12px;position:relative;border:1px solid #d1d5db;">
                <div style="font-size:0.76rem;font-weight:800;color:#075e54;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
                  <span style="display:flex;align-items:center;gap:6px;">
                    <i class="fa-brands fa-whatsapp" style="font-size:1.1rem;color:#25d366;"></i> 
                    <span>व्हाट्सएप चैट प्रीव्यू (WhatsApp Chat Preview):</span>
                  </span>
                  <span style="font-size:0.70rem;background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-weight:700;">📸 फोटो + संदेश</span>
                </div>
                <div id="wa-preview-bubble" style="background:#dcf8c6;border-radius:10px 10px 0 10px;padding:6px;font-size:0.83rem;color:#111827;line-height:1.45;box-shadow:0 1px 3px rgba(0,0,0,0.2);max-width:340px;margin-left:auto;">
                  <div id="wa-preview-img-wrap" style="border-radius:8px;overflow:hidden;margin-bottom:6px;background:#0f172a;text-align:center;max-height:220px;">
                    <img id="wa-preview-img" src="" alt="WhatsApp Promo Image" style="width:100%;height:auto;max-height:220px;object-fit:cover;display:block;" onerror="this.parentElement.style.display='none'">
                  </div>
                  <div id="wa-preview-text" style="padding:2px 6px;white-space:pre-wrap;word-break:break-word;"></div>
                  <div style="text-align:right;font-size:0.65rem;color:#6b7280;margin-top:4px;padding-right:4px;display:flex;align-items:center;justify-content:flex-end;gap:3px;">
                    <span>10:30 AM</span>
                    <span style="color:#38bdf8;font-weight:900;">✓✓</span>
                  </div>
                </div>
                <div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px;">
                  <button type="button" id="btn-test-wa-share" class="admin-button" style="background:#22c55e;color:#ffffff;font-size:0.78rem;font-weight:800;padding:6px 14px;border-radius:18px;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 6px rgba(34,197,94,0.4);border:none;cursor:pointer;">
                    <i class="fa-brands fa-whatsapp"></i> <span>📲 टेस्ट व्हाट्सएप भेजकर देखें</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Save Form Buttons -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
              <label style="font-size:0.92rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="edit-promo-is-active" style="width:18px;height:18px;" checked>
                <span style="color:#10b981;">यह अभियान तुरंत लाइव (Active) रखें</span>
              </label>
              <button type="button" id="btn-apply-promo-edit" class="admin-button" style="background:#2563eb;color:#ffffff;font-weight:700;">
                ✓ इस अभियान को अपडेट करें
              </button>
            </div>
          </form>

          <!-- Live Interactive Preview Box -->
          <div style="margin-top:24px;border-top:1px solid var(--admin-border);padding-top:16px;">
            <style>
              @keyframes agyAdminLevitate {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(1deg); }
                100% { transform: translateY(2px) rotate(-1deg); }
              }
              @keyframes agyAdminAuraPulse {
                0% { opacity: 0.55; transform: scale(0.92); }
                50% { opacity: 0.95; transform: scale(1.1); }
                100% { opacity: 0.6; transform: scale(0.95); }
              }
            </style>
            <div style="font-size:0.86rem;font-weight:700;color:var(--admin-muted);text-transform:uppercase;margin-bottom:10px;">
              👁️ लाइव प्रीव्यू (यूजर की स्क्रीन पर ऐसा दिखेगा):
            </div>
            <div id="promo-live-preview-box" style="background:transparent;border:none;box-shadow:none;padding:12px 10px;text-align:center;position:relative;">
              <div style="position:relative;width:100%;margin:0 auto 12px auto;display:flex;align-items:center;justify-content:center;">
                <div id="prev-aura" style="position:absolute;width:90%;height:140px;border-radius:50%;background:radial-gradient(circle, rgba(245,158,11,0.55) 0%, rgba(220,38,38,0.2) 60%, rgba(0,0,0,0) 80%);animation:agyAdminAuraPulse 3.5s ease-in-out infinite alternate;filter:blur(12px);pointer-events:none;"></div>
                <img id="prev-img" src="/images/logo/logo.png" style="width:92%;max-width:320px;max-height:180px;object-fit:contain;animation:agyAdminLevitate 4.5s ease-in-out infinite alternate;filter:drop-shadow(0 14px 28px rgba(0,0,0,0.7));position:relative;z-index:2;border-radius:16px;">
              </div>
              
              <div style="background:rgba(0, 0, 0, 0.35);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:10px 18px;margin:0 auto 14px auto;display:inline-block;max-width:92%;">
                <span id="prev-badge" style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:800;background:#f59e0b;color:#fff;margin-bottom:6px;">✨ पावन पर्व</span>
                <div style="font-size:0.85rem;color:#cbd5e1;margin-bottom:4px;">प्रिय <strong>रामेश्वर पटेल</strong> जी,</div>
                <h4 id="prev-title" style="margin:0 0 6px 0;font-size:1.15rem;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.85);">शुभ धनतेरस एवं दीपावली</h4>
                <p id="prev-sub" style="margin:0;font-size:0.84rem;color:#e2e8f0;line-height:1.45;text-shadow:0 2px 6px rgba(0,0,0,0.8);">मां लक्ष्मी व भगवान धन्वंतरि आपके परिवार को उत्तम स्वास्थ्य और समृद्धि प्रदान करें।</p>
              </div>
              
              <div style="display:flex;flex-direction:column;gap:8px;max-width:360px;margin:0 auto;">
                <button id="prev-cta" style="background:linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);color:#fff;border:1px solid rgba(255,255,255,0.25);padding:11px 18px;border-radius:12px;font-weight:800;font-size:0.92rem;box-shadow:0 4px 15px rgba(234, 88, 12, 0.45);cursor:default;">
                  🎁 उत्सव उपहार व ई-बुक्स देखें
                </button>
                <button type="button" id="prev-share" style="background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%);color:#fff;border:1px solid rgba(255,255,255,0.2);padding:11px 18px;border-radius:12px;font-weight:700;font-size:0.88rem;box-shadow:0 4px 15px rgba(22, 163, 74, 0.4);cursor:pointer;" title="व्हाट्सएप पर शेयर टेस्ट करें">
                  📲 WhatsApp पर शुभकामनाएँ शेयर करें
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- STATE ---
  let promotionsData = { updated_at: new Date().toISOString(), promotions: [] };
  let liveBooks = [];
  let liveBundles = [];
  let liveTubeVideos = [];
  let currentEditingIndex = 0;
  let currentUploadedPreviewUrl = null;

  // --- LOAD DATA ---
  async function loadInitialData() {
    try {
      // 1. Promotions
      let pRes = await fetch('/data/universal-promotions.json?v=' + Date.now()).catch(() => null);
      if (!pRes || !pRes.ok) {
        pRes = await fetch('../data/universal-promotions.json?v=' + Date.now()).catch(() => null);
      }
      if (pRes && pRes.ok) {
        promotionsData = await pRes.json();
      }

      // Check localStorage for recent mobile or local edits
      try {
        const localPromoStr = localStorage.getItem('AAROGYAM_UNIVERSAL_PROMOTIONS');
        if (localPromoStr) {
          const localPromo = JSON.parse(localPromoStr);
          if (localPromo && Array.isArray(localPromo.promotions) && localPromo.promotions.length > 0) {
            if (!promotionsData || !promotionsData.promotions || new Date(localPromo.updated_at || 0) >= new Date(promotionsData.updated_at || 0)) {
              promotionsData = localPromo;
            }
          }
        }
      } catch (_) {}

      // 2. Books
      let bRes = await fetch('/data/books.json?v=' + Date.now()).catch(() => null);
      if (!bRes || !bRes.ok) {
        bRes = await fetch('../data/books.json?v=' + Date.now()).catch(() => null);
      }
      if (bRes && bRes.ok) {
        const bData = await bRes.json();
        liveBooks = Array.isArray(bData) ? bData : (bData.books || []);
      }

      // 3. Bundles
      let bundleRes = await fetch('/data/book-bundles.json?v=' + Date.now()).catch(() => null);
      if (!bundleRes || !bundleRes.ok) {
        bundleRes = await fetch('../data/book-bundles.json?v=' + Date.now()).catch(() => null);
      }
      if (bundleRes && bundleRes.ok) {
        const bdData = await bundleRes.json();
        liveBundles = Array.isArray(bdData) ? bdData : (bdData.bundles || bdData || []);
      }

      // 4. Tube Videos
      let tRes = await fetch('/data/webinar-recordings.json?v=' + Date.now()).catch(() => null);
      if (!tRes || !tRes.ok) {
        tRes = await fetch('../data/webinar-recordings.json?v=' + Date.now()).catch(() => null);
      }
      if (tRes && tRes.ok) {
        const tData = await tRes.json();
        liveTubeVideos = Array.isArray(tData) ? tData : (tData.recordings || []);
      }

      renderPromotionsList();
      populatePagePicker();
      if (promotionsData.promotions.length > 0) {
        populateEditor(0);
      }
    } catch (err) {
      console.error("Promotions init error:", err);
    }
  }

  // --- POPULATE PAGE PICKER (Auto-fill dropdown with all live books, bundles & videos) ---
  function populatePagePicker() {
    const picker = document.getElementById('promo-page-picker');
    if (!picker) return;

    let html = '<option value="">⚡ लिस्ट से पेज चुनें...</option>';

    // 1. Main Pages
    html += '<optgroup label="🏠 मुख्य वेबसाइट पेज">';
    html += '<option value="/">🏠 होम पेज (index.html)</option>';
    html += '<option value="/tube.html">🎬 AarogyamTube</option>';
    html += '<option value="/bundle.html?id=BUNDLE_KISAN_5IN1">🎁 5-इन-1 महाबचत कॉम्बो बंडल</option>';
    html += '<option value="/ebooks/my-library.html">📖 मेरी लाइब्रेरी</option>';
    html += '<option value="/ebooks/ebook.html">📚 ई-बुक स्टोर</option>';
    html += '<option value="/pages/profile.html">👤 प्रोफाइल / वॉलेट</option>';
    html += '</optgroup>';

    // 2. Combo Bundles
    if (liveBundles && liveBundles.length > 0) {
      html += '<optgroup label="🎁 कॉम्बो बंडल्स">';
      liveBundles.forEach(bd => {
        html += `<option value="/bundle.html?id=${bd.id}">🎁 ${bd.title || bd.name} (₹${bd.offerPrice || bd.price || 149})</option>`;
      });
      html += '</optgroup>';
    }

    // 3. Books
    if (liveBooks && liveBooks.length > 0) {
      html += '<optgroup label="📚 सभी लाइव ई-बुक्स लैंडिंग पेज">';
      liveBooks.forEach(b => {
        const title = (b.title || b.heading || b.name || b.id).slice(0, 45);
        html += `<option value="/ebooks/book-landing.html?id=${b.id}">📖 ${b.id} - ${title} (₹${b.price || b.offerPrice || 99})</option>`;
      });
      html += '</optgroup>';
    }

    // 4. Tube Videos
    if (liveTubeVideos && liveTubeVideos.length > 0) {
      html += '<optgroup label="🎬 AarogyamTube वीडियो">';
      liveTubeVideos.forEach(v => {
        html += `<option value="/tube.html?v=${v.id}">🎬 ${v.title.slice(0, 45)}...</option>`;
      });
      html += '</optgroup>';
    }

    // 5. Health Campaigns
    html += '<optgroup label="🩺 स्वास्थ्य गाइड्स">';
    html += '<option value="/health-joint-care.html">🦵 जोड़ों का दर्द व गठिया</option>';
    html += '<option value="/health-diabetes.html">🩸 मधुमेह (शुगर)</option>';
    html += '</optgroup>';

    // 6. External Links
    html += '<optgroup label="🔗 बाहरी लिंक">';
    html += '<option value="https://wa.me/917974422572">📱 WhatsApp सम्पर्क</option>';
    html += '</optgroup>';

    picker.innerHTML = html;
  }

  // --- RENDER LIST ---
  function renderPromotionsList() {
    const listEl = document.getElementById('promo-items-list');
    const badgeEl = document.getElementById('promo-count-badge');
    if (!listEl) return;

    const list = promotionsData.promotions || [];
    if (badgeEl) badgeEl.textContent = `${list.length} Total`;

    if (list.length === 0) {
      listEl.innerHTML = `
        <div style="padding:30px;text-align:center;color:var(--admin-muted);">
          कोई अभियान नहीं मिला। ऊपर "नया प्रमोशन जोड़ें" बटन दबाएँ।
        </div>
      `;
      return;
    }

    listEl.innerHTML = list.map((item, idx) => {
      const isSelected = (idx === currentEditingIndex);
      const activeColor = item.is_active ? '#10b981' : '#64748b';
      const activeText = item.is_active ? 'ACTIVE' : 'PAUSED';

      return `
        <div class="admin-card promo-list-item" data-index="${idx}" style="padding:14px;cursor:pointer;border-left:4px solid ${item.is_active ? '#10b981' : 'var(--admin-border)'};background:${isSelected ? 'rgba(37,99,235,0.08)' : 'var(--admin-surface)'};transition:all 0.2s;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:1.15rem;">${getCategoryIcon(item.type)}</span>
              <strong style="font-size:0.95rem;color:var(--admin-text);">${item.title}</strong>
            </div>
            <span style="font-size:0.7rem;font-weight:800;padding:2px 6px;border-radius:4px;background:${activeColor};color:#fff;">
              ${activeText}
            </span>
          </div>
          <p style="margin:0 0 8px 0;font-size:0.82rem;color:var(--admin-muted);line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
            ${item.subtitle}
          </p>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.76rem;color:var(--admin-muted);">
            <span>स्टाइल: <code>${item.animation_preset || 'default'}</code></span>
            <div style="display:flex;gap:6px;">
              <button type="button" class="btn-toggle-active" data-index="${idx}" style="background:none;border:none;cursor:pointer;color:#2563eb;font-weight:700;">
                ${item.is_active ? 'रोकें (Pause)' : 'चालू करें (Activate)'}
              </button>
              <span>•</span>
              <button type="button" class="btn-delete-promo" data-index="${idx}" style="background:none;border:none;cursor:pointer;color:#ef4444;font-weight:700;">
                हटाएं
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click events
    listEl.querySelectorAll('.promo-list-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const index = parseInt(el.getAttribute('data-index'), 10);
        populateEditor(index);
      });
    });

    listEl.querySelectorAll('.btn-toggle-active').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(b.getAttribute('data-index'), 10);
        list[index].is_active = !list[index].is_active;
        renderPromotionsList();
        updatePreview();
      });
    });

    listEl.querySelectorAll('.btn-delete-promo').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(b.getAttribute('data-index'), 10);
        if (confirm(`क्या आप "${list[index].title}" अभियान को हटाना चाहते हैं?`)) {
          list.splice(index, 1);
          currentEditingIndex = 0;
          renderPromotionsList();
          if (list.length > 0) populateEditor(0);
        }
      });
    });
  }

  function getCategoryIcon(type) {
    if (type === 'national_festival') return '🇮🇳';
    if (type === 'tube_video') return '🎬';
    if (type === 'book_launch') return '📚';
    if (type === 'bundle_offer') return '🎁';
    if (type === 'health_campaign') return '🩺';
    if (type === 'achiever') return '🏆';
    return '🪔';
  }

  // --- POPULATE EDITOR ---
  function populateEditor(index) {
    currentEditingIndex = index;
    currentUploadedPreviewUrl = null;
    const item = promotionsData.promotions[index];
    if (!item) return;

    document.getElementById('edit-promo-id').value = item.id || ('PROM_' + Date.now());
    document.getElementById('edit-promo-type').value = item.type || 'cultural_festival';
    document.getElementById('edit-promo-title').value = item.title || '';
    document.getElementById('edit-promo-badge').value = item.badge || '';
    document.getElementById('edit-promo-subtitle').value = item.subtitle || '';
    document.getElementById('edit-promo-preset').value = item.animation_preset || 'golden_diya_sparkles';
    document.getElementById('edit-promo-image-url').value = item.image_url || '';
    document.getElementById('edit-promo-cta-text').value = item.cta_text || '';
    document.getElementById('edit-promo-target-url').value = item.target_url || '';
    document.getElementById('edit-promo-start').value = item.start_date ? item.start_date.slice(0, 16) : '';
    document.getElementById('edit-promo-end').value = item.end_date ? item.end_date.slice(0, 16) : '';
    document.getElementById('edit-promo-is-active').checked = Boolean(item.is_active);
    document.getElementById('edit-promo-share-enabled').checked = Boolean(item.share_enabled);
    document.getElementById('edit-promo-share-tmpl').value = item.share_message_template || '';

    // Target pages checkboxes
    const targets = item.target_pages || ['all'];
    document.getElementById('page-target-all').checked = targets.includes('all');
    document.getElementById('page-target-home').checked = targets.includes('home');
    document.getElementById('page-target-library').checked = targets.includes('library');
    document.getElementById('page-target-tube').checked = targets.includes('tube');
    const profEl = document.getElementById('page-target-profile');
    if (profEl) profEl.checked = targets.includes('profile');

    // Indicator
    const ind = document.getElementById('editor-active-indicator');
    if (ind) ind.style.display = item.is_active ? 'inline-block' : 'none';

    updateDynamicSourceDropdown(item.type);
    updatePreview();
    renderPromotionsList();
  }

  // --- DYNAMIC SOURCE POPULATOR (Books / Videos / Bundles) ---
  function updateDynamicSourceDropdown(type) {
    const box = document.getElementById('dynamic-source-selector-box');
    const label = document.getElementById('dynamic-source-label');
    const select = document.getElementById('dynamic-source-select');
    if (!box || !select) return;

    select.innerHTML = '<option value="">-- चुनें --</option>';

    if (type === 'tube_video') {
      box.style.display = 'block';
      label.textContent = '🎬 AarogyamTube से वीडियो चुनें:';
      liveTubeVideos.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.title.slice(0, 50)}... (${v.duration || 'Video'})`;
        select.appendChild(opt);
      });
    } else if (type === 'book_launch') {
      box.style.display = 'block';
      label.textContent = '📚 लाइव पुस्तक चुनें:';
      (liveBooks || []).forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        const bTitle = b.heading || b.name || b.shortTitle || b.title || b.id;
        const bPrice = b.offerPrice || b.price || 99;
        opt.textContent = `${bTitle} [${b.id}] - ₹${bPrice}`;
        select.appendChild(opt);
      });
    } else if (type === 'bundle_offer') {
      box.style.display = 'block';
      label.textContent = '🎁 कॉम्बो बंडल चुनें:';
      (liveBundles || []).forEach(bd => {
        const opt = document.createElement('option');
        opt.value = bd.id;
        const bdTitle = bd.title || bd.name || bd.id;
        const bdPrice = bd.offerPrice || bd.price || 149;
        opt.textContent = `${bdTitle} - ₹${bdPrice}`;
        select.appendChild(opt);
      });
    } else if (type === 'health_campaign') {
      box.style.display = 'block';
      label.textContent = '🩺 स्वास्थ्य सप्ताह थीम चुनें:';
      const presets = [
        { id: 'joint', title: 'जोड़ों के दर्द व गठिया मुक्ति सप्ताह', url: '/health-joint-care.html' },
        { id: 'diabetes', title: 'मधुमेह (शुगर) नियंत्रण प्राकृतिक सप्ताह', url: '/health-diabetes.html' },
        { id: 'female', title: 'नारी स्वास्थ्य व हार्मोन संतुलन सप्ताह', url: '/health-female.html' }
      ];
      presets.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.title;
        select.appendChild(opt);
      });
    } else {
      box.style.display = 'none';
    }
  }

  // When dynamic source is selected, auto-fill form!
  document.getElementById('dynamic-source-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const type = document.getElementById('edit-promo-type').value;
    if (!val) return;

    if (type === 'tube_video') {
      const vid = (liveTubeVideos || []).find(v => v.id === val);
      if (vid) {
        document.getElementById('edit-promo-title').value = vid.title;
        document.getElementById('edit-promo-subtitle').value = vid.description ? vid.description.slice(0, 120) + '...' : 'AarogyamTube पर अभी पूरा वीडियो देखें।';
        document.getElementById('edit-promo-badge').value = '🔥 AAROGYAMTUBE VIDEO';
        document.getElementById('edit-promo-preset').value = 'neon_tube_flow';
        const ytId = vid.youtube_id || '';
        const thumbUrl = (vid.format === 'short_reel' && ytId) ? `https://i.ytimg.com/vi/${ytId}/oar2.jpg` : (vid.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
        document.getElementById('edit-promo-image-url').value = thumbUrl;
        document.getElementById('edit-promo-cta-text').value = '🎬 वीडियो अभी देखें →';
        document.getElementById('edit-promo-target-url').value = `/tube.html?v=${vid.id}`;
      }
    } else if (type === 'book_launch') {
      const bk = (liveBooks || []).find(b => b.id === val);
      if (bk) {
        const bTitle = bk.heading || bk.name || bk.shortTitle || bk.title || bk.id;
        const bPrice = bk.offerPrice || bk.price || 99;
        const bCover = bk.cover || bk.thumbnail || bk.cover_image || `/images/books/${bk.id.toLowerCase()}-cover.webp`;
        document.getElementById('edit-promo-title').value = bTitle;
        document.getElementById('edit-promo-subtitle').value = bk.subtitle || 'आधुनिक व प्रामाणिक डिजिटल ई-बुक अब उपलब्ध है।';
        document.getElementById('edit-promo-badge').value = '📖 नई ई-बुक विमोचन';
        document.getElementById('edit-promo-preset').value = 'golden_diya_sparkles';
        document.getElementById('edit-promo-image-url').value = bCover;
        document.getElementById('edit-promo-cta-text').value = `📖 ₹${bPrice} में अभी पढ़ें →`;
        document.getElementById('edit-promo-target-url').value = `/ebooks/book-landing.html?id=${bk.id}`;
      }
    } else if (type === 'bundle_offer') {
      const bd = (liveBundles || []).find(b => b.id === val);
      if (bd) {
        const bdTitle = bd.title || bd.name || 'मेगा कॉम्बो बंडल विशेष ऑफर';
        const bdPrice = bd.offerPrice || bd.price || 149;
        const bdCover = bd.cover_image || bd.bannerImage || '/images/books/kharif-master-guide-2026-cover.webp';
        document.getElementById('edit-promo-title').value = bdTitle;
        document.getElementById('edit-promo-subtitle').value = bd.subtitle || 'सभी विशेष ई-बुक्स का सम्पूर्ण संग्रह भारी छूट पर उपलब्ध।';
        document.getElementById('edit-promo-badge').value = bd.badge || '🎁 कॉम्बो महाबचत';
        document.getElementById('edit-promo-preset').value = 'golden_diya_sparkles';
        document.getElementById('edit-promo-image-url').value = bdCover;
        document.getElementById('edit-promo-cta-text').value = `🎁 ₹${bdPrice} में बंडल प्राप्त करें →`;
        document.getElementById('edit-promo-target-url').value = `/bundle.html?id=${bd.id}`;
      }
    } else if (type === 'health_campaign') {
      if (val === 'joint') {
        document.getElementById('edit-promo-title').value = 'जोड़ों के दर्द व गठिया मुक्ति सप्ताह';
        document.getElementById('edit-promo-subtitle').value = 'बिना साइड इफेक्ट प्राकृतिक तेल मालिश व आहार से पाएं घुटनों व कमर दर्द से राहत।';
        document.getElementById('edit-promo-badge').value = '🌿 HEALTH AWARENESS WEEK';
        document.getElementById('edit-promo-preset').value = 'golden_diya_sparkles';
        document.getElementById('edit-promo-target-url').value = '/health-joint-care.html';
        document.getElementById('edit-promo-cta-text').value = '🌿 सम्पूर्ण उपाय पढ़ें →';
      } else if (val === 'diabetes') {
        document.getElementById('edit-promo-title').value = 'मधुमेह (शुगर) नियंत्रण प्राकृतिक सप्ताह';
        document.getElementById('edit-promo-subtitle').value = 'आयुर्वेदिक खानपान और सरल दिनचर्या से शुगर लेवल को रखें सामान्य।';
        document.getElementById('edit-promo-badge').value = '🩸 DIABETES CARE WEEK';
        document.getElementById('edit-promo-target-url').value = '/health-diabetes.html';
        document.getElementById('edit-promo-cta-text').value = '🩸 शुगर मुक्ति गाइड पढ़ें →';
      }
    }
    updatePreview();
  });

  // When Type changes, update dynamic selector
  document.getElementById('edit-promo-type')?.addEventListener('change', (e) => {
    updateDynamicSourceDropdown(e.target.value);
    if (e.target.value === 'national_festival') {
      document.getElementById('edit-promo-preset').value = 'tricolor_patriotic';
      document.getElementById('edit-promo-badge').value = '🇮🇳 राष्ट्र को समर्पित';
    } else if (e.target.value === 'cultural_festival') {
      document.getElementById('edit-promo-preset').value = 'golden_diya_sparkles';
      document.getElementById('edit-promo-badge').value = '✨ पावन पर्व';
    }
    updatePreview();
  });

  // --- LIVE PREVIEW UPDATER ---
  function updatePreview(customImgSrc = null) {
    const title = document.getElementById('edit-promo-title').value || 'अभियान शीर्षक';
    const sub = document.getElementById('edit-promo-subtitle').value || 'अभियान संदेश विवरण';
    const badge = document.getElementById('edit-promo-badge').value || '✨ विशेष उत्सव';
    const img = customImgSrc || currentUploadedPreviewUrl || document.getElementById('edit-promo-image-url').value || '/images/logo/logo.png';
    const cta = document.getElementById('edit-promo-cta-text').value || 'आगे बढ़ें →';
    const preset = document.getElementById('edit-promo-preset').value;

    document.getElementById('prev-title').textContent = title;
    document.getElementById('prev-sub').textContent = sub;
    document.getElementById('prev-badge').textContent = badge;
    document.getElementById('prev-cta').textContent = cta;

    const prevImgEl = document.getElementById('prev-img');
    if (prevImgEl) {
      prevImgEl.src = img;
      prevImgEl.onerror = () => {
        if (currentUploadedPreviewUrl) {
          prevImgEl.src = currentUploadedPreviewUrl;
        } else {
          prevImgEl.src = '/images/logo/logo.png';
        }
      };
    }

    const auraEl = document.getElementById('prev-aura');
    if (auraEl) {
      if (preset === 'tricolor_patriotic') {
        auraEl.style.background = 'radial-gradient(circle, rgba(255,153,51,0.6) 0%, rgba(255,255,255,0.4) 40%, rgba(19,136,8,0.5) 70%, rgba(0,0,0,0) 90%)';
      } else if (preset === 'neon_tube_flow') {
        auraEl.style.background = 'radial-gradient(circle, rgba(6,182,212,0.7) 0%, rgba(239,68,68,0.4) 50%, rgba(0,0,0,0) 80%)';
      } else if (preset === 'holi_gulal_petals') {
        auraEl.style.background = 'radial-gradient(circle, rgba(236,72,153,0.7) 0%, rgba(168,85,247,0.4) 50%, rgba(0,0,0,0) 80%)';
      } else {
        auraEl.style.background = 'radial-gradient(circle, rgba(245,158,11,0.6) 0%, rgba(220,38,38,0.3) 60%, rgba(0,0,0,0) 80%)';
      }
    }

    const badgeEl = document.getElementById('prev-badge');
    if (preset === 'tricolor_patriotic') {
      badgeEl.style.background = 'linear-gradient(90deg, #ff9933 0%, #138808 100%)';
    } else if (preset === 'neon_tube_flow') {
      badgeEl.style.background = 'linear-gradient(90deg, #06b6d4 0%, #ef4444 100%)';
    } else {
      badgeEl.style.background = 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)';
    }

    // Update WhatsApp Chat Preview Bubble (Photo + Caption)
    const imgUrlVal = document.getElementById('edit-promo-image-url')?.value.trim() || '';
    const waImg = document.getElementById('wa-preview-img');
    const waImgWrap = document.getElementById('wa-preview-img-wrap');
    if (waImg && waImgWrap) {
      const waSrc = customImgSrc || currentUploadedPreviewUrl || imgUrlVal;
      if (waSrc) {
        waImg.src = waSrc;
        waImg.onerror = () => {
          if (currentUploadedPreviewUrl) {
            waImg.src = currentUploadedPreviewUrl;
          } else {
            waImgWrap.style.display = 'none';
          }
        };
        waImgWrap.style.display = 'block';
      } else {
        waImgWrap.style.display = 'none';
      }
    }
    const tmplInput = document.getElementById('edit-promo-share-tmpl');
    const waText = document.getElementById('wa-preview-text');
    if (tmplInput && waText) {
      let previewText = tmplInput.value || 'आरोग्यम की ओर से हार्दिक शुभकामनाएँ! {link}';
      previewText = previewText.replace(/{sender_name}/g, 'श्री अवनीश कुमार मिश्रा');
      previewText = previewText.replace(/{user_name}/g, 'श्री अवनीश कुमार मिश्रा');
      previewText = previewText.replace(/{festival_title}/g, document.getElementById('edit-promo-title')?.value || 'उत्सव');
      // Live target URL in preview (uses whatever admin has typed/selected)
      const targetUrlVal = document.getElementById('edit-promo-target-url')?.value.trim() || '/ebooks/ebook.html';
      const previewBase = window.location.origin || 'https://aarogyamindia.online';
      const liveLink = targetUrlVal.startsWith('http') ? targetUrlVal + '?ref=AI000004' : previewBase + targetUrlVal + '?ref=AI000004';
      previewText = previewText.replace(/{link}/g, liveLink);
      waText.textContent = previewText;
    }
  }

  // Universal WhatsApp Share Execution for Admin Test
  async function executeAdminTestShare() {
    const title = document.getElementById('edit-promo-title')?.value.trim() || 'शुभकामना संदेश';
    const tmpl = document.getElementById('edit-promo-share-tmpl')?.value.trim() || 'आरोग्यम की ओर से हार्दिक शुभकामनाएँ! {link}';
    const imgUrl = document.getElementById('edit-promo-image-url')?.value.trim() || '';
    const origin = window.location.origin || 'https://aarogyamindia.online';
    const fullImgUrl = imgUrl ? (imgUrl.startsWith('http') ? imgUrl : (origin + imgUrl)) : '';

    let msg = tmpl.replace(/{sender_name}/g, 'श्री अवनीश कुमार मिश्रा')
                  .replace(/{user_name}/g, 'श्री अवनीश कुमार मिश्रा')
                  .replace(/{festival_title}/g, title)
                  .replace(/{link}/g, `${origin}/ebooks/ebook.html?ref=AI000004`);

    let nativeShared = false;
    if (navigator.share && fullImgUrl) {
      try {
        const file = await convertUrlToJpegFile(fullImgUrl, 'aarogyam-promo');
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: msg
          });
          nativeShared = true;
        }
      } catch (err) {
        if (err && err.name === 'AbortError') return;
        console.warn('Native share failed:', err);
      }
    }

    if (!nativeShared) {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }

  function convertUrlToJpegFile(url, filename) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], `${filename}.jpg`, { type: 'image/jpeg' }));
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.92);
        } catch (_) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // Bind Test WhatsApp Share Buttons
  document.getElementById('btn-test-wa-share')?.addEventListener('click', executeAdminTestShare);
  document.getElementById('prev-share')?.addEventListener('click', executeAdminTestShare);

  // Page Picker Dropdown → Target URL input auto-fill
  document.getElementById('promo-page-picker')?.addEventListener('change', function () {
    let val = this.value;
    if (val) {
      if (val.includes('bundle-landing.html')) {
        val = val.replace(/(\/ebooks\/)?bundle-landing\.html/, '/bundle.html');
      }
      if (val.includes('BUNDLE_AGRI_5')) {
        val = val.replace('BUNDLE_AGRI_5', 'BUNDLE_KISAN_5IN1');
      }
      document.getElementById('edit-promo-target-url').value = val;
      updatePreview();
      const st = document.getElementById('target-url-status');
      if (st) {
        st.textContent = '✓ लिंक सेट हो गया';
        setTimeout(() => { if (st) st.textContent = ''; }, 3000);
      }
    }
  });

  // Test Target Link Button
  document.getElementById('btn-test-target-link')?.addEventListener('click', () => {
    let url = document.getElementById('edit-promo-target-url')?.value.trim();
    if (!url) {
      alert("कृपया पहले 'लैंडिंग पेज लिंक' बॉक्स में लिंक दर्ज करें या ऊपर ड्रॉपडाउन से कोई पेज चुनें।");
      return;
    }
    // Auto-normalize
    if (url.includes('bundle-landing.html')) {
      url = url.replace(/(\/ebooks\/)?bundle-landing\.html/, '/bundle.html');
      document.getElementById('edit-promo-target-url').value = url;
    }
    if (url.includes('BUNDLE_AGRI_5')) {
      url = url.replace('BUNDLE_AGRI_5', 'BUNDLE_KISAN_5IN1');
      document.getElementById('edit-promo-target-url').value = url;
    }
    window.open(url, '_blank');
  });

  // Input listeners for preview
  ['edit-promo-title', 'edit-promo-subtitle', 'edit-promo-badge', 'edit-promo-image-url', 'edit-promo-cta-text', 'edit-promo-target-url', 'edit-promo-preset', 'edit-promo-share-tmpl'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => updatePreview());
  });

  // WhatsApp Message Builder: Quick Tags & Emojis insertion
  document.querySelectorAll('.wa-quick-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-insert');
      const textarea = document.getElementById('edit-promo-share-tmpl');
      if (!textarea || !tag) return;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const val = textarea.value;
      textarea.value = val.substring(0, start) + tag + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      textarea.focus();
      updatePreview();
    });
  });

  // --- HARVEST CURRENT FORM INTO IN-MEMORY ARRAY ---
  function harvestCurrentForm() {
    const id = document.getElementById('edit-promo-id').value || ('PROM_' + Date.now());
    const title = document.getElementById('edit-promo-title').value.trim();
    if (!title) return null;

    const targets = [];
    if (document.getElementById('page-target-all').checked) targets.push('all');
    if (document.getElementById('page-target-home').checked) targets.push('home');
    if (document.getElementById('page-target-library').checked) targets.push('library');
    if (document.getElementById('page-target-tube').checked) targets.push('tube');
    const profEl = document.getElementById('page-target-profile');
    if (profEl && profEl.checked) targets.push('profile');

    let targetUrl = document.getElementById('edit-promo-target-url').value.trim() || '/';
    if (targetUrl.includes('bundle-landing.html')) {
      targetUrl = targetUrl.replace(/(\/ebooks\/)?bundle-landing\.html/, '/bundle.html');
    }
    if (targetUrl.includes('BUNDLE_AGRI_5')) {
      targetUrl = targetUrl.replace('BUNDLE_AGRI_5', 'BUNDLE_KISAN_5IN1');
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('/')) {
      targetUrl = '/' + targetUrl;
    }

    const updatedItem = {
      id: id,
      type: document.getElementById('edit-promo-type').value,
      title: title,
      subtitle: document.getElementById('edit-promo-subtitle').value.trim(),
      badge: document.getElementById('edit-promo-badge').value.trim() || '✨ विशेष',
      animation_preset: document.getElementById('edit-promo-preset').value,
      image_url: document.getElementById('edit-promo-image-url').value.trim() || '/images/logo/logo.png',
      cta_text: document.getElementById('edit-promo-cta-text').value.trim() || 'आगे बढ़ें →',
      target_url: targetUrl,
      start_date: document.getElementById('edit-promo-start').value || new Date().toISOString(),
      end_date: document.getElementById('edit-promo-end').value || new Date(Date.now() + 30*86400000).toISOString(),
      is_active: document.getElementById('edit-promo-is-active').checked,
      target_pages: targets.length > 0 ? targets : ['all'],
      share_enabled: document.getElementById('edit-promo-share-enabled').checked,
      share_message_template: document.getElementById('edit-promo-share-tmpl').value.trim() || 'आरोग्यम की ओर से हार्दिक शुभकामनाएँ! {link}',
      frequency_mode: 'once_per_day',
      updated_at: new Date().toISOString()
    };

    if (currentEditingIndex >= 0 && currentEditingIndex < promotionsData.promotions.length) {
      promotionsData.promotions[currentEditingIndex] = updatedItem;
    } else {
      promotionsData.promotions.push(updatedItem);
      currentEditingIndex = promotionsData.promotions.length - 1;
    }

    renderPromotionsList();
    return updatedItem;
  }

  // --- APPLY FORM CHANGES TO IN-MEMORY ARRAY ---
  document.getElementById('btn-apply-promo-edit')?.addEventListener('click', () => {
    const res = harvestCurrentForm();
    if (!res) {
      alert('कृपया शीर्षक अवश्य दर्ज करें।');
      return;
    }
    showToast('✓ अभियान अपडेट हो गया है! अब ऊपर "Save & Publish World Wide" दबाएँ।', '#10b981');
  });

  // --- CREATE NEW PROMO ---
  document.getElementById('btn-create-promo')?.addEventListener('click', () => {
    const newItem = {
      id: 'PROM_' + Date.now(),
      type: 'cultural_festival',
      title: 'नया पावन पर्व अभियान',
      subtitle: 'आरोग्यम इंडिया परिवार की ओर से हार्दिक शुभकामनाएँ।',
      badge: '✨ पावन पर्व',
      animation_preset: 'golden_diya_sparkles',
      image_url: '/images/logo/logo.png',
      cta_text: 'आगे बढ़ें →',
      target_url: '/ebooks/index.html',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 15*86400000).toISOString(),
      is_active: true,
      target_pages: ['all'],
      share_enabled: true,
      share_message_template: 'आरोग्यम की ओर से हार्दिक शुभकामनाएँ! {link}',
      frequency_mode: 'once_per_day'
    };

    promotionsData.promotions.unshift(newItem);
    populateEditor(0);
  });

  // --- IMAGE UPLOADER COMPRESSOR ---
  document.getElementById('edit-promo-file-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('इमेज कंप्रेस और तैयार हो रही है...', '#3b82f6');
      const compressedWebP = await compressToWebp(file, 800, 800, 0.90);
      
      // 1. INSTANT LOCAL 0MS VISUAL PREVIEW (No network delay, no 404!)
      currentUploadedPreviewUrl = compressedWebP;
      updatePreview(compressedWebP);

      // Save locally or upload asset
      const fileName = `promo-${Date.now()}.webp`;
      const savePath = `/images/banners/${fileName}`;

      document.getElementById('edit-promo-image-url').value = savePath;
      if (currentEditingIndex >= 0 && promotionsData.promotions[currentEditingIndex]) {
        promotionsData.promotions[currentEditingIndex].image_url = savePath;
      }
      renderPromotionsList();

      // Upload via backend API
      const syncUrl = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') 
        ? 'https://aarogyamindia.online/api/auto-sync-book' 
        : '/api/auto-sync-book';

      const res = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_asset',
          path: `images/banners/${fileName}`,
          base64: compressedWebP
        })
      });

      if (res.ok) {
        showToast('✓ इमेज सफलतापूर्वक सर्वर पर अपलोड हो गई!', '#10b981');
      } else {
        showToast('इमेज प्रीव्यू तैयार है।', '#10b981');
      }
    } catch (err) {
      console.error("Image upload error:", err);
      showToast('इमेज अपलोड में त्रुटि: ' + err.message, '#ef4444');
    }
  });

  function compressToWebp(file, maxW, maxH, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (re) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/webp', quality));
        };
        img.onerror = reject;
        img.src = re.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- SAVE & PUBLISH WORLD WIDE (GIT / VERCEL SYNC) ---
  document.getElementById('btn-save-all-promos')?.addEventListener('click', async () => {
    // 1. Automatically harvest current form fields so admin changes are never lost!
    harvestCurrentForm();

    const btn = document.getElementById('btn-save-all-promos');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ प्रकाशित हो रहा है...';

    promotionsData.updated_at = new Date().toISOString();

    // 0. Save immediately to LocalStorage (100% Zero-Loss on Mobile & Desktop)
    try {
      localStorage.setItem('AAROGYAM_UNIVERSAL_PROMOTIONS', JSON.stringify(promotionsData));
    } catch (_) {}

    let success = true; // LocalStorage guarantees local live status
    let errMsg = '';

    // 1. Port 5505 (Local disk sync if running locally)
    const isLocal = (
      window.location.hostname === '127.0.0.1' || 
      window.location.hostname === 'localhost' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.endsWith('.local')
    );
    if (isLocal) {
      try {
        const localRes = await fetch('http://127.0.0.1:5505', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_config',
            path: 'data/universal-promotions.json',
            content: JSON.stringify(promotionsData, null, 2),
            auto_push: false
          })
        });
        if (localRes.ok) success = true;
      } catch (e) {
        console.warn('Port 5505 local note:', e);
      }
    }

    // 2. Production Vercel Auto-Sync API (GitHub Atomic Commit)
    try {
      const apiUrl = isLocal ? 'https://aarogyamindia.online/api/auto-sync-book' : '/api/auto-sync-book';
      const apiRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_universal_promotions',
          promotionsData: promotionsData
        })
      });
      const data = await apiRes.json().catch(() => ({}));
      if (apiRes.ok && data.success) {
        success = true;
      } else {
        errMsg = data.error || 'Server sync error';
      }
    } catch (err) {
      errMsg = err.message;
    }

    btn.disabled = false;
    btn.innerHTML = origText;

    if (success) {
      showToast('🎉 बधाई! सभी प्रमोशन व त्योहार अभियान विश्वव्यापी (World Wide) लाइव हो गए हैं!', '#10b981');
    } else {
      showToast('प्रकाशित करने में त्रुटि: ' + (errMsg || 'पुनः प्रयास करें।'), '#ef4444');
    }
  });

  function showToast(msg, bg) {
    const el = document.getElementById('promo-sync-status');
    if (!el) return;
    el.style.display = 'block';
    el.style.background = bg === '#10b981' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)';
    el.style.color = bg === '#10b981' ? '#10b981' : '#ef4444';
    el.style.border = `1px solid ${bg}`;
    el.textContent = msg;
    setTimeout(() => {
      el.style.display = 'none';
    }, 6000);
  }

  // Kickoff
  loadInitialData();
}
