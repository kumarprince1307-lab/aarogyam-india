// --- Theme Restoration ---
// Apply theme as early as possible to prevent flash
(function() {
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

// Function to check admin session
function checkAdminSession() {
  const session = localStorage.getItem("AI_SESSION");
  if (!session) {
    // Redirect to login page if no session exists
    window.location.href = '../admin/login.html';
    return false; // Indicate that redirection happened
  }
  return true; // Indicate that session exists
}

export function initAdminLayout(pageTitle = 'Admin Panel', pageDescription = '') {
  try {
    // Ensure backdrop exists for mobile drawer
    if (!document.getElementById('sidebar-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    
    renderHeader('header-placeholder', pageTitle, pageDescription);
    renderSidebar('sidebar-placeholder');
    document.body.classList.add('admin-ready');
    
    // Restore desktop sidebar state
    const isDesktopCollapsed = localStorage.getItem('desktop-sidebar-collapsed') === 'true';
    if (isDesktopCollapsed && window.innerWidth > 768) {
      document.body.classList.add('desktop-collapsed');
    }

  } catch (err) {
    console.error('admin-main:initAdminLayout failed', err);
  }
}

export function toggleMobileDrawer(force) {
  document.body.classList.toggle('mobile-drawer-open', force);
}

function initCoreToggles() {
  const backdrop = document.getElementById('sidebar-backdrop');

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMobileDrawer(false));
  }
  
  // Document-level delegation ensuring clean separation between search and hamburger
  document.addEventListener('click', (e) => {
    // 1. Mobile Search Trigger Handling (Targeting all potential search button IDs/classes)
    const mobileSearchBtn = e.target.closest('#admin-mobile-search-btn, .mobile-search-trigger, [data-action="mobile-search"], button[title*="Search"], .admin-header-right button:first-child');
    const headerElement = document.querySelector('.admin-header');
    
    if (mobileSearchBtn && headerElement) {
      e.preventDefault();
      e.stopPropagation();
      
      // Toggle search active class safely
      const isActive = headerElement.classList.toggle('mobile-search-active');
      
      // Ensure mobile-search-view display is properly handled inline if CSS selector misses it
      const searchView = headerElement.querySelector('.mobile-search-view');
      if (searchView) {
        searchView.style.display = isActive ? 'flex' : 'none';
      }

      const searchInput = headerElement.querySelector('.mobile-search-view input, .mobile-search-view .admin-input, input[type="search"]');
      if (isActive && searchInput) {
        setTimeout(() => searchInput.focus(), 100);
      }
      return;
    }

    // 2. Hamburger / Sidebar Toggle Handling
    const hamburger = e.target.closest('#admin-hamburger, .admin-hamburger, .menu-btn, [data-action="toggle-sidebar"]');
    if (hamburger) {
      e.stopPropagation();
      const isDesktop = window.innerWidth > 768;
      if (isDesktop) {
        const isCollapsed = document.body.classList.toggle('desktop-collapsed');
        localStorage.setItem('desktop-sidebar-collapsed', isCollapsed);
      } else {
        toggleMobileDrawer();
      }
      return;
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

// Safely bootstrap admin layout and router once DOM is fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapAdminApp);
} else {
  bootstrapAdminApp();
}

function bootstrapAdminApp() {
  try {
    // Perform session check before anything else
    if (!checkAdminSession()) {
      return; // Stop further execution if session is not valid
    }

    initAdminLayout();
    if (typeof initRouter === 'function') {
      initRouter();
      console.log('✅ admin-router initialized');
    } else {
      console.warn('⚠️ initRouter is not available yet.');
    }
    initCoreToggles();
  } catch (e) {
    console.error('admin-main bootstrap failed', e);
  }
}

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