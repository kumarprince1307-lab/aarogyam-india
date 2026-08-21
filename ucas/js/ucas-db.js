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
        .select('*')
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
        .select('*')
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

  async function getDirectReferralsWithPurchases(referrerId, referralCode, startDate, endDate) {
    const client = getDb();
    if (!client || (!referrerId && !referralCode)) {
      return { success: false, data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 } };
    }

    try {
      // 1. Fetch profiles where referred_by is referrerId OR referralCode
      let query = client
        .from('profiles')
        .select('id, full_name, mobile, email, created_at, State, district, referral_code, registration_source');

      if (referrerId && referralCode) {
        query = query.or(`referred_by.eq.${referrerId},referred_by.eq.${referralCode}`);
      } else if (referrerId) {
        query = query.eq('referred_by', referrerId);
      } else if (referralCode) {
        query = query.eq('referred_by', referralCode);
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
      if (usersErr) throw usersErr;

      const userList = referredUsers || [];
      if (userList.length === 0) {
        return {
          success: true,
          data: {
            referrals: [],
            totalReferrals: 0,
            totalPurchaseAmount: 0
          }
        };
      }

      // 2. Fetch purchases for these referred users
      const profileIds = userList.map(u => u.id);
      let purchaseQuery = client
        .from('purchases')
        .select('id, profile_id, book_id, amount, payment_status, purchase_date, created_at')
        .in('profile_id', profileIds)
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
      if (purErr) console.warn('Purchases query error:', purErr);

      const purchasesList = purchases || [];

      // Map purchases to each user
      const userPurchasesMap = {};
      let totalAmount = 0;

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

      const detailedReferrals = userList.map(u => {
        const purData = userPurchasesMap[u.id] || { count: 0, totalSpent: 0, purchases: [] };
        return {
          ...u,
          purchaseCount: purData.count,
          totalPurchasedAmount: purData.totalSpent,
          purchases: purData.purchases
        };
      });

      return {
        success: true,
        data: {
          referrals: detailedReferrals,
          totalReferrals: detailedReferrals.length,
          totalPurchaseAmount: totalAmount
        }
      };
    } catch (e) {
      console.error('UCAS DB: getDirectReferralsWithPurchases error', e);
      return { success: false, data: { referrals: [], totalReferrals: 0, totalPurchaseAmount: 0 }, message: e.message };
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
    getDirectReferralsWithPurchases
  };

  console.log('✅ UCAS DB Module Ready.');
})(window);
