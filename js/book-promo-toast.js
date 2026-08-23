/**
 * Aarogyam India - Smart User Promo & Toast Engine
 * 1. Shows Subscriber VIP Modal (₹999 / ₹99) for logged-in non-subscribers.
 * 2. Shows Book Promo Toasts (₹99) strictly filtering out items the user has already purchased.
 */
(function() {
  'use strict';

  const ALL_PROMO_BOOKS = [
    {
      id: 'BK002',
      alias: 'kheti-dr',
      title: '🌾 खेती डॉक्टर - सम्पूर्ण फसल सुरक्षा',
      desc: 'फसलों के 50+ रोगों का सटीक ऑर्गेनिक व वैज्ञानिक उपचार गाइड।',
      oldPrice: '₹299',
      offerPrice: '₹99',
      link: '/ebooks/checkout.html?product=kheti-dr&id=BK002&amount=99&title=Kheti%20Doctor%20Book'
    },
    {
      id: 'BK001',
      alias: 'kharif-fasal',
      title: '🌿 खरीफ फसल - उत्पादन एवं कीट सुरक्षा',
      desc: 'धान, सोयाबीन, मक्का व दलहनी फसलों में बम्पर पैदावार का फॉर्मूला।',
      oldPrice: '₹299',
      offerPrice: '₹99',
      link: '/ebooks/checkout.html?product=kharif-fasal&id=BK001&amount=99&title=Kharif%20Fasal%20Masterclass'
    }
  ];

  function isUserLoggedIn() {
    try {
      const user = localStorage.getItem('AI_USER') || 
                   localStorage.getItem('AI_PROFILE') || 
                   localStorage.getItem('UCAS_USER') || 
                   localStorage.getItem('user_id') || 
                   localStorage.getItem('aim_user_mobile') || 
                   localStorage.getItem('ucas_user_id');
      return Boolean(user && user !== '{}' && user !== 'null' && user !== 'undefined');
    } catch (e) {
      return false;
    }
  }

  function getUserPurchasedBookIds() {
    const purchased = new Set();
    try {
      const list = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
      if (Array.isArray(list)) {
        list.forEach(p => {
          if (p.book_id) purchased.add(p.book_id.toUpperCase());
          if (p.id) purchased.add(p.id.toUpperCase());
        });
      }
    } catch (e) {}
    return purchased;
  }

  function isUserActiveSubscriber() {
    try {
      if (localStorage.getItem('user_is_subscriber') === 'true') return true;
      const user = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
      if (user.is_subscriber) return true;
      const purchased = getUserPurchasedBookIds();
      if (purchased.has('SUB001') || purchased.has('SUBSCRIPTION')) return true;
    } catch (e) {}
    return false;
  }

  // ==========================================
  // 1. LOGGED-IN SUBSCRIBER VIP POPUP
  // ==========================================
  function checkAndShowSubscriberModal() {
    if (!isUserLoggedIn()) return;
    if (isUserActiveSubscriber()) return; // Don't show if already a subscriber

    if (sessionStorage.getItem('ai_subscriber_modal_shown') === 'true') return;

    let modal = document.getElementById('ai-subscriber-vip-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ai-subscriber-vip-modal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: aiFadeIn 0.3s ease;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="
        background: #ffffff;
        color: #1e293b;
        max-width: 440px;
        width: 100%;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        overflow: hidden;
        position: relative;
        border: 2px solid #F59E0B;
        text-align: center;
      ">
        <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 26px 20px 22px; color: #ffffff; position: relative;">
          <button type="button" id="ai-btn-close-sub-modal" style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.15rem;
            cursor: pointer;
          ">&times;</button>
          
          <div style="font-size: 2.4rem; margin-bottom: 4px;">👑</div>
          <h2 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: #FBBF24;">
            Aarogyam Pro VIP सदस्यता
          </h2>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #94A3B8;">
            UCAS मार्केटिंग इंजन व सम्पूर्ण डिजिटल लाइब्रेरी का ऑल-एक्सेस
          </p>
        </div>

        <div style="padding: 22px 20px;">
          <div style="background: #FFFBEB; border: 1.5px dashed #F59E0B; border-radius: 12px; padding: 12px 14px; margin-bottom: 18px; font-size: 0.84rem; color: #92400E; line-height: 1.45;">
            ⚡ <strong>विशेष ऑफर:</strong> ₹999/वर्ष में सभी वीडियो/इमेज लैंडिंग पेज तुरंत लाइव बनाने, वेबिनार व ई-बुक्स का 1-वर्षीय ऑल-एक्सेस पास पाएं।
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="/ebooks/checkout.html?product=subscription&id=SUB001&amount=999&title=Aarogyam%20Pro%20VIP%20Annual%20Subscription" style="
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: #ffffff;
              padding: 13px 18px;
              border-radius: 12px;
              font-weight: 800;
              font-size: 1rem;
              text-decoration: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            ">
              <span>👑 अभी VIP सदस्य बनें (₹999 / वर्ष)</span>
              <span>&rarr;</span>
            </a>

            <a href="/ebooks/checkout.html?product=kheti-dr&id=BK002&amount=99&title=Kheti%20Doctor%20Book" style="
              background: #FEF3C7;
              border: 1.5px solid #F59E0B;
              color: #92400E;
              padding: 10px 16px;
              border-radius: 10px;
              font-weight: 800;
              font-size: 0.88rem;
              text-decoration: none;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
            ">
              <span>📖 या मात्र ₹99 में ई-बुक लेकर एक्टिवेट करें</span>
            </a>
          </div>

          <div style="margin-top: 14px; font-size: 0.76rem; color: #94A3B8;">
            100% सुरक्षित भुगतान • GST रसीद तुरंत My Purchases में उपलब्ध
          </div>
        </div>
      </div>
    `;

    sessionStorage.setItem('ai_subscriber_modal_shown', 'true');

    document.getElementById('ai-btn-close-sub-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  // ==========================================
  // 2. ROTATING UNPURCHASED BOOK PROMO TOASTS
  // ==========================================
  let currentBookIndex = 0;

  function playSoftChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  }

  function showPromoToast() {
    if (isUserActiveSubscriber()) return; // VIP Subscribers don't need promos

    const purchasedIds = getUserPurchasedBookIds();
    // Filter strictly to unpurchased books
    const availableBooks = ALL_PROMO_BOOKS.filter(b => !purchasedIds.has(b.id));

    if (availableBooks.length === 0) return; // User bought all featured books!

    // Check dismissed cooldown
    const dismissedUntil = localStorage.getItem('ai_book_promo_dismissed_until');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    let toastContainer = document.getElementById('ai-book-promo-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'ai-book-promo-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 9999;
        max-width: 360px;
        width: calc(100% - 48px);
        pointer-events: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(toastContainer);
    }

    const book = availableBooks[currentBookIndex % availableBooks.length];
    currentBookIndex++;

    toastContainer.innerHTML = `
      <div style="
        background: #ffffff;
        border: 1.5px solid #10b981;
        border-radius: 14px;
        box-shadow: 0 20px 30px -10px rgba(16, 185, 129, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.1);
        padding: 12px 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        position: relative;
        overflow: hidden;
      " id="ai-book-promo-card">
        
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 2px 8px;
          border-bottom-right-radius: 8px;
          text-transform: uppercase;
        ">
          ⚡ 67% OFF
        </div>

        <button type="button" id="ai-btn-dismiss-book-toast" style="
          position: absolute;
          top: 6px;
          right: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.1rem;
          cursor: pointer;
          line-height: 1;
          padding: 2px;
        " title="बंद करें">&times;</button>

        <div style="
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #ecfdf5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
          border: 1px solid #a7f3d0;
          margin-top: 4px;
        ">
          📖
        </div>

        <div style="flex: 1; min-width: 0; margin-top: 4px;">
          <div style="font-weight: 800; font-size: 0.86rem; color: #0f172a; line-height: 1.25; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${book.title}
          </div>
          <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 6px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
            ${book.desc}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 1rem; font-weight: 900; color: #059669;">${book.offerPrice}</span>
              <span style="font-size: 0.75rem; text-decoration: line-through; color: #94A3B8;">${book.oldPrice}</span>
            </div>
            <a href="${book.link}" style="
              background: #059669;
              color: #ffffff;
              font-size: 0.75rem;
              font-weight: 700;
              padding: 4px 10px;
              border-radius: 6px;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
            ">
              <span>अभी खरीदें</span> <span>&rarr;</span>
            </a>
          </div>
        </div>

      </div>
    `;

    playSoftChime();

    document.getElementById('ai-btn-dismiss-book-toast')?.addEventListener('click', () => {
      const card = document.getElementById('ai-book-promo-card');
      if (card) card.style.display = 'none';
      localStorage.setItem('ai_book_promo_dismissed_until', (Date.now() + 15 * 60 * 1000).toString());
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('admin') || path.includes('checkout') || path.includes('payment')) return;

    if (isUserLoggedIn()) {
      // For Logged-in user: Show VIP Subscriber offer modal after 2.5 seconds if unpurchased
      setTimeout(checkAndShowSubscriberModal, 2500);
      // Show unpurchased book toast after 8 seconds
      setTimeout(showPromoToast, 8000);
    } else {
      // For Guest user: Show unpurchased book promo toast after 10 seconds
      setTimeout(showPromoToast, 10000);
    }

    // Recurring rotation every 60 seconds
    setInterval(showPromoToast, 60000);
  });

})();
