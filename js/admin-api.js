/* Admin API
   - Client-side admin data stubs for Phase-1 UI.
   - No connection to Supabase or back-end systems.
   - Phase-2: replace with real secure endpoints or RLS-enabled queries.
*/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function hasSupabaseClient() {
  return typeof window !== 'undefined' && window.dbClient && typeof window.dbClient.from === 'function';
}

function getMockSummary() {
  return {
    totalShares: 4320,
    totalClicks: LEAD_SOURCES.reduce((sum, item) => sum + item.value, 0),
    totalVisitors: CUSTOMER_JOURNEY.reduce((sum, item) => sum + item.count, 0),
    totalLeads: LEAD_REPORT.length,
    totalRegistrations: 8520,
    totalPurchases: 9750,
    totalRevenue: 12400000,
    conversionRate: '6.8%'
  };
}

const KPIS = [
  { label: 'Monthly Revenue', value: '₹1.8M' },
  { label: 'New Customers', value: '1,240' },
  { label: 'Conversion Rate', value: '6.8%' },
  { label: 'Total Shares', value: '4,320' }
];

const LEAD_SOURCES = [
  { source: 'WhatsApp', value: 42 },
  { source: 'Facebook', value: 28 },
  { source: 'Organic', value: 18 },
  { source: 'Shared Link', value: 9 },
  { source: 'Other', value: 3 }
];

const CUSTOMER_JOURNEY = [
  { stage: 'New Lead', count: 584 },
  { stage: 'Engaged', count: 310 },
  { stage: 'Converted', count: 156 },
  { stage: 'Repeat Buyer', count: 42 }
];

const BOOK_SALES = [
  { name: 'Kharif Master Guide', sold: 240, revenue: '₹1,20,000' },
  { name: 'Fasal Ka Doctor', sold: 180, revenue: '₹81,000' },
  { name: 'AI Website Guide', sold: 95, revenue: '₹57,000' },
  { name: 'Jaivik Kheti Guide', sold: 76, revenue: '₹38,000' }
];

const DAILY_REPORT = [
  { label: 'Today\'s Revenue', value: '₹64,200', change: '+8.6%' },
  { label: 'New Leads', value: '72', change: '+12%' },
  { label: 'Conversions', value: '18', change: '+4.5%' },
  { label: 'Link Shares', value: '42', change: '-1.2%' }
];

const TOTAL_REPORT = [
  { label: 'Total Revenue', value: '₹12.4M' },
  { label: 'Total Customers', value: '8,520' },
  { label: 'Total Orders', value: '9,750' },
  { label: 'Returning Buyers', value: '1,980' }
];

const LEAD_REPORT = [
  { name: 'Amit Kumar', mobile: '9876543210', source: 'WhatsApp', status: 'Contacted', assigned: 'Ravi' },
  { name: 'Sita Devi', mobile: '8765432109', source: 'Facebook', status: 'Interested', assigned: 'Anjali' },
  { name: 'Rahul Jain', mobile: '9123456789', source: 'Organic', status: 'Converted', assigned: 'Vijay' }
];

const SHARE_REPORT = [
  { token: 'SHARE-AI-01', clicks: 182, conversions: 24, revenue: '₹12,800' },
  { token: 'SHARE-WH-02', clicks: 94, conversions: 11, revenue: '₹6,400' },
  { token: 'SHARE-FB-03', clicks: 56, conversions: 5, revenue: '₹3,100' }
];

const RECENT_ACTIVITY = [
  { date: '2026-08-01', event: 'Payment succeeded for BK001', user: 'Ramesh Kumar' },
  { date: '2026-08-01', event: 'New user registered via WhatsApp', user: 'Sita Devi' },
  { date: '2026-07-31', event: 'Shared link conversion', user: 'Sunita Patel' }
];

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
  await delay(200); // Keep a small delay to simulate network
  try {
    const db = window.dbClient;
    if (!db) {
      throw new Error("Supabase client not available.");
    }

    // 1. Total Shares
    const { count: totalShares, error: sharesError } = await db
      .from('share_links')
      .select('id', { count: 'exact', head: true });
    if (sharesError) console.error('Error fetching total shares:', sharesError.message);

    // 2. Total Clicks (from share_events)
    const { count: totalClicks, error: clicksError } = await db
      .from('share_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'click');
    if (clicksError) console.error('Error fetching total clicks:', clicksError.message);
    
    // 3. Total Visitors (from share_events)
     const { count: totalVisitors, error: visitorsError } = await db
      .from('share_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'visit');
    if (visitorsError) console.error('Error fetching total visitors:', visitorsError.message);

    // 4. Total Leads
    const { count: totalLeads, error: leadsError } = await db
      .from('interested_users')
      .select('id', { count: 'exact', head: true });
    if(leadsError) console.error('Error fetching total leads:', leadsError.message);

    // 5. Total Registrations
    const { count: totalRegistrations, error: regsError } = await db
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if(regsError) console.error('Error fetching total registrations:', regsError.message);

    // 6. Total Purchases & Revenue
    const { data: purchases, error: purchasesError } = await db
      .from('purchases')
      .select('amount');
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

export async function fetchDashboardData() {
  await delay(180);
  try {
    const db = window.dbClient;
    if (!db) {
      throw new Error("Supabase client not available.");
    }

    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();

    // --- Data fetching in parallel (Safely structured to avoid crashes) ---
    const [
      { data: revData },
      { count: newCustCount },
      { data: profilesData },
      { data: purchasesData },
      { data: booksData },
      { data: recentPurchases },
      { data: recentProfiles }
    ] = await Promise.all([
      db.from('purchases').select('amount, purchase_date').gte('purchase_date', thirtyDaysAgo),
      db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      db.from('profiles').select('registration_source').not('registration_source', 'is', null),
      db.from('purchases').select('book_id, amount').eq('payment_status', 'success'),
      db.from('books').select('id, title'),
      db.from('purchases').select('profile_id, book_id, purchase_date, payment_status').order('purchase_date', { ascending: false }).limit(3),
      db.from('profiles').select('id, full_name, created_at, registration_source').order('created_at', { ascending: false }).limit(3)
    ]);

    // --- Process KPI data ---
    const monthlyRevenue = revData ? revData.reduce((sum, p) => sum + (p.amount || 0), 0) : 0;
    const newCustomers = newCustCount || 0;

    const kpis = [
      { label: 'Monthly Revenue', value: `₹${monthlyRevenue.toLocaleString('en-IN')}` },
      { label: 'New Customers', value: newCustomers.toLocaleString('en-IN') },
      { label: 'Conversion Rate', value: '...' }, 
      { label: 'Total Shares', value: '...' }      
    ];

    // --- Process Lead Sources ---
    const leadSourcesMap = (profilesData || []).reduce((acc, profile) => {
        const source = profile.registration_source || 'Direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
    }, {});
    const totalLeads = Object.values(leadSourcesMap).reduce((sum, count) => sum + count, 0);
    const leadSources = Object.entries(leadSourcesMap).map(([source, value]) => ({
      source,
      value: totalLeads > 0 ? Math.round((value / totalLeads) * 100) : 0
    })).sort((a,b) => b.value - a.value);

    // --- Process Book Sales ---
    const booksMap = (booksData || []).reduce((acc, book) => {
        acc[book.id] = book.title;
        return acc;
    }, {});
    const salesMap = (purchasesData || []).reduce((acc, p) => {
        const bookTitle = booksMap[p.book_id] || `Book ID: ${p.book_id}`;
        if (!acc[bookTitle]) {
            acc[bookTitle] = { name: bookTitle, sold: 0, revenue: 0 };
        }
        acc[bookTitle].sold++;
        acc[bookTitle].revenue += (p.amount || 0);
        return acc;
    }, {});
    const bookSales = Object.values(salesMap).sort((a,b) => b.sold - a.sold).slice(0, 4).map(b => ({
        ...b,
        revenue: `₹${b.revenue.toLocaleString('en-IN')}`
    }));

    // --- Process Recent Activity ---
    const recentActivity = [];
    (recentPurchases || []).forEach(p => recentActivity.push({
        date: new Date(p.purchase_date).toISOString(),
        event: `Payment ${p.payment_status} for Book ID ${p.book_id}`,
        user: `User ID ${p.profile_id}`
    }));
    (recentProfiles || []).forEach(u => recentActivity.push({
        date: new Date(u.created_at).toISOString(),
        event: `New user registered via ${u.registration_source || 'Direct'}`,
        user: u.full_name || `User ID ${u.id}`
    }));
    const sortedActivity = recentActivity.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(a => ({
        ...a,
        date: new Date(a.date).toLocaleDateString('en-GB')
    }));

    return { success: true, data: { 
        kpis, 
        leadSources, 
        customerJourney: CUSTOMER_JOURNEY, 
        bookSales, 
        recentActivity: sortedActivity 
    }};
  } catch(error) {
    console.error("Failed to fetch dashboard data:", error);
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchLeadSources() {
  await delay(120);
  return { success: true, data: LEAD_SOURCES };
}

export async function fetchCustomerJourney() {
  await delay(120);
  return { success: true, data: CUSTOMER_JOURNEY };
}

export async function fetchBookSales() {
  await delay(120);
  return { success: true, data: BOOK_SALES };
}

export async function fetchDailyReport() {
  await delay(140);
  return { success: true, data: DAILY_REPORT };
}

export async function fetchTotalReport() {
  await delay(140);
  return { success: true, data: TOTAL_REPORT };
}

export async function fetchLeadReport() {
  await delay(180);
  return { success: true, data: LEAD_REPORT };
}

export async function fetchShareReport() {
  await delay(180);
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    const { data, error } = await db
        .from('share_links')
        .select('token, clicks, conversions, asset_title, channel, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) throw error;
    
    const mappedData = data.map(item => ({
        token: item.token,
        clicks: item.clicks || 0,
        conversions: item.conversions || 0,
        revenue: '₹0'
    }));

    return { success: true, data: mappedData };
  } catch (error) {
    console.error('Failed to fetch share report:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchRecentActivity() {
  await delay(140);
  return { success: true, data: RECENT_ACTIVITY };
}

export async function fetchUsers(params = {}) {
  await delay(100);
  try {
    const db = window.dbClient;
    if (!db) throw new Error("Supabase client not available.");

    let queryBuilder = db.from('profiles').select('id, full_name, mobile, email, registration_source, is_active');

    if (params.status && params.status !== 'all') {
      queryBuilder = queryBuilder.eq('is_active', params.status === 'active');
    }

    if (params.query) {
      const q = `%${params.query}%`;
      queryBuilder = queryBuilder.or(`full_name.ilike.${q},mobile.ilike.${q},email.ilike.${q}`);
    }
    
    queryBuilder = queryBuilder.order('created_at', { ascending: false });

    const { data, error } = await queryBuilder;

    if (error) throw error;

    const mappedData = data.map(user => ({
        id: user.id,
        name: user.full_name,
        mobile: user.mobile,
        email: user.email,
        source: user.registration_source,
        status: user.is_active ? 'active' : 'inactive',
    }));

    return { success: true, data: mappedData };

  } catch (error) {
    console.error('Failed to fetch users:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function fetchPurchases(params = {}) {
  await delay(120);
  let data = PURCHASES;
  const query = (params.query || '').toLowerCase();
  if (query) {
    data = data.filter(item => item.order.toLowerCase().includes(query) || item.book.toLowerCase().includes(query) || item.customer.toLowerCase().includes(query));
  }
  if (params.status && params.status !== 'all') {
    data = data.filter(item => item.status === params.status);
  }
  return { success: true, data };
}

export async function fetchDownloads() {
  await delay(120);
  return { success: true, data: DOWNLOADS };
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

    const { data: purchases, error: purchasesError } = await db
      .from('purchases')
      .select('order_id, book_id, amount, purchase_date, payment_status')
      .eq('profile_id', userId)
      .order('purchase_date', { ascending: false });
    if(purchasesError) console.error("Error fetching purchases for user:", purchasesError.message);

    const activity = (purchases || []).map(p => ({
        date: new Date(p.purchase_date).toLocaleDateString(),
        description: `Purchased Book ID ${p.book_id} (Order: ${p.order_id})`
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
      purchases: (purchases || []).map(p => ({
          order: p.order_id,
          book: p.book_id,
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