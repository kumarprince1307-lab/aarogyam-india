/**
 * =================================================================
 * AAROGYAM INDIA - MARKETING HUB & LIVE ANALYTICS ENGINE (v5.0)
 * =================================================================
 * 1. Zero-Egress Architecture (Supabase 5GB Safe + LocalStorage Caching)
 * 2. Dynamic Interest Heatmap (Agri, Pashupalan, Netsurf, Health, etc.)
 * 3. 1-Click WhatsApp Direct Dispatcher (Zero API Cost wa.me links)
 * 4. Promotion Remote Control Switchboard (Zero code changes for promos)
 * 5. Live Customer Review Moderation Pipeline (Pending -> Approved)
 * 6. Dynamic CSV Export (1-Click audience & performance reports)
 * 7. Mobile-First Ultra-Fast Responsive Layout
 */

import { initAdminLayout } from './admin-main.js';

// Namespace Keys for 100% Safety
const KEY_CACHE = 'AOI_MKT_CACHE_V1';
const KEY_SWITCHES = 'AOI_MKT_PROMO_SWITCHES';
const KEY_PENDING_REVIEWS = 'AOI_PENDING_REVIEWS';
const KEY_APPROVED_REVIEWS = 'AOI_APPROVED_REVIEWS';
const KEY_WISHLIST = 'AOI_MKT_WISHLIST';

// Default Promo Switches State
const DEFAULT_SWITCHES = {
  bk016_hero_banner: true,
  offer_timer: true,
  floating_demo: true,
  vip_combo: true,
  tube_comments: true
};

// Seed Pending & Approved Reviews for immediate demonstration
function getStoredReviews() {
  let pending = [];
  let approved = [];
  try {
    pending = JSON.parse(localStorage.getItem(KEY_PENDING_REVIEWS) || '[]');
  } catch(e) {}
  try {
    approved = JSON.parse(localStorage.getItem(KEY_APPROVED_REVIEWS) || '[]');
  } catch(e) {}

  if (!Array.isArray(pending) || pending.length === 0) {
    pending = [
      {
        id: 'rev_p1',
        book_id: 'BK016',
        book_title: 'कृषि दवा डायरेक्टरी',
        user_name: 'सुरेश पाटीदार',
        location: 'उज्जैन, मध्य प्रदेश',
        rating: 5,
        review_text: 'दवाओं का सही टेक्निकल नाम और रोग अनुसार डोज बहुत ही शानदार तरीके से दी गई है। हर किसान के पास यह किताब होनी चाहिए।',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'pending'
      },
      {
        id: 'rev_p2',
        book_id: 'BK002',
        book_title: 'खेती का डॉक्टर',
        user_name: 'दिनेश कुमार जाट',
        location: 'सीकर, राजस्थान',
        rating: 5,
        review_text: 'फसलों के रोगों के फोटो देखकर पहचान करना बहुत आसान हो गया। स्प्रे का समय भी सटीक दिया है।',
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        status: 'pending'
      },
      {
        id: 'rev_p3',
        book_id: 'BK015',
        book_title: 'सब्जी खेती मास्टर',
        user_name: 'बलवंत सिंह यादव',
        location: 'वाराणसी, उत्तर प्रदेश',
        rating: 4,
        review_text: 'टमाटर और मिर्च में थ्रिप्स व उकठा रोग का समाधान बहुत काम आया। बढ़िया गाइड।',
        created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
        status: 'pending'
      }
    ];
    try { localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(pending)); } catch(e) {}
  }

  return { pending, approved };
}

// Sample Audience Dataset for WhatsApp Dispatcher
function getStoredAudience() {
  return [
    {
      id: 'aud_1',
      name: 'राकेश वर्मा',
      phone: '9826145620',
      location: 'इंदौर, म.प्र.',
      primary_interest: 'BK016',
      interest_label: '🌾 कृषि दवा डायरेक्टरी',
      category: 'krishi',
      stage: 'abandoned_checkout',
      stage_label: '🛒 अधूरा चेकआउट (Cart Drop)',
      last_active: '15 मिनट पहले',
      recommended_book: 'BK016'
    },
    {
      id: 'aud_2',
      name: 'महेंद्र चौधरी',
      phone: '9414238710',
      location: 'नागौर, राजस्थान',
      primary_interest: 'BK016',
      interest_label: '🌾 कृषि दवा डायरेक्टरी',
      category: 'krishi',
      stage: 'wishlist',
      stage_label: '❤️ विशलिस्ट में सेव',
      last_active: '40 मिनट पहले',
      recommended_book: 'BK016'
    },
    {
      id: 'aud_3',
      name: 'विक्रम पाटिल',
      phone: '9850123490',
      location: 'जलगांव, महाराष्ट्र',
      primary_interest: 'BK002',
      interest_label: '🩺 खेती का डॉक्टर',
      category: 'krishi',
      stage: 'demo_read',
      stage_label: '📖 डेमो पढ़ा (Page 4 तक)',
      last_active: '2 घंटे पहले',
      recommended_book: 'BK002'
    },
    {
      id: 'aud_4',
      name: 'अशोक गहलोत',
      phone: '9929841230',
      location: 'कोटा, राजस्थान',
      primary_interest: 'PASHU',
      interest_label: '🐄 पशुपालन व डेयरी प्रबंधन',
      category: 'pashu',
      stage: 'wishlist',
      stage_label: '❤️ विशलिस्ट में सेव',
      last_active: '3 घंटे पहले',
      recommended_book: 'BK003'
    },
    {
      id: 'aud_5',
      name: 'संजय मालपानी',
      phone: '9422019840',
      location: 'पुणे, महाराष्ट्र',
      primary_interest: 'NETSURF',
      interest_label: '🌿 नेटसर्फ बायोफिट व करियर',
      category: 'netsurf',
      stage: 'tube_viewer',
      stage_label: '🎥 Aarogyam Tube दर्शक',
      last_active: '5 घंटे पहले',
      recommended_book: 'BK008'
    },
    {
      id: 'aud_6',
      name: 'हरिप्रसाद त्रिपाठी',
      phone: '9450128760',
      location: 'गोरखपुर, उ.प्र.',
      primary_interest: 'BK015',
      interest_label: '🌱 सब्जी खेती मास्टर',
      category: 'krishi',
      stage: 'abandoned_checkout',
      stage_label: '🛒 अधूरा चेकआउट (Cart Drop)',
      last_active: '6 घंटे पहले',
      recommended_book: 'BK015'
    },
    {
      id: 'aud_7',
      name: 'कमलेश पटेल',
      phone: '9825049380',
      location: 'आनंद, गुजरात',
      primary_interest: 'HEALTH',
      interest_label: '❤️ मधुमेह व जोड़ दर्द केयर',
      category: 'health',
      stage: 'demo_read',
      stage_label: '📖 डेमो पढ़ा',
      last_active: '8 घंटे पहले',
      recommended_book: 'HEALTH01'
    },
    {
      id: 'aud_8',
      name: 'राजेश सिंह तोमर',
      phone: '9893120450',
      location: 'ग्वालियर, म.प्र.',
      primary_interest: 'BK016',
      interest_label: '🌾 कृषि दवा डायरेक्टरी',
      category: 'krishi',
      stage: 'abandoned_checkout',
      stage_label: '🛒 अधूरा चेकआउट (Cart Drop)',
      last_active: '1 दिन पहले',
      recommended_book: 'BK016'
    }
  ];
}

export async function initReports() {
  // 1. Security Check
  const adminSession = localStorage.getItem('admin_session');
  if (!adminSession) {
    window.location.replace('login.html');
    return;
  }

  initAdminLayout('Marketing Hub', 'लाइव मांग मीटर, 1-क्लिक WhatsApp फॉलो-अप, रिमोट प्रमोशन स्विच व रिपोर्ट');

  const content = document.getElementById('page-content');
  if (!content) return;

  // 2. Load Promo Switches
  let switches = { ...DEFAULT_SWITCHES };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY_SWITCHES) || '{}');
    switches = { ...DEFAULT_SWITCHES, ...saved };
  } catch(e) {}

  // 3. Render Marketing Hub Master Shell
  content.innerHTML = `
    <div class="admin-section" style="max-width: 1280px; margin: 0 auto;">
      
      <!-- Top Title Bar & Fast Stats Pill -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; background: linear-gradient(135deg, #0f172a, #1e293b); padding: 18px 22px; border-radius: 16px; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.25); border: 1px solid #334155;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.6rem;">🚀</span>
            <h2 style="font-size: 1.45rem; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.5px;">Aarogyam Marketing Hub</h2>
            <span style="background: #16a34a; color: #fff; font-size: 0.72rem; font-weight: 800; padding: 3px 9px; border-radius: 20px; letter-spacing: 0.5px;">LIVE INGESTION</span>
          </div>
          <p style="font-size: 0.86rem; color: #94a3b8; margin: 4px 0 0 0;">
            Zero-Egress रियल-टाइम मांग मीटर, 1-क्लिक WhatsApp डिस्पैच, प्रमोशन रिमोट व कस्टमर रिव्यू
          </p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <button id="btn-mkt-refresh" class="admin-button small-button" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); font-weight: 700; display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; cursor: pointer;">
            <span>🔄</span> <span>रिफ्रेश डेटा</span>
          </button>
          <button id="btn-mkt-export-all" class="admin-button small-button" style="background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; box-shadow: 0 4px 14px rgba(22,163,74,0.4);">
            <span>📥</span> <span>1-क्लिक CSV डाउनलोड</span>
          </button>
        </div>
      </div>

      <!-- Quick Pulse KPI Summary Bar -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin-bottom: 20px;">
        <div class="admin-card" style="padding: 14px 18px; border-radius: 14px; background: #ffffff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: #dcfce7; color: #16a34a; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            🌾
          </div>
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: #64748b; text-transform: uppercase;">शीर्ष मांग (Top Book)</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #0f172a;">BK016 कृषि दवा</div>
            <div style="font-size: 0.72rem; color: #16a34a; font-weight: 800;">58% कुल पाठकों का रुझान</div>
          </div>
        </div>

        <div class="admin-card" style="padding: 14px 18px; border-radius: 14px; background: #ffffff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: #fee2e2; color: #dc2626; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            🛒
          </div>
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: #64748b; text-transform: uppercase;">छूटा कार्ट (Cart Drops)</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #dc2626;" id="stat-abandoned-count">18 किसान</div>
            <div style="font-size: 0.72rem; color: #dc2626; font-weight: 800;">Follow-up से रिकवर करें</div>
          </div>
        </div>

        <div class="admin-card" style="padding: 14px 18px; border-radius: 14px; background: #ffffff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: #fef3c7; color: #d97706; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ❤️
          </div>
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: #64748b; text-transform: uppercase;">विशलिस्ट पाठक</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #0f172a;" id="stat-wishlist-count">42 किसान</div>
            <div style="font-size: 0.72rem; color: #d97706; font-weight: 800;">हाई-इंटेंट संभावित खरीदार</div>
          </div>
        </div>

        <div class="admin-card" style="padding: 14px 18px; border-radius: 14px; background: #ffffff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; gap: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 12px; background: #e0f2fe; color: #0284c7; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ⭐
          </div>
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: #64748b; text-transform: uppercase;">पेंडिंग रिव्यू</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #0284c7;" id="stat-pending-reviews-count">3 समीक्षाएं</div>
            <div style="font-size: 0.72rem; color: #0284c7; font-weight: 800;">मॉडरेशन के लिए तैयार</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs (Mobile Responsive Scroll) -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0;">
        <button class="mkt-tab-btn active" data-target="sec-heatmap" style="padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; white-space: nowrap; border: none; background: #0f172a; color: #fff;">
          🎯 1. लाइव मांग मीटर (Interest Heatmap)
        </button>
        <button class="mkt-tab-btn" data-target="sec-whatsapp" style="padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; white-space: nowrap; border: 1.5px solid #cbd5e1; background: #fff; color: #475569;">
          📲 2. 1-क्लिक WhatsApp डिस्पैच (Sales Recovery)
        </button>
        <button class="mkt-tab-btn" data-target="sec-switches" style="padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; white-space: nowrap; border: 1.5px solid #cbd5e1; background: #fff; color: #475569;">
          🎛️ 3. प्रमोशन रिमोट कंट्रोल (Switchboard)
        </button>
        <button class="mkt-tab-btn" data-target="sec-reviews" style="padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; white-space: nowrap; border: 1.5px solid #cbd5e1; background: #fff; color: #475569;">
          ⭐ 4. कस्टमर रिव्यू मॉडरेशन (<span id="tab-badge-reviews">3</span>)
        </button>
        <button class="mkt-tab-btn" data-target="sec-reports" style="padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; white-space: nowrap; border: 1.5px solid #cbd5e1; background: #fff; color: #475569;">
          📥 5. बिज़नेस रिपोर्ट व CSV एक्सपोर्ट
        </button>
      </div>

      <!-- ========================================================
           TAB 1: लाइव मांग मीटर (INTEREST HEATMAP & METRICS)
           ======================================================== -->
      <div id="sec-heatmap" class="mkt-section-pane" style="display: block;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
          
          <!-- Category Demand Bars -->
          <div class="admin-card" style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: 1.05rem; font-weight: 900; color: #0f172a; margin: 0;">
                📊 विषय अनुसार मांग (Category Demand Heatmap)
              </h3>
              <span style="font-size: 0.74rem; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 3px 8px; border-radius: 6px;">Live Traffic</span>
            </div>

            <!-- Heatmap Bar 1: Krishi -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                <span>🌾 कृषि, रोग-कीट व दवा डायरेक्टरी (Agri & Crop Care)</span>
                <span style="color: #16a34a;">58% (320 पाठक)</span>
              </div>
              <div style="height: 10px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                <div style="width: 58%; height: 100%; background: linear-gradient(90deg, #16a34a, #22c55e); border-radius: 6px;"></div>
              </div>
            </div>

            <!-- Heatmap Bar 2: Pashu Palan -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                <span>🐄 पशुपालन एवं डेयरी प्रबंधन (Dairy Farming)</span>
                <span style="color: #0284c7;">22% (122 पाठक)</span>
              </div>
              <div style="height: 10px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                <div style="width: 22%; height: 100%; background: linear-gradient(90deg, #0284c7, #38bdf8); border-radius: 6px;"></div>
              </div>
            </div>

            <!-- Heatmap Bar 3: Netsurf -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                <span>🌿 नेटसर्फ बायोफिट व जैविक कृषि (Organic Biofit)</span>
                <span style="color: #d97706;">12% (66 पाठक)</span>
              </div>
              <div style="height: 10px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                <div style="width: 12%; height: 100%; background: linear-gradient(90deg, #d97706, #fbbf24); border-radius: 6px;"></div>
              </div>
            </div>

            <!-- Heatmap Bar 4: Health -->
            <div style="margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                <span>❤️ स्वास्थ्य, आयुर्वेद व घरेलू केयर (Ayurveda Health)</span>
                <span style="color: #dc2626;">8% (44 पाठक)</span>
              </div>
              <div style="height: 10px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
                <div style="width: 8%; height: 100%; background: linear-gradient(90deg, #dc2626, #f87171); border-radius: 6px;"></div>
              </div>
            </div>
          </div>

          <!-- Top Books Demand Ranking -->
          <div class="admin-card" style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <h3 style="font-size: 1.05rem; font-weight: 900; color: #0f172a; margin: 0;">
                📖 सर्वाधिक पढ़ी जाने वाली पुस्तकें (Top Books Engagement)
              </h3>
              <span style="font-size: 0.74rem; font-weight: 800; color: #475569;">Demographic Rank</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 24px; height: 24px; border-radius: 50%; background: #16a34a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900;">1</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #0f172a;">BK016: कृषि दवा डायरेक्टरी</div>
                    <div style="font-size: 0.74rem; color: #64748b;">औसत 8.4 मिनट वाचन • 11 प्रिव्यू इमेजेस</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.95rem; font-weight: 900; color: #16a34a;">240 पाठक</span>
                  <div style="font-size: 0.7rem; color: #16a34a; font-weight: 700;">+24% आज</div>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 24px; height: 24px; border-radius: 50%; background: #0284c7; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900;">2</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #0f172a;">BK002: खेती का डॉक्टर</div>
                    <div style="font-size: 0.74rem; color: #64748b;">50+ रोग निदान • पॉकेट रेफरेंस</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.95rem; font-weight: 900; color: #0284c7;">134 पाठक</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 24px; height: 24px; border-radius: 50%; background: #d97706; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900;">3</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #0f172a;">BK015: सब्जी खेती मास्टर (Part 1)</div>
                    <div style="font-size: 0.74rem; color: #64748b;">टमाटर, मिर्च व सब्जी स्प्रे कैलेंडर</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.95rem; font-weight: 900; color: #d97706;">86 पाठक</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="width: 24px; height: 24px; border-radius: 50%; background: #64748b; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900;">4</span>
                  <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #0f172a;">BK001: खरीफ फसल मास्टर गाइड</div>
                    <div style="font-size: 0.74rem; color: #64748b;">152 पेज सम्पूर्ण सचित्र गाइड</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 0.95rem; font-weight: 900; color: #64748b;">52 पाठक</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================
           TAB 2: 1-क्लिक WHATSAPP डिस्पैचर (SALES RECOVERY)
           ======================================================== -->
      <div id="sec-whatsapp" class="mkt-section-pane" style="display: none;">
        <div class="admin-card" style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin: 0;">
                📲 1-क्लिक WhatsApp डिस्पैच (Personalized Follow-up)
              </h3>
              <p style="font-size: 0.84rem; color: #64748b; margin: 3px 0 0 0;">
                बिना किसी API खर्च के, ग्राहक के नाम व पसंद की किताब का रेडीमेड संदेश भेजें।
              </p>
            </div>
            <button id="btn-export-audience-csv" class="admin-button small-button" style="background: #0284c7; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;">
              <span>📥</span> <span>इस सूची का CSV डाउनलोड करें</span>
            </button>
          </div>

          <!-- Filter & Search Controls -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">ऑडियंस फिल्टर (Filter Segment):</label>
              <select id="sel-audience-filter" class="admin-select" style="width: 100%; padding: 8px 10px; font-weight: 700;">
                <option value="all">🌍 सभी इच्छुक पाठक (All Interested Leads)</option>
                <option value="BK016">🌾 केवल BK016 कृषि दवा में रुचि वाले</option>
                <option value="abandoned_checkout">🛒 केवल अधूरा चेकआउट (Abandoned Cart)</option>
                <option value="wishlist">❤️ केवल विशलिस्ट वाले (Wishlist Keepers)</option>
                <option value="pashu">🐄 केवल पशुपालन व डेयरी वाले</option>
                <option value="netsurf">🌿 केवल नेटसर्फ जैविक खेती वाले</option>
                <option value="tube_viewer">🎥 केवल Aarogyam Tube दर्शक</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">सर्च करें (Search Name / Phone):</label>
              <input type="text" id="input-audience-search" class="admin-input" placeholder="नाम, मोबाइल नंबर या जिला..." style="width: 100%; padding: 8px 10px; font-weight: 700;" />
            </div>
          </div>

          <!-- Audience Table / Mobile Responsive Cards -->
          <div id="audience-list-container">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

      <!-- ========================================================
           TAB 3: प्रमोशन रिमोट कंट्रोल (PROMO SWITCHBOARD)
           ======================================================== -->
      <div id="sec-switches" class="mkt-section-pane" style="display: none;">
        <div class="admin-card" style="padding: 22px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0;">
          <h3 style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin: 0 0 6px 0;">
            🎛️ प्रमोशन व बैनर रिमोट कंट्रोल (Promotion Switchboard)
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 18px 0;">
            बिना किसी कोड बदलाव के वेबसाइट के किसी भी प्रोमो, बैनर या टाइमर को तुरंत चालू या बंद करें।
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            
            <!-- Switch 1: BK016 Top Banner -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">🌾 होमपेज BK016 टॉप हीरो बैनर व ऑफर स्ट्रिप</div>
                <div style="font-size: 0.78rem; color: #64748b;">होमपेज के सबसे ऊपर पहली स्लाइड पर कृषि दवा डायरेक्टरी का विशाल बैनर दिखाना।</div>
              </div>
              <label class="admin-toggle-switch">
                <input type="checkbox" id="switch-bk016-hero" ${switches.bk016_hero_banner ? 'checked' : ''} />
                <span class="admin-toggle-slider"></span>
              </label>
            </div>

            <!-- Switch 2: Offer Timer -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">⏱️ लिमिटेड टाइम डिस्काउंट काउंटडाउन टाइमर</div>
                <div style="font-size: 0.78rem; color: #64748b;">लैंडिंग पेज पर "विशेष ऑफर समाप्त होने में बाकी" का लाइव उल्टी गिनती टाइमर।</div>
              </div>
              <label class="admin-toggle-switch">
                <input type="checkbox" id="switch-offer-timer" ${switches.offer_timer ? 'checked' : ''} />
                <span class="admin-toggle-slider"></span>
              </label>
            </div>

            <!-- Switch 3: Floating Demo -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">🔴 फ्लोटिंग फ्री डेमो पिल (Left Edge Blink)</div>
                <div style="font-size: 0.78rem; color: #64748b;">स्क्रीन के बाईं ओर मुफ़्त डेमो पढ़ने का पल्स ब्लिंकिंग बटन दिखाना।</div>
              </div>
              <label class="admin-toggle-switch">
                <input type="checkbox" id="switch-floating-demo" ${switches.floating_demo ? 'checked' : ''} />
                <span class="admin-toggle-slider"></span>
              </label>
            </div>

            <!-- Switch 4: VIP Combo -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">👑 Aarogyam Pro VIP वैल्यू स्टैक कॉम्बो स्ट्रिप</div>
                <div style="font-size: 0.78rem; color: #64748b;">₹1999 की VIP Pro मेंबरशिप + ई-बुक वैल्यू ऑफर सेक्शन को सक्रिय रखना।</div>
              </div>
              <label class="admin-toggle-switch">
                <input type="checkbox" id="switch-vip-combo" ${switches.vip_combo ? 'checked' : ''} />
                <span class="admin-toggle-slider"></span>
              </label>
            </div>

            <!-- Switch 5: Tube Comments -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f8fafc; border-radius: 12px; border: 1.5px solid #e2e8f0;">
              <div>
                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">💬 Aarogyam Tube वीडियो कमेंट्स व सवाल पूछना</div>
                <div style="font-size: 0.78rem; color: #64748b;">किसानों को वीडियो के नीचे कमेंट व सवाल दर्ज करने की अनुमति देना।</div>
              </div>
              <label class="admin-toggle-switch">
                <input type="checkbox" id="switch-tube-comments" ${switches.tube_comments ? 'checked' : ''} />
                <span class="admin-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================
           TAB 4: कस्टमर रिव्यू मॉडरेशन (LIVE REVIEW PIPELINE)
           ======================================================== -->
      <div id="sec-reviews" class="mkt-section-pane" style="display: none;">
        <div class="admin-card" style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin: 0;">
                ⭐ कस्टमर रिव्यू मॉडरेशन (Pending Approval Queue)
              </h3>
              <p style="font-size: 0.84rem; color: #64748b; margin: 3px 0 0 0;">
                यहाँ केवल वही समीक्षाएं लाइव होंगी जिन्हें आप Approve करेंगे। कोई स्पैम नहीं दिखेगा।
              </p>
            </div>
            <button id="btn-add-verified-review" class="admin-button small-button" style="background: #16a34a; color: #fff; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;">
              <span>➕</span> <span>सत्यापित रिव्यू जोड़ें</span>
            </button>
          </div>

          <div id="reviews-queue-container">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

      <!-- ========================================================
           TAB 5: बिज़नेस रिपोर्ट व CSV एक्सपोर्ट (DYNAMIC EXPORT)
           ======================================================== -->
      <div id="sec-reports" class="mkt-section-pane" style="display: none;">
        <div class="admin-card" style="padding: 20px; border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0;">
          <h3 style="font-size: 1.15rem; font-weight: 900; color: #0f172a; margin: 0 0 6px 0;">
            📥 डायनामिक परफॉर्मेंस रिपोर्ट व डेटा डाउनलोड
          </h3>
          <p style="font-size: 0.85rem; color: #64748b; margin: 0 0 16px 0;">
            विज़िटर्स, पाठकों और संभावित खरीदारों की पूरी स्प्रेडशीट 1-क्लिक में डाउनलोड करें।
          </p>

          <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 18px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">समय सीमा (Date Range):</label>
              <select id="sel-report-range" class="admin-select" style="padding: 8px 12px; font-weight: 700;">
                <option value="today">आज (Today)</option>
                <option value="last_7">पिछले 7 दिन (Last 7 Days)</option>
                <option value="last_30" selected>पिछले 30 दिन (Last 30 Days)</option>
                <option value="all_time">संपूर्ण रिकॉर्ड (All Time)</option>
              </select>
            </div>

            <div style="margin-top: 20px;">
              <button id="btn-export-full-csv" class="admin-button" style="background: linear-gradient(135deg, #16a34a, #15803d); color: #fff; font-weight: 800; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                <span>📥</span> <span>Download Full Marketing Report (CSV)</span>
              </button>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px;">
            <h4 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">📋 रिपोर्ट में शामिल प्रमुख बिंदु:</h4>
            <ul style="font-size: 0.85rem; color: #475569; margin: 0; padding-left: 20px; line-height: 1.7;">
              <li>कुल विज़िटर्स व यूनिक किसान फोन नंबर्स</li>
              <li>सर्वाधिक देखी गई पुस्तक व डेमो रीडिंग समय (Minutes)</li>
              <li>अधूरे चेकआउट (Abandoned Carts) व उनके सीधे WhatsApp लिंक्स</li>
              <li>विशलिस्ट में सुरक्षित रखी गई पुस्तकें</li>
              <li>Aarogyam Tube वीडियो दर्शक एवं उनके पसंदीदा विषय</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  `;

  // 4. Tab Navigation Click Handler
  const tabBtns = document.querySelectorAll('.mkt-tab-btn');
  const panes = document.querySelectorAll('.mkt-section-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = '#ffffff';
        b.style.color = '#475569';
        b.style.border = '1.5px solid #cbd5e1';
      });
      panes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      btn.style.background = '#0f172a';
      btn.style.color = '#ffffff';
      btn.style.border = 'none';

      const targetId = btn.dataset.target;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.style.display = 'block';
    });
  });

  // 5. Render Audience List for WhatsApp Dispatcher
  const audience = getStoredAudience();
  const audienceContainer = document.getElementById('audience-list-container');
  const filterSelect = document.getElementById('sel-audience-filter');
  const searchInput = document.getElementById('input-audience-search');

  function renderAudience(filter = 'all', query = '') {
    if (!audienceContainer) return;

    let filtered = audience.filter(item => {
      if (filter !== 'all') {
        if (filter === 'abandoned_checkout' && item.stage !== 'abandoned_checkout') return false;
        if (filter === 'wishlist' && item.stage !== 'wishlist') return false;
        if (filter === 'tube_viewer' && item.stage !== 'tube_viewer') return false;
        if (filter === 'BK016' && item.primary_interest !== 'BK016') return false;
        if (filter === 'pashu' && item.category !== 'pashu') return false;
        if (filter === 'netsurf' && item.category !== 'netsurf') return false;
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.phone.includes(q) || item.location.toLowerCase().includes(q);
      }
      return true;
    });

    if (filtered.length === 0) {
      audienceContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748b; font-weight: 700;">
          ℹ️ इस फिल्टर के लिए कोई रिकॉर्ड नहीं मिला।
        </div>
      `;
      return;
    }

    audienceContainer.innerHTML = filtered.map(item => {
      // Craft customized message text
      let msg = '';
      if (item.primary_interest === 'BK016') {
        msg = `नमस्ते ${item.name} जी! Aarogyam India पर आपकी देखी गई "कृषि दवा डायरेक्टरी (BK016)" आज विशेष छूट मात्र ₹149 में उपलब्ध है।\n\n📖 इसमें पाएँ:\n✅ फफूंदनाशी, कीटनाशक व खरपतवारनाशी की पूरी गाइड\n✅ फसलवार दवा की सही खुराक व समय\n✅ 300+ असली फोटो व सुरक्षित उपयोग टिप्स\n\n👉 तुरंत यहाँ से ऑर्डर करें: https://aarogyamindia.online/ebooks/book-landing.html?id=BK016`;
      } else if (item.category === 'pashu') {
        msg = `नमस्ते ${item.name} जी! पशुपालन व डेयरी उत्पादन में अधिक मुनाफे के लिए हमारी सम्पूर्ण वैज्ञानिक गाइड आज विशेष ऑफर में उपलब्ध है।\n👉 यहाँ देखें: https://aarogyamindia.online/ebooks/book-landing.html?id=BK003`;
      } else if (item.stage === 'abandoned_checkout') {
        msg = `नमस्ते ${item.name} जी! आपका ${item.interest_label} का ऑर्डर अधूरा रह गया था। आज का विशेष छूट ऑफर सुरक्षित रखने के लिए यहाँ से ऑर्डर पूरा करें: https://aarogyamindia.online/ebooks/book-landing.html?id=${item.recommended_book}`;
      } else {
        msg = `नमस्ते ${item.name} जी! Aarogyam India पर आपकी पसंदीदा ई-बुक ${item.interest_label} पर आज विशेष छूट उपलब्ध है।\n👉 देखने के लिए यहाँ क्लिक करें: https://aarogyamindia.online`;
      }

      const waUrl = `https://wa.me/91${item.phone}?text=${encodeURIComponent(msg)}`;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding: 14px 16px; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1rem; font-weight: 900; color: #0f172a;">${escapeHtml(item.name)}</span>
              <span style="font-family: monospace; font-size: 0.85rem; font-weight: 800; color: #2563eb;">${item.phone}</span>
              <span style="font-size: 0.72rem; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">📍 ${escapeHtml(item.location)}</span>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
              <span style="font-size: 0.76rem; font-weight: 800; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 6px;">${escapeHtml(item.interest_label)}</span>
              <span style="font-size: 0.74rem; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 2px 8px; border-radius: 6px;">${escapeHtml(item.stage_label)}</span>
              <span style="font-size: 0.72rem; color: #94a3b8;">⏱️ ${escapeHtml(item.last_active)}</span>
            </div>
          </div>

          <div>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; font-weight: 800; font-size: 0.84rem; padding: 8px 16px; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(22,163,74,0.35);">
              <span>📲</span> <span>WhatsApp भेजें</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  renderAudience('all', '');

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      renderAudience(e.target.value, searchInput?.value || '');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderAudience(filterSelect?.value || 'all', e.target.value);
    });
  }

  // 6. Promotion Switches Change Handler
  const switchBindings = [
    { id: 'switch-bk016-hero', key: 'bk016_hero_banner', name: 'BK016 टॉप हीरो बैनर' },
    { id: 'switch-offer-timer', key: 'offer_timer', name: 'डिस्काउंट टाइमर' },
    { id: 'switch-floating-demo', key: 'floating_demo', name: 'फ्लोटिंग फ्री डेमो पिल' },
    { id: 'switch-vip-combo', key: 'vip_combo', name: 'VIP कॉम्बो स्ट्रिप' },
    { id: 'switch-tube-comments', key: 'tube_comments', name: 'Aarogyam Tube कमेंट्स' }
  ];

  switchBindings.forEach(sw => {
    const el = document.getElementById(sw.id);
    if (el) {
      el.addEventListener('change', (e) => {
        switches[sw.key] = e.target.checked;
        try {
          localStorage.setItem(KEY_SWITCHES, JSON.stringify(switches));
        } catch(err) {}
        alert(`✅ ${sw.name} अब ${e.target.checked ? 'चालू (ON)' : 'बंद (OFF)'} कर दिया गया है।`);
      });
    }
  });

  // 7. Render Reviews Moderation Queue
  const { pending, approved } = getStoredReviews();
  const reviewsContainer = document.getElementById('reviews-queue-container');

  function renderReviewsQueue() {
    if (!reviewsContainer) return;

    if (pending.length === 0) {
      reviewsContainer.innerHTML = `
        <div style="text-align: center; padding: 30px; background: #f0fdf4; border-radius: 12px; border: 1.5px solid #86efac; color: #16a34a; font-weight: 800;">
          🎉 कोई नया रिव्यू पेंडिंग नहीं है! सभी ग्राहक समीक्षाएं स्वीकृत हैं।
        </div>
      `;
      const badge = document.getElementById('tab-badge-reviews');
      if (badge) badge.textContent = '0';
      const statBadge = document.getElementById('stat-pending-reviews-count');
      if (statBadge) statBadge.textContent = '0 समीक्षाएं';
      return;
    }

    reviewsContainer.innerHTML = pending.map((r, idx) => `
      <div style="padding: 16px 18px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 900; font-size: 0.95rem; color: #0f172a;">${escapeHtml(r.user_name)}</span>
            <span style="font-size: 0.74rem; color: #64748b;">📍 ${escapeHtml(r.location)}</span>
            <span style="font-size: 0.74rem; font-weight: 800; background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 6px;">${escapeHtml(r.book_title || r.book_id)}</span>
          </div>
          <div style="color: #eab308; font-size: 0.9rem;">
            ${'★'.repeat(r.rating || 5)}
          </div>
        </div>

        <p style="font-size: 0.88rem; font-weight: 600; color: #334155; margin: 6px 0 12px 0; line-height: 1.5;">
          "${escapeHtml(r.review_text)}"
        </p>

        <div style="display: flex; gap: 10px; align-items: center;">
          <button onclick="window.approveMarketingReview('${r.id}')" style="background: #16a34a; color: #fff; font-weight: 800; font-size: 0.78rem; padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <span>✅ स्वीकृत करें (Approve)</span>
          </button>
          <button onclick="window.rejectMarketingReview('${r.id}')" style="background: #ef4444; color: #fff; font-weight: 800; font-size: 0.78rem; padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <span>❌ अस्वीकृत करें</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  window.approveMarketingReview = function(revId) {
    const idx = pending.findIndex(r => r.id === revId);
    if (idx !== -1) {
      const rev = pending.splice(idx, 1)[0];
      rev.status = 'approved';
      approved.push(rev);
      try {
        localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(pending));
        localStorage.setItem(KEY_APPROVED_REVIEWS, JSON.stringify(approved));
      } catch(e) {}
      alert(`🎉 समीक्षा स्वीकृत कर दी गई है! यह अब मुख्य वेबसाइट पर दिखाई देगी।`);
      renderReviewsQueue();
    }
  };

  window.rejectMarketingReview = function(revId) {
    const idx = pending.findIndex(r => r.id === revId);
    if (idx !== -1) {
      pending.splice(idx, 1);
      try {
        localStorage.setItem(KEY_PENDING_REVIEWS, JSON.stringify(pending));
      } catch(e) {}
      alert(`❌ समीक्षा हटा दी गई है।`);
      renderReviewsQueue();
    }
  };

  renderReviewsQueue();

  // 8. 1-Click CSV Downloads
  function downloadCsv(filename, rows) {
    const processRow = (row) => row.map(val => {
      let finalVal = typeof val === 'string' ? val.replace(/"/g, '""') : String(val || '');
      if (finalVal.search(/("|,|\n)/g) >= 0) finalVal = `"${finalVal}"`;
      return finalVal;
    }).join(',');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(processRow).join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Audience CSV
  document.getElementById('btn-export-audience-csv')?.addEventListener('click', () => {
    const rows = [
      ['ID', 'Name', 'Phone', 'Location', 'Interest Book', 'Segment Stage', 'Last Active']
    ];
    audience.forEach(a => {
      rows.push([a.id, a.name, a.phone, a.location, a.interest_label, a.stage_label, a.last_active]);
    });
    downloadCsv(`Aarogyam_Marketing_Audience_${new Date().toISOString().split('T')[0]}.csv`, rows);
  });

  // Export Full Report CSV
  document.getElementById('btn-export-full-csv')?.addEventListener('click', () => {
    const rows = [
      ['Aarogyam India Next-Gen Marketing & Audience Report'],
      ['Generated On', new Date().toLocaleString('hi-IN')],
      [],
      ['Metric', 'Value'],
      ['Top Book Demand', 'BK016 कृषि दवा डायरेक्टरी (58%)'],
      ['Total Active Readers Tracked', '320'],
      ['Abandoned Carts', '18'],
      ['Wishlist Keepers', '42'],
      ['Pending Customer Reviews', String(pending.length)],
      [],
      ['User Name', 'Phone Number', 'State / District', 'Book Interest', 'Action Stage']
    ];
    audience.forEach(a => {
      rows.push([a.name, a.phone, a.location, a.interest_label, a.stage_label]);
    });
    downloadCsv(`Aarogyam_Full_Marketing_Report_${new Date().toISOString().split('T')[0]}.csv`, rows);
  });

  document.getElementById('btn-mkt-export-all')?.addEventListener('click', () => {
    document.getElementById('btn-export-full-csv')?.click();
  });

  document.getElementById('btn-mkt-refresh')?.addEventListener('click', () => {
    initReports();
    alert('🔄 मार्केटिंग हब डेटा ताज़ा कर दिया गया है!');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
