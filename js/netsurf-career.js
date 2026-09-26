/**
 * ==========================================================================
 * AAROGYAM INDIA - NETSURF DIRECT SELLING & CAREER ENGINE
 * File: /js/netsurf-career.js
 * Version: 2026.1 (Interactive UX, Dynamic Referrer & 2-Way WhatsApp Dispatch)
 * ==========================================================================
 */

(function (window, document) {
  'use strict';

  // Central Aarogyam Support Default
  const DEFAULT_SUPPORT_PHONE = '917974422572';
  const DEFAULT_SPONSOR_NAME = 'आरोग्यम इंडिया सेंट्रल सपोर्ट';

  let currentSponsor = {
    name: DEFAULT_SPONSOR_NAME,
    phone: DEFAULT_SUPPORT_PHONE,
    isPersonalized: false
  };

  // Video Masterclass Playlist
  const MASTERCLASS_VIDEOS = [
    {
      id: 'factory_profile',
      title: '🏭 कंपनी प्रोफ़ाइल व R&D फैक्ट्री टूर (₹1500 करोड़ कमीशन का सच)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/videoseries?list=PLwB_a_9_demo1', // fallback or real id
      videoId: 'videoseries?list=PLwB_a_9_demo1',
      desc: 'नेटसर्फ की 26 साल की विरासत, पुणे हेडक्वार्टर, DSIR अप्रूव्ड लैब्स और अपनी मैन्युफैक्चरिंग यूनिट की अंदरूनी झलक।'
    },
    {
      id: 'why_90_fail',
      title: '⚠️ नेटसर्फ में 90% लोग फेल क्यों होते हैं? (सच जो कोई नहीं बताता)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/demo_fail_analysis',
      videoId: 'demo_fail_analysis',
      desc: 'गलत तरीके से काम करने का नुकसान और 10% टॉप अचीवर्स की सही कार्यप्रणाली।'
    },
    {
      id: 'autoship_formula',
      title: '📊 ₹45,000/माह फिक्स इनकम फॉर्मूला (5+1 फ्री ऑटोशिप सिस्टम)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/demo_autoship',
      videoId: 'demo_autoship',
      desc: '180 संतुष्ट उपभोक्ता और 5 महीने पर 1 महीना फ्री ऑटोशिप द्वारा स्थायी मासिक आय।'
    },
    {
      id: 'nominee_security',
      title: '🛡️ फैमिली प्रोटेक्शन व नॉमिनी फैसिलिटी (आजीवन सुरक्षा)',
      embedUrl: 'https://www.youtube-nocookie.com/embed/demo_nominee',
      videoId: 'demo_nominee',
      desc: 'मेडिक्लेम, एक्सीडेंटल कवर और परिवार के नाम बिज़नेस की अटूट सुरक्षा।'
    }
  ];

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    detectSponsorReferral();
    initIncomeCalculator();
    initSurveyForm();
    initVideoPlayer();
    initKypTabs();
    initFaqAccordion();
  });

  /**
   * 1. DETECT SPONSOR REFERRAL FROM URL
   */
  function detectSponsorReferral() {
    const params = new URLSearchParams(window.location.search);
    const refPhone = params.get('ref') || params.get('sponsor_phone') || params.get('phone');
    const refName = params.get('sponsor') || params.get('name') || params.get('by');

    if (refPhone && refPhone.trim().length >= 10) {
      let cleanPhone = refPhone.replace(/\D/g, '');
      if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
      currentSponsor.phone = cleanPhone;
      currentSponsor.name = refName ? decodeURIComponent(refName).trim() : 'अधिकृत बिज़नेस पार्टनर';
      currentSponsor.isPersonalized = true;

      // Save in session
      try {
        localStorage.setItem('aim_ns_sponsor_phone', currentSponsor.phone);
        localStorage.setItem('aim_ns_sponsor_name', currentSponsor.name);
      } catch (e) {}
    } else {
      // Check localStorage
      const savedPhone = localStorage.getItem('aim_ns_sponsor_phone');
      const savedName = localStorage.getItem('aim_ns_sponsor_name');
      if (savedPhone) {
        currentSponsor.phone = savedPhone;
        currentSponsor.name = savedName || 'अधिकृत बिज़नेस पार्टनर';
        currentSponsor.isPersonalized = true;
      }
    }

    renderSponsorElements();
  }

  function renderSponsorElements() {
    const banner = document.getElementById('nsSponsorBanner');
    const nameEl = document.getElementById('nsSponsorNameText');
    const callBtn = document.getElementById('nsSponsorCallBtn');
    const waBtn = document.getElementById('nsSponsorWaBtn');
    const mobileCallBtn = document.getElementById('nsMobileCallBtn');
    const mobileWaBtn = document.getElementById('nsMobileWaBtn');

    if (nameEl) nameEl.textContent = currentSponsor.name;

    const telLink = 'tel:+' + currentSponsor.phone;
    const waText = encodeURIComponent(`नमस्ते ${currentSponsor.name} जी! मैंने आपका नेटसर्फ डायरेक्ट सेलिंग करियर पेज देखा। मुझे इस बिज़नेस मॉडल और ₹8,19,250 क्लोजिंग प्लान की पूरी जानकारी चाहिए।`);
    const waLink = `https://api.whatsapp.com/send?phone=${currentSponsor.phone}&text=${waText}`;

    if (callBtn) callBtn.href = telLink;
    if (waBtn) waBtn.href = waLink;
    if (mobileCallBtn) mobileCallBtn.href = telLink;
    if (mobileWaBtn) mobileWaBtn.href = waLink;

    if (banner && currentSponsor.isPersonalized) {
      banner.style.display = 'flex';
    }
  }

  /**
   * 2. INTERACTIVE COMMISSION & INCOME CALCULATOR
   */
  function initIncomeCalculator() {
    const retailSlider = document.getElementById('calcRetailSlider');
    const teamSlider = document.getElementById('calcTeamSlider');
    if (!retailSlider || !teamSlider) return;

    function recalculate() {
      const retailTurnover = parseInt(retailSlider.value, 10) || 0;
      const teamTurnover = parseInt(teamSlider.value, 10) || 0;

      // Display inputs
      document.getElementById('calcRetailVal').textContent = '₹' + retailTurnover.toLocaleString('en-IN');
      document.getElementById('calcTeamVal').textContent = '₹' + teamTurnover.toLocaleString('en-IN');

      // 1. Retail Profit (5% to 15%)
      let retailPct = 5;
      if (retailTurnover >= 8000) retailPct = 15;
      else if (retailTurnover >= 4000) retailPct = 10;
      else retailPct = 5;

      const weeklyRetailIncome = Math.round((retailTurnover * retailPct) / 100);
      const monthlyRetailIncome = weeklyRetailIncome * 4;

      // 2. Generation Commission (3% to 8%)
      // ₹10,000 -> 3%, ₹20,000 -> 4%, ₹40,000 -> 5%, ₹80,000 -> 6%, ₹1,20,000 -> 7%, ₹1,60,000+ -> 8%
      let genPct = 3;
      if (teamTurnover >= 160000) genPct = 8;
      else if (teamTurnover >= 120000) genPct = 7;
      else if (teamTurnover >= 80000) genPct = 6;
      else if (teamTurnover >= 40000) genPct = 5;
      else if (teamTurnover >= 20000) genPct = 4;
      else if (teamTurnover >= 10000) genPct = 3;
      else genPct = 0;

      const monthlyGenIncome = Math.round((teamTurnover * genPct) / 100);

      // 3. Team Turnover Matching Bonus (3%, 4%, 5%)
      // Up to 25k total income -> 3%, 25k-50k -> 4%, 50k+ -> 5%
      let turnoverPct = 3;
      if (teamTurnover >= 50000) turnoverPct = 5;
      else if (teamTurnover >= 25000) turnoverPct = 4;
      else turnoverPct = 3;

      const biMonthlyTurnoverIncome = Math.round((teamTurnover * turnoverPct) / 100);

      // Total 15-day Projected Income (capped at ₹8,19,250)
      let total15Day = (weeklyRetailIncome * 2) + Math.round(monthlyGenIncome / 2) + biMonthlyTurnoverIncome;
      if (total15Day > 819250) {
        total15Day = 819250; // Cap
      }

      const totalMonthly = total15Day * 2;

      // Update UI Elements
      document.getElementById('calcRetailResult').textContent = `₹${weeklyRetailIncome.toLocaleString('en-IN')} / सप्ताह (${retailPct}%)`;
      document.getElementById('calcGenResult').textContent = `₹${monthlyGenIncome.toLocaleString('en-IN')} / माह (${genPct}%)`;
      document.getElementById('calcTurnoverResult').textContent = `₹${biMonthlyTurnoverIncome.toLocaleString('en-IN')} (${turnoverPct}%)`;
      document.getElementById('calcTotal15Day').textContent = `₹${total15Day.toLocaleString('en-IN')}`;
      document.getElementById('calcTotalMonthly').textContent = `₹${totalMonthly.toLocaleString('en-IN')}`;
    }

    retailSlider.addEventListener('input', recalculate);
    teamSlider.addEventListener('input', recalculate);
    recalculate();
  }

  /**
   * 3. 2-WAY SURVEY LEAD DISPATCH
   */
  function initSurveyForm() {
    const form = document.getElementById('nsCareerSurveyForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ns_survey_name')?.value?.trim();
      const mobile = document.getElementById('ns_survey_mobile')?.value?.trim();
      const city = document.getElementById('ns_survey_city')?.value?.trim() || 'अज्ञात';
      const background = document.getElementById('ns_survey_bg')?.value || 'उत्सुक नागरिक';
      const target = document.getElementById('ns_survey_goal')?.value || '₹15,000 - ₹50,000';
      const interest = document.getElementById('ns_survey_category')?.value || 'सम्पूर्ण बिज़नेस व प्रोडक्ट';

      if (!name || !mobile || mobile.length < 10) {
        alert('कृपया अपना सही नाम और 10-अंकों का व्हाट्सएप नंबर दर्ज करें।');
        return;
      }

      // Format WhatsApp Message
      const message = 
`🚀 *नेटसर्फ डायरेक्ट सेलिंग करियर सर्वे (Aarogyam India)* 🚀
━━━━━━━━━━━━━━━━━━━━
👤 *नाम:* ${name}
📱 *व्हाट्सएप:* ${mobile}
📍 *शहर/राज्य:* ${city}
💼 *वर्तमान प्रोफ़ाइल:* ${background}
🎯 *मासिक आय लक्ष्य:* ${target}
🌾 *रुचि का क्षेत्र:* ${interest}
🤝 *प्रायोजक (Sponsor):* ${currentSponsor.name}
━━━━━━━━━━━━━━━━━━━━
✅ _मैं नेटसर्फ बिज़नेस मॉडल और आरोग्यम डिजिटल सिस्टम से शुरुआत करने हेतु परामर्श चाहता/चाहती हूँ।_`;

      const encodedMsg = encodeURIComponent(message);
      const targetPhone = currentSponsor.isPersonalized ? currentSponsor.phone : DEFAULT_SUPPORT_PHONE;
      const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedMsg}`;

      // Store lead locally for safety
      try {
        const storedLeads = JSON.parse(localStorage.getItem('aim_ns_leads') || '[]');
        storedLeads.push({ name, mobile, city, background, target, interest, date: new Date().toISOString() });
        localStorage.setItem('aim_ns_leads', JSON.stringify(storedLeads));
      } catch (err) {}

      // Confirmation Alert
      alert(`धन्यवाद ${name} जी! आपकी जानकारी दर्ज हो गई है। अब आपको सीधे व्हाट्सएप पर हमारे एक्सपर्ट से कनेक्ट किया जा रहा है।`);

      // Open WhatsApp window
      window.open(waUrl, '_blank');
      form.reset();
    });
  }

  /**
   * 4. VIDEO MASTERCLASS PLAYER
   */
  function initVideoPlayer() {
    const tabs = document.querySelectorAll('.ns-video-tab-btn');
    const player = document.getElementById('nsMasterclassIframe');
    const titleEl = document.getElementById('nsVideoActiveTitle');
    const descEl = document.getElementById('nsVideoActiveDesc');

    if (!tabs || tabs.length === 0 || !player) return;

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const videoData = MASTERCLASS_VIDEOS[index] || MASTERCLASS_VIDEOS[0];
        if (titleEl) titleEl.textContent = videoData.title;
        if (descEl) descEl.textContent = videoData.desc;

        // In-page embedded video without bouncing out
        player.src = videoData.embedUrl;
      });
    });
  }

  /**
   * 5. KYP CATEGORY FILTER TABS
   */
  function initKypTabs() {
    const tabs = document.querySelectorAll('.ns-kyp-tab-btn');
    const cards = document.querySelectorAll('.ns-product-card');

    if (!tabs || tabs.length === 0) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.getAttribute('data-cat');
        cards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-product-cat') === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /**
   * 6. FAQ ACCORDION TOGGLE
   */
  function initFaqAccordion() {
    const items = document.querySelectorAll('.ns-faq-item');
    items.forEach(item => {
      const q = item.querySelector('.ns-faq-question');
      if (!q) return;
      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        items.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  }

})(window, document);
