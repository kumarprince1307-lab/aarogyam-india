/**
 * UCAS Webinars & Live Events Module
 * Handles User's Webinar Landing Pages, Lead Capture, and Attendee Management
 */

(function () {
  'use strict';

  let userWebinarsList = [];
  let editingWebinarId = null;
  let activeWebinarContentType = 'image';
  let uploadedWebinarImageData = null;
  let detectedWebinarYtId = null;

  function initWebinars() {
    bindWebinarEvents();
  }

  function bindWebinarEvents() {
    // Mode switcher buttons
    const btnImage = document.getElementById('wb_btn_mode_image');
    const btnYt = document.getElementById('wb_btn_mode_youtube');

    btnImage?.addEventListener('click', () => setWebinarContentType('image'));
    btnYt?.addEventListener('click', () => setWebinarContentType('youtube'));

    // Image Upload
    const imgInput = document.getElementById('wb_image_file_input');
    imgInput?.addEventListener('change', handleWebinarImageUpload);

    // YouTube Input (multi-event listener)
    const ytInput = document.getElementById('wb_youtube_url_input');
    if (ytInput) {
      ['input', 'paste', 'change', 'blur'].forEach(evtType => {
        ytInput.addEventListener(evtType, (e) => {
          setTimeout(() => handleWebinarYoutubeInput(ytInput.value), 20);
        });
      });
    }

    // Submit / Generate Button
    const btnSubmit = document.getElementById('wb_btn_generate');
    btnSubmit?.addEventListener('click', handleWebinarSubmit);

    // Cancel Edit Button
    const btnCancel = document.getElementById('wb_btn_cancel_edit');
    btnCancel?.addEventListener('click', cancelWebinarEdit);

    // Close Modal Button
    document.querySelectorAll('.ucas-modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ucas-modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });
  }

  function setWebinarContentType(type) {
    activeWebinarContentType = type;
    const imgSec = document.getElementById('wb_section_image_upload');
    const ytSec = document.getElementById('wb_section_youtube_input');
    const btnImg = document.getElementById('wb_btn_mode_image');
    const btnYt = document.getElementById('wb_btn_mode_youtube');

    if (type === 'image') {
      if (imgSec) imgSec.style.display = 'block';
      if (ytSec) ytSec.style.display = 'none';
      if (btnImg) btnImg.className = 'ucas-btn ucas-btn-sm ucas-btn-primary';
      if (btnYt) btnYt.className = 'ucas-btn ucas-btn-sm ucas-btn-outline';
    } else {
      if (imgSec) imgSec.style.display = 'none';
      if (ytSec) ytSec.style.display = 'block';
      if (btnImg) btnImg.className = 'ucas-btn ucas-btn-sm ucas-btn-outline';
      if (btnYt) btnYt.className = 'ucas-btn ucas-btn-sm ucas-btn-primary';
    }
  }

  function handleWebinarImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxD = 1920;
        if (w > maxD || h > maxD) {
          if (w > h) { h = Math.round((h * maxD) / w); w = maxD; }
          else { w = Math.round((w * maxD) / h); h = maxD; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: file.type === 'image/png' });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;
        uploadedWebinarImageData = canvas.toDataURL(mimeType, quality);
        updateWebinarPreview();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }

  function extractYoutubeVideoId(url) {
    if (!url) return null;
    const str = String(url).trim();
    if (!str) return null;

    // 1. Direct 11 character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }

    // 2. Direct thumbnail URL pasted
    const thumbMatch = str.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
    if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) {
      return thumbMatch[1];
    }

    // 3. Comprehensive URL patterns: watch?v=, youtu.be/, shorts/, live/, embed/, v/, m.youtube.com
    const patterns = [
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
      /[?&]v=([a-zA-Z0-9_-]{11})/i,
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    ];

    for (const pattern of patterns) {
      const match = str.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }

    // 4. Fallback: search for 11 character sequence
    const genericMatch = str.match(/(?:[\/=])([a-zA-Z0-9_-]{11})(?:[?&#/]|$)/);
    if (genericMatch && genericMatch[1] && genericMatch[1].length === 11) {
      return genericMatch[1];
    }

    return null;
  }

  function handleWebinarYoutubeInput(url) {
    const videoId = extractYoutubeVideoId(url);
    detectedWebinarYtId = videoId;
    updateWebinarPreview();
  }

  function updateWebinarPreview() {
    const container = document.getElementById('wb_preview_media_container');
    if (!container) return;

    if (activeWebinarContentType === 'image' && uploadedWebinarImageData) {
      container.innerHTML = `
        <div style="position:relative;border-radius:var(--radius-md);overflow:hidden;background:#0f172a;border:1.5px solid #CBD5E1;text-align:center;">
          <img src="${uploadedWebinarImageData}" style="width:100%;max-height:220px;object-fit:contain;display:block;margin:0 auto;image-rendering:-webkit-optimize-contrast;" alt="Webinar Banner">
        </div>
      `;
    } else if (activeWebinarContentType === 'youtube' && detectedWebinarYtId) {
      const primaryThumb = `https://i.ytimg.com/vi/${detectedWebinarYtId}/hqdefault.jpg`;
      const altThumb = `https://img.youtube.com/vi/${detectedWebinarYtId}/hqdefault.jpg`;
      const mqThumb = `https://i.ytimg.com/vi/${detectedWebinarYtId}/mqdefault.jpg`;

      container.innerHTML = `
        <div style="position:relative;border-radius:var(--radius-md);overflow:hidden;background:#000;border:1.5px solid #CBD5E1;">
          <img src="${primaryThumb}" onerror="this.onerror=null;this.src='${altThumb}';this.onerror=function(){this.src='${mqThumb}';};" style="width:100%;max-height:180px;object-fit:cover;display:block;opacity:0.9;" alt="YouTube Preview">
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.6rem;background:rgba(255,0,0,0.9);border-radius:50%;width:52px;height:52px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(0,0,0,0.4);border:2px solid #fff;">
            <i class="fa-solid fa-play" style="margin-left:4px;"></i>
          </div>
          <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.8);color:#fff;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:4px;">
            <i class="fa-brands fa-youtube" style="color:#FF0000;"></i> YouTube
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="background:#F8FAFC;border:2px dashed #CBD5E1;border-radius:var(--radius-md);padding:1.5rem;text-align:center;color:var(--text-muted);">
          <i class="fa-solid fa-video" style="font-size:2.2rem;margin-bottom:6px;display:block;color:#2563EB;"></i>
          <span style="font-size:0.85rem;font-weight:600;">बैनर इमेज या YouTube लिंक का पूर्वावलोकन यहाँ दिखेगा</span>
        </div>
      `;
    }
  }

  async function handleWebinarSubmit() {
    const title = (document.getElementById('wb_input_title')?.value || '').trim();
    const message = (document.getElementById('wb_input_message')?.value || '').trim();
    const datetime = (document.getElementById('wb_input_datetime')?.value || '').trim();
    const zoomLink = (document.getElementById('wb_input_zoom_link')?.value || '').trim();
    const meetingId = (document.getElementById('wb_input_meeting_id')?.value || '').trim();
    const passcode = (document.getElementById('wb_input_passcode')?.value || '').trim();
    const successMsg = (document.getElementById('wb_input_success_msg')?.value || '').trim();

    if (!title) {
      window.UCAS_APP.showToast('कृपया वेबिनार का शीर्षक (Title/Heading) दर्ज करें।', 'error');
      return;
    }

    if (!message) {
      window.UCAS_APP.showToast('कृपया वेबिनार का विवरण/संदेश (Message) दर्ज करें।', 'error');
      return;
    }

    if (!zoomLink && !meetingId) {
      window.UCAS_APP.showToast('कृपया Zoom Join Link या Meeting ID अवश्य दर्ज करें।', 'error');
      return;
    }

    if (activeWebinarContentType === 'youtube') {
      const ytRaw = (document.getElementById('wb_youtube_url_input')?.value || '').trim();
      const videoId = extractYoutubeVideoId(ytRaw) || detectedWebinarYtId;
      if (!videoId) {
        window.UCAS_APP.showToast('कृपया मान्य YouTube वीडियो लिंक दर्ज करें।', 'error');
        return;
      }
      detectedWebinarYtId = videoId;
    }

    const profileId = window.UCAS_SESSION.getUserId();
    const shareId = window.UCAS_SESSION.getShareId();

    // Check user active status
    let isUserActive = true;
    try {
      if (profileId && window.UCAS_DB && typeof window.UCAS_DB.getUserSubscription === 'function') {
        const sub = await window.UCAS_DB.getUserSubscription(profileId);
        isUserActive = Boolean(sub?.isActive);
      }
    } catch (subErr) {
      console.warn('Subscription check error:', subErr);
    }
    const initialStatus = isUserActive ? 'active' : 'pending_review';

    const btnSubmit = document.getElementById('wb_btn_generate');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> सेव हो रहा है...';
    }

    const webinarData = {
      zoom_link: zoomLink,
      meeting_id: meetingId,
      passcode: passcode,
      datetime: datetime,
      success_msg: successMsg
    };

    try {
      if (editingWebinarId) {
        // UPDATE
        const lpId = editingWebinarId;
        const updatePayload = {
          id: lpId,
          title: title,
          category: 'webinar',
          content_type: activeWebinarContentType,
          media_url: activeWebinarContentType === 'image' ? (uploadedWebinarImageData || '') : `https://www.youtube.com/watch?v=${detectedWebinarYtId}`,
          thumbnail_url: activeWebinarContentType === 'image' ? (uploadedWebinarImageData || '') : (detectedWebinarYtId ? `https://img.youtube.com/vi/${detectedWebinarYtId}/hqdefault.jpg` : ''),
          message: message,
          webinar_data: webinarData
        };

        const res = await window.UCAS_DB.updateLandingPage(lpId, updatePayload, profileId);
        if (res.success) {
          window.UCAS_APP.showToast(`✅ वेबिनार (${lpId}) सफलतापूर्वक अपडेट हुआ!`, 'success');
          cancelWebinarEdit();
          await loadWebinars();
          if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
            await window.UCAS_MARKETING.refreshLandingPages();
          }
        } else {
          window.UCAS_APP.showToast('अपडेट त्रुटि: ' + (res.message || ''), 'error');
        }
      } else {
        // CREATE with unique collision-free ID
        const count = userWebinarsList.length + 1;
        const padCount = String(count).padStart(4, '0');
        const randSuffix = Math.floor(100 + Math.random() * 900);
        const lpId = `WB${padCount}${randSuffix}`;

        const payload = {
          id: lpId,
          profile_id: profileId,
          share_id: shareId,
          title: title,
          category: 'webinar',
          content_type: activeWebinarContentType,
          media_url: activeWebinarContentType === 'image' ? (uploadedWebinarImageData || '') : `https://www.youtube.com/watch?v=${detectedWebinarYtId}`,
          thumbnail_url: activeWebinarContentType === 'image' ? (uploadedWebinarImageData || '') : (detectedWebinarYtId ? `https://img.youtube.com/vi/${detectedWebinarYtId}/hqdefault.jpg` : ''),
          message: message,
          webinar_data: webinarData,
          status: initialStatus,
          created_at: new Date().toISOString()
        };

        const res = await window.UCAS_DB.createLandingPage(payload);
        if (res.success) {
          // Trigger Admin Notification silently
          try {
            const db = window.UCAS_DB.getDb();
            if (db && profileId) {
              const userName = window.UCAS_SESSION.getUserName() || 'User';
              await db.from('notifications').insert([{
                profile_id: profileId,
                type: 'webinar_created',
                title: `🎥 नया वेबिनार पेज बनाया गया: ${title}`,
                message: `${userName} (${shareId} - ${isUserActive ? '🟢 Active User' : '🔴 Inactive User'}) ने नया वेबिनार बनाया। ${isUserActive ? 'स्वतः लाइव हुआ।' : 'समीक्षा (Review) करें।'}`,
                link: '#landing-page-control',
                created_at: new Date().toISOString()
              }]);
            }
          } catch (notifErr) {
            console.warn('Admin notification notice:', notifErr);
          }

          if (isUserActive) {
            window.UCAS_APP.showToast(`🎉 वेबिनार लैंडिंग पेज (${lpId}) लाइव हो गया!`, 'success');
          } else {
            window.UCAS_APP.showToast(`⏳ वेबिनार (${lpId}) समीक्षा के लिए सबमिट हुआ। एडमिन अप्रूवल के बाद शेयर होगा।`, 'info');
          }

          showGeneratedWebinarResult(payload);
          resetWebinarForm();
          await loadWebinars();
          if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
            await window.UCAS_MARKETING.refreshLandingPages();
          }
        } else {
          window.UCAS_APP.showToast('बनाने में त्रुटि: ' + (res.message || ''), 'error');
        }
      }
    } catch (e) {
      console.error('UCAS Webinar submit error:', e);
      window.UCAS_APP.showToast('डेटा सेव करने में समस्या आई। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = editingWebinarId
          ? '<i class="fa-solid fa-floppy-disk"></i> 💾 Update Webinar (अपडेट करें)'
          : '<i class="fa-solid fa-wand-magic-sparkles"></i> 🔗 Generate Webinar Page';
      }
    }
  }

  function showGeneratedWebinarResult(lp) {
    const resultCard = document.getElementById('wb_generated_result_card');
    const linkInput = document.getElementById('wb_generated_share_url');
    if (!resultCard || !linkInput) return;

    const shareUrl = getWebinarShareUrl(lp);
    linkInput.value = shareUrl;

    const isPending = lp.status === 'pending_review';
    const isBlocked = lp.status === 'blocked' || lp.status === 'disabled';

    let reviewNotice = document.getElementById('wb_result_review_notice');
    if (!reviewNotice) {
      reviewNotice = document.createElement('div');
      reviewNotice.id = 'wb_result_review_notice';
      resultCard.insertBefore(reviewNotice, resultCard.firstChild);
    }

    if (isPending) {
      reviewNotice.style.display = 'block';
      reviewNotice.innerHTML = `
        <div style="background:#FEF3C7;border:1.5px solid #F59E0B;border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:#B45309;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-hourglass-half" style="font-size:1.2rem;"></i>
          <span>⏳ आपका वेबिनार पेज एडमिन समीक्षा (Under Review) में है। एडमिन द्वारा स्वीकृत होने के बाद ही यह लाइव होगा और शेयर किया जा सकेगा।</span>
        </div>
      `;
    } else if (isBlocked) {
      reviewNotice.style.display = 'block';
      reviewNotice.innerHTML = `
        <div style="background:#FEE2E2;border:1.5px solid #EF4444;border-radius:var(--radius-sm);padding:10px 12px;margin-bottom:12px;font-size:0.85rem;color:#B91C1C;font-weight:700;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-ban" style="font-size:1.2rem;"></i>
          <span>🔴 यह वेबिनार पेज एडमिन द्वारा ब्लॉक/निष्क्रिय किया गया है।</span>
        </div>
      `;
    } else {
      reviewNotice.style.display = 'none';
    }

    document.getElementById('wb_btn_copy_url')?.addEventListener('click', () => {
      if (isPending) {
        window.UCAS_APP.showToast('⚠️ वेबिनार समीक्षा में है। एडमिन अप्रूवल के बाद लिंक शेयर करें।', 'warning');
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          window.UCAS_APP.showToast('✅ वेबिनार लिंक कॉपी हो गया!', 'success');
        });
      }
    });

    document.getElementById('wb_btn_wa_share')?.addEventListener('click', () => {
      if (isPending) {
        window.UCAS_APP.showToast('⚠️ यह वेबिनार पेज अभी समीक्षा में है। अप्रूवल के बाद WhatsApp पर शेयर कर सकेंगे।', 'warning');
        return;
      }
      if (isBlocked) {
        window.UCAS_APP.showToast('🔴 यह वेबिनार ब्लॉक है।', 'error');
        return;
      }
      const text = `🎥 *${lp.title}*\n\n${lp.message}\n\n👉 अपनी सीट बुक करें (नाम व मोबाइल भरने के तुरंत बाद Zoom लिंक मिल जाएगा):\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    });

    document.getElementById('wb_btn_fb_share')?.addEventListener('click', () => {
      if (isPending) {
        window.UCAS_APP.showToast('⚠️ यह वेबिनार पेज अभी समीक्षा में है। अप्रूवल के बाद Facebook पर शेयर कर सकेंगे।', 'warning');
        return;
      }
      if (isBlocked) {
        window.UCAS_APP.showToast('🔴 यह वेबिनार ब्लॉक है।', 'error');
        return;
      }
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    document.getElementById('wb_btn_view_page')?.addEventListener('click', () => {
      window.open(shareUrl, '_blank');
    });

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth' });
  }

  function getWebinarShareUrl(lp) {
    const origin = window.location.origin || 'https://aarogyamindia.in';
    const url = new URL('/ucas/landing.html', origin);
    url.searchParams.set('id', lp.id);
    url.searchParams.set('share_id', lp.share_id || window.UCAS_SESSION.getShareId());
    url.searchParams.set('cat', 'webinar');

    let thumbUrl = lp.thumbnail_url;
    let ytId = extractYoutubeVideoId(lp.media_url) || extractYoutubeVideoId(lp.thumbnail_url);
    if (ytId) {
      thumbUrl = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      url.searchParams.set('yt', ytId);
    } else if (lp.media_url && !lp.media_url.startsWith('data:')) {
      thumbUrl = lp.media_url;
    }

    if (thumbUrl && !thumbUrl.startsWith('data:')) {
      url.searchParams.set('thumb', thumbUrl);
    }

    if (lp.message) {
      url.searchParams.set('desc', lp.message.slice(0, 160));
    }

    url.searchParams.set('src', 'ucas_webinar');
    return url.toString();
  }

  function resetWebinarForm() {
    const titleInput = document.getElementById('wb_input_title');
    const messageInput = document.getElementById('wb_input_message');
    const dtInput = document.getElementById('wb_input_datetime');
    const zoomInput = document.getElementById('wb_input_zoom_link');
    const meetingInput = document.getElementById('wb_input_meeting_id');
    const passInput = document.getElementById('wb_input_passcode');
    const successInput = document.getElementById('wb_input_success_msg');
    const imgInput = document.getElementById('wb_image_file_input');
    const ytInput = document.getElementById('wb_youtube_url_input');

    if (titleInput) titleInput.value = '';
    if (messageInput) messageInput.value = '';
    if (dtInput) dtInput.value = '';
    if (zoomInput) zoomInput.value = '';
    if (meetingInput) meetingInput.value = '';
    if (passInput) passInput.value = '';
    if (successInput) successInput.value = '';
    if (imgInput) imgInput.value = '';
    if (ytInput) ytInput.value = '';

    uploadedWebinarImageData = null;
    detectedWebinarYtId = null;
    updateWebinarPreview();
  }

  function editWebinar(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;

    editingWebinarId = wb.id;
    const wData = wb.webinar_data || {};

    const titleInput = document.getElementById('wb_input_title');
    const messageInput = document.getElementById('wb_input_message');
    const dtInput = document.getElementById('wb_input_datetime');
    const zoomInput = document.getElementById('wb_input_zoom_link');
    const meetingInput = document.getElementById('wb_input_meeting_id');
    const passInput = document.getElementById('wb_input_passcode');
    const successInput = document.getElementById('wb_input_success_msg');

    if (titleInput) titleInput.value = wb.title || '';
    if (messageInput) messageInput.value = wb.message || '';
    if (dtInput) dtInput.value = wData.datetime || '';
    if (zoomInput) zoomInput.value = wData.zoom_link || '';
    if (meetingInput) meetingInput.value = wData.meeting_id || '';
    if (passInput) passInput.value = wData.passcode || '';
    if (successInput) successInput.value = wData.success_msg || '';

    if (wb.content_type === 'youtube') {
      setWebinarContentType('youtube');
      const ytInput = document.getElementById('wb_youtube_url_input');
      if (ytInput) ytInput.value = wb.media_url || '';
      handleWebinarYoutubeInput(wb.media_url || '');
    } else {
      setWebinarContentType('image');
      uploadedWebinarImageData = wb.media_url || wb.thumbnail_url;
      updateWebinarPreview();
    }

    const btnSubmit = document.getElementById('wb_btn_generate');
    const btnCancel = document.getElementById('wb_btn_cancel_edit');
    if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 💾 Update Webinar (अपडेट करें)';
    if (btnCancel) btnCancel.style.display = 'inline-flex';

    document.getElementById('wb_creator_card')?.scrollIntoView({ behavior: 'smooth' });
    window.UCAS_APP.showToast(`✏️ संपादन मोड: ${wb.id}`, 'info');
  }

  function cancelWebinarEdit() {
    editingWebinarId = null;
    resetWebinarForm();
    const btnSubmit = document.getElementById('wb_btn_generate');
    const btnCancel = document.getElementById('wb_btn_cancel_edit');
    if (btnSubmit) btnSubmit.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> 🔗 Generate Webinar Page';
    if (btnCancel) btnCancel.style.display = 'none';
  }

  async function loadWebinars() {
    const profileId = window.UCAS_SESSION.getUserId();
    if (!profileId) return;

    try {
      const res = await window.UCAS_DB.getLandingPages(profileId);
      const allPages = res.data || [];
      userWebinarsList = allPages.filter(p => p.category === 'webinar' || Boolean(p.webinar_data));

      // Also get surveys / leads
      const surveyRes = await window.UCAS_DB.getSurveys(profileId);
      const surveys = surveyRes.data || [];

      // Update KPI Cards in Webinars Tab
      const kpiTotal = document.getElementById('ucas-wb-kpi-total');
      const kpiAttendees = document.getElementById('ucas-wb-kpi-attendees');
      const kpiActive = document.getElementById('ucas-wb-kpi-active');

      if (kpiTotal) kpiTotal.textContent = userWebinarsList.length;
      
      const webinarLeads = surveys.filter(s => {
        const cat = String(s.selected_categories || '');
        const src = s.category_answers?.source || '';
        return cat.includes('webinar') || src.includes('webinar');
      });
      if (kpiAttendees) kpiAttendees.textContent = webinarLeads.length;

      const activeZoomCount = userWebinarsList.filter(w => w.webinar_data?.zoom_link).length;
      if (kpiActive) kpiActive.textContent = activeZoomCount;

      renderWebinarsTable(userWebinarsList, surveys);
    } catch (e) {
      console.error('Load webinars error', e);
    }
  }

  function renderWebinarsTable(webinars, allSurveys) {
    const tbody = document.getElementById('ucas-my-webinars-tbody');
    const countEl = document.getElementById('ucas-my-webinars-count');
    if (countEl) countEl.textContent = webinars.length;
    if (!tbody) return;

    if (webinars.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">
            🎥 आपने अभी तक कोई वेबिनार पेज नहीं बनाया है। ऊपर दिए गए फॉर्म से अपना पहला वेबिनार बनाएं।
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = webinars.map((wb, idx) => {
      const dateStr = wb.created_at ? new Date(wb.created_at).toLocaleDateString('hi-IN') : '-';
      const wData = wb.webinar_data || {};
      const shareUrl = getWebinarShareUrl(wb);
      
      const attendees = allSurveys.filter(s => s.category_answers?.landing_page_id === wb.id);
      const attendeesCount = attendees.length;

      const isPending = wb.status === 'pending_review';
      const isBlocked = wb.status === 'blocked' || wb.status === 'disabled';

      const statusBadge = isPending
        ? '<span style="background:#FEF3C7;color:#D97706;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-hourglass-half"></i> Under Review</span>'
        : isBlocked
        ? '<span style="background:#FEE2E2;color:#DC2626;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-ban"></i> Blocked</span>'
        : '<span style="background:#DCFCE7;color:#15803D;padding:2px 6px;border-radius:4px;font-size:0.72rem;font-weight:800;"><i class="fa-solid fa-circle-check"></i> Live</span>';

      return `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>
            <div style="font-weight:700;color:var(--text-main);">${wb.title}</div>
            <div style="font-size:0.75rem;color:var(--primary-dark);font-weight:600;">ID: <code>${wb.id}</code> • ${statusBadge}</div>
          </td>
          <td>
            <span style="font-size:0.8rem;background:#EFF6FF;color:#1E40AF;padding:3px 8px;border-radius:4px;font-weight:700;">
              📅 ${wData.datetime || 'लाइव सत्र'}
            </span>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px;">
              ${wData.meeting_id ? `ID: <code>${wData.meeting_id}</code>` : ''}
              ${wData.passcode ? `• Pass: <strong>${wData.passcode}</strong>` : ''}
            </div>
          </td>
          <td>
            <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_WEBINARS.viewAttendees('${wb.id}')" style="background:#DCFCE7;color:#15803D;border-color:#86EFAC;font-weight:800;border-radius:var(--radius-full);">
              <i class="fa-solid fa-users"></i> ${attendeesCount} Attendees
            </button>
          </td>
          <td>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_WEBINARS.editWebinar('${wb.id}')" title="संपादित करें (Edit)" style="color:var(--secondary-dark);border-color:var(--secondary);">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" onclick="UCAS_WEBINARS.shareWhatsApp('${wb.id}')" title="${isPending ? 'अंडर रिव्यू' : 'WhatsApp Share'}" ${isPending || isBlocked ? 'style="opacity:0.6;"' : ''}>
                <i class="fa-brands fa-whatsapp"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_WEBINARS.shareFacebook('${wb.id}')" title="${isPending ? 'अंडर रिव्यू' : 'Facebook Share'}" style="color:#1877F2;border-color:#1877F2;${isPending || isBlocked ? 'opacity:0.6;' : ''}">
                <i class="fa-brands fa-facebook"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_WEBINARS.copyLink('${wb.id}')" title="Copy Link">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-primary" onclick="window.open('${shareUrl}', '_blank')" title="View Public Page">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </button>
              <button class="ucas-btn ucas-btn-sm ucas-btn-outline" onclick="UCAS_WEBINARS.deleteWebinar('${wb.id}')" title="हटाएं (Delete)" style="color:var(--danger);border-color:rgba(220,38,38,0.3);">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function shareWhatsApp(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;
    if (wb.status === 'pending_review') {
      window.UCAS_APP.showToast('⚠️ यह वेबिनार पेज अभी एडमिन समीक्षा (Under Review) में है। अप्रूवल के बाद ही शेयर करें।', 'warning');
      return;
    }
    if (wb.status === 'blocked' || wb.status === 'disabled') {
      window.UCAS_APP.showToast('🔴 यह वेबिनार पेज ब्लॉक/निष्क्रिय है।', 'error');
      return;
    }
    const shareUrl = getWebinarShareUrl(wb);
    const text = `🎥 *${wb.title}*\n\n${wb.message}\n\n👉 अपनी सीट बुक करें (नाम व मोबाइल भरने के तुरंत बाद Zoom लिंक मिल जाएगा):\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareFacebook(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;
    if (wb.status === 'pending_review') {
      window.UCAS_APP.showToast('⚠️ यह वेबिनार पेज अभी एडमिन समीक्षा (Under Review) में है। अप्रूवल के बाद ही शेयर करें।', 'warning');
      return;
    }
    if (wb.status === 'blocked' || wb.status === 'disabled') {
      window.UCAS_APP.showToast('🔴 यह वेबिनार पेज ब्लॉक/निष्क्रिय है।', 'error');
      return;
    }
    const shareUrl = getWebinarShareUrl(wb);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  async function viewAttendees(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;

    const modal = document.getElementById('ucas-modal-webinar-attendees');
    const modalTitle = document.getElementById('ucas-wb-attendees-modal-title');
    const modalBody = document.getElementById('ucas-wb-attendees-modal-body');
    if (!modal || !modalBody) return;

    if (modalTitle) modalTitle.textContent = `${wb.title} — Attendees`;
    modalBody.innerHTML = '<div style="text-align:center;padding:1.5rem;"><i class="fa-solid fa-spinner fa-spin"></i> लोड हो रहा है...</div>';
    modal.classList.add('active');

    try {
      const profileId = window.UCAS_SESSION.getUserId();
      const res = await window.UCAS_DB.getSurveys(profileId);
      const surveys = res.data || [];
      const attendees = surveys.filter(s => s.category_answers?.landing_page_id === wb.id);

      if (attendees.length === 0) {
        modalBody.innerHTML = `
          <div style="text-align:center;padding:2rem;color:var(--text-muted);">
            <div style="font-size:2rem;margin-bottom:8px;">👥</div>
            <strong>अभी तक किसी ने इस वेबिनार के लिए रजिस्ट्रेशन नहीं किया है।</strong><br>
            <span style="font-size:0.82rem;">वेबिनार का लिंक WhatsApp या सोशल मीडिया पर शेयर करें।</span>
          </div>
        `;
        return;
      }

      modalBody.innerHTML = `
        <div class="ucas-table-wrap">
          <table class="ucas-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Attendee Name</th>
                <th>Mobile (Call / WA)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${attendees.map((a, i) => {
                const sMob = String(a.mobile || '').replace(/\D/g, '');
                const regDate = a.created_at ? new Date(a.created_at).toLocaleDateString('hi-IN') : '-';
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div style="font-weight:700;color:var(--text-main);">${a.name}</div>
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:6px;">
                        <a href="tel:${sMob}" style="font-weight:700;color:var(--primary-dark);text-decoration:none;">📞 ${a.mobile}</a>
                        ${sMob ? `<a href="https://wa.me/91${sMob.length === 10 ? '91' + sMob : sMob}" target="_blank" class="ucas-btn ucas-btn-sm ucas-btn-whatsapp" style="padding:2px 6px;font-size:0.75rem;">💬</a>` : ''}
                      </div>
                    </td>
                    <td style="font-size:0.78rem;color:var(--text-muted);">${regDate}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (e) {
      console.error('Fetch attendees error', e);
      modalBody.innerHTML = '<div style="color:var(--danger);text-align:center;padding:1rem;">डेटा लोड करने में त्रुटि हुई।</div>';
    }
  }

  function shareWhatsApp(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;
    const shareUrl = getWebinarShareUrl(wb);
    const text = `🎥 *${wb.title}*\n\n${wb.message}\n\n👉 अपनी सीट बुक करें (नाम व मोबाइल भरने के तुरंत बाद Zoom लिंक मिल जाएगा):\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  }

  function shareFacebook(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;
    const shareUrl = getWebinarShareUrl(wb);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  }

  function copyLink(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!wb) return;
    const shareUrl = getWebinarShareUrl(wb);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        window.UCAS_APP.showToast('✅ वेबिनार लिंक कॉपी हो गया!', 'success');
      });
    }
  }

  async function deleteWebinar(wbId) {
    const wb = userWebinarsList.find(item => item.id === wbId);
    if (!confirm(`क्या आप वाकई वेबिनार "${wb ? wb.title : wbId}" को हटाना चाहते हैं?`)) return;

    try {
      const profileId = window.UCAS_SESSION.getUserId();
      const res = await window.UCAS_DB.deleteLandingPage(wbId, profileId);
      if (res.success) {
        window.UCAS_APP.showToast('✅ वेबिनार सफलतापूर्वक हटा दिया गया।', 'success');
        await loadWebinars();
        if (window.UCAS_MARKETING && typeof window.UCAS_MARKETING.refreshLandingPages === 'function') {
          await window.UCAS_MARKETING.refreshLandingPages();
        }
      }
    } catch (e) {
      console.error('Delete webinar error', e);
    }
  }

  window.UCAS_WEBINARS = {
    init: initWebinars,
    loadWebinars,
    editWebinar,
    cancelWebinarEdit,
    deleteWebinar,
    viewAttendees,
    shareWhatsApp,
    shareFacebook,
    copyLink
  };

})();
