/* ==========================================================================
   UCAS MARKETING ENGINE — LANDING PAGE BUILDER MODULE
   Zero-code mobile landing page creation with full CRUD:
   - Create Landing Page (Image / YouTube + Message + Category)
   - Edit Landing Page (In-place edit & instant update)
   - Delete Landing Page (Safe deletion from cloud & local storage)
   - Unique Share Link Generation (/ucas/landing.html?id=LP...&share_id=...)
   - Creator Attribution & Survey Tracking
   - "My Landing Pages" list with live response counter
   ========================================================================== */

(function (window) {
  'use strict';
  let activeContentType = 'image'; // 'image' | 'youtube' | 'facebook' | 'other'
  let uploadedImageData = null;
  let uploadedCustomThumbData = null; // Custom uploaded thumbnail for video/link posts
  let detectedYoutubeId = null;
  let detectedYoutubeThumbnail = null;
  let facebookMediaUrl = '';
  let otherMediaUrl = '';
  let userLandingPages = [];
  let editingLandingPageId = null; // null for new, string for edit

  const DEFAULT_LP_CATEGORIES = [
    { id: 'agriculture', name: '🌾 Agriculture (कृषि)' },
    { id: 'healthcare', name: '❤️ Health Care (स्वास्थ्य)' },
    { id: 'insurance', name: '🛡️ Insurance (बीमा एवं सुरक्षा)' },
    { id: 'property', name: '🏢 Property (प्रॉपर्टी एवं रियल एस्टेट)' },
    { id: 'cattlecare', name: '🐄 Cattle Care (पशुपालन)' },
    { id: 'beautycare', name: '💄 Beauty Care (सौंदर्य)' },
    { id: 'haircare', name: '💇 Hair Care (केश)' },
    { id: 'netsurf', name: '💼 NetSurf (बिजनेस)' },
    { id: 'webinar', name: '🎥 Webinar Invitation (वेबिनार आमंत्रण)' },
    { id: 'other', name: '📦 अन्य (Other / General)' }
  ];

  function getLandingCategories() {
    try {
      const stored = localStorage.getItem('AAROGYAM_LP_CATEGORIES') || localStorage.getItem('AAROGYAM_GLOBAL_LP_CATEGORIES');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_LP_CATEGORIES;
  }

  function populateLandingCategories() {
    const cats = getLandingCategories();
    const select = document.getElementById('lp_select_category');
    if (select) {
      const cur = select.value;
      select.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      if (cur && cats.some(c => c.id === cur)) select.value = cur;
    }
  }

  function initLandingBuilder() {
    populateLandingCategories();
    bindBuilderEvents();
    loadMyLandingPages();
  }

  function bindBuilderEvents() {
    // Mode switcher buttons
    const btnImageMode = document.getElementById('lp_btn_mode_image');
    const btnYtMode = document.getElementById('lp_btn_mode_youtube');
    const btnFbMode = document.getElementById('lp_btn_mode_facebook');
    const btnOtherMode = document.getElementById('lp_btn_mode_other');

    btnImageMode?.addEventListener('click', () => setContentType('image'));
    btnYtMode?.addEventListener('click', () => setContentType('youtube'));
    btnFbMode?.addEventListener('click', () => setContentType('facebook'));
    btnOtherMode?.addEventListener('click', () => setContentType('other'));

    // Image file upload
    const imageInput = document.getElementById('lp_image_file_input');
    imageInput?.addEventListener('change', handleImageUpload);

    // Custom Thumbnail file upload (for Video & Link posts)
    const customThumbInput = document.getElementById('lp_custom_thumb_file_input');
    customThumbInput?.addEventListener('change', handleCustomThumbUpload);

    const btnClearThumb = document.getElementById('lp_btn_clear_custom_thumb');
    btnClearThumb?.addEventListener('click', clearCustomThumbnail);

    // YouTube URL input (multi-event listener for instant detection)
    const ytInput = document.getElementById('lp_youtube_url_input');
    if (ytInput) {
      ['input', 'paste', 'change', 'blur'].forEach(evtType => {
        ytInput.addEventListener(evtType, () => {
          setTimeout(() => handleYoutubeInput(ytInput.value), 20);
        });
      });
    }

    // Facebook / Instagram URL input
    const fbInput = document.getElementById('lp_facebook_url_input');
    if (fbInput) {
      ['input', 'paste', 'change', 'blur'].forEach(evtType => {
        fbInput.addEventListener(evtType, () => {
          setTimeout(() => handleFacebookInput(fbInput.value), 20);
        });
      });
    }

    // Other / Universal Web Link input
    const otherInput = document.getElementById('lp_other_url_input');
    if (otherInput) {
      ['input', 'paste', 'change', 'blur'].forEach(evtType => {
        otherInput.addEventListener(evtType, () => {
          setTimeout(() => handleOtherInput(otherInput.value), 20);
        });
      });
    }

    // Form submit / update
    const generateBtn = document.getElementById('lp_btn_generate');
    generateBtn?.addEventListener('click', handleFormSubmit);

    // Cancel edit button
    const cancelBtn = document.getElementById('lp_btn_cancel_edit');
    cancelBtn?.addEventListener('click', cancelEdit);

    // Category change listener (for dynamic Webinar & Zoom fields)
    const categorySelect = document.getElementById('lp_select_category');
    categorySelect?.addEventListener('change', handleCategoryChange);

    // Initial load of landing pages
    loadMyLandingPages();
  }

  function handleCategoryChange() {
    const catSelect = document.getElementById('lp_select_category');
    const webinarBox = document.getElementById('lp_webinar_fields_container');
    const msgBox = document.getElementById('lp_input_message');
    const titleInput = document.getElementById('lp_input_title');

    if (catSelect?.value === 'webinar') {
      if (webinarBox) webinarBox.style.display = 'block';
      if (titleInput && !titleInput.value) {
        titleInput.placeholder = 'उदा. लाइव हेल्थ वेबिनार या आधुनिक कृषि प्रशिक्षण 2026';
      }
      if (msgBox && !msgBox.value) {
        msgBox.placeholder = 'उदा. इस विशेष लाइव वेबिनार में भाग लेने के लिए अपना नाम और मोबाइल नंबर दर्ज करें। रजिस्ट्रेशन के तुरंत बाद Zoom लिंक और पासवर्ड मिल जाएगा।';
      }
    } else {
      if (webinarBox) webinarBox.style.display = 'none';
    }
  }

  async function setContentType(type) {
    const profileId = window.UCAS_SESSION.getUserId();
    const perms = await window.UCAS_DB.getUserMediaPermissions(profileId);

    const isAllowed = type === 'image' || perms[type] || perms[`${type}_landing`] || perms.isActive || perms.product || perms.product_landing;

    if (!isAllowed) {
      window.UCAS_APP.showToast(`🔒 ${type.toUpperCase()} सेवा केवल एक्टिव मेंबर्स के लिए उपलब्ध है। अधिक जानकारी के लिए सदस्यता लें।`, 'warning');
      return;
    }

    activeContentType = type;

    const imgSection = document.getElementById('lp_section_image_upload');
    const ytSection = document.getElementById('lp_section_youtube_input');
    const fbSection = document.getElementById('lp_section_facebook_input');
    const otherSection = document.getElementById('lp_section_other_input');
    const customThumbSection = document.getElementById('lp_section_custom_thumb_upload');

    // Toggle Buttons UI
    const btnImg = document.getElementById('lp_btn_mode_image');
    const btnYt = document.getElementById('lp_btn_mode_youtube');
    const btnFb = document.getElementById('lp_btn_mode_facebook');
    const btnOther = document.getElementById('lp_btn_mode_other');

    if (imgSection) imgSection.style.display = type === 'image' ? 'block' : 'none';
    if (ytSection) ytSection.style.display = type === 'youtube' ? 'block' : 'none';
    if (fbSection) fbSection.style.display = type === 'facebook' ? 'block' : 'none';
    if (otherSection) otherSection.style.display = type === 'other' ? 'block' : 'none';

    // Show optional custom thumbnail section for YouTube, Facebook, and Other links
    if (customThumbSection) {
      customThumbSection.style.display = type !== 'image' ? 'block' : 'none';
    }

    if (btnImg) btnImg.className = type === 'image' ? 'ucas-btn ucas-btn-sm ucas-btn-primary' : 'ucas-btn ucas-btn-sm ucas-btn-outline';
    if (btnYt) btnYt.className = type === 'youtube' ? 'ucas-btn ucas-btn-sm ucas-btn-primary' : 'ucas-btn ucas-btn-sm ucas-btn-outline';
    if (btnFb) btnFb.className = type === 'facebook' ? 'ucas-btn ucas-btn-sm ucas-btn-primary' : 'ucas-btn ucas-btn-sm ucas-btn-outline';
    if (btnOther) btnOther.className = type === 'other' ? 'ucas-btn ucas-btn-sm ucas-btn-primary' : 'ucas-btn ucas-btn-sm ucas-btn-outline';

    updateBuilderPreview();
  }

  // ==========================================
  // IMAGE & CUSTOM THUMBNAIL HANDLERS (COMPRESSION)
  // ==========================================

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.UCAS_APP.showToast('कृपया मान्य इमेज फाइल चुनें।', 'error');
      return;
    }

    compressImageFile(file, (dataUrl) => {
      uploadedImageData = dataUrl;
      updateBuilderPreview();
    });
  }

  function handleCustomThumbUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.UCAS_APP.showToast('कृपया मान्य थंबनेल इमेज चुनें।', 'error');
      return;
    }

    compressImageFile(file, (dataUrl) => {
      uploadedCustomThumbData = dataUrl;
      const btnClear = document.getElementById('lp_btn_clear_custom_thumb');
      if (btnClear) btnClear.style.display = 'inline-flex';
      window.UCAS_APP.showToast('✅ कस्टम थंबनेल पोस्टर सेट हो गया!', 'success');
      updateBuilderPreview();
    });
  }

  function clearCustomThumbnail() {
    uploadedCustomThumbData = null;
    const input = document.getElementById('lp_custom_thumb_file_input');
    if (input) input.value = '';
    const btnClear = document.getElementById('lp_btn_clear_custom_thumb');
    if (btnClear) btnClear.style.display = 'none';
    updateBuilderPreview();
    window.UCAS_APP.showToast('कस्टम थंबनेल हटाया गया (डिफ़ॉल्ट उपयोग होगा)।', 'info');
  }

  function compressImageFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1280;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        callback(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // YOUTUBE, FACEBOOK & OTHER URL PARSERS
  // ==========================================

  function extractYoutubeVideoId(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

    const thumbMatch = str.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
    if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) return thumbMatch[1];

    const patterns = [
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
      /[?&]v=([a-zA-Z0-9_-]{11})/i,
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match && match[1] && match[1].length === 11) return match[1];
    }

    const genericMatch = str.match(/(?:[\/=])([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
    if (genericMatch && genericMatch[1] && genericMatch[1].length === 11) return genericMatch[1];

    return null;
  }

  function handleYoutubeInput(val) {
    const videoId = extractYoutubeVideoId(val);
    const helperEl = document.getElementById('lp_yt_helper_text');

    if (videoId) {
      detectedYoutubeId = videoId;
      detectedYoutubeThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:#15803D;font-weight:700;"><i class="fa-solid fa-circle-check"></i> YouTube Video ID पहचाना गया: <code>${videoId}</code></span>`;
      }
    } else {
      detectedYoutubeId = null;
      detectedYoutubeThumbnail = null;
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:var(--text-muted);">उदा. https://youtu.be/dQw4w9WgXcQ या https://youtube.com/shorts/...</span>`;
      }
    }

    updateBuilderPreview();
  }

  function handleFacebookInput(val) {
    facebookMediaUrl = String(val || '').trim();
    const helperEl = document.getElementById('lp_fb_helper_text');
    if (facebookMediaUrl.includes('facebook.com') || facebookMediaUrl.includes('fb.watch') || facebookMediaUrl.includes('instagram.com')) {
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:#15803D;font-weight:700;"><i class="fa-solid fa-circle-check"></i> फेसबुक/इंस्टाग्राम लिंक मान्य है</span>`;
      }
    } else if (facebookMediaUrl) {
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:var(--text-muted);">उदा. https://fb.watch/... या https://www.instagram.com/reel/...</span>`;
      }
    }
    updateBuilderPreview();
  }

  function handleOtherInput(val) {
    otherMediaUrl = String(val || '').trim();
    const helperEl = document.getElementById('lp_other_helper_text');
    if (otherMediaUrl.startsWith('http://') || otherMediaUrl.startsWith('https://')) {
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:#15803D;font-weight:700;"><i class="fa-solid fa-circle-check"></i> वेब लिंक मान्य है</span>`;
      }
    }
    updateBuilderPreview();
  }

  // ==========================================
  // LIVE BUILDER PREVIEW
  // ==========================================

  function updateBuilderPreview() {
    const previewMedia = document.getElementById('lp_preview_media_container');
    if (!previewMedia) return;

    if (activeContentType === 'image') {
      if (uploadedImageData) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;max-height:260px;background:#0f172a;border-radius:var(--radius-md);border:1.5px solid #CBD5E1;overflow:hidden;text-align:center;">
            <img src="${uploadedImageData}" alt="Uploaded Preview" style="width:100%;max-height:260px;object-fit:contain;display:block;margin:0 auto;image-rendering:-webkit-optimize-contrast;">
          </div>
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-regular fa-image" style="font-size:2.2rem;margin-bottom:6px;display:block;color:var(--primary);"></i>
            <span style="font-size:0.88rem;font-weight:600;">इमेज अपलोड करने पर लाइव पूर्वावलोकन यहाँ दिखाई देगा</span>
          </div>
        `;
      }
    } else if (activeContentType === 'youtube') {
      const activeThumb = uploadedCustomThumbData || (detectedYoutubeId ? `https://i.ytimg.com/vi/${detectedYoutubeId}/hqdefault.jpg` : null);

      if (activeThumb) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;max-height:220px;border-radius:var(--radius-md);overflow:hidden;border:1.5px solid #CBD5E1;background:#000;">
            <img src="${activeThumb}" alt="YouTube Thumbnail" style="width:100%;height:200px;object-fit:cover;opacity:0.92;display:block;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58px;height:58px;background:rgba(255,0,0,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.6rem;box-shadow:0 4px 15px rgba(0,0,0,0.4);border:2px solid #fff;">
              <i class="fa-solid fa-play" style="margin-left:4px;"></i>
            </div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;">
              <i class="fa-brands fa-youtube" style="color:#FF0000;"></i> YouTube
            </div>
            ${uploadedCustomThumbData ? '<div style="position:absolute;top:8px;left:8px;background:#15803D;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:4px;">🖼️ Custom Thumbnail</div>' : ''}
          </div>
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-brands fa-youtube" style="font-size:2.4rem;color:#EF4444;margin-bottom:6px;display:block;"></i>
            <span style="font-size:0.88rem;font-weight:600;">YouTube लिंक डालने पर थंबनेल यहाँ दिखाई देगा</span>
          </div>
        `;
      }
    } else if (activeContentType === 'facebook') {
      if (uploadedCustomThumbData) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;max-height:220px;border-radius:var(--radius-md);overflow:hidden;border:1.5px solid #CBD5E1;background:#000;">
            <img src="${uploadedCustomThumbData}" alt="Facebook Custom Thumbnail" style="width:100%;height:200px;object-fit:cover;opacity:0.92;display:block;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:58px;height:58px;background:rgba(24,119,242,0.92);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.6rem;box-shadow:0 4px 15px rgba(0,0,0,0.4);border:2px solid #fff;">
              <i class="fa-solid fa-play" style="margin-left:4px;"></i>
            </div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;">
              <i class="fa-brands fa-facebook"></i> Facebook / Insta Reel
            </div>
            <div style="position:absolute;top:8px;left:8px;background:#15803D;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:4px;">🖼️ Custom Thumbnail</div>
          </div>
        `;
      } else if (facebookMediaUrl) {
        const isInsta = facebookMediaUrl.includes('instagram.com');
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;min-height:180px;border-radius:var(--radius-md);overflow:hidden;border:1.5px solid #CBD5E1;background:linear-gradient(135deg, ${isInsta ? '#833AB4, #FD1D1D, #FCB045' : '#1877F2, #0d233a'});display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;color:#fff;box-shadow:inset 0 0 20px rgba(0,0,0,0.25);">
            <div style="width:54px;height:54px;background:rgba(255,255,255,0.2);backdrop-filter:blur(6px);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:8px;border:2px solid rgba(255,255,255,0.6);">
              <i class="${isInsta ? 'fa-brands fa-instagram' : 'fa-brands fa-facebook'}"></i>
            </div>
            <div style="font-weight:800;font-size:0.95rem;margin-bottom:4px;">${isInsta ? 'Instagram Reel लिंक सेट है' : 'Facebook Video / Reel लिंक सेट है'}</div>
            <div style="font-size:0.76rem;opacity:0.9;max-width:90%;word-break:break-all;font-family:monospace;background:rgba(0,0,0,0.35);padding:3px 8px;border-radius:4px;">${facebookMediaUrl.length > 50 ? facebookMediaUrl.slice(0, 50) + '...' : facebookMediaUrl}</div>
            <div style="margin-top:10px;font-size:0.74rem;background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:var(--radius-full);">
              💡 <em>(वैकल्पिक: अपनी पसंद का पोस्टर लगाने के लिए ऊपर थंबनेल अपलोड करें)</em>
            </div>
          </div>
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-brands fa-facebook" style="font-size:2.4rem;color:#1877F2;margin-bottom:6px;display:block;"></i>
            <span style="font-size:0.88rem;font-weight:600;">Facebook Video या Insta Reel लिंक डालने पर प्रीव्यू यहाँ दिखाई देगा</span>
          </div>
        `;
      }
    } else if (activeContentType === 'other') {
      if (uploadedCustomThumbData) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;max-height:220px;border-radius:var(--radius-md);overflow:hidden;border:1.5px solid #CBD5E1;background:#0f172a;">
            <img src="${uploadedCustomThumbData}" alt="Link Custom Thumbnail" style="width:100%;height:200px;object-fit:cover;opacity:0.92;display:block;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:54px;height:54px;background:rgba(5,150,105,0.92);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.4rem;box-shadow:0 4px 15px rgba(0,0,0,0.4);border:2px solid #fff;">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
            <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;">
              <i class="fa-solid fa-globe"></i> Web Article / News
            </div>
            <div style="position:absolute;top:8px;left:8px;background:#15803D;color:#fff;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:4px;">🖼️ Custom Thumbnail</div>
          </div>
        `;
      } else if (otherMediaUrl) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;min-height:180px;border-radius:var(--radius-md);overflow:hidden;border:1.5px solid #CBD5E1;background:linear-gradient(135deg, #059669, #0f172a);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;color:#fff;box-shadow:inset 0 0 20px rgba(0,0,0,0.25);">
            <div style="width:54px;height:54px;background:rgba(255,255,255,0.2);backdrop-filter:blur(6px);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:8px;border:2px solid rgba(255,255,255,0.6);">
              <i class="fa-solid fa-globe"></i>
            </div>
            <div style="font-weight:800;font-size:0.95rem;margin-bottom:4px;">वेबसाइट / न्यूज़ लिंक सक्रिय है</div>
            <div style="font-size:0.76rem;opacity:0.9;max-width:90%;word-break:break-all;font-family:monospace;background:rgba(0,0,0,0.35);padding:3px 8px;border-radius:4px;">${otherMediaUrl.length > 50 ? otherMediaUrl.slice(0, 50) + '...' : otherMediaUrl}</div>
            <div style="margin-top:10px;font-size:0.74rem;background:rgba(255,255,255,0.18);padding:3px 10px;border-radius:var(--radius-full);">
              💡 <em>(वैकल्पिक: अपनी पसंद का पोस्टर लगाने के लिए ऊपर थंबनेल अपलोड करें)</em>
            </div>
          </div>
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-solid fa-globe" style="font-size:2.4rem;color:#10B981;margin-bottom:6px;display:block;"></i>
            <span style="font-size:0.88rem;font-weight:600;">वेबसाइट / न्यूज़ / ब्लॉग लिंक डालने पर प्रीव्यू यहाँ दिखाई देगा</span>
          </div>
        `;
      }
    }
  }

  // ==========================================
  // CREATE / UPDATE / DELETE LANDING PAGE
  // ==========================================

  function generateUniqueLandingPageId() {
    const count = userLandingPages.length + 1;
    const padCount = String(count).padStart(4, '0');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    return `LP${padCount}${randSuffix}`;
  }

  async function handleFormSubmit() {
    const titleInput = (document.getElementById('lp_input_title')?.value || '').trim();
    const messageInput = (document.getElementById('lp_input_message')?.value || '').trim();
    const categoryInput = document.getElementById('lp_select_category')?.value || 'agriculture';

    if (!messageInput) {
      window.UCAS_APP.showToast('कृपया लैंडिंग पेज के लिए संदेश (Message) अवश्य लिखें।', 'error');
      return;
    }

    if (activeContentType === 'image' && !uploadedImageData) {
      window.UCAS_APP.showToast('कृपया लैंडिंग पेज के लिए इमेज अपलोड करें।', 'error');
      return;
    }

    if (activeContentType === 'youtube') {
      const ytRaw = (document.getElementById('lp_youtube_url_input')?.value || '').trim();
      const videoId = extractYoutubeVideoId(ytRaw) || detectedYoutubeId;
      if (!videoId) {
        window.UCAS_APP.showToast('कृपया मान्य YouTube वीडियो लिंक दर्ज करें।', 'error');
        return;
      }
      detectedYoutubeId = videoId;
      detectedYoutubeThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (activeContentType === 'facebook') {
      const fbRaw = (document.getElementById('lp_facebook_url_input')?.value || '').trim();
      if (!fbRaw) {
        window.UCAS_APP.showToast('कृपया Facebook Video या Instagram Reel लिंक दर्ज करें।', 'error');
        return;
      }
      facebookMediaUrl = fbRaw;
    }

    if (activeContentType === 'other') {
      const otherRaw = (document.getElementById('lp_other_url_input')?.value || '').trim();
      if (!otherRaw) {
        window.UCAS_APP.showToast('कृपया वेबसाइट / न्यूज़ / ब्लॉग लिंक दर्ज करें।', 'error');
        return;
      }
      otherMediaUrl = otherRaw;
    }

    const profileId = window.UCAS_SESSION.getUserId();
    const shareId = window.UCAS_SESSION.getShareId();

    // Webinar / Zoom Data Extraction
    let webinarData = null;
    if (categoryInput === 'webinar') {
      const zoomLink = (document.getElementById('lp_webinar_zoom_link')?.value || '').trim();
      const meetingId = (document.getElementById('lp_webinar_meeting_id')?.value || '').trim();
      const passcode = (document.getElementById('lp_webinar_passcode')?.value || '').trim();
      const rawDate = document.getElementById('lp_webinar_date')?.value || '';
      const rawTime = document.getElementById('lp_webinar_time')?.value || '';
      let datetime = (document.getElementById('lp_webinar_datetime')?.value || '').trim();

      if (rawDate) {
        const dateObj = new Date(rawDate);
        const formattedDate = dateObj.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        let formattedTime = rawTime || '';
        if (rawTime) {
          const [hh, mm] = rawTime.split(':');
          const hNum = parseInt(hh, 10);
          const ampm = hNum >= 12 ? 'PM' : 'AM';
          const h12 = hNum % 12 || 12;
          formattedTime = `${h12}:${mm} ${ampm}`;
        }
        datetime = `${formattedDate}${formattedTime ? ', ' + formattedTime : ''}`;
      }

      const successMsg = (document.getElementById('lp_webinar_success_msg')?.value || '').trim();

      if (!zoomLink && !meetingId) {
        window.UCAS_APP.showToast('कृपया Zoom Join Link या Meeting ID अवश्य दर्ज करें।', 'error');
        return;
      }

      webinarData = {
        zoom_link: zoomLink,
        meeting_id: meetingId,
        passcode: passcode,
        datetime: datetime,
        date: rawDate,
        time: rawTime,
        success_msg: successMsg
      };
    }

    // ==========================================
    // LEGAL TERMS & CONDITIONS CHECK
    // ==========================================
    const termsCheckbox = document.getElementById('lp_terms_checkbox');
    if (termsCheckbox && !termsCheckbox.checked) {
      window.UCAS_APP.showToast('कृपया आगे बढ़ने के लिए नियम, शर्तें व कानूनी घोषणा स्वीकार करें।', 'warning');
      return;
    }

    // ==========================================
    // USER ACTIVE STATUS & REVIEW GOVERNANCE
    // ==========================================
    const sub = await window.UCAS_DB.getUserSubscription(profileId);
    const isUserActive = Boolean(sub?.isActive);
    const perms = await window.UCAS_DB.getUserMediaPermissions(profileId);

    if (!perms[activeContentType]) {
      window.UCAS_APP.showToast(`🔒 ${activeContentType.toUpperCase()} पोस्ट बनाने की अनुमति नहीं है। केवल अधिकृत मेंबर्स के लिए उपलब्ध है।`, 'error');
      return;
    }

    // Inactive users always go to pending_review (requires admin approval)
    const initialStatus = isUserActive ? 'active' : 'pending_review';

    const UCAS_LANDING_LIMITS = {
      INACTIVE_LIMIT: 3,
      ACTIVE_LIMIT: Infinity
    };

    if (!editingLandingPageId && profileId) {
      if (!isUserActive && userLandingPages.length >= UCAS_LANDING_LIMITS.INACTIVE_LIMIT) {
        window.UCAS_APP.showToast('आपकी 3 Landing Page limit पूरी हो गई है। अधिक Landing Pages बनाने के लिए Active User बनें।', 'warning');
        return;
      }
    }

    const generateBtn = document.getElementById('lp_btn_generate');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सेव हो रहा है...';
    }

    try {
      // Determine final Media URL & Thumbnail
      let finalMediaUrl = '';
      let finalThumbnailUrl = '';
      const defaultBanner = 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';

      const prodMrp = (document.getElementById('lp_prod_mrp')?.value || '').trim();
      const prodOffer = (document.getElementById('lp_prod_offer_price')?.value || '').trim();
      const prodBuyUrl = (document.getElementById('lp_prod_buynow_url')?.value || '').trim();

      let productData = null;
      if (activeContentType === 'image') {
        finalMediaUrl = uploadedImageData;
        finalThumbnailUrl = uploadedImageData;
      } else if (activeContentType === 'product') {
        finalMediaUrl = uploadedImageData || defaultBanner;
        finalThumbnailUrl = uploadedImageData || defaultBanner;
        productData = {
          mrp: prodMrp,
          offer_price: prodOffer,
          buynow_url: prodBuyUrl,
          image: uploadedImageData || defaultBanner
        };
      } else if (activeContentType === 'youtube') {
        finalMediaUrl = `https://www.youtube.com/watch?v=${detectedYoutubeId}`;
        finalThumbnailUrl = uploadedCustomThumbData || detectedYoutubeThumbnail || '';
      } else if (activeContentType === 'facebook') {
        finalMediaUrl = facebookMediaUrl;
        finalThumbnailUrl = uploadedCustomThumbData || '';
      } else if (activeContentType === 'other') {
        finalMediaUrl = otherMediaUrl;
        finalThumbnailUrl = uploadedCustomThumbData || '';
      }

      if (editingLandingPageId) {
        // =======================
        // UPDATE EXISTING PAGE
        // =======================
        const lpId = editingLandingPageId;
        const cleanTitle = (titleInput ? titleInput.trim() : `${categoryInput.toUpperCase()} Campaign (${lpId})`);
        const ogTitle = cleanTitle.includes('Aarogyam India') ? cleanTitle : `${cleanTitle} | Aarogyam India`;
        const ogDesc = (messageInput ? messageInput.slice(0, 160).trim() : 'Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।');
        
        let ogImg = '';
        if (uploadedCustomThumbData || (activeContentType === 'image' && uploadedImageData)) {
          ogImg = `https://aarogyamindia.online/api/image?id=${lpId}`;
        } else if (activeContentType === 'youtube' && detectedYoutubeId) {
          ogImg = `https://i.ytimg.com/vi/${detectedYoutubeId}/hqdefault.jpg`;
        }

        const updatePayload = {
          id: lpId,
          title: cleanTitle,
          category: categoryInput,
          content_type: activeContentType,
          media_url: finalMediaUrl,
          thumbnail_url: finalThumbnailUrl,
          message: messageInput,
          webinar_data: webinarData,
          product_data: productData,
          mrp: prodMrp ? Number(prodMrp) : null,
          offer_price: prodOffer ? Number(prodOffer) : null,
          buynow_url: prodBuyUrl || null,
          og_title: ogTitle,
          og_description: ogDesc,
          og_image_url: ogImg
        };

        const res = await window.UCAS_DB.updateLandingPage(lpId, updatePayload, profileId);
        if (res.success) {
          window.UCAS_APP.showToast(`✅ लैंडिंग पेज (${lpId}) सफलतापूर्वक अपडेट हो गया!`, 'success');
          showGeneratedResult({ ...updatePayload, share_id: shareId });
          cancelEdit();
          await loadMyLandingPages();
          if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
            await window.UCAS_MARKETING.refreshLandingPages();
          }
        } else {
          window.UCAS_APP.showToast('अपडेट करने में त्रुटि: ' + (res.message || ''), 'error');
        }
      } else {
        // =======================
        // CREATE NEW PAGE
        // =======================
        const lpId = generateUniqueLandingPageId();
        const cleanTitle = (titleInput ? titleInput.trim() : `${categoryInput.toUpperCase()} Campaign (${lpId})`);
        const ogTitle = cleanTitle.includes('Aarogyam India') ? cleanTitle : `${cleanTitle} | Aarogyam India`;
        const ogDesc = (messageInput ? messageInput.slice(0, 160).trim() : 'Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।');
        
        let ogImg = '';
        if (uploadedCustomThumbData || (activeContentType === 'image' && uploadedImageData)) {
          ogImg = `https://aarogyamindia.online/api/image?id=${lpId}`;
        } else if (activeContentType === 'youtube' && detectedYoutubeId) {
          ogImg = `https://i.ytimg.com/vi/${detectedYoutubeId}/hqdefault.jpg`;
        }

        const payload = {
          id: lpId,
          profile_id: profileId,
          share_id: shareId,
          title: cleanTitle,
          category: categoryInput,
          content_type: activeContentType,
          media_url: finalMediaUrl,
          thumbnail_url: finalThumbnailUrl,
          message: messageInput,
          webinar_data: webinarData,
          product_data: productData,
          mrp: prodMrp ? Number(prodMrp) : null,
          offer_price: prodOffer ? Number(prodOffer) : null,
          buynow_url: prodBuyUrl || null,
          status: initialStatus,
          og_title: ogTitle,
          og_description: ogDesc,
          og_image_url: ogImg,
          created_at: new Date().toISOString()
        };

        const res = await window.UCAS_DB.createLandingPage(payload);
        if (res.success) {
          // Trigger Admin Notification
          try {
            const db = window.UCAS_DB.getDb();
            if (db) {
              const userName = window.UCAS_SESSION.getUserName() || 'User';
              await db.from('notifications').insert([{
                profile_id: profileId,
                type: 'landing_page_created',
                title: `📄 नया लैंडिंग पेज बनाया गया: ${cleanTitle}`,
                message: `${userName} (${shareId} - ${isUserActive ? '🟢 Active User' : '🔴 Inactive User'}) ने नया लैंडिंग पेज बनाया। ${isUserActive ? 'स्वतः लाइव हुआ।' : 'समीक्षा (Review) करें।'}`,
                link: '#landing-page-control',
                created_at: new Date().toISOString()
              }]);
            }
          } catch (notifErr) {
            console.warn('Admin notification error', notifErr);
          }

          if (isUserActive) {
            window.UCAS_APP.showToast(`🎉 लैंडिंग पेज (${lpId}) लाइव हो गया!`, 'success');
          } else {
            window.UCAS_APP.showToast(`⏳ लैंडिंग पेज (${lpId}) समीक्षा के लिए सबमिट हुआ। एडमिन अप्रूवल के बाद शेयर होगा।`, 'info');
          }

          showGeneratedResult(payload);
          resetBuilderForm();
          await loadMyLandingPages();
          if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
            await window.UCAS_MARKETING.refreshLandingPages();
          }
        } else {
          window.UCAS_APP.showToast('लैंडिंग पेज बनाने में त्रुटि: ' + (res.message || ''), 'error');
        }
      }
    } catch (e) {
      console.error('Landing page submit error', e);
      window.UCAS_APP.showToast('त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.innerHTML = editingLandingPageId 
          ? '<i class="fa-solid fa-floppy-disk"></i> 💾 Update Landing Page (अपडेट करें)'
          : '<i class="fa-solid fa-wand-magic-sparkles"></i> 🔗 Generate Landing Page';
      }
    }
  }

  function editLandingPage(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;

    if (lp.created_by_admin || lp.is_admin_template || (lp.share_id === 'ADMIN' && lp.profile_id !== window.UCAS_SESSION.getUserId())) {
      window.UCAS_APP.showToast('🔒 यह पेज एडमिन द्वारा जारी किया गया है। आप इसे सीधे शेयर कर सकते हैं, पर एडिट नहीं कर सकते।', 'info');
      return;
    }

    editingLandingPageId = lp.id;

    // Reset Custom Thumb State before populating
    uploadedImageData = null;
    uploadedCustomThumbData = null;
    const btnClearThumb = document.getElementById('lp_btn_clear_custom_thumb');
    if (btnClearThumb) btnClearThumb.style.display = 'none';
    const customThumbInput = document.getElementById('lp_custom_thumb_file_input');
    if (customThumbInput) customThumbInput.value = '';

    // Populate Fields
    const titleInput = document.getElementById('lp_input_title');
    const messageInput = document.getElementById('lp_input_message');
    const categorySelect = document.getElementById('lp_select_category');
    const ytInput = document.getElementById('lp_youtube_url_input');
    const fbInput = document.getElementById('lp_facebook_url_input');
    const otherInput = document.getElementById('lp_other_url_input');

    if (titleInput) titleInput.value = lp.title || '';
    if (messageInput) messageInput.value = lp.message || '';
    if (categorySelect) categorySelect.value = lp.category || 'agriculture';

    // Populate Webinar Fields if applicable
    const webinarBox = document.getElementById('lp_webinar_fields_container');
    if (lp.category === 'webinar') {
      const webData = lp.webinar_data || {};
      const zoomLinkInput = document.getElementById('lp_webinar_zoom_link');
      const meetingIdInput = document.getElementById('lp_webinar_meeting_id');
      const passcodeInput = document.getElementById('lp_webinar_passcode');
      const dtInput = document.getElementById('lp_webinar_datetime');
      const successMsgInput = document.getElementById('lp_webinar_success_msg');

      if (zoomLinkInput) zoomLinkInput.value = webData.zoom_link || '';
      if (meetingIdInput) meetingIdInput.value = webData.meeting_id || '';
      if (passcodeInput) passcodeInput.value = webData.passcode || '';
      if (dtInput) dtInput.value = webData.datetime || '';
      const dInput = document.getElementById('lp_webinar_date');
      const tInput = document.getElementById('lp_webinar_time');
      if (dInput) dInput.value = webData.date || '';
      if (tInput) tInput.value = webData.time || '';
      if (successMsgInput) successMsgInput.value = webData.success_msg || '';
      if (webinarBox) webinarBox.style.display = 'block';
    } else {
      if (webinarBox) webinarBox.style.display = 'none';
    }

    // Set Media Content & Mode
    const isCustomThumb = Boolean(lp.thumbnail_url && lp.thumbnail_url.startsWith('data:image/') && !lp.thumbnail_url.includes('farmer-community-banner'));

    if (lp.content_type === 'product' || lp.product_data) {
      setContentType('product');
      const pData = lp.product_data || {};
      const mrpEl = document.getElementById('lp_prod_mrp');
      const offerEl = document.getElementById('lp_prod_offer_price');
      const buyUrlEl = document.getElementById('lp_prod_buynow_url');
      if (mrpEl) mrpEl.value = pData.mrp || lp.mrp || '';
      if (offerEl) offerEl.value = pData.offer_price || lp.offer_price || '';
      if (buyUrlEl) buyUrlEl.value = pData.buynow_url || lp.buynow_url || '';
      uploadedImageData = pData.image || lp.media_url || lp.thumbnail_url;
    } else if (lp.content_type === 'youtube') {
      setContentType('youtube');
      if (ytInput) ytInput.value = lp.media_url || '';
      handleYoutubeInput(lp.media_url || '');
      if (isCustomThumb) {
        uploadedCustomThumbData = lp.thumbnail_url;
        if (btnClearThumb) btnClearThumb.style.display = 'inline-flex';
      }
    } else if (lp.content_type === 'facebook' || lp.content_type === 'fb') {
      setContentType('facebook');
      if (fbInput) fbInput.value = lp.media_url || '';
      handleFacebookInput(lp.media_url || '');
      if (isCustomThumb) {
        uploadedCustomThumbData = lp.thumbnail_url;
        if (btnClearThumb) btnClearThumb.style.display = 'inline-flex';
      }
    } else if (lp.content_type === 'other' || lp.content_type === 'link') {
      setContentType('other');
      if (otherInput) otherInput.value = lp.media_url || '';
      handleOtherInput(lp.media_url || '');
      if (isCustomThumb) {
        uploadedCustomThumbData = lp.thumbnail_url;
        if (btnClearThumb) btnClearThumb.style.display = 'inline-flex';
      }
    } else {
      setContentType('image');
      uploadedImageData = lp.media_url || lp.thumbnail_url;
    }

    updateBuilderPreview();

    // Change Button States
    const generateBtn = document.getElementById('lp_btn_generate');
    const cancelBtn = document.getElementById('lp_btn_cancel_edit');
    const editNotice = document.getElementById('lp_edit_mode_notice');
    const editIdSpan = document.getElementById('lp_editing_page_id');

    if (generateBtn) generateBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 💾 Update Landing Page (अपडेट करें)';
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';
    if (editNotice) editNotice.style.display = 'flex';
    if (editIdSpan) editIdSpan.textContent = lp.id;

    // Scroll to builder
    const builderSection = document.getElementById('lp_builder_card_main');
    if (builderSection) {
      builderSection.scrollIntoView({ behavior: 'smooth' });
    }

    window.UCAS_APP.showToast(`✏️ लैंडिंग पेज ${lp.id} संपादन मोड में लोड हुआ।`, 'info');
  }

  function cancelEdit() {
    editingLandingPageId = null;
    resetBuilderForm();

    const generateBtn = document.getElementById('lp_btn_generate');
    const cancelBtn = document.getElementById('lp_btn_cancel_edit');
    const editNotice = document.getElementById('lp_edit_mode_notice');

    if (generateBtn) generateBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> 🔗 Generate Landing Page';
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (editNotice) editNotice.style.display = 'none';
  }

  async function deleteLandingPage(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    const title = lp ? lp.title : lpId;

    if (lp && (lp.created_by_admin || lp.is_admin_template || (lp.share_id === 'ADMIN' && lp.profile_id !== window.UCAS_SESSION.getUserId()))) {
      window.UCAS_APP.showToast('🔒 यह पेज एडमिन द्वारा जारी किया गया है। इसे हटाया नहीं जा सकता।', 'info');
      return;
    }

    if (!confirm(`क्या आप वाकई लैंडिंग पेज "${title}" (${lpId}) को हटाना चाहते हैं?`)) {
      return;
    }

    const profileId = window.UCAS_SESSION.getUserId();

    try {
      const res = await window.UCAS_DB.deleteLandingPage(lpId, profileId);
      if (res.success) {
        window.UCAS_APP.showToast(`🗑️ लैंडिंग पेज (${lpId}) सफलतापूर्वक हटा दिया गया।`, 'success');
        if (editingLandingPageId === lpId) {
          cancelEdit();
        }
        await loadMyLandingPages();
        if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
          await window.UCAS_MARKETING.refreshLandingPages();
        }
      } else {
        window.UCAS_APP.showToast('हटाने में त्रुटि: ' + (res.message || ''), 'error');
      }
    } catch (e) {
      console.error('Delete landing page error', e);
      window.UCAS_APP.showToast('त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
    }
  }

  function getLandingPageShareUrl(lp) {
    const origin = window.location.origin || 'https://aarogyamindia.online';
    const isProduction = !window.location.port;
    const targetPath = isProduction ? '/api/share' : '/ucas/landing.html';
    const url = new URL(targetPath, origin);
    url.searchParams.set('id', lp.id);
    url.searchParams.set('share_id', lp.share_id || window.UCAS_SESSION.getShareId());
    return url.toString();
  }

  function showGeneratedResult(lp) {
    const resultCard = document.getElementById('lp_generated_result_card');
    const linkInput = document.getElementById('lp_generated_share_url');
    const idBadge = document.getElementById('lp_generated_id_badge');
    if (!resultCard || !linkInput) return;

    const shareUrl = getLandingPageShareUrl(lp);
    linkInput.value = shareUrl;
    if (idBadge) idBadge.textContent = lp.id;

    const isPending = lp.status === 'pending_review';
    const isBlocked = lp.status === 'blocked' || lp.status === 'disabled';

    // Show under review notice if applicable
    let reviewNotice = document.getElementById('lp_result_review_notice');
    if (!reviewNotice) {
      reviewNotice = document.createElement('div');
      reviewNotice.id = 'lp_result_review_notice';
      resultCard.insertBefore(reviewNotice, resultCard.firstChild);
    }

    if (isPending) {
      reviewNotice.style.display = 'block';
      reviewNotice.innerHTML = `
        <div style="background:#FEF3C7;border:1.5px solid #F59E0B;border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:#B45309;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-hourglass-half" style="font-size:1.2rem;"></i>
          <span>⏳ आपका लैंडिंग पेज एडमिन समीक्षा (Under Review) में है। एडमिन द्वारा स्वीकृत होने के बाद ही यह लाइव होगा और शेयर किया जा सकेगा।</span>
        </div>
      `;
    } else if (isBlocked) {
      reviewNotice.style.display = 'block';
      reviewNotice.innerHTML = `
        <div style="background:#FEE2E2;border:1.5px solid #EF4444;border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:#B91C1C;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-ban" style="font-size:1.2rem;"></i>
          <span>🔴 यह लैंडिंग पेज एडमिन द्वारा ब्लॉक/निष्क्रिय किया गया है।</span>
        </div>
      `;
    } else {
      reviewNotice.style.display = 'none';
    }

    // Attach actions
    const btnCopy = document.getElementById('lp_btn_copy_url');
    const btnWa = document.getElementById('lp_btn_wa_share');
    const btnFb = document.getElementById('lp_btn_fb_share');
    const btnNative = document.getElementById('lp_btn_native_share');
    const btnView = document.getElementById('lp_btn_view_page');

    if (btnCopy) {
      btnCopy.onclick = () => {
        if (isPending) {
          window.UCAS_APP.showToast('⚠️ पेज समीक्षा में है। एडमिन अप्रूवल के बाद लिंक शेयर करें।', 'warning');
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            window.UCAS_APP.showToast('✅ लैंडिंग पेज लिंक कॉपी हो गया!', 'success');
          });
        } else {
          window.UCAS_APP.showToast('लिंक: ' + shareUrl, 'info');
        }
      };
    }

    if (btnWa) {
      btnWa.onclick = () => {
        if (isPending) {
          window.UCAS_APP.showToast('⚠️ यह लैंडिंग पेज अभी एडमिन समीक्षा में है। अप्रूवल के बाद WhatsApp पर शेयर कर सकेंगे।', 'warning');
          return;
        }
        if (isBlocked) {
          window.UCAS_APP.showToast('🔴 यह लैंडिंग पेज ब्लॉक है।', 'error');
          return;
        }
        const text = `${lp.message}\n\n👉 यहाँ देखें और छोटा सर्वे भरें:\n${shareUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      };
    }

    if (btnFb) {
      btnFb.onclick = () => {
        if (isPending) {
          window.UCAS_APP.showToast('⚠️ यह लैंडिंग पेज अभी एडमिन समीक्षा में है। अप्रूवल के बाद Facebook पर शेयर कर सकेंगे।', 'warning');
          return;
        }
        if (isBlocked) {
          window.UCAS_APP.showToast('🔴 यह लैंडिंग पेज ब्लॉक है।', 'error');
          return;
        }
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
      };
    }

    if (btnNative) {
      btnNative.onclick = () => {
        if (isPending) {
          window.UCAS_APP.showToast('⚠️ पेज अभी समीक्षा में है।', 'warning');
          return;
        }
        if (navigator.share) {
          navigator.share({
            title: lp.title,
            text: lp.message,
            url: shareUrl
          }).catch(() => {});
        } else if (btnCopy) {
          btnCopy.click();
        }
      };
    }

    if (btnView) {
      btnView.onclick = () => {
        window.open(shareUrl, '_blank');
      };
    }

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }

  function resetBuilderForm() {
    const titleInput = document.getElementById('lp_input_title');
    const messageInput = document.getElementById('lp_input_message');
    const imgInput = document.getElementById('lp_image_file_input');
    const ytInput = document.getElementById('lp_youtube_url_input');

    const zoomLinkInput = document.getElementById('lp_webinar_zoom_link');
    const meetingIdInput = document.getElementById('lp_webinar_meeting_id');
    const passcodeInput = document.getElementById('lp_webinar_passcode');
    const dtInput = document.getElementById('lp_webinar_datetime');
    const successMsgInput = document.getElementById('lp_webinar_success_msg');
    const webinarBox = document.getElementById('lp_webinar_fields_container');

    if (titleInput) titleInput.value = '';
    if (messageInput) messageInput.value = '';
    if (imgInput) imgInput.value = '';
    if (ytInput) ytInput.value = '';

    if (zoomLinkInput) zoomLinkInput.value = '';
    if (meetingIdInput) meetingIdInput.value = '';
    if (passcodeInput) passcodeInput.value = '';
    if (dtInput) dtInput.value = '';
    if (successMsgInput) successMsgInput.value = '';
    if (webinarBox) webinarBox.style.display = 'none';

    uploadedImageData = null;
    detectedYoutubeId = null;
    detectedYoutubeThumbnail = null;

    updateBuilderPreview();
  }

  // ==========================================
  // MY LANDING PAGES TABLE & STATS
  // ==========================================

  let currentMediaFilter = 'all';

  async function loadMyLandingPages() {
    let profileId = window.UCAS_SESSION.getUserId();
    if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(profileId).trim())) {
      profileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
    }

    try {
      const res = await window.UCAS_DB.getLandingPages(profileId);
      userLandingPages = res.data || [];
      renderMyLandingPagesTable(userLandingPages);
    } catch (e) {
      console.error('Load landing pages error', e);
      const container = document.getElementById('ucas-my-landing-pages-container') || document.getElementById('ucas-my-landing-pages-cards');
      if (container) {
        container.innerHTML = `
          <div style="text-align:center;padding:2.5rem 1.5rem;color:var(--text-muted);background:#F8FAFC;border-radius:var(--radius-md);border:1.5px dashed #CBD5E1;">
            <div style="font-size:2rem;margin-bottom:8px;">🎯</div>
            <strong style="font-size:1rem;color:var(--text-main);">कोई लैंडिंग पेज उपलब्ध नहीं है।</strong>
            <p style="font-size:0.82rem;margin-top:4px;">ऊपर दिए गए फॉर्म से अपना नया लैंडिंग पेज बनाएं।</p>
          </div>
        `;
      }
    }
  }

  function isProductPage(p) {
    if (!p) return false;
    if (p.content_type === 'product') return true;
    if (p.product_data && typeof p.product_data === 'object' && Object.keys(p.product_data).length > 0 && (p.product_data.buynow_url || p.product_data.offer_price)) {
      return true;
    }
    return false;
  }

  function filterMyLandingPages(filterType, btnEl) {
    currentMediaFilter = filterType || 'all';

    const filterBtns = document.querySelectorAll('.ucas-lp-filter-btn');
    filterBtns.forEach(b => {
      if (b.getAttribute('data-filter') === filterType) {
        b.className = 'ucas-btn ucas-btn-sm ucas-lp-filter-btn active';
      } else {
        b.className = 'ucas-btn ucas-btn-sm ucas-lp-filter-btn';
      }
    });

    const nonProductPages = (userLandingPages || []).filter(p => !isProductPage(p));

    if (currentMediaFilter === 'all') {
      renderMyLandingPagesTable(nonProductPages);
      return;
    }

    const filtered = nonProductPages.filter(p => {
      const cType = String(p.content_type || '').toLowerCase();
      const mUrl = String(p.media_url || '').toLowerCase();
      if (currentMediaFilter === 'image') return cType === 'image' || (!cType && !p.webinar_data);
      if (currentMediaFilter === 'youtube') return cType === 'youtube' || mUrl.includes('youtube') || mUrl.includes('youtu.be');
      if (currentMediaFilter === 'facebook') return cType === 'facebook' || cType === 'fb' || cType === 'instagram' || mUrl.includes('facebook') || mUrl.includes('fb.') || mUrl.includes('instagram.com');
      if (currentMediaFilter === 'other') return cType === 'other' || cType === 'link';
      return true;
    });

    renderMyLandingPagesTable(filtered);
  }

  function renderMyLandingPagesTable(pages) {
    const container = document.getElementById('ucas-my-landing-pages-container') || document.getElementById('ucas-my-landing-pages-cards') || document.getElementById('ucas-my-landing-pages-tbody');
    const countEl = document.getElementById('ucas-my-landing-pages-count');
    
    // Filter out product pages from Marketing Engine view
    const nonProductPages = (pages || []).filter(p => !isProductPage(p));
    const allNonProductTotal = (userLandingPages || []).filter(p => !isProductPage(p)).length;

    if (countEl) countEl.textContent = allNonProductTotal;
    if (!container) return;

    if (!nonProductPages || nonProductPages.length === 0) {
      const filterNameMap = {
        'all': 'सोशल/मीडिया',
        'image': 'इमेज',
        'youtube': 'YouTube वीडियो',
        'facebook': 'Facebook / Insta',
        'other': 'Web Link'
      };
      const selName = filterNameMap[currentMediaFilter] || 'इस श्रेणी में';

      container.innerHTML = `
        <div style="text-align:center;padding:2.5rem 1.5rem;color:var(--text-muted);background:#F8FAFC;border-radius:var(--radius-md);border:1.5px dashed #CBD5E1;">
          <div style="font-size:2rem;margin-bottom:8px;">🎯</div>
          <strong style="font-size:1rem;color:var(--text-main);">${selName} का कोई लैंडिंग पेज नहीं मिला।</strong>
          <p style="font-size:0.82rem;margin-top:4px;">अन्य फ़िल्टर चुनें या ऊपर दिए गए फॉर्म से नया पेज बनाएं।</p>
        </div>
      `;
      return;
    }

    // Split pages by content type
    const imagePages = nonProductPages.filter(p => (p.content_type === 'image' || (!p.content_type && !p.webinar_data)) && !String(p.media_url || '').includes('youtu') && !String(p.media_url || '').includes('facebook') && !String(p.media_url || '').includes('fb.') && !String(p.media_url || '').includes('instagram'));
    const youtubePages = nonProductPages.filter(p => p.content_type === 'youtube' || String(p.media_url || '').includes('youtu'));
    const facebookPages = nonProductPages.filter(p => p.content_type === 'facebook' || p.content_type === 'fb' || p.content_type === 'instagram' || String(p.media_url || '').includes('fb') || String(p.media_url || '').includes('insta'));
    const otherPages = nonProductPages.filter(p => p.content_type === 'other' || p.content_type === 'link');

    function renderPageCard(lp, idx, categoryTheme) {
      const dateStr = lp.created_at ? new Date(lp.created_at).toLocaleDateString('hi-IN') : '-';
      const shareUrl = getLandingPageShareUrl(lp);
      const responsesCount = lp.response_count || 0;
      const isPending = lp.status === 'pending_review';
      const isBlocked = lp.status === 'blocked' || lp.status === 'disabled';
      const isProduct = lp.content_type === 'product' || Boolean(lp.product_data) || Boolean(lp.offer_price);

      const mediaBadge = isProduct
        ? '<span style="background:#FEF3C7;color:#B45309;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-cart-shopping"></i> Product</span>'
        : lp.content_type === 'youtube'
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;"><i class="fa-brands fa-youtube"></i> YouTube</span>'
        : lp.content_type === 'facebook' || lp.content_type === 'fb' || lp.content_type === 'instagram'
        ? '<span style="background:#DBEAFE;color:#1D4ED8;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;"><i class="fa-brands fa-facebook"></i> Facebook / Insta</span>'
        : lp.content_type === 'other' || lp.content_type === 'link'
        ? '<span style="background:#D1FAE5;color:#059669;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;"><i class="fa-solid fa-globe"></i> Web Link</span>'
        : '<span style="background:#E0F2FE;color:#0284C7;padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:700;"><i class="fa-regular fa-image"></i> Image</span>';

      const statusBadge = isPending
        ? '<span style="background:#FEF3C7;color:#D97706;padding:2px 8px;border-radius:var(--radius-full);font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-hourglass-half"></i> Under Review</span>'
        : isBlocked
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 8px;border-radius:var(--radius-full);font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-ban"></i> Blocked</span>'
        : '<span style="background:#DCFCE7;color:#15803D;padding:2px 8px;border-radius:var(--radius-full);font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-circle-check"></i> Live</span>';

      const isAdminCreated = Boolean(lp.created_by_admin || lp.is_admin_template || (lp.share_id === 'ADMIN' && lp.profile_id !== window.UCAS_SESSION.getUserId()));

      return `
        <div class="ucas-post-elevated-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="display:flex;align-items:flex-start;gap:10px;">
              <span style="background:var(--primary);color:#fff;font-weight:800;font-size:0.8rem;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                ${idx + 1}
              </span>
              <div>
                <div style="font-weight:800;font-size:1.02rem;color:var(--text-main);line-height:1.3;">
                  ${lp.title} ${isAdminCreated ? '<span style="font-size:0.7rem;background:#FEF3C7;color:#B45309;padding:2px 6px;border-radius:4px;font-weight:700;margin-left:4px;">👑 एडमिन जारी</span>' : ''}
                </div>
                <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;">
                  ID: <strong style="color:var(--primary-dark);font-family:monospace;">${lp.id}</strong> • 📅 ${dateStr}
                  ${isProduct && (lp.offer_price || lp.product_data?.offer_price) ? ` • <strong style="color:#059669;">₹${lp.offer_price || lp.product_data?.offer_price}</strong>` : ''}
                </div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
              ${statusBadge}
              ${mediaBadge}
            </div>
          </div>

          <!-- Category & Surveys Info -->
          <div style="display:flex;align-items:center;justify-content:space-between;background:#F8FAFC;padding:8px 12px;border-radius:var(--radius-sm);border:1px solid var(--border);">
            <span style="font-size:0.8rem;color:var(--text-muted);font-weight:600;">कैटेगरी: <strong style="color:var(--text-main);">${(lp.category || 'other').toUpperCase()}</strong></span>
            <span style="font-weight:800;font-size:0.85rem;color:#15803D;background:#DCFCE7;padding:3px 10px;border-radius:var(--radius-full);display:inline-flex;align-items:center;gap:4px;">
              <i class="fa-solid fa-clipboard-check"></i> ${responsesCount} Surveys / Leads
            </span>
          </div>

          <!-- 2 Rows of Buttons: Top Row 4 Buttons, Bottom Row 3 Buttons -->
          <div class="ucas-actions-two-rows">
            <!-- Row 1: 4 Sharing Buttons -->
            <div class="ucas-btn-row-4">
              <button class="ucas-btn-act ucas-btn-act-wa" onclick="UCAS_LANDING_BUILDER.shareLandingPageWhatsApp('${lp.id}')" title="WhatsApp Share">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp
              </button>
              <button class="ucas-btn-act ucas-btn-act-fb" onclick="UCAS_LANDING_BUILDER.shareLandingPageFacebook('${lp.id}')" title="Facebook Share">
                <i class="fa-brands fa-facebook"></i> Facebook
              </button>
              <button class="ucas-btn-act ucas-btn-act-share" onclick="UCAS_LANDING_BUILDER.shareLandingPageNative('${lp.id}')" title="अन्य ऐप्स पर शेयर">
                <i class="fa-solid fa-share-nodes"></i> शेयर
              </button>
              <button class="ucas-btn-act ucas-btn-act-copy" onclick="UCAS_LANDING_BUILDER.copyLandingPageLink('${lp.id}')" title="Copy Link">
                <i class="fa-regular fa-copy"></i> कॉपी
              </button>
            </div>
            <!-- Row 2: 3 Management Buttons -->
            <div class="ucas-btn-row-3">
              <button class="ucas-btn-act ucas-btn-act-view" onclick="window.open('${shareUrl}', '_blank')" title="पेज देखें">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> देखें
              </button>
              ${isAdminCreated ? `
                <button class="ucas-btn-act ucas-btn-act-edit" style="opacity:0.7;background:#F1F5F9;color:#64748B;cursor:not-allowed;" onclick="window.UCAS_APP.showToast('🔒 यह पेज एडमिन द्वारा जारी किया गया है। आप इसे सीधे शेयर कर सकते हैं, पर एडिट नहीं कर सकते।', 'info')" title="एडमिन द्वारा सुरक्षित (Admin Template)">
                  <i class="fa-solid fa-lock"></i> एडमिन पेज
                </button>
                <button class="ucas-btn-act ucas-btn-act-delete" style="opacity:0.7;background:#F1F5F9;color:#64748B;cursor:not-allowed;" onclick="window.UCAS_APP.showToast('🔒 एडमिन द्वारा जारी किया गया पेज हटाया नहीं जा सकता।', 'info')" title="हटाया नहीं जा सकता">
                  <i class="fa-solid fa-lock"></i> सुरक्षित
                </button>
              ` : `
                <button class="ucas-btn-act ucas-btn-act-edit" onclick="UCAS_LANDING_BUILDER.editLandingPage('${lp.id}')" title="एडिट करें">
                  <i class="fa-solid fa-pen-to-square"></i> एडिट
                </button>
                <button class="ucas-btn-act ucas-btn-act-delete" onclick="UCAS_LANDING_BUILDER.deleteLandingPage('${lp.id}')" title="हटाएं">
                  <i class="fa-solid fa-trash-can"></i> हटाएं
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }

    let html = '';

    // 1. Image Landing Pages Group
    if (imagePages.length > 0) {
      html += `
        <div class="ucas-lp-cat-header" style="border-left-color:#0284C7;">
          <i class="fa-regular fa-image" style="color:#0284C7;font-size:1.15rem;"></i>
          <span>🖼️ इमेज लैंडिंग पेज (Image Posts)</span>
          <span class="ucas-lp-cat-badge" style="background:#0284C7;">${imagePages.length}</span>
        </div>
        ${imagePages.map((lp, idx) => renderPageCard(lp, idx, 'image')).join('')}
      `;
    }

    // 2. YouTube Video Landing Pages Group
    if (youtubePages.length > 0) {
      html += `
        <div class="ucas-lp-cat-header" style="border-left-color:#DC2626;">
          <i class="fa-brands fa-youtube" style="color:#DC2626;font-size:1.15rem;"></i>
          <span>🎥 YouTube वीडियो लैंडिंग पेज (YouTube Video Posts)</span>
          <span class="ucas-lp-cat-badge" style="background:#DC2626;">${youtubePages.length}</span>
        </div>
        ${youtubePages.map((lp, idx) => renderPageCard(lp, idx, 'youtube')).join('')}
      `;
    }

    // 3. Facebook Video Landing Pages Group
    if (facebookPages.length > 0) {
      html += `
        <div class="ucas-lp-cat-header" style="border-left-color:#1877F2;">
          <i class="fa-brands fa-facebook" style="color:#1877F2;font-size:1.15rem;"></i>
          <span>📹 Facebook वीडियो लैंडिंग पेज (Facebook Video Posts)</span>
          <span class="ucas-lp-cat-badge" style="background:#1877F2;">${facebookPages.length}</span>
        </div>
        ${facebookPages.map((lp, idx) => renderPageCard(lp, idx, 'facebook')).join('')}
      `;
    }

    // 4. Other Landing Pages Group
    if (otherPages.length > 0) {
      html += `
        <div class="ucas-lp-cat-header" style="border-left-color:#7C3AED;">
          <i class="fa-solid fa-layer-group" style="color:#7C3AED;font-size:1.15rem;"></i>
          <span>📄 अन्य लैंडिंग पेज (Other Campaigns)</span>
          <span class="ucas-lp-cat-badge" style="background:#7C3AED;">${otherPages.length}</span>
        </div>
        ${otherPages.map((lp, idx) => renderPageCard(lp, idx, 'other')).join('')}
      `;
    }

    container.innerHTML = html || `
      <div style="text-align:center;padding:2.5rem 1.5rem;color:var(--text-muted);background:#F8FAFC;border-radius:var(--radius-md);border:1.5px dashed #CBD5E1;">
        <div style="font-size:2rem;margin-bottom:8px;">🎯</div>
        <strong style="font-size:1rem;color:var(--text-main);">कोई लैंडिंग पेज उपलब्ध नहीं है।</strong>
        <p style="font-size:0.82rem;margin-top:4px;">ऊपर दिए गए फॉर्म से अपना नया लैंडिंग पेज बनाएं।</p>
      </div>
    `;
  }

  function shareLandingPageWhatsApp(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;
    if (lp.status === 'pending_review') {
      window.UCAS_APP.showToast('⚠️ यह लैंडिंग पेज अभी एडमिन समीक्षा (Under Review) में है। अप्रूवल के बाद ही शेयर करें।', 'warning');
      return;
    }
    if (lp.status === 'blocked' || lp.status === 'disabled') {
      window.UCAS_APP.showToast('🔴 यह लैंडिंग पेज ब्लॉक/निष्क्रिय है।', 'error');
      return;
    }
    const shareUrl = getLandingPageShareUrl(lp);
    const text = `${lp.message}\n\n👉 यहाँ देखें और छोटा सर्वे भरें:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareLandingPageFacebook(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;
    if (lp.status === 'pending_review') {
      window.UCAS_APP.showToast('⚠️ यह लैंडिंग पेज अभी एडमिन समीक्षा (Under Review) में है। अप्रूवल के बाद ही शेयर करें।', 'warning');
      return;
    }
    if (lp.status === 'blocked' || lp.status === 'disabled') {
      window.UCAS_APP.showToast('🔴 यह लैंडिंग पेज ब्लॉक/निष्क्रिय है।', 'error');
      return;
    }
    const shareUrl = getLandingPageShareUrl(lp);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function shareLandingPageNative(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;
    const shareUrl = getLandingPageShareUrl(lp);
    if (navigator.share) {
      navigator.share({
        title: lp.title,
        text: lp.message,
        url: shareUrl
      }).catch(() => {});
    } else {
      copyLandingPageLink(lpId);
    }
  }

  function copyLandingPageLink(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;
    const shareUrl = getLandingPageShareUrl(lp);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        window.UCAS_APP.showToast('✅ लिंक क्लिपबोर्ड पर कॉपी हो गया!', 'success');
      });
    } else {
      window.UCAS_APP.showToast('लिंक: ' + shareUrl, 'info');
    }
  }

  window.UCAS_LANDING_BUILDER = {
    init: initLandingBuilder,
    setContentType,
    generateLandingPage: handleFormSubmit,
    editLandingPage,
    cancelEdit,
    deleteLandingPage,
    loadMyLandingPages,
    filterMyLandingPages,
    shareLandingPageWhatsApp,
    shareLandingPageFacebook,
    shareLandingPageNative,
    copyLandingPageLink,
    getLandingPageShareUrl
  };

  console.log('✅ UCAS Landing Page Builder Module (with Product Landing & Filter Tabs) Ready.');
})(window);
