// --- Theme Restoration ---
// Apply theme as early as possible to prevent flash
(function () {
  const theme = localStorage.getItem('aarogyam-admin-theme') || 'dark';
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  }
})();

/* Admin Main
   Responsibilities:
   - Bootstraps the admin UI layout for each admin page.
   - Renders shared header and sidebar components.
   - Provides foundation for page initialization.
*/

import './supabase.js'; // CRITICAL: Initialize Supabase client globally
import { renderHeader } from './admin-components-header.js';
import { renderSidebar } from './admin-components-sidebar.js';
import { initRouter } from './admin-router.js';
import { initAdminPwa } from './admin-pwa.js';

export function initAdminLayout(pageTitle = 'Admin Panel', pageDescription = '') {
  try {
    // Ensure backdrop exists for mobile drawer
    if (!document.getElementById('sidebar-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    // Always render header with updated title/description
    renderHeader('header-placeholder', pageTitle, pageDescription);

    // Only render sidebar if empty or not yet mounted (preserves sidebar state during SPA navigation)
    const sidebarContainer = document.getElementById('sidebar-placeholder');
    if (sidebarContainer && !sidebarContainer.firstElementChild) {
      renderSidebar('sidebar-placeholder');
    }

    document.body.classList.add('admin-ready');

    // Synchronize desktop sidebar state
    const isDesktopCollapsed = localStorage.getItem('desktop-sidebar-collapsed') === 'true';
    if (window.innerWidth > 768) {
      if (isDesktopCollapsed) {
        document.body.classList.add('desktop-collapsed');
      } else {
        document.body.classList.remove('desktop-collapsed');
      }
    } else {
      document.body.classList.remove('desktop-collapsed');
    }

  } catch (err) {
    console.error('admin-main:initAdminLayout failed', err);
  }
}

let lastToggleTime = 0;

export function toggleMobileDrawer(force) {
  const now = Date.now();
  if (force === undefined && (now - lastToggleTime < 250)) return;
  lastToggleTime = now;

  if (typeof force === 'boolean') {
    document.body.classList.toggle('mobile-drawer-open', force);
  } else {
    document.body.classList.toggle('mobile-drawer-open');
  }
}
window.toggleMobileDrawer = toggleMobileDrawer;

export function toggleDesktopSidebar(force) {
  const now = Date.now();
  if (force === undefined && (now - lastToggleTime < 250)) return;
  lastToggleTime = now;

  const isCollapsed = typeof force === 'boolean'
    ? document.body.classList.toggle('desktop-collapsed', force)
    : document.body.classList.toggle('desktop-collapsed');
  localStorage.setItem('desktop-sidebar-collapsed', isCollapsed ? 'true' : 'false');
  return isCollapsed;
}
window.toggleDesktopSidebar = toggleDesktopSidebar;

export function toggleAdminSidebar(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  if (window.innerWidth > 768) {
    toggleDesktopSidebar();
  } else {
    toggleMobileDrawer();
  }
}
window.toggleAdminSidebar = toggleAdminSidebar;

function initCoreToggles() {
  const backdrop = document.getElementById('sidebar-backdrop');

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileDrawer(false);
    });
  }

  // Unified document-level click delegation
  document.addEventListener('click', (e) => {
    // 1. Mobile Search Trigger Handling
    const mobileSearchBtn = e.target.closest('#admin-mobile-search-btn, .mobile-search-trigger');
    const headerElement = document.querySelector('.admin-header');

    if (mobileSearchBtn && headerElement) {
      e.preventDefault();
      e.stopPropagation();

      const isActive = headerElement.classList.toggle('mobile-search-active');
      const searchView = headerElement.querySelector('.mobile-search-view');
      if (searchView) {
        searchView.style.display = isActive ? 'flex' : 'none';
      }

      const searchInput = headerElement.querySelector('#admin-mobile-search-input');
      if (isActive && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
      return;
    }

    // 2. Hamburger / Sidebar Toggle Handling (Desktop collapse + Mobile drawer)
    const hamburger = e.target.closest('#admin-hamburger, .admin-hamburger, [data-action="toggle-sidebar"], .menu-toggle-btn, button[aria-label*="menu" i], button[aria-label*="Toggle" i]');
    if (hamburger || e.target.closest('.admin-hamburger-icon')) {
      e.preventDefault();
      e.stopPropagation();
      toggleAdminSidebar();
      return;
    }

    // 3. Sidebar Close Button (✕)
    const closeBtn = e.target.closest('#admin-sidebar-close-btn, .admin-sidebar-close-btn');
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileDrawer(false);
      return;
    }

    // 4. Click outside to close mobile drawer on dashboard / content / backdrop
    if (document.body.classList.contains('mobile-drawer-open')) {
      const isInsideSidebar = e.target.closest('.admin-sidebar, #sidebar-placeholder');
      const isHamburger = e.target.closest('#admin-hamburger, .admin-hamburger, [data-action="toggle-sidebar"]');
      if (!isInsideSidebar && !isHamburger) {
        toggleMobileDrawer(false);
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.body.classList.contains('mobile-drawer-open')) {
        toggleMobileDrawer(false);
      }
      const headerElement = document.querySelector('.admin-header');
      if (headerElement && headerElement.classList.contains('mobile-search-active')) {
        headerElement.classList.remove('mobile-search-active');
        const searchView = headerElement.querySelector('.mobile-search-view');
        if (searchView) searchView.style.display = 'none';
      }
    }
  });
}

// --- PWA Install Prompt Logic ---
function initPwaInstallPrompt() {
  const installPromptOverlay = document.getElementById('pwa-install-prompt');
  const installBtn = document.getElementById('pwa-install-btn');
  const laterBtn = document.getElementById('pwa-later-btn');
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Check if user has already dismissed it in this session
    const dismissed = sessionStorage.getItem('pwa_install_dismissed');
    if (!dismissed) {
      // Show the custom install prompt
      if (installPromptOverlay) {
        installPromptOverlay.style.display = 'flex';
        installPromptOverlay.style.pointerEvents = 'auto';
      }
    }
  });

  installBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    if (installPromptOverlay) {
      installPromptOverlay.style.display = 'none';
      installPromptOverlay.style.pointerEvents = 'none';
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
  });

  laterBtn?.addEventListener('click', () => {
    if (installPromptOverlay) {
      installPromptOverlay.style.display = 'none';
      installPromptOverlay.style.pointerEvents = 'none';
    }
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  });

  window.addEventListener('appinstalled', () => {
    if (installPromptOverlay) {
      installPromptOverlay.style.display = 'none';
      installPromptOverlay.style.pointerEvents = 'none';
    }
    deferredPrompt = null;
    console.log('PWA was installed');
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function initPushNotifications() {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    // In-App Universal Notifications are the primary system
  } catch (e) {
    // Safe fallback for push notifications
  }
}

// Lightweight background polling for live admin notifications (every 30s)
function initAdminNotificationPolling() {
  setInterval(() => {
    if (!document.hidden) {
      document.dispatchEvent(new CustomEvent('admin:notifications-updated'));
    }
  }, 30000);
}

// Safely bootstrap admin layout and router once DOM is fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAdminApp);
} else {
  bootstrapAdminApp();
}

function bootstrapAdminApp() {
  try {
    initAdminLayout();
  } catch (e) {
    console.error('initAdminLayout error', e);
  }
  try {
    if (typeof initRouter === 'function') {
      initRouter();
      console.log('✅ admin-router initialized');
    }
  } catch (e) {
    console.error('initRouter error', e);
  }
  try {
    initCoreToggles();
  } catch (e) {
    console.error('initCoreToggles error', e);
  }
  try {
    initAdminNotificationPolling();
  } catch (e) {
    console.error('initAdminNotificationPolling error', e);
  }
  try {
    initAdminPwa();
    initPwaInstallPrompt();
  } catch (e) {
    console.error('initAdminPwa error', e);
  }
}

export function showToast(message, type = 'info') {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bg = type === 'error' ? '#EF4444' : (type === 'success' ? '#10B981' : '#2563EB');
  toast.style.cssText = `background:${bg};color:#fff;font-weight:700;font-size:0.88rem;padding:10px 16px;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.3);display:flex;align-items:center;gap:8px;pointer-events:auto;animation:aiSlideInRight 0.3s ease;`;
  toast.innerHTML = `<span>${type === 'error' ? '✕' : (type === 'success' ? '✓' : 'ℹ')}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
window.showToast = showToast;

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function createStatusLabel(status) {
  return `<span class="status-pill ${status}">${status.replace(/\b\w/g, c => c.toUpperCase())}</span>`;
}

// Global listener: wire header search to page-level search hooks
document.addEventListener('admin:global-search', (e) => {
  // pages can listen to this event to perform searches
  // keep this here so pages don't need to query header repeatedly
  // No-op in main
});

console.log('✅ admin-main.js loaded');
