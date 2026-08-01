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
    renderHeader('header-placeholder', pageTitle, pageDescription);
    renderSidebar('sidebar-placeholder');
    // ensure body classes for layout
    document.body.classList.add('admin-ready');
  } catch (err) {
    console.error('admin-main:initAdminLayout failed', err);
  }
}

function manageBackdrop(shouldShow) {
  let backdrop = document.getElementById('sidebar-backdrop');
  if (shouldShow) {
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', () => {
        document.body.classList.remove('mobile-drawer-open');
        manageBackdrop(false);
      });
    }
    backdrop.style.display = 'block';
  } else {
    if (backdrop) {
      backdrop.remove();
    }
  }
}

function initLayoutToggles() {
  const hamburger = document.getElementById('admin-hamburger');
  if (!hamburger) return;

  hamburger.addEventListener('click', () => {
    const isDesktop = window.innerWidth > 768;
    if (isDesktop) {
      document.body.classList.toggle('desktop-collapsed');
    } else {
      const isOpen = document.body.classList.toggle('mobile-drawer-open');
      manageBackdrop(isOpen);
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
