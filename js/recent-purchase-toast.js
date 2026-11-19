
  window.openSakhiChatWithQuestion = function(question) {
    if (window.AarogyamAiProfileBrain) {
      window.AarogyamAiProfileBrain.recordInteraction('sakhi_question_ask', 'toast_trigger', { question });
    }
    if (window.AarogyamSakhiChat && typeof window.AarogyamSakhiChat.openWithQuestion === 'function') {
      window.AarogyamSakhiChat.openWithQuestion(question);
      return;
    }
    // Check if Sakhi floating button or chat drawer exists
    const sakhiBtn = document.getElementById('sakhi-chat-btn') || document.querySelector('.floating-sakhi-btn');
    if (sakhiBtn) {
      sakhiBtn.click();
      return;
    }
    if (typeof window.openUniversalDrawer === 'function') {
      window.openUniversalDrawer();
      return;
    }
    // Fallback: alert/navigate to Sakhi
    window.location.href = '/ebooks/agriculture.html#sakhi';
  };

/**
 * ====================================================================
 * AAROGYAM INDIA — DYNAMIC SOCIAL PROOF & MULTI-TYPE TOAST ENGINE
 * Version: 4.0 (Full Dynamic Admin Controlled + 5 Toast Types)
 * Supports:
 *  1. book_sell_toast      - Recent verified book purchase
 *  2. user_sell_toast      - VIP Member join / Referral Reward
 *  3. sakhi_user_ask_toast - Live farmer asking Sakhi AI
 *  4. sakhi_curiosity_toast - "क्या आप जानते हैं?" curiosity teaser + answer
 *  5. webpage_toast        - Contextual solution links (dental, milk yield, etc.)
 * ====================================================================
 */

(function (window, document) {
  'use strict';

  // -------------------------------------------------------------
  // SECURITY & SANITIZATION HELPERS
  // -------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(url) {
    if (!url) return '#';
    const trimmed = String(url).trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('#')) {
      return escapeHtml(trimmed);
    }
    return '#';
  }

  let toastsConfig = {
    enabled: true,
    interval_seconds: 30,
    display_duration_seconds: 6,
    position: 'bottom_left',
    animation: 'slide_up',
    types_enabled: {
      book_sell_toast: true,
      user_sell_toast: true,
      sakhi_user_ask_toast: true,
      sakhi_curiosity_toast: true,
      webpage_toast: true
    }
  };

  let activeToastsList = [];
  let toastIndex = 0;
  let toastTimer = null;
  let isStreamRunning = false;
  let sessionToastCount = 0;
  const MAX_SESSION_TOASTS = 30;

  // -------------------------------------------------------------
  // 1. DATA LOADER (JSON + LOCALSTORAGE OVERRIDES)
  // -------------------------------------------------------------
  async function loadToastsConfigAndItems() {
    try {
      const cacheBust = Date.now();
      const res = await fetch('/data/store-shelves-config.json?v=' + cacheBust);
      if (res.ok) {
        const json = await res.json();
        if (json.toasts_config) {
          toastsConfig = { ...toastsConfig, ...json.toasts_config };
        }
        if (Array.isArray(json.live_toasts) && json.live_toasts.length > 0) {
          activeToastsList = json.live_toasts;
        }
        setupNativeBackgroundPushScheduler(json);
      }
    } catch (e) {
      console.warn('[ToastEngine] Notice loading config from server:', e);
    }

    // Check localStorage overrides from Admin Panel
    try {
      const localShelves = JSON.parse(localStorage.getItem('AAROGYAM_STORE_SHELVES_CONFIG') || 'null');
      if (localShelves) {
        if (localShelves.toasts_config) toastsConfig = { ...toastsConfig, ...localShelves.toasts_config };
        if (Array.isArray(localShelves.live_toasts) && localShelves.live_toasts.length > 0) {
          activeToastsList = localShelves.live_toasts;
        }
        setupNativeBackgroundPushScheduler(localShelves);
      }
    } catch (e) { }

    // Fallback if list is empty
    if (activeToastsList.length === 0) {
      activeToastsList = [
        {
          id: 'tst_fallback_1',
          type: 'book_sell_toast',
          title: 'सुरेश पटेल (उज्जैन, MP)',
          message: 'ने अभी-अभी "लहसुन मास्टर गाइड" खरीदी!',
          price: '₹99',
          image: '/images/books/sub001-cover.webp',
          action_text: '📖 विवरण देखें',
          action_url: '/ebooks/book-landing.html?id=BK016',
          badge: '🛒 सफल खरीद',
          enabled: true
        },
        {
          id: 'tst_fallback_2',
          type: 'sakhi_curiosity_toast',
          title: '🌾 क्या आप जानते हैं?',
          message: 'गलत समय पर किया गया स्प्रे 40% तक दवा को बेअसर कर देता है। जानें स्प्रे का सही वैज्ञानिक समय!',
          image: '/images/sakhi/aarogyam-sakhi.webp',
          action_text: '🧪 सही समय जानें',
          action_url: '/ebooks/book-landing.html?id=BK016',
          badge: '💡 कृषि रहस्य',
          enabled: true
        }
      ];
    }
  }

  // -------------------------------------------------------------
  // 2. TOAST CARD HTML GENERATOR (FOR SITE & ADMIN PREVIEW)
  // -------------------------------------------------------------
  window.renderLiveToastCardHtml = function (toast) {
    if (!toast) return '';
    const type = toast.type || 'book_sell_toast';
    const title = toast.title || 'आरोग्यम सूचना';
    const msg = toast.message || '';
    const badge = toast.badge || (
      type === 'book_sell_toast' ? '🛒 सफल खरीद' :
      type === 'user_sell_toast' ? '👑 VIP मेंबर' :
      type === 'sakhi_user_ask_toast' ? '⚡ सखी AI लाइव' :
      type === 'sakhi_curiosity_toast' ? '💡 क्या आप जानते हैं?' : '🌿 समाधान'
    );
    const img = toast.image || '/images/logo/logo.png';
    const actionText = toast.action_text || '👉 विवरण देखें';
    const actionUrl = toast.action_url || '#';
    const price = toast.price || '';
    const curiosityAnswer = toast.curiosity_answer || '';

    // Color accents based on type
    let accentBorder = '#10b981';
    let badgeBg = 'rgba(16, 185, 129, 0.18)';
    let badgeColor = '#34d399';

    if (type === 'user_sell_toast') {
      accentBorder = '#f59e0b';
      badgeBg = 'rgba(245, 158, 11, 0.2)';
      badgeColor = '#fbbf24';
    } else if (type === 'sakhi_user_ask_toast') {
      accentBorder = '#38bdf8';
      badgeBg = 'rgba(56, 189, 248, 0.2)';
      badgeColor = '#38bdf8';
    } else if (type === 'sakhi_curiosity_toast') {
      accentBorder = '#a855f7';
      badgeBg = 'rgba(168, 85, 247, 0.2)';
      badgeColor = '#c084fc';
    } else if (type === 'webpage_toast') {
      accentBorder = '#14b8a6';
      badgeBg = 'rgba(20, 184, 166, 0.2)';
      badgeColor = '#2dd4bf';
    }

    const escTitle = escapeHtml(title);
    const escMsg = escapeHtml(msg);
    const escBadge = escapeHtml(badge);
    const escPrice = escapeHtml(price);
    const escActionText = escapeHtml(actionText);
    const validUrl = safeUrl(actionUrl);
    const escCuriosityAnswer = escapeHtml(curiosityAnswer);
    const validImg = safeUrl(img);
    const encodedAskText = encodeURIComponent(toast.message || toast.title || '');

    return `
      <div class="ai-live-toast-inner" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1.5px solid rgba(255, 255, 255, 0.12); border-left: 4.5px solid ${accentBorder}; border-radius: 14px; padding: 10px 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); width: 320px; max-width: 90vw; box-sizing: border-box; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; position: relative;">
        
        <button type="button" class="ai-toast-close-btn" onclick="event.stopPropagation(); window.dismissLiveToast && window.dismissLiveToast();" style="position: absolute; top: 6px; right: 8px; background: transparent; border: none; color: #94a3b8; font-size: 1.2rem; line-height: 1; cursor: pointer; padding: 2px 6px;">&times;</button>
        
        <div style="display: flex; gap: 10px; align-items: flex-start;">
          <div style="width: 68px; height: 52px; min-width: 68px; border-radius: 8px; overflow: hidden; background: #0b1120; box-shadow: 0 3px 8px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${validImg}" alt="Thumb" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/images/logo/logo.png';" />
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 3px;">
              <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.68rem; font-weight: 800; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.3px; white-space: nowrap;">
                ${escBadge}
              </span>
              ${escPrice ? `<span style="font-weight: 900; color: #38bdf8; font-size: 0.84rem; margin-right: 18px;">${escPrice}</span>` : ''}
            </div>

            <div style="font-weight: 800; font-size: 0.85rem; color: #f8fafc; line-height: 1.25; margin-bottom: 3px; word-break: break-word;">
              ${escTitle}
            </div>

            <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.3; margin-bottom: 6px; word-break: break-word;">
              ${escMsg}
            </div>

            ${escCuriosityAnswer ? `
              <div id="curiosity_ans_box" style="display: none; background: rgba(168, 85, 247, 0.15); border: 1px dashed #a855f7; border-radius: 6px; padding: 6px 8px; font-size: 0.72rem; color: #e9d5ff; margin-bottom: 6px; line-height: 1.3;">
                💡 <strong>उत्तर:</strong> ${escCuriosityAnswer}
              </div>
            ` : ''}

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 4px;">
              ${escCuriosityAnswer ? `
                <button type="button" onclick="event.stopPropagation(); const el=this.closest('.ai-live-toast-inner').querySelector('#curiosity_ans_box'); if(el) el.style.display=el.style.display==='none'?'block':'none';" style="background: rgba(255,255,255,0.12); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; cursor: pointer;">
                  💡 उत्तर देखें
                </button>
              ` : '<span></span>'}

              ${(type === 'sakhi_user_ask_toast' || type === 'sakhi_curiosity_toast') ? `
                <button type="button" onclick="event.stopPropagation(); window.openSakhiChatWithQuestion(decodeURIComponent('${encodedAskText}'))" style="background: ${accentBorder}; color: #000000; font-weight: 900; font-size: 0.72rem; padding: 4px 12px; border-radius: 20px; border:none; cursor:pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); white-space: nowrap;">
                  ${escActionText}
                </button>
              ` : `
                <a href="${validUrl}" style="background: ${accentBorder}; color: #000000; font-weight: 800; font-size: 0.72rem; padding: 4px 10px; border-radius: 20px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
                  ${escActionText}
                </a>
              `}
            </div>
          </div>
        </div>

        <div class="ai-live-toast-progress" style="position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, ${accentBorder}, #38bdf8); width: 100%; transition: width ${toastsConfig.display_duration_seconds || 6}s linear; border-radius: 0 0 14px 14px;"></div>
      </div>
    `;
  };

  // -------------------------------------------------------------
  // 3. ADMIN PANEL REAL-TIME PREVIEW METHOD
  // -------------------------------------------------------------
  window.renderLiveToastPreview = function (toast, targetEl) {
    if (!targetEl) return;
    targetEl.innerHTML = window.renderLiveToastCardHtml(toast);
  };

  // -------------------------------------------------------------
  // 4. DISPLAY CONTROLLER & ANIMATOR
  // -------------------------------------------------------------
  function createToastContainer() {
    let container = document.getElementById('ai-universal-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ai-universal-toast-container';
      document.body.appendChild(container);
    }

    const pos = toastsConfig.position || 'bottom_left';
    container.style.cssText = `
      position: fixed;
      ${pos === 'bottom_right' ? 'right: 18px;' : 'left: 18px;'}
      bottom: 74px;
      z-index: 99999;
      pointer-events: auto;
      transition: all 0.3s ease;
    `;
    return container;
  }

  window.dismissLiveToast = function () {
    const container = document.getElementById('ai-universal-toast-container');
    if (container) container.innerHTML = '';
  };

  function showNextToast() {
    if (sessionStorage.getItem('AI_TOAST_DISMISSED') === 'true') return;
    if (!toastsConfig.enabled) return;

    // Filter enabled types
    const enabledTypes = toastsConfig.types_enabled || {};
    const validPool = activeToastsList.filter(t => t && t.enabled !== false && (enabledTypes[t.type] !== false));
    if (validPool.length === 0) return;

    const toastData = validPool[toastIndex % validPool.length];
    toastIndex++;
    sessionToastCount++;

    const container = createToastContainer();
    container.innerHTML = window.renderLiveToastCardHtml(toastData);

    const card = container.firstElementChild;
    if (!card) return;

    // Apply animation style
    const anim = toastsConfig.animation || 'slide_up';
    if (anim === 'fade') {
      card.style.opacity = '0';
      card.style.transition = 'opacity 0.4s ease';
      requestAnimationFrame(() => card.style.opacity = '1');
    } else if (anim === 'bounce') {
      card.style.transform = 'scale(0.7) translateY(40px)';
      card.style.opacity = '0';
      card.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease';
      requestAnimationFrame(() => {
        card.style.transform = 'scale(1) translateY(0)';
        card.style.opacity = '1';
      });
    } else if (anim === 'glass_glow') {
      card.style.transform = 'translateY(20px)';
      card.style.opacity = '0';
      card.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.6)';
      card.style.transition = 'all 0.4s ease';
      requestAnimationFrame(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      });
    } else {
      // default: slide_up
      card.style.transform = 'translateY(100px)';
      card.style.opacity = '0';
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease';
      requestAnimationFrame(() => {
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
      });
    }

    // Trigger progress bar
    const bar = card.querySelector('.ai-live-toast-progress');
    if (bar) {
      requestAnimationFrame(() => bar.style.width = '0%');
    }

    // Notify Profile Brain of Toast Impression
    if (window.AarogyamAiProfileBrain) {
      window.AarogyamAiProfileBrain.recordInteraction('toast_impression', toastData.type, toastData);
    }

    // Card click event
    card.onclick = (e) => {
      if (e.target.closest('.ai-toast-close-btn') || e.target.closest('#curiosity_ans_box') || e.target.tagName === 'BUTTON') {
        return;
      }
      if (window.AarogyamAiProfileBrain) {
        window.AarogyamAiProfileBrain.recordInteraction('toast_click', toastData.type, toastData);
      }
      if (toastData.type === 'sakhi_user_ask_toast' || toastData.type === 'sakhi_curiosity_toast') {
        window.openSakhiChatWithQuestion(toastData.message || toastData.title);
        return;
      }
      if (toastData.action_url && toastData.action_url !== '#') {
        window.location.href = toastData.action_url;
      }
    };

    // Auto dismiss after display duration
    const durationMs = (toastsConfig.display_duration_seconds || 6) * 1000;
    setTimeout(() => {
      if (card && card.parentElement) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(40px)';
        setTimeout(() => {
          if (container && container.contains(card)) {
            container.removeChild(card);
          }
        }, 400);
      }
    }, durationMs);
  }

  // -------------------------------------------------------------
  // 5. STREAM LIFECYCLE CONTROLLER
  // -------------------------------------------------------------
  function startToastStream() {
    if (isStreamRunning) return;
    isStreamRunning = true;

    // Suppress popups on reader and checkout
    const path = window.location.pathname.toLowerCase();
    if (path.includes('reader') || path.includes('checkout') || path.includes('payment')) {
      return;
    }

    const intervalSeconds = Math.max(10, parseInt(toastsConfig.interval_seconds, 10) || 30);

    // First toast after 10 seconds
    setTimeout(() => {
      showNextToast();
      toastTimer = setInterval(() => {
        if (sessionToastCount >= MAX_SESSION_TOASTS) {
          clearInterval(toastTimer);
          return;
        }
        showNextToast();
      }, intervalSeconds * 1000);
    }, 12000);
  }

  // -------------------------------------------------------------
  // 6. REAL-TIME PURCHASE EVENT RECEIVER
  // -------------------------------------------------------------
  window.recordLivePurchaseToast = function (orderData) {
    if (!orderData) return;
    const newToast = {
      id: 'live_' + Date.now(),
      type: 'book_sell_toast',
      title: `${orderData.userName || 'किसान साथी'} (${orderData.city || 'भारत'})`,
      message: `ने अभी-अभी '${orderData.bookTitle || 'डिजिटल गाइड'}' खरीदी!`,
      price: orderData.price ? `₹${orderData.price}` : '₹99',
      image: orderData.cover || '/images/books/kharif-master-guide-2026-cover.webp',
      action_text: '📖 विवरण देखें',
      action_url: orderData.landingUrl || '/ebooks/ebook.html',
      badge: '🛒 सफल खरीद',
      enabled: true
    };
    activeToastsList.unshift(newToast);
    // Show immediately
    showNextToast();
  };

  // -------------------------------------------------------------
  // 7. NATIVE BACKGROUND MOBILE PUSH QUEUE RUNNER
  // Zero Egress Client-Side Native Notifications
  // -------------------------------------------------------------
  function setupNativeBackgroundPushScheduler(shelvesData) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const pushConfig = shelvesData?.mobile_push_config || {};
    // Check if push is globally paused / turned OFF by admin
    if (pushConfig.enabled === false) return;

    const pushQueue = shelvesData?.active_mobile_push_queue || [];
    if (!Array.isArray(pushQueue) || pushQueue.length === 0) return;

    const intervalHours = pushConfig.interval_hours !== undefined ? pushConfig.interval_hours : 3;
    const intervalMs = (intervalHours <= 0 ? 0 : intervalHours * 3600 * 1000);

    const now = Date.now();

    // Check validity / expiration
    const dispatchedAt = pushConfig.dispatched_at ? new Date(pushConfig.dispatched_at).getTime() : 0;
    if (dispatchedAt > 0 && pushConfig.validity_hours > 0) {
      const ageMs = now - dispatchedAt;
      if (ageMs > pushConfig.validity_hours * 3600 * 1000) {
        // Expired notification batch
        return;
      }
    }

    const STORAGE_LAST_PUSH = 'AAROGYAM_LAST_NATIVE_PUSH_TS';
    const lastPushTs = parseInt(localStorage.getItem(STORAGE_LAST_PUSH) || '0', 10);

    // Immediate first push on subscription or when interval expires
    const isDue = (lastPushTs === 0) || (intervalMs === 0 && (now - lastPushTs > 60000)) || (now - lastPushTs >= intervalMs);

    if (isDue) {
      // Pick best toast matching AI User Intent
      let selectedToast = null;
      if (window.AarogyamAiProfileBrain && typeof window.AarogyamAiProfileBrain.getState === 'function') {
        const brainState = window.AarogyamAiProfileBrain.getState();
        const dominant = brainState?.dominant_domain || 'agri';
        
        // Match with dominant domain
        selectedToast = pushQueue.find(t => {
          if (!t) return false;
          if (dominant === 'agri' && (t.type === 'book_sell_toast' || t.title?.includes('फसल') || t.title?.includes('कृषि'))) return true;
          if (dominant === 'business' && (t.type === 'user_sell_toast' || t.title?.includes('VIP') || t.title?.includes('कॉम्बो'))) return true;
          if (dominant === 'health' && (t.type === 'webpage_toast' || t.title?.includes('दूध') || t.title?.includes('पशु'))) return true;
          return false;
        });
      }

      if (!selectedToast) {
        // Fallback: Pick rotational toast
        const pushIndex = parseInt(localStorage.getItem('AAROGYAM_NATIVE_PUSH_IDX') || '0', 10);
        selectedToast = pushQueue[pushIndex % pushQueue.length];
        localStorage.setItem('AAROGYAM_NATIVE_PUSH_IDX', String(pushIndex + 1));
      }

      if (selectedToast) {
        localStorage.setItem(STORAGE_LAST_PUSH, String(now));
        dispatchNativeToastAlert(selectedToast);
      }
    }
  }

  function dispatchNativeToastAlert(toast) {
    if (!toast) return;
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.showNotification) {
            reg.showNotification(toast.title || 'आरोग्यम इंडिया 🌾', {
              body: toast.message || '',
              icon: toast.image || '/images/icons/pwa-icon-192x192.png',
              badge: '/images/icons/pwa-icon-96x96.png',
              image: toast.image || undefined,
              tag: 'aarogyam_live_toast',
              renotify: true,
              vibrate: [200, 100, 200],
              data: {
                url: toast.action_url || '/'
              }
            });
          }
        });
        return;
      }
      new Notification(toast.title || 'आरोग्यम इंडिया 🌾', {
        body: toast.message || '',
        icon: toast.image || '/images/icons/pwa-icon-192x192.png',
        image: toast.image || undefined,
        tag: 'aarogyam_live_toast'
      });
    } catch(e) {}
  }

  // -------------------------------------------------------------
  // 8. INITIALIZE ENGINE
  // -------------------------------------------------------------
  async function init() {
    await loadToastsConfigAndItems();
    startToastStream();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
