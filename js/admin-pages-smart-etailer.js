/**
 * ====================================================================
 * AAROGYAM INDIA - ADMIN SMART eTAILER & MISSION ₹8,19,250 CONTROL CENTER
 * Version: 4.0 (Full Tab Switching, Tutorial Manager, Custom Business Plans, TTS Studio & Sync Vault)
 * ====================================================================
 */

export async function initSmartEtailerAdmin(initialTargetTab = null) {
  const container = document.getElementById('page-content');
  if (!container) return;

  // Pre-load default JSON files if not present in localStorage or if small sample
  try {
    const catCheck = JSON.parse(localStorage.getItem('AI_ADMIN_CATALOG_OVERRIDE') || 'null');
    if (!catCheck || !catCheck.categories || catCheck.categories.length < 5 || (catCheck.categories[0].problems && catCheck.categories[0].problems.length < 5)) {
      const res = await fetch('/data/netsurf-diagnosis-catalog.json?v=' + Date.now());
      if (res.ok) {
        const d = await res.json();
        localStorage.setItem('AI_ADMIN_CATALOG_OVERRIDE', JSON.stringify(d));
      }
    }
  } catch (e) {}

  try {
    const mktCheck = JSON.parse(localStorage.getItem('AI_ADMIN_MARKETING_CATEGORIES') || 'null');
    if (!mktCheck || !Array.isArray(mktCheck) || mktCheck.length < 5 || (mktCheck[0].templates && mktCheck[0].templates.length < 5)) {
      const res = await fetch('/data/netsurf-marketing-hooks.json?v=' + Date.now());
      if (res.ok) {
        const d = await res.json();
        localStorage.setItem('AI_ADMIN_MARKETING_CATEGORIES', JSON.stringify(d));
      }
    }
  } catch (e) {}

  try {
    const audCheck = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || 'null');
    if (!audCheck || !Array.isArray(audCheck) || audCheck.length < 20) {
      let res = await fetch('/data/netsurf-audio-scripts.json?v=' + Date.now()).catch(() => null);
      if (!res || !res.ok) res = await fetch('../data/netsurf-audio-scripts.json?v=' + Date.now()).catch(() => null);
      if (!res || !res.ok) res = await fetch('data/netsurf-audio-scripts.json?v=' + Date.now()).catch(() => null);
      if (res && res.ok) {
        const d = await res.json();
        localStorage.setItem('AI_ADMIN_AUDIO_LESSONS', JSON.stringify(d));
      }
    }
  } catch (e) {}

  // 1. Load Main Admin Configuration from LocalStorage
  const savedConfig = JSON.parse(localStorage.getItem('AI_ADMIN_SMART_ETAILER_CONFIG') || JSON.stringify({
    page_title: '👑 स्मार्ट ई-टेलर (Smart eTailer)',
    mission_code: 'MISSION ₹8,19,250',
    announcement_ticker: '⚡ 15-दिवसीय मेगा साइकिल क्लोजिंग एक्टिव! शुक्रवार रिटेल 15% बोनस अनलॉक हेतु न्यूनतम ₹8,000 टर्नओवर लक्ष्य प्राप्त करें।',
    official_cycle_end_date: '',
    default_farmers_target: 5,
    default_stp_target: 2,
    default_demo_target: 2,
    default_order_target: 2500,
    retail_slab_1: 2000,
    retail_slab_2: 4000,
    retail_slab_3: 8000,
    cap_matching_target: 8192500,
    base_cap_days: 680,
    base_crore_days: 1410,
    todo_templates: [
      '🌱 सुबह 5 प्रगतिशील किसानों को Bio99 / Stimrich का डेमो वीडियो भेजें',
      '📞 शुक्रवार रिटेल क्लोजिंग से पहले 3 पेंडिंग उधारी कस्टमर्स को WhatsApp फॉलो-अप करें',
      '🎯 6th-Month Free Autoship वाले किसान (महीना 5) को फ्री गिफ्ट की जानकारी दें',
      '💼 2 नए सम्भावित डिस्ट्रीब्यूटर्स को Netsurf बिज़नेस प्लान शेयर करें'
    ]
  }));

  // 2. Load Tutorial Configuration
  const savedTutorial = JSON.parse(localStorage.getItem('AI_ADMIN_TUTORIAL_CONFIG') || JSON.stringify({
    title: '🎥 स्मार्ट ई-टेलर ट्यूटोरियल & ट्रेनिंग गाइड',
    subtitle: '15 दिन में ₹8,19,250 और 15% शुक्रवार क्लोजिंग सीखने की सरल विधि',
    video_url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1',
    steps: [
      'कंज्यूमर सर्वे: 30 सेकंड में किसान की समस्या चुनें और 1-क्लिक में WhatsApp नुस्खा भेजें।',
      'खाता बुक: नकद व उधारी दर्ज करें — यह स्वतः शुक्रवार 15% रिटेल बोनस में जुड़ेगा।',
      'सक्सेस पाथ & DSR: रोज 5 किसानों से मिलें और अपनी 15-दिन की कमाई दर्ज करके ₹1 करोड़ की अनुमानित तारीख देखें!'
    ]
  }));

  // 3. Load Custom Business Plans & Offers
  let savedCustomPlans = JSON.parse(localStorage.getItem('AI_ADMIN_CUSTOM_PLANS') || JSON.stringify([
    {
      id: 'plan_goa_2026',
      title: '🌴 3D/2N गोवा नेशनल लीडरशिप रिट्रीट (Goa Tour)',
      type: 'National Tour & Training',
      matching_target: 300000,
      reward: 'फ्लाइट टिकट + 5-स्टार होटल स्टे + नेशनल लीडरशिप ट्रेनिंग',
      deadline: '2026-10-31',
      description: 'दोनों टीमों (Team 1 & Team 2) से 3-3 लाख रुपये का फ्रेश टर्नओवर मैच करें और गोवा ट्रिप पाएं।'
    },
    {
      id: 'plan_car_club_2026',
      title: '🚗 अचीवर्स कार फंड क्लब (Car Achiever Bonus)',
      type: 'Special Club Offer',
      matching_target: 1500000,
      reward: '₹50,000 एकमुश्त कार डाउनपेमेंट बोनस + क्लब एलिट ट्रॉफी',
      deadline: '2026-12-31',
      description: '15 लाख मैचिंग टर्नओवर प्राप्त करें और कार अचीवर क्लब में शामिल हों।'
    }
  ]));

  // Render Admin UI
  container.innerHTML = `
    <div style="max-width: 1150px; margin: 0 auto; padding-bottom: 60px;">
      
      <!-- Top Title Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom:20px;">
        <div>
          <h1 style="font-size:1.5rem; font-weight:800; color:#f8fafc; margin:0; display:flex; align-items:center; gap:8px;">
            <span>👑 स्मार्ट ई-टेलर कंट्रोल सेंटर (Mission ₹8,19,250)</span>
          </h1>
          <p style="color:#94a3b8; margin:4px 0 0 0; font-size:0.85rem;">
            15-दिवसीय क्लोजिंग डेट, ट्यूटोरियल, बिज़नेस प्लान्स/ऑफर्स, TTS पॉडकास्ट, To-Do व सिंक वॉल्ट का संपूर्ण नियंत्रण
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <a href="/pages/smart-etailer.html" target="_blank" class="admin-btn admin-btn-secondary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none; background:#1e293b; color:#38bdf8; border:1px solid #38bdf8; padding:8px 14px; border-radius:8px; font-weight:700;">
            <span>👁️ लाइव यूजर पेज देखें</span>
          </a>
          <button id="btn-save-smart-admin" class="admin-btn admin-btn-primary" style="background:#1d4ed8; color:#fff; border:1px solid rgba(255,255,255,0.3); font-weight:800; padding:8px 18px; border-radius:8px; cursor:pointer;">
            💾 मुख्य सेटिंग्स सेव करें
          </button>
        </div>
      </div>

      <!-- Admin Functional Tab Switcher -->
      <div style="display:flex; gap:8px; overflow-x:auto; margin-bottom:20px; padding-bottom:6px; border-bottom:1px solid #334155;">
        <button type="button" class="adm-section-btn active" data-target="adm-sec-closing" style="background:#1d4ed8; color:#fff; border:none; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          ⏳ क्लोजिंग व टेक्स्ट
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-survey" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          🌱 सर्वे & केटेगरी मैनेजर
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-plans" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          🔥 बिज़नेस प्लान्स व ऑफर्स
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-tutorial" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          🎥 ट्यूटोरियल गाइड
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-tts" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          🎙️ AI ऑडियो स्टूडियो
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-marketing" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          🚀 मार्केटिंग & हुक्स स्टूडियो
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-todo" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          📋 To-Do टेम्पलेट्स
        </button>
        <button type="button" class="adm-section-btn" data-target="adm-sec-vault" style="background:#1e293b; color:#cbd5e1; border:1px solid #334155; padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:800; cursor:pointer; white-space:nowrap;">
          📊 सिंक वॉल्ट मॉनिटर
        </button>
      </div>

      <!-- ===================================================================
           TAB 1: CLOSING DATE, HEADLINES & TARGET CALCULATOR DEFAULTS
      ==================================================================== -->
      <div id="adm-sec-closing" class="adm-pane" style="display:block;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:18px; margin-bottom:20px;">
          
          <!-- Card 1: 15-Day Fortnightly Cycle Date Control -->
          <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <div style="background:#f59e0b22; color:#f59e0b; padding:6px 10px; border-radius:8px; font-size:1.2rem;">⏳</div>
              <div>
                <h3 style="margin:0; font-size:1rem; color:#f8fafc;">15-दिवसीय साइकिल क्लोजिंग डेट</h3>
                <span style="font-size:0.72rem; color:#94a3b8;">Netsurf 15-Day Mega Cycle Deadline</span>
              </div>
            </div>
            
            <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:6px; font-weight:600;">आधिकारिक 15-Day क्लोजिंग डेट व समय सेट करें:</label>
            <input type="datetime-local" id="admin-cycle-date" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;" value="${savedConfig.official_cycle_end_date || ''}">
            
            <p style="font-size:0.75rem; color:#fbbf24; margin:8px 0 0 0; line-height:1.4;">
              💡 <strong>नोट:</strong> यह डेट सेट करने पर सभी यूज़र्स के PWA पेज पर 15-दिन की उल्टी गिनती (Countdown Timer) इस तारीख के अनुसार चलने लगेगी।
            </p>
          </div>

          <!-- Card 2: Page Headlines & Live Announcement Ticker -->
          <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <div style="background:#3b82f622; color:#3b82f6; padding:6px 10px; border-radius:8px; font-size:1.2rem;">📢</div>
              <div>
                <h3 style="margin:0; font-size:1rem; color:#f8fafc;">हेडलाइन व टिकर टेक्स्ट</h3>
                <span style="font-size:0.72rem; color:#94a3b8;">Page UI & Motivation Banner</span>
              </div>
            </div>

            <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px; font-weight:600;">पेज मुख्य शीर्षक (Page Title):</label>
            <input type="text" id="admin-page-title" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px; margin-bottom:8px;" value="${savedConfig.page_title}">

            <label style="display:block; font-size:0.8rem; color:#cbd5e1; margin-bottom:4px; font-weight:600;">लाइव स्क्रॉलिंग टिकर संदेश:</label>
            <textarea id="admin-announcement-ticker" class="admin-input" rows="2" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">${savedConfig.announcement_ticker}</textarea>
          </div>

          <!-- Card 3: Default DSR Daily KPI Targets -->
          <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:18px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
              <div style="background:#10b98122; color:#10b981; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🎯</div>
              <div>
                <h3 style="margin:0; font-size:1rem; color:#f8fafc;">डिफ़ॉल्ट DSR व दैनिक लक्ष्य</h3>
                <span style="font-size:0.72rem; color:#94a3b8;">Daily KPI Simulator Defaults</span>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8;">डेली किसान मीट:</label>
                <input type="number" id="admin-kpi-farmers" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 8px; border-radius:6px;" value="${savedConfig.default_farmers_target}">
              </div>
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8;">डेली STP प्लान:</label>
                <input type="number" id="admin-kpi-stp" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 8px; border-radius:6px;" value="${savedConfig.default_stp_target}">
              </div>
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8;">डेली डेमो लक्ष्य:</label>
                <input type="number" id="admin-kpi-demo" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 8px; border-radius:6px;" value="${savedConfig.default_demo_target}">
              </div>
              <div>
                <label style="display:block; font-size:0.72rem; color:#94a3b8;">डेली ऑर्डर (₹):</label>
                <input type="number" id="admin-kpi-order" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 8px; border-radius:6px;" value="${savedConfig.default_order_target}">
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ===================================================================
           TAB: SURVEY & CATEGORY / DIAGNOSIS STUDIO
      ==================================================================== -->
      <div id="adm-sec-survey" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1.5px solid #10b981; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#10b98122; color:#10b981; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🌱</div>
              <div>
                <h3 style="margin:0; font-size:1.1rem; color:#f8fafc;">कंज्यूमर सर्वे & केटेगरी डेटा एंट्री मैनेजर</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">यहाँ से नई केटेगरी (ब्यूटी, स्किन केयर, फसल आदि) व समस्या समाधान लाइव जोड़ें</span>
              </div>
            </div>
          </div>

          <!-- Section A: Add New Category -->
          <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:16px;">
            <h4 style="color:#38bdf8; font-size:0.9rem; margin:0 0 10px 0;">➕ 1. नई केटेगरी जोड़ें (Category Creator):</h4>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">केटेगरी ID (English) *:</label>
                <input type="text" id="admin-cat-id" class="admin-input" placeholder="उदा. beauty_skincare" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">केटेगरी का पूरा नाम *:</label>
                <input type="text" id="admin-cat-name" class="admin-input" placeholder="उदा. 💄 ब्यूटी & स्किन केयर (Herbs & More)" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">आइकन / इमोजी (Icon):</label>
                <input type="text" id="admin-cat-icon" class="admin-input" placeholder="💄" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">बैज नाम (Badge):</label>
                <input type="text" id="admin-cat-badge" class="admin-input" placeholder="HERBS & MORE" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>
            <button type="button" id="btn-add-admin-cat" class="admin-btn" style="background:#1d4ed8; color:#fff; font-weight:800; padding:8px 16px; border-radius:8px; border:none; cursor:pointer;">
              ➕ केटेगरी सेव करें
            </button>
          </div>

          <!-- Section B: Add Problem & Prescription Solution -->
          <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:16px;">
            <h4 style="color:#10b981; font-size:0.9rem; margin:0 0 10px 0;">➕ 2. समस्या व सुझाये गए प्रोडक्ट नुस्खा जोड़ें (Problem & Remedy):</h4>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">केटेगरी चुनें *:</label>
                <select id="admin-prob-cat-select" class="admin-input" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
                  <option value="agri">🌾 कृषि समाधान (Biofit)</option>
                  <option value="cattle">🐄 पशुधन (CFC Plus)</option>
                  <option value="health">💊 स्वास्थ्य (Naturamore)</option>
                  <option value="cosmetics">💄 ब्यूटी & स्किन केयर (Herbs & More)</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">समस्या का शीर्षक (Problem Title) *:</label>
                <input type="text" id="admin-prob-title" class="admin-input" placeholder="उदा. कील-मुंहासे व दाग-धब्बे (Acne Care)" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">लक्षण (Symptoms):</label>
                <input type="text" id="admin-prob-symptoms" class="admin-input" placeholder="चेहरे पर पिंपल्स, झाइयां, ऑयली स्किन" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">सुझाए गए प्रोडक्ट्स (Products Combo) *:</label>
                <input type="text" id="admin-prob-products" class="admin-input" placeholder="Neem Face Wash + Vitamin Therapy Cream" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">खुराक व विधि (Dosage):</label>
                <input type="text" id="admin-prob-dosage" class="admin-input" placeholder="दिन में 2 बार चेहरे पर लगाएं" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">लाभ (Benefits):</label>
                <input type="text" id="admin-prob-benefits" class="admin-input" placeholder="7 दिन में पिंपल्स खत्म व नेचुरल ग्लो" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">WhatsApp मैसेज टेम्पलेट (Auto Prescription):</label>
              <textarea id="admin-prob-whatsapp" class="admin-input" rows="2" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;" placeholder="✨ *कील-मुंहासों से 100% हर्बल मुक्ति* ✨..."></textarea>
            </div>

            <button type="button" id="btn-add-admin-prob" class="admin-btn" style="background:#10b981; color:#000; font-weight:800; padding:8px 18px; border-radius:8px; border:none; cursor:pointer;">
              ➕ यह समस्या व नुस्खा लाइव पब्लिश करें
            </button>
          </div>

          <!-- Section C: Active Diagnosis Problems List -->
          <div>
            <h4 style="color:#f8fafc; font-size:0.9rem; margin:0 0 10px 0;">📑 वर्तमान में लाइव सर्वे समस्याएं व नुस्खे:</h4>
            <div id="admin-survey-problems-list" style="display:flex; flex-direction:column; gap:8px;">
              <!-- Dynamically Populated -->
            </div>
          </div>

        </div>
      </div>

      <!-- ===================================================================
           TAB 2: CUSTOM BUSINESS PLANS, FAST TRACK OFFERS & TRIP CONTESTS
      ==================================================================== -->
      <div id="adm-sec-plans" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1.5px solid #f59e0b; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#f59e0b22; color:#f59e0b; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🔥</div>
              <div>
                <h3 style="margin:0; font-size:1.1rem; color:#f8fafc;">विशेष बिज़नेस प्लान्स, फास्ट ट्रैक व ऑफर्स मैनेजर</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">यहाँ से नए प्लान जोड़ें — यह तुरंत डिस्ट्रीब्यूटर ऐप में लाइव दिखेगा</span>
              </div>
            </div>
          </div>

          <!-- Add New Plan Form -->
          <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:16px;">
            <h4 style="color:#fbbf24; font-size:0.9rem; margin:0 0 10px 0;">➕ नया बिज़नेस प्लान / ऑफर जोड़ें:</h4>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">योजना / प्लान का नाम *:</label>
                <input type="text" id="plan-input-title" class="admin-input" placeholder="उदा. 🌴 गोवा नेशनल लीडरशिप ट्रिप" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">कैटेगरी / प्रकार:</label>
                <select id="plan-input-type" class="admin-input" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
                  <option value="National Tour & Training">🌴 नेशनल टूर व ट्रेनिंग (Tour)</option>
                  <option value="Special Fast Track Offer">⚡ स्पेशल फास्ट ट्रैक ऑफर</option>
                  <option value="Car / House Fund Club">🚗 कार / हाउस फंड क्लब</option>
                  <option value="Retail Bonanza Cash Bonus">💰 रिटेल बोनान्ज़ा कैश बोनस</option>
                  <option value="Mega Cycle Cap Club">👑 15-डे ₹8.19L कैप क्लब</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">मैचिंग टर्नओवर लक्ष्य (₹) *:</label>
                <input type="number" id="plan-input-target" class="admin-input" placeholder="300000" style="width:100%; background:#1e293b; border:1px solid #475569; color:#34d399; font-weight:800; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">अंतिम योग्यता तिथि (Deadline):</label>
                <input type="date" id="plan-input-deadline" class="admin-input" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fbbf24; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">इनाम / रिवॉर्ड / पर्स (Reward) *:</label>
                <input type="text" id="plan-input-reward" class="admin-input" placeholder="उदा. फ्लाइट + 5-स्टार स्टे + नेशनल स्टेज सम्मान" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">शर्तें / संक्षिप्त विवरण (Description):</label>
                <input type="text" id="plan-input-desc" class="admin-input" placeholder="उदा. Team 1 और Team 2 से 3-3 लाख मैचिंग जरूरी" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <button id="btn-add-custom-plan" class="admin-btn admin-btn-primary" style="background:#10b981; color:#000; font-weight:800; padding:8px 18px; border-radius:8px; border:none; cursor:pointer;">
              ➕ यह प्लान / ऑफर लाइव पब्लिश करें
            </button>
          </div>

          <!-- Active Plans List -->
          <div>
            <h4 style="color:#f8fafc; font-size:0.9rem; margin:0 0 10px 0;">📋 वर्तमान में एक्टिव बिज़नेस प्लान्स व ऑफर्स:</h4>
            <div id="admin-custom-plans-list" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:10px;">
              <!-- Dynamically Rendered -->
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================================
           TAB 3: TAB TUTORIAL VIDEO & STEP-BY-STEP GUIDE MANAGER
      ==================================================================== -->
      <div id="adm-sec-tutorial" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1.5px solid #38bdf8; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#38bdf822; color:#38bdf8; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🎥</div>
              <div>
                <h3 style="margin:0; font-size:1.1rem; color:#f8fafc;">ट्यूटोरियल वीडियो व स्टेप-बाय-स्टेप गाइड मैनेजर</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">यूजर ऐप में '🎥 ट्यूटोरियल' बटन का वीडियो व हिंदी गाइड बदलें</span>
              </div>
            </div>
            <button id="btn-save-tutorial-config" class="admin-btn admin-btn-primary" style="background:#0284c7; color:#fff; font-weight:800; padding:8px 16px; border-radius:8px; border:none; cursor:pointer;">
              💾 ट्यूटोरियल गाइड सेव करें
            </button>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div>
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:4px; font-weight:600;">ट्यूटोरियल मोडल शीर्षक (Title):</label>
              <input type="text" id="admin-tutorial-title" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;" value="${savedTutorial.title}">
            </div>
            <div>
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:4px; font-weight:600;">उप-शीर्षक (Subtitle):</label>
              <input type="text" id="admin-tutorial-subtitle" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;" value="${savedTutorial.subtitle}">
            </div>
          </div>

          <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:4px; font-weight:600;">YouTube वीडियो Embed URL:</label>
          <input type="text" id="admin-tutorial-video-url" class="admin-input" style="width:100%; background:#0f172a; border:1px solid #475569; color:#38bdf8; padding:8px 10px; border-radius:8px; margin-bottom:12px;" value="${savedTutorial.video_url}">

          <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:6px; font-weight:600;">हिंदी गाइड स्टेप्स:</label>
          <div id="admin-tutorial-steps-container" style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
            ${(savedTutorial.steps || []).map((step, idx) => `
              <div style="display:flex; gap:6px; align-items:center;">
                <span style="background:#0f172a; border:1px solid #475569; color:#fbbf24; font-weight:800; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.75rem; flex-shrink:0;">${idx + 1}</span>
                <input type="text" class="admin-tutorial-step-input admin-input" style="flex:1; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.82rem;" value="${step}">
                <button class="btn-del-tutorial-step" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 10px; cursor:pointer;">🗑️</button>
              </div>
            `).join('')}
          </div>
          <button id="btn-add-tutorial-step" class="admin-btn admin-btn-secondary" style="font-size:0.78rem; padding:6px 12px; background:#1e293b; color:#38bdf8; border:1px solid #38bdf8;">+ नया स्टेप जोड़ें</button>
        </div>
      </div>

      <!-- ===================================================================
           TAB 4: TEXT-TO-AUDIO (TTS) STUDIO
      ==================================================================== -->
      <div id="adm-sec-tts" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#ec489922; color:#ec4899; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🎙️</div>
              <div>
                <h3 style="margin:0; font-size:1.05rem; color:#f8fafc;">टेक्स्ट-टू-ऑडियो (Text-to-Audio) AI पॉडकास्ट स्टूडियो</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">हिंदी में टेक्स्ट लिखें और स्मार्ट ई-टेलर ट्रेनिंग हब में लाइव पब्लिश करें</span>
              </div>
            </div>
            <div style="display:flex; gap:6px;">
              <button id="btn-test-tts" class="admin-btn admin-btn-secondary" style="font-size:0.78rem; background:#3b82f622; color:#60a5fa; border:1px solid #3b82f6; cursor:pointer;">
                🔊 AI वॉयस टेस्ट
              </button>
              <button id="btn-stop-tts" class="admin-btn admin-btn-secondary" style="font-size:0.78rem; background:#ef444422; color:#ef4444; border:1px solid #ef4444; cursor:pointer;">
                ⏹️ स्टॉप
              </button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">ऑडियो लेसन शीर्षक *:</label>
              <input type="text" id="admin-tts-title" class="admin-input" placeholder="उदा. 🌾 बायोफिट से 3 गुना रिटेल सेल कैसे करें?" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
            </div>
            <div>
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">प्रवक्ता / लीडर नाम व अवधि:</label>
              <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
                <input type="text" id="admin-tts-speaker" class="admin-input" placeholder="उदा. दिलीप बोरसे (लीडर)" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
                <input type="text" id="admin-tts-duration" class="admin-input" placeholder="2:30 Min" value="2:30 Min" style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>
          </div>

          <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">हिंदी स्क्रिप्ट / लेसन सारांश *:</label>
          <textarea id="admin-tts-script" class="admin-input" rows="3" placeholder="नमस्ते ई-टेलर साथियों! आज हम जानेंगे कि किसानों को स्टीमरिच व बायो 99 का डेमो दिखाकर आप 15% शुक्रवार रिटेल बोनस कैसे हासिल कर सकते हैं..." style="width:100%; background:#0f172a; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px; margin-bottom:10px;"></textarea>

          <button id="btn-publish-audio-lesson" class="admin-btn admin-btn-primary" style="background:#1d4ed8; color:#fff; font-weight:800; padding:8px 16px; border-radius:8px; border:none; cursor:pointer;">
            🚀 ट्रेनिंग हब में लाइव पब्लिश करें
          </button>

          <!-- Published Audio Lessons List -->
          <div style="margin-top:14px; border-top:1px solid #334155; padding-top:10px;">
            <h4 style="font-size:0.8rem; color:#38bdf8; margin:0 0 6px 0;">📻 लाइव पब्लिश किए गए ऑडियो लेसन्स:</h4>
            <div id="admin-published-audio-list" style="display:flex; flex-direction:column; gap:6px;"></div>
          </div>
        </div>
      </div>

      <!-- ===================================================================
           TAB 4.5: MARKETING ENGINE & WHATSAPP HOOKS STUDIO
      ==================================================================== -->
      <div id="adm-sec-marketing" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1.5px solid #3b82f6; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#3b82f622; color:#3b82f6; padding:6px 10px; border-radius:8px; font-size:1.2rem;">🚀</div>
              <div>
                <h3 style="margin:0; font-size:1.1rem; color:#f8fafc;">स्मार्ट मार्केटिंग इंजन, हुक व शायरी स्टूडियो</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">यहाँ से WhatsApp हुक्स, शायरी, CTA व लैंडिंग पेज टेम्पलेट्स मैनेज करें</span>
              </div>
            </div>
          </div>

          <!-- Category Manager Card -->
          <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
              <h4 style="color:#fde047; font-size:0.9rem; margin:0;">📁 मार्केटिंग श्रेणियां (Categories):</h4>
              <span style="font-size:0.72rem; color:#94a3b8;">नई श्रेणी जोड़ें या मौजूदा श्रेणियां मैनेज करें</span>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 2fr auto; gap:8px; margin-bottom:10px;">
              <input type="text" id="adm-mkt-new-cat-id" class="admin-input" placeholder="ID (उदा. festival)" style="background:#1e293b; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.8rem;">
              <input type="text" id="adm-mkt-new-cat-name" class="admin-input" placeholder="नाम (उदा. 🪔 त्यौहार व ऑफर्स)" style="background:#1e293b; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.8rem;">
              <button type="button" id="btn-add-mkt-cat" class="admin-btn" style="background:#3b82f6; color:#fff; font-weight:800; padding:6px 14px; border-radius:8px; border:none; cursor:pointer; font-size:0.8rem;">
                + श्रेणी जोड़ें
              </button>
            </div>

            <div id="adm-mkt-categories-chips" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
          </div>

          <!-- Add New Marketing Hook Form -->
          <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:14px; margin-bottom:16px;">
            <h4 style="color:#38bdf8; font-size:0.9rem; margin:0 0 10px 0;">➕ नया WhatsApp हुक व शायरी टेम्पलेट जोड़ें:</h4>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">कैटेगरी चुनें *:</label>
                <select id="adm-mkt-cat-select" class="admin-input" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
                  <option value="agriculture">🌾 कृषि (Agriculture)</option>
                  <option value="cattle">🐄 डेयरी व पशुधन (CFC Care)</option>
                  <option value="health">💊 स्वास्थ्य व पोषण (Naturamore)</option>
                  <option value="cosmetics">💄 ब्यूटी व पर्सनल केयर (Herbs & More)</option>
                  <option value="business">💼 रोजगार व बिजनेस प्लान</option>
                  <option value="product">🎁 स्पेशल कॉम्बो व ऑफर्स</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">टेम्पलेट का शीर्षक *:</label>
                <input type="text" id="adm-mkt-title" class="admin-input" placeholder="उदा. फसल में इल्ली व कीट का 100% जैविक नुस्खा" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <div style="margin-bottom:10px;">
              <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">हुक संदेश (Opening Hook) *:</label>
              <textarea id="adm-mkt-hook" class="admin-input" rows="2" placeholder="🚨 क्या आपकी फसल में भी पीलापन या कीट आ रहे हैं?..." style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;"></textarea>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px;">
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">शायरी / प्रेरणादायक पंक्ति (Shayari / Punchline):</label>
                <input type="text" id="adm-mkt-shayari" class="admin-input" placeholder="🌾 मेहनत किसान की, रंग लाएगी हर बार..." style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
              <div>
                <label style="display:block; font-size:0.75rem; color:#cbd5e1; margin-bottom:3px; font-weight:600;">कॉल टू एक्शन (Call To Action):</label>
                <input type="text" id="adm-mkt-cta" class="admin-input" placeholder="👉 अभी संपूर्ण मार्गदर्शिका देखने के लिए यहाँ क्लिक करें:" value="👉 अभी संपूर्ण विवरण देखने के लिए यहाँ क्लिक करें:" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px;">
              </div>
            </div>

            <button type="button" id="btn-add-admin-mkt-template" class="admin-btn" style="background:#10b981; color:#000; font-weight:800; padding:8px 18px; border-radius:8px; border:none; cursor:pointer;">
              ➕ यह हुक टेम्पलेट लाइव पब्लिश करें
            </button>
          </div>

          <!-- Active Templates List -->
          <div>
            <h4 style="color:#f8fafc; font-size:0.9rem; margin:0 0 10px 0;">📑 लाइव मार्केटिंग टेम्पलेट्स:</h4>
            <div id="admin-marketing-templates-list" style="display:flex; flex-direction:column; gap:8px;"></div>
          </div>
        </div>
      </div>

      <!-- ===================================================================
           TAB 5: UNIVERSAL TO-DO TEMPLATES
      ==================================================================== -->
      <div id="adm-sec-todo" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#a855f722; color:#a855f7; padding:6px 10px; border-radius:8px; font-size:1.2rem;">✅</div>
              <div>
                <h3 style="margin:0; font-size:1.05rem; color:#f8fafc;">यूनिवर्सल To-Do लिस्ट टास्क टेम्पलेट्स</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">ये टास्क सभी डिस्ट्रीब्यूटर्स की To-Do लिस्ट में जुड़ेंगे</span>
              </div>
            </div>
            <button id="btn-add-todo-template" class="admin-btn admin-btn-secondary" style="font-size:0.78rem; padding:6px 10px;">+ नया टास्क जोड़ें</button>
          </div>

          <div id="todo-templates-container" style="display:flex; flex-direction:column; gap:6px;">
            ${(savedConfig.todo_templates || []).map((t, idx) => `
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" class="admin-todo-item-input admin-input" style="flex:1; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.82rem;" value="${t}">
                <button class="btn-del-todo-item" data-idx="${idx}" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 10px; cursor:pointer;">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- ===================================================================
           TAB 6: SYNCED DISTRIBUTOR VAULT MONITOR
      ==================================================================== -->
      <div id="adm-sec-vault" class="adm-pane" style="display:none;">
        <div class="admin-card" style="background:#1e293b; border:1px solid #334155; border-radius:12px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="background:#10b98122; color:#10b981; padding:6px 10px; border-radius:8px; font-size:1.2rem;">📊</div>
              <div>
                <h3 style="margin:0; font-size:1.05rem; color:#f8fafc;">डिस्ट्रीब्यूटर वॉल्ट सिंक मॉनिटर</h3>
                <span style="font-size:0.75rem; color:#94a3b8;">रात 12:00 बजे ऑटो-सिंक हुआ डिस्ट्रीब्यूटर्स का डेटा</span>
              </div>
            </div>
            <button id="btn-refresh-vault" class="admin-btn admin-btn-secondary" style="font-size:0.78rem; background:#0f172a; color:#cbd5e1; border:1px solid #475569; padding:6px 12px; border-radius:6px; cursor:pointer;">🔄 रीफ्रेश</button>
          </div>

          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.82rem; color:#cbd5e1;">
              <thead>
                <tr style="background:#0f172a; color:#94a3b8; border-bottom:2px solid #334155;">
                  <th style="padding:8px 10px;">Share ID</th>
                  <th style="padding:8px 10px;">डिस्ट्रीब्यूटर मोबाइल</th>
                  <th style="padding:8px 10px;">शुक्रवार रिटेल</th>
                  <th style="padding:8px 10px;">15-दिन टर्नओवर</th>
                  <th style="padding:8px 10px;">खाता एंट्रीज</th>
                  <th style="padding:8px 10px;">सिंक का समय</th>
                </tr>
              </thead>
              <tbody id="vault-table-body">
                <!-- Dynamically Populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `;

  // -------------------------------------------------------------
  // ADMIN TAB SWITCHER LOGIC
  // -------------------------------------------------------------
  const sectionBtns = document.querySelectorAll('.adm-section-btn');
  const panes = document.querySelectorAll('.adm-pane');

  sectionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');

      sectionBtns.forEach(b => {
        b.classList.remove('active');
        b.style.background = '#1e293b';
        b.style.color = '#cbd5e1';
        b.style.border = '1px solid #334155';
      });

      btn.classList.add('active');
      btn.style.background = '#1d4ed8';
      btn.style.color = '#fff';
      btn.style.border = 'none';

      panes.forEach(p => {
        if (p.id === targetId) {
          p.style.display = 'block';
        } else {
          p.style.display = 'none';
        }
      });
    });
  });

  // Trigger initial tab if requested (e.g. from marketing-templates route)
  const tabToOpen = initialTargetTab || new URLSearchParams(window.location.search).get('tab');
  if (tabToOpen) {
    const btn = document.querySelector(`.adm-section-btn[data-target="${tabToOpen}"]`);
    if (btn) btn.click();
  }

  // -------------------------------------------------------------
  // SUPABASE CLOUD SYNC HELPER (ZERO EGRESS PERSISTENCE)
  // -------------------------------------------------------------
  async function syncToSupabaseConfig(key, data) {
    try {
      if (window.supabaseClient) {
        await window.supabaseClient
          .from('site_configs')
          .upsert({ key: key, value: data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      }
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }
  }

  // -------------------------------------------------------------
  // EVENT BINDINGS: MAIN SETTINGS SAVE
  // -------------------------------------------------------------
  document.getElementById('btn-save-smart-admin')?.addEventListener('click', () => {
    const todoInputs = Array.from(document.querySelectorAll('.admin-todo-item-input')).map(i => i.value.trim()).filter(Boolean);
    const newConfig = {
      page_title: document.getElementById('admin-page-title').value.trim() || '👑 स्मार्ट ई-टेलर (Smart eTailer)',
      mission_code: 'MISSION ₹8,19,250',
      announcement_ticker: document.getElementById('admin-announcement-ticker').value.trim(),
      official_cycle_end_date: document.getElementById('admin-cycle-date').value,
      default_farmers_target: Number(document.getElementById('admin-kpi-farmers').value) || 5,
      default_stp_target: Number(document.getElementById('admin-kpi-stp').value) || 2,
      default_demo_target: Number(document.getElementById('admin-kpi-demo').value) || 2,
      default_order_target: Number(document.getElementById('admin-kpi-order').value) || 2500,
      cap_matching_target: savedConfig.cap_matching_target || 8192500,
      base_cap_days: savedConfig.base_cap_days || 680,
      base_crore_days: savedConfig.base_crore_days || 1410,
      todo_templates: todoInputs
    };

    localStorage.setItem('AI_ADMIN_SMART_ETAILER_CONFIG', JSON.stringify(newConfig));
    syncToSupabaseConfig('smart_etailer_config', newConfig);
    alert("✅ मुख्य सेटिंग्स व क्लोजिंग डेट सफलतापूर्वक लाइव पब्लिश हो गईं!");
  });

  // -------------------------------------------------------------
  // EVENT BINDINGS: TUTORIAL CONFIG MANAGER
  // -------------------------------------------------------------
  function bindTutorialStepDeleteBtns() {
    document.querySelectorAll('.btn-del-tutorial-step').forEach(btn => {
      btn.onclick = () => btn.closest('div').remove();
    });
  }
  bindTutorialStepDeleteBtns();

  document.getElementById('btn-add-tutorial-step')?.addEventListener('click', () => {
    const container = document.getElementById('admin-tutorial-steps-container');
    const idx = container.children.length + 1;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:6px; align-items:center;';
    div.innerHTML = `
      <span style="background:#0f172a; border:1px solid #475569; color:#fbbf24; font-weight:800; width:26px; height:26px; display:flex; align-items:center; justify-content:center; border-radius:6px; font-size:0.75rem; flex-shrink:0;">${idx}</span>
      <input type="text" class="admin-tutorial-step-input admin-input" style="flex:1; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.82rem;" placeholder="नया गाइड स्टेप लिखें...">
      <button class="btn-del-tutorial-step" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 10px; cursor:pointer;">🗑️</button>
    `;
    container.appendChild(div);
    div.querySelector('.btn-del-tutorial-step').onclick = () => div.remove();
  });

  document.getElementById('btn-save-tutorial-config')?.addEventListener('click', () => {
    const title = document.getElementById('admin-tutorial-title').value.trim();
    const subtitle = document.getElementById('admin-tutorial-subtitle').value.trim();
    const videoUrl = document.getElementById('admin-tutorial-video-url').value.trim();
    const steps = Array.from(document.querySelectorAll('.admin-tutorial-step-input')).map(i => i.value.trim()).filter(Boolean);

    const tutObj = {
      title: title || '🎥 स्मार्ट ई-टेलर ट्यूटोरियल & ट्रेनिंग गाइड',
      subtitle: subtitle || '15 दिन में ₹8,19,250 और 15% शुक्रवार क्लोजिंग सीखने की सरल विधि',
      video_url: videoUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?enablejsapi=1',
      steps: steps.length ? steps : [
        'कंज्यूमर सर्वे: 30 सेकंड में किसान की समस्या चुनें और 1-क्लिक में WhatsApp नुस्खा भेजें।',
        'खाता बुक: नकद व उधारी दर्ज करें — यह स्वतः शुक्रवार 15% रिटेल बोनस में जुड़ेगा।',
        'सक्सेस पाथ & DSR: रोज 5 किसानों से मिलें और अपनी 15-दिन की कमाई दर्ज करके ₹1 करोड़ की अनुमानित तारीख देखें!'
      ]
    };

    localStorage.setItem('AI_ADMIN_TUTORIAL_CONFIG', JSON.stringify(tutObj));
    syncToSupabaseConfig('tutorial_config', tutObj);
    alert("✅ ट्यूटोरियल गाइड व वीडियो सेटिंग्स सफलतापूर्वक सेव हो गई!");
  });

  // -------------------------------------------------------------
  // EVENT BINDINGS: CUSTOM BUSINESS PLANS & OFFERS
  // -------------------------------------------------------------
  function renderAdminCustomPlans() {
    const listWrap = document.getElementById('admin-custom-plans-list');
    if (!listWrap) return;

    if (!savedCustomPlans || savedCustomPlans.length === 0) {
      listWrap.innerHTML = `<div style="color:#94a3b8; padding:10px;">कोई कस्टम प्लान नहीं मिला। नया प्लान जोड़ें।</div>`;
      return;
    }

    listWrap.innerHTML = savedCustomPlans.map((p, idx) => `
      <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
            <strong style="color:#f8fafc; font-size:0.92rem;">${p.title}</strong>
            <span style="font-size:0.68rem; background:#3b82f622; color:#60a5fa; border:1px solid #3b82f6; padding:2px 6px; border-radius:4px;">${p.type || 'Offer'}</span>
          </div>
          <div style="font-size:0.78rem; color:#34d399; font-weight:800; margin-top:4px;">
            🎯 मैचिंग लक्ष्य: ₹${Number(p.matching_target).toLocaleString('en-IN')}
          </div>
          <div style="font-size:0.75rem; color:#fde047; margin-top:2px;">
            🎁 रिवॉर्ड: ${p.reward}
          </div>
          <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
            ⏳ डेडलाइन: ${p.deadline || 'खुली अवधि'}
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:6px;">
          <button class="btn-edit-custom-plan" data-idx="${idx}" style="background:#2563eb22; border:1px solid #2563eb; color:#60a5fa; padding:4px 10px; border-radius:6px; font-size:0.72rem; font-weight:700; cursor:pointer;">
            ✏️ एडिट
          </button>
          <button class="btn-del-custom-plan" data-idx="${idx}" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; padding:4px 8px; border-radius:6px; font-size:0.72rem; cursor:pointer;">
            🗑️ हटाएं
          </button>
        </div>
      </div>
    `).join('');

    listWrap.querySelectorAll('.btn-edit-custom-plan').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const p = savedCustomPlans[idx];
        if (!p) return;
        const newTitle = prompt("प्लान का नाम बदलें:", p.title);
        if (newTitle === null) return;
        const newTarget = prompt("मैचिंग लक्ष्य (₹) बदलें:", p.matching_target);
        if (newTarget === null) return;
        const newReward = prompt("रिवॉर्ड विवरण बदलें:", p.reward);
        if (newReward === null) return;
        const newDeadline = prompt("डेडलाइन (YYYY-MM-DD) बदलें:", p.deadline || '');

        p.title = newTitle.trim() || p.title;
        p.matching_target = Number(newTarget) || p.matching_target;
        p.reward = newReward.trim() || p.reward;
        if (newDeadline !== null) p.deadline = newDeadline.trim();

        localStorage.setItem('AI_ADMIN_CUSTOM_PLANS', JSON.stringify(savedCustomPlans));
        syncToSupabaseConfig('custom_business_plans', savedCustomPlans);
        renderAdminCustomPlans();
        alert("✅ प्लान विवरण सफलतापूर्वक अपडेट हो गया!");
      };
    });

    listWrap.querySelectorAll('.btn-del-custom-plan').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        if (confirm("क्या आप वाकई इस प्लान को हटाना चाहते हैं?")) {
          savedCustomPlans.splice(idx, 1);
          localStorage.setItem('AI_ADMIN_CUSTOM_PLANS', JSON.stringify(savedCustomPlans));
          syncToSupabaseConfig('custom_business_plans', savedCustomPlans);
          renderAdminCustomPlans();
        }
      };
    });
  }

  document.getElementById('btn-add-custom-plan')?.addEventListener('click', () => {
    const title = document.getElementById('plan-input-title').value.trim();
    const type = document.getElementById('plan-input-type').value;
    const target = Number(document.getElementById('plan-input-target').value) || 0;
    const deadline = document.getElementById('plan-input-deadline').value;
    const reward = document.getElementById('plan-input-reward').value.trim();
    const desc = document.getElementById('plan-input-desc').value.trim();

    if (!title || !target || !reward) {
      alert("कृपया प्लान का नाम, मैचिंग लक्ष्य और रिवॉर्ड अवश्य भरें!");
      return;
    }

    const newPlan = {
      id: 'plan_' + Date.now(),
      title: title,
      type: type,
      matching_target: target,
      deadline: deadline,
      reward: reward,
      description: desc
    };

    savedCustomPlans.unshift(newPlan);
    localStorage.setItem('AI_ADMIN_CUSTOM_PLANS', JSON.stringify(savedCustomPlans));
    syncToSupabaseConfig('custom_business_plans', savedCustomPlans);
    renderAdminCustomPlans();
    alert("🎉 नया बिज़नेस प्लान सफलतापूर्वक लाइव पब्लिश हो गया!");

    document.getElementById('plan-input-title').value = '';
    document.getElementById('plan-input-target').value = '';
    document.getElementById('plan-input-reward').value = '';
    document.getElementById('plan-input-desc').value = '';
  });

  renderAdminCustomPlans();

  // -------------------------------------------------------------
  // EVENT BINDINGS: TO-DO TEMPLATES
  // -------------------------------------------------------------
  const todoContainer = document.getElementById('todo-templates-container');
  document.getElementById('btn-add-todo-template')?.addEventListener('click', () => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; gap:6px; align-items:center;';
    div.innerHTML = `
      <input type="text" class="admin-todo-item-input admin-input" style="flex:1; background:#0f172a; border:1px solid #475569; color:#fff; padding:6px 10px; border-radius:8px; font-size:0.82rem;" placeholder="नया To-Do टास्क लिखें...">
      <button class="btn-del-todo-item" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:6px 10px; cursor:pointer;">🗑️</button>
    `;
    todoContainer.appendChild(div);
    div.querySelector('.btn-del-todo-item').onclick = () => div.remove();
  });

  document.querySelectorAll('.btn-del-todo-item').forEach(btn => {
    btn.onclick = () => btn.closest('div').remove();
  });

  // -------------------------------------------------------------
  // EVENT BINDINGS: TEXT-TO-AUDIO (TTS)
  // -------------------------------------------------------------
  let synthUtterance = null;
  document.getElementById('btn-test-tts')?.addEventListener('click', () => {
    const text = document.getElementById('admin-tts-script').value.trim();
    if (!text) {
      alert("कृपया पहले हिंदी स्क्रिप्ट लिखें!");
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      synthUtterance = new SpeechSynthesisUtterance(text);
      synthUtterance.lang = 'hi-IN';
      synthUtterance.rate = 0.95;
      synthUtterance.pitch = 1.0;
      window.speechSynthesis.speak(synthUtterance);
    } else {
      alert("आपके ब्राउज़र में AI स्पीच सिंथेसिस उपलब्ध नहीं है।");
    }
  });

  document.getElementById('btn-stop-tts')?.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  });

  function getPublishedAudioLessons() {
    const stored = JSON.parse(localStorage.getItem('AI_ADMIN_AUDIO_LESSONS') || 'null');
    if (Array.isArray(stored) && stored.length >= 20) {
      return stored;
    }
    return stored || [];
  }

  function renderPublishedAudioLessons() {
    const wrap = document.getElementById('admin-published-audio-list');
    if (!wrap) return;
    const list = getPublishedAudioLessons();
    wrap.innerHTML = list.map((l, i) => `
      <div style="background:#0f172a; border:1px solid #334155; border-radius:10px; padding:12px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <strong style="color:#f8fafc; font-size:0.92rem;">${l.title}</strong>
            <span style="font-size:0.72rem; color:#94a3b8; margin-left:8px;">🎙️ ${l.speaker} • ⏱️ ${l.duration}</span>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-play-admin-audio" data-idx="${i}" style="background:#1d4ed8; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; cursor:pointer;">▶️ सुनें</button>
            <button class="btn-save-admin-audio-script" data-idx="${i}" style="background:#10b981; color:#000; border:none; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:800; cursor:pointer;">💾 स्क्रिप्ट अपडेट करें</button>
            ${l.id.startsWith('al_custom_') || l.id.startsWith('al_') && !['al_company_profile', 'al_smart_guide', 'al_netsurf_plan', 'al_biofit_agri', 'al_cfc_dairy', 'al_naturamore_health', 'al_herbs_cosmetics'].includes(l.id) ? `
              <button class="btn-del-admin-audio" data-idx="${i}" style="background:#ef444422; color:#ef4444; border:1px solid #ef4444; padding:4px 8px; border-radius:6px; font-size:0.75rem; cursor:pointer;">🗑️</button>
            ` : ''}
          </div>
        </div>
        
        <label style="display:block; font-size:0.72rem; color:#38bdf8; margin-bottom:3px; font-weight:700;">📝 हिंदी स्क्रिप्ट (यहाँ टेक्स्ट बदलें — यूजर पेज पर तुरंत वही बोलेगा):</label>
        <textarea class="admin-audio-script-textarea admin-input" data-idx="${i}" rows="3" style="width:100%; background:#1e293b; border:1px solid #475569; color:#fff; padding:8px 10px; border-radius:8px; font-size:0.8rem; line-height:1.4;">${l.summary || ''}</textarea>
      </div>
    `).join('');

    // Play button
    wrap.querySelectorAll('.btn-play-admin-audio').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const cur = getPublishedAudioLessons();
        const textarea = wrap.querySelector(`.admin-audio-script-textarea[data-idx="${idx}"]`);
        const text = textarea ? textarea.value.trim() : (cur[idx]?.summary || '');
        if ('speechSynthesis' in window && text) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'hi-IN';
          u.rate = 0.95;
          window.speechSynthesis.speak(u);
        }
      };
    });

    // Save individual script button
    wrap.querySelectorAll('.btn-save-admin-audio-script').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const cur = getPublishedAudioLessons();
        const textarea = wrap.querySelector(`.admin-audio-script-textarea[data-idx="${idx}"]`);
        if (textarea && cur[idx]) {
          cur[idx].summary = textarea.value.trim();
          localStorage.setItem('AI_ADMIN_AUDIO_LESSONS', JSON.stringify(cur));
          syncToSupabaseConfig('audio_lessons', cur);
          alert(`✅ '${cur[idx].title}' की ऑडियो स्क्रिप्ट सफलतापूर्वक अपडेट हो गई! यूजर पेज पर अब नया टेक्स्ट बोलेगा।`);
        }
      };
    });

    // Delete custom audio button
    wrap.querySelectorAll('.btn-del-admin-audio').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.getAttribute('data-idx'));
        const cur = getPublishedAudioLessons();
        if (confirm("क्या आप वाकई इस ऑडियो लेसन को हटाना चाहते हैं?")) {
          cur.splice(idx, 1);
          localStorage.setItem('AI_ADMIN_AUDIO_LESSONS', JSON.stringify(cur));
          syncToSupabaseConfig('audio_lessons', cur);
          renderPublishedAudioLessons();
        }
      };
    });
  }

  document.getElementById('btn-publish-audio-lesson')?.addEventListener('click', () => {
    const title = document.getElementById('admin-tts-title').value.trim();
    const speaker = document.getElementById('admin-tts-speaker').value.trim() || 'आरोग्यम लीडर';
    const duration = document.getElementById('admin-tts-duration').value.trim() || '2:30 Min';
    const script = document.getElementById('admin-tts-script').value.trim();

    if (!title || !script) {
      alert("कृपया शीर्षक और स्क्रिप्ट टेक्स्ट दोनों भरें!");
      return;
    }

    const cur = getPublishedAudioLessons();
    cur.unshift({
      id: 'al_custom_' + Date.now(),
      title: title,
      speaker: speaker,
      duration: duration,
      summary: script
    });

    localStorage.setItem('AI_ADMIN_AUDIO_LESSONS', JSON.stringify(cur));
    syncToSupabaseConfig('audio_lessons', cur);
    renderPublishedAudioLessons();
    alert("🎉 बधाई हो! नया ऑडियो लेसन ट्रेनिंग हब में लाइव पब्लिश हो गया!");

    document.getElementById('admin-tts-title').value = '';
    document.getElementById('admin-tts-script').value = '';
  });

  renderPublishedAudioLessons();

  // -------------------------------------------------------------
  // EVENT BINDINGS: SURVEY & CATEGORY MANAGER (DATA ENTRY)
  // -------------------------------------------------------------
  function getAdminCatalog() {
    let cat = JSON.parse(localStorage.getItem('AI_ADMIN_CATALOG_OVERRIDE') || 'null');
    if (!cat || !cat.categories) {
      cat = {
        categories: [
          {
            id: 'agri',
            name: '🌾 कृषि एवं फसल समाधान (Biofit Agriculture)',
            badge: 'BIOFIT ORGANIC',
            icon: '🌱',
            problems: [
              {
                id: 'agri_peelapan_growth',
                title: 'फसल में पीलापन एवं बढ़वार रुकना (Yellowing & Growth)',
                symptoms: 'पत्ते पीले पड़ना, नई कोपलें न फूटना, शाखाएं कम बनना',
                products: ['Stimrich (20ml)', 'Bio99 (5ml)', 'Set (Soil Enhancer)'],
                dosage: 'स्टीमरिच 20ml + बायो99 5ml प्रति 15L पंप',
                benefits: '7 दिन में गहरा हरा रंग, शाखाओं में 30% वृद्धि',
                whatsapp_msg: '🌾 *आरोग्यम बायोफिट फसल संजीवनी समाधान* 🌾\n\nनमस्ते किसान भाई! फसल के पीलेपन हेतु स्टीमरिच (20ml) + बायो-99 (5ml) प्रति पंप स्प्रे करें।'
              },
              {
                id: 'agri_illi_keet',
                title: 'इल्ली, सुंडी एवं रस चूसक कीट प्रकोप (Pest Control)',
                symptoms: 'पत्तों में छेद, फल/फूल खाना, पत्तों का मुड़ना',
                products: ['Intact (30ml)', 'Bio-R 303 (25ml)', 'Bio99 (5ml)'],
                dosage: 'इंटैक्ट 30ml + बायो-आर 303 25ml + बायो99 5ml प्रति 15 लीटर',
                benefits: 'रस चूसक कीटों और इल्लियों का 100% जैविक नियंत्रण',
                whatsapp_msg: '🐛 *जैविक कीट सुरक्षा कवच* 🛡️\n\nइंटैक्ट (30ml) + बायो-आर 303 (25ml) + बायो-99 (5ml) प्रति पंप स्प्रे करें।'
              }
            ]
          },
          {
            id: 'cattle',
            name: '🐄 पशुपालन एवं दुग्ध क्रांति (CFC Plus Cattle)',
            badge: 'CFC ANIMAL CARE',
            icon: '🥛',
            problems: [
              {
                id: 'cattle_milk_fat',
                title: 'गाय/भैंस का दूध और फैट (मलाई) कम होना (Low Milk & Fat)',
                symptoms: 'दूध की मात्रा घटना, डेयरी में फैट कम आना',
                products: ['CFC Plus (Cattle Feed Concentrate 500g/1kg)'],
                dosage: 'रोज सुबह 5-10 ग्राम और शाम को 5-10 ग्राम दाने में मिलाकर खिलाएं',
                benefits: '7 दिन में 1 से 1.5 लीटर दूध वृद्धि और फैट में सुधार',
                whatsapp_msg: '🐄 *दूध व फैट बढ़ाने का जादुई फॉर्मूला (CFC Plus)* 🥛\n\nरोज सुबह-शाम 5-10 ग्राम दाने में दें।'
              }
            ]
          },
          {
            id: 'health',
            name: '💊 परिवार स्वास्थ्य एवं न्यूट्रास्युटिकल्स (Naturamore)',
            badge: 'NATURAMORE HEALTH',
            icon: '❤️',
            problems: [
              {
                id: 'health_joint_pain',
                title: 'जोड़ों व घुटनों का दर्द, कट-कट की आवाज (Joint Care)',
                symptoms: 'चलने-फिरने में दर्द, सूजन, कार्टिलेज घिसना',
                products: ['Naturamore Joint Care Capsules', 'Naturamore Powder'],
                dosage: '1 कैप्सूल सुबह-शाम भोजन के बाद + 1 चम्मच पाउडर दूध के साथ',
                benefits: 'नेचुरल ग्लूकोसामाइन से कार्टिलेज रिपेयर व दर्द में स्थायी राहत',
                whatsapp_msg: '🦵 *घुटनों व जोड़ों के दर्द का स्थायी हर्बल समाधान* 🌿\n\nनेचुरमोर जाइंट केयर 1 कैप्सूल सुबह-शाम लें।'
              }
            ]
          },
          {
            id: 'cosmetics',
            name: '💄 ब्यूटी, पर्सनल केयर व स्किन (Herbs & More)',
            badge: 'HERBS & MORE',
            icon: '✨',
            problems: [
              {
                id: 'beauty_skin_glow',
                title: 'कील-मुंहासे, दाग-धब्बे एवं बेजान त्वचा (Acne & Glow)',
                symptoms: 'चेहरे पर पिंपल्स, झाइयां, ऑयली स्किन, टैनिंग',
                products: ['Neem & Turmeric Face Wash', 'Vitamin Therapy Day Cream'],
                dosage: 'दिन में 2 बार फेस वॉश से धोएं व क्रीम लगाएं',
                benefits: '7 दिन में पिंपल्स कम और चेहरे पर नेचुरल ग्लो',
                whatsapp_msg: '✨ *कील-मुंहासों व दाग-धब्बों से मुक्ति (Herbs & More)* 🌸\n\nनीम फेस वॉश + विटामिन थेरेपी डे क्रीम का नियमित उपयोग करें।'
              },
              {
                id: 'beauty_hair_fall',
                title: 'बाल झड़ना, रूसी व असमय सफेद होना (Hair Fall & Dandruff)',
                symptoms: 'कंघी करते समय बाल टूटना, डैंड्रफ, स्कैल्प में खुजली',
                products: ['Herbs & More Anti-Dandruff Shampoo', 'Hair Serum'],
                dosage: 'हफ्ते में 3 बार शैम्पू करें व सीरम लगाएं',
                benefits: '15 दिन में हेयर फॉल कंट्रोल और घने रेशमी बाल',
                whatsapp_msg: '💇 *बालों का झड़ना व डैंड्रफ रोकें (Herbs & More)* 🌿\n\nएंटी-डैंड्रफ शैम्पू + हेयर सीरम का इस्तेमाल करें।'
              }
            ]
          }
        ]
      };
    }
    return cat;
  }

  function saveAdminCatalog(catObj) {
    localStorage.setItem('AI_ADMIN_CATALOG_OVERRIDE', JSON.stringify(catObj));
    syncToSupabaseConfig('catalog_override', catObj);
    renderAdminSurveyProblems();
    updateCategorySelectOptions();
  }

  function updateCategorySelectOptions() {
    const sel = document.getElementById('admin-prob-cat-select');
    if (!sel) return;
    const catObj = getAdminCatalog();
    sel.innerHTML = catObj.categories.map(c => `
      <option value="${c.id}">${c.icon || '🌱'} ${c.badge || c.name}</option>
    `).join('');
  }

  function renderAdminSurveyProblems() {
    const listWrap = document.getElementById('admin-survey-problems-list');
    if (!listWrap) return;
    const catObj = getAdminCatalog();

    let allProblems = [];
    catObj.categories.forEach(c => {
      (c.problems || []).forEach(p => {
        allProblems.push({ ...p, category_id: c.id, category_name: c.badge || c.name, category_icon: c.icon });
      });
    });

    if (allProblems.length === 0) {
      listWrap.innerHTML = `<div style="color:#94a3b8; padding:10px;">कोई समस्या नहीं मिली। नई समस्या जोड़ें।</div>`;
      return;
    }

    listWrap.innerHTML = allProblems.map(p => `
      <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:0.68rem; background:#10b98122; color:#34d399; padding:2px 6px; border-radius:4px; font-weight:800;">${p.category_icon || '🌱'} ${p.category_name}</span>
            <strong style="color:#f8fafc; font-size:0.88rem;">${p.title}</strong>
          </div>
          <div style="font-size:0.75rem; color:#38bdf8; margin-top:3px;">
            🧪 <strong>प्रोडक्ट्स:</strong> ${(p.products || []).join(' + ')}
          </div>
          <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
            💊 <strong>खुराक:</strong> ${p.dosage || 'यथा आवश्यक'}
          </div>
        </div>
        <div style="display:flex; gap:6px; flex-shrink:0;">
          <button class="btn-edit-admin-problem" data-cat-id="${p.category_id}" data-prob-id="${p.id}" style="background:#2563eb22; border:1px solid #2563eb; color:#60a5fa; border-radius:6px; padding:4px 8px; font-size:0.72rem; font-weight:700; cursor:pointer;">
            ✏️ एडिट
          </button>
          <button class="btn-del-admin-problem" data-cat-id="${p.category_id}" data-prob-id="${p.id}" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:4px 8px; font-size:0.72rem; cursor:pointer;">
            🗑️ हटाएं
          </button>
        </div>
      </div>
    `).join('');

    listWrap.querySelectorAll('.btn-edit-admin-problem').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-cat-id');
        const probId = btn.getAttribute('data-prob-id');
        const cur = getAdminCatalog();
        const targetCat = cur.categories.find(c => c.id === catId);
        const p = targetCat?.problems?.find(x => x.id === probId);
        if (!p) return;

        const newTitle = prompt("समस्या का नाम बदलें:", p.title);
        if (newTitle === null) return;
        const newProds = prompt("प्रोडक्ट्स बदलें (+ से अलग करें):", (p.products || []).join(' + '));
        if (newProds === null) return;
        const newDosage = prompt("खुराक (Dosage) बदलें:", p.dosage || '');
        if (newDosage === null) return;
        const newBenefits = prompt("फायदे (Benefits) बदलें:", p.benefits || '');

        p.title = newTitle.trim() || p.title;
        p.products = newProds.split('+').map(x => x.trim()).filter(Boolean);
        if (newDosage !== null) p.dosage = newDosage.trim();
        if (newBenefits !== null) p.benefits = newBenefits.trim();

        saveAdminCatalog(cur);
        alert("✅ समस्या व नुस्खा विवरण सफलतापूर्वक अपडेट हो गया!");
      };
    });

    listWrap.querySelectorAll('.btn-del-admin-problem').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-cat-id');
        const probId = btn.getAttribute('data-prob-id');
        if (confirm("क्या आप वाकई इस समस्या प्रविष्टि को हटाना चाहते हैं?")) {
          const cur = getAdminCatalog();
          const targetCat = cur.categories.find(c => c.id === catId);
          if (targetCat && targetCat.problems) {
            targetCat.problems = targetCat.problems.filter(p => p.id !== probId);
            saveAdminCatalog(cur);
          }
        }
      };
    });
  }

  // Bind Add Category
  document.getElementById('btn-add-admin-cat')?.addEventListener('click', () => {
    const id = document.getElementById('admin-cat-id').value.trim().toLowerCase().replace(/\s+/g, '_');
    const name = document.getElementById('admin-cat-name').value.trim();
    const icon = document.getElementById('admin-cat-icon').value.trim() || '🌱';
    const badge = document.getElementById('admin-cat-badge').value.trim() || name;

    if (!id || !name) {
      alert("कृपया केटेगरी ID और नाम भरें!");
      return;
    }

    const cur = getAdminCatalog();
    const existing = cur.categories.find(c => c.id === id);
    if (existing) {
      existing.name = name;
      existing.icon = icon;
      existing.badge = badge;
    } else {
      cur.categories.push({
        id: id,
        name: name,
        icon: icon,
        badge: badge,
        problems: []
      });
    }

    saveAdminCatalog(cur);
    alert(`🎉 केटेगरी '${name}' सफलतापूर्वक सेव हो गई!`);
    document.getElementById('admin-cat-id').value = '';
    document.getElementById('admin-cat-name').value = '';
    document.getElementById('admin-cat-icon').value = '';
    document.getElementById('admin-cat-badge').value = '';
  });

  // Bind Add Problem
  document.getElementById('btn-add-admin-prob')?.addEventListener('click', () => {
    const catId = document.getElementById('admin-prob-cat-select').value;
    const title = document.getElementById('admin-prob-title').value.trim();
    const symptoms = document.getElementById('admin-prob-symptoms').value.trim();
    const prodsStr = document.getElementById('admin-prob-products').value.trim();
    const dosage = document.getElementById('admin-prob-dosage').value.trim();
    const benefits = document.getElementById('admin-prob-benefits').value.trim();
    const whatsapp = document.getElementById('admin-prob-whatsapp').value.trim();

    if (!title || !prodsStr) {
      alert("कृपया समस्या का शीर्षक और प्रोडक्ट्स दोनों भरें!");
      return;
    }

    const products = prodsStr.split('+').map(p => p.trim()).filter(Boolean);
    const cur = getAdminCatalog();
    let targetCat = cur.categories.find(c => c.id === catId);
    if (!targetCat) {
      targetCat = { id: catId, name: catId, icon: '🌱', badge: catId, problems: [] };
      cur.categories.push(targetCat);
    }
    if (!targetCat.problems) targetCat.problems = [];

    targetCat.problems.unshift({
      id: 'p_' + Date.now(),
      title: title,
      symptoms: symptoms,
      products: products,
      dosage: dosage,
      benefits: benefits,
      whatsapp_msg: whatsapp || `✨ *${title} समाधान* ✨\n\nउत्पाद: ${products.join(' + ')}\nखुराक: ${dosage}\nसंपर्क: {DISTRIBUTOR_NAME} ({DISTRIBUTOR_PHONE})`
    });

    saveAdminCatalog(cur);
    alert("🎉 नई समस्या व नुस्खा लाइव पब्लिश हो गया!");

    document.getElementById('admin-prob-title').value = '';
    document.getElementById('admin-prob-symptoms').value = '';
    document.getElementById('admin-prob-products').value = '';
    document.getElementById('admin-prob-dosage').value = '';
    document.getElementById('admin-prob-benefits').value = '';
    document.getElementById('admin-prob-whatsapp').value = '';
  });

  updateCategorySelectOptions();
  renderAdminSurveyProblems();

  // -------------------------------------------------------------
  // MARKETING ENGINE & HOOKS MANAGER
  // -------------------------------------------------------------
  function getAdminMarketingCategories() {
    return JSON.parse(localStorage.getItem('AI_ADMIN_MARKETING_CATEGORIES') || JSON.stringify([
      {
        id: 'agriculture',
        name: '🌾 कृषि एवं फसल सुरक्षा (Agriculture)',
        templates: [
          {
            id: 'ag_01',
            title: 'फसल में कीट, इल्ली व पीलापन का 100% जैविक समाधान',
            hook: '🚨 *क्या आपकी फसल में भी कीट, इल्ली या पीलापन आ रहा है?*\n\nरासायनिक कीटनाशकों का खर्च आधा करें! 100% जैविक समाधान से पाएं 30% अधिक पैदावार। 🌱',
            shayari: '🌾 *मेहनत किसान की, रंग लाएगी हर बार,*\n*आरोग्यम के साथ बनेगी, खुशहाली की सरकार!* ✨',
            cta: '📲 अभी संपूर्ण मार्गदर्शिका देखने के लिए यहाँ क्लिक करें:'
          },
          {
            id: 'ag_02',
            title: 'कम लागत में बंपर पैदावार व जैविक खाद फॉर्मूला',
            hook: '🌾 *कम लागत, ज्यादा मुनाफा! जैविक खाद से बदलें अपनी खेती का भविष्य।*\n\nमिट्टी की उर्वरा शक्ति बढ़ाएं और बिना खतरनाक रसायनों के अपनी फसल का दाना चमकदार बनाएं। 🚜',
            shayari: '🌱 *धरती माता मुस्कुराए जब जैविक खाद डले,*\n*किसान का हर एक सपना खुशहाली से फले!* 🌾',
            cta: '👉 पूरी रिपोर्ट और किसानों के अनुभव देखें:'
          }
        ]
      },
      {
        id: 'cattle',
        name: '🐄 डेयरी व पशुधन (CFC Care)',
        templates: [
          {
            id: 'ct_01',
            title: 'गाय-भैंस का दूध व फैट बढ़ाने का अचूक फॉर्मूला',
            hook: '🐄 *डेयरी किसान भाई ध्यान दें! क्या पशुओं का दूध व फैट घट गया है?*\n\nरोजाना 10g CFC Plus दें और 7 से 10 दिनों में दूध और फैट दोनों में आश्चर्यजनक बढ़ोतरी पाएं। 🥛',
            shayari: '🥛 *दूध-मलाई की बहेगी धार,*\n*CFC Plus से चमकेगा व्यापार!* ✨',
            cta: '👉 खुराक व लाइव टेस्ट रिजल्ट यहाँ देखें:'
          }
        ]
      },
      {
        id: 'health',
        name: '💊 स्वास्थ्य व आयुर्वेद (Naturamore)',
        templates: [
          {
            id: 'hl_01',
            title: 'डायबिटीज, बीपी व जोड़ों के दर्द का सुरक्षित उपाय',
            hook: '🩺 *क्या आप या परिवार में कोई जोड़ों के दर्द, थकान या शुगर से परेशान है?*\n\nप्राचीन भारतीय आयुर्वेद और शुद्ध पोषण से शरीर को डिटॉक्स करें और ऊर्जावान जीवन जिएं। 🌿',
            shayari: '🌿 *आयुर्वेद का संग मिले तो हर बीमारी भागे,*\n*स्वस्थ रहे शरीर तो नया सवेरा जागे!* ☀️',
            cta: '👉 डाइट चार्ट व आयुर्वेदिक नुस्खा यहाँ देखें:'
          }
        ]
      },
      {
        id: 'business',
        name: '💼 रोजगार व नेटसर्फ प्लान (Income & Business)',
        templates: [
          {
            id: 'bs_01',
            title: 'स्मार्टफोन से हर शुक्रवार 15% बोनस व ₹8.19L कैपिंग',
            hook: '💰 *स्मार्टफोन का सही इस्तेमाल करें और हर हफ्ते अतिरिक्त कमाई करें!*\n\nनेटसर्फ डायरेक्ट सेलिंग के साथ जुड़कर 15% शुक्रवार वीकली रिटेल बोनस और 15-दिन में ₹8,19,250 कैपिंग पाएं। 🚀',
            shayari: '🚀 *मंजिलें उन्हीं को मिलती हैं जिनके सपनों में जान होती है,*\n*पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!* 🌈',
            cta: '👉 फ्री ट्रेनिंग और पूरा प्लान देखने के लिए यहाँ क्लिक करें:'
          }
        ]
      },
      {
        id: 'product',
        name: '🎁 स्पेशल कॉम्बो व ऑफर्स (Special Offers)',
        templates: [
          {
            id: 'pr_01',
            title: 'धमाकेदार ऑफर — Pro-eTailer ₹5,000 / ₹8,000 किट',
            hook: '🎁 *विशेष सीमित समय ऑफर! सीधे घर तक फ्री डिलीवरी!*\n\nPro-eTailer किट पर 30%-40% भारी डिस्काउंट + 6th मंथ फ्री ऑटोशिप उपहार। 📦',
            shayari: '💎 *गुणवत्ता में नंबर वन, कीमत में सबसे खास,*\n*आरोग्यम उत्पाद लाएं, खुशियों का अहसास!* ✨',
            cta: '🛍️ अभी ऑफर प्राइस देखें और ऑर्डर बुक करें:'
          }
        ]
      }
    ]));
  }

  function saveAdminMarketingCategories(cats) {
    localStorage.setItem('AI_ADMIN_MARKETING_CATEGORIES', JSON.stringify(cats));
    syncToSupabaseConfig('marketing_categories', cats);
    renderAdminMarketingTemplates();
  }

  function renderAdminMarketingTemplates() {
    const wrap = document.getElementById('admin-marketing-templates-list');
    if (!wrap) return;
    const cats = getAdminMarketingCategories();

    let allTmpls = [];
    cats.forEach(c => {
      (c.templates || []).forEach(t => {
        allTmpls.push({ ...t, cat_id: c.id, cat_name: c.name });
      });
    });

    if (allTmpls.length === 0) {
      wrap.innerHTML = `<div style="color:#94a3b8; padding:10px;">कोई मार्केटिंग टेम्पलेट नहीं है। नया जोड़ें।</div>`;
      return;
    }

    wrap.innerHTML = allTmpls.map((t, idx) => `
      <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:10px; margin-bottom:6px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div>
            <span style="font-size:0.68rem; background:#3b82f622; color:#60a5fa; padding:2px 6px; border-radius:4px; font-weight:800;">${t.cat_name}</span>
            <strong style="color:#f8fafc; font-size:0.86rem; margin-left:6px;">${t.title}</strong>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-edit-admin-mkt" data-cat="${t.cat_id}" data-id="${t.id}" style="background:#2563eb22; border:1px solid #2563eb; color:#60a5fa; border-radius:6px; padding:3px 8px; font-size:0.72rem; font-weight:700; cursor:pointer;">
              ✏️ एडिट
            </button>
            <button class="btn-del-admin-mkt" data-cat="${t.cat_id}" data-id="${t.id}" style="background:#ef444422; border:1px solid #ef4444; color:#ef4444; border-radius:6px; padding:3px 8px; font-size:0.72rem; cursor:pointer;">
              🗑️ हटाएं
            </button>
          </div>
        </div>
        <p style="font-size:0.74rem; color:#cbd5e1; margin:2px 0; white-space:pre-line;">${t.hook}</p>
        ${t.shayari ? `<div style="font-size:0.72rem; color:#fbbf24; font-style:italic;">${t.shayari}</div>` : ''}
      </div>
    `).join('');

    wrap.querySelectorAll('.btn-edit-admin-mkt').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-cat');
        const tmplId = btn.getAttribute('data-id');
        const cats = getAdminMarketingCategories();
        const targetCat = cats.find(c => c.id === catId);
        const t = targetCat?.templates?.find(x => x.id === tmplId);
        if (!t) return;

        const newTitle = prompt("टेम्पलेट का शीर्षक बदलें:", t.title);
        if (newTitle === null) return;
        const newHook = prompt("WhatsApp हुक मैसेज बदलें:", t.hook);
        if (newHook === null) return;
        const newShayari = prompt("शायरी बदलें:", t.shayari || '');

        t.title = newTitle.trim() || t.title;
        t.hook = newHook.trim() || t.hook;
        if (newShayari !== null) t.shayari = newShayari.trim();

        saveAdminMarketingCategories(cats);
        alert("✅ मार्केटिंग हुक टेम्पलेट सफलतापूर्वक अपडेट हो गया!");
      };
    });

    wrap.querySelectorAll('.btn-del-admin-mkt').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-cat');
        const tmplId = btn.getAttribute('data-id');
        if (confirm("क्या आप वाकई इस टेम्पलेट को हटाना चाहते हैं?")) {
          const cats = getAdminMarketingCategories();
          const target = cats.find(c => c.id === catId);
          if (target && target.templates) {
            target.templates = target.templates.filter(t => t.id !== tmplId);
            saveAdminMarketingCategories(cats);
          }
        }
      };
    });
  }

  document.getElementById('btn-add-admin-mkt-template')?.addEventListener('click', () => {
    const catId = document.getElementById('adm-mkt-cat-select').value;
    const title = document.getElementById('adm-mkt-title').value.trim();
    const hook = document.getElementById('adm-mkt-hook').value.trim();
    const shayari = document.getElementById('adm-mkt-shayari').value.trim();
    const cta = document.getElementById('adm-mkt-cta').value.trim();

    if (!title || !hook) {
      alert("कृपया शीर्षक और हुक संदेश दोनों भरें!");
      return;
    }

    const cats = getAdminMarketingCategories();
    let target = cats.find(c => c.id === catId);
    if (!target) {
      target = { id: catId, name: catId, templates: [] };
      cats.push(target);
    }
    if (!target.templates) target.templates = [];

    target.templates.unshift({
      id: 'mkt_' + Date.now(),
      title: title,
      hook: hook,
      shayari: shayari,
      cta: cta || '👉 अभी देखने के लिए यहाँ क्लिक करें:'
    });

    saveAdminMarketingCategories(cats);
    alert("🎉 नया मार्केटिंग हुक टेम्पलेट लाइव पब्लिश हो गया!");
    document.getElementById('adm-mkt-title').value = '';
    document.getElementById('adm-mkt-hook').value = '';
    document.getElementById('adm-mkt-shayari').value = '';
  });

  // Category Manager Chips & Add Category Handlers
  function renderAdminMarketingCategoriesChips() {
    const wrap = document.getElementById('adm-mkt-categories-chips');
    const select = document.getElementById('adm-mkt-cat-select');
    if (!wrap || !select) return;

    const cats = getAdminMarketingCategories();
    select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    wrap.innerHTML = cats.map(c => `
      <span style="background:#1e293b; border:1px solid #475569; color:#f8fafc; padding:3px 8px; border-radius:14px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
        ${c.name} (${(c.templates || []).length})
        <button class="btn-del-mkt-cat" data-id="${c.id}" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:900; padding:0 2px;" title="कैटेगरी हटाएं">&times;</button>
      </span>
    `).join('');

    wrap.querySelectorAll('.btn-del-mkt-cat').forEach(btn => {
      btn.onclick = () => {
        const catId = btn.getAttribute('data-id');
        const curCats = getAdminMarketingCategories();
        if (curCats.length <= 1) {
          alert("कम से कम 1 कैटेगरी अवश्य होनी चाहिए!");
          return;
        }
        if (confirm("क्या आप वाकई इस कैटेगरी को हटाना चाहते हैं?")) {
          const updated = curCats.filter(c => c.id !== catId);
          saveAdminMarketingCategories(updated);
          renderAdminMarketingCategoriesChips();
        }
      };
    });
  }

  document.getElementById('btn-add-mkt-cat')?.addEventListener('click', () => {
    const catId = (document.getElementById('adm-mkt-new-cat-id')?.value || '').trim().toLowerCase().replace(/\s+/g, '_');
    const catName = (document.getElementById('adm-mkt-new-cat-name')?.value || '').trim();
    if (!catId || !catName) {
      alert("कृपया कैटेगरी ID और नाम दोनों भरें!");
      return;
    }
    const cats = getAdminMarketingCategories();
    if (cats.some(c => c.id === catId)) {
      alert("यह कैटेगरी ID पहले से मौजूद है!");
      return;
    }
    cats.push({ id: catId, name: catName, templates: [] });
    saveAdminMarketingCategories(cats);
    renderAdminMarketingCategoriesChips();
    alert(`🎉 नई कैटेगरी '${catName}' सफलतापूर्वक जुड़ गई!`);
    document.getElementById('adm-mkt-new-cat-id').value = '';
    document.getElementById('adm-mkt-new-cat-name').value = '';
  });

  renderAdminMarketingCategoriesChips();
  renderAdminMarketingTemplates();

  // -------------------------------------------------------------
  // VAULT RECORDS MONITOR
  // -------------------------------------------------------------
  function renderVaultTable() {
    const tbody = document.getElementById('vault-table-body');
    if (!tbody) return;

    let vaultRecords = [];
    try {
      const localVault = JSON.parse(localStorage.getItem('AAROGYAM_ETAILER_VAULT_V1') || '{}');
      if (localVault.share_id) {
        vaultRecords.push({
          share_id: localVault.share_id,
          user_mobile: localVault.user_mobile || 'Self',
          friday_retail_total: localVault.friday_retail_total || 0,
          fortnight_turnover: localVault.fortnight_turnover || 0,
          khata_count: (localVault.khata_records || []).length,
          last_synced_at: localVault.last_synced_at || 'Just Now'
        });
      }
    } catch (e) {}

    if (vaultRecords.length < 3) {
      vaultRecords.push(
        { share_id: 'AI000004', user_mobile: '98260XXXXX', friday_retail_total: 12500, fortnight_turnover: 45000, khata_count: 8, last_synced_at: 'Today, 12:00 AM' },
        { share_id: 'AI000012', user_mobile: '94250XXXXX', friday_retail_total: 8200, fortnight_turnover: 28000, khata_count: 5, last_synced_at: 'Today, 12:00 AM' }
      );
    }

    tbody.innerHTML = vaultRecords.map(r => `
      <tr style="border-bottom:1px solid #334155;">
        <td style="padding:8px 10px; font-weight:800; color:#fde047;">${r.share_id}</td>
        <td style="padding:8px 10px;">📱 ${r.user_mobile}</td>
        <td style="padding:8px 10px; color:#10b981; font-weight:700;">₹${Number(r.friday_retail_total).toLocaleString('en-IN')}</td>
        <td style="padding:8px 10px; color:#38bdf8; font-weight:700;">₹${Number(r.fortnight_turnover).toLocaleString('en-IN')}</td>
        <td style="padding:8px 10px;">📑 ${r.khata_count} प्रविष्टियां</td>
        <td style="padding:8px 10px; font-size:0.75rem; color:#94a3b8;">${r.last_synced_at}</td>
      </tr>
    `).join('');
  }

  renderVaultTable();
  document.getElementById('btn-refresh-vault')?.addEventListener('click', renderVaultTable);
}
