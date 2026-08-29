/**
 * ====================================================================
 * AAROGYAM INDIA - HOME PAGE COMPLETE REVAMP & CMS CONTROLLER
 * Version: 4.0 (Live Admin CMS Sync, Dynamic Hero Slider, Health, Crops, Pashu, Achievers)
 * ====================================================================
 */

'use strict';

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    initHomeCmsLoader();
    initHeroCarousel();
    loadHealthDiseaseCards();
    loadCropProtectionCards();
    loadPashuPalanCards();
    loadAchieversShowcase();
    loadKindleBestsellers();
  });

  // -------------------------------------------------------------
  // 1. ADMIN CMS CONFIGURATION LOADER
  // -------------------------------------------------------------
  function getHomeCmsConfig() {
    try {
      const saved = localStorage.getItem('AAROGYAM_HOME_CMS_CONFIG') || localStorage.getItem('site_page_index') || '{}';
      return JSON.parse(saved);
    } catch (e) {
      return {};
    }
  }

  function initHomeCmsLoader() {
    const config = getHomeCmsConfig();
    const tickerTrack = document.getElementById('home-live-ticker-track');

    if (tickerTrack) {
      if (config.ticker_text) {
        tickerTrack.textContent = config.ticker_text;
      } else {
        const realAlerts = [
          '🌾 10,000+ किसानों का पहला भरोसेमंद मंच | 24×7 AI एक्सपर्ट सहायता उपलब्ध! ✦ प्रमाणित ई-बुक्स व मंडी भाव',
          '⚡ खरीफ फसल मास्टर गाइड 2026 व खेती का डॉक्टर ई-बुक पर बम्पर छूट!',
          '👑 Aarogyam Pro VIP पास - 1 वर्ष का सम्पूर्ण ऑल-एक्सेस मात्र ₹99 में'
        ];
        tickerTrack.textContent = realAlerts.join('   ✦   ');
      }
    }
  }

  // -------------------------------------------------------------
  // 2. HERO BANNER CAROUSEL
  // -------------------------------------------------------------
  let heroSlideIndex = 0;
  let heroSlideTimer = null;

  function initHeroCarousel() {
    const slides = document.querySelectorAll('.home-hero-slide-item');
    const dots = document.querySelectorAll('.hero-dot-indicator');
    if (!slides.length) return;

    function showSlide(index) {
      slides.forEach((s, idx) => {
        s.style.display = idx === index ? 'block' : 'none';
      });
      dots.forEach((d, idx) => {
        d.style.background = idx === index ? '#2563eb' : '#cbd5e1';
        d.style.width = idx === index ? '24px' : '8px';
      });
      heroSlideIndex = index;
    }

    showSlide(0);

    if (slides.length > 1) {
      if (heroSlideTimer) clearInterval(heroSlideTimer);
      heroSlideTimer = setInterval(() => {
        const next = (heroSlideIndex + 1) % slides.length;
        showSlide(next);
      }, 5000);

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          showSlide(idx);
        });
      });
    }
  }

  // -------------------------------------------------------------
  // 3. HEALTH DISEASE CONSULTATION CARDS (10 GLOWING BLUE CARDS)
  // -------------------------------------------------------------
  async function loadHealthDiseaseCards() {
    const grid = document.getElementById('health-diseases-grid');
    if (!grid) return;

    try {
      const config = getHomeCmsConfig();
      let list = config.health_diseases;

      if (!list || !list.length) {
        const res = await fetch('/data/health-diseases.json?v=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          list = data.diseases || [];
        }
      }

      if (!list || !list.length) return;

      grid.innerHTML = list.map(item => `
        <div class="health-disease-card" style="border-top: 4px solid ${item.color || '#3b82f6'};">
          <div>
            <div class="health-card-top">
              <div class="health-card-icon-box" style="color:${item.color};">
                ${item.icon || '🩺'}
              </div>
              <div style="flex:1;">
                <span class="health-symptom-tag" style="background:#1e1b4b;color:#93c5fd;">
                  ${item.badge || 'परामर्श उपलब्ध'}
                </span>
                <h3 style="font-size:1.15rem;font-weight:900;margin:6px 0 2px 0;color:#ffffff;">
                  ${item.title}
                </h3>
              </div>
            </div>

            <div style="font-size:0.86rem;color:#bfdbfe;margin-bottom:10px;line-height:1.45;">
              ${item.desc}
            </div>

            <div style="background:rgba(15,23,42,0.6);padding:10px 12px;border-radius:10px;border:1px solid rgba(59,130,246,0.25);margin-bottom:12px;">
              <div style="font-size:0.75rem;font-weight:800;color:#fde047;margin-bottom:3px;">
                🌿 आयुर्वेदिक व क्लिनिकल उपचार:
              </div>
              <div style="font-size:0.82rem;color:#e2e8f0;line-height:1.4;">
                ${item.remedy}
              </div>
            </div>
          </div>

          <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('${encodeURIComponent(item.title)}') + '%20(लक्षण:%20' + encodeURIComponent('${item.desc.replace(/'/g, '')}') + ')';" class="ai-expert-red-btn">
            <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i>
            <span>AI एक्सपर्ट से समाधान लें</span>
          </a>
        </div>
      `).join('');
    } catch (e) {
      console.warn('[Home Revamp] Error loading health disease cards:', e);
    }
  }

  // -------------------------------------------------------------
  // 4. MAJOR CROPS PROTECTION CARDS (8 CARDS)
  // -------------------------------------------------------------
  async function loadCropProtectionCards() {
    const grid = document.getElementById('major-crops-grid');
    if (!grid) return;

    try {
      const config = getHomeCmsConfig();
      let list = config.crops;

      if (!list || !list.length) {
        const res = await fetch('/data/crop-cards.json?v=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          list = data.crops || [];
        }
      }

      if (!list || !list.length) return;

      grid.innerHTML = list.map(item => `
        <div class="agri-item-card">
          <div class="agri-card-img-wrap">
            <img src="${item.image}" alt="${item.cropName}" loading="lazy" />
            <span style="position:absolute;top:10px;left:10px;background:#15803d;color:#ffffff;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;box-shadow:0 3px 8px rgba(0,0,0,0.3);">
              ${item.season || 'प्रमुख फसल'}
            </span>
          </div>

          <div class="agri-card-content">
            <div>
              <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 6px 0;">
                🌾 ${item.cropName}
              </h3>
              <div style="font-size:0.84rem;color:#bfdbfe;margin-bottom:8px;line-height:1.4;">
                <strong style="color:#fde047;">मुख्य समस्याएं:</strong> ${item.issues}
              </div>
              <div style="background:rgba(15,23,42,0.6);padding:8px 10px;border-radius:8px;border:1px solid rgba(59,130,246,0.25);font-size:0.8rem;color:#cbd5e1;line-height:1.4;">
                <span style="color:#86efac;font-weight:800;">✓ सटीक उपाय:</span> ${item.solution}
              </div>
            </div>

            <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('${encodeURIComponent(item.cropName)} फसल सुरक्षा व स्प्रे फॉर्मूला');" class="ai-expert-red-btn">
              <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i>
              <span>AI एक्सपर्ट से सलाह लें</span>
            </a>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('[Home Revamp] Error loading crop cards:', e);
    }
  }

  // -------------------------------------------------------------
  // 5. PASHU PALAN & LIVESTOCK CARDS (6 CARDS)
  // -------------------------------------------------------------
  async function loadPashuPalanCards() {
    const grid = document.getElementById('pashu-palan-grid');
    if (!grid) return;

    try {
      const config = getHomeCmsConfig();
      let list = config.pashu_cards;

      if (!list || !list.length) {
        const res = await fetch('/data/pashu-cards.json?v=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          list = data.pashu || [];
        }
      }

      if (!list || !list.length) return;

      grid.innerHTML = list.map(item => `
        <div class="agri-item-card">
          <div class="agri-card-img-wrap">
            <img src="${item.image}" alt="${item.animalName}" loading="lazy" />
            <span style="position:absolute;top:10px;left:10px;background:#0284c7;color:#ffffff;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;box-shadow:0 3px 8px rgba(0,0,0,0.3);">
              ${item.badge || 'पशु पोषण'}
            </span>
          </div>

          <div class="agri-card-content">
            <div>
              <h3 style="font-size:1.15rem;font-weight:900;color:#ffffff;margin:0 0 6px 0;">
                🐄 ${item.animalName}
              </h3>
              <div style="font-size:0.84rem;color:#bfdbfe;margin-bottom:8px;line-height:1.4;">
                <strong style="color:#fde047;">प्रमुख लक्ष्य:</strong> ${item.issues}
              </div>
              <div style="background:rgba(15,23,42,0.6);padding:8px 10px;border-radius:8px;border:1px solid rgba(59,130,246,0.25);font-size:0.8rem;color:#cbd5e1;line-height:1.4;">
                <span style="color:#86efac;font-weight:800;">✓ पोषण फॉर्मूला:</span> ${item.solution}
              </div>
            </div>

            <a href="javascript:void(0)" onclick="window.location.href=window.getPersonalizedWhatsAppUrl('${encodeURIComponent(item.animalName)} दुग्ध वृद्धि व पोषण');" class="ai-expert-red-btn">
              <i class="fa-brands fa-whatsapp" style="font-size:1.15rem;"></i>
              <span>AI एक्सपर्ट से सलाह लें</span>
            </a>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('[Home Revamp] Error loading pashu cards:', e);
    }
  }

  // -------------------------------------------------------------
  // 6. ACHIEVERS SCROLLING MARQUEE
  // -------------------------------------------------------------
  async function loadAchieversShowcase() {
    const track = document.getElementById('achievers-track-inner');
    if (!track) return;

    try {
      const config = getHomeCmsConfig();
      let list = config.achievers;

      if (!list || !list.length) {
        const res = await fetch('/data/achievers.json?v=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          list = data.achievers || [];
        }
      }

      if (!list || !list.length) return;

      const doubleList = [...list, ...list];

      track.innerHTML = doubleList.map(item => `
        <div class="achiever-badge-card" style="border-top: 4px solid ${item.badgeColor || '#f59e0b'};">
          <div>
            <!-- Top Row: Avatar & Details -->
            <div style="display:flex;align-items:flex-start;gap:14px;">
              <div class="achiever-avatar-circle" style="border: 2px solid ${item.badgeColor || '#f59e0b'};">
                ${item.avatar || '👨‍💼'}
              </div>
              <div style="flex:1;">
                <h3 class="achiever-name-en">
                  ${item.name}
                </h3>
                <span class="achiever-name-hi">
                  ${item.nameHindi || ''}
                </span>
                <div>
                  <span class="achiever-rank-tag" style="background:${item.badgeBg || 'rgba(245,158,11,0.15)'};color:${item.badgeColor || '#f59e0b'};border:1px solid ${item.badgeColor || '#f59e0b'}50;">
                    ${item.rank}
                  </span>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div style="font-size:0.78rem;color:#94a3b8;margin:12px 0 6px 0;display:flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-location-dot" style="color:#ef4444;font-size:0.85rem;"></i>
              <span>${item.location}</span>
            </div>

            <!-- Achievement Highlight -->
            <div class="achiever-achievement-box">
              <span style="color:#fde047;font-weight:800;">🏆 उपलब्धि:</span> ${item.achievement}
            </div>
          </div>

          <!-- Quote -->
          <div class="achiever-quote-box">
            <i class="fa-solid fa-quote-left" style="color:rgba(255,255,255,0.25);margin-right:5px;"></i>
            ${item.quote}
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('[Home Revamp] Error loading achievers:', e);
    }
  }

  // -------------------------------------------------------------
  // 7. KINDLE 3D BEST SELLERS SHELVES (KHARIF + KHETI KA DOCTOR)
  // -------------------------------------------------------------
  function loadKindleBestsellers() {
    const grid = document.getElementById('home-kindle-bestsellers-grid');
    if (!grid) return;

    const bestsellers = [
      {
        id: 'BK001',
        title: 'खरीफ फसल मास्टर गाइड 2026',
        subtitle: 'धान, सोयाबीन, मक्का व कपास की सम्पूर्ण सचित्र वैज्ञानिक गाइड',
        price: '₹99',
        oldPrice: '₹299',
        image: '/images/books/kharif-master-guide-2026-cover.webp',
        link: '/ebooks/kharif-master-guide-2026.html',
        tag: '🔥 सर्वाधिक लोकप्रिय'
      },
      {
        id: 'BK002',
        title: 'खेती का डॉक्टर (Pocket Doctor)',
        subtitle: 'फसल के 50+ रोगों, कीटों व पोषक तत्वों की कमी की फोटो सहित पहचान व तत्काल स्प्रे फॉर्मूला',
        price: '₹99',
        oldPrice: '₹299',
        image: '/images/books/fasal-ka-doctor-cover.webp',
        link: '/ebooks/kheti-dr.html',
        tag: '🩺 किसान का डॉक्टर'
      }
    ];

    grid.innerHTML = bestsellers.map(book => `
      <div class="shelf-book-card" style="background:#ffffff;border:1.5px solid #e2e8f0;border-radius:18px;padding:18px;display:flex;gap:18px;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,0.06);flex-wrap:wrap;">
        <div class="kindle-book-cover-3d" style="width:110px;height:150px;flex-shrink:0;cursor:pointer;" onclick="window.location.href='${book.link}'">
          <img src="${book.image}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:6px 12px 12px 6px;box-shadow:-6px 8px 20px rgba(0,0,0,0.35);" />
        </div>
        <div style="flex:1;min-width:200px;">
          <span style="background:#fef08a;color:#854d0e;font-size:0.72rem;font-weight:900;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:6px;">
            ${book.tag}
          </span>
          <h3 style="font-size:1.15rem;font-weight:900;margin:0 0 6px 0;color:#0f172a;">
            ${book.title}
          </h3>
          <p style="font-size:0.84rem;color:#64748b;margin:0 0 12px 0;line-height:1.4;">
            ${book.subtitle}
          </p>
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:1.3rem;font-weight:900;color:#16a34a;">${book.price}</span>
            <span style="font-size:0.9rem;color:#94a3b8;text-decoration:line-through;">${book.oldPrice}</span>
            <a href="${book.link}" class="btn" style="background:#facc15;color:#000;font-weight:900;font-size:0.85rem;padding:8px 18px;border-radius:20px;text-decoration:none;margin-left:auto;">
              ⚡ ऑर्डर करें
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

})();
