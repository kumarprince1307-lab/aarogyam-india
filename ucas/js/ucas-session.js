/* ==========================================================================
   UCAS SESSION ADAPTER
   Integrates seamlessly with existing Aarogyam India session.js / localStorage.
   DO NOT create a duplicate login system.
   ========================================================================== */

(function (window) {
  'use strict';

  const USER_KEY = 'AI_USER';
  const PROFILE_KEY = 'AI_PROFILE';
  const SESSION_KEY = 'AI_SESSION';

  function getCurrentUser() {
    try {
      const userStr = localStorage.getItem(USER_KEY) || localStorage.getItem(PROFILE_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('UCAS Session: error reading user', e);
      return null;
    }
  }

  function isLoggedIn() {
    const user = getCurrentUser();
    return !!(user && (user.id || user.mobile));
  }

  function getUserId() {
    const user = getCurrentUser();
    if (user && user.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(user.id).trim())) {
      return user.id;
    }
    return user ? (user.id || user.profile_id || null) : null;
  }

  function getShareId() {
    const user = getCurrentUser();
    if (user && user.share_id) return user.share_id;
    if (user && user.referral_code) return user.referral_code;
    if (window.universalShareEngine && typeof window.universalShareEngine.getShareId === 'function') {
      return window.universalShareEngine.getShareId();
    }
    return 'AI000004';
  }

  function getMobile() {
    const user = getCurrentUser();
    return user ? user.mobile : '';
  }

  function getName() {
    const user = getCurrentUser();
    return user ? (user.full_name || user.name || 'Aarogyam Member') : 'Aarogyam Member';
  }

  function saveUser(userObj) {
    if (!userObj) return;
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(userObj));

    // Also synchronize AI_SESSION
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      const session = sessionStr ? JSON.parse(sessionStr) : {};
      session.user_id = userObj.id;
      session.mobile = userObj.mobile;
      if (userObj.referral_code) session.share_id = userObj.referral_code;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Session sync note:', e);
    }
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('admin_session');
    sessionStorage.clear();
    if (window.V1_SESSION && typeof window.V1_SESSION.logout === 'function') {
      window.V1_SESSION.logout();
    } else {
      window.location.reload();
    }
  }

  async function loginWithMobile(mobileNumber) {
    if (!mobileNumber || mobileNumber.length !== 10) {
      return { success: false, message: 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' };
    }

    try {
      const db = window.dbClient || (window.supabase && window.supabase.createClient ? window.dbClient : null);
      if (!db && typeof window.UCAS_DB !== 'undefined' && window.UCAS_DB.getDb) {
        // Fallback to UCAS DB
      }

      const activeDb = window.dbClient || (window.UCAS_DB ? window.UCAS_DB.getDb() : null);
      if (!activeDb) {
        return { success: false, message: 'डेटाबेस कनेक्शन उपलब्ध नहीं है।' };
      }

      const { data, error } = await activeDb
        .from('profiles')
        .select('*')
        .eq('mobile', mobileNumber)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { 
          success: false, 
          notFound: true,
          message: 'यह मोबाइल नंबर पंजीकृत नहीं है। कृपया पहले साइन अप करें।' 
        };
      }

      saveUser(data);
      return { success: true, user: data };
    } catch (e) {
      console.error('UCAS Login error:', e);
      return { success: false, message: 'लॉगिन में त्रुटि हुई: ' + (e.message || 'Unknown error') };
    }
  }

  window.UCAS_SESSION = {
    getCurrentUser,
    isLoggedIn,
    getUserId,
    getShareId,
    getMobile,
    getName,
    getUserName: getName,
    saveUser,
    logout,
    loginWithMobile
  };

  console.log('✅ UCAS Session Adapter Ready.');
})(window);
