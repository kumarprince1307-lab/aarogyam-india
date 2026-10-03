/**
 * ====================================================================
 * AAROGYAM INDIA - 360° UNIVERSAL TELEMETRY & BEHAVIOR ANALYTICS ENGINE
 * Version: 1.0 (Zero-Egress, Asynchronous, High-Performance)
 * ====================================================================
 * Automatically captures and aggregates customer behavior across:
 * 1. 11 Health Pages, Pashu Palan, Netsurf & Agriculture Pages
 * 2. AarogyamTube Video Views, Watch Time & Reel Swipes
 * 3. PDF Reader Reading Progress (Pages Read & Completion %)
 * 4. Audio Book Listening Minutes
 * 5. eBook Landing Page Demos & Download Logs
 * ====================================================================
 */

(function (window) {
  'use strict';

  const STORAGE_PAGE_VISITS = 'AOI_PAGE_VISITS';
  const STORAGE_TUBE_TELEMETRY = 'AOI_TUBE_TELEMETRY';
  const STORAGE_READER_TELEMETRY = 'AOI_READER_TELEMETRY';
  const STORAGE_USER_INTERESTS = 'AOI_USER_INTERESTS';
  const STORAGE_DOWNLOAD_LOGS = 'AOI_DOWNLOAD_LOGS';

  // Supabase REST endpoint & anon key for atomic telemetry counters (0-egress write RPCs)
  const SUPABASE_REST_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co/rest/v1';
  const SUPABASE_ANON_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

  // Helper: Call atomic Supabase RPC without blocking UI (returns 204 with 0-egress)
  function sendRpcIncrement(rpcName, params) {
    try {
      if (typeof window === 'undefined' || !window.fetch) return;
      fetch(`${SUPABASE_REST_URL}/rpc/${rpcName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      }).catch(() => {});
    } catch(e) {}
  }

  // Helper: Read JSON safely
  function getStorageJson(key, defaultVal = {}) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  // Helper: Write JSON safely
  function setStorageJson(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('[Telemetry] Storage quota note:', e);
    }
  }

  // Identify Current Logged In User
  function getCurrentUserIdentity() {
    try {
      const v1User = (typeof V1_SESSION !== 'undefined' && V1_SESSION.getCurrentUser) ? V1_SESSION.getCurrentUser() : null;
      if (v1User && (v1User.mobile || v1User.id)) {
        return {
          id: v1User.id,
          mobile: v1User.mobile || '',
          name: v1User.full_name || v1User.name || '',
          email: v1User.email || ''
        };
      }
      const rawLocal = localStorage.getItem('AAROGYAM_USER') || localStorage.getItem('supabase.auth.token');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        const u = parsed.user || parsed;
        if (u) {
          return {
            id: u.id || '',
            mobile: u.phone || u.mobile || (u.user_metadata && u.user_metadata.mobile) || '',
            name: (u.user_metadata && u.user_metadata.full_name) || u.full_name || '',
            email: u.email || ''
          };
        }
      }
      const aiUserRaw = localStorage.getItem('AI_USER');
      if (aiUserRaw) {
        const aiU = JSON.parse(aiUserRaw);
        if (aiU && (aiU.mobile || aiU.phone || aiU.full_name || aiU.name)) {
          return {
            id: aiU.id || '',
            mobile: aiU.mobile || aiU.phone || '',
            name: aiU.full_name || aiU.name || '',
            email: aiU.email || ''
          };
        }
      }
      const m = localStorage.getItem('aim_user_mobile') || localStorage.getItem('aoi_user_mobile') || '';
      const n = localStorage.getItem('aim_user_name') || localStorage.getItem('aoi_user_name') || '';
      if (m || n) {
        return { id: m || 'user', mobile: m, name: n || 'किसान साथी', email: '' };
      }
    } catch (e) {}
    return { id: 'anonymous', mobile: '', name: 'अज्ञात पाठक', email: '' };
  }

  // Categorize Page based on URL pathname
  function detectPageCategory(pathname) {
    const p = (pathname || window.location.pathname || '').toLowerCase();
    
    if (p.includes('/health/') || p.includes('diabetes') || p.includes('joint-care') || p.includes('weight-loss') || p.includes('hair-care') || p.includes('skin-care') || p.includes('womens-care') || p.includes('kids-care') || p.includes('sexual-wellness') || p.includes('home-care') || p.includes('immunity') || p.includes('digestion')) {
      let sub = 'सामान्य स्वास्थ्य (General Health)';
      if (p.includes('diabetes')) sub = 'मधुमेह नियंत्रण (Diabetes Care)';
      else if (p.includes('joint-care')) sub = 'जोड़ों व घुटनों का दर्द (Joint Care)';
      else if (p.includes('weight-loss')) sub = 'वज़न प्रबंधन (Weight Loss)';
      else if (p.includes('hair-care')) sub = 'बालों की सुरक्षा (Hair Care)';
      else if (p.includes('skin-care')) sub = 'त्वचा विकार व निखार (Skin Care)';
      else if (p.includes('womens-care')) sub = 'महिला स्वास्थ्य (Women Care)';
      else if (p.includes('kids-care')) sub = 'बच्चों का पोषण (Kids Care)';
      else if (p.includes('sexual-wellness')) sub = 'पुरुष शक्ति व स्फूर्ति (Vitality)';
      else if (p.includes('home-care')) sub = 'हर्बल होम केयर (Home Care)';
      else if (p.includes('immunity')) sub = 'रोग प्रतिरोधक क्षमता (Immunity)';
      else if (p.includes('digestion')) sub = 'पाचन व गैस मुक्ति (Digestion)';
      return { category: 'health', categoryLabel: '❤️ स्वास्थ्य देखभाल (Health)', subCategory: sub };
    }
    
    if (p.includes('pashu-palan') || p.includes('cattle') || p.includes('dairy')) {
      return { category: 'pashupalan', categoryLabel: '🐄 पशुपालन व दुग्ध क्रांति', subCategory: 'दुग्ध वृद्धि व पशु स्वास्थ्य' };
    }

    if (p.includes('netsurf') || p.includes('biofit') || p.includes('naturamore')) {
      return { category: 'netsurf', categoryLabel: '🌿 नेट्सर्फ बायोफिट व जैविक', subCategory: 'जैविक कृषि व वेलनेस उत्पाद' };
    }

    if (p.includes('tube') || p.includes('reels') || p.includes('video')) {
      return { category: 'tube', categoryLabel: '🎬 AarogyamTube वीडियो हब', subCategory: 'कृषि व स्वास्थ्य वीडियो' };
    }

    if (p.includes('reader.html')) {
      return { category: 'reader', categoryLabel: '📚 ई-बुक रीडर (PDF Reader)', subCategory: 'डिजिटल पठन' };
    }

    if (p.includes('book-landing') || p.includes('checkout') || p.includes('ebooks')) {
      return { category: 'ebooks', categoryLabel: '🌾 कृषि ई-बुक्स व चेकआउट', subCategory: 'ई-बुक कैटलॉग व सेल' };
    }

    return { category: 'agriculture', categoryLabel: '🌾 मुख्य मंच (General Farming)', subCategory: 'सामान्य कृषि' };
  }

  // ====================================================================
  // 1. PAGE VISIT & USER INTEREST TRACKER
  // ====================================================================
  let pageStartTime = Date.now();

  function trackPageVisit() {
    try {
      const path = window.location.pathname || '/';
      const cleanPageName = path.split('/').pop() || 'index.html';
      const catInfo = detectPageCategory(path);
      const user = getCurrentUserIdentity();

      // Read current store
      const store = getStorageJson(STORAGE_PAGE_VISITS, { pages: {}, categories: {}, totalVisits: 0 });

      // Page stats
      if (!store.pages[cleanPageName]) {
        store.pages[cleanPageName] = {
          name: cleanPageName,
          title: document.title || cleanPageName,
          path: path,
          category: catInfo.category,
          categoryLabel: catInfo.categoryLabel,
          subCategory: catInfo.subCategory,
          visits: 0,
          totalDurationSeconds: 0,
          lastVisitedAt: Date.now()
        };
      }
      store.pages[cleanPageName].visits += 1;
      store.pages[cleanPageName].lastVisitedAt = Date.now();
      store.totalVisits = (store.totalVisits || 0) + 1;

      // Category aggregation
      if (!store.categories[catInfo.category]) {
        store.categories[catInfo.category] = {
          category: catInfo.category,
          label: catInfo.categoryLabel,
          visits: 0,
          uniquePages: {}
        };
      }
      store.categories[catInfo.category].visits += 1;
      store.categories[catInfo.category].uniquePages[cleanPageName] = true;

      setStorageJson(STORAGE_PAGE_VISITS, store);

      // Record User Interest if mobile/id is available
      if (user.mobile || (user.id && user.id !== 'anonymous')) {
        recordUserInterest(user, catInfo, cleanPageName);
      }

      // Sync atomic page counter to Supabase cloud (0-egress)
      sendRpcIncrement('increment_page_stat', {
        p_key: String(cleanPageName),
        p_path: String(path),
        p_cat: String(catInfo.category || 'health'),
        dur_secs: 0
      });
    } catch (e) {
      console.warn('[Telemetry] Page visit record note:', e);
    }
  }

  // Update engagement duration when user leaves or hides page
  function updatePageEngagement() {
    try {
      const durationSeconds = Math.max(1, Math.round((Date.now() - pageStartTime) / 1000));
      const path = window.location.pathname || '/';
      const cleanPageName = path.split('/').pop() || 'index.html';
      const store = getStorageJson(STORAGE_PAGE_VISITS, { pages: {}, categories: {}, totalVisits: 0 });

      if (store.pages && store.pages[cleanPageName]) {
        store.pages[cleanPageName].totalDurationSeconds = (store.pages[cleanPageName].totalDurationSeconds || 0) + durationSeconds;
        setStorageJson(STORAGE_PAGE_VISITS, store);
      }
    } catch (e) {}
  }

  function recordUserInterest(user, catInfo, pageName) {
    try {
      const interestsStore = getStorageJson(STORAGE_USER_INTERESTS, {});
      const userKey = user.mobile || user.id;

      if (!interestsStore[userKey]) {
        interestsStore[userKey] = {
          userId: user.id,
          mobile: user.mobile,
          name: user.name,
          primaryInterest: catInfo.categoryLabel,
          categories: {},
          lastActive: Date.now(),
          pagesViewed: []
        };
      }

      const uRecord = interestsStore[userKey];
      uRecord.lastActive = Date.now();
      if (!uRecord.categories[catInfo.category]) {
        uRecord.categories[catInfo.category] = { label: catInfo.categoryLabel, score: 0 };
      }
      uRecord.categories[catInfo.category].score += 1;

      // Determine highest scoring category
      let highestCat = catInfo.categoryLabel;
      let maxScore = 0;
      Object.keys(uRecord.categories).forEach(k => {
        if (uRecord.categories[k].score > maxScore) {
          maxScore = uRecord.categories[k].score;
          highestCat = uRecord.categories[k].label;
        }
      });
      uRecord.primaryInterest = highestCat;

      if (!uRecord.pagesViewed.includes(pageName)) {
        uRecord.pagesViewed.push(pageName);
      }

      setStorageJson(STORAGE_USER_INTERESTS, interestsStore);
    } catch (e) {}
  }

  // ====================================================================
  // 2. AAROGYAMTUBE VIDEO TELEMETRY ENGINE (VIEWS, LIKES, COMMENTS)
  // ====================================================================
  function trackVideoPlay(videoId, title, category = 'General', duration = 60) {
    try {
      if (!videoId) return;
      const store = getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 });
      
      if (!store.videos[videoId]) {
        store.videos[videoId] = {
          videoId,
          title: title || `AarogyamTube Video (${videoId})`,
          category: category || 'Agriculture',
          plays: 0,
          completions: 0,
          likes: 0,
          comments_count: 0,
          totalWatchSeconds: 0,
          lastPlayedAt: Date.now()
        };
      }

      store.videos[videoId].plays += 1;
      store.videos[videoId].lastPlayedAt = Date.now();
      store.totalViews = (store.totalViews || 0) + 1;

      setStorageJson(STORAGE_TUBE_TELEMETRY, store);

      // Atomic Cloud Sync to Supabase
      sendRpcIncrement('increment_video_stat', {
        v_id: String(videoId),
        v_title: String(title || videoId),
        v_category: String(category || 'Agriculture'),
        stat_type: 'view',
        watch_secs: 0
      });
    } catch (e) {}
  }

  function trackVideoLike(videoId, title = '', category = 'General') {
    try {
      if (!videoId) return;
      const store = getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 });
      if (!store.videos[videoId]) {
        store.videos[videoId] = {
          videoId,
          title: title || `AarogyamTube Video (${videoId})`,
          category: category || 'Agriculture',
          plays: 0,
          completions: 0,
          likes: 0,
          comments_count: 0,
          totalWatchSeconds: 0,
          lastPlayedAt: Date.now()
        };
      }
      store.videos[videoId].likes = (store.videos[videoId].likes || 0) + 1;
      setStorageJson(STORAGE_TUBE_TELEMETRY, store);

      // Atomic Cloud Sync to Supabase
      sendRpcIncrement('increment_video_stat', {
        v_id: String(videoId),
        v_title: String(title || store.videos[videoId].title || videoId),
        v_category: String(category || store.videos[videoId].category || 'Agriculture'),
        stat_type: 'like',
        watch_secs: 0
      });
    } catch(e) {}
  }

  function trackVideoComment(videoId, commentText = '', user = null) {
    try {
      if (!videoId) return;
      const store = getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 });
      if (!store.videos[videoId]) {
        store.videos[videoId] = {
          videoId,
          title: `AarogyamTube Video (${videoId})`,
          category: 'Agriculture',
          plays: 0,
          completions: 0,
          likes: 0,
          comments_count: 0,
          totalWatchSeconds: 0,
          lastPlayedAt: Date.now()
        };
      }
      store.videos[videoId].comments_count = (store.videos[videoId].comments_count || 0) + 1;
      setStorageJson(STORAGE_TUBE_TELEMETRY, store);

      // Atomic Cloud Sync to Supabase
      sendRpcIncrement('increment_video_stat', {
        v_id: String(videoId),
        v_title: String(store.videos[videoId].title || videoId),
        v_category: String(store.videos[videoId].category || 'Agriculture'),
        stat_type: 'comment',
        watch_secs: 0
      });
    } catch(e) {}
  }

  function trackVideoProgress(videoId, watchedSeconds, isCompleted = false) {
    try {
      if (!videoId || !watchedSeconds) return;
      const store = getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 });
      
      if (store.videos && store.videos[videoId]) {
        store.videos[videoId].totalWatchSeconds = (store.videos[videoId].totalWatchSeconds || 0) + watchedSeconds;
        if (isCompleted) {
          store.videos[videoId].completions = (store.videos[videoId].completions || 0) + 1;
          sendRpcIncrement('increment_video_stat', {
            v_id: String(videoId),
            v_title: String(store.videos[videoId].title || videoId),
            v_category: String(store.videos[videoId].category || 'Agriculture'),
            stat_type: 'completion',
            watch_secs: watchedSeconds || 60
          });
        }
        store.totalWatchMinutes = Math.round(Object.values(store.videos).reduce((acc, v) => acc + (v.totalWatchSeconds || 0), 0) / 60);
        setStorageJson(STORAGE_TUBE_TELEMETRY, store);
      }
    } catch (e) {}
  }

  // ====================================================================
  // 3. EBOOK READER & AUDIO TELEMETRY ENGINE
  // ====================================================================
  let readerSyncDebounceTimer = null;
  function trackReaderProgress(bookId, currentPage, totalPages, isOpen = false) {
    try {
      if (!bookId) return;
      const store = getStorageJson(STORAGE_READER_TELEMETRY, { books: {}, readers: {} });
      const user = getCurrentUserIdentity();
      const pct = (totalPages && totalPages > 0) ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

      // Book level stats
      if (!store.books[bookId]) {
        store.books[bookId] = {
          bookId,
          totalOpens: 0,
          maxPageReached: 1,
          totalPages: totalPages || 1,
          avgProgress: 0,
          audioMinutes: 0,
          lastReadAt: Date.now()
        };
      }

      const bRecord = store.books[bookId];
      if (isOpen) bRecord.totalOpens += 1;
      if (currentPage > bRecord.maxPageReached) bRecord.maxPageReached = currentPage;
      if (totalPages) bRecord.totalPages = totalPages;
      bRecord.lastReadAt = Date.now();

      // User level stats
      let userKey = user.mobile || user.id;
      if (!userKey || userKey === 'anonymous') {
        let anonKey = localStorage.getItem('aoi_anon_reader_key');
        if (!anonKey) {
          anonKey = 'reader_' + Math.random().toString(36).substring(2, 9);
          localStorage.setItem('aoi_anon_reader_key', anonKey);
        }
        userKey = anonKey;
      }
      const userName = user.name || 'किसान साथी';

      if (!store.readers[userKey]) {
        store.readers[userKey] = {
          userId: user.id,
          mobile: user.mobile,
          name: userName,
          books: {}
        };
      }
      store.readers[userKey].books[bookId] = {
        bookId,
        currentPage,
        totalPages: totalPages || 1,
        percent: pct,
        lastReadAt: Date.now()
      };

      setStorageJson(STORAGE_READER_TELEMETRY, store);

      // Debounced 0-Egress Atomic RPC Sync to Supabase (returns 204 No Content)
      clearTimeout(readerSyncDebounceTimer);
      readerSyncDebounceTimer = setTimeout(() => {
        sendRpcIncrement('sync_reader_progress', {
          p_user_key: String(userKey),
          p_user_name: String(userName),
          p_book_id: String(bookId),
          p_page: parseInt(currentPage, 10) || 1,
          p_total_pages: parseInt(totalPages, 10) || 1,
          p_audio_secs: 0,
          p_is_open: Boolean(isOpen)
        });
      }, 1200);
    } catch (e) {}
  }

  function trackAudioNarrationTime(bookId, secondsListened) {
    try {
      if (!bookId || !secondsListened) return;
      const store = getStorageJson(STORAGE_READER_TELEMETRY, { books: {}, readers: {} });
      if (store.books && store.books[bookId]) {
        store.books[bookId].audioMinutes = (store.books[bookId].audioMinutes || 0) + Math.round(secondsListened / 60);
        setStorageJson(STORAGE_READER_TELEMETRY, store);
      }

      const user = getCurrentUserIdentity();
      let userKey = user.mobile || user.id;
      if (!userKey || userKey === 'anonymous') {
        userKey = localStorage.getItem('aoi_anon_reader_key') || 'guest_reader';
      }
      const userName = user.name || 'किसान साथी';

      sendRpcIncrement('sync_reader_progress', {
        p_user_key: String(userKey),
        p_user_name: String(userName),
        p_book_id: String(bookId),
        p_page: 1,
        p_total_pages: 1,
        p_audio_secs: parseInt(secondsListened, 10) || 0,
        p_is_open: false
      });
    } catch (e) {}
  }

  // ====================================================================
  // 4. DOWNLOAD LOGS TELEMETRY
  // ====================================================================
  function trackDownloadEvent(bookId, bookTitle = '') {
    try {
      if (!bookId) return;
      const user = getCurrentUserIdentity();
      const logs = getStorageJson(STORAGE_DOWNLOAD_LOGS, []);
      logs.unshift({
        bookId,
        bookTitle,
        userMobile: user.mobile || 'Registered User',
        userName: user.name || 'User',
        downloadedAt: Date.now(),
        dateStr: new Date().toLocaleString('hi-IN')
      });
      // Cap at 200 logs
      if (logs.length > 200) logs.pop();
      setStorageJson(STORAGE_DOWNLOAD_LOGS, logs);
    } catch (e) {}
  }

  // ====================================================================
  // 5. PUBLIC API EXPOSURE FOR ADMIN REPORTS & CLIENT APPS
  // ====================================================================
  window.AarogyamTelemetry = {
    trackPageVisit,
    trackVideoPlay,
    trackVideoLike,
    trackVideoComment,
    trackVideoProgress,
    trackReaderProgress,
    trackAudioNarrationTime,
    trackDownloadEvent,
    
    // Read APIs for Marketing Hub
    getPageVisitsData: () => getStorageJson(STORAGE_PAGE_VISITS, { pages: {}, categories: {}, totalVisits: 0 }),
    getTubeTelemetryData: () => getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 }),
    getReaderTelemetryData: () => getStorageJson(STORAGE_READER_TELEMETRY, { books: {}, readers: {} }),
    getUserInterestsData: () => getStorageJson(STORAGE_USER_INTERESTS, {}),
    getDownloadLogsData: () => getStorageJson(STORAGE_DOWNLOAD_LOGS, []),

    // Purge legacy mock/dummy data safely
    cleanLegacyMockDataIfNeeded: function() {
      try {
        const tube = getStorageJson(STORAGE_TUBE_TELEMETRY, null);
        if (tube && (tube.totalViews === 4860 || (tube.videos && tube.videos['tube_vid_01']))) {
          localStorage.removeItem(STORAGE_TUBE_TELEMETRY);
        }
        const visits = getStorageJson(STORAGE_PAGE_VISITS, null);
        if (visits && (visits.totalVisits === 3420 || (visits.pages && visits.pages['diabetes.html'] && visits.pages['diabetes.html'].visits === 520))) {
          localStorage.removeItem(STORAGE_PAGE_VISITS);
        }
      } catch (e) {}
    },

    // Initialize clean telemetry store for real incoming data (No Fake Dummy Records)
    seedSampleTelemetryIfNeeded: function() {
      if (typeof this.cleanLegacyMockDataIfNeeded === 'function') {
        this.cleanLegacyMockDataIfNeeded();
      }
      const tube = getStorageJson(STORAGE_TUBE_TELEMETRY, null);
      if (!tube || !tube.videos) {
        setStorageJson(STORAGE_TUBE_TELEMETRY, { totalViews: 0, totalWatchMinutes: 0, videos: {} });
      }
      const pVisits = getStorageJson(STORAGE_PAGE_VISITS, null);
      if (!pVisits || !pVisits.pages) {
        setStorageJson(STORAGE_PAGE_VISITS, { totalVisits: 0, categories: {}, pages: {} });
      }
      const rdr = getStorageJson(STORAGE_READER_TELEMETRY, null);
      if (!rdr || !rdr.books) {
        setStorageJson(STORAGE_READER_TELEMETRY, { books: {}, readers: {} });
      }
    }
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackPageVisit);
  } else {
    trackPageVisit();
  }

  // Track engagement on unload/visibility change
  window.addEventListener('beforeunload', updatePageEngagement);
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') updatePageEngagement();
  });

})(window);
