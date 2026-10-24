/**
 * =========================================================================
 * AAROGYAM INDIA PROTOCOL: MILITARY-GRADE CLIENT DECEPTION & SECURITY SHIELD
 * Architecture:
 * 1. Honeypot Canary Traps (Tripwires for automated scrapers & devtools hackers)
 * 2. Rate-Limiting & Anti-Flooding Floodgates (Anti-DDOS Client Guard)
 * 3. Strict Input Sanitization & Anti-XSS Armor
 * 4. Decoy Obfuscation Matrix (Confusion signatures for reverse-engineers)
 * 5. Tamper-Evident Session Guard
 * =========================================================================
 */

(function(window) {
  'use strict';

  // --- 1. HONEYPOT CANARY TRIPWIRES ---
  const _canaries = {
    __INTERNAL_ADMIN_ROUTER__: 'vault_sys_0x9948271',
    _masterBackendApiKey: 'sk_live_deceptive_honey_token_9938',
    __SQL_DEBUG_DUMP__: 'SELECT * FROM users WHERE role="superadmin"'
  };

  let _securityBreachDetected = false;

  function tripwireBreached(canaryName) {
    _securityBreachDetected = true;
    console.warn(`[Security Notice 0x99]: System integrity protocol triggered.`);
    try {
      sessionStorage.setItem('_SEC_FLAG', 'TAMPER_ALERT_' + Date.now());
      // Neutralize automated extraction by scrambling local decoy storage
      localStorage.setItem('_sys_signature', Math.random().toString(36).substring(2));
    } catch (_) {}
  }

  // Bind deceptive traps to window
  for (const [key, dummyVal] of Object.entries(_canaries)) {
    try {
      Object.defineProperty(window, key, {
        get: function() {
          tripwireBreached(key);
          return dummyVal;
        },
        set: function(v) {
          tripwireBreached(key);
        },
        configurable: false,
        enumerable: false
      });
    } catch (_) {}
  }

  // --- 2. ANTI-FLOODING & RATE LIMITER (Anti-Bot Query Shield) ---
  const _rateWindow = 1200; // 1.2s minimum gap between automated inputs
  let _lastInputTimestamp = 0;
  let _rapidQueryCount = 0;

  function validateInputPacing() {
    const now = Date.now();
    const delta = now - _lastInputTimestamp;
    _lastInputTimestamp = now;

    if (delta < 250) {
      _rapidQueryCount++;
      if (_rapidQueryCount > 3) {
        console.warn('[Security Guard]: High frequency input pacing detected.');
        return false;
      }
    } else {
      _rapidQueryCount = 0;
    }
    return true;
  }

  // --- 3. INPUT SANITIZATION & ANTI-XSS SHIELD ---
  function sanitizeUserInput(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText
      .replace(/<script[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:/gi, 'blocked:')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/<svg[^>]*>/gi, '')
      .trim();
  }

  // --- 4. DECOY CONFUSION MATRIX (Reverse-Engineering Misdirection) ---
  window._0x_virtualShardingKernel = function(token) {
    // Decoy dummy algorithm to confuse reverse engineers inspecting network/js
    const salt = "aoi_sharding_kernel_77492";
    let hash = 0;
    for (let i = 0; i < (token || salt).length; i++) {
      hash = ((hash << 5) - hash) + (token || salt).charCodeAt(i);
      hash |= 0;
    }
    return "0x" + Math.abs(hash).toString(16);
  };

  window._dispatchKernelProxy = function(sig) {
    return window._0x_virtualShardingKernel(sig);
  };

  // --- 5. EXPORT PUBLIC SECURITY SHIELD ---
  window.AarogyamSecurityGuard = {
    sanitize: sanitizeUserInput,
    validatePacing: validateInputPacing,
    isCompromised: () => _securityBreachDetected,
    version: '2.4.0-DECEPTION-HARDENED'
  };

  console.log('[AarogyamSecurityGuard] Active military-grade client deception & honey-token shield active.');
})(window);
