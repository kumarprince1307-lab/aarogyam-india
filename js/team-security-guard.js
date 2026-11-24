/**
 * =========================================================================
 * AAROGYAM INDIA - STRICT MY TEAM DUAL SECURITY GUARD (ZERO BYPASS)
 * Protects 5 Private Team Pages:
 *   1. pages/myteam.html
 *   2. pages/myteam-bahikhata.html
 *   3. pages/myteam-dairy.html
 *   4. pages/myteam-followup.html
 *   5. pages/myteam-todo.html
 *
 * Strict Rules (User Directive):
 *   1. IMMEDIATE PAGE CONCEALMENT: Before anything renders, page content is
 *      hidden. No content leaks even if script is executing or slow.
 *   2. CUSTOMER PASSBOOK EXCEPTION: Only ?code=... or ?k=... gets instant bypass
 *      so customer B can view their statement with 0 friction.
 *   3. NO ADMIN BYPASS: Even admin numbers or admin keys are subject to strict
 *      testing until explicitly requested otherwise.
 *   4. MANDATORY LOGIN FIRST: If unauthenticated, full-screen mandatory login
 *      gate blocks the page. No backdrop dismissal, no escape.
 *   5. STRICT DEVICE GUARD:
 *      - Device token is compared directly with Supabase `team_security_vault`.
 *      - If user logged in on Phone 1, device token is saved.
 *      - If user logs into Phone 2, Phone 2 has a DIFFERENT device token.
 *      - Phone 2 is 100% BLOCKED ("अनधिकृत डिवाइस ब्लॉक").
 *   6. 4-DIGIT PIN ENFORCEMENT:
 *      - If same authorized device: Prompt 4-digit PIN every fresh login / session.
 *      - If new user with no PIN: Enforce "Set 4-Digit PIN" -> "Re-enter to confirm".
 *      - 3 wrong attempts -> 15-minute lockout with live countdown timer.
 *   7. LOGOUT PURGE:
 *      - On logout, all session unlocks and cached PIN tokens are completely wiped.
 * =========================================================================
 */
(function (window, document) {
  'use strict';

  const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
  const SUPPORT_PHONE = '7974422572';
  const LOCKOUT_MINUTES = 15;
  const MAX_ATTEMPTS = 3;

  // 1. Customer Passbook Bypass (?code= or ?k=)
  function isCustomerPassbookBypass() {
    try {
      const p = new URLSearchParams(window.location.search);
      return !!(p.get('code') || p.get('k'));
    } catch (_) {
      return false;
    }
  }

  // If customer passbook link, do not conceal or block
  const isPassbook = isCustomerPassbookBypass();

  // 2. IMMEDIATE LOCK STYLE INJECTION (Zero-Flicker Protection)
  if (!isPassbook) {
    const earlyStyle = document.createElement('style');
    earlyStyle.id = 'ai-team-strict-conceal';
    earlyStyle.textContent = `
      body.ai-team-locked {
        overflow: hidden !important;
      }
      body.ai-team-locked > *:not(#aiTeamSecurityOverlay):not(#globalGuestModalOverlay):not(#ai-universal-auth-modal) {
        display: none !important;
      }
      #aiTeamSecurityOverlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0a0f1d;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
        color: #ffffff;
        padding: 16px;
        box-sizing: border-box;
      }
      .ai-sec-card {
        background: #111827;
        border: 1.5px solid #374151;
        border-radius: 20px;
        width: 100%;
        max-width: 420px;
        padding: 28px 24px 24px;
        box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9);
        text-align: center;
        position: relative;
        animation: aiSecFadeUp 0.25s ease-out;
      }
      @keyframes aiSecFadeUp {
        from { opacity: 0; transform: translateY(14px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .ai-sec-icon-wrap {
        width: 68px;
        height: 68px;
        margin: 0 auto 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      }
      .ai-sec-icon-blue {
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        color: #ffffff;
      }
      .ai-sec-icon-red {
        background: linear-gradient(135deg, #991b1b, #ef4444);
        color: #ffffff;
      }
      .ai-sec-title {
        font-size: 1.25rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        margin: 0 0 6px;
        color: #ffffff;
      }
      .ai-sec-subtitle {
        font-size: 0.86rem;
        color: #9ca3af;
        margin: 0 0 20px;
        line-height: 1.45;
      }
      .ai-sec-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #1f2937;
        border: 1px solid #374151;
        color: #60a5fa;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.78rem;
        font-weight: 700;
        margin-bottom: 22px;
      }
      .ai-pin-dots {
        display: flex;
        justify-content: center;
        gap: 18px;
        margin: 18px 0 24px;
      }
      .ai-pin-dot {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #4b5563;
        background: transparent;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .ai-pin-dot.filled {
        background: #3b82f6;
        border-color: #60a5fa;
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
        transform: scale(1.15);
      }
      .ai-pin-dots.shake {
        animation: aiPinShake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
      }
      @keyframes aiPinShake {
        10%, 90% { transform: translate3d(-3px, 0, 0); }
        20%, 80% { transform: translate3d(5px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
        40%, 60% { transform: translate3d(6px, 0, 0); }
      }
      .ai-sec-error {
        color: #f87171;
        font-size: 0.82rem;
        font-weight: 700;
        min-height: 20px;
        margin-bottom: 14px;
      }
      .ai-numpad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        max-width: 320px;
        margin: 0 auto;
      }
      .ai-num-btn {
        background: #1f2937;
        color: #f3f4f6;
        border: 1px solid #374151;
        border-radius: 14px;
        height: 54px;
        font-size: 1.45rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        transition: background 0.12s, transform 0.08s;
        -webkit-tap-highlight-color: transparent;
      }
      .ai-num-btn:active {
        background: #374151;
        transform: scale(0.94);
      }
      .ai-num-btn.fn-btn {
        font-size: 1.05rem;
        color: #9ca3af;
        background: transparent;
        border-color: transparent;
      }
      .ai-sec-action-btn {
        width: 100%;
        padding: 13px;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border: none;
        transition: transform 0.1s, opacity 0.15s;
        text-decoration: none;
        box-sizing: border-box;
      }
      .ai-btn-wa {
        background: #25D366;
        color: #ffffff;
      }
      .ai-btn-primary {
        background: #2563eb;
        color: #ffffff;
      }
      .ai-btn-ghost {
        background: #1f2937;
        color: #9ca3af;
        border: 1px solid #374151;
        margin-top: 10px;
      }
      .ai-sec-timer {
        font-size: 2rem;
        font-weight: 900;
        color: #ef4444;
        letter-spacing: 0.05em;
        margin: 12px 0 18px;
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(earlyStyle);
    if (document.body) {
      document.body.classList.add('ai-team-locked');
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (!isPassbook) document.body.classList.add('ai-team-locked');
      });
    }
  }

  // 3. Persistent Client Device Token
  function getClientDeviceToken() {
    let token = localStorage.getItem('AI_DEVICE_TOKEN');
    if (!token) {
      token = 'DEV_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('AI_DEVICE_TOKEN', token);
    }
    return token;
  }

  // 4. Strict 10-Digit Mobile Resolution
  function getCleanUserMobile() {
    try {
      if (typeof window.getMobile === 'function') {
        const m = sanitizeMobile(window.getMobile());
        if (m) return m;
      }
      if (window.V1_SESSION && typeof window.V1_SESSION.getMobile === 'function') {
        const m = sanitizeMobile(window.V1_SESSION.getMobile());
        if (m) return m;
      }
      const userKeys = ['AI_USER', 'AI_PROFILE', 'UCAS_USER', 'aarogyam_user_profile', 'aarogyam_auth_user'];
      for (const k of userKeys) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            const u = JSON.parse(val);
            const m = sanitizeMobile(u.mobile || u.phone || (u.user_metadata && u.user_metadata.mobile));
            if (m) return m;
          } catch (_) { }
        }
      }
      const rawStored = localStorage.getItem('aim_user_mobile') || localStorage.getItem('user_mobile') || localStorage.getItem('mobile') || '';
      return sanitizeMobile(rawStored);
    } catch (_) {
      return '';
    }
  }

  function sanitizeMobile(raw) {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
    else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
    return digits.length === 10 ? digits : (digits.length > 10 ? digits.slice(-10) : '');
  }

  // 5. Zero-Egress Session Validation
  // Requires: Matching Mobile + Session Token + Stored Device Token Match
  function isSessionUnlocked(mobile) {
    if (!mobile) return false;
    const sessionToken = sessionStorage.getItem('AI_TEAM_SECURITY_UNLOCKED_' + mobile);
    const sessionDevice = sessionStorage.getItem('AI_TEAM_SECURITY_DEVICE_' + mobile);
    const currentDevice = getClientDeviceToken();
    return sessionToken === 'true' && sessionDevice === currentDevice;
  }

  function setSessionUnlocked(mobile) {
    if (!mobile) return;
    sessionStorage.setItem('AI_TEAM_SECURITY_UNLOCKED_' + mobile, 'true');
    sessionStorage.setItem('AI_TEAM_SECURITY_DEVICE_' + mobile, getClientDeviceToken());
    sessionStorage.setItem('AI_TEAM_SECURITY_TIME_' + mobile, Date.now().toString());
  }

  function clearAllSecuritySession(mobile) {
    try {
      if (mobile) {
        sessionStorage.removeItem('AI_TEAM_SECURITY_UNLOCKED_' + mobile);
        sessionStorage.removeItem('AI_TEAM_SECURITY_DEVICE_' + mobile);
        sessionStorage.removeItem('AI_TEAM_SECURITY_TIME_' + mobile);
      }
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('AI_TEAM_SECURITY_')) {
          sessionStorage.removeItem(k);
        }
      }
    } catch (_) { }
  }

  // Listen to Global Logout Event to purge security tokens
  window.addEventListener('ai:user-logged-out', () => {
    clearAllSecuritySession(getCleanUserMobile());
  });

  // 6. Supabase Vault Queries
  async function fetchVaultRecord(mobile) {
    const url = `${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${mobile}&select=*&_t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) throw new Error('Failed to query security vault');
    const data = await res.json();
    return (data && data.length > 0) ? data[0] : null;
  }

  async function upsertVaultRecord(record) {
    record.updated_at = new Date().toISOString();
    const url = `${SUPABASE_URL}/rest/v1/team_security_vault?on_conflict=phone`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to upsert vault record');
    return await res.json();
  }

  async function patchVaultRecord(mobile, updates) {
    updates.updated_at = new Date().toISOString();
    const url = `${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${mobile}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to patch vault record');
    return await res.json();
  }

  // 7. Render Mandatory Login Screen (Strict Mode - Cannot be dismissed)
  function renderMandatoryLoginScreen() {
    let existing = document.getElementById('aiTeamSecurityOverlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'aiTeamSecurityOverlay';
      document.body.appendChild(existing);
    }

    existing.innerHTML = `
      <div class="ai-sec-card">
        <div class="ai-sec-icon-wrap ai-sec-icon-blue">🔐</div>
        <h2 class="ai-sec-title">लीडर वर्कबेंच लॉगिन आवश्यक</h2>
        <p class="ai-sec-subtitle">यह पेज केवल अधिकृत लीडर्स के लिए है। अपनी टीम और डिजिटल बहीखाता एक्सेस करने के लिए कृपया पहले लॉगिन करें।</p>
        
        <button type="button" class="ai-sec-action-btn ai-btn-primary" id="aiBtnTriggerLogin" style="margin-bottom:12px;">
          🔑 अभी लॉगिन / रजिस्टर करें
        </button>
        <button type="button" class="ai-sec-action-btn ai-btn-ghost" onclick="window.location.href='/'">
          होम पेज पर वापस जाएं
        </button>
      </div>
    `;

    const btn = document.getElementById('aiBtnTriggerLogin');
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof window.openGuestLoginModal === 'function') {
          window.openGuestLoginModal(() => {
            const m = getCleanUserMobile();
            if (m) {
              existing.remove();
              runTeamSecurityGuard();
            } else {
              window.location.reload();
            }
          }, {
            force: true,
            title: 'लीडर वर्कबेंच लॉगिन',
            reason: 'My Team व डिजिटल बहीखाता एक्सेस करने हेतु अपना मोबाइल नंबर दर्ज करें।'
          });
        } else {
          window.location.href = '/registration.html?mode=login';
        }
      });
    }
  }

  // 8. Render Unauthorized Device Block Screen (Hardware Guard)
  function renderDeviceLockScreen(mobile) {
    let existing = document.getElementById('aiTeamSecurityOverlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'aiTeamSecurityOverlay';
      document.body.appendChild(existing);
    }

    const waMsg = `नमस्ते आरोग्यम टीम, मेरा रजिस्टर्ड मोबाइल नंबर: ${mobile} है। मैं नए फोन पर अपनी My Team वर्कबेंच खोलना चाहता हूँ। कृपया मेरा पुराना डिवाइस टोकन रीसेट करें।`;
    const waUrl = `https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(waMsg)}`;

    existing.innerHTML = `
      <div class="ai-sec-card">
        <div class="ai-sec-icon-wrap ai-sec-icon-red">📱</div>
        <h2 class="ai-sec-title">अनधिकृत डिवाइस ब्लॉक</h2>
        <div class="ai-sec-badge">🔒 खाता संख्या: +91 ${mobile}</div>
        <p class="ai-sec-subtitle">यह खाता किसी अन्य डिवाइस से अधिकृत है। आपकी टीम और बहीखाता डेटा की सुरक्षा हेतु 1 नंबर = केवल 1 डिवाइस पर ही कार्य करता है।</p>
        
        <div style="background:#1f2937; border-radius:12px; padding:14px; margin-bottom:20px; font-size:0.84rem; text-align:left; color:#d1d5db; border:1px solid #374151;">
          <div style="font-weight:700; color:#f3f4f6; margin-bottom:4px;">🛡️ सुरक्षा निर्देश:</div>
          <div>1. या तो अपने पहले अधिकृत फोन में यह पेज खोलें।</div>
          <div>2. या नीचे WhatsApp बटन दबाकर एडमिन से डिवाइस रीसेट करवाएं।</div>
        </div>

        <a href="${waUrl}" target="_blank" class="ai-sec-action-btn ai-btn-wa" style="margin-bottom:10px;">
          <i class="fab fa-whatsapp"></i> एडमिन से डिवाइस रीसेट करवाएं
        </a>
        <button type="button" class="ai-sec-action-btn ai-btn-ghost" onclick="window.location.href='/'">
          होम पेज पर वापस जाएं
        </button>
      </div>
    `;
  }

  // 9. Render Lockout Timer Screen (3 Strikes)
  function renderLockoutScreen(mobile, lockedUntilMs) {
    let existing = document.getElementById('aiTeamSecurityOverlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'aiTeamSecurityOverlay';
      document.body.appendChild(existing);
    }

    const waMsg = `नमस्ते आरोग्यम टीम, मेरा 4-अंकीय My Team सिक्योरिटी पिन 3 बार गलत दर्ज होने के कारण ब्लॉक हो गया है। मेरा रजिस्टर्ड नंबर: ${mobile} है। कृपया मेरा पिन रीसेट करें।`;
    const waUrl = `https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(waMsg)}`;

    existing.innerHTML = `
      <div class="ai-sec-card">
        <div class="ai-sec-icon-wrap ai-sec-icon-red">⏳</div>
        <h2 class="ai-sec-title">सुरक्षा प्रतिबंध (Temporary Lock)</h2>
        <div class="ai-sec-badge">🔒 खाता संख्या: +91 ${mobile}</div>
        <p class="ai-sec-subtitle">लगातार 3 बार गलत पिन दर्ज किया गया है। डेटा व गोपनीयता की सुरक्षा हेतु यह एक्सेस 15 मिनट के लिए लॉक कर दिया गया है।</p>
        
        <div class="ai-sec-timer" id="aiLockoutCountdown">15:00</div>
        <div class="ai-sec-error">कृपया उलटी गिनती पूरी होने तक प्रतीक्षा करें</div>

        <a href="${waUrl}" target="_blank" class="ai-sec-action-btn ai-btn-wa" style="margin-bottom:10px;">
          <i class="fab fa-whatsapp"></i> एडमिन से तुरंत पिन रीसेट कराएं
        </a>
        <button type="button" class="ai-sec-action-btn ai-btn-ghost" onclick="window.location.href='/'">
          होम पेज पर वापस जाएं
        </button>
      </div>
    `;

    const timerEl = document.getElementById('aiLockoutCountdown');
    const interval = setInterval(() => {
      const remaining = Math.max(0, lockedUntilMs - Date.now());
      if (remaining <= 0) {
        clearInterval(interval);
        window.location.reload();
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      if (timerEl) {
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);
  }

  // 10. GPay-Style PIN Flow
  function renderPinPrompt(mobile, vaultRow, onUnlocked) {
    let existing = document.getElementById('aiTeamSecurityOverlay');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'aiTeamSecurityOverlay';
      document.body.appendChild(existing);
    }

    // A user needs new PIN setup if no row exists, or pin_code is null/empty, or admin reset flag 'RESET'
    const isNewSetup = !vaultRow || !vaultRow.pin_code || vaultRow.pin_code === 'RESET';
    let mode = isNewSetup ? 'SET_FIRST' : 'VERIFY';
    let firstEnteredPin = '';
    let currentInput = '';
    let attemptsRemaining = MAX_ATTEMPTS - (vaultRow && vaultRow.attempts ? vaultRow.attempts : 0);

    function updateUi() {
      let title = 'सुरक्षा पिन दर्ज करें';
      let sub = 'अपनी टीम व बहीखाता गोपनीयता हेतु 4-अंकीय पिन दर्ज करें';
      let badge = `🔒 +91 ${mobile}`;

      if (mode === 'SET_FIRST') {
        title = 'नया 4-अंकीय पिन बनाएं';
        sub = 'अपनी टीम व बहीखाता डेटा को सुरक्षित रखने हेतु एक गुप्त पिन सेट करें';
      } else if (mode === 'CONFIRM') {
        title = 'पिन की पुनः पुष्टि करें';
        sub = 'पुष्टि हेतु वही 4-अंकीय पिन दोबारा दर्ज करें';
      }

      existing.innerHTML = `
        <div class="ai-sec-card">
          <div class="ai-sec-icon-wrap ai-sec-icon-blue">🔐</div>
          <h2 class="ai-sec-title">${title}</h2>
          <div class="ai-sec-badge">${badge}</div>
          <p class="ai-sec-subtitle">${sub}</p>

          <div class="ai-pin-dots" id="aiPinDots">
            <div class="ai-pin-dot ${currentInput.length >= 1 ? 'filled' : ''}"></div>
            <div class="ai-pin-dot ${currentInput.length >= 2 ? 'filled' : ''}"></div>
            <div class="ai-pin-dot ${currentInput.length >= 3 ? 'filled' : ''}"></div>
            <div class="ai-pin-dot ${currentInput.length >= 4 ? 'filled' : ''}"></div>
          </div>

          <div class="ai-sec-error" id="aiSecError"></div>

          <div class="ai-numpad">
            <button type="button" class="ai-num-btn" data-key="1">1</button>
            <button type="button" class="ai-num-btn" data-key="2">2</button>
            <button type="button" class="ai-num-btn" data-key="3">3</button>
            <button type="button" class="ai-num-btn" data-key="4">4</button>
            <button type="button" class="ai-num-btn" data-key="5">5</button>
            <button type="button" class="ai-num-btn" data-key="6">6</button>
            <button type="button" class="ai-num-btn" data-key="7">7</button>
            <button type="button" class="ai-num-btn" data-key="8">8</button>
            <button type="button" class="ai-num-btn" data-key="9">9</button>
            <button type="button" class="ai-num-btn fn-btn" data-key="CLEAR">हटाएं</button>
            <button type="button" class="ai-num-btn" data-key="0">0</button>
            <button type="button" class="ai-num-btn fn-btn" data-key="BACK">⌫</button>
          </div>

          <div style="margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
            <a href="/" style="font-size:0.80rem; color:#9ca3af; text-decoration:none;">← वापस होम जाएं</a>
            ${!isNewSetup ? `
              <a href="https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(`नमस्ते, मैं My Team का पिन भूल गया हूँ। नंबर: ${mobile}`)}" target="_blank" style="font-size:0.80rem; color:#60a5fa; text-decoration:none;">
                पिन भूल गए?
              </a>
            ` : ''}
          </div>
        </div>
      `;

      attachListeners();
    }

    function showError(msg) {
      const errEl = document.getElementById('aiSecError');
      const dotsEl = document.getElementById('aiPinDots');
      if (errEl) errEl.textContent = msg;
      if (dotsEl) {
        dotsEl.classList.remove('shake');
        void dotsEl.offsetWidth;
        dotsEl.classList.add('shake');
      }
    }

    function renderDots() {
      const dots = document.querySelectorAll('.ai-pin-dot');
      dots.forEach((dot, index) => {
        if (index < currentInput.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });
    }

    async function handleKey(key) {
      if (key === 'CLEAR') {
        currentInput = '';
        renderDots();
        return;
      }
      if (key === 'BACK' || key === 'Backspace') {
        currentInput = currentInput.slice(0, -1);
        renderDots();
        return;
      }
      if (/^\d$/.test(key)) {
        if (currentInput.length < 4) {
          currentInput += key;
          renderDots();

          if (currentInput.length === 4) {
            setTimeout(processFullPin, 120);
          }
        }
      }
    }

    async function processFullPin() {
      const entered = currentInput;

      if (mode === 'SET_FIRST') {
        firstEnteredPin = entered;
        currentInput = '';
        mode = 'CONFIRM';
        updateUi();
        return;
      }

      if (mode === 'CONFIRM') {
        if (entered !== firstEnteredPin) {
          showError('पिन मेल नहीं खाया! कृपया दोबारा बनाएं।');
          setTimeout(() => {
            currentInput = '';
            firstEnteredPin = '';
            mode = 'SET_FIRST';
            updateUi();
          }, 1000);
          return;
        }

        try {
          const deviceToken = getClientDeviceToken();
          await upsertVaultRecord({
            phone: mobile,
            pin_code: entered,
            device_token: deviceToken,
            attempts: 0,
            locked_until: null
          });

          setSessionUnlocked(mobile);
          finishUnlock();
        } catch (err) {
          showError('पिन सुरक्षित करने में त्रुटि। कृपया पुनः प्रयास करें।');
          currentInput = '';
          renderDots();
        }
        return;
      }

      if (mode === 'VERIFY') {
        if (vaultRow && vaultRow.pin_code && entered === String(vaultRow.pin_code)) {
          try {
            if (vaultRow.attempts > 0) {
              await patchVaultRecord(mobile, {
                attempts: 0,
                locked_until: null
              });
            }
          } catch (_) { }

          setSessionUnlocked(mobile);
          finishUnlock();
        } else {
          const newAttempts = (vaultRow && vaultRow.attempts ? vaultRow.attempts : 0) + 1;
          vaultRow.attempts = newAttempts;
          attemptsRemaining = Math.max(0, MAX_ATTEMPTS - newAttempts);

          if (attemptsRemaining <= 0) {
            const lockedUntilMs = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
            const lockedUntil = new Date(lockedUntilMs).toISOString();
            // 1. Instantly persist to localStorage so no home/reload bypass is possible
            try {
              localStorage.setItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile, lockedUntil);
            } catch (_) { }

            // 2. Persist to Supabase Vault so Admin Panel reflects 15-Min Lock immediately
            try {
              await patchVaultRecord(mobile, {
                attempts: newAttempts,
                locked_until: lockedUntil
              });
            } catch (err) {
              console.error('Failed to save lockout:', err);
            }
            renderLockoutScreen(mobile, lockedUntilMs);
          } else {
            try {
              await patchVaultRecord(mobile, {
                attempts: newAttempts
              });
            } catch (err) {
              console.error('Failed to save attempt strike:', err);
            }
            showError(`गलत पिन! केवल ${attemptsRemaining} प्रयास शेष हैं।`);
            currentInput = '';
            renderDots();
          }
        }
      }
    }

    function finishUnlock() {
      document.body.classList.remove('ai-team-locked');
      const concealStyle = document.getElementById('ai-team-strict-conceal');
      if (concealStyle) concealStyle.remove();
      const overlay = document.getElementById('aiTeamSecurityOverlay');
      if (overlay) overlay.remove();
      if (typeof onUnlocked === 'function') onUnlocked();
    }

    function attachListeners() {
      const btns = existing.querySelectorAll('.ai-num-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const key = btn.getAttribute('data-key');
          handleKey(key);
        });
      });
    }

    function keydownHandler(e) {
      if (!document.getElementById('aiTeamSecurityOverlay')) {
        window.removeEventListener('keydown', keydownHandler);
        return;
      }
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === 'Backspace') {
        handleKey('BACK');
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        handleKey('CLEAR');
      }
    }
    window.addEventListener('keydown', keydownHandler);

    updateUi();
  }

  // 11. Core Security Guard Logic
  async function runTeamSecurityGuard() {
    // A. Customer Passbook Bypass
    if (isCustomerPassbookBypass()) {
      console.log('🛡️ [Team Security]: Customer passbook bypass active (?code or ?k).');
      document.body.classList.remove('ai-team-locked');
      const concealStyle = document.getElementById('ai-team-strict-conceal');
      if (concealStyle) concealStyle.remove();
      const overlay = document.getElementById('aiTeamSecurityOverlay');
      if (overlay) overlay.remove();
      return;
    }

    // B. Check Login Status
    const mobile = getCleanUserMobile();
    if (!mobile) {
      console.warn('🛡️ [Team Security]: No authenticated mobile found. Mandatory login enforced.');
      renderMandatoryLoginScreen();
      return;
    }

    // Fast-path Lockout Check from LocalStorage (Instant block even before network returns)
    try {
      const localLock = localStorage.getItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile);
      if (localLock) {
        const localMs = new Date(localLock).getTime();
        if (localMs > Date.now()) {
          console.warn('🛡️ [Team Security]: Local client lockout active.');
          renderLockoutScreen(mobile, localMs);
          return;
        } else {
          localStorage.removeItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile);
        }
      }
    } catch (_) { }

    // C. Zero-Egress Session Check (Valid only for same session + same device)
    if (isSessionUnlocked(mobile)) {
      console.log('🛡️ [Team Security]: Session verified on current device. Instant access granted.');
      document.body.classList.remove('ai-team-locked');
      const concealStyle = document.getElementById('ai-team-strict-conceal');
      if (concealStyle) concealStyle.remove();
      const overlay = document.getElementById('aiTeamSecurityOverlay');
      if (overlay) overlay.remove();
      return;
    }

    // D. Fetch Supabase Vault Record
    try {
      const vaultRow = await fetchVaultRecord(mobile);
      const currentDeviceToken = getClientDeviceToken();

      // 1. Lockout Check
      if (vaultRow && vaultRow.locked_until) {
        const lockedUntilMs = new Date(vaultRow.locked_until).getTime();
        if (lockedUntilMs > Date.now()) {
          console.warn('🛡️ [Team Security]: Account locked due to 3 wrong attempts.');
          try { localStorage.setItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile, vaultRow.locked_until); } catch (_) { }
          renderLockoutScreen(mobile, lockedUntilMs);
          return;
        } else {
          // Lockout expired, clear local storage and clean attempts in Supabase
          try { localStorage.removeItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile); } catch (_) { }
          if (vaultRow.attempts > 0) {
            patchVaultRecord(mobile, { attempts: 0, locked_until: null }).catch(() => { });
            vaultRow.attempts = 0;
            vaultRow.locked_until = null;
          }
        }
      } else {
        // If Supabase has no lock (e.g. Admin reset/unlocked it), clear any leftover local lock
        try { localStorage.removeItem('AI_TEAM_SECURITY_LOCKOUT_' + mobile); } catch (_) { }
      }

      // 2. Strict Device Token Mismatch Check
      if (vaultRow && vaultRow.device_token && vaultRow.device_token !== currentDeviceToken) {
        console.warn('🛡️ [Team Security]: STRICT DEVICE MISMATCH DETECTED!');
        console.warn('Expected:', vaultRow.device_token, 'Current Device:', currentDeviceToken);
        renderDeviceLockScreen(mobile);
        return;
      }

      // 3. Prompt for PIN
      renderPinPrompt(mobile, vaultRow, () => {
        console.log('🛡️ [Team Security]: Security PIN verified successfully.');
      });
    } catch (err) {
      console.error('🛡️ [Team Security]: Vault check failed:', err);
    }
  }

  // Global API
  window.AarogyamTeamSecurity = {
    check: runTeamSecurityGuard,
    logoutPurge: function () {
      clearAllSecuritySession(getCleanUserMobile());
    },
    isCustomerPassbook: isCustomerPassbookBypass
  };

  // Run as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTeamSecurityGuard);
  } else {
    runTeamSecurityGuard();
  }

})(window, document);
