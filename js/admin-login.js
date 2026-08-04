/*
  Admin Login Logic (V1 - Isolated)
  - This file handles the client-side logic for admin/login.html.
  - It is self-contained and does not depend on the main admin panel's scripts.
*/

(function () {
  'use strict';

  // V1 Internal Credentials
  const V1_USERNAME = 'Admin007';
  const V1_PASSWORD = 'ai2345';

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    
    if (loginForm) {
      loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === V1_USERNAME && password === V1_PASSWORD) {
          // On successful login, create a session marker.
          localStorage.setItem('admin_session', 'true');
          // Redirect to the main admin panel.
          window.location.href = 'index.html';
        } else {
          // On failed login, show an error.
          alert('Login failed. Please check your username and password.');
        }
      });
    }
  });

})();
