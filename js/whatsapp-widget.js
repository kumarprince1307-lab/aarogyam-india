/* =================================================================
   AAROGYAM INDIA - UNIVERSAL WHATSAPP HELPDESK & COMMUNITY FLOATING WIDGET
   - Zero-Egress, lightweight, responsive
   - Auto-attaches to bottom of public pages without blocking navigation
   - Smooth pulse animation & tooltips
================================================================= */

(function () {
  'use strict';

  function initWhatsAppWidget() {
    // Avoid duplicate initialization, on home page or in admin panel
    if (document.getElementById('aim-whatsapp-floater') || window.location.pathname.includes('/admin/') || window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('index.html')) return;

    const widget = document.createElement('div');
    widget.id = 'aim-whatsapp-floater';
    widget.className = 'aim-whatsapp-floater';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Official WhatsApp Support');

    const defaultPhone = '919981888998';
    const currentUrl = window.location.href;
    const defaultMsg = encodeURIComponent(`नमस्ते Aarogyam India! मुझे वेबसाइट से सहायता चाहिए: ${currentUrl}`);

    widget.innerHTML = `
      <style>
        .aim-whatsapp-floater {
          position: fixed;
          bottom: 24px;
          left: 20px;
          z-index: 9990;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          pointer-events: auto;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .aim-whatsapp-btn {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
          position: relative;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .aim-whatsapp-btn:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 211, 102, 0.6);
        }
        .aim-whatsapp-btn svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
        }
        .aim-whatsapp-btn::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.4);
          animation: aimWaPulse 2.2s infinite;
          z-index: -1;
        }
        @keyframes aimWaPulse {
          0% { transform: scale(1); opacity: 0.8; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .aim-whatsapp-tooltip {
          background: #0f172a;
          color: #f8fafc;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          display: none;
        }
        @media (min-width: 768px) {
          .aim-whatsapp-tooltip {
            display: block;
          }
          .aim-whatsapp-floater:hover .aim-whatsapp-tooltip {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @media (max-width: 640px) {
          .aim-whatsapp-floater {
            bottom: 75px; /* Above mobile bottom navigation bar */
            left: 16px;
          }
          .aim-whatsapp-btn {
            width: 48px;
            height: 48px;
          }
          .aim-whatsapp-btn svg {
            width: 26px;
            height: 26px;
          }
        }
      </style>
      <a href="https://api.whatsapp.com/send?phone=${defaultPhone}&text=${defaultMsg}" 
         target="_blank" 
         rel="noopener noreferrer" 
         class="aim-whatsapp-btn" 
         title="Aarogyam India WhatsApp Helpdesk">
        <svg viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.802.813 2.796.813 3.183 0 5.77-2.587 5.77-5.767 0-3.18-2.587-5.766-5.77-5.766zm3.374 8.167c-.145.407-.745.748-1.026.793-.27.043-.623.076-1.789-.408-.99-.413-1.631-1.424-1.68-1.489-.048-.066-.398-.53-.398-1.01 0-.48.251-.715.34-.804.09-.09.197-.113.262-.113.066 0 .132.001.189.004.06.003.14-.023.218.165.082.197.279.68.303.73.025.049.041.107.008.172-.033.066-.05.107-.099.165-.049.057-.104.128-.148.172-.049.049-.101.103-.043.202.057.1.255.421.547.681.376.335.693.439.791.488.099.049.156.041.214-.025.057-.066.246-.288.312-.386.066-.099.132-.082.222-.049.09.033.575.271.673.32.099.049.164.074.189.115.025.041.025.241-.12.648z"/>
        </svg>
      </a>
      <span class="aim-whatsapp-tooltip">💬 Official WhatsApp Helpdesk</span>
    `;

    document.body.appendChild(widget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppWidget);
  } else {
    initWhatsAppWidget();
  }
})();
