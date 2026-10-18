/**
 * Aarogyam India - Netsurf Pathfinder Quarterly Engine
 * Dynamic, Modular, Future-Proof (Quarterly Update via JSON)
 * Integrated with Sakhi AI, Session Tracking & Native Share Engine
 */

(function (window, document) {
  'use strict';

  const DATA_PATH = '/data/pathfinder-quarter.json?v=' + Date.now();
  let pathfinderData = null;
  let activeAudioUtt = null;
  let isPlayingAudio = false;

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initPathfinderPage);

  async function initPathfinderPage() {
    try {
      const res = await fetch(DATA_PATH);
      if (!res.ok) throw new Error('Failed to load pathfinder data');
      pathfinderData = await res.json();

      renderHeaderAndMeta();
      renderHeroCarousel();
      renderKpiHighlights();
      renderCelebrateSegment();
      renderBuildSegment();
      renderRiseSegment();
      renderIstockSegment();
      renderVideoSystem();
      renderFaqAndQuickChips();
      renderUserSessionStatus();
      resolveSponsorCounselor();
      initAudioAutoplaySafety();

      console.log('✅ Pathfinder Q3 Engine initialized successfully.');
    } catch (err) {
      console.error('Pathfinder initialization error:', err);
    }
  }

  // 1. Meta & Header Branding
  function renderHeaderAndMeta() {
    if (!pathfinderData) return;
    const titleEl = document.getElementById('pfPageTitle');
    const subtitleEl = document.getElementById('pfPageSubtitle');
    const badgeEl = document.getElementById('pfQuarterBadge');

    if (titleEl) titleEl.textContent = pathfinderData.quarter_heading || 'Q3 PATHFINDER';
    if (subtitleEl) subtitleEl.textContent = pathfinderData.campaign_tagline || '';
    if (badgeEl) badgeEl.textContent = pathfinderData.quarter_name || 'Quarter 3';
  }

  // 2. Hero Carousel (4 Rotating PPT Banners)
  let currentBannerIdx = 0;
  let bannerTimer = null;

  function renderHeroCarousel() {
    const wrap = document.getElementById('pfHeroCarouselWrap');
    if (!wrap || !pathfinderData.hero_banners) return;

    const banners = pathfinderData.hero_banners;
    wrap.innerHTML = `
      <div class="pf-carousel-stage" id="pfCarouselStage">
        ${banners.map((b, i) => `
          <div class="pf-carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
            <img src="${b.image}" alt="${b.title}" loading="${i === 0 ? 'eager' : 'lazy'}" class="pf-slide-img" />
            <div class="pf-slide-overlay">
              <span class="pf-slide-badge">${b.badge || 'PROMOTION'}</span>
              <h2 class="pf-slide-title">${b.title}</h2>
              <p class="pf-slide-sub">${b.subtitle}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="pf-carousel-nav">
        <button type="button" class="pf-nav-btn prev" onclick="window.prevPfSlide()" aria-label="पिछला">❮</button>
        <div class="pf-carousel-dots" id="pfCarouselDots">
          ${banners.map((_, i) => `<span class="pf-dot ${i === 0 ? 'active' : ''}" onclick="window.goToPfSlide(${i})"></span>`).join('')}
        </div>
        <button type="button" class="pf-nav-btn next" onclick="window.nextPfSlide()" aria-label="अगला">❯</button>
      </div>
    `;

    startBannerAutoPlay(banners.length);
  }

  function startBannerAutoPlay(total) {
    if (bannerTimer) clearInterval(bannerTimer);
    bannerTimer = setInterval(() => {
      currentBannerIdx = (currentBannerIdx + 1) % total;
      updateSlideDisplay();
    }, 5000);
  }

  function updateSlideDisplay() {
    const slides = document.querySelectorAll('.pf-carousel-slide');
    const dots = document.querySelectorAll('.pf-dot');
    slides.forEach((s, idx) => s.classList.toggle('active', idx === currentBannerIdx));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentBannerIdx));
  }

  window.prevPfSlide = function () {
    if (!pathfinderData?.hero_banners) return;
    const len = pathfinderData.hero_banners.length;
    currentBannerIdx = (currentBannerIdx - 1 + len) % len;
    updateSlideDisplay();
  };

  window.nextPfSlide = function () {
    if (!pathfinderData?.hero_banners) return;
    const len = pathfinderData.hero_banners.length;
    currentBannerIdx = (currentBannerIdx + 1) % len;
    updateSlideDisplay();
  };

  window.goToPfSlide = function (idx) {
    currentBannerIdx = idx;
    updateSlideDisplay();
  };

  // 3. KPI Highlights (High Contrast: Blue Card, White Bold Text, Clickable with Smooth Scroll)
  function renderKpiHighlights() {
    const wrap = document.getElementById('pfKpiGrid');
    if (!wrap || !pathfinderData.kpi_summary) return;

    wrap.innerHTML = pathfinderData.kpi_summary.map(item => `
      <div class="pf-kpi-card" onclick="window.scrollToPfSection('${item.target || 'pfCelebrateWrap'}')" title="${item.label} पर जाएं" role="button" tabindex="0">
        <div class="pf-kpi-top-row">
          <span class="pf-kpi-badge">${item.badge}</span>
          <span class="pf-kpi-arrow-chip"><i class="fa-solid fa-arrow-down"></i></span>
        </div>
        <div class="pf-kpi-val">${item.value}</div>
        <div class="pf-kpi-label">${item.label}</div>
        <div class="pf-kpi-sub">${item.subtext}</div>
        <div class="pf-kpi-tap-hint">👇 टैप करें • विवरण देखें</div>
      </div>
    `).join('');
  }

  // Smooth scroll helper for KPI click navigation
  window.scrollToPfSection = function (targetId) {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('pf-section-flash');
      setTimeout(() => {
        el.classList.remove('pf-section-flash');
      }, 2000);
    }
  };

  // 4. Pillar 1: CELEBRATE Segment
  function renderCelebrateSegment() {
    const el = document.getElementById('pfCelebrateWrap');
    if (!el || !pathfinderData.segments?.celebrate) return;
    const seg = pathfinderData.segments.celebrate;

    el.innerHTML = `
      <div class="pf-segment-header">
        <div class="pf-seg-tag">PILLAR 1</div>
        <h3 class="pf-seg-title">${seg.pillar_title}</h3>
        <button type="button" class="pf-audio-btn" onclick="window.playSegmentAudio('celebrate')" title="ऑडियो सुनें">
          <i class="fa-solid fa-volume-high"></i> <span>ऑडियो विवरण</span>
        </button>
      </div>

      <!-- New E-Tailer Card -->
      <div class="pf-offer-hero-card">
        <div class="pf-offer-badge">🎉 अक्टूबर एक्सक्लूसिव ऑफर</div>
        <h4 class="pf-card-head">${seg.new_etailer_offer.title}</h4>
        <div class="pf-highlight-val">30% SPECIAL DISCOUNT</div>
        <p class="pf-card-desc">${seg.new_etailer_offer.benefit}</p>
        <div class="pf-card-note">💡 ${seg.new_etailer_offer.note}</div>
      </div>

      <!-- 1. Floating Animated Banner: 30% E-Tailer Offer -->
      <div class="pf-floating-banner-wrap">
        <img src="/images/banners/30 offer-banner-1.webp" alt="Netsurf 30% New E-Tailer Offer" class="pf-floating-banner-img" onerror="this.onerror=null;this.src='/images/banners/30_offer_banner_1.webp';" loading="lazy" />
      </div>

      <!-- Weekly Rockstar Table -->
      <div class="pf-card-box" id="pfRockstarCard">
        <h4 class="pf-card-head"><i class="fa-solid fa-star" style="color:#facc15;"></i> वीकली रॉकस्टार लेवल्स व अतिरिक्त इंसेंटिव</h4>
        <div class="pf-table-responsive">
          <table class="pf-styled-table">
            <thead>
              <tr>
                <th>लेवल</th>
                <th>वीकली टर्नओवर (TO)</th>
                <th>स्पेशल वीकली इंसेंटिव</th>
              </tr>
            </thead>
            <tbody>
              ${seg.weekly_rockstar.tiers.map(t => `
                <tr>
                  <td><span class="pf-badge-chip">${t.level}</span> <strong>${t.name}</strong></td>
                  <td><strong style="color:#38bdf8;">₹${t.weekly_turnover.toLocaleString('en-IN')}</strong></td>
                  <td>${t.incentive_text}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Weekly Weeks Tabs -->
        <div class="pf-weeks-grid">
          ${seg.weekly_rockstar.weeks.map(w => `
            <div class="pf-week-pill">
              <span class="pf-week-title">${w.name}</span>
              <span class="pf-week-dates">${w.dates}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Consistency Champion & Lucky Draw -->
      <div class="pf-champion-box">
        <div class="pf-champ-head">
          <span class="pf-trophy">🏆</span>
          <div>
            <h4 style="margin:0;font-size:1.15rem;font-weight:900;color:#fff;">${seg.rockstar_champion.title}</h4>
            <p style="margin:4px 0 0;font-size:0.85rem;color:#f1f5f9;font-weight:700;">${seg.rockstar_champion.condition}</p>
          </div>
        </div>

        <div class="pf-gift-options">
          <div style="font-weight:800;color:#fde047;margin-bottom:8px;">🎁 कन्फर्म गिफ्ट (कोई 1 चुनें):</div>
          <ul>
            ${seg.rockstar_champion.gift_options.map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>

        <div class="pf-lucky-draw">
          <div style="font-weight:800;color:#38bdf8;margin-bottom:6px;">🎰 ${seg.rockstar_champion.lucky_draw.title}:</div>
          <div class="pf-prize-chips">
            ${seg.rockstar_champion.lucky_draw.prizes.map(p => `<span class="pf-prize-tag">✨ ${p}</span>`).join('')}
          </div>
        </div>

        <!-- 2. Floating Animated Banner: Rockstar Champion Rewards -->
        <div class="pf-floating-banner-wrap" style="margin-top:18px;">
          <img src="/images/banners/rockstar-offer-banner-2.webp" alt="Netsurf Rockstar Champion Rewards" class="pf-floating-banner-img" onerror="this.onerror=null;this.src='/images/banners/rockstar_offer_banner_2.webp';" loading="lazy" />
        </div>
      </div>

      <!-- Segment Share Button -->
      <div class="pf-seg-share-wrap">
        <button type="button" class="pf-share-seg-btn" onclick="window.sharePathfinderSegment('celebrate', 'रॉकस्टार एवं न्यू E-Tailer ऑफर')">
          <i class="fa-solid fa-share-nodes"></i> <span>यह रॉकस्टार ऑफर अपनी टीम को शेयर करें</span>
        </button>
      </div>
    `;
  }

  // 5. Pillar 2: BUILD Segment
  function renderBuildSegment() {
    const el = document.getElementById('pfBuildWrap');
    if (!el || !pathfinderData.segments?.build) return;
    const seg = pathfinderData.segments.build;

    el.innerHTML = `
      <div class="pf-segment-header">
        <div class="pf-seg-tag">PILLAR 2</div>
        <h3 class="pf-seg-title">${seg.pillar_title}</h3>
        <button type="button" class="pf-audio-btn" onclick="window.playSegmentAudio('build')" title="ऑडियो सुनें">
          <i class="fa-solid fa-volume-high"></i> <span>ऑडियो विवरण</span>
        </button>
      </div>

      <!-- Ways to Attend TeamFest -->
      <div class="pf-ways-grid">
        <!-- Business Consultant -->
        <div class="pf-card-box">
          <div class="pf-badge-chip">WAY 1</div>
          <h4 class="pf-card-head">Business Consultant (BC)</h4>
          <div class="pf-criteria-box">
            <div class="pf-crit-label">टर्नओवर पात्रता (Invoice Value):</div>
            <div class="pf-crit-val">Max Team ₹10,000 : Other Team ₹10,000</div>
          </div>
          <p class="pf-card-desc">Netsurf TeamFest में उपस्थिति की आधिकारिक अर्हता।</p>
          <div class="pf-card-note">⚠️ Note: Repeat achievements मान्य नहीं होंगे।</div>
        </div>

        <!-- Club Saksham & Asmita Star -->
        <div class="pf-card-box highlight" id="pfClubSakshamAsmitaCard">
          <div class="pf-badge-chip bg-gold">WAY 2: RELAUNCHED</div>
          <h4 class="pf-card-head">Club Saksham (Male) & Club Asmita (Female)</h4>
          
          <div class="pf-split-criteria">
            <div class="pf-crit-col">
              <div class="pf-club-avatar-wrap male">
                <img src="/images/banners/club-saksham.webp" alt="Club Saksham" class="pf-club-avatar-img" loading="lazy" />
              </div>
              <span class="pf-gender-badge male">👨 Club Saksham (Male)</span>
              <div class="pf-crit-val">30,000 : 30,000</div>
              <div class="pf-crit-sub">+ ₹1,000 Self Consumer</div>
              <button type="button" class="pf-mini-share-btn male" onclick="window.shareClubSaksham()">
                <i class="fa-solid fa-share-nodes"></i> <span>क्लब सक्षम शेयर</span>
              </button>
            </div>
            <div class="pf-crit-col">
              <div class="pf-club-avatar-wrap female">
                <img src="/images/banners/club-asmita.webp" alt="Club Asmita" class="pf-club-avatar-img" loading="lazy" />
              </div>
              <span class="pf-gender-badge female">👩 Club Asmita (Female)</span>
              <div class="pf-crit-val">25,000 : 25,000</div>
              <div class="pf-crit-sub">+ ₹1,000 Self Consumer</div>
              <button type="button" class="pf-mini-share-btn female" onclick="window.shareClubAsmita()">
                <i class="fa-solid fa-share-nodes"></i> <span>क्लब अस्मिता शेयर</span>
              </button>
            </div>
          </div>

          <div class="pf-benefits-list">
            <div style="font-weight:900;color:#b45309;font-size:1.02rem;margin-bottom:8px;">🎁 अचीवर्स के विशेष लाभ:</div>
            <ul>
              <li>🎟️ <span style="color:#0f172a;font-weight:700;">Netsurf TeamFest में प्रिविलेज एंट्री</span></li>
              <li>💼 <span style="color:#0f172a;font-weight:700;">एक्सक्लूसिव बिज़नेस किट (Netsurf बैग, डायरी, पेन, CA/CS बैज)</span></li>
              <li>🔥 <strong style="color:#15803d;font-weight:800;">1% अतिरिक्त टर्नओवर कमीशन (दिसंबर Cycle 2 तक!)</strong></li>
            </ul>
          </div>
        </div>

        <!-- Super Star Club -->
        <div class="pf-card-box">
          <div class="pf-badge-chip">WAY 3: SUPER STAR</div>
          <h4 class="pf-card-head">Super Star Club (CA/CS)</h4>
          <div class="pf-split-criteria">
            <div class="pf-crit-col">
              <div class="pf-club-avatar-wrap male">
                <img src="/images/banners/club-saksham.webp" alt="Saksham SuperStar" class="pf-club-avatar-img" loading="lazy" />
              </div>
              <span class="pf-gender-badge male">👨 Saksham SuperStar</span>
              <div class="pf-crit-val" style="color:#38bdf8;">60,000 : 60,000</div>
              <div class="pf-crit-sub">+ ₹1,000 Self Consumer</div>
            </div>
            <div class="pf-crit-col">
              <div class="pf-club-avatar-wrap female">
                <img src="/images/banners/club-asmita.webp" alt="Asmita SuperStar" class="pf-club-avatar-img" loading="lazy" />
              </div>
              <span class="pf-gender-badge female">👩 Asmita SuperStar</span>
              <div class="pf-crit-val" style="color:#f472b6;">50,000 : 50,000</div>
              <div class="pf-crit-sub">+ ₹1,000 Self Consumer</div>
            </div>
          </div>
          <p class="pf-card-desc" style="color:#0f172a;font-weight:700;">टर्नओवर कमीशन में 33% से 66% तक भारी वृद्धि का अवसर!</p>
        </div>
      </div>

      <!-- FastTrack Cumulative Tour -->
      <div class="pf-card-box tour-box" id="pfTourCard">
        <h4 class="pf-card-head"><i class="fa-solid fa-plane-departure" style="color:#38bdf8;"></i> ${seg.fasttrack_q3_tours.title}</h4>
        <p class="pf-card-desc" style="color:#0f172a;font-weight:700;">${seg.fasttrack_q3_tours.condition} • <strong>${seg.fasttrack_q3_tours.duration}</strong></p>

        <div class="pf-tour-grid">
          ${seg.fasttrack_q3_tours.tiers.map(tr => `
            <div class="pf-tour-card">
              <div class="pf-tour-badge">${tr.category}</div>
              <div class="pf-tour-row">
                <span class="pf-level-tag">E1 (Execution 1):</span>
                <span class="pf-tour-val">${tr.e1}</span>
              </div>
              <div class="pf-tour-row">
                <span class="pf-level-tag">E2 (Execution 2):</span>
                <span class="pf-tour-val">${tr.e2}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 3. Floating Animated Banner: 2N/3D Luxury Hotel Tour -->
        <div class="pf-floating-banner-wrap" style="margin-top:18px;">
          <img src="/images/banners/3day-2n-banner-3.webp" alt="FastTrack 2 Nights 3 Days Luxury Tour" class="pf-floating-banner-img" onerror="this.onerror=null;this.src='/images/banners/3day_2n_banner_3.webp';" loading="lazy" />
        </div>
      </div>

      <!-- Segment Share Button -->
      <div class="pf-seg-share-wrap">
        <button type="button" class="pf-share-seg-btn" onclick="window.sharePathfinderSegment('build', 'क्लब सक्षम, अस्मिता व फास्टट्रैक टूर')">
          <i class="fa-solid fa-share-nodes"></i> <span>यह क्लब और टूर योजना टीम को शेयर करें</span>
        </button>
      </div>
    `;
  }

  // 6. Pillar 3: RISE Segment
  function renderRiseSegment() {
    const el = document.getElementById('pfRiseWrap');
    if (!el || !pathfinderData.segments?.rise) return;
    const seg = pathfinderData.segments.rise;

    el.innerHTML = `
      <div class="pf-segment-header">
        <div class="pf-seg-tag">PILLAR 3</div>
        <h3 class="pf-seg-title">${seg.pillar_title}</h3>
        <button type="button" class="pf-audio-btn" onclick="window.playSegmentAudio('rise')" title="ऑडियो सुनें">
          <i class="fa-solid fa-volume-high"></i> <span>ऑडियो विवरण</span>
        </button>
      </div>

      <!-- Point Earning Rules -->
      <div class="pf-points-rule-grid">
        ${seg.point_rules.map(pr => `
          <div class="pf-point-rule-card">
            <div class="pf-pr-pts">${pr.points}</div>
            <div class="pf-pr-action">${pr.action}</div>
          </div>
        `).join('')}
      </div>

      <!-- Leadership Targets Table -->
      <div class="pf-card-box">
        <h4 class="pf-card-head"><i class="fa-solid fa-medal" style="color:#fde047;"></i> लीडरशिप पद व मासिक पॉइंट्स रिवार्ड</h4>
        <div class="pf-table-responsive">
          <table class="pf-styled-table">
            <thead>
              <tr>
                <th>रैंक / पद</th>
                <th>TeamFest टिकट</th>
                <th>Netsurf स्पेशल शर्ट</th>
                <th>स्पेशल ब्रांडिंग</th>
              </tr>
            </thead>
            <tbody>
              ${seg.leadership_targets.map(lt => `
                <tr>
                  <td><strong>${lt.rank}</strong></td>
                  <td><span class="pf-badge-chip bg-blue">${lt.teamfest_ticket}</span></td>
                  <td><span class="pf-badge-chip">${lt.netsurf_shirt}</span></td>
                  <td><span class="pf-badge-chip bg-gold">${lt.branding}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hall of Fame -->
      <div class="pf-hall-of-fame-box">
        <div class="pf-hof-badge">🌟 HISTORIC MOMENT</div>
        <h4 class="pf-hof-title">${seg.hall_of_fame.title}</h4>
        <p class="pf-hof-cond">⚡ <strong>${seg.hall_of_fame.condition}</strong></p>
        <p class="pf-hof-desc">${seg.hall_of_fame.reward}</p>
      </div>

      <!-- Segment Share Button -->
      <div class="pf-seg-share-wrap">
        <button type="button" class="pf-share-seg-btn" onclick="window.sharePathfinderSegment('rise', 'लीडरशिप पॉइंट्स व हॉल ऑफ फेम')">
          <i class="fa-solid fa-share-nodes"></i> <span>लीडरशिप पॉइंट्स अपनी टीम को शेयर करें</span>
        </button>
      </div>
    `;
  }

  // 7. Pillar 4: iStock Segment
  function renderIstockSegment() {
    const el = document.getElementById('pfIstockWrap');
    if (!el || !pathfinderData.segments?.istock) return;
    const seg = pathfinderData.segments.istock;

    el.innerHTML = `
      <div class="pf-segment-header">
        <div class="pf-seg-tag">PILLAR 4</div>
        <h3 class="pf-seg-title">${seg.pillar_title}</h3>
        <button type="button" class="pf-audio-btn" onclick="window.playSegmentAudio('istock')" title="ऑडियो सुनें">
          <i class="fa-solid fa-volume-high"></i> <span>ऑडियो विवरण</span>
        </button>
      </div>

      <!-- Big Festive Price Slash -->
      <div class="pf-istock-hero">
        <span class="pf-offer-badge">🔥 ऐतिहासिक फेस्टिव ऑफर</span>
        <h4 style="font-size:1.35rem;font-weight:900;color:#fff;margin:10px 0 6px;">${seg.special_festive_offer.title}</h4>
        
        <div class="pf-price-slash-wrap">
          <div class="pf-old-price">नियमित: <s>${seg.special_festive_offer.regular_amount}</s></div>
          <div class="pf-new-price">${seg.special_festive_offer.festive_amount}</div>
          <div class="pf-save-badge">${seg.special_festive_offer.saving}</div>
        </div>

        <div class="pf-istock-specs">
          <span>✔️ डिस्काउंट: <strong>${seg.special_festive_offer.discount}</strong></span>
          <span>✔️ सभी श्रेणियां मान्य (Agri, Health, Personal, Cattle)</span>
        </div>

        <div class="pf-challenge-banner">
          📢 <strong>संकल्प:</strong> ${seg.special_festive_offer.challenge}
        </div>

        <!-- 4. Floating Animated Banner: ₹25,550 iStock Festive Offer -->
        <div class="pf-floating-banner-wrap" style="margin-top:18px;">
          <img src="/images/banners/istock-banner-4.webp" alt="iStock Festive Offer ₹25,550" class="pf-floating-banner-img" onerror="this.onerror=null;this.src='/images/banners/istock_banner_4.webp';" loading="lazy" />
        </div>
      </div>

      <!-- Regular Packages Table -->
      <div class="pf-card-box">
        <h4 class="pf-card-head">नियमित iStock पैकेज संरचना</h4>
        <div class="pf-table-responsive">
          <table class="pf-styled-table">
            <thead>
              <tr>
                <th>MRP मूल्य</th>
                <th>छूट (Discount)</th>
                <th>री-फिल पैक MRP</th>
                <th>उत्पाद श्रेणियां</th>
              </tr>
            </thead>
            <tbody>
              ${seg.regular_packages.map(p => `
                <tr>
                  <td><strong>${p.mrp}</strong></td>
                  <td><span class="pf-badge-chip bg-blue">${p.discount}</span></td>
                  <td>${p.refill}</td>
                  <td>${p.categories}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Segment Share Button -->
      <div class="pf-seg-share-wrap">
        <button type="button" class="pf-share-seg-btn" onclick="window.sharePathfinderSegment('istock', 'iStock ₹25,550 फेस्टिव ऑफर')">
          <i class="fa-solid fa-share-nodes"></i> <span>यह iStock ऑफर अपनी टीम को शेयर करें</span>
        </button>
      </div>
    `;
  }

  // 8. Video System (AarogyamTube Integrated Player — No external YouTube redirect)
  function renderVideoSystem() {
    const el = document.getElementById('pfVideoWrap');
    if (!el || !pathfinderData.segments?.video_system) return;
    const v = pathfinderData.segments.video_system;
    const videoId = v.landscape_video?.youtube_id || '-SPS50UQPjA';
    const videoTitle = v.landscape_video?.title || 'Netsurf Q3 Pathfinder Video';

    el.innerHTML = `
      <div class="pf-segment-header">
        <div class="pf-seg-tag" style="background:#dc2626;color:#fff;border-color:#ef4444;">📺 AAROGYAMTUBE EXCLUSIVE</div>
        <h3 class="pf-seg-title">${v.title}</h3>
      </div>
      <p style="font-size:0.92rem;color:var(--pf-text-muted);margin:-8px 0 16px;">${v.description}</p>

      <div class="pf-tube-player-card">
        <div class="pf-tube-top-bar">
          <div class="pf-tube-badge">
            <span class="pf-tube-live-dot"></span>
            <span>आरोग्यम ट्यूब • ऑफिशियल ट्रेनिंग वीडियो</span>
          </div>
          <span class="pf-tube-quality">HD 1080p</span>
        </div>

        <div class="pf-video-container" id="pfVideoPlayerBox">
          <iframe 
            id="pfIframePlayer"
            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&controls=1" 
            title="${videoTitle}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>

        <!-- AarogyamTube Custom Action Bar: Keeps User 100% On-Platform -->
        <div class="pf-tube-action-bar">
          <a href="/tube.html?v=${videoId}" class="pf-btn-watch-tube">
            <i class="fa-solid fa-play"></i> <span>Watch on AarogyamTube</span>
          </a>
          <button type="button" class="pf-btn-share-tube" onclick="window.shareAarogyamTubeVideo('${videoId}', '${encodeURIComponent(videoTitle)}')">
            <i class="fa-solid fa-share-nodes"></i> <span>AarogyamTube शेयर करें</span>
          </button>
        </div>
      </div>
    `;
  }

  // Dedicated AarogyamTube Video Share Engine (Always shares internal /tube.html link)
  window.shareAarogyamTubeVideo = function (videoId, encodedTitle) {
    const title = decodeURIComponent(encodedTitle || 'Netsurf Q3 Pathfinder Video');
    const shareId = getMasterShareId();
    const origin = window.location.origin;
    const tubeUrl = `${origin}/tube.html?v=${videoId}&ref=${shareId}&share_id=${shareId}`;

    const textMsg = `🎬 *AarogyamTube पर देखें: ${title}*\n\nनेट्सर्फ Q3 पाथफाइंडर (TeamFest) संपूर्ण वीडियो प्रेजेंटेशन। वीडियो देखने व सीखने के लिए नीचे दिए गए आरोग्यम ट्यूब लिंक पर क्लिक करें:\n\n👇 *AarogyamTube पर वीडियो देखें:*\n${tubeUrl}\n\n👤 *सत्यापित प्रस्तोता:* ${getUserName()} (ID: ${shareId})`;

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      navigator.share({
        title: `${title} - AarogyamTube`,
        text: textMsg,
        url: tubeUrl
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, '_blank');
    }
  };

  // 9. Sakhi AI Integration: Single Clean 1-Click Direct-to-AI List
  function renderFaqAndQuickChips() {
    const listEl = document.getElementById('pfUnifiedFaqList');
    if (!listEl || !pathfinderData.faqs) return;

    listEl.innerHTML = pathfinderData.faqs.map((f, i) => {
      const numStr = String(i + 1).padStart(2, '0');
      return `
        <div class="pf-faq-click-card" onclick="window.askSakhiQuestion('${encodeURIComponent(f.question)}')">
          <div class="pf-fcc-left">
            <span class="pf-fcc-num">${numStr}</span>
            <span class="pf-fcc-text">${f.question}</span>
          </div>
          <div class="pf-fcc-right">
            <span class="pf-fcc-badge">🌸 सखी AI से समझें</span>
            <i class="fa-solid fa-arrow-right pf-fcc-arrow"></i>
          </div>
        </div>
      `;
    }).join('');
  }

  window.askSakhiQuestion = function (encodedQuery) {
    const q = decodeURIComponent(encodedQuery);
    // Open Aarogyam Sakhi with prefilled query
    const targetUrl = `/aarogyam-sakhi.html?q=${encodeURIComponent(q)}&ref_source=pathfinder_q3`;
    window.location.href = targetUrl;
  };

  // 10. User Session & Floating Viral Notice Personalization
  function renderUserSessionStatus() {
    const isLoggedIn = window.V1_SESSION?.isLoggedIn?.() || false;
    const user = window.V1_SESSION?.getCurrentUser?.();
    const shareId = window.V1_SESSION?.getUserShareId?.() || 'AI000004';

    // Update Floating Viral Notice Card dynamically
    const titleEl = document.getElementById('pfViralNoticeTitle');
    const descEl = document.getElementById('pfViralNoticeDesc');
    const loginBtnText = document.getElementById('pfVnLoginBtnText');

    if (isLoggedIn && user) {
      const name = user.full_name || user.name || 'नेट्सर्फ साथी';
      if (titleEl) {
        titleEl.innerHTML = `🎉 नमस्ते <span style="color:#38bdf8;">${name}</span> जी! आपकी डिजिटल शेयरिंग पावर एक्टिव है`;
      }
      if (descEl) {
        descEl.innerHTML = `आपकी पहचान <strong>${name} (ID: ${shareId})</strong> सुरक्षित रूप से एक्टिव है। जब आप यह पाथफाइंडर प्लान अपने <strong>मित्र, टीम या सहयोगी</strong> को शेयर करेंगे, तो उनके फोन में नीचे स्वतः आपका नाम, कॉलिंग नंबर और WhatsApp बटन दिखेगा!`;
      }
      if (loginBtnText) {
        loginBtnText.textContent = `✅ आप लॉगिन हैं (${shareId})`;
      }
    } else {
      if (titleEl) {
        titleEl.textContent = '💡 प्रिय साथी! क्या आप जानते हैं?';
      }
      if (descEl) {
        descEl.innerHTML = 'आप अगर यह पाथफाइंडर प्लान अपने <strong>मित्र, टीम या सहयोगी</strong> को शेयर करते हैं, तो नीचे स्वतः आपका नाम, कॉलिंग नंबर और WhatsApp बटन आ जाएगा! अपनी टीम को शेयर करने से पहले <strong>लॉगिन / रजिस्टर</strong> करके ही शेयर पर क्लिक करें ताकि आपकी पहचान और क्रेडिट हमेशा सुरक्षित रहे।';
      }
      if (loginBtnText) {
        loginBtnText.textContent = '📲 पहले लॉगिन / रजिस्टर करें';
      }
    }
  }

  window.promptPathfinderLogin = function () {
    if (typeof window.openGuestLoginModal === 'function') {
      window.openGuestLoginModal(function () {
        renderUserSessionStatus();
      }, {
        force: true,
        source: 'PathfinderQ3',
        title: 'नेट्सर्फ पाथफाइंडर डिजिटल पहचान',
        subtitle: 'लॉगिन / रजिस्टर करें ताकि आपकी Share ID और WhatsApp हर जगह स्वतः जुड़ जाए'
      });
      return;
    }
    if (typeof window.openUniversalAuthModal === 'function') {
      window.openUniversalAuthModal();
      return;
    }
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/registration.html?source=pathfinder&return=${returnUrl}`;
  };

  // 11. Smart Native Share & Tracking Engine (With Rich Banner Images)
  window.sharePathfinderQuarter = function () {
    triggerSmartShare('पूरा Q3 पाथफाइंडर 2026-27 प्लान', '', '/images/banners/netsurf-pathfinadr-q3.webp');
  };

  window.sharePathfinderSegment = function (segmentKey, segmentName) {
    let imgPath = '/images/banners/netsurf-pathfinadr-q3.webp';
    if (segmentKey === 'celebrate') imgPath = '/images/banners/30 offer-banner-1.webp';
    else if (segmentKey === 'build') imgPath = '/images/banners/3day-2n-banner-3.webp';
    else if (segmentKey === 'rise') imgPath = '/images/banners/rockstar-offer-banner-2.webp';
    else if (segmentKey === 'istock') imgPath = '/images/banners/istock-banner-4.webp';

    triggerSmartShare(segmentName, segmentKey, imgPath);
  };

  window.shareClubSaksham = function () {
    const isLoggedIn = window.V1_SESSION?.isLoggedIn?.() || false;
    const shareId = window.V1_SESSION?.getUserShareId?.() || 'AI000004';
    if (!isLoggedIn) {
      showShareLoginWarningModal('👨 क्लब सक्षम (पुरुष) योजना', 'build');
      return;
    }
    const origin = window.location.origin;
    const shareUrl = `${origin}/categories/netsurf-pathfinder.html?share_id=${encodeURIComponent(shareId)}#build`;
    const textMsg = `👨 *NETSURF CLUB SAKSHAM (पुरुष साथियों हेतु) — री-लॉन्च* 🏆\n━━━━━━━━━━━━━━━━━━━━\n⭐ *स्टार क्लब टर्नओवर:* ₹30,000 : ₹30,000 (+ ₹1,000 Self)\n⭐ *सुपर स्टार क्लब टर्नओवर:* ₹60,000 : ₹60,000\n\n🔥 *विशेष लाभ:* दिसंबर Cycle 2 तक 1% अतिरिक्त टर्नओवर कमीशन (33% से 66% आय वृद्धि) + TeamFest 1N/2D प्रिविलेज एंट्री टिकट!\n\n👇 *पूरी जानकारी व अपना क्लब यहाँ देखें:*\n${shareUrl}\n\n👤 *सत्यापित सहयोगी:* ${getUserName()} (ID: ${shareId})`;
    
    executeRichShareWithImage({
      title: 'Netsurf Club Saksham (Male) री-लॉन्च योजना',
      text: textMsg,
      url: shareUrl
    }, '/images/banners/club-saksham.webp');
  };

  window.shareClubAsmita = function () {
    const isLoggedIn = window.V1_SESSION?.isLoggedIn?.() || false;
    const shareId = window.V1_SESSION?.getUserShareId?.() || 'AI000004';
    if (!isLoggedIn) {
      showShareLoginWarningModal('👩 क्लब अस्मिता (महिला) योजना', 'build');
      return;
    }
    const origin = window.location.origin;
    const shareUrl = `${origin}/categories/netsurf-pathfinder.html?share_id=${encodeURIComponent(shareId)}#build`;
    const textMsg = `👩 *NETSURF CLUB ASMITA (महिला शक्तियों हेतु) — री-लॉन्च* 🏆\n━━━━━━━━━━━━━━━━━━━━\n⭐ *स्टार क्लब टर्नओवर:* ₹25,000 : ₹25,000 (+ ₹1,000 Self)\n⭐ *सुपर स्टार क्लब टर्नओवर:* ₹50,000 : ₹50,000\n\n🔥 *विशेष लाभ:* दिसंबर Cycle 2 तक 1% अतिरिक्त टर्नओवर कमीशन + TeamFest प्रिविलेज एंट्री टिकट + एक्सक्लूसिव किट!\n\n👇 *पूरी जानकारी व अपना क्लब यहाँ देखें:*\n${shareUrl}\n\n👤 *सत्यापित सहयोगी:* ${getUserName()} (ID: ${shareId})`;
    
    executeRichShareWithImage({
      title: 'Netsurf Club Asmita (Female) री-लॉन्च योजना',
      text: textMsg,
      url: shareUrl
    }, '/images/banners/club-asmita.webp');
  };

  function triggerSmartShare(titleContext, hashAnchor = '', imgRelativeUrl = '') {
    const isLoggedIn = window.V1_SESSION?.isLoggedIn?.() || false;
    const shareId = window.V1_SESSION?.getUserShareId?.() || '';

    // If NOT logged in, warn user so they get credit for views
    if (!isLoggedIn) {
      showShareLoginWarningModal(titleContext, hashAnchor);
      return;
    }

    executeShareWithShareId(shareId, titleContext, hashAnchor, imgRelativeUrl);
  }

  function executeShareWithShareId(shareId, titleContext, hashAnchor = '', imgRelativeUrl = '') {
    const origin = window.location.origin;
    let shareUrl = `${origin}/categories/netsurf-pathfinder.html?share_id=${encodeURIComponent(shareId)}`;
    if (hashAnchor) shareUrl += `#${hashAnchor}`;

    const textMsg = `🎉 *NETSURF Q3 PATHFINDER 2026-27 — TEAMFEST* 🏆\n━━━━━━━━━━━━━━━━━━━━\n✨ *${titleContext}*\n\n🔥 *त्योहारों के मौसम में नेट्सर्फ का सबसे बड़ा अभियान:*\n👉 *नया iStock मात्र ₹25,550 में* (₹73,000 की जगह, 27% छूट)\n👉 *30% न्यू E-Tailer छूट* (₹7,500+ के पहले बिल पर)\n👉 *वीकली रॉकस्टार* (15% अतिरिक्त इंसेंटिव + ₹2,000 गिफ्ट)\n👉 *क्लब सक्षम व अस्मिता* (दिसंबर तक 1% एक्स्ट्रा पेआउट)\n👉 *2N/3D लक्ज़री फास्टट्रैक टूर* (सिंगल 2.4L व कपल 3.0L)\n👉 *TeamFest हॉल ऑफ फेम सम्मान!*\n\n👇 *पूरा पाथफाइंडर प्लान और अपना लेवल यहाँ देखें:*\n${shareUrl}\n\n👤 *सत्यापित सहयोगी:* ${getUserName()} (ID: ${shareId})`;

    executeRichShareWithImage({
      title: `Netsurf Q3 Pathfinder — ${titleContext}`,
      text: textMsg,
      url: shareUrl
    }, imgRelativeUrl || '/images/banners/netsurf-pathfinadr-q3.webp');
  }

  async function executeRichShareWithImage(shareData, imgRelativeUrl) {
    const origin = window.location.origin;
    const fullImgUrl = (imgRelativeUrl && imgRelativeUrl.startsWith('http')) 
      ? imgRelativeUrl 
      : (imgRelativeUrl ? `${origin}${imgRelativeUrl}` : '');

    if (navigator.share) {
      try {
        if (navigator.canShare && fullImgUrl) {
          const resp = await fetch(fullImgUrl);
          const blob = await resp.blob();
          const ext = fullImgUrl.endsWith('.png') ? 'png' : (fullImgUrl.endsWith('.jpg') ? 'jpeg' : 'webp');
          const file = new File([blob], `pathfinder_${Date.now()}.${ext}`, { type: blob.type || `image/${ext}` });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              ...shareData,
              files: [file]
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Native image file share fallback:', err);
      }

      navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url
      }).catch(() => fallbackWhatsAppShare(shareData.text));
    } else {
      fallbackWhatsAppShare(shareData.text);
    }
  }

  function fallbackWhatsAppShare(textMsg) {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`;
    window.open(waUrl, '_blank');
  }

  function getUserName() {
    const u = window.V1_SESSION?.getCurrentUser?.();
    return u?.full_name || u?.name || 'नेट्सर्फ साथी';
  }

  function showShareLoginWarningModal(titleContext, hashAnchor) {
    let modal = document.getElementById('pfShareLoginModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pfShareLoginModal';
      modal.className = 'pf-modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="pf-modal-card">
        <div class="pf-modal-icon">⚠️</div>
        <h3 class="pf-modal-head">अपनी टीम को भेजने से पहले लॉगिन करें!</h3>
        <p class="pf-modal-desc">
          यदि आप लॉगिन करके शेयर करेंगे, तो आपकी <strong>Share ID</strong> इस लिंक से जुड़ जाएगी। इससे आपकी टीम में से जब भी कोई यह पेज खोलेगा, तो आपको तुरंत पता चल सकेगा कि आपकी टीम में से किसने यह प्लान देखा!
        </p>
        <div class="pf-modal-actions">
          <button type="button" class="pf-modal-btn primary" onclick="window.promptPathfinderLogin()">
            📲 पहले लॉगिन / रजिस्टर करें (फायदेमंद)
          </button>
          <button type="button" class="pf-modal-btn secondary" onclick="window.dismissShareLoginAndContinue('${encodeURIComponent(titleContext)}', '${hashAnchor}')">
            बिना लॉगिन के सामान्य शेयर करें →
          </button>
        </div>
        <button type="button" class="pf-modal-close" onclick="document.getElementById('pfShareLoginModal').style.display='none'">&times;</button>
      </div>
    `;

    modal.style.display = 'flex';
  }

  window.dismissShareLoginAndContinue = function (encodedTitle, hashAnchor) {
    const modal = document.getElementById('pfShareLoginModal');
    if (modal) modal.style.display = 'none';
    executeShareWithShareId('AI000004', decodeURIComponent(encodedTitle), hashAnchor);
  };

  // 12. Audio Guidance & Autoplay Safety
  window.playSegmentAudio = function (segmentKey) {
    if (!pathfinderData?.segments?.[segmentKey]) return;
    const seg = pathfinderData.segments[segmentKey];
    const script = seg.audio_script;

    if (!script) return;

    if (isPlayingAudio) {
      stopAudioPlayback();
      return;
    }

    speakText(script);
  };

  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';
    utter.rate = 0.95;
    utter.pitch = 1.0;

    utter.onstart = () => {
      isPlayingAudio = true;
      updateAudioBtnStates(true);
    };

    utter.onend = () => {
      isPlayingAudio = false;
      updateAudioBtnStates(false);
    };

    utter.onerror = () => {
      isPlayingAudio = false;
      updateAudioBtnStates(false);
    };

    activeAudioUtt = utter;
    window.speechSynthesis.speak(utter);
  }

  function stopAudioPlayback() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isPlayingAudio = false;
    updateAudioBtnStates(false);
  }

  function updateAudioBtnStates(active) {
    document.querySelectorAll('.pf-audio-btn').forEach(btn => {
      btn.classList.toggle('playing', active);
      const span = btn.querySelector('span');
      if (span) span.textContent = active ? 'ऑडियो रोकें' : 'ऑडियो विवरण';
    });
  }

  function initAudioAutoplaySafety() {
    // Autoplay fallback: On user's first tap/click, if requested, play welcome audio
    const autoPlayTrigger = () => {
      document.removeEventListener('click', autoPlayTrigger);
      document.removeEventListener('touchstart', autoPlayTrigger);
    };
    document.addEventListener('click', autoPlayTrigger, { once: true });
    document.addEventListener('touchstart', autoPlayTrigger, { once: true });
  }

  // 13. Sponsor & Counselor Contact Resolution (From share_id / ref / profiles / admin fallback)
  async function resolveSponsorCounselor() {
    const DEFAULT_PHONE = '7974422572';
    const DEFAULT_NAME = 'श्री अवनीश कुमार मिश्रा';
    const DEFAULT_ID = 'AI000004';

    let sponsor = {
      name: DEFAULT_NAME,
      phone: DEFAULT_PHONE,
      shareId: DEFAULT_ID
    };

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetShareId = urlParams.get('share_id') || urlParams.get('ref') || urlParams.get('sponsor') || '';

      if (targetShareId) {
        sponsor.shareId = targetShareId;

        // Check Supabase if available
        const db = (window.supabaseClient && typeof window.supabaseClient.from === 'function')
          ? window.supabaseClient
          : ((window.supabase && typeof window.supabase.from === 'function') ? window.supabase : null);

        if (db) {
          const { data: prof } = await db
            .from('profiles')
            .select('full_name, mobile, share_id, referral_code')
            .or(`share_id.eq.${targetShareId},referral_code.eq.${targetShareId}`)
            .limit(1)
            .maybeSingle();

          if (prof && prof.mobile) {
            const cleanMob = prof.mobile.replace(/\D/g, '').slice(-10);
            if (cleanMob.length === 10) {
              sponsor.phone = cleanMob;
              sponsor.name = prof.full_name || 'नेट्सर्फ अधिकृत सहयोगी';
            }
          }
        } else {
          const sbKey = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
          const res = await fetch(`https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1/profiles?or=(share_id.eq.${encodeURIComponent(targetShareId)},referral_code.eq.${encodeURIComponent(targetShareId)})&select=full_name,mobile&limit=1`, {
            headers: { 'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey }
          });
          if (res.ok) {
            const rows = await res.json();
            if (rows && rows[0] && rows[0].mobile) {
              const cleanMob = String(rows[0].mobile).replace(/\D/g, '').slice(-10);
              if (cleanMob.length === 10) {
                sponsor.phone = cleanMob;
                sponsor.name = rows[0].full_name || 'नेट्सर्फ अधिकृत सहयोगी';
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Sponsor counselor note:', e);
    }

    // Update on-page elements
    const nameEl = document.getElementById('pfAdvisorName');
    const idEl = document.getElementById('pfAdvisorId');
    const callBtn = document.getElementById('pfAdvisorCallBtn');
    const waBtn = document.getElementById('pfAdvisorWaBtn');

    if (nameEl) nameEl.textContent = sponsor.name;
    if (idEl) idEl.textContent = sponsor.shareId;
    if (callBtn) callBtn.href = `tel:+91${sponsor.phone}`;
    if (waBtn) {
      const text = encodeURIComponent(`नमस्ते ${sponsor.name} जी! मैंने आपका नेट्सर्फ Q3 पाथफाइंडर (TeamFest) पेज देखा। मुझे इसके ऑफर्स व बिज़नेस में शामिल होने की जानकारी चाहिए।`);
      waBtn.href = `https://api.whatsapp.com/send?phone=91${sponsor.phone}&text=${text}`;
    }
  }

  // 14. Terms & Conditions Modal
  window.openPfTermsModal = function () {
    const m = document.getElementById('pfTermsModal');
    if (m) m.style.display = 'flex';
  };

  window.closePfTermsModal = function () {
    const m = document.getElementById('pfTermsModal');
    if (m) m.style.display = 'none';
  };

  // 15. Audio Autoplay Safety & Gesture Unlock Coordinator
  function initAudioAutoplaySafety() {
    try {
      // Clear any session stop flags on this page so user gets greeted with audio
      try {
        sessionStorage.removeItem('aoi_audio_user_stopped');
        sessionStorage.removeItem('aoi_audio_stopped_netsurf-pathfinder');
        sessionStorage.removeItem('aoi_audio_played_netsurf-pathfinder');
      } catch (e) {}

      let audioTriggered = false;
      const triggerGreeting = () => {
        if (audioTriggered) return;
        audioTriggered = true;
        if (window.playPageAudioGreeting && typeof window.playPageAudioGreeting === 'function') {
          window.playPageAudioGreeting(true);
        }
      };

      // 1. Direct timeout attempt (if browser allows autoplay)
      setTimeout(() => {
        try {
          triggerGreeting();
        } catch (e) {}
      }, 900);

      // 2. High priority user gesture unlock on first touch, pointer, click, or scroll
      const unlockEvents = ['touchstart', 'pointerdown', 'click', 'scroll', 'keydown'];
      const onUserInteraction = function () {
        unlockEvents.forEach(ev => window.removeEventListener(ev, onUserInteraction, { capture: true }));
        triggerGreeting();
      };
      unlockEvents.forEach(ev => window.addEventListener(ev, onUserInteraction, { capture: true, once: true, passive: true }));
    } catch (err) {
      console.warn('Audio safety setup note:', err);
    }
  }

})(window, document);
