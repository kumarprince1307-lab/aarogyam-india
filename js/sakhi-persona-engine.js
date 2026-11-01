/**
 * =========================================================================
 * AAROGYAM SAKHI AI — PERSONA, MEMORY & DYNAMIC DOMAIN ENGINE
 * Module: js/sakhi-persona-engine.js
 * Version: 2.0 Universal Master (Compliant with SAKHI_MANAS.md)
 * 
 * Capabilities:
 * 1. User Nature & Persona Memory (YouTube/Facebook-style interest profiling)
 * 2. Opening Review Greeting: Proactive follow-up on past conversation
 * 3. 1-Tap Auto-Send: Instant trigger without typing
 * 4. Domain Fatigue Breaker: Proactively switches topics after 5-7 queries
 * 5. Area & Month-wise Crop Yield & Profit Advisor with Mandi Trend Disclaimer
 * 6. Chemical Compatibility Matrix: Safe mixing checker (Zinc + DAP, etc.)
 * 7. 1-Tap WhatsApp Doctor Rx Slip
 * 8. Zero-Egress Visual Cards via PWA Media Cache
 * =========================================================================
 */

(function () {
  'use strict';

  // 1. STATE & USER PERSONA STORE
  const PERSONA_STORAGE_KEY = 'SAKHI_PERSISTENT_PERSONA_V2';
  let activePersona = null;
  let sessionQueryStreak = 0;
  let currentDomainStreak = 0;
  let lastDomain = '';
  let authenticNuskheCache = null;

  // Load Persona from LocalStorage with safe fallbacks
  function loadPersona() {
    try {
      const raw = localStorage.getItem(PERSONA_STORAGE_KEY);
      if (raw) {
        activePersona = JSON.parse(raw);
      }
    } catch (_) {}

    if (!activePersona) {
      activePersona = {
        name: '',
        mobile: '',
        primaryDomain: 'agri',
        domainScores: { agri: 0, pashu: 0, health: 0, beauty: 0, weight: 0 },
        lastTopic: '',
        lastTopicTimestamp: null,
        totalVisits: 0,
        completedTopics: []
      };
    }

    // Auto-discover past topic from chat logs if empty
    if (!activePersona.lastTopic) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('SAKHI_CHAT_LOG_')) {
            const rawLog = localStorage.getItem(k);
            if (rawLog) {
              const arr = JSON.parse(rawLog);
              if (Array.isArray(arr) && arr.length > 0) {
                for (let j = arr.length - 1; j >= 0; j--) {
                  const item = arr[j];
                  if (item.role === 'user' && item.content && !item.content.includes('{') && !item.content.startsWith('[')) {
                    activePersona.lastTopic = item.content.slice(0, 80);
                    activePersona.lastTopicTimestamp = Date.now();
                    break;
                  }
                }
                if (activePersona.lastTopic) break;
              }
            }
          }
        }
      } catch (_) {}
    }

    // Sync with global user profile if logged in
    try {
      const userRaw = localStorage.getItem('AI_USER');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u.name && !activePersona.name) activePersona.name = u.name;
        if (u.mobile && !activePersona.mobile) activePersona.mobile = u.mobile;
      }
    } catch (_) {}

    activePersona.totalVisits = (activePersona.totalVisits || 0) + 1;
    savePersona();
    return activePersona;
  }

  function savePersona() {
    try {
      localStorage.setItem(PERSONA_STORAGE_KEY, JSON.stringify(activePersona));
    } catch (_) {}
  }

  // Record a user question to update their nature and topic memory
  function trackUserInteraction(queryText, detectedDomain) {
    if (!activePersona) loadPersona();
    const clean = (queryText || '').trim();
    if (!clean) return;

    // Detect domain
    let dom = detectedDomain || 'agri';
    if (/दूध|फैट|गाय|भैंस|पशु|थनैला|अफरा|बछड़ा/i.test(clean)) dom = 'pashu';
    else if (/शुगर|डायबिटीज|जोड़|दर्द|बीपी|गैस|कब्ज|लिवर/i.test(clean)) dom = 'health';
    else if (/बाल|चेहरा|दाग|झुर्रियां|पिंपल|त्वचा|सुंदरता/i.test(clean)) dom = 'beauty';
    else if (/वजन|मोटापा|चर्बी|डाइट/i.test(clean)) dom = 'weight';
    else if (/गेहूं|चना|सरसों|आलू|फसल|खाद|पोटाश|जिंक|बीज|कीट|इल्ली/i.test(clean)) dom = 'agri';

    // Update domain scores
    activePersona.domainScores[dom] = (activePersona.domainScores[dom] || 0) + 1;

    // Recalculate primary domain
    let maxD = 'agri';
    let maxS = 0;
    Object.keys(activePersona.domainScores).forEach(k => {
      if (activePersona.domainScores[k] > maxS) {
        maxS = activePersona.domainScores[k];
        maxD = k;
      }
    });
    activePersona.primaryDomain = maxD;

    // Save as lastTopic (clean & human-friendly)
    activePersona.lastTopic = clean.slice(0, 80);
    activePersona.lastTopicTimestamp = Date.now();
    savePersona();

    // Track domain streaks for domain-fatigue breaking
    sessionQueryStreak++;
    if (dom === lastDomain) {
      currentDomainStreak++;
    } else {
      currentDomainStreak = 1;
      lastDomain = dom;
    }

    // Check if domain fatigue threshold reached (>= 5 questions in same domain)
    if (currentDomainStreak >= 5) {
      setTimeout(() => {
        triggerDomainFatigueBreaker(dom);
      }, 1200);
      currentDomainStreak = 0; // Reset streak
    }
  }

  // 2. PROACTIVE OPENING REVIEW GREETING (Review Past Conversation)
  function renderProactivePastReviewCard() {
    const p = loadPersona();
    if (!p || !p.lastTopic) return;

    // Only show if last topic was asked within past 7 days
    const diffHours = (Date.now() - (p.lastTopicTimestamp || 0)) / (1000 * 60 * 60);
    if (diffHours > 168) return; // Older than 7 days

    const wrap = document.getElementById('sakhiMessagesWrap') || document.querySelector('.sakhi-messages-wrap');
    if (!wrap) return;

    // Avoid duplicate cards
    if (document.getElementById('sakhiProactivePastReviewBox')) return;

    const uName = p.name ? `${p.name} जी` : 'किसान साथी';
    const topicText = p.lastTopic.replace(/[?।!,]+/g, '').trim();

    const reviewCardHtml = `
      <div id="sakhiProactivePastReviewBox" style="background:linear-gradient(135deg, #f0fdf4, #ecfdf5); border:1.5px solid #86efac; border-radius:14px; padding:12px 14px; margin:10px 12px; box-shadow:0 3px 10px rgba(22,163,74,0.08); animation:sakhiFadeInUp 0.4s ease-out;">
        <div style="display:flex; align-items:flex-start; gap:10px;">
          <div style="background:#16a34a; color:#ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1.0rem;">
            🌾
          </div>
          <div style="flex:1;">
            <div style="font-size:0.75rem; color:#15803d; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
              पिछली बातचीत की समीक्षा • आपकी सखी
            </div>
            <strong style="color:#0f172a; font-size:0.92rem; display:block; margin:3px 0 6px 0; line-height:1.35;">
              राम-राम ${uName}! 🙏 पिछली बार आप "<i>${topicText}</i>" के बारे में पूछ रहे थे, क्या वह कार्य पूरा हो गया?
            </strong>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
              <button type="button" onclick="window.SakhiPersona.handleReviewReply('yes')" style="background:#16a34a; color:#ffffff; border:none; border-radius:20px; padding:5px 12px; font-size:0.78rem; font-weight:800; cursor:pointer;">
                ✅ हाँ, पूरा हो गया
              </button>
              <button type="button" onclick="window.SakhiPersona.handleReviewReply('next_step')" style="background:#ffffff; color:#15803d; border:1px solid #86efac; border-radius:20px; padding:5px 12px; font-size:0.78rem; font-weight:800; cursor:pointer;">
                🌾 आगे का स्प्रे प्लान बताओ
              </button>
              <button type="button" onclick="window.SakhiPersona.handleReviewReply('new_topic')" style="background:#f1f5f9; color:#475569; border:none; border-radius:20px; padding:5px 10px; font-size:0.75rem; font-weight:700; cursor:pointer;">
                ✕ कुछ नया पूछना है
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Insert right after the welcome banner or top of messages
    const firstMsg = wrap.firstElementChild;
    if (firstMsg) {
      firstMsg.insertAdjacentHTML('afterend', reviewCardHtml);
    } else {
      wrap.insertAdjacentHTML('afterbegin', reviewCardHtml);
    }
  }

  function handleReviewReply(action) {
    const box = document.getElementById('sakhiProactivePastReviewBox');
    if (box) box.remove();

    if (action === 'yes') {
      window.SakhiPersona.autoSendQuery("बहुत बढ़िया! बुवाई व प्राथमिक कार्य पूरा हो गया है, अब आगे की पहली सिंचाई व फुटाव का वैज्ञानिक फॉर्मूला बताएं।");
    } else if (action === 'next_step') {
      window.SakhiPersona.autoSendQuery("मेरी पिछली फसल में आगे कौन सी खाद और स्प्रे डालना है, पूरा शेड्यूल बताएं।");
    }
  }

  // 3. 1-TAP AUTO-SEND TRIGGER (Clicks chip -> immediately delivers without typing)
  function autoSendQuery(text) {
    const q = (text || '').trim();
    if (!q) return;

    const input = document.getElementById('sakhiChatInput') || document.getElementById('sakhiInput');
    const form = document.getElementById('sakhiChatForm') || document.getElementById('sakhiForm');

    if (input) {
      input.value = q;
      // Trigger native submit
      if (typeof window.handleSakhiUserSubmit === 'function') {
        window.handleSakhiUserSubmit(q);
      } else if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
      input.value = '';
    }
  }

  // 4. DOMAIN FATIGUE BREAKER (Proactively offer exciting new topic after 5-7 repetitive queries)
  function triggerDomainFatigueBreaker(exhaustedDomain) {
    const wrap = document.getElementById('sakhiMessagesWrap') || document.querySelector('.sakhi-messages-wrap');
    if (!wrap) return;

    let breakerTitle = '';
    let breakerPrompt = '';
    let chips = [];

    if (exhaustedDomain === 'agri') {
      breakerTitle = '🐄 पशुपालन व घरेलू स्वास्थ्य • नई रोचक चर्चा';
      breakerPrompt = 'किसान भाई, खेती की तो बहुत अच्छी और विस्तार से चर्चा हो गई! क्या आपके घर में दुधारू गाय-भैंस भी हैं? उनका दूध-फैट बढ़ाने का अचूक फॉर्मूला बताऊं या परिवार के लिए दादी का कोई स्वास्थ्य नुस्खा चाहिए?';
      chips = [
        { text: '🐄 गाय-भैंस का दूध व फैट बढ़ाएं', q: 'गाय भैंस का दूध और फैट बढ़ाने का उपाय' },
        { text: '🦵 घुटनों व जोड़ों के दर्द का देशी नुस्खा', q: 'घुटनों और जोड़ों के दर्द का आयुर्वेदिक इलाज' },
        { text: '🌾 गेहूं में कुछ और पूछें', q: 'गेहूं में अधिक कल्ले और फुटाव कैसे लाएं' }
      ];
    } else if (exhaustedDomain === 'pashu') {
      breakerTitle = '🌾 रबी फसल व स्वास्थ्य • नया विषय';
      breakerPrompt = 'पशुपालन के बारे में पूरी जानकारी हो गई! क्या आपके खेतों में गेहूं, चना या सरसों की बुवाई चल रही है? या घर में किसी की सेहत के लिए कोई घरेलू नुस्खा जानना चाहते हैं?';
      chips = [
        { text: '🌾 गेहूं में पहला पानी व कल्ले फॉर्मूला', q: 'गेहूं में पहली सिंचाई कब करें' },
        { text: '🩸 डायबिटीज शुगर का डाइट चार्ट', q: 'मधुमेह में क्या खाएं और डाइट चार्ट' },
        { text: '🐄 पशु आहार सीएफसी प्लस की खुराक', q: 'सीएफसी प्लस की खुराक और फायदे' }
      ];
    } else {
      breakerTitle = '🌾 कृषि व फसल सलाह • खेती का मौसम';
      breakerPrompt = 'स्वास्थ्य और नुस्खों की संपूर्ण बात हो गई! क्या आपकी कोई खेती-किसानी या पशुपालन से जुड़ी जिज्ञासा भी है? इस रबी सीजन में रिकॉर्ड पैदावार का वैज्ञानिक फॉर्मूला जान सकते हैं:';
      chips = [
        { text: '🌾 रबी फसलों का संपूर्ण स्प्रे कैलेंडर', q: 'फसलों का संपूर्ण स्प्रे कैलेंडर' },
        { text: '🐄 बाल्टी भर गाढ़ा दूध व फैट नुस्खा', q: 'गाय भैंस का दूध और फैट बढ़ाने का उपाय' },
        { text: '🌿 अन्य घरेलू स्वास्थ्य नुस्खे', q: 'दादी के आयुर्वेदिक घरेलू नुस्खे' }
      ];
    }

    const breakerHtml = `
      <div class="sakhi-domain-fatigue-card" style="background:#ffffff; border:1.5px solid #cbd5e1; border-left:4px solid #8b5cf6; border-radius:12px; padding:12px 14px; margin:12px 10px; box-shadow:0 2px 8px rgba(0,0,0,0.04); animation:sakhiFadeInUp 0.35s ease;">
        <div style="font-size:0.75rem; color:#7c3aed; font-weight:800; text-transform:uppercase;">
          ✨ ${breakerTitle}
        </div>
        <p style="color:#1e293b; font-size:0.88rem; margin:4px 0 10px 0; line-height:1.4;">
          ${breakerPrompt}
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${chips.map(c => `
            <button type="button" onclick="window.SakhiPersona.autoSendQuery('${c.q}')" style="background:#f5f3ff; color:#6d28d9; border:1px solid #ddd6fe; border-radius:20px; padding:5px 12px; font-size:0.78rem; font-weight:800; cursor:pointer;">
              ${c.text}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    wrap.insertAdjacentHTML('beforeend', breakerHtml);
    wrap.scrollTop = wrap.scrollHeight;
  }

  // 5. AREA & MONTH-WISE CROP YIELD & PROFIT ADVISOR (November Rabi Special)
  function getAreaMonthCropAdvice(district) {
    const distName = district || 'मध्य भारत (MP/UP/राजस्थान)';
    const advice = {
      month: 'नवंबर (कार्तिक-मार्गशीर्ष)',
      season: 'रबी सीजन बुवाई पीक',
      topProfitableCrops: [
        { name: 'लहसुन (G-2 / रियावन / ऊटी)', yield: '45-55 क्विंटल/एकड़', profit: '₹2.5 से ₹3.5 लाख/एकड़', duration: '130-140 दिन' },
        { name: 'गेहूं (GW-322 / पूसा तेजस 8759)', yield: '25-30 क्विंटल/एकड़', profit: '₹60,000 से ₹75,000/एकड़', duration: '115-125 दिन' },
        { name: 'चना (RVG-202 / विशाल काबुली)', yield: '12-15 क्विंटल/एकड़', profit: '₹65,000 से ₹80,000/एकड़', duration: '105-115 दिन' },
        { name: 'सरसों (पायनियर 45S46 / गिरिराज)', yield: '8-10 क्विंटल/एकड़', profit: '₹50,000 से ₹65,000/एकड़', duration: '110-120 दिन' }
      ],
      mandiTrendDisclaimer: '⚠️ **आवश्यक मंडी सूचना:** यह आंकड़े कृषि वैज्ञानिकों व पिछले 3 वर्षों के ऑनलाइन मंडी रुझान (Trends) पर आधारित हैं। बाजार में भाव हर दिन मांग व आवक पर निर्भर करता है, इसलिए बुवाई व बिक्री का अंतिम फैसला अपने जिले की स्थानीय मंडी में भाव पता करके ही लें।'
    };
    return advice;
  }

  // 6. CHEMICAL COMPATIBILITY MATRIX (Safe Mixing Checker)
  function checkChemicalCompatibility(drugA, drugB) {
    const a = (drugA || '').toLowerCase();
    const b = (drugB || '').toLowerCase();
    const pair = a + ' ' + b;

    if ((pair.includes('जिंक') || pair.includes('zinc')) && (pair.includes('डीएपी') || pair.includes('dap') || pair.includes('फास्फोरस') || pair.includes('ssp'))) {
      return {
        safe: false,
        warning: '❌ **सख्त मना (Danger):** जिंक सल्फेट को कभी भी डीएपी (DAP) या फास्फोरस के साथ न मिलाएं! यह रासायनिक क्रिया करके अघुलनशील जिंक फास्फेट बना देता है जिससे दोनों खादें 100% बेकार हो जाती हैं। जिंक को हमेशा यूरिया या बालू रेत के साथ अलग डालें।'
      };
    }

    if ((pair.includes('रैप-अप') || pair.includes('wrapup')) && (pair.includes('शेत') || pair.includes('shet') || pair.includes('npk') || pair.includes('माइकोराइजा'))) {
      return {
        safe: false,
        warning: '⚠️ **सावधानी (Keep 5 Days Gap):** रैप-अप (फफूंद सुरक्षा) और शेत/बायो-NPK (मित्र जीवाणु) को एक ही घोल में न मिलाएं। रैप-अप देने के 5-7 दिन बाद ही शेत या बायो-NPK ड्रिप/सिंचाई से दें।'
      };
    }

    if ((pair.includes('स्टीमरिच') || pair.includes('stimrich')) && (pair.includes('बायो-99') || pair.includes('bio-99'))) {
      return {
        safe: true,
        warning: '✅ **100% सुरक्षित व अत्यंत असरदार (Super Match):** स्टीमरिच (30ml) + बायो-99 (5ml) का मिश्रण पत्तियों पर दवा को 100% चिपकाकर फुटाव और कल्ले 3 गुना तेज बढ़ाता है।'
      };
    }

    return {
      safe: true,
      warning: 'ℹ️ **सामान्य सलाह:** किसी भी दो दवाओं को ड्रम में मिलाने से पहले एक छोटे मग में 1-1 चम्मच मिलाकर "जार टेस्ट" (Jar Test) कर लें। अगर घोल फटे नहीं या दही जैसा न जमे, तभी पूरे खेत में स्प्रे करें।'
    };
  }

  // 7. 1-TAP WHATSAPP DOCTOR RX SLIP
  function generateWhatsAppRxSlip(doctorTitle, adviceSummary, medicineDoses) {
    const p = loadPersona();
    const name = p.name || 'किसान साथी';
    const sName = 'आरोग्यम सखी AI डिजिटल विशेषज्ञ';
    const dateStr = new Date().toLocaleDateString('hi-IN');

    const msg = `🌾 *आरोग्यम डिजिटल स्वास्थ्य व कृषि सलाह पर्ची* 📜\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *नाम:* ${name}\n` +
      `📅 *तारीख:* ${dateStr}\n` +
      `🩺 *परामर्श विषय:* ${doctorTitle}\n` +
      `━━━━━━━━━━━━━━━━━━━\n\n` +
      `💡 *विशेषज्ञ सलाह:* \n${adviceSummary}\n\n` +
      `💊 *अनुशंसित दवा व सही खुराक:* \n${medicineDoses}\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📖 *डिजिटल पासबुक व सलाह यहाँ देखें:*\n` +
      `👉 https://aarogyamindia.online/aarogyam-sakhi.html\n\n` +
      `— *${sName}* • Aarogyam India`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // 8. ASYNC LOAD 200 AUTHENTIC NUSKHE JSON (Zero Egress PWA Cached)
  async function loadAuthenticNuskheVault() {
    if (authenticNuskheCache) return authenticNuskheCache;
    try {
      const res = await fetch('/data/sakhi-authentic-nuskhe-200.json?v=20261101_v200');
      if (res.ok) {
        authenticNuskheCache = await res.json();
        return authenticNuskheCache;
      }
    } catch (err) {
      console.warn('[Sakhi Persona] Nuskhe vault offline fallback:', err);
    }
    return null;
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    loadPersona();
    // Render past review card after avatar entrance finishes
    setTimeout(() => {
      renderProactivePastReviewCard();
    }, 4200);
  });

  // Export to Global Window under SAKHI_MANAS.md Protocol
  window.SakhiPersona = {
    loadPersona,
    savePersona,
    trackUserInteraction,
    autoSendQuery,
    handleReviewReply,
    triggerDomainFatigueBreaker,
    getAreaMonthCropAdvice,
    checkChemicalCompatibility,
    generateWhatsAppRxSlip,
    loadAuthenticNuskheVault
  };

  console.log('✅ [Sakhi Persona Engine v2.0 Master] Initialized under SAKHI_MANAS.md Protocol');

})();
