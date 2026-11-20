
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
  // 1. DATA LOADER (CENTRAL SERVER JSON SINGLE SOURCE OF TRUTH)
  // -------------------------------------------------------------
  async function loadToastsConfigAndItems() {
    let serverLoaded = false;
    try {
      const cacheBust = Date.now();
      const res = await fetch('/data/store-shelves-config.json?v=' + cacheBust);
      if (res.ok) {
        const json = await res.json();
        serverLoaded = true;
        if (json.toasts_config) {
          toastsConfig = { ...toastsConfig, ...json.toasts_config };
        }
        if (Array.isArray(json.live_toasts) && json.live_toasts.length > 0) {
          activeToastsList = json.live_toasts;
        }
        setupNativeBackgroundPushScheduler(json);
        try {
          localStorage.setItem('AAROGYAM_STORE_SHELVES_CONFIG', JSON.stringify(json));
        } catch (e) { }
      }
    } catch (e) {
      console.warn('[ToastEngine] Notice loading config from server:', e);
    }

    // Offline fallback only when server fetch fails
    if (!serverLoaded) {
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
    }

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
      <div class="ai-live-toast-inner" style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1.5px solid rgba(255, 255, 255, 0.12); border-left: 4px solid ${accentBorder}; border-radius: 12px; padding: 8px 10px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5); width: 288px; max-width: 86vw; box-sizing: border-box; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; position: relative;">
        
        <button type="button" class="ai-toast-close-btn" onclick="event.stopPropagation(); window.dismissLiveToast && window.dismissLiveToast();" style="position: absolute; top: 4px; right: 6px; background: transparent; border: none; color: #94a3b8; font-size: 1.05rem; line-height: 1; cursor: pointer; padding: 2px 4px;">&times;</button>
        
        <div style="display: flex; gap: 8px; align-items: flex-start;">
          <div style="width: 60px; height: 46px; min-width: 60px; border-radius: 6px; overflow: hidden; background: #0b1120; box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="${validImg}" alt="Thumb" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.src='/images/logo/logo.png';" />
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 2px;">
              <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.62rem; font-weight: 800; padding: 1.5px 6px; border-radius: 4px; letter-spacing: 0.2px; white-space: nowrap;">
                ${escBadge}
              </span>
              ${escPrice ? `<span style="font-weight: 900; color: #38bdf8; font-size: 0.76rem; margin-right: 14px;">${escPrice}</span>` : ''}
            </div>

            <div style="font-weight: 800; font-size: 0.78rem; color: #f8fafc; line-height: 1.2; margin-bottom: 2px; word-break: break-word;">
              ${escTitle}
            </div>

            <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.25; margin-bottom: 4px; word-break: break-word;">
              ${escMsg}
            </div>

            ${escCuriosityAnswer ? `
              <div id="curiosity_ans_box" style="display: none; background: rgba(168, 85, 247, 0.15); border: 1px dashed #a855f7; border-radius: 6px; padding: 4px 6px; font-size: 0.66rem; color: #e9d5ff; margin-bottom: 4px; line-height: 1.25;">
                💡 <strong>उत्तर:</strong> ${escCuriosityAnswer}
              </div>
            ` : ''}

            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-top: 3px;">
              ${escCuriosityAnswer ? `
                <button type="button" onclick="event.stopPropagation(); const el=this.closest('.ai-live-toast-inner').querySelector('#curiosity_ans_box'); if(el) el.style.display=el.style.display==='none'?'block':'none';" style="background: rgba(255,255,255,0.12); color: #e2e8f0; border: 1px solid rgba(255,255,255,0.2); font-size: 0.64rem; font-weight: 700; padding: 2px 6px; border-radius: 5px; cursor: pointer;">
                  💡 उत्तर देखें
                </button>
              ` : '<span></span>'}

              ${(type === 'sakhi_user_ask_toast' || type === 'sakhi_curiosity_toast') ? `
                <button type="button" onclick="event.stopPropagation(); window.openSakhiChatWithQuestion(decodeURIComponent('${encodedAskText}'))" style="background: ${accentBorder}; color: #000000; font-weight: 900; font-size: 0.66rem; padding: 3px 10px; border-radius: 18px; border:none; cursor:pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
                  ${escActionText}
                </button>
              ` : `
                <a href="${validUrl}" style="background: ${accentBorder}; color: #000000; font-weight: 800; font-size: 0.66rem; padding: 3px 9px; border-radius: 18px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); white-space: nowrap;">
                  ${escActionText}
                </a>
              `}
            </div>
          </div>
        </div>

        <div class="ai-live-toast-progress" style="position: absolute; bottom: 0; left: 0; height: 2.5px; background: linear-gradient(90deg, ${accentBorder}, #38bdf8); width: 100%; transition: width ${toastsConfig.display_duration_seconds || 6}s linear; border-radius: 0 0 12px 12px;"></div>
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
  // Zero Egress Client-Side Native Notifications (Diwali Time-Queue Pattern)
  // -------------------------------------------------------------
  function setupNativeBackgroundPushScheduler(shelvesData) {
    if (typeof window === 'undefined') return;

    const pushConfig = shelvesData?.mobile_push_config || {};
    // Check if push is globally paused / turned OFF by admin
    if (pushConfig.enabled === false) return;

    const pushQueue = shelvesData?.active_mobile_push_queue || [];
    if (!Array.isArray(pushQueue) || pushQueue.length === 0) return;

    const intervalHours = pushConfig.interval_hours !== undefined ? pushConfig.interval_hours : 3;
    const intervalMs = (intervalHours <= 0 ? 0 : intervalHours * 3600 * 1000);
    const now = Date.now();

    // Check validity / expiration
    const dispatchedAt = pushConfig.dispatched_at ? new Date(pushConfig.dispatched_at).getTime() : now;
    if (dispatchedAt > 0 && pushConfig.validity_hours > 0) {
      const ageMs = now - dispatchedAt;
      if (ageMs > pushConfig.validity_hours * 3600 * 1000) {
        // Expired notification batch
        return;
      }
    }

    // Calculate how many toasts in the queue are eligible right now according to the timeline
    let eligibleCount = 1;
    if (intervalMs > 0 && dispatchedAt > 0 && now >= dispatchedAt) {
      const elapsedMs = now - dispatchedAt;
      eligibleCount = Math.floor(elapsedMs / intervalMs) + 1;
    } else if (intervalMs <= 0) {
      eligibleCount = pushQueue.length;
    }
    eligibleCount = Math.max(1, Math.min(eligibleCount, pushQueue.length));

    // Populate all eligible past & current toasts into the Bell Notification Panel with their exact scheduled timestamps
    try {
      const log = JSON.parse(localStorage.getItem('AAROGYAM_DISPATCHED_TOASTS_LOG') || '[]');
      const logMap = new Map();
      log.forEach(item => { if (item && item.id) logMap.set(item.id, item); });

      for (let i = 0; i < eligibleCount; i++) {
        const t = pushQueue[i];
        if (!t) continue;
        const toastTime = intervalMs > 0 ? (dispatchedAt + (i * intervalMs)) : dispatchedAt;
        if (!logMap.has(t.id)) {
          logMap.set(t.id, {
            ...t,
            dispatchedAt: Math.min(toastTime, now)
          });
        }
      }
      const updatedLog = Array.from(logMap.values()).sort((a, b) => (b.dispatchedAt || 0) - (a.dispatchedAt || 0)).slice(0, 25);
      localStorage.setItem('AAROGYAM_DISPATCHED_TOASTS_LOG', JSON.stringify(updatedLog));
      if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.syncPushedToasts === 'function') {
        window.USER_NOTIFICATIONS.syncPushedToasts();
      }
    } catch (e) { }

    // Fire the latest eligible toast natively on the device screen if permission granted and not already shown
    const latestToast = pushQueue[eligibleCount - 1];
    const STORAGE_LAST_PUSH = 'AAROGYAM_LAST_NATIVE_PUSH_TS';
    const lastNativeId = localStorage.getItem('AAROGYAM_LAST_NATIVE_TOAST_ID');

    if (latestToast && latestToast.id !== lastNativeId) {
      localStorage.setItem('AAROGYAM_LAST_NATIVE_TOAST_ID', latestToast.id);
      localStorage.setItem(STORAGE_LAST_PUSH, String(now));
      if ('Notification' in window && Notification.permission === 'granted') {
        dispatchNativeToastAlert(latestToast);
      }
    }

    // Schedule next upcoming toast if queue has remaining items
    if (eligibleCount < pushQueue.length && intervalMs > 0) {
      const nextTime = dispatchedAt + (eligibleCount * intervalMs);
      const waitMs = nextTime - now;
      if (waitMs > 0 && waitMs <= 24 * 3600 * 1000) {
        setTimeout(() => {
          setupNativeBackgroundPushScheduler(shelvesData);
        }, waitMs);
      }
    }
  }

  function dispatchNativeToastAlert(toast) {
    if (!toast) return;
    try {
      const notifIcon = toast.image || '/images/icons/pwa-icon-192x192.png';
      const wideBanner = toast.image || undefined;

      // Log this specifically dispatched toast so Bell list has accurate real-world timestamps
      try {
        const log = JSON.parse(localStorage.getItem('AAROGYAM_DISPATCHED_TOASTS_LOG') || '[]');
        const entry = {
          ...toast,
          dispatchedAt: Date.now()
        };
        const updatedLog = [entry, ...log.filter(x => x.id !== toast.id)].slice(0, 20);
        localStorage.setItem('AAROGYAM_DISPATCHED_TOASTS_LOG', JSON.stringify(updatedLog));
        if (window.USER_NOTIFICATIONS && typeof window.USER_NOTIFICATIONS.syncPushedToasts === 'function') {
          window.USER_NOTIFICATIONS.syncPushedToasts();
        }
      } catch (e) { }

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          if (reg && reg.showNotification) {
            reg.showNotification(toast.title || 'आरोग्यम इंडिया 🌾', {
              body: toast.message || '',
              icon: notifIcon,
              badge: '/images/icons/pwa-icon-96x96.png',
              image: wideBanner,
              tag: 'aarogyam_live_toast',
              renotify: true,
              vibrate: [200, 100, 200],
              data: {
                url: toast.action_url || '/'
              }
            });
          }
        }).catch(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(toast.title || 'आरोग्यम इंडिया 🌾', {
              body: toast.message || '',
              icon: notifIcon,
              image: wideBanner,
              tag: 'aarogyam_live_toast'
            });
          }
        });
        return;
      }
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(toast.title || 'आरोग्यम इंडिया 🌾', {
          body: toast.message || '',
          icon: notifIcon,
          image: wideBanner,
          tag: 'aarogyam_live_toast'
        });
      }
    } catch (e) { }
  }

  // -------------------------------------------------------------
  // 7.1 UNIVERSAL CENTER PUSH PERMISSION PROMPT (ALL SITE PAGES)
  // -------------------------------------------------------------
  function ensureWebPushPermissionPrompt() {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted') return;
      if (window.location.pathname.includes('/admin/')) return;

      const showModal = () => {
        if (Notification.permission === 'granted') return;
        if (document.getElementById('ai-push-permission-modal-wrap')) return;

        const backdrop = document.createElement('div');
        backdrop.id = 'ai-push-permission-modal-wrap';
        backdrop.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          padding: 16px;
        `;

        backdrop.innerHTML = `
          <div id="aiPushModalCard" style="background: #ffffff; color: #0f172a; border-radius: 20px; border: 2.5px solid #22c55e; box-shadow: 0 25px 60px rgba(0,0,0,0.45); max-width: 400px; width: 100%; padding: 22px 18px; text-align: center; font-family: system-ui, -apple-system, sans-serif; position: relative; cursor: pointer; user-select: none;">
            
            <button type="button" id="btnAiPushCloseX" title="बंद करें" style="position: absolute; top: 10px; right: 12px; background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; line-height: 1; padding: 4px 8px; z-index: 10;">&times;</button>

            <div style="width: 52px; height: 52px; border-radius: 50%; background: rgba(34, 197, 94, 0.15); border: 2px solid #22c55e; display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(34,197,94,0.25);">
              🔔
            </div>

            <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; font-weight: 900; color: #0f172a; line-height: 1.3;">
              🌾 फसल सुरक्षा, मौसम व स्वास्थ्य अलर्ट्स
            </h3>

            <p style="margin: 0 0 14px 0; font-size: 0.78rem; color: #475569; line-height: 1.35;">
              आरोग्यम इंडिया की ताज़ा सलाह, बीमारी रोकथाम व विशेष ऑफर्स सीधे अपने मोबाइल पर तुरंत पाएं:
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; margin-bottom: 16px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #1e293b; margin-bottom: 7px;">
                <span style="color: #16a34a; font-weight: 900; font-size: 1rem; line-height: 1;">✔</span>
                <span><strong>मौसम, बारिश व पाले की सटीक लाइव चेतावनी</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #1e293b; margin-bottom: 7px;">
                <span style="color: #16a34a; font-weight: 900; font-size: 1rem; line-height: 1;">✔</span>
                <span><strong>फसल रोग, कीट व स्प्रे का सही वैज्ञानिक समय</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #1e293b; margin-bottom: 7px;">
                <span style="color: #16a34a; font-weight: 900; font-size: 1rem; line-height: 1;">✔</span>
                <span><strong>दुधारू पशुओं में दूध व फैट वृद्धि के घरेलू उपाय</strong></span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #1e293b;">
                <span style="color: #16a34a; font-weight: 900; font-size: 1rem; line-height: 1;">✔</span>
                <span><strong>सखी AI डॉक्टर व नई ई-बुक्स के विशेष डिस्काउंट</strong></span>
              </div>
            </div>

            <button type="button" id="btnAiPushAllow" style="width: 100%; background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; border: none; border-radius: 12px; padding: 12px; font-size: 0.95rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(22,163,74,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 6px;">
              <span>🔔</span> <span>सूचनाएं चालू करें (Allow Notifications)</span>
            </button>

            <div style="font-size: 0.72rem; color: #16a34a; font-weight: 700; margin-bottom: 6px;">
              👆 कार्ड पर कहीं भी क्लिक करके सीधे चालू करें
            </div>

            <button type="button" id="btnAiPushDeny" style="background: transparent; border: none; color: #64748b; font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 4px;">
              बाद में याद दिलाएं (Remind Later)
            </button>
          </div>
        `;

        document.body.appendChild(backdrop);

        const closeAndSnooze = (e) => {
          if (e) e.stopPropagation();
          backdrop.remove();
          setTimeout(showModal, 60000);
        };

        const requestAndAllow = async () => {
          backdrop.remove();
          try {
            const res = await Notification.requestPermission();
            if (res === 'granted') {
              // Immediately fire first toast from push queue on mobile phone!
              let firstToast = activeToastsList[0];
              try {
                const localShelves = JSON.parse(localStorage.getItem('AAROGYAM_STORE_SHELVES_CONFIG') || '{}');
                if (localShelves?.active_mobile_push_queue?.length > 0) {
                  firstToast = localShelves.active_mobile_push_queue[0];
                }
              } catch(e) {}
              if (firstToast) {
                dispatchNativeToastAlert(firstToast);
              }
              // Initialize native push scheduler
              let shelvesData = null;
              try {
                shelvesData = JSON.parse(localStorage.getItem('AAROGYAM_STORE_SHELVES_CONFIG') || 'null');
              } catch (e) { }
              if (shelvesData) {
                setupNativeBackgroundPushScheduler(shelvesData);
              }
            } else {
              setTimeout(showModal, 60000);
            }
          } catch (e) { }
        };

        document.getElementById('btnAiPushCloseX')?.addEventListener('click', closeAndSnooze);
        document.getElementById('btnAiPushDeny')?.addEventListener('click', closeAndSnooze);

        // Clicking anywhere on card triggers permission allow
        document.getElementById('aiPushModalCard')?.addEventListener('click', (e) => {
          if (e.target.closest('#btnAiPushCloseX') || e.target.closest('#btnAiPushDeny')) {
            return;
          }
          requestAndAllow();
        });
      };

      setTimeout(showModal, 3500);
    } catch(err) {}
  }

  // -------------------------------------------------------------
  // 8. INITIALIZE ENGINE & REAL-TIME MULTI-DEVICE BACKGROUND SYNC
  // -------------------------------------------------------------
  async function init() {
    await loadToastsConfigAndItems();
    startToastStream();
    ensureWebPushPermissionPrompt();

    // Real-Time Multi-Device Sync: Auto-detects pushes when user unlocks phone or tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        loadToastsConfigAndItems();
      }
    });

    // Check periodically for fresh pushes from admin across all active mobile clients
    setInterval(loadToastsConfigAndItems, 45000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
