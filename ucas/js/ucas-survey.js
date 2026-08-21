/* ==========================================================================
   UCAS SMART SURVEY ENGINE
   One intelligent multi-category survey form.
   Common Person Info + Dynamic Category Selection + Category Specific Answers
   ========================================================================== */

(function (window) {
  'use strict';

  let selectedCategories = [];
  let userSurveysList = [];

  const CATEGORY_DEFINITIONS = [
    { id: 'agriculture', title: 'Agriculture', icon: '🌾', desc: 'खेती, फसल, कीट व रोग' },
    { id: 'healthcare', title: 'Health Care', icon: '❤️', desc: 'स्वास्थ्य, बीपी, शुगर व अन्य' },
    { id: 'beautycare', title: 'Beauty Care', icon: '💄', desc: 'त्वचा की देखभाल व सौंदर्य' },
    { id: 'haircare', title: 'Hair Care', icon: '💇', desc: 'बालों का झड़ना व रूसी' },
    { id: 'cattlecare', title: 'Cattle Care', icon: '🐄', desc: 'पशुपालन, गाय-भैंस व दूध' },
    { id: 'fishpoultry', title: 'Fish / Poultry', icon: '🐟', desc: 'मछली पालन व पोल्ट्री' },
    { id: 'netsurf', title: 'NetSurf', icon: '💼', desc: 'बिजनेस, साइड इनकम व प्रोडक्ट' },
    { id: 'other', title: 'Other Needs', icon: '➕', desc: 'अन्य परामर्श व सहायता' }
  ];

  function initSurveyModule() {
    renderCategoryCards();
    bindSurveyFormEvents();
    loadSurveys();
  }

  function renderCategoryCards() {
    const container = document.getElementById('ucas-survey-category-cards');
    if (!container) return;

    container.innerHTML = CATEGORY_DEFINITIONS.map(cat => {
      const isSelected = selectedCategories.includes(cat.id);
      return `
        <div class="ucas-category-card ${isSelected ? 'selected' : ''}" data-cat-id="${cat.id}" onclick="UCAS_SURVEY.toggleCategory('${cat.id}')">
          <div class="ucas-category-check">${isSelected ? '✓' : ''}</div>
          <div class="ucas-category-icon">${cat.icon}</div>
          <div class="ucas-category-title">${cat.title}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${cat.desc}</div>
        </div>
      `;
    }).join('');
  }

  function toggleCategory(catId) {
    if (selectedCategories.includes(catId)) {
      selectedCategories = selectedCategories.filter(id => id !== catId);
    } else {
      selectedCategories.push(catId);
    }
    renderCategoryCards();
    updateDynamicCategorySections();
  }

  function updateDynamicCategorySections() {
    const sectionsContainer = document.getElementById('ucas-survey-dynamic-sections');
    if (!sectionsContainer) return;

    if (selectedCategories.length === 0) {
      sectionsContainer.innerHTML = `
        <div style="text-align:center;padding:1.5rem;background:#F8FAFC;border:1.5px dashed #CBD5E1;border-radius:var(--radius-md);color:var(--text-muted);">
          <i class="fa-solid fa-arrow-up" style="margin-bottom:6px;font-size:1.2rem;color:var(--primary);"></i>
          <p style="font-weight:600;font-size:0.9rem;">कृपया ऊपर दिए गए कार्ड्स में से कम से कम एक कैटेगरी चुनें</p>
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Agriculture Section
    if (selectedCategories.includes('agriculture')) {
      html += `
        <div class="ucas-section-box" id="sec-agriculture">
          <div class="ucas-section-box-header">
            <span>🌾 Agriculture (कृषि एवं फसल सम्बन्धी जानकारी)</span>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">किसान का प्रकार (Farmer Status)</label>
              <select id="agri_status" class="ucas-select">
                <option value="Small Farmer">छोटा किसान (1-5 एकड़)</option>
                <option value="Medium Farmer">मध्यम किसान (5-15 एकड़)</option>
                <option value="Large Farmer">बड़ा किसान (15+ एकड़)</option>
                <option value="Commercial Grower">व्यावसायिक बागवानी / ग्रीनहाउस</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">कुल जमीन का रकबा (Land Size in Acres)</label>
              <input type="text" id="agri_land_size" class="ucas-input" placeholder="उदा. 8 एकड़">
            </div>
          </div>
          <div class="ucas-form-group">
            <label class="ucas-label">मुख्य फसलें (Select / Enter Major Crops)</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;" id="agri-crop-chips">
              ${['सोयाबीन (Soybean)', 'मक्का (Maize)', 'धान (Paddy)', 'गेहूं (Wheat)', 'कपास (Cotton)', 'सब्जियां (Vegetables)', 'दलहन (Pulses)'].map(c => `
                <label style="font-size:0.8rem;background:#fff;border:1px solid #CBD5E1;padding:4px 10px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                  <input type="checkbox" name="agri_crops" value="${c}"> ${c}
                </label>
              `).join('')}
            </div>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">फसल में मुख्य समस्या (Crop Problem)</label>
              <select id="agri_problem" class="ucas-select">
                <option value="इल्ली व कीट प्रकोप (Pest / Worms)">इल्ली व कीट प्रकोप (Pest / Worms)</option>
                <option value="फंगस व पीलापन (Fungus / Yellowing)">फंगस व पीलापन (Fungus / Yellowing)</option>
                <option value="कम पैदावार व कमजोर वृद्धि (Low Yield)">कम पैदावार व कमजोर वृद्धि (Low Yield)</option>
                <option value="रासायनिक खाद का अधिक खर्च (High Chemical Cost)">रासायनिक खाद का अधिक खर्च (High Cost)</option>
                <option value="अन्य (Other)">अन्य</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">सिंचाई की व्यवस्था (Irrigation Source)</label>
              <select id="agri_irrigation" class="ucas-select">
                <option value="ट्यूबवेल / बोरवेल (Tube Well)">ट्यूबवेल / बोरवेल (Tube Well)</option>
                <option value="नहर / नदी (Canal / River)">नहर / नदी (Canal / River)</option>
                <option value="वर्षा आधारित (Rainfed)">वर्षा आधारित (Rainfed)</option>
                <option value="ड्रिप / स्प्रिंकलर (Drip / Sprinkler)">ड्रिप / स्प्रिंकलर (Drip)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Health Care Section
    if (selectedCategories.includes('healthcare')) {
      html += `
        <div class="ucas-section-box" id="sec-healthcare">
          <div class="ucas-section-box-header" style="color:#C62828;">
            <span>❤️ Health Care (स्वास्थ्य एवं कल्याण परामर्श)</span>
          </div>
          <div style="background:#FFF8E1;border-left:4px solid #FFA000;padding:8px 12px;border-radius:4px;font-size:0.78rem;margin-bottom:12px;color:#795548;">
            🔒 <strong>गोपनीयता सूचना:</strong> स्वास्थ्य सम्बन्धी जानकारी पूरी तरह सुरक्षित व केवल अधिकृत स्वास्थ्य परामर्श के लिए है।
          </div>
          <div class="ucas-form-group">
            <label class="ucas-label">मुख्य स्वास्थ्य चिंताएं (Health Concerns)</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
              ${['शुगर / डायबिटीज (Diabetes)', 'ब्लड प्रेशर (BP)', 'जोड़ों का दर्द / गठिया (Joint / Arthritis)', 'गैस व पाचन समस्या (Digestion)', 'स्किन व एलर्जी (Skin Allergy)', 'सामान्य कमजोरी / थकान (Weakness)', 'हृदय स्वास्थ्य (Heart Wellness)'].map(h => `
                <label style="font-size:0.8rem;background:#fff;border:1px solid #CBD5E1;padding:4px 10px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                  <input type="checkbox" name="health_concerns" value="${h}"> ${h}
                </label>
              `).join('')}
            </div>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">समस्या की अवधि (Duration of Problem)</label>
              <select id="health_duration" class="ucas-select">
                <option value="1 से 6 महीने (1-6 Months)">1 से 6 महीने (1-6 Months)</option>
                <option value="6 महीने से 1 साल (6-12 Months)">6 महीने से 1 साल (6-12 Months)</option>
                <option value="1 से 3 साल (1-3 Years)">1 से 3 साल (1-3 Years)</option>
                <option value="3 साल से अधिक (3+ Years)">3 साल से अधिक (3+ Years)</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">वर्तमान में चल रहा इलाज (Current Medication)</label>
              <select id="health_medication" class="ucas-select">
                <option value="एलोपैथी दवाएं (Allopathy)">एलोपैथी दवाएं (Allopathy)</option>
                <option value="आयुर्वेदिक / प्राकृतिक (Ayurvedic)">आयुर्वेदिक / प्राकृतिक (Ayurvedic)</option>
                <option value="कोई इलाज नहीं (None)">कोई इलाज नहीं (None)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    // 3. Cattle Care Section
    if (selectedCategories.includes('cattlecare')) {
      html += `
        <div class="ucas-section-box" id="sec-cattlecare">
          <div class="ucas-section-box-header">
            <span>🐄 Cattle Care (पशुपालन एवं दुग्ध संवर्धन)</span>
          </div>
          <div class="ucas-grid-3">
            <div class="ucas-form-group">
              <label class="ucas-label">पशु का प्रकार (Animal Type)</label>
              <select id="cattle_type" class="ucas-select">
                <option value="गाय (Cow)">गाय (Cow)</option>
                <option value="भैंस (Buffalo)">भैंस (Buffalo)</option>
                <option value="गाय व भैंस दोनों (Both)">गाय व भैंस दोनों</option>
                <option value="बकरी पालन (Goat)">बकरी पालन (Goat)</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">कुल पशुओं की संख्या (Animal Count)</label>
              <input type="number" id="cattle_count" class="ucas-input" placeholder="उदा. 4">
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">दैनिक दुग्ध उत्पादन (Daily Milk L/day)</label>
              <input type="text" id="cattle_milk" class="ucas-input" placeholder="उदा. 20 लीटर">
            </div>
          </div>
          <div class="ucas-form-group">
            <label class="ucas-label">पशु स्वास्थ्य सम्बन्धी समस्या (Animal Health Problem)</label>
            <select id="cattle_problem" class="ucas-select">
              <option value="दूध व फैट की कमी (Low Milk & Fat)">दूध व फैट की कमी (Low Milk & Fat)</option>
              <option value="थनैल / मैस्टाइटिस रोग (Mastitis)">थनैल / मैस्टाइटिस रोग (Mastitis)</option>
              <option value="बार-बार रिपीट होना / बांझपन (Infertility / Repeat Breeding)">बार-बार रिपीट होना / बांझपन</option>
              <option value="पाचन व भूख की कमी (Digestion / Weak Appetite)">पाचन व भूख की कमी</option>
              <option value="सामान्य वृद्धि व चमक (Overall Health)">सामान्य वृद्धि व चमक</option>
            </select>
          </div>
        </div>
      `;
    }

    // 4. Beauty Care Section
    if (selectedCategories.includes('beautycare')) {
      html += `
        <div class="ucas-section-box" id="sec-beautycare">
          <div class="ucas-section-box-header" style="color:#AD1457;">
            <span>💄 Beauty & Skin Care (सौंदर्य व त्वचा देखभाल)</span>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">त्वचा का प्रकार (Skin Type)</label>
              <select id="beauty_skin_type" class="ucas-select">
                <option value="सामान्य (Normal)">सामान्य (Normal)</option>
                <option value="तैलीय (Oily)">तैलीय (Oily)</option>
                <option value="शुष्क (Dry)">शुष्क (Dry)</option>
                <option value="संवेदनशील (Sensitive)">संवेदनशील (Sensitive)</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">मुख्य चिंता (Primary Concern)</label>
              <select id="beauty_concern" class="ucas-select">
                <option value="कील-मुंहासे (Acne & Pimples)">कील-मुंहासे (Acne & Pimples)</option>
                <option value="झाइयां व काले धब्बे (Pigmentation & Spots)">झाइयां व काले धब्बे (Pigmentation)</option>
                <option value="झुर्रियां व एजिंग (Anti-Aging)">झुर्रियां व एजिंग (Anti-Aging)</option>
                <option value="नेचुरल ग्लो व निखार (Glow & Radiance)">नेचुरल ग्लो व निखार (Glow)</option>
                <option value="सन टैनिंग (Sun Tan Removal)">सन टैनिंग (Sun Tan)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    // 5. Hair Care Section
    if (selectedCategories.includes('haircare')) {
      html += `
        <div class="ucas-section-box" id="sec-haircare">
          <div class="ucas-section-box-header" style="color:#4E342E;">
            <span>💇 Hair Care (केश देखभाल व समाधान)</span>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">बालों की समस्या (Hair Concern)</label>
              <select id="hair_concern" class="ucas-select">
                <option value="बाल झड़ना व टूटना (Hair Fall)">बाल झड़ना व टूटना (Hair Fall)</option>
                <option value="रूसी व खुजली (Dandruff & Itchiness)">रूसी व खुजली (Dandruff)</option>
                <option value="सफेद बाल (Premature Greying)">सफेद बाल (Premature Greying)</option>
                <option value="रूखापन व दोमुंहे बाल (Dry & Frizzy Hair)">रूखापन व दोमुंहे बाल</option>
                <option value="पतले बाल (Thinning Hair)">पतले बाल (Thinning)</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">उपचार प्राथमिकता (Treatment Preference)</label>
              <select id="hair_pref" class="ucas-select">
                <option value="100% हर्बल व प्राकृतिक (100% Herbal)">100% हर्बल व प्राकृतिक</option>
                <option value="हर्बल तेल व शैम्पू (Herbal Oil & Shampoo)">हर्बल तेल व शैम्पू</option>
                <option value="आंतरिक पोषण (Nutritional Supplement)">आंतरिक पोषण सप्लीमेंट</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    // 6. Fish / Poultry Section
    if (selectedCategories.includes('fishpoultry')) {
      html += `
        <div class="ucas-section-box" id="sec-fishpoultry">
          <div class="ucas-section-box-header">
            <span>🐟 Fish / Poultry (मत्स्य व कुक्कुट पालन)</span>
          </div>
          <div class="ucas-grid-2">
            <div class="ucas-form-group">
              <label class="ucas-label">व्यवसाय का प्रकार (Business Type)</label>
              <select id="fish_type" class="ucas-select">
                <option value="मछली पालन तालाब (Fish Pond)">मछली पालन तालाब (Fish Pond)</option>
                <option value="बॉयलर पोल्ट्री (Broiler Poultry)">बॉयलर पोल्ट्री (Broiler)</option>
                <option value="लेयर अंडा उत्पादन (Layer Poultry)">लेयर अंडा उत्पादन (Layer)</option>
                <option value="देसी मुर्गी पालन (Country Chicken)">देसी मुर्गी पालन</option>
              </select>
            </div>
            <div class="ucas-form-group">
              <label class="ucas-label">मुख्य आवश्यकता (Key Requirement)</label>
              <select id="fish_need" class="ucas-select">
                <option value="एफसीआर व तेज वजन वृद्धि (FCR & Fast Growth)">एफसीआर व तेज वजन वृद्धि</option>
                <option value="पानी की गुणवत्ता व बायोफ्लोक (Water Quality)">पानी की गुणवत्ता व बायोफ्लोक</option>
                <option value="रोग प्रतिरोधक क्षमता व कम मृत्युदर (Disease Prevention)">रोग प्रतिरोधक क्षमता</option>
              </select>
            </div>
          </div>
        </div>
      `;
    }

    // 7. NetSurf Business Section
    if (selectedCategories.includes('netsurf')) {
      html += `
        <div class="ucas-section-box" id="sec-netsurf">
          <div class="ucas-section-box-header" style="color:#0277BD;">
            <span>💼 NetSurf (बिजनेस एवं आत्मनिर्भर अवसर)</span>
          </div>
          <div class="ucas-form-group">
            <label class="ucas-label">रुचि का क्षेत्र (Area of Interest)</label>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${['100% प्राकृतिक जैविक उत्पाद उपयोग', 'पार्ट टाइम साइड इनकम (₹15,000 - ₹50,000)', 'वर्क फ्रॉम होम / डिजिटल नेटवर्किंग', 'कृषि डीलरशिप व फ्रेंचाइजी', 'फ्री ट्रेनिंग व बिजनेस सपोर्ट'].map(n => `
                <label style="font-size:0.8rem;background:#fff;border:1px solid #CBD5E1;padding:4px 10px;border-radius:20px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;">
                  <input type="checkbox" name="netsurf_interests" value="${n}"> ${n}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // 8. Other Needs Section
    if (selectedCategories.includes('other')) {
      html += `
        <div class="ucas-section-box" id="sec-other">
          <div class="ucas-section-box-header">
            <span>➕ Other Needs (अन्य आवश्यकताएं एवं विवरण)</span>
          </div>
          <div class="ucas-form-group">
            <label class="ucas-label">विशेष टिप्पणी / आवश्यकता (Special Notes / Needs)</label>
            <textarea id="other_notes" class="ucas-textarea" rows="2" placeholder="कृपया व्यक्ति की अन्य कोई विशेष मांग या समस्या लिखें..."></textarea>
          </div>
        </div>
      `;
    }

    sectionsContainer.innerHTML = html;
  }

  function bindSurveyFormEvents() {
    const form = document.getElementById('ucas-survey-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSurveySubmit();
    });
  }

  async function handleSurveySubmit() {
    if (!window.UCAS_PERMISSIONS.hasPermission('survey_create')) {
      window.UCAS_APP.showToast('आपको सर्वे बनाने की अनुमति नहीं है।', 'error');
      return;
    }

    const name = (document.getElementById('survey_name')?.value || '').trim();
    const mobile = (document.getElementById('survey_mobile')?.value || '').trim();
    const age = parseInt(document.getElementById('survey_age')?.value || '0', 10) || null;
    const sex = document.getElementById('survey_sex')?.value || null;
    const state = document.getElementById('survey_state')?.value || null;
    const district = (document.getElementById('survey_district')?.value || '').trim() || null;
    const area = (document.getElementById('survey_area')?.value || '').trim() || null;
    const village = (document.getElementById('survey_village')?.value || '').trim() || null;
    const occupation = document.getElementById('survey_occupation')?.value || null;

    if (!name) {
      window.UCAS_APP.showToast('कृपया व्यक्ति का नाम दर्ज करें।', 'error');
      document.getElementById('survey_name')?.focus();
      return;
    }

    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      window.UCAS_APP.showToast('कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।', 'error');
      document.getElementById('survey_mobile')?.focus();
      return;
    }

    if (selectedCategories.length === 0) {
      window.UCAS_APP.showToast('कृपया कम से कम एक कैटेगरी चुनें।', 'error');
      return;
    }

    // Collect Dynamic Category Answers JSONB
    const categoryAnswers = {};

    if (selectedCategories.includes('agriculture')) {
      const selectedCrops = Array.from(document.querySelectorAll('input[name="agri_crops"]:checked')).map(el => el.value);
      categoryAnswers.agriculture = {
        farmer_status: document.getElementById('agri_status')?.value || '',
        land_size: document.getElementById('agri_land_size')?.value || '',
        crops: selectedCrops,
        crop_problem: document.getElementById('agri_problem')?.value || '',
        irrigation: document.getElementById('agri_irrigation')?.value || ''
      };
    }

    if (selectedCategories.includes('healthcare')) {
      const selectedHealth = Array.from(document.querySelectorAll('input[name="health_concerns"]:checked')).map(el => el.value);
      categoryAnswers.healthcare = {
        concerns: selectedHealth,
        duration: document.getElementById('health_duration')?.value || '',
        medication: document.getElementById('health_medication')?.value || ''
      };
    }

    if (selectedCategories.includes('cattlecare')) {
      categoryAnswers.cattlecare = {
        animal_type: document.getElementById('cattle_type')?.value || '',
        animal_count: document.getElementById('cattle_count')?.value || '',
        daily_milk_liters: document.getElementById('cattle_milk')?.value || '',
        problem: document.getElementById('cattle_problem')?.value || ''
      };
    }

    if (selectedCategories.includes('beautycare')) {
      categoryAnswers.beautycare = {
        skin_type: document.getElementById('beauty_skin_type')?.value || '',
        concern: document.getElementById('beauty_concern')?.value || ''
      };
    }

    if (selectedCategories.includes('haircare')) {
      categoryAnswers.haircare = {
        concern: document.getElementById('hair_concern')?.value || '',
        preference: document.getElementById('hair_pref')?.value || ''
      };
    }

    if (selectedCategories.includes('fishpoultry')) {
      categoryAnswers.fishpoultry = {
        type: document.getElementById('fish_type')?.value || '',
        need: document.getElementById('fish_need')?.value || ''
      };
    }

    if (selectedCategories.includes('netsurf')) {
      const selectedInterests = Array.from(document.querySelectorAll('input[name="netsurf_interests"]:checked')).map(el => el.value);
      categoryAnswers.netsurf = {
        interests: selectedInterests
      };
    }

    if (selectedCategories.includes('other')) {
      categoryAnswers.other = {
        notes: document.getElementById('other_notes')?.value || ''
      };
    }

    const currentProfileId = window.UCAS_SESSION.getUserId();
    const payload = {
      profile_id: currentProfileId,
      name,
      mobile,
      age,
      sex,
      state,
      district,
      area,
      village,
      occupation,
      selected_categories: selectedCategories,
      category_answers: categoryAnswers
    };

    const submitBtn = document.getElementById('survey_submit_btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सुरक्षित किया जा रहा है...';
    }

    try {
      const res = await window.UCAS_DB.createSurvey(payload);
      if (res.success) {
        window.UCAS_APP.showToast('✅ सर्वे सफलतापूर्वक सुरक्षित हो गया!', 'success');
        
        // Also auto-add to Phonebook if not present
        if (currentProfileId) {
          window.UCAS_DB.addPhonebookContact({
            profile_id: currentProfileId,
            name,
            mobile,
            place: village || district || area || '',
            source: 'survey'
          });
        }

        // Reset Form
        document.getElementById('ucas-survey-form')?.reset();
        selectedCategories = [];
        renderCategoryCards();
        updateDynamicCategorySections();

        // Refresh Data
        await loadSurveys();
        if (window.UCAS_APP && window.UCAS_APP.refreshDashboardKPIs) {
          window.UCAS_APP.refreshDashboardKPIs();
        }
      } else {
        window.UCAS_APP.showToast('सर्वे सेव करने में त्रुटि: ' + (res.message || ''), 'error');
      }
    } catch (e) {
      console.error('Survey submit error:', e);
      window.UCAS_APP.showToast('कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> सर्वे सुरक्षित करें (Save Survey)';
      }
    }
  }

  async function loadSurveys() {
    const profileId = window.UCAS_SESSION.getUserId();
    const res = await window.UCAS_DB.getSurveys(profileId);
    if (res.success) {
      userSurveysList = res.data || [];
      renderSurveysTable(userSurveysList);
    }
    return userSurveysList;
  }

  function renderSurveysTable(surveys) {
    const tbody = document.getElementById('ucas-survey-history-body');
    const countEl = document.getElementById('ucas-survey-history-count');
    if (countEl) countEl.textContent = surveys.length;
    if (!tbody) return;

    if (surveys.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">
            📝 अभी तक कोई सर्वे रिकॉर्ड नहीं है। ऊपर दिए गए फॉर्म से पहला सर्वे जोड़ें।
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = surveys.map((s, idx) => {
      const cats = Array.isArray(s.selected_categories) ? s.selected_categories.join(', ') : (s.selected_categories || '-');
      const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('hi-IN') : '-';
      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${s.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${s.village || s.district || s.state || '-'}</div>
          </td>
          <td><code>${s.mobile}</code></td>
          <td><span style="font-size:0.78rem;background:var(--primary-subtle);color:var(--primary);padding:3px 8px;border-radius:4px;font-weight:600;">${cats}</span></td>
          <td>${dateStr}</td>
          <td>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_SURVEY.viewSurveyDetails('${s.id}')">
              <i class="fa-solid fa-eye"></i> देखें
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async function viewSurveyDetails(surveyId) {
    let s = userSurveysList.find(item => String(item.id) === String(surveyId));
    if (!s) {
      // Try fetching survey by ID from DB (for Admin Center inspection)
      try {
        const db = window.UCAS_DB.getDb();
        const { data } = await db.from('surveys').select('*').eq('id', surveyId).single();
        s = data;
      } catch (e) {
        console.warn('Survey detail fetch error', e);
      }
    }
    if (!s) return;

    const modal = document.getElementById('ucas-survey-view-modal');
    const content = document.getElementById('ucas-survey-view-content');
    if (!modal || !content) return;

    const cats = Array.isArray(s.selected_categories) ? s.selected_categories : [];
    const answers = s.category_answers || {};

    let catDetailsHtml = '';
    cats.forEach(catKey => {
      const ans = answers[catKey] || {};
      catDetailsHtml += `
        <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:10px;margin-top:8px;">
          <h4 style="font-size:0.88rem;color:var(--primary);margin-bottom:6px;text-transform:capitalize;">${catKey} Details</h4>
          <pre style="font-size:0.78rem;background:#fff;padding:6px;border-radius:4px;white-space:pre-wrap;">${JSON.stringify(ans, null, 2)}</pre>
        </div>
      `;
    });

    content.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;font-size:0.85rem;">
        <div><strong>नाम:</strong> ${s.name}</div>
        <div><strong>मोबाइल:</strong> ${s.mobile}</div>
        <div><strong>उम्र / लिंग:</strong> ${s.age || '-'} / ${s.sex || '-'}</div>
        <div><strong>व्यवसाय:</strong> ${s.occupation || '-'}</div>
        <div><strong>राज्य / जिला:</strong> ${s.state || '-'} / ${s.district || '-'}</div>
        <div><strong>ग्राम / क्षेत्र:</strong> ${s.village || s.area || '-'}</div>
      </div>
      <div style="font-size:0.85rem;font-weight:700;margin-top:10px;">कैटेगरी उत्तर (Category Answers):</div>
      ${catDetailsHtml || '<p style="color:var(--text-muted);font-size:0.8rem;">कोई विशेष उत्तर नहीं</p>'}
    `;

    modal.classList.add('active');
  }

  function searchSurveys(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderSurveysTable(userSurveysList);
      return;
    }
    const filtered = userSurveysList.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.mobile && s.mobile.includes(q)) ||
      (s.village && s.village.toLowerCase().includes(q)) ||
      (s.district && s.district.toLowerCase().includes(q))
    );
    renderSurveysTable(filtered);
  }

  window.UCAS_SURVEY = {
    init: initSurveyModule,
    toggleCategory,
    loadSurveys,
    viewSurveyDetails,
    searchSurveys,
    getSurveysList: () => userSurveysList
  };

  console.log('✅ UCAS Smart Survey Engine Ready.');
})(window);
