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

  let activeContentType = 'image'; // 'image' | 'youtube'
  let uploadedImageData = null;
  let detectedYoutubeId = null;
  let detectedYoutubeThumbnail = null;
  let userLandingPages = [];
  let editingLandingPageId = null; // null for new, string for edit

  function initLandingBuilder() {
    bindBuilderEvents();
    loadMyLandingPages();
  }

  function bindBuilderEvents() {
    // Mode switcher buttons
    const btnImageMode = document.getElementById('lp_btn_mode_image');
    const btnYtMode = document.getElementById('lp_btn_mode_youtube');

    btnImageMode?.addEventListener('click', () => setContentType('image'));
    btnYtMode?.addEventListener('click', () => setContentType('youtube'));

    // Image file upload
    const imageInput = document.getElementById('lp_image_file_input');
    imageInput?.addEventListener('change', handleImageUpload);

    // YouTube URL input
    const ytInput = document.getElementById('lp_youtube_url_input');
    ytInput?.addEventListener('input', (e) => handleYoutubeInput(e.target.value));

    // Form submit / update
    const generateBtn = document.getElementById('lp_btn_generate');
    generateBtn?.addEventListener('click', handleFormSubmit);

    // Cancel edit button
    const cancelBtn = document.getElementById('lp_btn_cancel_edit');
    cancelBtn?.addEventListener('click', cancelEdit);
  }

  function setContentType(type) {
    activeContentType = type;

    const imgSection = document.getElementById('lp_section_image_upload');
    const ytSection = document.getElementById('lp_section_youtube_input');
    const btnImg = document.getElementById('lp_btn_mode_image');
    const btnYt = document.getElementById('lp_btn_mode_youtube');

    if (type === 'image') {
      if (imgSection) imgSection.style.display = 'block';
      if (ytSection) ytSection.style.display = 'none';
      if (btnImg) btnImg.className = 'ucas-btn ucas-btn-sm ucas-btn-primary';
      if (btnYt) btnYt.className = 'ucas-btn ucas-btn-sm ucas-btn-outline';
    } else {
      if (imgSection) imgSection.style.display = 'none';
      if (ytSection) ytSection.style.display = 'block';
      if (btnImg) btnImg.className = 'ucas-btn ucas-btn-sm ucas-btn-outline';
      if (btnYt) btnYt.className = 'ucas-btn ucas-btn-sm ucas-btn-primary';
    }

    updateBuilderPreview();
  }

  // ==========================================
  // IMAGE HANDLER & CLIENT COMPRESSION
  // ==========================================

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.UCAS_APP.showToast('कृपया मान्य इमेज फाइल चुनें।', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to max 900px width/height for fast loading & storage
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 900;

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
        ctx.drawImage(img, 0, 0, width, height);

        uploadedImageData = canvas.toDataURL('image/jpeg', 0.82);
        updateBuilderPreview();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ==========================================
  // YOUTUBE URL PARSER & AUTO-THUMBNAIL
  // ==========================================

  function extractYoutubeVideoId(url) {
    if (!url) return null;
    const str = url.trim();

    // Regex matching: youtu.be/xxx, watch?v=xxx, shorts/xxx, embed/xxx
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = str.match(regExp);

    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    return null;
  }

  function handleYoutubeInput(val) {
    const videoId = extractYoutubeVideoId(val);
    const helperEl = document.getElementById('lp_yt_helper_text');

    if (videoId) {
      detectedYoutubeId = videoId;
      detectedYoutubeThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (helperEl) {
        helperEl.innerHTML = `<span style="color:#15803D;font-weight:600;"><i class="fa-solid fa-circle-check"></i> YouTube Video ID पहचाना गया: <code>${videoId}</code></span>`;
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

  // ==========================================
  // LIVE BUILDER PREVIEW
  // ==========================================

  function updateBuilderPreview() {
    const previewMedia = document.getElementById('lp_preview_media_container');
    if (!previewMedia) return;

    if (activeContentType === 'image') {
      if (uploadedImageData) {
        previewMedia.innerHTML = `
          <img src="${uploadedImageData}" alt="Uploaded Preview" style="width:100%;max-height:220px;object-fit:cover;border-radius:var(--radius-md);border:1px solid #E2E8F0;">
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F1F5F9;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-regular fa-image" style="font-size:2rem;margin-bottom:6px;display:block;"></i>
            <span style="font-size:0.85rem;">इमेज अपलोड करने पर पूर्वावलोकन यहाँ दिखाई देगा</span>
          </div>
        `;
      }
    } else if (activeContentType === 'youtube') {
      if (detectedYoutubeId && detectedYoutubeThumbnail) {
        previewMedia.innerHTML = `
          <div style="position:relative;width:100%;max-height:220px;border-radius:var(--radius-md);overflow:hidden;border:1px solid #E2E8F0;background:#000;">
            <img src="${detectedYoutubeThumbnail}" alt="YouTube Thumbnail" style="width:100%;height:200px;object-fit:cover;opacity:0.9;">
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:54px;height:54px;background:rgba(255,0,0,0.85);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;box-shadow:0 4px 10px rgba(0,0,0,0.3);">
              <i class="fa-solid fa-play" style="margin-left:4px;"></i>
            </div>
          </div>
        `;
      } else {
        previewMedia.innerHTML = `
          <div style="background:#F1F5F9;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:2rem;text-align:center;color:var(--text-muted);">
            <i class="fa-brands fa-youtube" style="font-size:2rem;color:#EF4444;margin-bottom:6px;display:block;"></i>
            <span style="font-size:0.85rem;">YouTube लिंक डालने पर थंबनेल यहाँ दिखाई देगा</span>
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
    const padCount = String(count).padStart(6, '0');
    return `LP${padCount}`;
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

    if (activeContentType === 'youtube' && !detectedYoutubeId) {
      window.UCAS_APP.showToast('कृपया मान्य YouTube वीडियो लिंक दर्ज करें।', 'error');
      return;
    }

    const profileId = window.UCAS_SESSION.getUserId();
    const shareId = window.UCAS_SESSION.getShareId();

    const generateBtn = document.getElementById('lp_btn_generate');
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सेव हो रहा है...';
    }

    try {
      if (editingLandingPageId) {
        // =======================
        // UPDATE EXISTING PAGE
        // =======================
        const lpId = editingLandingPageId;
        const title = titleInput || `${categoryInput.toUpperCase()} Campaign (${lpId})`;

        const updatePayload = {
          id: lpId,
          title: title,
          category: categoryInput,
          content_type: activeContentType,
          media_url: activeContentType === 'image' ? uploadedImageData : `https://www.youtube.com/watch?v=${detectedYoutubeId}`,
          thumbnail_url: activeContentType === 'image' ? uploadedImageData : detectedYoutubeThumbnail,
          message: messageInput
        };

        const res = await window.UCAS_DB.updateLandingPage(lpId, updatePayload, profileId);
        if (res.success) {
          window.UCAS_APP.showToast(`✅ लैंडिंग पेज (${lpId}) सफलतापूर्वक अपडेट हो गया!`, 'success');
          showGeneratedResult({ ...updatePayload, share_id: shareId });
          cancelEdit();
          await loadMyLandingPages();
        } else {
          window.UCAS_APP.showToast('अपडेट करने में त्रुटि: ' + (res.message || ''), 'error');
        }
      } else {
        // =======================
        // CREATE NEW PAGE
        // =======================
        const lpId = generateUniqueLandingPageId();
        const title = titleInput || `${categoryInput.toUpperCase()} Campaign (${lpId})`;

        const payload = {
          id: lpId,
          profile_id: profileId,
          share_id: shareId,
          title: title,
          category: categoryInput,
          content_type: activeContentType,
          media_url: activeContentType === 'image' ? uploadedImageData : `https://www.youtube.com/watch?v=${detectedYoutubeId}`,
          thumbnail_url: activeContentType === 'image' ? uploadedImageData : detectedYoutubeThumbnail,
          message: messageInput,
          created_at: new Date().toISOString()
        };

        const res = await window.UCAS_DB.createLandingPage(payload);
        if (res.success) {
          window.UCAS_APP.showToast(`🎉 लैंडिंग पेज (${lpId}) सफलतापूर्वक बन गया!`, 'success');
          showGeneratedResult(payload);
          resetBuilderForm();
          await loadMyLandingPages();
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

    editingLandingPageId = lp.id;

    // Populate Fields
    const titleInput = document.getElementById('lp_input_title');
    const messageInput = document.getElementById('lp_input_message');
    const categorySelect = document.getElementById('lp_select_category');
    const ytInput = document.getElementById('lp_youtube_url_input');

    if (titleInput) titleInput.value = lp.title || '';
    if (messageInput) messageInput.value = lp.message || '';
    if (categorySelect) categorySelect.value = lp.category || 'agriculture';

    // Set Media Content
    if (lp.content_type === 'youtube') {
      setContentType('youtube');
      if (ytInput) ytInput.value = lp.media_url || '';
      handleYoutubeInput(lp.media_url || '');
    } else {
      setContentType('image');
      uploadedImageData = lp.media_url || lp.thumbnail_url;
      updateBuilderPreview();
    }

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
      } else {
        window.UCAS_APP.showToast('हटाने में त्रुटि: ' + (res.message || ''), 'error');
      }
    } catch (e) {
      console.error('Delete landing page error', e);
      window.UCAS_APP.showToast('त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
    }
  }

  function getLandingPageShareUrl(lp) {
    const origin = window.location.origin || 'https://aarogyamindia.in';
    const url = new URL('/ucas/landing.html', origin);
    url.searchParams.set('id', lp.id);
    url.searchParams.set('share_id', lp.share_id || window.UCAS_SESSION.getShareId());
    url.searchParams.set('src', 'ucas_lp_builder');
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

    // Attach actions
    const btnCopy = document.getElementById('lp_btn_copy_url');
    const btnWa = document.getElementById('lp_btn_wa_share');
    const btnNative = document.getElementById('lp_btn_native_share');
    const btnView = document.getElementById('lp_btn_view_page');

    if (btnCopy) {
      btnCopy.onclick = () => {
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
        const text = `${lp.message}\n\n👉 यहाँ देखें और छोटा सर्वे भरें:\n${shareUrl}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
      };
    }

    if (btnNative) {
      btnNative.onclick = () => {
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

    if (titleInput) titleInput.value = '';
    if (messageInput) messageInput.value = '';
    if (imgInput) imgInput.value = '';
    if (ytInput) ytInput.value = '';

    uploadedImageData = null;
    detectedYoutubeId = null;
    detectedYoutubeThumbnail = null;

    updateBuilderPreview();
  }

  // ==========================================
  // MY LANDING PAGES TABLE & STATS
  // ==========================================

  async function loadMyLandingPages() {
    const profileId = window.UCAS_SESSION.getUserId();
    if (!profileId) return;

    try {
      const res = await window.UCAS_DB.getLandingPages(profileId);
      userLandingPages = res.data || [];
      renderMyLandingPagesTable(userLandingPages);
    } catch (e) {
      console.error('Load landing pages error', e);
    }
  }

  function renderMyLandingPagesTable(pages) {
    const tbody = document.getElementById('ucas-my-landing-pages-tbody');
    const countEl = document.getElementById('ucas-my-landing-pages-count');
    if (countEl) countEl.textContent = pages.length;
    if (!tbody) return;

    if (pages.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">
            🎯 आपने अभी तक कोई लैंडिंग पेज नहीं बनाया है। ऊपर दिए गए फॉर्म से अपना पहला पेज बनाएं।
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pages.map((lp, idx) => {
      const dateStr = lp.created_at ? new Date(lp.created_at).toLocaleDateString('hi-IN') : '-';
      const shareUrl = getLandingPageShareUrl(lp);
      const responsesCount = lp.response_count || 0;

      const mediaBadge = lp.content_type === 'youtube'
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-brands fa-youtube"></i> YouTube</span>'
        : '<span style="background:#E0F2FE;color:#0284C7;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-regular fa-image"></i> Image</span>';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${lp.title}</div>
            <div style="font-size:0.75rem;color:var(--primary-dark);font-weight:600;">ID: <code>${lp.id}</code></div>
          </td>
          <td>
            <span style="font-size:0.78rem;background:var(--primary-subtle);color:var(--primary-dark);padding:2px 8px;border-radius:4px;font-weight:600;">
              ${lp.category.toUpperCase()}
            </span>
            <div style="margin-top:2px;">${mediaBadge}</div>
          </td>
          <td>
            <span style="font-weight:800;font-size:0.95rem;color:#15803D;background:#DCFCE7;padding:3px 10px;border-radius:var(--radius-full);display:inline-flex;align-items:center;gap:4px;">
              <i class="fa-solid fa-clipboard-check"></i> ${responsesCount} Surveys
            </span>
          </td>
          <td>${dateStr}</td>
          <td>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LANDING_BUILDER.editLandingPage('${lp.id}')" title="संपादित करें (Edit)" style="color:var(--secondary-dark);border-color:var(--secondary);">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_LANDING_BUILDER.shareLandingPageWhatsApp('${lp.id}')" title="WhatsApp Share">
                <i class="fa-brands fa-whatsapp"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LANDING_BUILDER.copyLandingPageLink('${lp.id}')" title="Copy Link">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="window.open('${shareUrl}', '_blank')" title="View Public Page">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> देखें
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LANDING_BUILDER.deleteLandingPage('${lp.id}')" title="हटाएं (Delete)" style="color:var(--danger);border-color:rgba(220,38,38,0.3);">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function shareLandingPageWhatsApp(lpId) {
    const lp = userLandingPages.find(item => item.id === lpId);
    if (!lp) return;
    const shareUrl = getLandingPageShareUrl(lp);
    const text = `${lp.message}\n\n👉 यहाँ देखें और छोटा सर्वे भरें:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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
    shareLandingPageWhatsApp,
    copyLandingPageLink,
    getLandingPageShareUrl
  };

  console.log('✅ UCAS Landing Page Builder Module (with Edit & Delete CRUD) Ready.');
})(window);
