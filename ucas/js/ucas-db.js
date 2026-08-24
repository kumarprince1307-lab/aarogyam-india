/* ==========================================================================
   UCAS DATA ACCESS LAYER (SUPABASE ENGINE)
   Safe, RLS-compliant operations for:
   - public.surveys
   - public.phonebook
   - public.permissions
   ========================================================================== */

(function (window) {
  'use strict';

  const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

  let db = window.dbClient || null;

  function getDb() {
    if (db) return db;
    if (window.dbClient) {
      db = window.dbClient;
      return db;
    }
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      window.dbClient = db;
      return db;
    }
    console.error('UCAS DB: Supabase client is not available');
    return null;
  }

  // ==========================================
  // 1. SURVEYS ENGINE
  // ==========================================

  async function getSurveys(profileId) {
    const client = getDb();
    if (!client) return { success: false, data: [] };

    try {
      let query = client
        .from('surveys')
        .select('id, profile_id, name, mobile, age, sex, state, district, area, village, occupation, selected_categories, category_answers, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (e) {
      console.error('UCAS DB: getSurveys error', e);
      return { success: false, data: [], message: e.message };
    }
  }

  async function createSurvey(surveyPayload) {
    const client = getDb();
    if (!client) return { success: false, message: 'डेटाबेस उपलब्ध नहीं है' };

    try {
      const record = {
        profile_id: surveyPayload.profile_id,
        name: surveyPayload.name,
        mobile: surveyPayload.mobile,
        age: surveyPayload.age || null,
        sex: surveyPayload.sex || null,
        state: surveyPayload.state || null,
        district: surveyPayload.district || null,
        area: surveyPayload.area || null,
        village: surveyPayload.village || null,
        occupation: surveyPayload.occupation || null,
        selected_categories: Array.isArray(surveyPayload.selected_categories) 
          ? surveyPayload.selected_categories 
          : (surveyPayload.selected_categories ? [surveyPayload.selected_categories] : []),
        category_answers: surveyPayload.category_answers || {},
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('surveys')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error('UCAS DB: createSurvey error', e);
      return { success: false, message: e.message };
    }
  }

  // ==========================================
  // 2. PHONEBOOK ENGINE
  // ==========================================

  async function getPhonebook(profileId) {
    const client = getDb();
    if (!client) return { success: false, data: [] };

    try {
      let query = client
        .from('phonebook')
        .select('id, profile_id, name, mobile, place, source, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (e) {
      console.error('UCAS DB: getPhonebook error', e);
      return { success: false, data: [], message: e.message };
    }
  }

  async function addPhonebookContact(contact) {
    const client = getDb();
    if (!client) return { success: false, message: 'डेटाबेस उपलब्ध नहीं है' };

    try {
      const record = {
        profile_id: contact.profile_id,
        name: contact.name,
        mobile: contact.mobile,
        place: contact.place || null,
        source: contact.source || 'manual',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('phonebook')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      console.error('UCAS DB: addPhonebookContact error', e);
      return { success: false, message: e.message };
    }
  }

  async function bulkAddPhonebookContacts(contacts) {
    const client = getDb();
    if (!client) return { success: false, message: 'डेटाबेस उपलब्ध नहीं है' };
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return { success: true, count: 0, data: [] };
    }

    try {
      const records = contacts.map(c => ({
        profile_id: c.profile_id,
        name: (c.name || 'Unknown Contact').trim(),
        mobile: c.mobile,
        place: c.place || null,
        source: c.source || 'phonebook',
        updated_at: new Date().toISOString()
      }));

      // Chunk in batches of 100 to ensure high performance and reliability
      const chunkSize = 100;
      let totalInserted = 0;

      for (let i = 0; i < records.length; i += chunkSize) {
        const chunk = records.slice(i, i + chunkSize);
        const { data, error } = await client
          .from('phonebook')
          .insert(chunk)
          .select();

        if (error) throw error;
        totalInserted += (data || chunk).length;
      }

      return { success: true, count: totalInserted };
    } catch (e) {
      console.error('UCAS DB: bulkAddPhonebookContacts error', e);
      return { success: false, message: e.message };
    }
  }

  // ==========================================
  // 3. PERMISSIONS ENGINE
  // ==========================================

  async function getPermissions(profileId) {
    const client = getDb();
    if (!client) return { success: false, data: [] };

    try {
      let query = client.from('permissions').select('*');
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (e) {
      console.error('UCAS DB: getPermissions error', e);
      return { success: false, data: [], message: e.message };
    }
  }

  async function setPermission(profileId, permissionKey, allowed) {
    const client = getDb();
    if (!client) return { success: false, message: 'डेटाबेस उपलब्ध नहीं है' };

    try {
      // Check if permission row already exists
      const { data: existing } = await client
        .from('permissions')
        .select('id')
        .eq('profile_id', profileId)
        .eq('permission_key', permissionKey)
        .maybeSingle();

      let res;
      if (existing && existing.id) {
        res = await client
          .from('permissions')
          .update({ allowed: Boolean(allowed), updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select();
      } else {
        res = await client
          .from('permissions')
          .insert([{
            profile_id: profileId,
            permission_key: permissionKey,
            allowed: Boolean(allowed),
            updated_at: new Date().toISOString()
          }])
          .select();
      }

      if (res.error) throw res.error;
      return { success: true, data: res.data };
    } catch (e) {
      console.error('UCAS DB: setPermission error', e);
      return { success: false, message: e.message };
    }
  }

  // ==========================================
  // 4. ADMIN & ANALYTICS QUERIES
  // ==========================================

  async function getAllProfiles(limit = 100) {
    const client = getDb();
    if (!client) return { success: false, data: [] };

    try {
      const { data, error } = await client
        .from('profiles')
        .select('id, full_name, mobile, email, gender, State, district, referral_code, registration_source, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (e) {
      console.error('UCAS DB: getAllProfiles error', e);
      return { success: false, data: [], message: e.message };
    }
  }

  const _referralsCache = new Map();
  const REF_CACHE_TTL = 30000; // 30 seconds cache to prevent repeated database hits

  async function getDirectReferralsWithPurchases(referrerId, referralCode, startDate, endDate) {
    const client = getDb();
    if (!client) {
      return { success: false, data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 } };
    }

    const cacheKey = `${referrerId || ''}_${referralCode || ''}_${startDate || ''}_${endDate || ''}`;
    const cached = _referralsCache.get(cacheKey);
    if (cached && (Date.now() - cached.time < REF_CACHE_TTL)) {
      return { success: true, data: cached.data };
    }

    try {
      const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val).trim()));
      let targetProfileId = referrerId && isUuid(referrerId) ? referrerId : null;

      // 1. Resolve promoter profile UUID if not already UUID
      if (!targetProfileId) {
        const lookupCode = referralCode || referrerId || 'AI000004';
        try {
          const { data: p } = await client
            .from('profiles')
            .select('id')
            .eq('share_id', lookupCode)
            .maybeSingle();
          if (p && p.id) targetProfileId = p.id;
        } catch (e) {}
      }

      if (!targetProfileId) {
        // Fallback for Master Account (AI000004)
        targetProfileId = '52ef705c-bb45-4137-bee4-a3f8df73b676';
      }

      // 2. Fetch all registered referred members from profiles table
      let userList = [];
      const lookupCode = referralCode || referrerId || 'AI000004';
      try {
        let query = client
          .from('profiles')
          .select('id, full_name, mobile, email, created_at, State, district, referral_code, registration_source, is_active, share_id, referred_by');

        if (targetProfileId) {
          query = query.eq('referred_by', targetProfileId);
        } else {
          query = query.eq('referral_code', lookupCode);
        }

        if (startDate) {
          query = query.gte('created_at', new Date(startDate).toISOString());
        }
        if (endDate) {
          const endD = new Date(endDate);
          endD.setHours(23, 59, 59, 999);
          query = query.lte('created_at', endD.toISOString());
        }

        query = query.order('created_at', { ascending: false });

        const { data: referredUsers, error: usersErr } = await query;
        if (!usersErr && Array.isArray(referredUsers)) {
          userList = referredUsers;
        } else if (usersErr) {
          console.warn('Referred profiles query notice:', usersErr);
        }
      } catch (err) {
        console.warn('Referred profiles query error:', err);
      }

      // Fallback to referral_code if referred_by returned 0
      if (userList.length === 0 && lookupCode) {
        try {
          let altQuery = client
            .from('profiles')
            .select('id, full_name, mobile, email, created_at, State, district, referral_code, registration_source, is_active, share_id, referred_by')
            .eq('referral_code', lookupCode)
            .order('created_at', { ascending: false });
          const { data: altUsers } = await altQuery;
          if (Array.isArray(altUsers) && altUsers.length > 0) {
            userList = altUsers;
          }
        } catch (e) {}
      }

      if (userList.length === 0) {
        return {
          success: true,
          data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 }
        };
      }

      // 3. Fetch purchases for these referred users in safe batches of 30
      const profileIds = userList.map(u => u.id).filter(Boolean);
      const userPurchasesMap = {};
      let totalAmount = 0;

      if (profileIds.length > 0) {
        try {
          const chunkSize = 30;
          for (let i = 0; i < profileIds.length; i += chunkSize) {
            const chunk = profileIds.slice(i, i + chunkSize);
            let purchaseQuery = client
              .from('purchases')
              .select('id, profile_id, book_id, amount, payment_status, purchase_date, created_at')
              .in('profile_id', chunk)
              .eq('payment_status', 'success');

            if (startDate) {
              purchaseQuery = purchaseQuery.gte('created_at', new Date(startDate).toISOString());
            }
            if (endDate) {
              const endD = new Date(endDate);
              endD.setHours(23, 59, 59, 999);
              purchaseQuery = purchaseQuery.lte('created_at', endD.toISOString());
            }

            const { data: purchases, error: purErr } = await purchaseQuery;
            const purchasesList = purchases || [];

            purchasesList.forEach(p => {
              const amt = parseFloat(p.amount) || 0;
              totalAmount += amt;
              if (!userPurchasesMap[p.profile_id]) {
                userPurchasesMap[p.profile_id] = { count: 0, totalSpent: 0, purchases: [] };
              }
              userPurchasesMap[p.profile_id].count++;
              userPurchasesMap[p.profile_id].totalSpent += amt;
              userPurchasesMap[p.profile_id].purchases.push(p);
            });
          }
        } catch (purErr) {
          console.warn('Purchases query notice:', purErr);
        }
      }

      // 4. Map detailed referral info for all members
      const detailedReferrals = userList.map(u => {
        const purData = userPurchasesMap[u.id] || { count: 0, totalSpent: 0, purchases: [] };
        const hasPurchases = purData.totalSpent > 0;
        return {
          ...u,
          source: u.registration_source || 'direct',
          is_active: Boolean(u.is_active || hasPurchases),
          purchaseCount: purData.count,
          totalPurchasedAmount: purData.totalSpent,
          purchases: purData.purchases
        };
      });

      const finalResult = {
        referrals: detailedReferrals,
        totalReferrals: detailedReferrals.length,
        totalPurchaseAmount: totalAmount
      };

      _referralsCache.set(cacheKey, { time: Date.now(), data: finalResult });

      return {
        success: true,
        data: finalResult
      };
    } catch (e) {
      console.error('UCAS DB: getDirectReferralsWithPurchases error', e);
      return { success: false, data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 }, message: e.message };
    }
  }

  // ==========================================
  // 5. LANDING PAGES ENGINE QUERIES
  // ==========================================

  let _ucasLandingPagesCache = new Map();
  const UCAS_LP_CACHE_TTL = 20000; // 20 seconds cache

  function invalidateLandingPagesCache() {
    _ucasLandingPagesCache.clear();
  }

  // Master Landing Page Runtime Switch (Set true to enable, false for Egress Safe Mode)
  const LANDING_PAGES_ENABLED = false;

  async function getLandingPages(profileId, forceRefresh = false) {
    if (!LANDING_PAGES_ENABLED) {
      return { success: true, data: [] };
    }

    const isUuid = (val) => Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val).trim()));
    const validId = profileId && isUuid(profileId) ? profileId : '52ef705c-bb45-4137-bee4-a3f8df73b676';
    const shareId = window.UCAS_SESSION?.getShareId() || 'AI000004';
    const cacheKey = `${validId}_${shareId}`;

    if (!forceRefresh) {
      const cached = _ucasLandingPagesCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < UCAS_LP_CACHE_TTL)) {
        return { success: true, data: cached.data };
      }
    }

    const client = getDb();
    let pages = [];

    // 1. Try Supabase
    if (client) {
      try {
        const { data, error } = await client
          .from('landing_pages')
          .select('*')
          .or(`profile_id.eq.${validId},share_id.eq.${shareId},share_id.eq.ADMIN,share_id.eq.ALL_USERS`)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          pages = data;
        }
      } catch (e) {
        console.warn('Landing pages fetch notice:', e);
      }
    }

    // 2. Sync / Fallback with LocalStorage stores
    const combinedMap = new Map();
    (pages || []).forEach(p => {
      if (p && p.id) combinedMap.set(p.id, p);
    });

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('UCAS_LP_') || key === 'UCAS_LOCAL_LANDING_PAGES' || key === 'UCAS_PRODUCT_LANDING_PAGES')) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || '[]');
            const arr = Array.isArray(list) ? list : [list];
            arr.forEach(p => {
              if (p && p.id && !combinedMap.has(p.id)) {
                // Attach to user if created by user or master broadcast
                if (p.profile_id === profileId || p.profile_id === validId || p.profile_id === 'ALL_USERS') {
                  combinedMap.set(p.id, p);
                }
              }
            });
          } catch (e) {}
        }
      }
    } catch (e) {}

    // 3. Default Seed Templates if no landing pages exist yet
    if (combinedMap.size === 0) {
      const defaultTemplates = [
        {
          id: 'LP_PROD_001',
          profile_id: profileId,
          share_id: window.UCAS_SESSION?.getShareId() || 'AI000004',
          title: 'जैविक कृषि संपूर्ण पोषण किट (50% विशेष छूट)',
          category: 'product',
          content_type: 'product',
          media_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
          thumbnail_url: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg',
          message: 'फसलों की पैदावार दोगुनी करने और मिट्टी को उपजाऊ बनाने के लिए संपूर्ण जैविक किट। अभी ऑर्डर करें और विशेष छूट पाएं!',
          mrp: 1999,
          offer_price: 999,
          buynow_url: 'https://aarogyamindia.in',
          product_data: {
            mrp: '1999',
            offer_price: '999',
            buynow_url: 'https://aarogyamindia.in',
            image: 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg'
          },
          status: 'active',
          response_count: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'LP_AGRI_002',
          profile_id: profileId,
          share_id: window.UCAS_SESSION?.getShareId() || 'AI000004',
          title: 'Aarogyam India उन्नत जैविक कृषि मार्गदर्शन',
          category: 'agriculture',
          content_type: 'youtube',
          media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
          message: 'नमस्ते! जैविक कृषि अपनाएं, खर्च घटाएं और मुनाफा बढ़ाएं। विस्तृत जानकारी के लिए वीडियो देखें और फॉर्म भरें।',
          status: 'active',
          response_count: 0,
          created_at: new Date().toISOString()
        }
      ];

      defaultTemplates.forEach(t => combinedMap.set(t.id, t));
      try {
        localStorage.setItem(`UCAS_LP_${profileId}`, JSON.stringify(defaultTemplates));
      } catch (e) {}
    }

    const finalPages = Array.from(combinedMap.values());

    // 4. Attach real-time survey response count for each landing page
    if (profileId) {
      try {
        const surveysRes = await getSurveys(profileId);
        const userSurveys = surveysRes?.data || [];

        finalPages.forEach(lp => {
          if (!lp) return;
          const matching = userSurveys.filter(s => {
            const lpId = s?.category_answers?.landing_page_id;
            return lpId && (lpId === lp.id || lpId === lp.slug);
          });
          lp.response_count = matching.length;
        });
      } catch (e) {
        console.warn('Error computing survey counts for landing pages', e);
      }
    }

    _ucasLandingPagesCache.set(cacheKey, { data: finalPages, timestamp: Date.now() });
    return { success: true, data: finalPages };
  }

  async function getLandingPageById(landingPageId) {
    if (!LANDING_PAGES_ENABLED) {
      return { success: false, data: null, maintenance: true };
    }

    const client = getDb();
    if (!landingPageId) return { success: false, data: null };

    // 1. Try Supabase
    if (client) {
      try {
        const { data, error } = await client
          .from('landing_pages')
          .select('*')
          .eq('id', landingPageId)
          .single();

        if (!error && data) {
          return { success: true, data };
        }
      } catch (e) {
        // Fallback
      }
    }

    // 2. Try all localStorage stores
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('UCAS_LP_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const found = list.find(item => item.id === landingPageId);
          if (found) return { success: true, data: found };
        } catch (err) {}
      }
    }

    return { success: false, data: null, message: 'Landing page not found' };
  }

  async function createLandingPage(payload) {
    invalidateLandingPagesCache();
    const client = getDb();
    const profileId = payload.profile_id || 'anonymous';
    const localStoreKey = `UCAS_LP_${profileId}`;

    // 1. Save to LocalStorage immediately
    const localPages = JSON.parse(localStorage.getItem(localStoreKey) || '[]');
    localPages.unshift(payload);
    localStorage.setItem(localStoreKey, JSON.stringify(localPages));

    // 2. Try Supabase insert
    if (client) {
      try {
        const { data, error } = await client
          .from('landing_pages')
          .insert([payload])
          .select();

        if (!error && data) {
          return { success: true, data: data[0] };
        }
      } catch (e) {
        console.warn('Supabase landing_pages insert notice:', e.message);
      }
    }

    return { success: true, data: payload };
  }

  async function updateLandingPage(lpId, payload, profileId) {
    invalidateLandingPagesCache();
    const client = getDb();
    const pid = profileId || payload.profile_id || 'anonymous';
    const localStoreKey = `UCAS_LP_${pid}`;

    // 1. Update in LocalStorage
    const localPages = JSON.parse(localStorage.getItem(localStoreKey) || '[]');
    const idx = localPages.findIndex(p => p.id === lpId);
    if (idx !== -1) {
      localPages[idx] = { ...localPages[idx], ...payload, updated_at: new Date().toISOString() };
      localStorage.setItem(localStoreKey, JSON.stringify(localPages));
    }

    // 2. Update in Supabase
    if (client) {
      try {
        const { data, error } = await client
          .from('landing_pages')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', lpId)
          .select();

        if (!error && data) {
          return { success: true, data: data[0] };
        }
      } catch (e) {
        console.warn('Supabase landing_pages update notice:', e.message);
      }
    }

    return { success: true, data: payload };
  }

  async function deleteLandingPage(lpId, profileId) {
    invalidateLandingPagesCache();
    const client = getDb();
    const pid = profileId || 'anonymous';
    const localStoreKey = `UCAS_LP_${pid}`;

    // 1. Delete from LocalStorage
    const localPages = JSON.parse(localStorage.getItem(localStoreKey) || '[]');
    const filtered = localPages.filter(p => p.id !== lpId);
    localStorage.setItem(localStoreKey, JSON.stringify(filtered));

    // Also check global store
    const globalPages = JSON.parse(localStorage.getItem('UCAS_LP_global') || '[]');
    const filteredGlobal = globalPages.filter(p => p.id !== lpId);
    localStorage.setItem('UCAS_LP_global', JSON.stringify(filteredGlobal));

    // 2. Delete from Supabase
    if (client) {
      try {
        const { error } = await client
          .from('landing_pages')
          .delete()
          .eq('id', lpId);

        if (error) throw error;
      } catch (e) {
        console.warn('Supabase landing_pages delete notice:', e.message);
      }
    }

    return { success: true };
  }

  // ==========================================
  // 6. USER SUBSCRIPTION & ACTIVITY ENGINE
  // ==========================================

  async function getUserSubscription(profileId) {
    const client = getDb();
    if (!profileId) {
      return {
        isActive: false,
        status: 'INACTIVE',
        subscriber: 'NO',
        plan: 'None',
        source: 'NONE',
        amount: '₹0',
        startDate: null,
        expiryDate: null,
        purchaseDate: null,
        paymentId: 'N/A',
        daysRemaining: 0
      };
    }

    let purchaseRecord = null;

    // 1. Query Purchases from Supabase
    if (client) {
      try {
        const { data, error } = await client
          .from('purchases')
          .select('*')
          .eq('profile_id', profileId)
          .order('purchase_date', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          purchaseRecord = data[0];
        }
      } catch (e) {
        console.warn('Subscription purchase query notice:', e);
      }
    }

    // 2. Check Admin Manual Override
    const manualStatus = localStorage.getItem(`UCAS_USER_STATUS_${profileId}`);

    if (purchaseRecord) {
      const pDate = purchaseRecord.purchase_date || purchaseRecord.created_at || new Date().toISOString();
      const pTime = new Date(pDate).getTime();
      // 1 Year = 365 days - 1 day
      const expTime = pTime + (365 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
      const expiryDate = new Date(expTime).toISOString();
      const now = Date.now();
      const isNaturalActive = now <= expTime;
      const daysRemaining = Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));

      const isActuallyActive = manualStatus ? (manualStatus === 'ACTIVE') : isNaturalActive;

      return {
        isActive: isActuallyActive,
        status: isActuallyActive ? 'ACTIVE' : 'INACTIVE',
        subscriber: isActuallyActive ? 'YES' : 'NO',
        plan: 'Basic (1 Year)',
        source: purchaseRecord.book_id ? 'EBOOK_PURCHASE' : 'DIRECT_PAYMENT',
        amount: purchaseRecord.book_id ? 'FREE' : `₹${purchaseRecord.amount || 99}`,
        startDate: pDate,
        purchaseDate: pDate,
        expiryDate: expiryDate,
        paymentId: purchaseRecord.payment_id || purchaseRecord.order_id || 'N/A',
        daysRemaining: daysRemaining,
        purchaseRecord: purchaseRecord
      };
    }

    // If no purchase, but admin manually activated
    if (manualStatus === 'ACTIVE') {
      const now = new Date();
      const expTime = now.getTime() + (365 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
      return {
        isActive: true,
        status: 'ACTIVE',
        subscriber: 'YES',
        plan: 'Basic (1 Year)',
        source: 'DIRECT_PAYMENT',
        amount: '₹99',
        startDate: now.toISOString(),
        purchaseDate: now.toISOString(),
        expiryDate: new Date(expTime).toISOString(),
        paymentId: 'MANUAL_ADMIN',
        daysRemaining: 365
      };
    }

    // Default Inactive
    return {
      isActive: false,
      status: 'INACTIVE',
      subscriber: 'NO',
      plan: 'None',
      source: 'NONE',
      amount: '₹0',
      startDate: null,
      expiryDate: null,
      purchaseDate: null,
      paymentId: 'N/A',
      daysRemaining: 0
    };
  }

  async function setUserStatus(profileId, status) {
    if (!profileId) return { success: false };
    localStorage.setItem(`UCAS_USER_STATUS_${profileId}`, status);
    return { success: true, status };
  }

  async function getAllLandingPagesAdmin() {
    const client = getDb();
    let pages = [];

    // 1. Try Supabase
    if (client) {
      try {
        const { data, error } = await client
          .from('landing_pages')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          pages = data;
        }
      } catch (e) {}
    }

    // 2. Scan LocalStorage for all LP keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('UCAS_LP_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.forEach(p => {
            if (!pages.some(existing => existing.id === p.id)) {
              pages.push(p);
            }
          });
        } catch (err) {}
      }
    }

    return { success: true, data: pages };
  }

  async function getUserActivityLogs(profileId) {
    const logs = [];

    if (!profileId) return { success: true, data: [] };

    try {
      const [surveys, phonebook, lpRes] = await Promise.all([
        getSurveys(profileId),
        getPhonebook(profileId),
        getLandingPages(profileId)
      ]);

      (surveys.data || []).forEach(s => {
        logs.push({
          action: 'सर्वे दर्ज किया (Survey Created)',
          type: 'survey',
          date: s.created_at || new Date().toISOString(),
          refId: s.id,
          detail: `नाम: ${s.name} (${s.village || 'स्थान'})`
        });
      });

      (phonebook.data || []).forEach(p => {
        logs.push({
          action: 'फोनबुक संपर्क जोड़ा (Contact Added)',
          type: 'phonebook',
          date: p.created_at || new Date().toISOString(),
          refId: p.id,
          detail: `नाम: ${p.name} (${p.mobile})`
        });
      });

      (lpRes.data || []).forEach(lp => {
        logs.push({
          action: 'लैंडिंग पेज बनाया (Landing Page Created)',
          type: 'landing_page',
          date: lp.created_at || new Date().toISOString(),
          refId: lp.id,
          detail: `टाइटल: ${lp.title} (${lp.category})`
        });
      });

      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.warn('Activity log compiling notice:', e);
    }

    return { success: true, data: logs };
  }

  async function getUserMediaPermissions(profileId) {
    if (!profileId) {
      return {
        image: true,
        youtube: false,
        facebook: false,
        product: false,
        product_landing: false,
        other: false,
        export_csv: false,
        isActive: false
      };
    }

    const sub = await getUserSubscription(profileId);
    const isActive = Boolean(sub?.isActive);

    // Check custom override in localStorage / memory
    const saved = localStorage.getItem(`UCAS_MEDIA_PERMS_${profileId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const prodPerm = parsed.product !== undefined ? Boolean(parsed.product) : (parsed.product_landing !== undefined ? Boolean(parsed.product_landing) : isActive);
        return {
          image: parsed.image !== undefined ? Boolean(parsed.image) : true,
          youtube: parsed.youtube !== undefined ? Boolean(parsed.youtube) : isActive,
          facebook: parsed.facebook !== undefined ? Boolean(parsed.facebook) : isActive,
          product: prodPerm,
          product_landing: prodPerm,
          other: parsed.other !== undefined ? Boolean(parsed.other) : isActive,
          export_csv: parsed.export_csv !== undefined ? Boolean(parsed.export_csv) : isActive,
          isActive: isActive
        };
      } catch (e) {}
    }

    // Default permissions based on Active / Inactive status
    return {
      image: true,
      youtube: isActive,
      facebook: isActive,
      product: isActive,
      product_landing: isActive,
      other: isActive,
      export_csv: isActive,
      isActive: isActive
    };
  }

  async function setUserMediaPermissions(profileId, permissions) {
    if (!profileId || !permissions) return { success: false };
    try {
      localStorage.setItem(`UCAS_MEDIA_PERMS_${profileId}`, JSON.stringify(permissions));
      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }


  window.UCAS_DB = {
    getDb,
    getSurveys,
    createSurvey,
    getPhonebook,
    addPhonebookContact,
    bulkAddPhonebookContacts,
    getPermissions,
    setPermission,
    getAllProfiles,
    getDirectReferralsWithPurchases,
    getLandingPages,
    getLandingPageById,
    createLandingPage,
    updateLandingPage,
    deleteLandingPage,
    getUserSubscription,
    setUserStatus,
    getUserMediaPermissions,
    setUserMediaPermissions,
    getAllLandingPagesAdmin,
    getUserActivityLogs
  };

  console.log('✅ UCAS DB Module (with Subscription & Admin Engines) Ready.');
})(window);

