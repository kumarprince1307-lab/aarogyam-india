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

    // Category change listener (for dynamic Webinar & Zoom fields)
    const categorySelect = document.getElementById('lp_select_category');
    categorySelect?.addEventListener('change', handleCategoryChange);
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

    // Webinar / Zoom Data Extraction
    let webinarData = null;
    if (categoryInput === 'webinar') {
      const zoomLink = (document.getElementById('lp_webinar_zoom_link')?.value || '').trim();
      const meetingId = (document.getElementById('lp_webinar_meeting_id')?.value || '').trim();
      const passcode = (document.getElementById('lp_webinar_passcode')?.value || '').trim();
      const datetime = (document.getElementById('lp_webinar_datetime')?.value || '').trim();
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
        success_msg: successMsg
      };
    }

    // ==========================================
    // USER ACTIVE STATUS & REVIEW GOVERNANCE
    // ==========================================
    const sub = await window.UCAS_DB.getUserSubscription(profileId);
    const isUserActive = Boolean(sub?.isActive);
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
          message: messageInput,
          webinar_data: webinarData
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
          webinar_data: webinarData,
          status: initialStatus,
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
                title: `📄 नया लैंडिंग पेज बनाया गया: ${title}`,
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
      if (successMsgInput) successMsgInput.value = webData.success_msg || '';
      if (webinarBox) webinarBox.style.display = 'block';
    } else {
      if (webinarBox) webinarBox.style.display = 'none';
    }

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

    if (lp.title) {
      url.searchParams.set('title', lp.title);
    }

    let thumbUrl = lp.thumbnail_url;
    if (lp.content_type === 'youtube') {
      const ytId = extractYoutubeId(lp.media_url);
      if (ytId) {
        thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    } else if (lp.media_url && !lp.media_url.startsWith('data:')) {
      thumbUrl = lp.media_url;
    }

    if (thumbUrl && !thumbUrl.startsWith('data:')) {
      url.searchParams.set('thumb', thumbUrl);
    }

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
      const isPending = lp.status === 'pending_review';
      const isBlocked = lp.status === 'blocked' || lp.status === 'disabled';

      const mediaBadge = lp.content_type === 'youtube'
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-brands fa-youtube"></i> YouTube</span>'
        : '<span style="background:#E0F2FE;color:#0284C7;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:700;"><i class="fa-regular fa-image"></i> Image</span>';

      const statusBadge = isPending
        ? '<span style="background:#FEF3C7;color:#D97706;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-hourglass-half"></i> Under Review</span>'
        : isBlocked
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-ban"></i> Blocked</span>'
        : '<span style="background:#DCFCE7;color:#15803D;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-circle-check"></i> Live</span>';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${lp.title}</div>
            <div style="font-size:0.75rem;color:var(--primary-dark);font-weight:600;">ID: <code>${lp.id}</code> • ${statusBadge}</div>
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
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_LANDING_BUILDER.shareLandingPageWhatsApp('${lp.id}')" title="${isPending ? 'अंडर रिव्यू' : 'WhatsApp Share'}" ${isPending || isBlocked ? 'style="opacity:0.6;"' : ''}>
                <i class="fa-brands fa-whatsapp"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LANDING_BUILDER.shareLandingPageFacebook('${lp.id}')" title="${isPending ? 'अंडर रिव्यू' : 'Facebook Share'}" style="color:#1877F2;border-color:#1877F2;${isPending || isBlocked ? 'opacity:0.6;' : ''}">
                <i class="fa-brands fa-facebook"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_LANDING_BUILDER.copyLandingPageLink('${lp.id}')" title="Copy Link">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="window.open('${shareUrl}', '_blank')" title="View Public Page">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
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
    shareLandingPageFacebook,
    copyLandingPageLink,
    getLandingPageShareUrl
  };

  console.log('✅ UCAS Landing Page Builder Module (with Edit & Delete CRUD) Ready.');
})(window);
