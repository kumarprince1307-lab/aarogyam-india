/**
 * ====================================================================
 * AAROGYAM INDIA - VIRAL WHATSAPP LEAD-GENERATION & SHARE ENGINE
 * Tracks referrers, pre-fills WhatsApp AI consultation messages with
 * lead attribution, and enables 1-click viral sharing across all pages.
 * ====================================================================
 */

(function () {
  const DEFAULT_WHATSAPP_NUMBER = '917974422572';

  // Extract or preserve referrer code from URL or storage
  function getReferrerId() {
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref') || params.get('r') || params.get('aff');
    if (ref) {
      localStorage.setItem('AOI_REFERRER_ID', ref.trim());
      return ref.trim();
    }
    return localStorage.getItem('AOI_REFERRER_ID') || '';
  }

  // Get current user's phone or ID to act as referrer
  function getCurrentUserRefId() {
    let ref = '';
    // 1. Authenticated user in session or localStorage (Top Priority)
    try {
      const u = (window.V1_SESSION && typeof window.V1_SESSION.getCurrentUser === 'function')
        ? window.V1_SESSION.getCurrentUser()
        : JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      if (u && (u.share_id || u.referral_code || u.mobile)) {
        ref = u.share_id || u.referral_code || u.mobile || '';
      }
    } catch (e) { }

    // 2. Global unified helper
    if (!ref && typeof window.getUnifiedShareId === 'function') {
      try {
        const s = window.getUnifiedShareId();
        if (s && s !== 'AI000004') ref = s;
      } catch (e) { }
    }
    if (!ref && typeof window.getUserShareId === 'function') {
      try {
        const s = window.getUserShareId();
        if (s && s !== 'AI000004') ref = s;
      } catch (e) { }
    }

    // 3. Authenticated mobile
    if (!ref) {
      const mob = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
      if (mob.length === 10) ref = mob;
    }

    // 4. Guest lead phone (only if no authenticated user)
    if (!ref) {
      try { ref = localStorage.getItem('aarogyam_user_phone') || ''; } catch (e) { }
    }

    if (!ref) {
      ref = getReferrerId();
    }
    return ref || 'AI000004';
  }

  // Build a personalized WhatsApp Inquiry URL with Lead Attribution
  function buildPersonalizedWhatsAppUrl(topicName, customMessage = '') {
    const refId = getCurrentUserRefId();
    let text = customMessage;

    if (!text) {
      text = `नमस्ते Aarogyam India! मुझे [${topicName || 'स्वास्थ्य व कृषि परामर्श'}] के बारे में जानकारी व समाधान चाहिए।`;
    }

    if (refId) {
      text += `\n(रेफरल / Ref Code: ${refId})`;
    }

    text += `\nवेबसाइट: ${window.location.href.split('?')[0]}`;
    return `https://wa.me/${DEFAULT_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }

  // Build a Shareable Referral Link for any page or custom path
  function buildShareableUrl(customPath = '') {
    let url = customPath ? (customPath.startsWith('http') ? customPath : (window.location.origin + (customPath.startsWith('/') ? customPath : '/' + customPath))) : window.location.href;
    const cleanUrl = url.split('?')[0];
    const myRef = getCurrentUserRefId();
    if (myRef) {
      return `${cleanUrl}?ref=${encodeURIComponent(myRef)}&share_id=${encodeURIComponent(myRef)}`;
    }
    return cleanUrl;
  }

  // Universal Share Trigger (Modal or Native WebShare)
  async function triggerShare(options = {}) {
    // 🔒 GUEST GATE: Check if user is logged in before allowing ANY share
    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          triggerShare(options);
        }, { force: false, source: 'UniversalShareGate' });
        return;
      }
    }

    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    let title = options.title || ogTitle || document.title || 'Aarogyam India';
    let text = options.text || ogDesc || 'Aarogyam India - सम्पूर्ण किसान व डिजिटल ज्ञान मंच:';
    const shareUrl = buildShareableUrl(options.url || '');

    // Pull CMS custom share message and OG title (Single Source of Truth)
    const activeCms = window.AAROGYAM_ACTIVE_PAGE_CMS;
    if (activeCms) {
      if (activeCms.share_message && !options.text) {
        text = activeCms.share_message;
      } else if (activeCms.og_description && !options.text) {
        text = activeCms.og_description;
      }
      if (activeCms.og_title && !options.title) {
        title = activeCms.og_title;
      }
    } else {
      try {
        const allPages = JSON.parse(localStorage.getItem('AAROGYAM_SITE_PAGES_CONFIG') || '[]');
        const curPath = window.location.pathname.toLowerCase();
        const match = allPages.find(p => p && p.url && curPath.endsWith(p.url.toLowerCase()));
        if (match) {
          if (match.share_message && !options.text) text = match.share_message;
          else if (match.og_description && !options.text) text = match.og_description;
          if (match.og_title && !options.title) title = match.og_title;
        }
      } catch (e) {}
    }

    const cleanTitle = (title || 'Aarogyam India').replace(/<[^>]+>/g, '').trim();
    const cleanText = (text || '').replace(/<[^>]+>/g, '').trim();
    const isAgri = window.location.pathname.includes('agriculture') || window.location.pathname.includes('crop');
    const headerPrefix = isAgri ? '🌾' : '✨';
    const fullShareMessage = (cleanText && cleanText.includes('http'))
      ? cleanText
      : `${headerPrefix} *${cleanTitle}*\n\n${cleanText ? cleanText + '\n\n' : ''}👉 सम्पूर्ण विवरण व समाधान यहाँ देखें:\n${shareUrl}`;

    // Delegate to unified 5-card modal from screenshot if universal drawer is loaded
    if (typeof window.openUniversalShareModal === 'function') {
      window.openUniversalShareModal({
        title: cleanTitle,
        text: cleanText,
        url: shareUrl
      });
      return;
    }

    // Direct fallback to 5-channel modal
    renderShareModal(cleanTitle, fullShareMessage, shareUrl);
  }

  function renderShareModal(title, text, shareUrl) {
    let overlay = document.getElementById('ai-share-drawer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ai-share-drawer-overlay';
      overlay.className = 'ai-share-drawer-overlay';
      document.body.appendChild(overlay);
    }

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    overlay.innerHTML = `
      <div class="ai-share-buttons-stack" id="ai-share-buttons-stack">
        <!-- 1. WhatsApp Button -->
        <a href="https://api.whatsapp.com/send?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-whatsapp" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('whatsapp','${shareUrl}','${title.replace(/'/g, "\\'")}'); overlay.style.display='none';">
          <div class="ai-share-icon-wrap" style="background:#25D366;color:#fff;">
            <i class="fa-brands fa-whatsapp"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>WhatsApp</strong>
            <span>किसान ग्रुप्स व दोस्तों को तुरंत मैसेज भेजें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 2. Facebook Button -->
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}" target="_blank" class="ai-share-btn-item ch-facebook" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('facebook','${shareUrl}','${title.replace(/'/g, "\\'")}'); overlay.style.display='none';">
          <div class="ai-share-icon-wrap" style="background:#1877F2;color:#fff;">
            <i class="fa-brands fa-facebook-f"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Facebook</strong>
            <span>फेसबुक फीड या मैसेंजर पर पोस्ट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 3. Twitter / X Button -->
        <a href="https://twitter.com/intent/tweet?text=${encodedText}" target="_blank" class="ai-share-btn-item ch-twitter" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('twitter','${shareUrl}','${title.replace(/'/g, "\\'")}'); overlay.style.display='none';">
          <div class="ai-share-icon-wrap" style="background:#000000;color:#fff;">
            <i class="fa-brands fa-x-twitter"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Twitter / X</strong>
            <span>ट्विटर पर पोस्ट या ट्वीट करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 4. Telegram Button -->
        <a href="https://t.me/share/url?url=${encodedUrl}&text=${encodedText}" target="_blank" class="ai-share-btn-item ch-telegram" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('telegram','${shareUrl}','${title.replace(/'/g, "\\'")}'); overlay.style.display='none';">
          <div class="ai-share-icon-wrap" style="background:#229ED9;color:#fff;">
            <i class="fa-brands fa-telegram"></i>
          </div>
          <div class="ai-share-btn-text">
            <strong>Telegram</strong>
            <span>टेलीग्राम ग्रुप व चैनल्स में शेयर करें</span>
          </div>
          <i class="fa-solid fa-chevron-right ai-share-arrow"></i>
        </a>

        <!-- 5. Copy Link Button -->
        <div class="ai-share-btn-item ch-copylink" id="ai-share-copy-row-btn" style="cursor:pointer;" onclick="if(window.recordModalShareEvent)window.recordModalShareEvent('copylink','${shareUrl}','${title.replace(/'/g, "\\'")}'); navigator.clipboard.writeText('${shareUrl}').then(()=>{ alert('📋 लिंक कॉपी हो गया!'); overlay.style.display='none'; });">
          <div class="ai-share-icon-wrap" style="background:#2563eb;color:#fff;">
            <i class="fa-solid fa-link"></i>
          </div>
          <div class="ai-share-btn-text" style="overflow:hidden;">
            <strong id="ai-share-copy-title">Copy Link</strong>
            <span style="font-family:monospace;font-size:0.72rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;">${shareUrl}</span>
          </div>
          <button type="button" class="ai-share-copy-badge" style="background:#2563eb;color:#fff;border:none;padding:6px 14px;border-radius:20px;font-weight:800;font-size:0.8rem;">
            📋 कॉपी करें
          </button>
        </div>
      </div>
    `;

    overlay.style.display = 'flex';
    setTimeout(() => { overlay.classList.add('active'); }, 10);
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { overlay.style.display = 'none'; }, 200);
      }
    };
  }

    function recordShareEvent(platform) {
      try {
        const shareId = getCurrentUserRefId();
        const event = {
          id: 'sh_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          share_id: shareId,
          platform: platform,
          title: title || document.title,
          page: window.location.pathname,
          url: shareUrl || window.location.href,
          timestamp: new Date().toISOString()
        };

        const shares = JSON.parse(localStorage.getItem('AOI_SHARE_TELEMETRY') || '[]');
        shares.unshift(event);
        if (shares.length > 300) shares.pop();
        localStorage.setItem('AOI_SHARE_TELEMETRY', JSON.stringify(shares));

        if (window.AarogyamTelemetry && typeof window.AarogyamTelemetry.trackEvent === 'function') {
          window.AarogyamTelemetry.trackEvent('page_share', event);
        }

        if (typeof fetch === 'function') {
          fetch('https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/rpc/increment_share_count', {
            method: 'POST',
            headers: {
              'apikey': 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU',
              'Authorization': 'Bearer sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ p_share_id: shareId, p_platform: platform, p_page: window.location.pathname })
          }).catch(() => {});
        }
      } catch (e) {}
    }

    // 1. WhatsApp Button Click
    const waBtn = document.getElementById('btnAoiWhatsAppShare');
    if (waBtn) {
      waBtn.onclick = () => {
        recordShareEvent('whatsapp');
        closeModal();
      };
    }

    // 2. Native Mobile WebShare Button Click
    const nativeBtn = document.getElementById('btnAoiNativeShare');
    if (nativeBtn) {
      nativeBtn.onclick = async () => {
        recordShareEvent('native');
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: shareUrl
            });
            closeModal();
            showShareToast('✅ सफलतापूर्वक शेयर किया गया!');
          } catch (err) {
            if (err.name !== 'AbortError') {
              window.open(waShareLink, '_blank');
              closeModal();
            }
          }
        } else {
          // If desktop without navigator.share, fallback to WhatsApp
          window.open(waShareLink, '_blank');
          closeModal();
        }
      };
    }

    // 3. Copy Link Button Click
    const copyBtn = document.getElementById('btnCopyShareUrl');
    if (copyBtn) {
      copyBtn.onclick = () => {
        recordShareEvent('copy_link');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl);
          } else {
            const tempInp = document.createElement('input');
            tempInp.value = shareUrl;
            document.body.appendChild(tempInp);
            tempInp.select();
            document.execCommand('copy');
            tempInp.remove();
          }
        } catch(e) {}
        const textSpan = document.getElementById('btnCopyShareText');
        if (textSpan) textSpan.textContent = '✔ लिंक कॉपी हो गया!';
        showShareToast('🔗 लिंक कॉपी हो गया!');
        setTimeout(() => {
          closeModal();
          if (textSpan) textSpan.textContent = 'लिंक कॉपी करें (Copy Link)';
        }, 800);
      };
    }
  }

  function showShareToast(msg) {
    let toast = document.getElementById('aoi-share-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'aoi-share-toast';
      toast.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
        background: #10b981; color: #fff; font-weight: 800; font-size: 0.9rem;
        padding: 10px 22px; border-radius: 30px; z-index: 9999999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5); opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
  }

  // ------------------------------------------------------------------
  // Referral Visitor First-Action Registration Prompt
  // When a visitor opens a shared link, allow viewing freely.
  // When they click any internal link or action, ask for quick registration.
  // ------------------------------------------------------------------
  function initReferralVisitorActionInterceptor() {
    const params = new URLSearchParams(window.location.search);
    const hasRef = params.has('ref') || params.has('r') || params.has('aff') || localStorage.getItem('AOI_REFERRER_ID');
    if (!hasRef) return;

    // Check if user is already logged in
    const checkLoggedIn = () => {
      if (window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') {
        return window.V1_SESSION.isLoggedIn();
      }
      if (typeof window.isUserLoggedIn === 'function') {
        return window.isUserLoggedIn();
      }
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('UCAS_USER') || '{}');
        if (u && (u.mobile || u.id)) return true;
        const aim = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
        if (aim.length === 10) return true;
        const s = JSON.parse(localStorage.getItem('aoi_user_session') || '{}');
        return !!(s.phone || s.mobile);
      } catch (e) {
        return false;
      }
    };

    if (checkLoggedIn()) return;

    let intercepted = false;
    document.addEventListener('click', function (e) {
      if (intercepted || checkLoggedIn()) return;
      const target = e.target.closest('a, button');
      if (!target) return;

      // Skip modals and share controls themselves
      if (target.closest('#aoi-viral-share-modal') ||
        target.closest('#user-review-modal') ||
        target.closest('#ai-universal-auth-modal') ||
        target.id === 'floating-audio-btn' ||
        target.id === 'closeAoiShareModal') {
        return;
      }

      const promptShown = sessionStorage.getItem('aoi_ref_prompt_shown');
      if (!promptShown) {
        intercepted = true;
        e.preventDefault();
        e.stopPropagation();

        if (typeof window.openGuestLoginModal === 'function') {
          window.openGuestLoginModal(() => {
            sessionStorage.setItem('aoi_ref_prompt_shown', 'true');
            if (target.tagName === 'A' && target.href) {
              window.location.href = target.href;
            } else {
              target.click();
            }
          }, { source: 'ReferralLeadCapture' });
        } else {
          // Direct fallback prompt
          renderDirectLeadModal(target);
        }
      }
    }, true);
  }

  function renderDirectLeadModal(originalTarget) {
    let modal = document.getElementById('aoi-direct-lead-modal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'aoi-direct-lead-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.8);backdrop-filter:blur(6px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
    modal.innerHTML = `
      <div style="background:#ffffff;border-radius:20px;max-width:440px;width:100%;padding:26px;box-shadow:0 20px 50px rgba(0,0,0,0.3);position:relative;border:1.5px solid #cbd5e1;box-sizing:border-box;">
        <button type="button" onclick="document.getElementById('aoi-direct-lead-modal').remove()" style="position:absolute;top:14px;right:14px;background:#f1f5f9;border:none;width:32px;height:32px;border-radius:50%;font-size:1.1rem;color:#64748b;cursor:pointer;">✕</button>
        
        <div style="text-align:center;margin-bottom:16px;">
          <div style="width:48px;height:48px;border-radius:50%;background:#dcfce7;color:#16a34a;display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:6px;">🌾</div>
          <h3 style="margin:0;font-size:1.2rem;font-weight:900;color:#0f172a;">Aarogyam India में आपका स्वागत है!</h3>
          <p style="margin:4px 0 0 0;font-size:0.84rem;color:#64748b;">आगे बढ़ने के लिए अपना नाम व WhatsApp नंबर दर्ज करें:</p>
        </div>

        <form id="aoi-lead-capture-form" onsubmit="window.handleDirectLeadSubmit(event)">
          <div style="margin-bottom:12px;">
            <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:4px;">आपका नाम *</label>
            <input type="text" id="lead-visitor-name" required placeholder="अपना नाम दर्ज करें" style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.9rem;box-sizing:border-box;" />
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:0.84rem;font-weight:800;color:#334155;margin-bottom:4px;">WhatsApp मोबाइल नंबर *</label>
            <input type="tel" id="lead-visitor-phone" required maxlength="10" placeholder="10 अंकों का WhatsApp नंबर" style="width:100%;padding:10px 12px;border:1.5px solid #cbd5e1;border-radius:10px;font-size:0.9rem;box-sizing:border-box;" />
          </div>
          <button type="submit" style="width:100%;background:#16a34a;color:#fff;border:none;padding:12px;border-radius:30px;font-weight:900;font-size:0.95rem;cursor:pointer;box-shadow:0 6px 16px rgba(22,163,74,0.35);">
            आगे बढ़ें →
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    window.handleDirectLeadSubmit = function (e) {
      e.preventDefault();
      const name = document.getElementById('lead-visitor-name')?.value?.trim();
      const phone = document.getElementById('lead-visitor-phone')?.value?.trim();
      if (!name || !phone) return;

      const session = {
        name,
        phone,
        mobile: phone,
        refBy: getReferrerId(),
        registeredAt: Date.now()
      };

      try {
        localStorage.setItem('aoi_user_session', JSON.stringify(session));
        localStorage.setItem('user_name', name);
        localStorage.setItem('aim_user_mobile', phone);
      } catch (err) { }

      modal.remove();

      if (originalTarget) {
        if (originalTarget.tagName === 'A' && originalTarget.href) {
          window.location.href = originalTarget.href;
        } else {
          originalTarget.click();
        }
      }
    };
  }

  // Global Exports
  window.AarogyamShareEngine = {
    share: triggerShare,
    getWhatsAppUrl: buildPersonalizedWhatsAppUrl,
    getShareableUrl: buildShareableUrl,
    getReferrerId: getReferrerId
  };

  window.getPersonalizedWhatsAppUrl = buildPersonalizedWhatsAppUrl;
  window.triggerShare = triggerShare;
  window.triggerUniversalShare = triggerShare;
  window.triggerUniversalPageShare = triggerShare;
  window.triggerViralPageShare = triggerShare;
  window.triggerBookShare = (title, url) => triggerShare({ title, url });
  window.triggerKpiNativeShare = function (event, title, text, targetUrl) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
    triggerShare({
      title: title,
      text: text,
      url: targetUrl
    });
  };

  // Track initial referrer ID & init action intercept
  getReferrerId();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReferralVisitorActionInterceptor);
  } else {
    initReferralVisitorActionInterceptor();
  }
})();
