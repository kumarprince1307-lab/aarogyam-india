/* =================================================================
   AAROGYAM INDIA - V1 COMMON SESSION MODULE (REPAIRED)
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
     * Gets the main session object from localStorage.
     * This is for internal use; prefer `initializeSession` for public use.
     * @returns {object} The AI_SESSION object.
     */
    function getSession() {
        try {
            const sessionString = localStorage.getItem(SESSION_KEY);
            return sessionString ? JSON.parse(sessionString) : {};
        } catch (e) {
            console.error("Error parsing AI_SESSION from localStorage", e);
            return {}; // Return a clean slate on error
        }
    }

    /**
     * Initializes the session.
     * Ensures that the AI_SESSION object exists in localStorage.
     * @returns {object} The AI_SESSION object.
     */
    function initializeSession() {
        try {
            const sessionString = localStorage.getItem(SESSION_KEY);
            if (!sessionString) {
                const newSession = {};
                saveSession(newSession);
                console.log("AI_SESSION created in localStorage.");
                return newSession;
            }
            return JSON.parse(sessionString);
        } catch (e) {
            console.error("Error initializing AI_SESSION", e);
            const freshSession = {};
            saveSession(freshSession);
            return freshSession;
        }
    }

    /**
     * Saves the main session object to localStorage.
     * @param {object} session - The AI_SESSION object to save.
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
     * Adheres to the "First Click Rule": if a referral_share_id already
     * exists in the session, it will not be overwritten.
     */
    function captureReferral() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const shareId = urlParams.get('share_id');

            const isValidShareId = (id) => id && /^AI\d{6}$/.test(id);

            if (isValidShareId(shareId)) {
                const session = initializeSession(); // Use the initializing getter

                // First Click Rule: Only set the referral ID if one doesn't already exist.
                if (!session.referral_share_id) {
                    session.referral_share_id = shareId;
                    saveSession(session);
                    console.log(`Referral session started. share_id "${shareId}" captured in AI_SESSION.`);
                } else {
                    console.log(`Referral session already exists in AI_SESSION. First click rule applied.`);
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
            const session = getSession(); // Internal get is fine here
            return session.referral_share_id || null;
        } catch (e) {
            console.error("Error retrieving referral ID from AI_SESSION", e);
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
        
        console.log("User session cleared. Reloading...");
        window.location.reload();
    }

    /**
     * If the user is not logged in, redirects them to the My Library page
     * to trigger the login popup.
     * @param {string} [redirectTo='../ebooks/my-library.html'] - The URL to redirect to.
     */
    function requireLogin(redirectTo = '/my-library.html') { // Note: Path changed to absolute
        if (!isLoggedIn()) {
            console.warn("Authentication required. Redirecting to login page.");
            alert("Please log in to access this page.");
            window.location.href = redirectTo;
        }
    }

    // Expose functions to the global window object to be used by other scripts
    window.AISession = {
        isLoggedIn,
        getCurrentUser,
        getCurrentProfile,
        getUserId,
        getMobile,
        logout,
        requireLogin,
        getReferralId,
        getSession: initializeSession, // Expose the initializer
        saveSession
    };

    // --- INITIALIZATION ---
    // 1. Ensure the session object exists.
    initializeSession();
    // 2. Capture referral information on every page load.
    captureReferral();

    console.log("✅ AISession Common Session Module Loaded.");
    const currentSession = initializeSession();
    const currentReferral = currentSession.referral_share_id;

    if (currentReferral) {
        console.log(`Current referral session in AI_SESSION: ${currentReferral}`);
    } else {
        console.log("No active referral session found in AI_SESSION.");
    }
    console.log("Current AI_SESSION object:", currentSession);

})(window);