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
      monthlyPurchasesRes,
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
      db.from('purchases').select('amount, profile_id').gte('purchase_date', startDateForFilter.toISOString()).lt('purchase_date', apiEndDate.toISOString()),
      db.from('profiles').select('id, full_name, created_at, registration_source'), // This is for profiles, not books
      db.from('purchases').select('profile_id, book_id, amount, purchase_date, payment_status'),
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
    const revenueData = monthlyPurchasesRes.data || [];
    const monthlyRevenue = revenueData.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPurchasesInPeriod = revenueData.length;

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

    // Step 1: Fetch all profiles with filtering
    let queryBuilder = db.from('profiles').select('id, full_name, mobile, email, registration_source, is_active, created_at, share_id, referred_by');

    if (params.status && params.status !== 'all') {
      queryBuilder = queryBuilder.eq('is_active', params.status === 'active');
    }

    if (params.query) {
      const q = `%${params.query}%`;
      queryBuilder = queryBuilder.or(`full_name.ilike.${q},mobile.ilike.${q},email.ilike.${q}`);
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
    if (profilesError) throw profilesError;
    if (!profiles) return { success: true, data: [] };

    const profileIds = profiles.map(p => p.id).filter(Boolean);
    const shareIds = profiles.map(p => p.share_id).filter(Boolean);

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
        const shareStats = shareStatsMap[user.share_id] || { shares: 0, clicks: 0, visitors: 0 };
        return {
        id: user.id,
        name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        source: user.registration_source,
        status: user.is_active ? 'active' : 'inactive',
        shareId: user.share_id,
        directReferrals: directReferralCounts[user.id] || 0,
        totalShares: shareStats.shares,
        totalClicks: shareStats.clicks,
        totalVisitors: shareStats.visitors,
        totalDirectPurchases: directPurchaseCounts[user.id] || 0,
        totalPurchases: ownPurchases.totalPurchases,
        totalSpent: ownPurchases.totalSpent,
        totalDownloads: downloadCounts[user.id] || 0,
        downloadLimit: (ownPurchases.totalPurchases || 0) * 3
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
      .select('order_id, book_id, amount, purchase_date, payment_status')
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
        description: `Purchased ${booksMap[p.book_id] || `Book ID ${p.book_id}`} (Order: ${p.order_id})`
    }));
    activity.push({
        date: new Date(profile.created_at).toLocaleDateString(),
        description: `User registered via ${profile.registration_source || 'direct'}`
    });

    const userDetails = {
      id: profile.id,
      name: profile.full_name,
      mobile: profile.mobile,
      email: profile.email,
      source: profile.registration_source,
      joined: new Date(profile.created_at).toLocaleDateString(),
      status: profile.is_active ? 'active' : 'inactive',
      referralToken: profile.referral_code || 'N/A',
      referredBy: referredByProfile,
      directReferrals: directReferralsList,
      totalDownloads: downloadCount || 0,
      downloadLimit: successfulPurchases.length * 3, // Assuming 3 downloads per purchase
      purchases: (purchases || []).map(p => ({
          order: p.order_id,
          book: booksMap[p.book_id] || p.book_id, // Use book name if available
          amount: `₹${p.amount}`,
          date: new Date(p.purchase_date).toLocaleDateString(),
          status: p.payment_status
      })),
      activity: activity.sort((a,b) => new Date(b.date) - new Date(a.date))
    };

    return { success: true, data: userDetails };

  } catch (error) {
    console.error('Failed to fetch user details:', error);
    return { success: false, data: null, error: error.message };
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