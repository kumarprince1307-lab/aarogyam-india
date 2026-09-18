/* =================================================================
    AAROGYAM INDIA - V1 COMMON SESSION MODULE (REFRESH & LOGIN FIX)
    - This file is the single source of truth for session management.
    - It relies on localStorage keys set by the custom mobile login.
    - DO NOT use Supabase Auth functions here.
================================================================= */

(function(window) {
    'use strict';

    const USER_KEY = 'AI_USER';
    const PROFILE_KEY = 'AI_PROFILE';
    const SESSION_KEY = 'AI_SESSION';

    /**
     * Retrieves the current session object from localStorage.
     */
    function getSession() {
        try {
            const sessionString = localStorage.getItem(SESSION_KEY);
            return sessionString ? JSON.parse(sessionString) : {};
        } catch (e) {
            console.error("Error parsing AI_SESSION from localStorage", e);
            return {};
        }
    }

    /**
     * Saves the session object to localStorage.
     */
    function saveSession(session) {
        try {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } catch (e) {
            console.error("Error saving AI_SESSION to localStorage", e);
        }
    }

    /**
     * Captures and stores the share_id, source, landing_page, and device info into the AI_SESSION object.
     * Adheres to the "First Click Rule" with SessionStorage backup to survive login overwrites.
     */
    function captureReferral() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareId = urlParams.get('share_id') || urlParams.get('share') || urlParams.get('ref');
            let source = urlParams.get('utm_source') || urlParams.get('source');
            const isValidShareId = (id) => id && /^AI\d{4,8}$/.test(id);

            let session = getSession();

            // 1. लैंडिंग पेज का पाथ ऑटो-कैप्चर करना (जैसे /ebooks/agriculture.html)
            const currentLandingPage = window.location.pathname || '/';
            if (!session.landing_page) {
                session.landing_page = currentLandingPage; // फर्स्ट लैंडिंग पेज सुरक्षित रखें
            }

            // अगर URL में utm_source या source नहीं है, तो ट्रैफिक के आधार पर ऑटो-डिटेक्ट करें
            if (!source) {
                const referrer = document.referrer.toLowerCase();
                if (referrer.includes('whatsapp')) {
                    source = 'whatsapp';
                } else if (referrer.includes('facebook') || referrer.includes('fb')) {
                    source = 'facebook';
                } else if (referrer.includes('instagram')) {
                    source = 'instagram';
                } else if (shareId) {
                    source = 'referral_link';
                } else {
                    source = session.registration_source || 'organic';
                }
            }

            // सोर्स और डिवाइस इन्फो अपडेट करें
            session.registration_source = source;
            session.device_info = navigator.userAgent;

            // 2. अगर URL में share_id है, तो उसे वैलिडेट करके प्रोसेस करें
            if (isValidShareId(shareId)) {
                if (!session.referral_share_id) {
                    session.referral_share_id = shareId;
                    console.log(`Referral session started. share_id "${shareId}" captured in AI_SESSION.`);
                } else {
                    console.log(`Referral session already exists in AI_SESSION: ${session.referral_share_id}. First click rule applied.`);
                }
                sessionStorage.setItem('temp_share_id', shareId);
            } 
            else if (!session.referral_share_id) {
                const backupShareId = sessionStorage.getItem('temp_share_id');
                if (isValidShareId(backupShareId)) {
                    session.referral_share_id = backupShareId;
                    console.log(`Recovered referral share_id "${backupShareId}" from sessionStorage backup.`);
                }
            }

            // फाइनल सेशन सेव करें
            saveSession(session);

        } catch (e) {
            console.error("Error capturing referral and session data", e);
        }
    }

    /**
     * Retrieves the referral share_id from the AI_SESSION object.
     * @returns {string|null} The stored share_id or null if not found.
     */
    function getReferralId() {
        try {
            const session = getSession();
            return session.referral_share_id || sessionStorage.getItem('temp_share_id') || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Retrieves the current user object from localStorage.
     * Checks 'AI_USER' first, then 'AI_PROFILE', 'UCAS_USER', with fallback for verified mobile.
     * @returns {object|null} The parsed user object or null if not found.
     */
    function getCurrentUser() {
        try {
            const userString = localStorage.getItem(USER_KEY) || localStorage.getItem(PROFILE_KEY) || localStorage.getItem('UCAS_USER');
            if (userString) {
                const parsed = JSON.parse(userString);
                if (parsed && (parsed.id || parsed.mobile)) {
                    return parsed;
                }
            }
            const directMobile = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
            if (directMobile && directMobile.length === 10) {
                return {
                    id: 'UID_' + directMobile,
                    mobile: directMobile,
                    full_name: localStorage.getItem('aim_user_name') || localStorage.getItem('user_name') || 'Valued Member',
                    share_id: 'AI' + directMobile.slice(-6)
                };
            }
            return null;
        } catch (e) {
            console.error("Error parsing user data from localStorage", e);
            return null;
        }
    }

    /**
     * Checks if a user is currently logged in.
     * Returns true if user has valid id/mobile or verified 10-digit mobile exists.
     * @returns {boolean} True if the user is logged in, false otherwise.
     */
    function isLoggedIn() {
        const user = getCurrentUser();
        if (user && (user.id || user.mobile)) return true;
        const aimMobile = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
        return aimMobile.length === 10;
    }

    /**
     * Gets the unified, deterministic Share ID for the current user.
     * For logged-in users, returns their unique share_id (e.g. AI294111 / AI000004).
     * For guests, returns 'AI000004'.
     * @returns {string} The verified share ID.
     */
    function getUnifiedShareId() {
        const user = getCurrentUser();
        if (user) {
            if (user.share_id && /^AI\d{4,8}$/i.test(user.share_id)) return user.share_id;
            if (user.referral_code && /^AI\d{4,8}$/i.test(user.referral_code)) return user.referral_code;
            const cleanMob = (user.mobile || '').replace(/\D/g, '').slice(-10);
            if (cleanMob.length === 10) {
                const derivedId = 'AI' + cleanMob.slice(-6);
                try {
                    user.share_id = derivedId;
                    localStorage.setItem(USER_KEY, JSON.stringify(user));
                } catch(e) {}
                return derivedId;
            }
        }
        return 'AI000004';
    }

    /**
     * Automated session healing & cross-key reconciliation.
     * Eliminates split states (e.g. test lead 7852456686 / Rajesh overriding authenticated 7049294111).
     */
    function syncAndHealSession() {
        try {
            const user = getCurrentUser();
            const authMobile = user && user.mobile ? String(user.mobile).replace(/\D/g, '').slice(-10) : '';
            const aimMobile = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-10);
            const masterMobile = authMobile || (aimMobile.length === 10 ? aimMobile : '');

            if (masterMobile && masterMobile.length === 10) {
                // 1. Ensure master user registration flag
                localStorage.setItem('aarogyam_user_registered', 'true');
                localStorage.setItem('aim_user_mobile', masterMobile);

                // 2. Heal guest phone split (remedies test 7852456686 vs true 7049294111)
                const guestPhone = (localStorage.getItem('aarogyam_user_phone') || '').replace(/\D/g, '').slice(-10);
                if (guestPhone !== masterMobile) {
                    console.log(`[V1_SESSION] Reconciling session: Set aarogyam_user_phone to authenticated mobile ${masterMobile} (was: ${guestPhone || 'none'})`);
                    localStorage.setItem('aarogyam_user_phone', masterMobile);
                }

                // 3. Heal guest name split (remedies test Rajesh vs true user name)
                const currentLeadName = localStorage.getItem('aarogyam_user_name') || '';
                const masterName = (user && (user.full_name || user.name)) || localStorage.getItem('aim_user_name') || '';
                if (currentLeadName === 'Rajesh' && masterMobile === '7049294111' && (!masterName || masterName === 'Rajesh')) {
                    // Specific cleanup requested for test Rajesh lead on 7049294111
                    const cleanName = (user && user.full_name && user.full_name !== 'Rajesh') ? user.full_name : 'आरोग्यम सदस्य';
                    localStorage.setItem('aarogyam_user_name', cleanName);
                    localStorage.setItem('user_name', cleanName);
                    localStorage.setItem('aim_user_name', cleanName);
                } else if (masterName && masterName.trim()) {
                    localStorage.setItem('aarogyam_user_name', masterName);
                    localStorage.setItem('user_name', masterName);
                    localStorage.setItem('aim_user_name', masterName);
                }

                // 4. Reconcile aoi_user_session
                try {
                    const aoiStr = localStorage.getItem('aoi_user_session');
                    if (aoiStr) {
                        const aoi = JSON.parse(aoiStr);
                        if (aoi.phone !== masterMobile || aoi.mobile !== masterMobile) {
                            aoi.phone = masterMobile;
                            aoi.mobile = masterMobile;
                            if (masterName) aoi.name = masterName;
                            localStorage.setItem('aoi_user_session', JSON.stringify(aoi));
                        }
                    }
                } catch(err) {}

                // 5. Ensure unified share_id
                if (user && !user.share_id) {
                    user.share_id = 'AI' + masterMobile.slice(-6);
                    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch(e) {}
                }
            }
        } catch (e) {
            console.warn("[V1_SESSION] Session reconciliation notice:", e);
        }
    }

    /**
     * Gets the unique ID of the currently logged-in user.
     * @returns {string|null} The user's ID or null if not logged in.
     */
    function getUserId() {
        const user = getCurrentUser();
        return user ? user.id : null;
    }

    /**
     * Gets the mobile number of the currently logged-in user.
     * @returns {string|null} The user's mobile number or null if not logged in.
     */
    function getMobile() {
        const user = getCurrentUser();
        return user ? user.mobile : (localStorage.getItem('aim_user_mobile') || null);
    }

    /**
     * An alias for getCurrentUser() to maintain compatibility.
     * @returns {object|null} The parsed user object or null if not found.
     */
    function getCurrentProfile() {
        return getCurrentUser();
    }

    /**
     * Clears all session-related data from localStorage and reloads the page.
     * This is the single, authoritative logout function for the entire site.
     */
    function logout() {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PROFILE_KEY);
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('UCAS_USER');
        localStorage.removeItem('AI_PURCHASES');
        localStorage.removeItem('purchases');
        localStorage.removeItem('aim_user_name');
        localStorage.removeItem('aim_user_mobile');
        localStorage.removeItem('aim_profile_completed');
        localStorage.removeItem('ai_profile_completed');
        localStorage.removeItem('aarogyam_user_registered');
        localStorage.removeItem('aarogyam_user_phone');
        localStorage.removeItem('aarogyam_user_name');
        localStorage.removeItem('aoi_user_session');
        localStorage.removeItem('user_name');
        try { sessionStorage.clear(); } catch(e) {}
        
        console.log("User session cleared. Reloading...");
        window.location.reload();
    }

    /**
     * If the user is not logged in, redirects them to the My Library page
     * to trigger the login popup.
     * @param {string} [redirectTo='../ebooks/my-library.html'] - The URL to redirect to.
     */
    function requireLogin(redirectTo = '../ebooks/my-library.html') {
        if (!isLoggedIn()) {
            console.warn("Authentication required. Redirecting to login page.");
            alert("Please log in to access this page.");
            window.location.href = redirectTo;
        }
    }

    // Expose functions to the global window object to be used by other scripts
    window.V1_SESSION = {
        isLoggedIn,
        getCurrentUser,
        getCurrentProfile,
        getUserId,
        getMobile,
        logout,
        requireLogin,
        getReferralId,
        getSession,
        saveSession,
        getUnifiedShareId,
        getUserShareId: getUnifiedShareId,
        syncAndHealSession
    };

    // Cross-compatibility aliases
    window.AISession = window.V1_SESSION;
    window.isUserLoggedIn = isLoggedIn;
    window.getUnifiedUser = getCurrentUser;
    window.getUserShareId = getUnifiedShareId;
    window.getUnifiedShareId = getUnifiedShareId;
    window.logoutUniversalUser = logout;

    // Run referral capture and automated session reconciliation
    captureReferral();
    syncAndHealSession();

    console.log("✅ V1 Common Session Module Loaded & Unified.");

    // रीफ्रेश होने पर भी कंसोल में पूरी जानकारी दिखाने के लिए
    const activeSession = getSession();
    if (activeSession.referral_share_id) {
        console.log(`Current referral session in AI_SESSION: ${activeSession.referral_share_id}`);
    } else {
        console.log("No active referral session found in AI_SESSION.");
    }
    console.log("Current AI_SESSION object:", activeSession);

})(window);