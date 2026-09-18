/**
 * ====================================================================
 * AAROGYAM INDIA - UNIVERSAL CROSS-PAGE VIDEO SYNDICATION ENGINE
 * Automatically fetches & renders relevant videos on any page based on
 * data-page-target or data-video-category attributes.
 * ====================================================================
 */

(function () {
  let _cachedRecordings = null;

  async function fetchRecordings() {
    if (_cachedRecordings) return _cachedRecordings;
    try {
      let res = await fetch(`/data/webinar-recordings.json?v=${Date.now()}`);
      if (!res.ok) res = await fetch(`../data/webinar-recordings.json?v=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        _cachedRecordings = data.recordings || [];
        return _cachedRecordings;
      }
    } catch (e) {
      console.warn("Universal video loader fetch notice:", e);
    }
    return [];
  }

  function extractYouTubeId(url, directId) {
    if (directId && directId.length > 5) return directId;
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{10,12})/);
    return match ? match[1] : '';
  }

  function renderVideoModal(videoTitle, youtubeId) {
    let modal = document.getElementById('universal-video-modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'universal-video-modal-overlay';
      modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.88);
        backdrop-filter: blur(8px); z-index: 999999;
        display: flex; align-items: center; justify-content: center;
        padding: 16px; opacity: 0; transition: opacity 0.3s ease;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#0f172a; border: 1.5px solid #38bdf8; border-radius: 18px; max-width: 760px; width: 100%; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); position: relative;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 18px; background:#1e293b; border-bottom: 1px solid #334155;">
          <span style="color:#f8fafc; font-weight:800; font-size: 0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 85%;">
            🎬 ${videoTitle}
          </span>
          <button id="closeVideoModalBtn" type="button" style="background:rgba(255,255,255,0.1); border:none; color:#fff; font-size: 1.3rem; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; background: #000;">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" 
            title="${videoTitle}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
          </iframe>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => { modal.style.opacity = '1'; });

    const closeBtn = document.getElementById('closeVideoModalBtn');
    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        modal.innerHTML = '';
      }, 300);
    };

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }

  async function initUniversalVideoShowcase() {
    const containers = document.querySelectorAll('.universal-video-showcase');
    if (!containers.length) return;

    const recordings = await fetchRecordings();
    if (!recordings || !recordings.length) return;

    containers.forEach(container => {
      const pageTarget = (container.getAttribute('data-page-target') || '').toLowerCase().trim();
      const catTarget = (container.getAttribute('data-video-category') || '').toLowerCase().trim();
      const maxCount = parseInt(container.getAttribute('data-max-videos') || '4', 10);

      // Filter matching videos
      let matching = recordings.filter(v => {
        if (!v || v.status === 'archived') return false;

        // Check target_pages array or string
        if (pageTarget) {
          if (Array.isArray(v.target_pages) && v.target_pages.some(p => String(p).toLowerCase() === pageTarget)) {
            return true;
          }
          if (v.target_page && String(v.target_page).toLowerCase() === pageTarget) {
            return true;
          }
        }

        // Check category / subject
        if (catTarget) {
          const vCat = String(v.category || '').toLowerCase();
          const vSub = String(v.subject || '').toLowerCase();
          if (vCat.includes(catTarget) || vSub.includes(catTarget)) return true;
        }

        return false;
      });

      // Fallback: If no exact target match, grab general active videos
      if (!matching.length) {
        matching = recordings.slice(0, maxCount);
      } else {
        matching = matching.slice(0, maxCount);
      }

      if (!matching.length) {
        container.style.display = 'none';
        return;
      }

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; width: 100%;">
          ${matching.map(item => {
            const ytId = extractYouTubeId(item.youtube_url || item.video_url, item.youtube_id);
            const thumb = item.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '/images/banners/agriculture-hero-banner-1.webp');
            const title = item.title || 'आरोग्यम विशेष वीडियो';
            const dur = item.duration || 'Video';
            return `
              <div class="universal-video-card" style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 14px rgba(0,0,0,0.06); display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s; cursor:pointer;" data-yt-id="${ytId}" data-title="${encodeURIComponent(title)}">
                <div style="position:relative; width:100%; padding-bottom:56.25%; background:#0f172a; overflow:hidden;">
                  <img src="${thumb}" alt="${title}" loading="lazy" style="position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; opacity:0.92;" />
                  <div style="position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%);"></div>
                  <!-- Play Button Badge -->
                  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:46px; height:46px; border-radius:50%; background:rgba(239,68,68,0.92); color:#fff; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 4px 15px rgba(239,68,68,0.6); transition:transform 0.2s;">
                    ▶
                  </div>
                  <!-- Duration Pill -->
                  <span style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.8); color:#fff; font-size:0.72rem; font-weight:700; padding:2px 7px; border-radius:4px;">
                    ⏱️ ${dur}
                  </span>
                </div>
                <div style="padding:14px; display:flex; flex-direction:column; flex:1; justify-content:space-between;">
                  <h4 style="margin:0 0 8px 0; font-size:0.92rem; font-weight:800; color:#0f172a; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                    ${title}
                  </h4>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                    <span style="font-size:0.75rem; color:#2563eb; font-weight:700;">
                      ▶️ अभी देखें
                    </span>
                    <button type="button" class="btn-video-share" style="background:#f1f5f9; border:none; color:#475569; padding:4px 8px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:700;">
                      🔗 शेयर
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      // Attach Click events to cards
      container.querySelectorAll('.universal-video-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-video-share')) {
            e.stopPropagation();
            const title = decodeURIComponent(card.getAttribute('data-title'));
            const ytId = card.getAttribute('data-yt-id');
            const shareUrl = ytId ? `https://youtu.be/${ytId}` : window.location.href;
            if (window.AarogyamShareEngine) {
              window.AarogyamShareEngine.share({
                title: title,
                text: `${title} - Aarogyam India पर देखें:`,
                url: shareUrl
              });
            } else if (navigator.share) {
              navigator.share({ title, url: shareUrl }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(shareUrl);
              alert("लिंक कॉपी हो गया!");
            }
            return;
          }

          const ytId = card.getAttribute('data-yt-id');
          const title = decodeURIComponent(card.getAttribute('data-title'));
          if (ytId) {
            renderVideoModal(title, ytId);
          }
        });
      });
    });
  }

  // Expose globally and self-initialize
  window.AarogyamVideoLoader = {
    init: initUniversalVideoShowcase,
    openModal: renderVideoModal
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalVideoShowcase);
  } else {
    initUniversalVideoShowcase();
  }
})();
