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

  function renderVideoModal(videoTitle, youtubeId, vidId) {
    let modal = document.getElementById('universal-video-modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'universal-video-modal-overlay';
      modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(15,23,42,0.95);
        backdrop-filter: blur(10px); z-index: 999999;
        display: flex; align-items: center; justify-content: center;
        padding: 16px; opacity: 0; transition: opacity 0.3s ease;
      `;
      document.body.appendChild(modal);
    }

    const tubeUrl = vidId ? `/tube.html?vid=${encodeURIComponent(vidId)}` : (youtubeId ? `/tube.html?yt=${encodeURIComponent(youtubeId)}` : '/tube.html');
    const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);

    modal.innerHTML = `
      <div style="background:#090d16; border: 1.5px solid #3b82f6; border-radius: 18px; max-width: 760px; width: 100%; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.85); position: relative; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 18px; background:linear-gradient(90deg, #1e3a8a, #0f172a); border-bottom: 1px solid #1e293b;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="background:#ef4444; color:#fff; font-weight:900; font-size:0.72rem; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px;">
              <i class="fa-brands fa-youtube"></i> AarogyamTube
            </span>
            <span style="color:#f8fafc; font-weight:800; font-size: 0.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: 420px;">
              ${videoTitle}
            </span>
          </div>
          <button id="closeVideoModalBtn" type="button" style="background:rgba(255,255,255,0.1); border:none; color:#fff; font-size: 1.2rem; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; background: #000;">
          <iframe 
            src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&origin=${encodeURIComponent(origin)}" 
            title="${videoTitle}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
          </iframe>
        </div>
        <div style="padding:12px 18px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; background:#0f172a; border-top:1px solid #1e293b;">
          <div style="font-size:0.78rem; color:#94a3b8;">
            ✦ AarogyamTube सुरक्षित प्लेयर — आप आरोग्यम इंडिया पर ही वीडियो देख रहे हैं
          </div>
          <div style="display:flex; gap:8px;">
            <a href="${tubeUrl}" style="background:linear-gradient(135deg, #ef4444, #dc2626); color:#fff; padding:7px 16px; border-radius:20px; font-weight:800; font-size:0.78rem; text-decoration:none; display:inline-flex; align-items:center; gap:5px; box-shadow:0 3px 10px rgba(239,68,68,0.4);">
              🎬 AarogyamTube हब में पूरा देखें
            </a>
            <button type="button" id="closeVideoModalBtn2" style="background:#334155; color:#fff; border:none; padding:7px 14px; border-radius:20px; font-weight:700; font-size:0.78rem; cursor:pointer;">
              बंद करें
            </button>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => { modal.style.opacity = '1'; });

    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.display = 'none';
        modal.innerHTML = '';
      }, 300);
    };

    const closeBtn = document.getElementById('closeVideoModalBtn');
    const closeBtn2 = document.getElementById('closeVideoModalBtn2');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (closeBtn2) closeBtn2.onclick = closeModal;
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
              <div class="universal-video-card" style="background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 14px rgba(0,0,0,0.06); display:flex; flex-direction:column; transition:transform 0.2s, box-shadow 0.2s; cursor:pointer;" data-vid-id="${item.id || ''}" data-yt-id="${ytId}" data-title="${encodeURIComponent(title)}">
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
                    <span style="font-size:0.75rem; color:#ef4444; font-weight:800; display:flex; align-items:center; gap:4px;">
                      <span>▶️ AarogyamTube</span>
                    </span>
                    <button type="button" class="btn-video-share" style="background:#f1f5f9; border:none; color:#2563eb; padding:5px 10px; border-radius:6px; font-size:0.75rem; cursor:pointer; font-weight:800; display:flex; align-items:center; gap:4px;">
                      <i class="fa-solid fa-share-nodes"></i> <span>शेयर</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="text-align:center; margin-top:28px;">
          <a href="/tube.html" style="display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color:#ffffff; font-weight:900; font-size:0.92rem; padding:12px 30px; border-radius:30px; text-decoration:none; box-shadow:0 8px 24px rgba(239,68,68,0.35); transition:transform 0.15s ease;">
            <span>📺 AarogyamTube देखें (All Videos & Shorts)</span>
            <span>→</span>
          </a>
        </div>
      `;

      // Attach Click events to cards: open directly in AarogyamTube on-site
      container.querySelectorAll('.universal-video-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.btn-video-share')) {
            e.stopPropagation();
            const title = decodeURIComponent(card.getAttribute('data-title') || 'AarogyamTube Video');
            const vidId = card.getAttribute('data-vid-id');
            const ytId = card.getAttribute('data-yt-id');
            const shareUrl = vidId ? `/tube.html?vid=${vidId}` : (ytId ? `/tube.html?yt=${ytId}` : '/tube.html');
            if (window.AarogyamShareEngine) {
              window.AarogyamShareEngine.share({
                title: title,
                text: `${title} - AarogyamTube पर देखें:`,
                url: shareUrl
              });
            } else if (typeof window.triggerShare === 'function') {
              window.triggerShare({
                title: title,
                text: `${title} - AarogyamTube पर देखें:`,
                url: shareUrl
              });
            }
            return;
          }

          const vidId = card.getAttribute('data-vid-id');
          const ytId = card.getAttribute('data-yt-id');
          const title = decodeURIComponent(card.getAttribute('data-title'));

          // Directly navigate to AarogyamTube player so user never goes to external YouTube
          const targetTubeUrl = vidId ? `/tube.html?vid=${encodeURIComponent(vidId)}` : (ytId ? `/tube.html?yt=${encodeURIComponent(ytId)}` : '/tube.html');
          window.location.href = targetTubeUrl;
        });
      });
    });
  }

  // Global safety link interceptor: Prevent off-site YouTube video navigation anywhere on the website
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a || !a.href) return;
    const href = a.href;
    // Keep channel subscriptions intact
    if (href.includes('/@') || href.includes('sub_confirmation=1')) return;

    // Check if link points to a YouTube video / watch / shorts / embed
    const ytMatch = href.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([\w-]{10,12})/);
    if (ytMatch && ytMatch[1]) {
      e.preventDefault();
      e.stopPropagation();
      const ytId = ytMatch[1];
      window.location.href = `/tube.html?yt=${encodeURIComponent(ytId)}`;
    }
  }, true);

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
