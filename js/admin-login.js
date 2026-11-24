/*
  Admin Login Logic (3-Layer Security: Password + Dual Hardware Lock + Master PIN)
  Includes Emergency Disaster Recovery Key Support (?owner_rescue=...)
*/

(function () {
  'use strict';

  const V1_USERNAME = 'Admin007';
  const V1_PASSWORD = 'ai2345';
  const OWNER_RESCUE_KEY = 'AAROGYAM_MASTER_RECOVER_2026_9922';
  const MASTER_ADMIN_PHONE = '7974422572';
  const DEFAULT_MASTER_PIN = '7974';
  const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

  function getClientDeviceToken() {
    let token = localStorage.getItem('AI_DEVICE_TOKEN');
    if (!token) {
      token = 'DEV_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('AI_DEVICE_TOKEN', token);
    }
    return token;
  }

  function getQueryParam(key) {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get(key) || '';
    } catch (_) {
      return '';
    }
  }

  async function fetchAdminVaultRow() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${MASTER_ADMIN_PHONE}&select=*`, {
        cache: 'no-store',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data && data.length > 0) ? data[0] : null;
    } catch (_) {
      return null;
    }
  }

  const ADMIN_PHONES = ['7974422572', '7049294111'];

  async function fetchAdminAuthRow(userInput) {
    try {
      const cleanMob = String(userInput || '').replace(/\D/g, '').slice(-10);
      if (ADMIN_PHONES.includes(cleanMob) || userInput === 'Admin007' || userInput === V1_USERNAME) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${MASTER_ADMIN_PHONE}&select=*`, {
          cache: 'no-store',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) return data[0];
        }
      }
      const query = `admin_username=eq.${encodeURIComponent(userInput)}`;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?${query}&select=*`, {
        cache: 'no-store',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return (data && data.length > 0) ? data[0] : null;
    } catch (_) {
      return null;
    }
  }

  async function updateAdminDeviceTokens(combinedTokens, targetPhone) {
    const ph = targetPhone || MASTER_ADMIN_PHONE;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${ph}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          device_token: combinedTokens,
          attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
      });
    } catch (_) { }
  }

  async function upsertAdminVaultRow(pinCode, combinedTokens, targetPhone) {
    const ph = targetPhone || MASTER_ADMIN_PHONE;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/team_security_vault?phone=eq.${ph}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          pin_code: pinCode || DEFAULT_MASTER_PIN,
          device_token: combinedTokens,
          attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
      });
    } catch (err) {
      console.warn('Admin vault update error:', err);
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const credForm = document.getElementById('admin-login-form');
    const pinForm = document.getElementById('admin-pin-form');
    const blockedScreen = document.getElementById('admin-blocked-screen');
    const rescueAlert = document.getElementById('rescueAlert');
    const errorAlert = document.getElementById('errorAlert');
    const layerBadge = document.getElementById('layerBadge');
    const currentDevice = getClientDeviceToken();

    // Check Disaster Recovery Key
    const rescueKey = getQueryParam('owner_rescue');
    let rescueAuthorized = false;
    if (rescueKey && rescueKey === OWNER_RESCUE_KEY) {
      rescueAuthorized = true;
      if (rescueAlert) {
        rescueAlert.textContent = '✅ आपातकालीन मालिक रिकवरी स्वीकृत! यह नया डिवाइस अब मुख्य एडमिन हार्डवेयर के रूप में अधिकृत हो गया है।';
        rescueAlert.style.display = 'block';
      }
    }

    function showError(msg) {
      if (errorAlert) {
        errorAlert.textContent = msg;
        errorAlert.style.display = 'block';
      }
    }

    function clearError() {
      if (errorAlert) errorAlert.style.display = 'none';
    }

    let activeAdminPin = DEFAULT_MASTER_PIN;
    let activeAdminPhone = MASTER_ADMIN_PHONE;
    let activeAuthorizedTokens = '';

    // Step 1: Submit Credentials
    if (credForm) {
      credForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const username = document.getElementById('admin-username')?.value.trim();
        const password = document.getElementById('admin-password')?.value;

        const submitBtn = document.getElementById('btnSubmitCredentials');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'सत्यापन हो रहा है...'; }

        // Fetch auth row from Supabase team_security_vault
        let vaultRow = await fetchAdminAuthRow(username);
        if (!vaultRow && (username === V1_USERNAME || username === MASTER_ADMIN_PHONE)) {
          vaultRow = await fetchAdminVaultRow();
        }

        const expectedUser = vaultRow?.admin_username || V1_USERNAME;
        const expectedPhone = vaultRow?.phone || MASTER_ADMIN_PHONE;
        const expectedPass = vaultRow?.admin_password || V1_PASSWORD;

        const isUserMatch = (username === expectedUser || username === expectedPhone || username === V1_USERNAME);
        const isPassMatch = (password === expectedPass || password === V1_PASSWORD);

        if (!isUserMatch || !isPassMatch) {
          showError('अमान्य यूज़रनेम या पासवर्ड! कृपया सही विवरण दर्ज करें।');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'आगे बढ़ें →'; }
          return;
        }

        if (submitBtn) { submitBtn.textContent = 'हार्डवेयर जांच हो रही है...'; }

        // Layer 2: Check Hardware Device
        if (vaultRow && vaultRow.phone) {
          activeAdminPhone = vaultRow.phone;
        }
        if (vaultRow && vaultRow.pin_code && vaultRow.pin_code !== 'RESET') {
          activeAdminPin = vaultRow.pin_code;
        }

        let isDeviceAllowed = false;
        let adminTokens = vaultRow && vaultRow.device_token ? vaultRow.device_token.split(',').map(t => t.trim()).filter(Boolean) : [];

        if (rescueAuthorized) {
          isDeviceAllowed = true;
          if (!adminTokens.includes(currentDevice)) {
            adminTokens.push(currentDevice);
          }
          await updateAdminDeviceTokens(adminTokens.slice(-3).join(','), activeAdminPhone);
        } else if (adminTokens.length === 0) {
          // First device binding (e.g. initial setup)
          isDeviceAllowed = true;
          adminTokens.push(currentDevice);
          await updateAdminDeviceTokens(adminTokens.join(','), activeAdminPhone);
        } else if (adminTokens.includes(currentDevice)) {
          // Already authorized device (Laptop or Mobile)
          isDeviceAllowed = true;
        } else if (adminTokens.length < 3) {
          // Auto-allow up to 3 authorized admin devices (Laptop + Mobile dual access)
          adminTokens.push(currentDevice);
          await updateAdminDeviceTokens(adminTokens.join(','), activeAdminPhone);
          isDeviceAllowed = true;
        }

        if (!isDeviceAllowed) {
          credForm.style.display = 'none';
          if (layerBadge) layerBadge.textContent = 'लेयर 2: हार्डवेयर ब्लॉक';
          if (blockedScreen) blockedScreen.style.display = 'block';
          return;
        }

        // Store active tokens for Step 2
        activeAuthorizedTokens = adminTokens.slice(-3).join(',');

        // Device Authorized! Transition to Step 2: Master Admin PIN
        credForm.style.display = 'none';
        if (pinForm) pinForm.style.display = 'block';
        if (layerBadge) layerBadge.textContent = 'लेयर 2: 4-अंकीय मास्टर PIN दर्ज करें';
        document.getElementById('admin-pin')?.focus();
      });
    }

    // Step 2: Submit 4-Digit Master PIN
    if (pinForm) {
      pinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearError();

        const enteredPin = document.getElementById('admin-pin')?.value.trim();
        if (enteredPin === activeAdminPin || enteredPin === DEFAULT_MASTER_PIN) {
          // Success! Persist admin record to Supabase and grant Admin Session
          const submitPinBtn = pinForm.querySelector('button[type="submit"]');
          if (submitPinBtn) {
            submitPinBtn.disabled = true;
            submitPinBtn.textContent = 'सत्यापित...';
          }
          await upsertAdminVaultRow(enteredPin, activeAuthorizedTokens || currentDevice, activeAdminPhone);

          localStorage.setItem('admin_session', 'true');
          sessionStorage.setItem('admin_verified', 'true');
          window.location.href = 'index.html';
        } else {
          showError('गलत मास्टर PIN! कृपया सही 4-अंकीय पिन दर्ज करें।');
          const pinInput = document.getElementById('admin-pin');
          if (pinInput) { pinInput.value = ''; pinInput.focus(); }
        }
      });

      document.getElementById('btnBackToCredentials')?.addEventListener('click', () => {
        pinForm.style.display = 'none';
        if (credForm) credForm.style.display = 'block';
        if (layerBadge) layerBadge.textContent = 'लेयर 1: ID व पासवर्ड सत्यापन';
        const submitBtn = document.getElementById('btnSubmitCredentials');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'आगे बढ़ें →'; }
      });
    }
  });

})();
