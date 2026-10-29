/**
 * =========================================================================
 * AAROGYAM INDIA - ZERO-OTP ZERO-PASSWORD DEVICE-LOCK SECURITY GUARD
 * Protects: My Library, Reader, Download, Sakhi AI
 * Enforces: 1 Mobile = 1 Authorized Device
 * Includes: Admin Master Whitelist & Zero-Egress Caching Engine
 * =========================================================================
 */
(function(window) {
  'use strict';

  const SUPPORT_PHONE = '7974422572';
  const ADMIN_WHITELIST = ['7974422572', '7049294111'];

  // 1. Get or generate persistent client device token
  function getClientDeviceToken() {
    let token = localStorage.getItem('AI_DEVICE_TOKEN');
    if (!token) {
      token = 'DEV_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('AI_DEVICE_TOKEN', token);
    }
    return token;
  }

  // 2. Extract logged-in mobile number
  function getCleanUserMobile() {
    try {
      const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      const raw = localStorage.getItem('aim_user_mobile') || 
                  u.mobile || u.phone || 
                  localStorage.getItem('user_phone') || 
                  localStorage.getItem('SAKHI_USER_PHONE') || 
                  localStorage.getItem('aarogyam_user_phone');
      return String(raw || '').replace(/\D/g, '').slice(-10);
    } catch(e) {
      return '';
    }
  }

  // 3. Admin Master Whitelist Check (Bypass device lock for Admin testing & ordering)
  function isSuperAdminDevice(mobile) {
    // A. Hardware Level Master Flag (Persists across user logout/login on this physical phone/laptop)
    if (localStorage.getItem('AAROGYAM_SUPERADMIN_HARDWARE') === 'true') return true;
    if (sessionStorage.getItem('AAROGYAM_SUPERADMIN_HARDWARE') === 'true') return true;

    // B. Admin Portal Session
    if (localStorage.getItem('admin_session') === 'true') {
      try { localStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true'); } catch(_) {}
      return true;
    }
    if (sessionStorage.getItem('admin_session') === 'true') {
      try { sessionStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true'); } catch(_) {}
      return true;
    }

    // C. Whitelisted Admin Mobile Numbers
    if (mobile && ADMIN_WHITELIST.includes(mobile)) {
      try { localStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true'); } catch(_) {}
      return true;
    }

    // D. Emergency Master URL Key Activation (?admin_key=7974 or ?super_admin=7974422572)
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const p = new URLSearchParams(window.location.search);
        const k = p.get('admin_key') || p.get('super_admin') || p.get('admin_unlock');
        if (k && (k === '7974' || k === '7049' || k === 'aarogyam7974' || ADMIN_WHITELIST.includes(k))) {
          localStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true');
          sessionStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true');
          console.log('🛡️ [Device Guard]: Emergency Super Admin Hardware Master Privilege activated via URL key!');
          return true;
        }
      }
    } catch (_) {}

    return false;
  }

  // 4. Render exact blocked screen
  function showDeviceLockScreen(mobile) {
    // Hide page contents safely
    const style = document.createElement('style');
    style.id = 'ai-device-lock-css';
    style.textContent = `
      body > *:not(#aiDeviceBlockScreen) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    const oldScreen = document.getElementById('aiDeviceBlockScreen');
    if (oldScreen) oldScreen.remove();

    const waHelpMsg = `नमस्ते आरोग्यम इंडिया, मैंने अपना फोन बदला है और मैं नए डिवाइस पर अपनी ई-बुक / सखी AI शुरू करवाना चाहता हूँ। मेरा रजिस्टर्ड मोबाइल नंबर: ${mobile || ''} है। कृपया मेरा डिवाइस रीसेट करें।`;
    const waHelpUrl = `https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(waHelpMsg)}`;
    const callUrl = `https://wa.me/91${SUPPORT_PHONE}`;

    const blockDiv = document.createElement('div');
    blockDiv.id = 'aiDeviceBlockScreen';
    blockDiv.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #0f172a;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      color: #ffffff;
      text-align: center;
    `;

    blockDiv.innerHTML = `
      <div style="background: #1e293b; border: 1.5px solid #ef4444; border-radius: 20px; max-width: 480px; width: 100%; padding: 32px 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.7); box-sizing: border-box;">
        <div style="font-size: 3.2rem; margin-bottom: 14px;">⚠️</div>
        <h2 style="font-size: 1.25rem; font-weight: 900; color: #f87171; margin: 0 0 12px 0; line-height: 1.45;">
          क्षमा करें, आप इस डिवाइस पर यह सामग्री / सखी AI नहीं पढ़ सकते।
        </h2>
        <p style="font-size: 0.95rem; color: #cbd5e1; margin: 0 0 26px 0; line-height: 1.6; font-weight: 500;">
          (सुरक्षा कारणों से यह खाता केवल आपके अधिकृत फोन पर ही मान्य है।)
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="${waHelpUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #2563eb; color: #ffffff; font-size: 1rem; font-weight: 800; padding: 14px 18px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(37,99,235,0.4); transition: transform 0.15s ease;">
            <span>📲</span> <span>नए डिवाइस पर चालू करवाएं</span>
          </a>
          <a href="${callUrl}" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #16a34a; color: #ffffff; font-size: 0.95rem; font-weight: 800; padding: 12px 18px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(22,163,74,0.35); transition: transform 0.15s ease;">
            <span>🟢</span> <span>📞 सहायता हेतु WhatsApp / कॉल करें (+91 ${SUPPORT_PHONE})</span>
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(blockDiv);
  }

  // 5. Core Gatekeeper Verification (Zero-Egress Stored Hash)
  async function verifyDeviceAuthorization() {
    const mobile = getCleanUserMobile();
    if (!mobile || mobile.length !== 10) {
      // User is not logged in yet - let page-level login modal handle entry
      return { allowed: true, reason: 'unauthenticated' };
    }

    // Admin Master Whitelist Bypass
    if (isSuperAdminDevice(mobile)) {
      console.log('🛡️ [Device Guard]: Super Admin Master Whitelist active for:', mobile);
      return { allowed: true, isAdmin: true };
    }

    const clientToken = getClientDeviceToken();

    // Fast Cache Check (0ms, Zero Supabase Egress)
    const cacheKey = 'AI_AUTH_DEV_' + mobile;
    const cachedToken = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);

    if (cachedToken) {
      if (cachedToken === clientToken) {
        return { allowed: true, cached: true };
      } else {
        showDeviceLockScreen(mobile);
        return { allowed: false, reason: 'device_mismatch_cached' };
      }
    }

    // Database Lookup via surveys table (Single row, minimal egress)
    try {
      const db = window.dbClient || (window.supabase && typeof window.supabase.from === 'function' ? window.supabase : null);
      if (!db) {
        // If DB not ready yet, allow temporary pass and re-verify
        return { allowed: true, pending: true };
      }

      const { data, error } = await db
        .from('surveys')
        .select('id, category_answers')
        .eq('phone_number', mobile)
        .eq('event_type', 'device_lock')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Device Guard] DB query note:', error.message);
        return { allowed: true };
      }

      if (!data) {
        // First-time authorization: Lock this phone as the user's primary authorized device
        // CRITICAL GUARD: If current hardware is Super Admin and inspecting a customer, DO NOT bind customer to Admin hardware!
        if (isSuperAdminDevice(mobile)) {
          console.log('🛡️ [Device Guard]: Super Admin inspecting new user account. Skipping customer device lock binding.');
          return { allowed: true, isAdminInspect: true };
        }

        const u = JSON.parse(localStorage.getItem('AI_USER') || '{}');
        const lockPayload = {
          device_token: clientToken,
          user_agent: navigator.userAgent.substring(0, 100),
          locked_at: new Date().toISOString()
        };

        await db.from('surveys').insert([{
          phone_number: mobile,
          name: u.full_name || u.name || 'Aarogyam Member',
          event_type: 'device_lock',
          occupation: 'device_lock',
          source: 'device_guard',
          category_answers: lockPayload
        }]);

        sessionStorage.setItem(cacheKey, clientToken);
        localStorage.setItem(cacheKey, clientToken);
        return { allowed: true, initialBound: true };
      }

      const serverToken = data.category_answers?.device_token;
      if (!serverToken || serverToken === clientToken || isSuperAdminDevice(mobile)) {
        // Device matched OR Super Admin inspecting user account
        if (isSuperAdminDevice(mobile)) {
          console.log('🛡️ [Device Guard]: Super Admin inspecting existing user account. Zero lock applied.');
          return { allowed: true, isAdminInspect: true };
        }
        sessionStorage.setItem(cacheKey, clientToken);
        localStorage.setItem(cacheKey, clientToken);
        return { allowed: true };
      }

      // Device Mismatch Detected! Block access immediately!
      showDeviceLockScreen(mobile);
      return { allowed: false, reason: 'unauthorized_device' };

    } catch (err) {
      console.warn('[Device Guard] Verification note:', err);
      return { allowed: true };
    }
  }

  // 6. Emergency Self-Reset & Recovery API for Super Admin & Customer Support
  async function activateSuperAdminHardware(pinOrKey) {
    const cleanKey = String(pinOrKey || '').trim();
    if (cleanKey === '7974' || cleanKey === '7049' || cleanKey === 'aarogyam7974' || ADMIN_WHITELIST.includes(cleanKey)) {
      try {
        localStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true');
        sessionStorage.setItem('AAROGYAM_SUPERADMIN_HARDWARE', 'true');
      } catch (_) {}
      console.log('✅ [Device Guard]: Super Admin Hardware Master Privilege permanently activated on this device!');
      return { success: true, message: '🎉 यह डिवाइस अब "सुपर एडमिन मास्टर डिवाइस" के रूप में अधिकृत हो गया है!' };
    }
    return { success: false, message: '❌ अमान्य मास्टर पिन! कृपया सही 4-अंकीय पिन दर्ज करें।' };
  }

  async function resetUserDeviceLock(targetMobile) {
    const cleanMob = String(targetMobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanMob || cleanMob.length !== 10) {
      return { success: false, message: 'कृपया सही 10-अंकीय मोबाइल नंबर दर्ज करें।' };
    }
    
    try {
      const db = window.dbClient || (window.supabase && typeof window.supabase.from === 'function' ? window.supabase : null);
      if (!db) return { success: false, message: 'डेटाबेस सर्वर कनेक्ट नहीं हो सका।' };
      
      // 1. Delete old lock entry from surveys
      await db.from('surveys').delete().eq('phone_number', cleanMob).eq('event_type', 'device_lock');
      
      // 2. Clear current_device_id in profiles
      await db.from('profiles').update({ current_device_id: null }).eq('mobile', cleanMob);
      
      // 3. Clear local cache
      try {
        localStorage.removeItem('AI_AUTH_DEV_' + cleanMob);
        sessionStorage.removeItem('AI_AUTH_DEV_' + cleanMob);
      } catch (_) {}
      
      console.log(`✅ [Device Guard]: Device lock reset successfully for ${cleanMob}!`);
      return { success: true, message: `✅ मोबाइल ${cleanMob} का डिवाइस लॉक सफलतापूर्वक रीसेट कर दिया गया है। ग्राहक अब नए फोन पर तुरंत लॉग इन कर सकता है।` };
    } catch (e) {
      console.error('[Device Guard Reset Error]:', e);
      return { success: false, message: 'रीसेट में त्रुटि: ' + (e.message || 'अज्ञात त्रुटि') };
    }
  }

  // 7. Public API
  window.getClientDeviceToken = getClientDeviceToken;
  window.AarogyamDeviceGuard = {
    verify: verifyDeviceAuthorization,
    isSuperAdmin: isSuperAdminDevice,
    showLockScreen: showDeviceLockScreen,
    getClientToken: getClientDeviceToken,
    activateSuperAdmin: activateSuperAdminHardware,
    resetUserDevice: resetUserDeviceLock
  };

  // Run automatically on protected pages
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(verifyDeviceAuthorization, 300);
    });
  } else {
    setTimeout(verifyDeviceAuthorization, 300);
  }

})(window);
