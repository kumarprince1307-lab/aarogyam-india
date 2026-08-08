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
     * Captures and stores the share_id from the URL into the AI_SESSION object.
     * Adheres to the "First Click Rule" with SessionStorage backup to survive login overwrites.
     */
    function captureReferral() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareId = urlParams.get('share_id');
            const isValidShareId = (id) => id && /^AI\d{4,8}$/.test(id);

            let session = getSession();

            // 1. अगर URL में share_id है, तो उसे वैलिडेट करके प्रोसेस करें
            if (isValidShareId(shareId)) {
                // First Click Rule: अगर पहले से सेशन में आईडी नहीं है, तभी नई सेव करें
                if (!session.referral_share_id) {
                    session.referral_share_id = shareId;
                    saveSession(session);
                    console.log(`Referral session started. share_id "${shareId}" captured in AI_SESSION.`);
                } else {
                    console.log(`Referral session already exists in AI_SESSION: ${session.referral_share_id}. First click rule applied.`);
                }
                // बैकअप के रूप में sessionStorage में भी सुरक्षित रखें ताकि लॉगिन के वक्त न उड़े
                sessionStorage.setItem('temp_share_id', shareId);
            } 
            // 2. अगर URL में share_id नहीं है (या लॉगिन के बाद गायब हो गया है), तो बैकअप से रिकवर करें
            else if (!session.referral_share_id) {
                const backupShareId = sessionStorage.getItem('temp_share_id');
                if (isValidShareId(backupShareId)) {
                    session.referral_share_id = backupShareId;
                    saveSession(session);
                    console.log(`Recovered referral share_id "${backupShareId}" from sessionStorage backup.`);
                }
            }
        } catch (e) {
            console.error("Error capturing referral data", e);
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
     * It checks for 'AI_USER' first, with a fallback to 'AI_PROFILE'.
     * @returns {object|null} The parsed user object or null if not found.
     */
    function getCurrentUser() {
        try {
            const userString = localStorage.getItem(USER_KEY) || localStorage.getItem(PROFILE_KEY);
            if (!userString) {
                return null;
            }
            return JSON.parse(userString);
        } catch (e) {
            console.error("Error parsing user data from localStorage", e);
            return null;
        }
    }

    /**
     * Checks if a user is currently logged in.
     * A user is considered logged in if a user object with an 'id' exists.
     * @returns {boolean} True if the user is logged in, false otherwise.
     */
    function isLoggedIn() {
        const user = getCurrentUser();
        return !!(user && user.id);
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
        return user ? user.mobile : null;
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
        sessionStorage.removeItem('temp_share_id');
        
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
        saveSession
    };

    // Also support AISession for cross-compatibility
    window.AISession = window.V1_SESSION;

    // Run referral capture on load / refresh / login transition
    captureReferral();

    console.log("✅ V1 Common Session Module Loaded.");

    // रीफ्रेश होने पर भी कंसोल में आईडी दिखाने के लिए
    const activeSession = getSession();
    if (activeSession.referral_share_id) {
        console.log(`Current referral session in AI_SESSION: ${activeSession.referral_share_id}`);
    } else {
        console.log("No active referral session found in AI_SESSION.");
    }
    console.log("Current AI_SESSION object:", activeSession);

})(window);