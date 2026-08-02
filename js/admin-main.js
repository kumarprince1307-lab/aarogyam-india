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

import { renderHeader } from './admin-components-header.js';
import { renderSidebar } from './admin-components-sidebar.js';
import { initRouter } from './admin-router.js';

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

function initLayoutToggles() {
  const hamburger = document.getElementById('admin-hamburger');
  const backdrop = document.getElementById('sidebar-backdrop');

  const toggleMobileDrawer = (force) => {
    document.body.classList.toggle('mobile-drawer-open', force);
  };

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isDesktop = window.innerWidth > 768;
      if (isDesktop) {
        const isCollapsed = document.body.classList.toggle('desktop-collapsed');
        localStorage.setItem('desktop-sidebar-collapsed', isCollapsed);
      } else {
        toggleMobileDrawer();
      }
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => toggleMobileDrawer(false));
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('mobile-drawer-open')) {
      toggleMobileDrawer(false);
    }
  });
}

// Immediately render the base layout and start the router so index.html becomes the SPA entry
try {
  // render layout into placeholders
  initAdminLayout();
  // Initialize router immediately after synchronous layout rendering
  initRouter();
  console.log('✅ admin-router initialized');
  // Setup responsive UI toggles
  initLayoutToggles();
} catch (e) {
  console.error('admin-main bootstrap failed', e);
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
