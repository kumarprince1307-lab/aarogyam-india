/* =================================================================
   AAROGYAM INDIA - V1 COMMON SESSION MODULE
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
        // A full clear can be used for aggressive cleanup if needed.
        // localStorage.clear(); 
        
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
        requireLogin
    };

    console.log("✅ V1 Common Session Module Loaded.");

})(window);