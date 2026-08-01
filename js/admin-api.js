/* Admin API
   - Client-side admin data stubs for Phase-1 UI.
   - No connection to Supabase or back-end systems.
   - Phase-2: replace with real secure endpoints or RLS-enabled queries.
*/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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

export async function fetchDashboardData() {
  await delay(180);
  return { success: true, data: { kpis: KPIS, leadSources: LEAD_SOURCES, customerJourney: CUSTOMER_JOURNEY, bookSales: BOOK_SALES, recentActivity: RECENT_ACTIVITY } };
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
  return { success: true, data: SHARE_REPORT };
}

export async function fetchRecentActivity() {
  await delay(140);
  return { success: true, data: RECENT_ACTIVITY };
}

export async function fetchUsers(params = {}) {
  await delay(100);
  const query = (params.query || '').toLowerCase();
  let data = USERS;
  if (query) {
    data = USERS.filter(user => user.name.toLowerCase().includes(query) || user.mobile.includes(query) || user.email.toLowerCase().includes(query));
  }
  if (params.status && params.status !== 'all') {
    data = data.filter(user => user.status === params.status);
  }
  return { success: true, data };
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
  const detail = USER_DETAILS[userId] || null;
  return { success: Boolean(detail), data: detail };
}

// TODO: Add actual server-side admin API integration in Phase-2
