/**
 * Aarogyam India - Global Guest Registration & Login Modal
 * Strictly shows ONLY Free Registration & Login for non-logged-in visitors.
 * Allows guest browsing with smooth dismiss capability.
 */
(function() {
  'use strict';

  function isUserLoggedIn() {
    try {
      const user = localStorage.getItem('AI_USER') || 
                   localStorage.getItem('AI_PROFILE') || 
                   localStorage.getItem('UCAS_USER') || 
                   localStorage.getItem('user_id') || 
                   localStorage.getItem('aim_user_mobile') || 
                   localStorage.getItem('ucas_user_id');
      return Boolean(user && user !== '{}' && user !== 'null' && user !== 'undefined');
    } catch (e) {
      return false;
    }
  }

  function isDismissedThisSession() {
    try {
      return sessionStorage.getItem('ai_guest_dismissed') === 'true';
    } catch (e) {
      return false;
    }
  }

  function createModal() {
    if (document.getElementById('ai-guest-login-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'ai-guest-login-modal';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    overlay.innerHTML = `
      <div style="
        background: #ffffff;
        color: #1e293b;
        max-width: 420px;
        width: 100%;
        border-radius: 20px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        position: relative;
        transform: scale(0.95) translateY(10px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid #e2e8f0;
      " id="ai-guest-modal-card">
        
        <!-- Top Clean Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 22px 20px 18px; text-align: center; position: relative; color: #ffffff;">
          <button type="button" id="ai-btn-close-guest-modal" style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.15rem;
            cursor: pointer;
            transition: background 0.2s;
          " title="बंद करें / गेस्ट की तरह जारी रखें">&times;</button>
          
          <img src="/images/logo/logo.png" alt="Aarogyam India" style="height: 44px; max-width: 150px; object-fit: contain; margin-bottom: 6px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" onerror="this.style.display='none'">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
            मुफ़्त रजिस्ट्रेशन / लॉगिन
          </h2>
          <p style="margin: 3px 0 0 0; font-size: 0.82rem; color: #d1fae5; font-weight: 500;">
            Aarogyam India में आपका स्वागत है
          </p>
        </div>

        <!-- Body Content -->
        <div style="padding: 20px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.82rem; color: #475569; line-height: 1.45; text-align: center;">
            ✨ मुफ़्त रजिस्टर करके अपनी <strong>डिजिटल ई-बुक्स, My Profile व UCAS Marketing Tools</strong> का उपयोग करें।
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">
            <a href="/registration.html" style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #059669;
              color: #ffffff;
              padding: 12px 10px;
              border-radius: 12px;
              font-weight: 800;
              font-size: 0.88rem;
              text-decoration: none;
              box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
              transition: all 0.2s;
              text-align: center;
            ">
              <span style="font-size: 1.3rem;">👤</span>
              <span>रजिस्ट्रेशन करें<br><small style="font-weight:600;font-size:0.75rem;opacity:0.9;">(New User)</small></span>
            </a>

            <a href="/registration.html?mode=login" id="ai-btn-guest-login-action" style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              background: #1E40AF;
              color: #ffffff;
              padding: 12px 10px;
              border-radius: 12px;
              font-weight: 800;
              font-size: 0.88rem;
              text-decoration: none;
              box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
              transition: all 0.2s;
              text-align: center;
              border: none;
              cursor: pointer;
            ">
              <span style="font-size: 1.3rem;">🔑</span>
              <span>लॉगिन करें<br><small style="font-weight:600;font-size:0.75rem;opacity:0.9;">(Existing User)</small></span>
            </a>
          </div>

          <!-- Continue as Guest link -->
          <div style="text-align: center; margin-top: 14px;">
            <button type="button" id="ai-btn-continue-guest" style="
              background: transparent;
              border: none;
              color: #64748b;
              font-size: 0.82rem;
              cursor: pointer;
              font-weight: 600;
              text-decoration: underline;
              padding: 4px 8px;
            ">
              गेस्ट के रूप में वेबसाइट देखें (Browse as Guest) &rarr;
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    // Event listeners
    const closeBtn = document.getElementById('ai-btn-close-guest-modal');
    const guestBtn = document.getElementById('ai-btn-continue-guest');
    const loginActionBtn = document.getElementById('ai-btn-guest-login-action');

    function dismissModal() {
      try {
        sessionStorage.setItem('ai_guest_dismissed', 'true');
      } catch (e) {}
      window.closeGuestLoginModal();
    }

    loginActionBtn?.addEventListener('click', (e) => {
      const universalModal = document.getElementById('universalLoginModal');
      if (universalModal) {
        e.preventDefault();
        dismissModal();
        universalModal.style.display = 'flex';
        const mobileInp = document.getElementById('universalLoginMobile');
        if (mobileInp) mobileInp.focus();
      } else if (typeof window.openLoginModal === 'function') {
        e.preventDefault();
        dismissModal();
        window.openLoginModal(e);
      }
    });

    closeBtn?.addEventListener('click', dismissModal);
    guestBtn?.addEventListener('click', dismissModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismissModal();
    });
  }

  window.openGuestLoginModal = function() {
    createModal();
    const modal = document.getElementById('ai-guest-login-modal');
    const card = document.getElementById('ai-guest-modal-card');
    if (modal && card) {
      modal.style.opacity = '1';
      modal.style.visibility = 'visible';
      card.style.transform = 'scale(1) translateY(0)';
    }
  };

  window.closeGuestLoginModal = function() {
    const modal = document.getElementById('ai-guest-login-modal');
    const card = document.getElementById('ai-guest-modal-card');
    if (modal && card) {
      modal.style.opacity = '0';
      modal.style.visibility = 'hidden';
      card.style.transform = 'scale(0.95) translateY(10px)';
    }
  };

  // Auto-trigger for non-logged-in guest visitors on public page loads
  document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('registration') || 
        currentPath.includes('admin') || 
        currentPath.includes('ucas') || 
        currentPath.includes('checkout') || 
        currentPath.includes('payment') || 
        currentPath.includes('share')) {
      return;
    }

    if (!isUserLoggedIn() && !isDismissedThisSession()) {
      setTimeout(() => {
        window.openGuestLoginModal();
      }, 1500);
    }
  });

})();
