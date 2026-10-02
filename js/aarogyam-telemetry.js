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
    } catch (e) {}
    return { id: 'anonymous', mobile: '', name: 'अज्ञात विज़िटर', email: '' };
  }

  // Categorize Page based on URL pathname
  function detectPageCategory(pathname) {
    const p = (pathname || window.location.pathname || '').toLowerCase();
    
    if (p.includes('/health/') || p.includes('diabetes') || p.includes('joint-care') || p.includes('weight-loss') || p.includes('hair-care') || p.includes('skin-care') || p.includes('womens-care') || p.includes('kids-care') || p.includes('sexual-wellness') || p.includes('home-care')) {
      let sub = 'सामान्य स्वास्थ्य';
      if (p.includes('diabetes')) sub = 'मधुमेह (Diabetes)';
      else if (p.includes('joint-care')) sub = 'जोड़ों का दर्द (Joint Care)';
      else if (p.includes('weight-loss')) sub = 'वज़न घटाना (Weight Loss)';
      else if (p.includes('hair-care')) sub = 'बालों की देखभाल (Hair Care)';
      else if (p.includes('skin-care')) sub = 'त्वचा रोग (Skin Care)';
      else if (p.includes('womens-care')) sub = 'महिला स्वास्थ्य (Women Care)';
      else if (p.includes('kids-care')) sub = 'बच्चों का पोषण (Kids Care)';
      else if (p.includes('sexual-wellness')) sub = 'पुरुष स्वास्थ्य (Vitality)';
      else if (p.includes('home-care')) sub = 'घरेलू स्वच्छता (Home Care)';
      return { category: 'health', categoryLabel: '❤️ स्वास्थ्य देखभाल (Health)', subCategory: sub };
    }
    
    if (p.includes('pashu-palan') || p.includes('cattle') || p.includes('dairy')) {
      return { category: 'pashupalan', categoryLabel: '🐄 पशुपालन व दुग्ध क्रांति', subCategory: 'दुग्ध वृद्धि व पशु स्वास्थ्य' };
    }

    if (p.includes('netsurf') || p.includes('biofit') || p.includes('naturamore')) {
      return { category: 'netsurf', categoryLabel: '🌿 नेट्सर्फ बायोफिट व बिज़नेस', subCategory: 'जैविक कृषि व वेलनेस उत्पाद' };
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
  // 2. AAROGYAMTUBE VIDEO TELEMETRY ENGINE
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
          totalWatchSeconds: 0,
          lastPlayedAt: Date.now()
        };
      }

      store.videos[videoId].plays += 1;
      store.videos[videoId].lastPlayedAt = Date.now();
      store.totalViews = (store.totalViews || 0) + 1;

      setStorageJson(STORAGE_TUBE_TELEMETRY, store);
    } catch (e) {}
  }

  function trackVideoProgress(videoId, watchedSeconds, isCompleted = false) {
    try {
      if (!videoId || !watchedSeconds) return;
      const store = getStorageJson(STORAGE_TUBE_TELEMETRY, { videos: {}, totalViews: 0, totalWatchMinutes: 0 });
      
      if (store.videos && store.videos[videoId]) {
        store.videos[videoId].totalWatchSeconds = (store.videos[videoId].totalWatchSeconds || 0) + watchedSeconds;
        if (isCompleted) {
          store.videos[videoId].completions = (store.videos[videoId].completions || 0) + 1;
        }
        store.totalWatchMinutes = Math.round(Object.values(store.videos).reduce((acc, v) => acc + (v.totalWatchSeconds || 0), 0) / 60);
        setStorageJson(STORAGE_TUBE_TELEMETRY, store);
      }
    } catch (e) {}
  }

  // ====================================================================
  // 3. EBOOK READER & AUDIO TELEMETRY ENGINE
  // ====================================================================
  function trackReaderProgress(bookId, currentPage, totalPages) {
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
      bRecord.totalOpens += 1;
      if (currentPage > bRecord.maxPageReached) bRecord.maxPageReached = currentPage;
      if (totalPages) bRecord.totalPages = totalPages;
      bRecord.lastReadAt = Date.now();

      // User level stats
      const userKey = user.mobile || user.id;
      if (userKey && userKey !== 'anonymous') {
        if (!store.readers[userKey]) {
          store.readers[userKey] = {
            userId: user.id,
            mobile: user.mobile,
            name: user.name,
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
      }

      setStorageJson(STORAGE_READER_TELEMETRY, store);
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

    // Reset / Seed helper for Admin Testing
    seedSampleTelemetryIfNeeded: function() {
      const tube = getStorageJson(STORAGE_TUBE_TELEMETRY, null);
      if (!tube || !tube.videos || Object.keys(tube.videos).length === 0) {
        setStorageJson(STORAGE_TUBE_TELEMETRY, {
          totalViews: 4860,
          totalWatchMinutes: 12450,
          videos: {
            'tube_vid_01': { videoId: 'tube_vid_01', title: 'सोयाबीन में पीला मोज़ेक वायरस का 100% सटीक इलाज', category: 'कृषि रोग इलाज', plays: 1820, completions: 1450, totalWatchSeconds: 109200, lastPlayedAt: Date.now() - 3600000 },
            'tube_vid_02': { videoId: 'tube_vid_02', title: 'दूध और फैट 3 गुना बढ़ाने का प्राकृतिक पशु आहार फॉर्मूला', category: 'पशुपालन', plays: 1430, completions: 1120, totalWatchSeconds: 85800, lastPlayedAt: Date.now() - 7200000 },
            'tube_vid_03': { videoId: 'tube_vid_03', title: 'मधुमेह और HbA1c को 90 दिन में प्राकृतिक नियंत्रण कैसे करें', category: 'स्वास्थ्य', plays: 980, completions: 760, totalWatchSeconds: 58800, lastPlayedAt: Date.now() - 14400000 },
            'tube_vid_04': { videoId: 'tube_vid_04', title: 'गेहूं की बंपर पैदावार: पहला पानी और खाद का सही समय', category: 'फसल प्रबंधन', plays: 630, completions: 510, totalWatchSeconds: 37800, lastPlayedAt: Date.now() - 28800000 }
          }
        });
      }

      const pVisits = getStorageJson(STORAGE_PAGE_VISITS, null);
      if (!pVisits || !pVisits.pages || Object.keys(pVisits.pages).length === 0) {
        setStorageJson(STORAGE_PAGE_VISITS, {
          totalVisits: 3420,
          categories: {
            'health': { category: 'health', label: '❤️ स्वास्थ्य देखभाल (Health)', visits: 1240, uniquePages: { 'diabetes.html': true, 'joint-care.html': true, 'weight-loss.html': true } },
            'agriculture': { category: 'agriculture', label: '🌾 कृषि व फसल सुरक्षा', visits: 1380, uniquePages: { 'index.html': true, 'crop-doctor.html': true } },
            'pashupalan': { category: 'pashupalan', label: '🐄 पशुपालन व दुग्ध क्रांति', visits: 510, uniquePages: { 'pashu-palan.html': true } },
            'netsurf': { category: 'netsurf', label: '🌿 नेट्सर्फ बायोफिट व बिज़नेस', visits: 290, uniquePages: { 'netsurf.html': true } }
          },
          pages: {
            'diabetes.html': { name: 'diabetes.html', title: 'मधुमेह नियंत्रण की सही राह', path: '/health/diabetes.html', category: 'health', categoryLabel: '❤️ स्वास्थ्य', subCategory: 'मधुमेह (Diabetes)', visits: 520, totalDurationSeconds: 46800, lastVisitedAt: Date.now() },
            'joint-care.html': { name: 'joint-care.html', title: 'जोड़ों व घुटनों के दर्द का समाधान', path: '/health/joint-care.html', category: 'health', categoryLabel: '❤️ स्वास्थ्य', subCategory: 'जोड़ों का दर्द', visits: 380, totalDurationSeconds: 26600, lastVisitedAt: Date.now() - 1200000 },
            'weight-loss.html': { name: 'weight-loss.html', title: 'वज़न घटाने का प्राकृतिक फॉर्मूला', path: '/health/weight-loss.html', category: 'health', categoryLabel: '❤️ स्वास्थ्य', subCategory: 'वज़न प्रबंधन', visits: 340, totalDurationSeconds: 23800, lastVisitedAt: Date.now() - 3600000 },
            'pashu-palan.html': { name: 'pashu-palan.html', title: 'पशुपालन एवं दुग्ध क्रांति', path: '/pashu-palan.html', category: 'pashupalan', categoryLabel: '🐄 पशुपालन', subCategory: 'दुग्ध उत्पादन', visits: 510, totalDurationSeconds: 40800, lastVisitedAt: Date.now() - 500000 },
            'netsurf.html': { name: 'netsurf.html', title: 'नेट्सर्फ बायोफिट ऑर्गेनिक', path: '/categories/netsurf.html', category: 'netsurf', categoryLabel: '🌿 नेट्सर्फ', subCategory: 'बायोफिट उत्पाद', visits: 290, totalDurationSeconds: 17400, lastVisitedAt: Date.now() - 1800000 }
          }
        });
      }

      const rdr = getStorageJson(STORAGE_READER_TELEMETRY, null);
      if (!rdr || !rdr.books || Object.keys(rdr.books).length === 0) {
        setStorageJson(STORAGE_READER_TELEMETRY, {
          books: {
            'BK001': { bookId: 'BK001', totalOpens: 340, maxPageReached: 152, totalPages: 152, avgProgress: 64, audioMinutes: 280, lastReadAt: Date.now() - 1800000 },
            'BK002': { bookId: 'BK002', totalOpens: 420, maxPageReached: 120, totalPages: 120, avgProgress: 72, audioMinutes: 390, lastReadAt: Date.now() - 3600000 },
            'BK015': { bookId: 'BK015', totalOpens: 190, maxPageReached: 98, totalPages: 140, avgProgress: 52, audioMinutes: 140, lastReadAt: Date.now() - 7200000 },
            'BK016': { bookId: 'BK016', totalOpens: 150, maxPageReached: 85, totalPages: 110, avgProgress: 48, audioMinutes: 110, lastReadAt: Date.now() - 14400000 }
          },
          readers: {
            '7974422572': {
              userId: 'admin_master',
              mobile: '7974422572',
              name: 'किसान मित्र (एडमिन)',
              books: {
                'BK001': { bookId: 'BK001', currentPage: 92, totalPages: 152, percent: 61, lastReadAt: Date.now() - 1800000 },
                'BK002': { bookId: 'BK002', currentPage: 110, totalPages: 120, percent: 92, lastReadAt: Date.now() - 3600000 }
              }
            }
          }
        });
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
