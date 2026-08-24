/* Admin API
   - Phase 2.2: All Dashboard mock data has been replaced with live Supabase queries.
*/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for other admin pages (Users, Purchases, Downloads, Reports) - NOT part of Dashboard scope for this task.
// These will be addressed in their respective modules in future phases.
const USERS = [
  { id: 'U001', name: 'Anita Sharma', mobile: '9876501123', email: 'anita@example.com', status: 'active', source: 'Facebook' },
  { id: 'U002', name: 'Deepak Yadav', mobile: '9988776655', email: 'deepak@example.com', status: 'inactive', source: 'Organic' },
  { id: 'U003', name: 'Radha Singh', mobile: '9123456780', email: 'radha@example.com', status: 'active', source: 'WhatsApp' }
];
const PURCHASES = [
  { order: 'ORD-1001', customer: 'Anita Sharma', book: 'Kharif Master Guide', amount: '₹499', status: 'success', source: 'WhatsApp', date: '2026-08-01' },
  { order: 'ORD-1002', customer: 'Deepak Yadav', book: 'Fasal Ka Doctor', amount: '₹449', status: 'failed', source: 'Facebook', date: '2026-07-31' },
  { order: 'ORD-1003', customer: 'Radha Singh', book: 'AI Website Guide', amount: '₹599', status: 'success', source: 'Organic', date: '2026-07-30' }
];
const DOWNLOADS = [
  { book: 'Kharif Master Guide', downloads: 480, users: 325, lastDownloaded: '2026-08-01' },
  { book: 'Fasal Ka Doctor', downloads: 292, users: 190, lastDownloaded: '2026-07-31' }
];
const USER_DETAILS = {
  U001: {
    id: 'U001', name: 'Anita Sharma', mobile: '9876501123', email: 'anita@example.com', source: 'Facebook', joined: '2026-07-12', purchases: 5, status: 'active', referralToken: 'REF-FB-001',
    purchases: [
      { order: 'ORD-1001', book: 'Kharif Master Guide', amount: '₹499', date: '2026-07-29', status: 'success' },
      { order: 'ORD-1004', book: 'Jaivik Kheti Guide', amount: '₹399', date: '2026-07-15', status: 'success' }
    ],
    activity: [
      { date: '2026-08-01', description: 'Converted from WhatsApp campaign' },
      { date: '2026-07-29', description: 'Purchased Kharif Master Guide' }
    ]
  },
  U002: {
    id: 'U002', name: 'Deepak Yadav', mobile: '9988776655', email: 'deepak@example.com', source: 'Organic', joined: '2026-06-18', purchases: 2, status: 'inactive', referralToken: 'REF-ORG-002',
    purchases: [
      { order: 'ORD-1002', book: 'Fasal Ka Doctor', amount: '₹449', date: '2026-07-31', status: 'failed' }
    ],
    activity: [
      { date: '2026-07-31', description: 'Checkout attempt failed' }
    ]
  },
  U003: {
    id: 'U003', name: 'Radha Singh', mobile: '9123456780', email: 'radha@example.com', source: 'WhatsApp', joined: '2026-07-24', purchases: 3, status: 'active', referralToken: 'REF-WH-003',
    purchases: [
      { order: 'ORD-1003', book: 'AI Website Guide', amount: '₹599', date: '2026-07-30', status: 'success' }
    ],
    activity: [
      { date: '2026-07-30', description: 'Purchased AI Website Guide' }
    ]
  }
};

export async function fetchShareEngineSummaryData() {
  await delay(200); // Simulate network latency
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    // 1. Total Shares
    const { count: totalShares, error: sharesError } = await db
      .from('share_logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'share');
    if (sharesError) console.error('Error fetching total shares:', sharesError.message);

    // 2. Total Clicks (from share_events)
    const { count: totalClicks, error: clicksError } = await db
      .from('share_logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'click');
    if (clicksError) console.error('Error fetching total clicks:', clicksError.message);
    
    // 3. Total Visitors (from share_events)
     const { count: totalVisitors, error: visitorsError } = await db
      .from('share_logs')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'visit');
    if (visitorsError) console.error('Error fetching total visitors:', visitorsError.message);

    // 4. Total Leads
    const { count: totalLeads, error: leadsError } = await db
      .from('interested_users')
      .select('id', { count: 'exact', head: true });
    if(leadsError) console.error('Error fetching total leads:', leadsError.message);

    // 5. Total Registrations, Active & Inactive Users
    const { count: totalRegistrations, error: regsError } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if(regsError) console.error('Error fetching total registrations:', regsError.message);

    const { count: totalActiveUsers, error: activeError } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    if(activeError) console.error('Error fetching active users:', activeError.message);

    const totalInactiveUsers = (totalRegistrations || 0) - (totalActiveUsers || 0);

    // 5b. Total App Installs (Safe query that works with or without app_installed column)
    let totalAppInstalls = 0;
    try {
      const { count: appInstallsCount, error: appError } = await db
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .or('registration_source.ilike.%pwa%,registration_source.ilike.%app%');
      if (!appError) {
        totalAppInstalls = appInstallsCount || 0;
      }
    } catch (e) {
      console.warn("Could not query app installs, falling back to 0:", e);
    }

    // 6. Total Purchases & Revenue
    const { data: purchases, error: purchasesError } = await db
      .from('purchases')
      .select('amount')
      ; // All records in 'purchases' are successful, so no status filter is needed.
    if(purchasesError) console.error('Error fetching purchases:', purchasesError.message);
    
    const totalPurchases = purchases ? purchases.length : 0;
    const totalRevenue = purchases ? purchases.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;

    // 7. Conversion Rate
    const conversionRate = totalVisitors > 0 ? ((totalPurchases / totalVisitors) * 100).toFixed(2) : 0;

    const summary = {
      totalShares: totalShares || 0,
      totalClicks: totalClicks || 0,
      totalVisitors: totalVisitors || 0,
      totalLeads: totalLeads || 0,
      totalRegistrations: totalRegistrations || 0,
      totalActiveUsers: totalActiveUsers || 0,
      totalInactiveUsers: totalInactiveUsers || 0,
      totalAppInstalls: totalAppInstalls || 0,
      totalPurchases: totalPurchases || 0,
      totalRevenue: totalRevenue || 0,
      conversionRate: `${conversionRate}%`,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Failed to fetch Share Engine Summary Data:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchCheckoutSummary(params = {}) {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const startDate = params.startDate || today;
        const endDate = params.endDate || tomorrow;

        const { data, error } = await db
            .from('checkout_logs')
            .select('status, profile_id, book_id')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString());

        if (error) throw error;

        const summary = { follow_up: 0, initiated: 0, dropped: 0, failed: 0, success: 0, conversion_rate: '0%' };
        if (!data || data.length === 0) return { success: true, data: summary };

        const successLogs = data.filter(log => log.status === 'success');
        const potentialFollowupLogs = data.filter(log => ['initiated', 'dropped', 'failed'].includes(log.status));
        summary.success = successLogs.length;

        if (potentialFollowupLogs.length === 0) {
            const totalUniqueAttempts = new Set(successLogs.map(l => l.profile_id)).size;
            summary.conversion_rate = totalUniqueAttempts > 0 ? ((summary.success / totalUniqueAttempts) * 100).toFixed(1) + '%' : '0%';
            return { success: true, data: summary };
        }

        const potentialFollowupProfileIds = [...new Set(potentialFollowupLogs.map(log => log.profile_id).filter(id => id))];
        const { data: successfulPurchases, error: purchaseError } = await db
            .from('purchases')
            .select('profile_id, book_id')
            .in('profile_id', potentialFollowupProfileIds)
            .or('payment_status.eq.success,payment_status.is.null');

        if (purchaseError) {
            console.error("Error fetching purchases for summary:", purchaseError);
            potentialFollowupLogs.forEach(log => summary[log.status]++);
            summary.follow_up = summary.initiated + summary.dropped + summary.failed;
            return { success: true, data: summary };
        }

        const successfulPurchaseSet = new Set((successfulPurchases || []).map(p => `${p.profile_id}_${p.book_id}`));

        // --- "Follow-up Required" KPI (Grouped Logic) ---
        const actualFollowupGroups = new Set();
        potentialFollowupLogs.forEach(log => {
            if (log.profile_id && !successfulPurchaseSet.has(`${log.profile_id}_${log.book_id}`)) {
                actualFollowupGroups.add(`${log.profile_id}_${log.book_id}`);
            }
        });
        summary.follow_up = actualFollowupGroups.size;

        // --- Individual KPIs (Ungrouped Logic, but filtered) ---
        const actualFollowupLogs_ungrouped = potentialFollowupLogs.filter(log => 
            !successfulPurchaseSet.has(`${log.profile_id}_${log.book_id}`)
        );
        actualFollowupLogs_ungrouped.forEach(log => {
            if (summary.hasOwnProperty(log.status)) summary[log.status]++;
        });

        // --- Final Conversion Rate ---
        const initiatingUserIds = new Set(potentialFollowupLogs.map(l => l.profile_id));
        const successfulUserIds = new Set(successLogs.map(l => l.profile_id));
        const totalUniqueAttempts = new Set([...initiatingUserIds, ...successfulUserIds]).size;
        summary.conversion_rate = totalUniqueAttempts > 0 ? ((summary.success / totalUniqueAttempts) * 100).toFixed(1) + '%' : '0%';

        return { success: true, data: summary };

    } catch (error) {
        console.error("Failed to fetch checkout summary:", error);
        return { success: false, data: null, error: error.message };
    }
}

export async function fetchTodaysBirthdays() {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        const { data: allProfiles, error } = await db
            .from('profiles')
            .select('full_name, mobile, dob')
            .not('dob', 'is', null);

        if (error) throw error;

        const today = new Date();
        const todayMonth = today.getMonth() + 1;
        const todayDay = today.getDate();

        const birthdayUsers = allProfiles.filter(profile => {
            const dob = new Date(profile.dob);
            return (dob.getMonth() + 1 === todayMonth) && (dob.getDate() === todayDay);
        });

        return { success: true, data: birthdayUsers };
    } catch (error) {
        return { success: false, data: [], error: error.message };
    }
}

export async function fetchDashboardData(params = {}) {
  await delay(250); // Simulate network latency
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const defaultEndDate = new Date();
    const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));

    const endDateForFilter = params.endDate ? new Date(params.endDate) : defaultEndDate;
    // To make the 'lt' operator inclusive of the end date, we set the time to the end of the day or go to the next day.
    const apiEndDate = new Date(endDateForFilter);
    apiEndDate.setHours(23, 59, 59, 999);

    const startDateForFilter = params.startDate ? new Date(params.startDate) : defaultStartDate;
    startDateForFilter.setHours(0, 0, 0, 0);

    // --- Fetch all required data in parallel ---
    const [
      shareSummaryRes,
      periodPurchasesRes,
      allProfilesRes,
      allPurchasesRes,
      booksRes,
      birthdaysRes,
      todaysCheckoutRes,
      recentPurchasesRes,
      recentProfilesRes,
      periodProfilesRes,
      periodSharesRes,
      periodClicksRes,
      periodVisitorsRes
    ] = await Promise.all([
      fetchShareEngineSummaryData(), // Reuse the existing summary function
      db.from('purchases').select('amount, profile_id').or('payment_status.eq.success,payment_status.is.null').gte('purchase_date', startDateForFilter.toISOString()).lt('purchase_date', apiEndDate.toISOString()),
      db.from('profiles').select('id, full_name, created_at, registration_source'), // This is for profiles, not books
      db.from('purchases').select('profile_id, book_id, amount, purchase_date, payment_status').or('payment_status.eq.success,payment_status.is.null').gte('purchase_date', startDateForFilter.toISOString()).lt('purchase_date', apiEndDate.toISOString()),
      db.from('books').select('id, title'), // FIX: Removed 'name' as it may not exist.
      fetchTodaysBirthdays(),
      fetchCheckoutSummary(), // MODIFIED: Call with no params to get today's data by default
      db.from('purchases').select('profile_id, book_id, purchase_date, payment_status').order('purchase_date', { ascending: false }).limit(5),
      db.from('profiles').select('id, full_name, created_at, registration_source').order('created_at', { ascending: false }).limit(5),
      // New query for period-specific user counts
      db.from('profiles').select('id, is_active').gte('created_at', startDateForFilter.toISOString()).lt('created_at', apiEndDate.toISOString()),
      // Period-specific share engine stats
      db.from('share_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'share').gte('created_at', startDateForFilter.toISOString()).lt('created_at', apiEndDate.toISOString()),
      db.from('share_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'click').gte('created_at', startDateForFilter.toISOString()).lt('created_at', apiEndDate.toISOString()),
      db.from('share_logs').select('id', { count: 'exact', head: true }).eq('event_type', 'visit').gte('created_at', startDateForFilter.toISOString()).lt('created_at', apiEndDate.toISOString())
    ]);

    // --- Process Data ---
    const shareSummary = shareSummaryRes.success ? shareSummaryRes.data : {};
    const periodPurchases = periodPurchasesRes.data || [];
    const monthlyRevenue = periodPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPurchasesInPeriod = periodPurchases.length;

    // Process period-specific user counts
    const periodProfiles = periodProfilesRes.data || [];
    const totalUsersInPeriod = periodProfiles.length;
    const activeUsersInPeriod = periodProfiles.filter(p => p.is_active).length;
    const inactiveUsersInPeriod = totalUsersInPeriod - activeUsersInPeriod;

    // Process period-specific share stats
    const periodShares = periodSharesRes.count || 0;
    const periodClicks = periodClicksRes.count || 0;
    const periodVisitors = periodVisitorsRes.count || 0;
    const periodConversionRate = periodVisitors > 0 ? ((totalPurchasesInPeriod / periodVisitors) * 100).toFixed(2) : '0.00';

    const allProfiles = allProfilesRes.data || [];
    const allPurchases = allPurchasesRes.data || [];
    const todaysBirthdays = birthdaysRes.success ? birthdaysRes.data : [];
    const todaysCheckoutSummary = todaysCheckoutRes.success ? todaysCheckoutRes.data : { follow_up: 0, initiated: 0, dropped: 0, failed: 0, success: 0, conversion_rate: '0%' };

    // Business KPIs
    const businessKpis = [
      { label: 'Revenue', value: `₹${monthlyRevenue.toLocaleString('en-IN')}` },
      { label: 'App Installs', value: (shareSummary.totalAppInstalls || 0).toLocaleString('en-IN') },
      { label: 'New Users', value: totalUsersInPeriod.toLocaleString('en-IN') },
      { label: 'Active Users', value: activeUsersInPeriod.toLocaleString('en-IN') },
      { label: 'Inactive Users', value: inactiveUsersInPeriod.toLocaleString('en-IN') },
      { label: 'Conversion Rate', value: `${periodConversionRate}%` },
      { label: 'Total Shares', value: periodShares.toLocaleString('en-IN') },
      { label: 'Total Clicks', value: periodClicks.toLocaleString('en-IN') }
    ];

    // Lead Sources
    const leadSourcesMap = allProfiles.reduce((acc, profile) => {
      const source = profile.registration_source || 'Direct';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});
    const totalLeads = Object.values(leadSourcesMap).reduce((sum, count) => sum + count, 0);
    const leadSources = Object.entries(leadSourcesMap).map(([source, value]) => ({
      source,
      value: totalLeads > 0 ? Math.round((value / totalLeads) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    // Customer Journey
    const purchasingUserIds = new Set(allPurchases.map(p => p.profile_id));
    const repeatBuyerIds = new Set();
    const purchaseCounts = {};
    allPurchases.forEach(p => {
        purchaseCounts[p.profile_id] = (purchaseCounts[p.profile_id] || 0) + 1;
        if (purchaseCounts[p.profile_id] > 1) {
            repeatBuyerIds.add(p.profile_id);
        }
    });

    const customerJourney = [
        { stage: 'Registered Users', count: allProfiles.length },
        { stage: 'Converted (1+ Purchase)', count: purchasingUserIds.size },
        { stage: 'Repeat Buyers (2+ Purchases)', count: repeatBuyerIds.size }
    ];

    // Book Sales
    const booksMap = (booksRes.data || []).reduce((acc, book) => {
      acc[book.id] = book.title; // FIX: Only 'title' is guaranteed to be selected.
      return acc;
    }, {});
    const salesMap = allPurchases.reduce((acc, p) => {
      const bookTitle = booksMap[p.book_id] || `Book ID: ${p.book_id}`;
      if (!acc[bookTitle]) {
        acc[bookTitle] = { name: bookTitle, sold: 0, revenue: 0 };
      }
      acc[bookTitle].sold++;
      acc[bookTitle].revenue += (p.amount || 0);
      return acc;
    }, {});
    const bookSales = Object.values(salesMap).sort((a, b) => b.sold - a.sold).slice(0, 5).map(b => ({
      ...b,
      revenue: `₹${b.revenue.toLocaleString('en-IN')}`
    }));

    // Recent Activity
    const profilesMap = allProfiles.reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {});
    const recentActivity = [];
    (recentPurchasesRes.data || []).forEach(p => recentActivity.push({
      date: new Date(p.purchase_date).toISOString(),
      event: `Payment ${p.payment_status} for ${booksMap[p.book_id] || p.book_id}`,
      user: profilesMap[p.profile_id] || `User ID ${p.profile_id}`
    }));
    (recentProfilesRes.data || []).forEach(u => recentActivity.push({
      date: new Date(u.created_at).toISOString(),
      event: `New user registered via ${u.registration_source || 'Direct'}`,
      user: u.full_name || `User ID ${u.id}`
    }));
    const sortedActivity = recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10).map(a => ({
      ...a,
      date: new Date(a.date).toLocaleDateString('en-GB')
    }));

    return {
      success: true,
      data: {
        shareSummary,
        businessKpis,
        leadSources,
        customerJourney,
        bookSales,
        todaysBirthdays,
        todaysCheckoutSummary,
        recentActivity: sortedActivity
      }
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, data: null, error: error.message };
  }
}

 
export async function fetchPurchaseFilterOptions() {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        const [booksRes, sourcesRes] = await Promise.all([
            db.from('purchases').select('book_id'),
            db.from('profiles').select('registration_source')
        ]);

        const distinctBooks = [...new Set((booksRes.data || []).map(p => p.book_id).filter(Boolean))];
        const distinctSources = [...new Set((sourcesRes.data || []).map(p => p.registration_source).filter(Boolean))];

        return { success: true, data: { books: distinctBooks, sources: distinctSources } };
    } catch (error) {
        console.error('Failed to fetch purchase filter options:', error);
        return { success: false, data: { books: [], sources: [] }, error: error.message };
    }
}

export async function fetchAllBooks() {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");
        // The 'books' table is empty. Fetch distinct book_ids from checkout_logs instead.
        const { data, error } = await db.from('checkout_logs').select('book_id');
        if (error) throw error;

        // Get unique, non-empty book_ids
        const distinctBookIds = [...new Set(data.map(log => log.book_id).filter(id => id))];
        
        // Format them for the filter dropdown which expects {id, name, title}
        const bookOptions = distinctBookIds.map(id => ({
            id: id,
            name: id, // Use the ID itself as the name
            title: id
        }));

        return { success: true, data: bookOptions };
    } catch (error) {
        console.error('Failed to fetch distinct book IDs for filter:', error);
        return { success: false, data: [], error: error.message };
    }
}

export async function fetchCheckoutLogs(params = {}) {
  await delay(150); // Simulate network latency, consistent with other functions
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");
    
    // This query assumes foreign key relationships are set up in Supabase:
    // - checkout_logs.profile_id -> profiles.id
    // - checkout_logs.book_id -> books.id
    let queryBuilder = db
      .from('checkout_logs')
      .select(`
        id,
        created_at,
        status,
        book_id,
        profile_id
      `);
    
    // Date Filter
    if (params.startDate && params.endDate) {
        queryBuilder = queryBuilder.gte('created_at', params.startDate.toISOString());
        queryBuilder = queryBuilder.lt('created_at', params.endDate.toISOString());
    }

    // Status Filter
    const isFollowup = params.status === 'followup';
    if (params.status && params.status !== 'all') {
        if (isFollowup) {
            // For followup, we fetch all non-success logs first, then filter out those who have purchased.
            queryBuilder = queryBuilder.in('status', ['initiated', 'dropped', 'failed']);
        } else {
            queryBuilder = queryBuilder.eq('status', params.status);
        }
    }

    // Book Filter
    if (params.bookId && params.bookId !== 'all') {
        queryBuilder = queryBuilder.eq('book_id', params.bookId);
    }

    queryBuilder = queryBuilder.order('created_at', { ascending: false }).limit(200); // Fetch more for client-side search

    let { data: logs, error: logsError } = await queryBuilder;
    if (logsError) throw logsError;
    if (!logs || logs.length === 0) return { success: true, data: [] };

    // If filtering for 'followup', we need to group and then remove users who have already purchased.
    if (isFollowup && logs.length > 0) {
        // NEW: Group logs by user and book to remove duplicates and combine statuses.
        const groupedLogsMap = new Map();
        for (const log of logs) {
            // Only process logs with a profile_id
            if (!log.profile_id) continue;

            const key = `${log.profile_id}_${log.book_id}`;
            if (!groupedLogsMap.has(key)) {
                groupedLogsMap.set(key, {
                    ...log, // Keep all fields from the first log
                    statuses: new Set([log.status]),
                });
            } else {
                groupedLogsMap.get(key).statuses.add(log.status);
            }
        }
        
        // The original `logs` array is replaced by the grouped and de-duplicated logs.
        logs = Array.from(groupedLogsMap.values());

        // 1. Get unique profile_ids from the potential follow-up logs.
        const potentialFollowupProfileIds = [...new Set(logs.map(log => log.profile_id).filter(id => id))];

        // 2. Fetch all successful purchases for these specific users.
        const { data: successfulPurchases, error: purchaseError } = await db
            .from('purchases')
            .select('profile_id, book_id')
            .in('profile_id', potentialFollowupProfileIds)
            .or('payment_status.eq.success,payment_status.is.null');
        
        if (purchaseError) {
            console.error("Error fetching successful purchases for followup filter:", purchaseError);
        } else if (successfulPurchases && successfulPurchases.length > 0) {
            // 3. Create a lookup Set for efficient filtering. Key: "profileId_bookId"
            const successfulPurchaseSet = new Set(
                successfulPurchases.map(p => `${p.profile_id}_${p.book_id}`)
            );

            // 4. Filter out logs where the user has successfully purchased that specific book.
            logs = logs.filter(log => !successfulPurchaseSet.has(`${log.profile_id}_${log.book_id}`));
        }
    }
    if (!logs || logs.length === 0) return { success: true, data: [] };

    // 2. Collect unique IDs to fetch related data without joins
    const profileIds = [...new Set(logs.map(log => log.profile_id).filter(id => id))];

    // 3. Fetch related profiles and books in parallel
    const [profilesRes] = await Promise.all([
        profileIds.length > 0 ? db.from('profiles').select('id, full_name, mobile').in('id', profileIds) : Promise.resolve({ data: [] }),
    ]);

    if (profilesRes.error) console.error('Error fetching profiles for checkout logs:', profilesRes.error);

    // 4. Create lookup maps for efficient data merging
    const profilesMap = (profilesRes.data || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

    // 5. Map logs and enrich with profile/book data
    let mappedData = logs.map(log => {
      const profile = profilesMap[log.profile_id] || {};
      
      // Format the status for display
      let displayStatus;
      if (isFollowup && log.statuses instanceof Set) {
          const statusMap = { initiated: 'IN', dropped: 'DR', failed: 'F' };
          const order = ['initiated', 'dropped', 'failed'];
          displayStatus = order
              .filter(s => log.statuses.has(s))
              .map(s => statusMap[s])
              .join('/');
      } else {
          displayStatus = log.status;
      }

      return {
      id: log.id,
      created_at: log.created_at,
      status: displayStatus,
      book_id: log.book_id,
      profile_id: log.profile_id,
      customer_name: profile.full_name || 'N/A',
      customer_mobile: profile.mobile || 'N/A',
      book_name: log.book_id || 'Unknown Book'
      };
    });

    // 6. Apply search filter on the client side after data is merged
    if (params.search) {
        const searchTerm = params.search.toLowerCase();
        mappedData = mappedData.filter(log => 
            log.customer_name.toLowerCase().includes(searchTerm) ||
            log.customer_mobile.toLowerCase().includes(searchTerm)
        );
    }

    return { success: true, data: mappedData.slice(0, 100) }; // Return final page size
  } catch (error) {
    console.error('Failed to fetch checkout logs:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchUsers(params = {}) {
  await delay(100);
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    // Step 1: Fetch all profiles with filtering (Safe standard columns + Share IDs)
    let queryBuilder = db.from('profiles').select('id, full_name, mobile, email, registration_source, is_active, created_at, share_id, referral_code, referral_mobile, referred_by');

    if (params.status && params.status !== 'all') {
      if (params.status === 'installed') {
        queryBuilder = queryBuilder.or('registration_source.ilike.%pwa%,registration_source.ilike.%app%');
      } else if (params.status === 'web') {
        queryBuilder = queryBuilder.not('registration_source', 'ilike', '%pwa%').not('registration_source', 'ilike', '%app%');
      } else {
        queryBuilder = queryBuilder.eq('is_active', params.status === 'active');
      }
    }

    if (params.query) {
      const rawQ = String(params.query || '').trim();
      if (rawQ) {
        const q = `%${rawQ}%`;
        queryBuilder = queryBuilder.or(`full_name.ilike.${q},mobile.ilike.${q},email.ilike.${q},share_id.ilike.${q},referral_code.ilike.${q}`);
      }
    }
    
    if (params.registrationDate) {
        const startDate = new Date(params.registrationDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        queryBuilder = queryBuilder.gte('created_at', startDate.toISOString());
        queryBuilder = queryBuilder.lt('created_at', endDate.toISOString());
    }
    
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    const { data: profiles, error: profilesError } = await queryBuilder;
    if (profilesError) console.error("fetchUsers query error:", profilesError.message);
    if (!profiles || profiles.length === 0) return { success: true, data: [] };

    const profileIds = profiles.map(p => p.id).filter(Boolean);
    const shareIds = profiles.map(p => p.share_id || p.referral_code).filter(Boolean);

    // Step 2: Fetch all necessary aggregated data in parallel
    const [purchasesRes, shareLogsRes, allProfileRelationsRes, downloadLogsRes] = await Promise.all([
        db.from('purchases').select('profile_id, amount').or('payment_status.eq.success,payment_status.is.null'),
        db.from('share_logs').select('share_token, event_type').in('share_token', shareIds),
        db.from('profiles').select('id, referred_by'), // Fetch all referral relationships
        db.from('download_logs').select('profile_id').in('profile_id', profileIds)
    ]);

    if (purchasesRes.error) console.error('Error fetching purchases for user aggregation:', purchasesRes.error.message);
    if (shareLogsRes.error) console.error('Error fetching share logs for user aggregation:', shareLogsRes.error.message);
    if (allProfileRelationsRes.error) console.error('Error fetching profile relations:', allProfileRelationsRes.error.message);
    if (downloadLogsRes.error) console.error('Error fetching download logs for user aggregation:', downloadLogsRes.error.message);

    // Data is already filtered for success by the query.
    const allPurchases = purchasesRes.data || [];
    const allShareLogs = shareLogsRes.data || [];
    const allProfileRelations = allProfileRelationsRes.data || [];
    const allDownloads = downloadLogsRes.data || [];

    // Step 3: Create lookup maps from the fetched data
    // Use all profile relations to build a complete map, not just filtered profiles
    const directReferralMap = allProfileRelations.reduce((acc, profile) => {
        if (profile.referred_by) {
            if (!acc[profile.referred_by]) acc[profile.referred_by] = [];
            acc[profile.referred_by].push(profile.id);
        }
        return acc;
    }, {});
    const directReferralCounts = Object.fromEntries(Object.entries(directReferralMap).map(([key, value]) => [key, value.length]));

    const purchaseSummary = (allPurchases || []).reduce((acc, purchase) => {
        const profileId = purchase.profile_id;
        if (!profileId) return acc;
        if (!acc[profileId]) acc[profileId] = { totalPurchases: 0, totalSpent: 0 };
        acc[profileId].totalPurchases += 1;
        acc[profileId].totalSpent += purchase.amount || 0;
        return acc;
    }, {});

    const shareStatsMap = allShareLogs.reduce((acc, log) => {
        const shareToken = log.share_token;
        if (!shareToken) return acc;
        if (!acc[shareToken]) acc[shareToken] = { shares: 0, clicks: 0, visitors: 0 };
        if (log.event_type === 'share') acc[shareToken].shares++;
        if (log.event_type === 'click') acc[shareToken].clicks++;
        if (log.event_type === 'visit') acc[shareToken].visitors++;
        return acc;
    }, {});

    const downloadCounts = allDownloads.reduce((acc, log) => {
        const profileId = log.profile_id;
        if (!profileId) return acc;
        acc[profileId] = (acc[profileId] || 0) + 1;
        return acc;
    }, {});

    const directPurchaseCounts = {};
    for (const referrerId in directReferralMap) {
        directPurchaseCounts[referrerId] = directReferralMap[referrerId].reduce((sum, referredId) => {
            const referredUserStats = purchaseSummary[referredId];
            return sum + (referredUserStats ? referredUserStats.totalPurchases : 0);
        }, 0);
    }

    // Step 4: Map profiles and merge with purchase summary
    const mappedData = profiles.map(user => {
        const ownPurchases = purchaseSummary[user.id] || { totalPurchases: 0, totalSpent: 0 };
        const currentShareId = user.share_id || user.referral_code || 'N/A';
        const shareStats = shareStatsMap[currentShareId] || { shares: 0, clicks: 0, visitors: 0 };
        return {
        id: user.id,
        name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        source: user.registration_source,
        status: user.is_active ? 'active' : 'inactive',
        shareId: currentShareId,
        directReferrals: directReferralCounts[user.id] || 0,
        totalShares: shareStats.shares,
        totalClicks: shareStats.clicks,
        totalVisitors: shareStats.visitors,
        totalDirectPurchases: directPurchaseCounts[user.id] || 0,
        totalPurchases: ownPurchases.totalPurchases,
        totalSpent: ownPurchases.totalSpent,
        totalDownloads: downloadCounts[user.id] || 0,
        downloadLimit: (ownPurchases.totalPurchases || 0) * 3,
        appInstalled: user.app_installed === true || String(user.registration_source || '').toLowerCase().includes('pwa') || String(user.registration_source || '').toLowerCase().includes('app'),
        appInstalledAt: user.app_installed_at ? new Date(user.app_installed_at).toLocaleDateString('en-GB') : null
        };
    });

    return { success: true, data: mappedData };

  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchPurchases(params = {}) {
    await delay(150);
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        // 1. Fetch base purchases
        let queryBuilder = db.from('purchases')
            .select('payment_id, amount, purchase_date, payment_status, profile_id, book_id')
            .order('purchase_date', { ascending: false });

        // Server-side filters
        if (params.status && params.status !== 'all') {
            queryBuilder = queryBuilder.eq('payment_status', params.status);
        }
        if (params.startDate && params.endDate) {
            queryBuilder = queryBuilder.gte('purchase_date', params.startDate.toISOString());
            queryBuilder = queryBuilder.lt('purchase_date', params.endDate.toISOString());
        }
        if (params.bookId && params.bookId !== 'all') {
            queryBuilder = queryBuilder.eq('book_id', params.bookId);
        }

        const { data: purchases, error: purchasesError } = await queryBuilder;
        if (purchasesError) throw purchasesError;
        if (!purchases || purchases.length === 0) return { success: true, data: [] };

        // 2. Collect related IDs
        const profileIds = [...new Set(purchases.map(p => p.profile_id).filter(id => id))];
        const bookIds = [...new Set(purchases.map(p => p.book_id).filter(id => id))];

        // 3. Fetch related data in parallel
        const [profilesRes, booksRes] = await Promise.all([
            profileIds.length > 0 ? db.from('profiles').select('id, full_name, registration_source').in('id', profileIds) : Promise.resolve({ data: [] }),
            bookIds.length > 0 ? db.from('books').select('id, title').in('id', bookIds) : Promise.resolve({ data: [] }) // FIX: Removed 'name' column
        ]);

        // 4. Create lookup maps for efficiency
        const profilesMap = (profilesRes.data || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        const booksMap = (booksRes.data || []).reduce((acc, b) => { acc[b.id] = b; return acc; }, {});

        // 5. Map and enrich the data, matching the format expected by the UI
        let mappedData = purchases.map(p => {
            const profile = profilesMap[p.profile_id] || {};
            const book = booksMap[p.book_id] || {};
            return {
                order: p.payment_id || 'N/A',
                customer: profile.full_name || 'Unknown User',
                book: book.title || p.book_id || 'Unknown Book', // FIX: Use only 'title'
                amount: `₹${p.amount || 0}`,
                source: profile.registration_source || 'Direct',
                status: p.payment_status || 'success',
                date: new Date(p.purchase_date).toLocaleDateString('en-GB')
            };
        });

        // 6. Apply client-side filters
        if (params.source && params.source !== 'all') {
            mappedData = mappedData.filter(item => item.source === params.source);
        }

        if (params.query) {
            const searchTerm = params.query.toLowerCase();
            mappedData = mappedData.filter(item =>
                item.order.toLowerCase().includes(searchTerm) ||
                item.customer.toLowerCase().includes(searchTerm) ||
                item.book.toLowerCase().includes(searchTerm)
            );
        }

        return { success: true, data: mappedData };
    } catch (error) {
        console.error('Failed to fetch real purchases:', error);
        return { success: false, data: [], error: error.message };
    }
}

export async function fetchDownloads() {
    await delay(150);
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        // Fetch all download logs
        const { data: logs, error } = await db
            .from('download_logs')
            .select('book_id, profile_id, downloaded_at')
            .order('downloaded_at', { ascending: false });

        if (error) throw error;

        if (!logs || logs.length === 0) {
            return { success: true, data: [] };
        }

        // Aggregate the data in JavaScript
        const summary = logs.reduce((acc, log) => {
            const bookId = log.book_id || 'Unknown';
            if (!acc[bookId]) {
                acc[bookId] = {
                    book: bookId,
                    downloads: 0,
                    usersSet: new Set(),
                    lastDownloaded: new Date(0)
                };
            }
            acc[bookId].downloads++;
            acc[bookId].usersSet.add(log.profile_id);
            const downloadDate = new Date(log.downloaded_at);
            if (downloadDate > acc[bookId].lastDownloaded) {
                acc[bookId].lastDownloaded = downloadDate;
            }
            return acc;
        }, {});

        // Format the aggregated data for the UI
        const formattedData = Object.values(summary).map(item => ({
            book: item.book,
            downloads: item.downloads,
            users: item.usersSet.size,
            lastDownloaded: item.lastDownloaded.toISOString() === new Date(0).toISOString() 
                ? 'N/A' 
                : item.lastDownloaded.toLocaleDateString('en-GB')
        }));

        return { success: true, data: formattedData };

    } catch (error) {
        console.error('Failed to fetch real download data:', error);
        return { success: false, data: [], error: error.message };
    }
}

export async function fetchUserDetails(userId) {
  await delay(120);
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;
    if (!profile) return { success: false, data: null };

    // Fetch total download count for the user
    const { count: downloadCount, error: downloadError } = await db
        .from('download_logs')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', userId);
    if (downloadError) console.error("Error fetching download count:", downloadError.message);

    // Fetch parent referrer's profile
    let referredByProfile = null;
    if (profile.referred_by) {
        const { data: parentProfile, error: parentError } = await db
            .from('profiles')
            .select('id, full_name')
            .eq('id', profile.referred_by)
            .single();
        if (parentError) console.error("Error fetching referrer profile:", parentError.message);
        else referredByProfile = parentProfile;
    }

    // Fetch direct referrals (children) and their purchase counts
    const { data: directReferrals, error: referralsError } = await db
        .from('profiles')
        .select('id, full_name, mobile')
        .eq('referred_by', userId);
    
    if (referralsError) console.error("Error fetching direct referrals:", referralsError.message);

    let directReferralsList = [];
    if (directReferrals && directReferrals.length > 0) {
        const referredUserIds = directReferrals.map(r => r.id);

        const { data: referralPurchases, error: refPurchaseError } = await db
            .from('purchases')
            .select('profile_id') // only need profile_id to count
            .or('payment_status.eq.success,payment_status.is.null')
            .in('profile_id', referredUserIds);
        
        if (refPurchaseError) console.error("Error fetching referral purchases:", refPurchaseError.message);

        const referralPurchaseSummary = (referralPurchases || []).reduce((acc, purchase) => {
            const profileId = purchase.profile_id;
            acc[profileId] = (acc[profileId] || 0) + 1;
            return acc;
        }, {});

        directReferralsList = directReferrals.map(ref => ({
            id: ref.id,
            name: ref.full_name,
            mobile: ref.mobile,
            totalPurchases: referralPurchaseSummary[ref.id] || 0
        }));
    }

    const { data: purchases, error: purchasesError } = await db
      .from('purchases')
      .select('id, order_id, payment_id, book_id, amount, purchase_date, payment_status')
      .eq('profile_id', userId)
      .order('purchase_date', { ascending: false });
    if(purchasesError) console.error("Error fetching purchases for user:", purchasesError.message);

    // Calculate total download limit based on successful purchases
    const successfulPurchases = (purchases || []).filter(p => p.payment_status === 'success' || p.payment_status === null);

    // Fetch book names for purchases
    const bookIds = (purchases || []).map(p => p.book_id);
    let booksMap = {};
    if (bookIds.length > 0) {
        const { data: booksData, error: booksError } = await db
            .from('books') // Assuming a 'books' table or similar for book titles
            .select('id, title') // FIX: Removed 'name' as it does not exist in the schema.
            .in('id', [...new Set(bookIds)]); // Use Set to get unique book IDs
        if (booksError) console.error("Error fetching book titles:", booksError.message);
        booksMap = (booksData || []).reduce((acc, book) => {
            acc[book.id] = book.title; // FIX: Only 'title' is guaranteed to be selected.
            return acc;
        }, {});
    }

    const activity = (purchases || []).map(p => ({
        date: new Date(p.purchase_date).toLocaleDateString(),
        description: `Purchased ${booksMap[p.book_id] || `Book ID ${p.book_id}`} (Order: ${p.order_id || p.payment_id || 'N/A'})`
    }));
    activity.push({
        date: new Date(profile.created_at).toLocaleDateString(),
        description: `User registered via ${profile.registration_source || 'direct'}`
    });

    const createdDateObj = profile.created_at ? new Date(profile.created_at) : null;
    const joinedDateFormatted = createdDateObj ? createdDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    const joinedTimeFormatted = createdDateObj ? createdDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A';

    const userDetails = {
      id: profile.id,
      name: profile.full_name,
      mobile: profile.mobile,
      email: profile.email,
      source: profile.registration_source,
      joined: joinedDateFormatted,
      joinedDate: joinedDateFormatted,
      joinedTime: joinedTimeFormatted,
      status: profile.is_active ? 'active' : 'inactive',
      appInstalled: profile.app_installed === true || String(profile.registration_source || '').toLowerCase().includes('pwa') || String(profile.registration_source || '').toLowerCase().includes('app'),
      appInstalledAt: profile.app_installed_at ? new Date(profile.app_installed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : null,
      referralToken: profile.referral_code || 'N/A',
      referredBy: referredByProfile,
      directReferrals: directReferralsList,
      totalDownloads: downloadCount || 0,
      downloadLimit: successfulPurchases.length * 3, // Assuming 3 downloads per purchase
      purchases: (purchases || []).map(p => ({
          id: p.id,
          order: p.order_id || p.payment_id || 'N/A',
          book: booksMap[p.book_id] || p.book_id, // Use book name if available
          amount: `₹${p.amount}`,
          date: new Date(p.purchase_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: p.payment_status || 'success'
      })),
      activity: activity.sort((a,b) => new Date(b.date) - new Date(a.date))
    };

    return { success: true, data: userDetails };

  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchAvailableBooks() {
  try {
    let books = [];
    try {
      const res = await fetch('../data/books.json');
      if (res.ok) {
        const json = await res.json();
        books = json.books || json;
      }
    } catch (e) {
      try {
        const res2 = await fetch('/data/books.json');
        if (res2.ok) {
          const json2 = await res2.json();
          books = json2.books || json2;
        }
      } catch (e2) {}
    }

    if (books && books.length > 0) {
      return {
        success: true,
        data: books.map(b => ({
          id: b.id || b.book_id,
          title: b.heading || b.name || b.shortTitle || b.title || (b.id || b.book_id),
          offerPrice: Number(b.offerPrice || b.offer_price || b.mrp || 99)
        }))
      };
    }

    const db = window.dbClient;
    if (db) {
      const { data } = await db.from('books').select('id, name, offer_price, heading');
      if (data && data.length > 0) {
        return {
          success: true,
          data: data.map(b => ({ id: b.id, title: b.name || b.heading || b.id, offerPrice: b.offer_price || 99 }))
        };
      }
    }

    // Default Fallback Catalog
    return {
      success: true,
      data: [
        { id: 'BK001', title: 'खरीफ फसल मास्टर गाइड 2026', offerPrice: 99 },
        { id: 'BK002', title: 'खेती का डॉक्टर (Pocket Doctor)', offerPrice: 99 },
        { id: 'SUB001', title: '👑 Aarogyam Pro VIP सदस्यता (1 Year All-Access)', offerPrice: 1999 },
        { id: 'BK003', title: 'धान मास्टर गाइड', offerPrice: 99 },
        { id: 'BK004', title: 'सोयाबीन मास्टर गाइड', offerPrice: 99 },
        { id: 'BK005', title: 'मक्का मास्टर गाइड', offerPrice: 99 },
        { id: 'BK006', title: 'गेहूं मास्टर गाइड', offerPrice: 99 },
        { id: 'BK007', title: 'जैविक खेती गाइड', offerPrice: 99 },
        { id: 'BK008', title: 'सब्जी खेती गाइड', offerPrice: 99 },
        { id: 'BK009', title: 'फूल खेती गाइड', offerPrice: 99 },
        { id: 'BK010', title: 'पॉलीहाउस व नेटहाउस गाइड', offerPrice: 99 },
        { id: 'BK011', title: 'अनाज भंडारण गाइड', offerPrice: 99 },
        { id: 'BK012', title: 'चावल प्रोसेसिंग गाइड', offerPrice: 99 },
        { id: 'BK013', title: 'AI वेबसाइट निर्माण मास्टर गाइड', offerPrice: 99 }
      ]
    };
  } catch (error) {
    console.error('Failed to fetch available books:', error);
    return {
      success: true,
      data: [
        { id: 'BK001', title: 'खरीफ फसल मास्टर गाइड 2026', offerPrice: 99 },
        { id: 'BK002', title: 'खेती का डॉक्टर (Pocket Doctor)', offerPrice: 99 },
        { id: 'SUB001', title: '👑 Aarogyam Pro VIP सदस्यता (1 Year All-Access)', offerPrice: 1999 }
      ]
    };
  }
}

export async function addManualPurchase(params) {
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const profileId = params.profileId;
    const paymentId = (params.paymentId || '').trim();
    const bookId = (params.bookId || '').trim();
    const amount = Number(params.amount);
    const purchaseDate = params.purchaseDate;

    if (!profileId) throw new Error("User ID is required.");
    if (!paymentId) throw new Error("Payment ID is required.");
    if (!bookId) throw new Error("Book ID is required.");
    if (isNaN(amount) || amount < 0) throw new Error("Valid numeric Amount is required.");
    if (!purchaseDate) throw new Error("Purchase Date is required.");

    const timestamp = new Date(purchaseDate).toISOString();
    const generatedInvoiceNo = "INV_" + Date.now();
    const generatedOrderId = "ORD_" + Date.now();

    const purchasePayload = {
      profile_id: profileId,
      book_id: bookId,
      payment_id: paymentId,
      amount: amount,
      order_id: generatedOrderId,
      invoice_number: generatedInvoiceNo,
      download_count: 0,
      payment_status: 'success',
      purchase_date: timestamp
    };

    // 1. Insert into purchases table
    const { data: insertedData, error: insertError } = await db
      .from('purchases')
      .insert([purchasePayload])
      .select();

    if (insertError) throw insertError;

    // 2. Set user status to active (is_active: true) in profiles
    const { error: profileError } = await db
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profileId);

    if (profileError) {
      console.warn("Failed to activate user in profiles table:", profileError.message);
    }

    // 3. Mark user active in localStorage override
    localStorage.setItem(`UCAS_USER_STATUS_${profileId}`, 'ACTIVE');

    return { success: true, data: insertedData };
  } catch (error) {
    console.error('Failed to add manual purchase:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePurchase(purchaseId, profileId) {
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    if (!purchaseId) throw new Error("Purchase ID is required.");

    // 1. Delete purchase record from purchases table
    let deleteQuery = db.from('purchases').delete();
    if (typeof purchaseId === 'number' || (typeof purchaseId === 'string' && /^\d+$/.test(purchaseId))) {
      deleteQuery = deleteQuery.eq('id', purchaseId);
    } else {
      deleteQuery = deleteQuery.or(`id.eq.${purchaseId},order_id.eq.${purchaseId},payment_id.eq.${purchaseId}`);
    }

    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    // 2. Synchronize user active/inactive status in profiles
    if (profileId) {
      const { data: remainingPurchases, error: checkError } = await db
        .from('purchases')
        .select('id')
        .eq('profile_id', profileId)
        .or('payment_status.eq.success,payment_status.is.null');

      if (checkError) {
        console.warn("Failed to check remaining purchases:", checkError.message);
      } else {
        const hasSuccessPurchases = remainingPurchases && remainingPurchases.length > 0;
        await db
          .from('profiles')
          .update({ is_active: hasSuccessPurchases })
          .eq('id', profileId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete purchase:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUserStatus(userId, isActive) {
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const { data, error } = await db
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Failed to update user status:', error);
    return { success: false, error: error.message };
  }
}

export async function batchUpdateUserStatuses() {
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    // Step 1: Get all profile IDs and their current status
    const { data: profiles, error: profilesError } = await db.from('profiles').select('id, is_active');
    if (profilesError) throw profilesError;

    // Step 2: Get all unique profile IDs from successful purchases
    const { data: purchases, error: purchasesError } = await db.from('purchases').select('profile_id').or('payment_status.eq.success,payment_status.is.null');
    if (purchasesError) throw purchasesError;

    const purchasingUserIds = new Set((purchases || []).map(p => p.profile_id).filter(Boolean));

    // Step 3: Determine which users need their status changed
    const idsToActivate = [];
    const idsToDeactivate = [];

    for (const profile of profiles) {
        const hasPurchases = purchasingUserIds.has(profile.id);
        const currentlyActive = profile.is_active;

        if (hasPurchases && !currentlyActive) {
            idsToActivate.push(profile.id);
        } else if (!hasPurchases && currentlyActive) {
            idsToDeactivate.push(profile.id);
        }
    }

    // Step 4: Perform bulk updates in parallel if needed
    const updatePromises = [];
    if (idsToActivate.length > 0) {
        updatePromises.push(db.from('profiles').update({ is_active: true }).in('id', idsToActivate));
    }
    if (idsToDeactivate.length > 0) {
        updatePromises.push(db.from('profiles').update({ is_active: false }).in('id', idsToDeactivate));
    }

    const results = await Promise.all(updatePromises);
    results.forEach(res => { if (res.error) console.error('A batch update failed:', res.error); });

    return { success: true, activated: idsToActivate.length, deactivated: idsToDeactivate.length };

  } catch (error) {
    console.error('Failed to run batch user status update:', error);
    return { success: false, error: error.message, activated: 0, deactivated: 0 };
  }
}

export async function fetchSalesReport(params = {}) {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        let purchasesQuery = db.from('purchases').select('purchase_date, amount, book_id').or('payment_status.eq.success,payment_status.is.null');
        let profilesQuery = db.from('profiles').select('created_at');

        if (params.startDate && params.endDate) {
            purchasesQuery = purchasesQuery.gte('purchase_date', params.startDate).lt('purchase_date', params.endDate);
            profilesQuery = profilesQuery.gte('created_at', params.startDate).lt('created_at', params.endDate);
        }

        const [purchasesRes, profilesRes, booksRes] = await Promise.all([
            purchasesQuery,
            profilesQuery,
            db.from('books').select('id, title')
        ]);

        if (purchasesRes.error) throw purchasesRes.error;
        if (profilesRes.error) throw profilesRes.error;

        const booksMap = (booksRes.data || []).reduce((acc, book) => {
            acc[book.id] = book.title;
            return acc;
        }, {});

        const salesByDay = (purchasesRes.data || []).reduce((acc, p) => {
            const date = new Date(p.purchase_date).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, orders: 0, revenue: 0, newUsers: 0 };
            }
            acc[date].orders++;
            acc[date].revenue += p.amount || 0;
            return acc;
        }, {});

        (profilesRes.data || []).forEach(p => {
            const date = new Date(p.created_at).toISOString().split('T')[0];
            if (salesByDay[date]) {
                salesByDay[date].newUsers++;
            }
        });

        const salesByBook = (purchasesRes.data || []).reduce((acc, p) => {
            const bookTitle = booksMap[p.book_id] || p.book_id || 'Unknown Book';
            if (!acc[bookTitle]) {
                acc[bookTitle] = { book: bookTitle, unitsSold: 0, revenue: 0 };
            }
            acc[bookTitle].unitsSold++;
            acc[bookTitle].revenue += p.amount || 0;
            return acc;
        }, {});

        return {
            success: true,
            data: {
                daily: Object.values(salesByDay).sort((a, b) => new Date(b.date) - new Date(a.date)),
                byBook: Object.values(salesByBook).sort((a, b) => b.revenue - a.revenue)
            }
        };
    } catch (error) {
        console.error('Failed to fetch sales report:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchReferralReport(params = {}) {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        const [profilesRes, purchasesRes] = await Promise.all([
            db.from('profiles').select('id, full_name, share_id, referred_by'),
            db.from('purchases').select('profile_id, amount').or('payment_status.eq.success,payment_status.is.null')
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (purchasesRes.error) throw purchasesRes.error;

        const profiles = profilesRes.data || [];
        const purchases = purchasesRes.data || [];

        const purchaseSummary = purchases.reduce((acc, p) => {
            if (!acc[p.profile_id]) acc[p.profile_id] = { totalPurchases: 0, totalSpent: 0 };
            acc[p.profile_id].totalPurchases++;
            acc[p.profile_id].totalSpent += p.amount || 0;
            return acc;
        }, {});

        const referralStats = profiles.reduce((acc, p) => {
            if (p.referred_by) {
                if (!acc[p.referred_by]) acc[p.referred_by] = { referredUsers: 0, totalSales: 0, totalRevenue: 0 };
                acc[p.referred_by].referredUsers++;
                const userPurchases = purchaseSummary[p.id];
                if (userPurchases) {
                    acc[p.referred_by].totalSales += userPurchases.totalPurchases;
                    acc[p.referred_by].totalRevenue += userPurchases.totalSpent;
                }
            }
            return acc;
        }, {});

        const profilesById = profiles.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

        const reportData = Object.entries(referralStats).map(([referrerId, stats]) => ({
            referrerId: referrerId,
            referrerName: profilesById[referrerId]?.full_name || `User ID: ${referrerId}`,
            shareId: profilesById[referrerId]?.share_id || 'N/A',
            ...stats
        })).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return { success: true, data: reportData };
    } catch (error) {
        console.error('Failed to fetch referral report:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchSourceReport(params = {}) {
    try {
        const db = window.dbClient;
        if (!db) throw new Error("Supabase client not available.");

        const { data, error } = await db.rpc('get_source_report', {
            start_date: params.startDate,
            end_date: params.endDate
        });

        if (error) throw error;
        return { success: true, data: data };
    } catch (error) {
        console.error('Failed to fetch source report:', error);
        return { success: false, error: error.message };
    }
}

/* ===========================================================
   UNIVERSAL ADMIN NOTIFICATION ENGINE & PERSISTENCE
=========================================================== */
const NOTIF_STORAGE_KEY = 'AI_ADMIN_READ_NOTIFICATIONS';
const NOTIF_LAST_READ_KEY = 'AI_ADMIN_LAST_READ_TIME';

function getReadNotificationIds() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveReadNotificationIds(ids) {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {}
}

function getLastReadTimestamp() {
  try {
    return localStorage.getItem(NOTIF_LAST_READ_KEY) || null;
  } catch (e) {
    return null;
  }
}

function getRelativeTime(date) {
  if (!date || isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

let _adminNotificationsCache = null;
let _adminNotificationsCacheTime = 0;
const NOTIF_CACHE_TTL = 60000; // 60 seconds cache

export async function fetchAdminNotifications(params = {}) {
  const now = Date.now();
  if (!params.forceRefresh && _adminNotificationsCache && (now - _adminNotificationsCacheTime < NOTIF_CACHE_TTL)) {
    return _adminNotificationsCache;
  }

  await delay(50);
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const readIds = new Set(getReadNotificationIds());
    const lastReadTime = getLastReadTimestamp() ? new Date(getLastReadTimestamp()) : null;

    // 1. Parallel fetch of live events from purchases, checkout_logs, profiles, interested_users, books, landing_pages
    const [purchasesRes, checkoutLogsRes, profilesRes, leadsRes, booksRes, landingPagesRes] = await Promise.all([
      db.from('purchases').select('id, profile_id, book_id, payment_id, amount, order_id, invoice_number, payment_status, purchase_date, created_at').order('purchase_date', { ascending: false }).limit(40),
      db.from('checkout_logs').select('id, profile_id, book_id, status, created_at').order('created_at', { ascending: false }).limit(40),
      db.from('profiles').select('id, full_name, mobile, email, registration_source, created_at').order('created_at', { ascending: false }).limit(40),
      db.from('interested_users').select('id, full_name, mobile, email, interested_book, source, created_at').order('created_at', { ascending: false }).limit(25),
      db.from('books').select('id, title'),
      db.from('landing_pages').select('id, profile_id, share_id, title, category, status, webinar_data, created_at').order('created_at', { ascending: false }).limit(35)
    ]);

    const booksMap = (booksRes.data || []).reduce((acc, b) => { acc[b.id] = b.title; return acc; }, {});

    try {
      if (Object.keys(booksMap).length === 0) {
        const booksList = await fetchAvailableBooks();
        if (booksList.success && booksList.data) {
          booksList.data.forEach(b => { booksMap[b.id] = b.title; });
        }
      }
    } catch(e) {}

    // Collect all profile IDs to resolve user names
    const allProfileIds = new Set();
    (purchasesRes.data || []).forEach(p => p.profile_id && allProfileIds.add(p.profile_id));
    (checkoutLogsRes.data || []).forEach(c => c.profile_id && allProfileIds.add(c.profile_id));
    (profilesRes.data || []).forEach(u => u.id && allProfileIds.add(u.id));
    (landingPagesRes.data || []).forEach(lp => lp.profile_id && allProfileIds.add(lp.profile_id));

    let profilesMap = {};
    if (allProfileIds.size > 0) {
      const { data: allProfiles } = await db.from('profiles').select('id, full_name, mobile, email, registration_source').in('id', [...allProfileIds]);
      profilesMap = (allProfiles || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    }

    const notifications = [];

    // Adapter A: Purchases & Manual Purchases
    (purchasesRes.data || []).forEach(p => {
      const uniqueId = `purchase:${p.id || p.order_id || p.payment_id}`;
      const rawDate = p.purchase_date || p.created_at;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const user = profilesMap[p.profile_id] || {};
      const userName = user.full_name || 'Customer';
      const bookTitle = booksMap[p.book_id] || p.book_id || 'eBook';
      const isManual = (p.payment_id && p.payment_id.startsWith('PAY_MANUAL_')) || (p.order_id && p.order_id.startsWith('ORD_') && !p.payment_id?.startsWith('pay_'));

      const isRead = readIds.has(uniqueId) || (lastReadTime && dateObj <= lastReadTime);

      notifications.push({
        id: uniqueId,
        type: isManual ? 'manual_purchase' : 'purchase',
        category: 'purchases',
        icon: isManual ? '✍️' : '🛒',
        title: isManual ? 'Manual Purchase Added' : 'New Purchase',
        message: `${userName} purchased ${bookTitle}`,
        userName: userName,
        userId: p.profile_id || '',
        userMobile: user.mobile || '',
        bookName: bookTitle,
        bookId: p.book_id || '',
        amount: p.amount || 0,
        amountFormatted: `₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
        status: (p.payment_status || 'SUCCESS').toUpperCase(),
        paymentId: p.payment_id || p.order_id || 'N/A',
        timestamp: dateObj.toISOString(),
        dateFormatted: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeFormatted: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        relativeTime: getRelativeTime(dateObj),
        isRead: isRead,
        primaryAction: {
          label: 'View User',
          route: p.profile_id ? `user-details?id=${p.profile_id}` : 'users',
          id: p.profile_id
        },
        secondaryAction: {
          label: 'View Purchase',
          route: 'purchases'
        }
      });
    });

    // Adapter B: Checkout Logs
    (checkoutLogsRes.data || []).forEach(c => {
      const uniqueId = `checkout:${c.id}`;
      const rawDate = c.created_at;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const user = profilesMap[c.profile_id] || {};
      const userName = user.full_name || 'Visitor';
      const bookTitle = booksMap[c.book_id] || c.book_id || 'eBook';
      const statusRaw = (c.status || 'initiated').toLowerCase();
      
      let statusTitle = 'Checkout Activity';
      let icon = '⚡';
      if (statusRaw === 'dropped') {
        statusTitle = 'Checkout Dropped';
        icon = '⚠️';
      } else if (statusRaw === 'failed') {
        statusTitle = 'Checkout Payment Failed';
        icon = '❌';
      } else if (statusRaw === 'initiated') {
        statusTitle = 'Checkout Initiated';
        icon = '🛒';
      } else if (statusRaw === 'success') {
        statusTitle = 'Checkout Completed';
        icon = '✅';
      }

      const isRead = readIds.has(uniqueId) || (lastReadTime && dateObj <= lastReadTime);

      notifications.push({
        id: uniqueId,
        type: 'checkout',
        category: 'checkout',
        icon: icon,
        title: statusTitle,
        message: `${userName} — ${statusTitle} (${bookTitle})`,
        userName: userName,
        userId: c.profile_id || '',
        userMobile: user.mobile || '',
        bookName: bookTitle,
        bookId: c.book_id || '',
        status: statusRaw.toUpperCase(),
        timestamp: dateObj.toISOString(),
        dateFormatted: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeFormatted: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        relativeTime: getRelativeTime(dateObj),
        isRead: isRead,
        primaryAction: {
          label: c.profile_id ? 'View User' : 'View Funnel',
          route: c.profile_id ? `user-details?id=${c.profile_id}` : 'checkout-funnel',
          id: c.profile_id
        },
        secondaryAction: {
          label: 'View Funnel',
          route: 'checkout-funnel'
        }
      });
    });

    // Adapter C: New User Registrations
    (profilesRes.data || []).forEach(u => {
      const uniqueId = `joining:${u.id}`;
      const rawDate = u.created_at;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const userName = u.full_name || 'New Farmer';
      const source = u.registration_source || 'Direct';

      const isRead = readIds.has(uniqueId) || (lastReadTime && dateObj <= lastReadTime);

      notifications.push({
        id: uniqueId,
        type: 'joining',
        category: 'joining',
        icon: '👥',
        title: 'New User Joined',
        message: `${userName} registered via ${source}`,
        userName: userName,
        userId: u.id,
        userMobile: u.mobile || '',
        source: source,
        status: 'JOINED',
        timestamp: dateObj.toISOString(),
        dateFormatted: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeFormatted: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        relativeTime: getRelativeTime(dateObj),
        isRead: isRead,
        primaryAction: {
          label: 'View User',
          route: `user-details?id=${u.id}`,
          id: u.id
        }
      });
    });

    // Adapter D: Leads & Inquiries
    (leadsRes.data || []).forEach(l => {
      const uniqueId = `lead:${l.id}`;
      const rawDate = l.created_at;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const userName = l.full_name || 'Lead';
      const bookTitle = booksMap[l.interested_book] || l.interested_book || 'General Inquiry';
      const source = l.source || 'Website';

      const isRead = readIds.has(uniqueId) || (lastReadTime && dateObj <= lastReadTime);

      notifications.push({
        id: uniqueId,
        type: 'lead',
        category: 'leads',
        icon: '📋',
        title: 'New Lead / Interest',
        message: `${userName} expressed interest in ${bookTitle}`,
        userName: userName,
        userMobile: l.mobile || '',
        bookName: bookTitle,
        source: source,
        status: 'NEW LEAD',
        timestamp: dateObj.toISOString(),
        dateFormatted: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeFormatted: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        relativeTime: getRelativeTime(dateObj),
        isRead: isRead,
        primaryAction: {
          label: 'View Reports',
          route: 'reports'
        }
      });
    });

    // Adapter E: Landing Pages & Webinars Created
    (landingPagesRes.data || []).forEach(lp => {
      const isWb = lp.category === 'webinar' || Boolean(lp.webinar_data);
      const uniqueId = `lp:${lp.id}`;
      const rawDate = lp.created_at;
      const dateObj = rawDate ? new Date(rawDate) : new Date();
      const user = profilesMap[lp.profile_id] || {};
      const userName = user.full_name || user.name || 'User';
      const isRead = readIds.has(uniqueId) || (lastReadTime && dateObj <= lastReadTime);
      const isPending = lp.status === 'pending_review';

      notifications.push({
        id: uniqueId,
        type: isWb ? 'webinar_created' : 'landing_page_created',
        category: 'marketing',
        icon: isWb ? '🎥' : '📄',
        title: isWb ? 'New Webinar Created' : 'New Landing Page Created',
        message: `${userName} (${lp.share_id || '-'}) created ${isWb ? 'webinar' : 'landing page'}: "${lp.title || lp.id}" ${isPending ? '⏳ (Review Required)' : ''}`,
        userName: userName,
        userId: lp.profile_id || '',
        status: isPending ? 'PENDING_REVIEW' : (lp.status || 'ACTIVE').toUpperCase(),
        timestamp: dateObj.toISOString(),
        dateFormatted: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        timeFormatted: dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        relativeTime: getRelativeTime(dateObj),
        isRead: isRead,
        primaryAction: {
          label: 'Review / Control URL',
          route: 'landing-page-control',
          id: lp.id
        }
      });
    });

    // Sort descending by timestamp (latest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Filter by category if requested
    let filtered = notifications;
    if (params.category && params.category !== 'all') {
      filtered = notifications.filter(n => n.category === params.category || n.type === params.category);
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const result = {
      success: true,
      data: filtered,
      total: notifications.length,
      unreadCount: unreadCount
    };

    if (!params.category || params.category === 'all') {
      _adminNotificationsCache = result;
      _adminNotificationsCacheTime = Date.now();
    }

    return result;

  } catch (error) {
    console.error('Failed to fetch admin notifications:', error);
    return { success: false, data: [], total: 0, unreadCount: 0, error: error.message };
  }
}

export function markNotificationAsRead(notificationId) {
  if (!notificationId) return;
  const ids = getReadNotificationIds();
  if (!ids.includes(notificationId)) {
    ids.push(notificationId);
    saveReadNotificationIds(ids);
    document.dispatchEvent(new CustomEvent('admin:notifications-updated'));
  }
}

export function markAllNotificationsAsRead() {
  localStorage.setItem(NOTIF_LAST_READ_KEY, new Date().toISOString());
  saveReadNotificationIds([]);
  document.dispatchEvent(new CustomEvent('admin:notifications-updated'));
}

export async function getUnreadNotificationCount() {
  const res = await fetchAdminNotifications();
  return res.unreadCount || 0;
}

// =========================================================================
// UCAS V1 — REAL DATA INTEGRATION API (MAIN ADMIN PANEL)
// =========================================================================

function getAdminDb() {
  if (window.dbClient) return window.dbClient;
  if (window.supabaseClient) return window.supabaseClient;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.dbClient = window.supabase.createClient(
      'https://qjhjrzsnrtahmhswxyvb.supabase.co',
      'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU'
    );
    return window.dbClient;
  }
  return null;
}

export async function fetchUcasDashboardSummary() {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Supabase client not available.");

    const [profilesRes, purchasesRes, surveysRes, phonebookRes, lpsRes, sharesRes] = await Promise.all([
      db.from('profiles').select('id, is_active, created_at'),
      db.from('purchases').select('profile_id, purchase_date, amount, payment_status, book_id'),
      db.from('surveys').select('id, profile_id, selected_categories, category_answers, created_at'),
      db.from('phonebook').select('id, profile_id, created_at'),
      db.from('landing_pages').select('id, profile_id, category, webinar_data, created_at'),
      db.from('share_logs').select('id, event_type')
    ]);

    const profiles = profilesRes.data || [];
    const purchases = purchasesRes.data || [];
    const surveys = surveysRes.data || [];
    const phonebook = phonebookRes.data || [];
    let landingPages = lpsRes.data || [];
    const shareLogs = sharesRes.data || [];

    // Also include any landing pages from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('UCAS_LP_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          list.forEach(p => {
            if (!landingPages.some(existing => existing.id === p.id)) {
              landingPages.push(p);
            }
          });
        } catch (e) {}
      }
    }

    // Compute active subscriber map
    const activeSubscriberSet = new Set();
    const now = Date.now();

    purchases.forEach(p => {
      if (p.profile_id && (p.payment_status === 'success' || p.payment_status === null || p.amount >= 0)) {
        const pDate = p.purchase_date || new Date().toISOString();
        const pTime = new Date(pDate).getTime();
        const expTime = pTime + (365 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
        if (now <= expTime) {
          activeSubscriberSet.add(p.profile_id);
        }
      }
    });

    // Check manual admin status overrides
    profiles.forEach(u => {
      const override = localStorage.getItem(`UCAS_USER_STATUS_${u.id}`);
      if (override === 'ACTIVE') {
        activeSubscriberSet.add(u.id);
      } else if (override === 'INACTIVE') {
        activeSubscriberSet.delete(u.id);
      }
    });

    const totalUsers = profiles.length;
    const activeUsers = profiles.filter(u => activeSubscriberSet.has(u.id) || u.is_active).length;
    const inactiveUsers = Math.max(0, totalUsers - activeUsers);
    const totalSubscribers = activeSubscriberSet.size;
    const totalSurveys = surveys.length;
    const totalPhonebook = phonebook.length;
    const totalLandingPages = landingPages.length;

    const totalWebinarAttendees = surveys.filter(s => {
      const cat = String(s.selected_categories || '');
      const src = s.category_answers?.source || '';
      return cat.includes('webinar') || src.includes('webinar');
    }).length;

    const totalShares = shareLogs.filter(l => l.event_type === 'share').length;
    const surveyResponses = totalSurveys;

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        totalSubscribers,
        totalSurveys,
        totalPhonebook,
        totalLandingPages,
        totalWebinarAttendees,
        totalShares,
        surveyResponses
      }
    };
  } catch (error) {
    console.error('Failed to fetch UCAS dashboard summary:', error);
    return {
      success: false,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalSubscribers: 0,
        totalSurveys: 0,
        totalPhonebook: 0,
        totalLandingPages: 0,
        totalWebinarAttendees: 0,
        totalShares: 0,
        surveyResponses: 0
      },
      error: error.message
    };
  }
}

export async function fetchUserUcasDetail(userId) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Supabase client not available.");

    const [profileRes, purchasesRes, phonebookRes, surveysRes, lpsRes, permsRes] = await Promise.all([
      db.from('profiles').select('*').eq('id', userId).single(),
      db.from('purchases').select('*').eq('profile_id', userId).order('purchase_date', { ascending: false }),
      db.from('phonebook').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('surveys').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('landing_pages').select('*').eq('profile_id', userId).order('created_at', { ascending: false }),
      db.from('permissions').select('*').eq('profile_id', userId)
    ]);

    const profile = profileRes.data || {};
    const purchases = purchasesRes.data || [];
    const phonebook = phonebookRes.data || [];
    const surveys = surveysRes.data || [];
    let landingPages = lpsRes.data || [];
    const permissions = permsRes.data || [];

    // LocalStorage LPs check for this user
    try {
      const localLps = JSON.parse(localStorage.getItem(`UCAS_LP_${userId}`) || '[]');
      localLps.forEach(p => {
        if (!landingPages.some(existing => existing.id === p.id)) {
          landingPages.push(p);
        }
      });
    } catch (e) {}

    // Calculate Subscription (eBook purchase date = subscription start date)
    const latestPurchase = purchases.find(p => p.payment_status === 'success' || p.payment_status === null || p.amount >= 0) || purchases[0];
    const manualStatus = localStorage.getItem(`UCAS_USER_STATUS_${userId}`);

    let subscription = {
      plan: 'Basic (1 Year)',
      status: 'INACTIVE',
      subscriber: 'NO',
      isActive: false,
      startDate: null,
      expiryDate: null,
      source: 'NONE',
      amount: '₹0',
      paymentId: 'N/A',
      daysRemaining: 0
    };

    if (latestPurchase) {
      const pDate = latestPurchase.purchase_date || latestPurchase.created_at || new Date().toISOString();
      const pTime = new Date(pDate).getTime();
      const expTime = pTime + (365 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
      const expiryDate = new Date(expTime).toISOString();
      const now = Date.now();
      const isNaturalActive = now <= expTime;
      const daysRemaining = Math.max(0, Math.ceil((expTime - now) / (1000 * 60 * 60 * 24)));
      const isActuallyActive = manualStatus ? (manualStatus === 'ACTIVE') : isNaturalActive;

      subscription = {
        plan: 'Basic (1 Year)',
        status: isActuallyActive ? 'ACTIVE' : 'INACTIVE',
        subscriber: isActuallyActive ? 'YES' : 'NO',
        isActive: isActuallyActive,
        startDate: pDate,
        purchaseDate: pDate,
        expiryDate: expiryDate,
        source: latestPurchase.book_id ? 'EBOOK_PURCHASE' : 'DIRECT_PAYMENT',
        amount: latestPurchase.book_id ? 'FREE' : `₹${latestPurchase.amount || 99}`,
        paymentId: latestPurchase.payment_id || latestPurchase.order_id || 'N/A',
        daysRemaining: daysRemaining
      };
    } else if (manualStatus === 'ACTIVE') {
      const now = new Date();
      const expTime = now.getTime() + (365 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000);
      subscription = {
        plan: 'Basic (1 Year)',
        status: 'ACTIVE',
        subscriber: 'YES',
        isActive: true,
        startDate: now.toISOString(),
        purchaseDate: now.toISOString(),
        expiryDate: new Date(expTime).toISOString(),
        source: 'DIRECT_PAYMENT',
        amount: '₹99',
        paymentId: 'MANUAL_ADMIN',
        daysRemaining: 365
      };
    }

    // Fetch survey responses count for each landing page
    const allSurveysRes = await db.from('surveys').select('id, category_answers');
    const allSurveys = allSurveysRes.data || [];
    landingPages = landingPages.map(lp => {
      const respCount = allSurveys.filter(s => {
        return s.category_answers && s.category_answers.landing_page_id === lp.id;
      }).length;
      return { ...lp, response_count: respCount };
    });

    // Compile real timestamped activity log
    const activityLogs = [];

    surveys.forEach(s => {
      activityLogs.push({
        type: 'survey',
        action: 'सर्वे दर्ज किया (Survey Created)',
        date: s.created_at || new Date().toISOString(),
        detail: `नाम: ${s.name} (${s.village || s.district || 'स्थान'})`
      });
    });

    phonebook.forEach(p => {
      activityLogs.push({
        type: 'phonebook',
        action: 'फोनबुक संपर्क जोड़ा (Contact Added)',
        date: p.created_at || new Date().toISOString(),
        detail: `नाम: ${p.name} (${p.mobile})`
      });
    });

    landingPages.forEach(lp => {
      activityLogs.push({
        type: 'landing_page',
        action: 'लैंडिंग पेज बनाया (Landing Page Created)',
        date: lp.created_at || new Date().toISOString(),
        detail: `टाइटल: ${lp.title} (${lp.category})`
      });
    });

    purchases.forEach(pr => {
      activityLogs.push({
        type: 'purchase',
        action: `खरीदारी की (eBook Purchase)`,
        date: pr.purchase_date || pr.created_at || new Date().toISOString(),
        detail: `राशि: ₹${pr.amount || 0} (Order: ${pr.payment_id || pr.order_id || 'N/A'})`
      });
    });

    if (profile.created_at) {
      activityLogs.push({
        type: 'registration',
        action: 'पंजीकरण किया (User Registered)',
        date: profile.created_at,
        detail: `स्रोत: ${profile.registration_source || 'Direct'}`
      });
    }

    activityLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      success: true,
      data: {
        profile,
        subscription,
        phonebook,
        surveys,
        landingPages,
        permissions,
        purchases,
        activityLogs
      }
    };
  } catch (error) {
    console.error('Failed to fetch user UCAS detail:', error);
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchAllPhonebook(params = {}) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Supabase client not available.");

    let query = db.from('phonebook').select('*').order('created_at', { ascending: false });

    if (params.userId && params.userId !== 'all') {
      query = query.eq('profile_id', params.userId);
    }
    if (params.source && params.source !== 'all') {
      query = query.eq('source', params.source);
    }

    const { data: contacts, error } = await query;
    if (error) throw error;

    // Fetch profiles for owner details mapping
    const profileIds = [...new Set((contacts || []).map(c => c.profile_id).filter(Boolean))];
    let profilesMap = {};
    if (profileIds.length > 0) {
      const { data: profs } = await db.from('profiles').select('id, full_name, mobile, share_id').in('id', profileIds);
      profilesMap = (profs || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    }

    let mapped = (contacts || []).map(c => {
      const owner = profilesMap[c.profile_id] || {};
      return {
        ...c,
        owner_name: owner.full_name || 'Unknown User',
        owner_mobile: owner.mobile || '-',
        owner_share_id: owner.share_id || '-'
      };
    });

    if (params.search) {
      const s = params.search.toLowerCase().trim();
      mapped = mapped.filter(c =>
        (c.name || '').toLowerCase().includes(s) ||
        (c.mobile || '').includes(s) ||
        (c.place || '').toLowerCase().includes(s) ||
        (c.owner_name || '').toLowerCase().includes(s)
      );
    }

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Failed to fetch all phonebook:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchAllSurveys(params = {}) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Supabase client not available.");

    let query = db.from('surveys').select('id, profile_id, name, mobile, age, sex, state, district, village, occupation, category_answers, created_at').order('created_at', { ascending: false });

    if (params.userId && params.userId !== 'all') {
      query = query.eq('profile_id', params.userId);
    }
    if (params.district && params.district !== 'all') {
      query = query.ilike('district', `%${params.district}%`);
    }
    if (params.startDate) {
      query = query.gte('created_at', params.startDate);
    }
    if (params.endDate) {
      query = query.lte('created_at', params.endDate);
    }

    const { data: surveys, error } = await query;
    if (error) throw error;

    // Fetch profiles for owner details mapping
    const profileIds = [...new Set((surveys || []).map(s => s.profile_id).filter(Boolean))];
    let profilesMap = {};
    if (profileIds.length > 0) {
      const { data: profs } = await db.from('profiles').select('id, full_name, mobile, share_id').in('id', profileIds);
      profilesMap = (profs || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    }

    let mapped = (surveys || []).map(s => {
      const owner = profilesMap[s.profile_id] || {};
      return {
        ...s,
        owner_name: owner.full_name || 'Unknown User',
        owner_mobile: owner.mobile || '-',
        owner_share_id: owner.share_id || '-'
      };
    });

    if (params.category && params.category !== 'all') {
      mapped = mapped.filter(s => {
        if (Array.isArray(s.selected_categories)) {
          return s.selected_categories.includes(params.category);
        }
        return String(s.selected_categories || '').toLowerCase().includes(params.category.toLowerCase());
      });
    }

    if (params.search) {
      const s = params.search.toLowerCase().trim();
      mapped = mapped.filter(item =>
        (item.name || '').toLowerCase().includes(s) ||
        (item.mobile || '').includes(s) ||
        (item.village || '').toLowerCase().includes(s) ||
        (item.district || '').toLowerCase().includes(s) ||
        (item.owner_name || '').toLowerCase().includes(s)
      );
    }

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Failed to fetch all surveys:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchAllLandingPages(params = {}) {
  try {
    const db = getAdminDb();
    let pages = [];

    if (db) {
      const { data, error } = await db.from('landing_pages').select('*').order('created_at', { ascending: false });
      if (!error && data) pages = data;
    }

    // Scan LocalStorage for all LP keys
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

    // Fetch survey responses count and owner details
    let surveys = [];
    if (db) {
      const { data: sData } = await db.from('surveys').select('id, category_answers');
      if (sData) surveys = sData;
    }

    const profileIds = [...new Set(pages.map(p => p.profile_id).filter(Boolean))];
    let profilesMap = {};
    if (db && profileIds.length > 0) {
      const { data: profs } = await db.from('profiles').select('id, full_name, mobile, share_id').in('id', profileIds);
      profilesMap = (profs || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
    }

    let mapped = pages.map(lp => {
      const owner = profilesMap[lp.profile_id] || {};
      const respCount = surveys.filter(s => s.category_answers && s.category_answers.landing_page_id === lp.id).length;
      return {
        ...lp,
        owner_name: owner.full_name || 'Creator',
        owner_mobile: owner.mobile || '-',
        creator_share_id: lp.share_id || owner.share_id || 'AI000000',
        response_count: respCount,
        status: lp.status || 'Active'
      };
    });

    if (params.userId && params.userId !== 'all') {
      mapped = mapped.filter(p => p.profile_id === params.userId);
    }
    if (params.category && params.category !== 'all') {
      mapped = mapped.filter(p => p.category === params.category);
    }
    if (params.search) {
      const s = params.search.toLowerCase().trim();
      mapped = mapped.filter(p =>
        (p.title || '').toLowerCase().includes(s) ||
        (p.id || '').toLowerCase().includes(s) ||
        (p.owner_name || '').toLowerCase().includes(s) ||
        (p.creator_share_id || '').toLowerCase().includes(s)
      );
    }

    return { success: true, data: mapped };
  } catch (error) {
    console.error('Failed to fetch all landing pages:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function deleteLandingPageAdmin(lpId) {
  try {
    const db = getAdminDb();
    if (db) {
      await db.from('landing_pages').delete().eq('id', lpId);
    }

    // Clean from LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('UCAS_LP_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          const filtered = list.filter(p => p.id !== lpId);
          localStorage.setItem(key, JSON.stringify(filtered));
        } catch (e) {}
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete landing page:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchAllUserPermissions(params = {}) {
  try {
    const db = getAdminDb();
    if (!db) throw new Error("Supabase client not available.");

    let profilesQuery = db.from('profiles').select('id, full_name, mobile, is_active').order('full_name', { ascending: true });
    if (params.userId && params.userId !== 'all') {
      profilesQuery = profilesQuery.eq('id', params.userId);
    }

    const [profilesRes, permsRes] = await Promise.all([
      profilesQuery,
      db.from('permissions').select('*')
    ]);

    const profiles = profilesRes.data || [];
    const perms = permsRes.data || [];

    const permsByUser = perms.reduce((acc, p) => {
      if (!acc[p.profile_id]) acc[p.profile_id] = {};
      acc[p.profile_id][p.permission_key] = Boolean(p.allowed);
      return acc;
    }, {});

    return {
      success: true,
      data: {
        profiles,
        permsByUser
      }
    };
  } catch (error) {
    console.error('Failed to fetch user permissions:', error);
    return { success: false, data: { profiles: [], permsByUser: {} }, error: error.message };
  }
}

export async function updateUserPermissionAdmin(userId, permissionKey, allowed) {
  try {
    // Sync to local UCAS media cache if it is a media key
    if (['image', 'youtube', 'facebook', 'other', 'export_csv'].includes(permissionKey)) {
      try {
        const local = JSON.parse(localStorage.getItem(`UCAS_MEDIA_PERMS_${userId}`) || '{}');
        local[permissionKey] = allowed;
        localStorage.setItem(`UCAS_MEDIA_PERMS_${userId}`, JSON.stringify(local));
      } catch(e) {}
    }

    const db = getAdminDb();
    if (db) {
      await db
        .from('permissions')
        .upsert({
          profile_id: userId,
          permission_key: permissionKey,
          allowed: allowed,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id,permission_key' });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update user permission:', error);
    return { success: false, error: error.message };
  }
}

export async function updateUserStatusAdmin(userId, status) {
  try {
    const isBool = status === 'active' || status === true || status === 'ACTIVE';
    localStorage.setItem(`UCAS_USER_STATUS_${userId}`, isBool ? 'ACTIVE' : 'INACTIVE');

    const db = getAdminDb();
    if (db) {
      await db.from('profiles').update({ is_active: isBool }).eq('id', userId);
    }

    return { success: true, status: isBool ? 'active' : 'inactive' };
  } catch (error) {
    console.error('Failed to update user status:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchAllUsersAdmin() {
  try {
    const db = getAdminDb();
    if (!db) return { success: false, data: [] };
    const [profilesRes, purchasesRes] = await Promise.all([
      db.from('profiles').select('id, full_name, mobile, email, gender, dob, State, district, address, occupation, interest, netsurf_id, registration_source, is_active, share_id, created_at').order('created_at', { ascending: false }),
      db.from('purchases').select('id, profile_id, book_id, amount, payment_status, purchase_date')
    ]);
    const profiles = profilesRes.data || [];
    const purchases = purchasesRes.data || [];

    const purchasesByProfile = {};
    purchases.forEach(p => {
      if (p.profile_id) {
        if (!purchasesByProfile[p.profile_id]) purchasesByProfile[p.profile_id] = [];
        purchasesByProfile[p.profile_id].push(p);
      }
    });

    const enriched = profiles.map(p => ({
      ...p,
      purchases: purchasesByProfile[p.id] || [],
      has_purchased: (purchasesByProfile[p.id] && purchasesByProfile[p.id].length > 0) || false
    }));

    return { success: true, data: enriched };
  } catch (err) {
    console.error('Failed to fetch all users for admin:', err);
    return { success: false, data: [], error: err.message };
  }
}