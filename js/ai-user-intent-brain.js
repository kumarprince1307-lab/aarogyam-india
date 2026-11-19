/**
 * ====================================================================
 * AAROGYAM INDIA — AI USER INTENT & PROFILE BRAIN ENGINE
 * Version: 2.0 (Zero PII, Purchases Auto-Sync, Dynamic Intent Formula & Toast Integration)
 * 
 * Formula:
 * User Score = (Regular Interest * 0.5) + (Business Interest * 0.3) + (Exploratory/Health * 0.2)
 * Enhanced by verified purchase history from data/purchases.json and localStorage.
 * ====================================================================
 */

'use strict';

(function (window, document) {
  const STORAGE_PROFILE_KEY = 'AAROGYAM_AI_PROFILE_ID';
  const STORAGE_INTENT_KEY = 'AAROGYAM_AI_USER_INTENT_DATA';
  const STORAGE_PILLS_KEY = 'AAROGYAM_CACHED_ENGAGEMENT_PILLS';

  // -------------------------------------------------------------
  // 1. ANONYMOUS PROFILE ID GENERATOR (ZERO PII)
  // -------------------------------------------------------------
  function getOrCreateProfileId() {
    try {
      let pid = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (!pid) {
        const rand = Math.random().toString(36).substring(2, 10);
        const ts = Date.now().toString(36);
        pid = `AI_USER_${rand}_${ts}`;
        localStorage.setItem(STORAGE_PROFILE_KEY, pid);
      }
      return pid;
    } catch (e) {
      return 'AI_USER_GUEST';
    }
  }

  // -------------------------------------------------------------
  // 2. INTENT STATE INITIALIZER
  // -------------------------------------------------------------
  function loadIntentState() {
    const defaultState = {
      profile_id: getOrCreateProfileId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scores: {
        regular_interest: 0,   // Agriculture, Crops, Spray, Diseases
        business_interest: 0,  // Income, VIP Membership, Marketing, Resale
        exploratory_health: 0  // Health, Home Remedies, Dairy, Pashupalan
      },
      user_score: 0,
      dominant_domain: 'cold_start', // 'agri' | 'business' | 'health' | 'cold_start'
      buyer_tier: 'New Visitor',
      purchased_book_ids: [],
      topics_detected: [],
      recent_actions: [],
      interaction_count: 0
    };

    try {
      const saved = localStorage.getItem(STORAGE_INTENT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.scores) {
          return { ...defaultState, ...parsed };
        }
      }
    } catch (e) { }

    return defaultState;
  }

  let currentState = loadIntentState();

  // -------------------------------------------------------------
  // 3. INTENT SCORING FORMULA
  // -------------------------------------------------------------
  function calculateUserScore(scores) {
    const reg = Math.min(100, Math.max(0, scores.regular_interest || 0));
    const bus = Math.min(100, Math.max(0, scores.business_interest || 0));
    const hlt = Math.min(100, Math.max(0, scores.exploratory_health || 0));

    const total = (reg * 0.5) + (bus * 0.3) + (hlt * 0.2);
    return Math.round(total * 10) / 10;
  }

  function saveCurrentState() {
    try {
      currentState.user_score = calculateUserScore(currentState.scores);
      currentState.updated_at = new Date().toISOString();

      const { regular_interest: reg, business_interest: bus, exploratory_health: hlt } = currentState.scores;
      if (reg === 0 && bus === 0 && hlt === 0) {
        currentState.dominant_domain = 'cold_start';
      } else if (reg >= bus && reg >= hlt) {
        currentState.dominant_domain = 'agri';
      } else if (bus >= reg && bus >= hlt) {
        currentState.dominant_domain = 'business';
      } else {
        currentState.dominant_domain = 'health';
      }

      localStorage.setItem(STORAGE_INTENT_KEY, JSON.stringify(currentState));
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // 4. INTERACTION RECORDING ENGINE
  // -------------------------------------------------------------
  function recordInteraction(type, topic, metadata = {}) {
    if (!topic) return;
    const cleanTopic = String(topic).toLowerCase().trim();

    currentState.interaction_count++;

    if (!currentState.topics_detected.includes(cleanTopic)) {
      currentState.topics_detected.push(cleanTopic);
      if (currentState.topics_detected.length > 20) {
        currentState.topics_detected.shift();
      }
    }

    currentState.recent_actions.unshift({
      type,
      topic: cleanTopic,
      ts: new Date().toISOString()
    });
    if (currentState.recent_actions.length > 15) {
      currentState.recent_actions.pop();
    }

    // Weight allocation
    if (cleanTopic.includes('fasal') || cleanTopic.includes('crop') || cleanTopic.includes('spray') || cleanTopic.includes('kisan') || cleanTopic.includes('agri') || cleanTopic.includes('bk001') || cleanTopic.includes('bk002') || cleanTopic.includes('bk016')) {
      currentState.scores.regular_interest = Math.min(100, (currentState.scores.regular_interest || 0) + 12);
    } else if (cleanTopic.includes('vip') || cleanTopic.includes('sub001') || cleanTopic.includes('combo') || cleanTopic.includes('business') || cleanTopic.includes('kamai') || cleanTopic.includes('reward')) {
      currentState.scores.business_interest = Math.min(100, (currentState.scores.business_interest || 0) + 15);
    } else if (cleanTopic.includes('health') || cleanTopic.includes('nuskhe') || cleanTopic.includes('pashu') || cleanTopic.includes('dairy') || cleanTopic.includes('doodh') || cleanTopic.includes('sugar')) {
      currentState.scores.exploratory_health = Math.min(100, (currentState.scores.exploratory_health || 0) + 14);
    }

    saveCurrentState();
  }

  // -------------------------------------------------------------
  // 5. PURCHASES DATA AUTO-SYNC
  // Extract user purchases from data/purchases.json or LocalStorage
  // -------------------------------------------------------------
  async function syncWithPurchases() {
    try {
      let purchasedBooks = [];

      // Check localStorage purchases
      try {
        const localP = JSON.parse(localStorage.getItem('my_purchases') || localStorage.getItem('user_purchased_books') || '[]');
        if (Array.isArray(localP)) {
          purchasedBooks.push(...localP.map(x => typeof x === 'string' ? x : x.id));
        }
      } catch (e) { }

      // Check server purchases.json
      try {
        const res = await fetch('/data/purchases.json?v=' + Date.now());
        if (res.ok) {
          const srvData = await res.json();
          if (srvData && Array.isArray(srvData.books)) {
            srvData.books.forEach(b => { if (b && b.id) purchasedBooks.push(b.id); });
          }
        }
      } catch (e) { }

      // Deduplicate
      purchasedBooks = [...new Set(purchasedBooks.map(x => String(x).toUpperCase().trim()))];
      currentState.purchased_book_ids = purchasedBooks;

      if (purchasedBooks.length > 0) {
        if (purchasedBooks.includes('SUB001')) {
          currentState.buyer_tier = '👑 VIP All-Access Pro';
          currentState.scores.business_interest = Math.max(85, currentState.scores.business_interest || 0);
          currentState.scores.regular_interest = Math.max(80, currentState.scores.regular_interest || 0);
        } else if (purchasedBooks.length >= 3) {
          currentState.buyer_tier = '🏆 Champion Multi-Book Buyer';
          currentState.scores.regular_interest = Math.max(90, currentState.scores.regular_interest || 0);
        } else {
          currentState.buyer_tier = '📖 Active Verified Reader';
          currentState.scores.regular_interest = Math.max(60, currentState.scores.regular_interest || 0);
        }
      }

      saveCurrentState();
      refreshCachedPills();
    } catch (e) {
      console.warn('[AiProfileBrain] Purchases sync notice:', e);
    }
  }

  // -------------------------------------------------------------
  // 6. DYNAMIC ENGAGEMENT TOAST PILLS GENERATOR
  // -------------------------------------------------------------
  function refreshCachedPills() {
    const pills = [];
    const domain = currentState.dominant_domain;
    const tier = currentState.buyer_tier;

    if (tier.includes('VIP')) {
      pills.push({
        type: 'user_sell_toast',
        title: '👑 आपका VIP ऑल-एक्सेस सक्रिय है',
        message: 'सखी AI डॉक्टर व डिजिटल बही-खाता 365 दिन असीमित उपयोग के लिए तैयार है!',
        badge: '👑 VIP एक्टिव',
        action_text: '📚 लाइब्रेरी खोलें',
        action_url: '/ebooks/my-library.html'
      });
    }

    if (domain === 'agri' || domain === 'cold_start') {
      pills.push({
        type: 'book_sell_toast',
        title: '🌾 खरीफ 2026 व फसल डॉक्टर गाइड',
        message: '50+ कीट-रोग व स्प्रे फॉर्मूले के साथ अपनी फसल की लागत 50% कम करें।',
        badge: '🔥 सर्वाधिक लोकप्रिय',
        action_text: '📖 विवरण देखें',
        action_url: '/ebooks/book-landing.html?id=BK002'
      });
    }

    if (domain === 'health') {
      pills.push({
        type: 'webpage_toast',
        title: '🌿 प्राकृतिक घरेलू आयुर्वेदिक नुस्खे',
        message: 'दादी के 200+ सिद्ध व वैज्ञानिक घरेलू उपचार अब सखी AI पर उपलब्ध हैं।',
        badge: '🌿 स्वास्थ्य सलाह',
        action_text: '👉 नुस्खा देखें',
        action_url: '/aarogyam-sakhi.html'
      });
    }

    try {
      localStorage.setItem(STORAGE_PILLS_KEY, JSON.stringify(pills));
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // 7. AUTO-TRACKING SETUP
  // -------------------------------------------------------------
  function setupAutoTracking() {
    const path = window.location.pathname.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);

    if (path.includes('agriculture') || path.includes('crop-doctor')) {
      recordInteraction('page_view', 'agri_hub');
    } else if (path.includes('health')) {
      recordInteraction('page_view', 'health_wellness');
    } else if (path.includes('pashu-palan')) {
      recordInteraction('page_view', 'dairy_pashupalan');
    }

    const bId = urlParams.get('id');
    if (bId) {
      recordInteraction('book_view', bId);
    }
  }

  // -------------------------------------------------------------
  // 8. PUBLIC API EXPORTS
  // -------------------------------------------------------------
  window.AarogyamAiProfileBrain = {
    getProfileId: getOrCreateProfileId,
    getProfile: () => ({ ...currentState }),
    getScores: () => ({ ...currentState.scores, user_score: currentState.user_score }),
    getDominantDomain: () => currentState.dominant_domain,
    getBuyerTier: () => currentState.buyer_tier,
    recordInteraction,
    syncWithPurchases,
    getCachedPills: () => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_PILLS_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },
    resetProfile: () => {
      localStorage.removeItem(STORAGE_INTENT_KEY);
      localStorage.removeItem(STORAGE_PILLS_KEY);
      currentState = loadIntentState();
      return currentState;
    }
  };

  // Auto initialize and sync purchases
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupAutoTracking();
      syncWithPurchases();
    });
  } else {
    setupAutoTracking();
    syncWithPurchases();
  }

})(window, document);
