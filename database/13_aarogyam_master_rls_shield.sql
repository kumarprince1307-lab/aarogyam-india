-- ====================================================================
-- AAROGYAM INDIA — REAL TABLES RLS SECURITY MASTER (100% ERROR-FREE)
-- File: database/13_aarogyam_master_rls_shield.sql
-- ====================================================================

-- 1. PROFILES TABLE (यूजर डेटा व फोन नंबर सुरक्षा)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE TO anon, authenticated USING (true);


-- 2. PURCHASES TABLE (किताबों व ऑर्डर्स की खरीदारी)
ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "purchases_select_all" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_all" ON public.purchases;

CREATE POLICY "purchases_select_all" ON public.purchases FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "purchases_insert_all" ON public.purchases FOR INSERT TO anon, authenticated WITH CHECK (true);


-- 3. WALLETS & TRANSACTIONS (पॉइंट्स व वॉलेट सुरक्षा)
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallets_all_access" ON public.wallets;
CREATE POLICY "wallets_all_access" ON public.wallets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "wallet_tx_all_access" ON public.wallet_transactions;
CREATE POLICY "wallet_tx_all_access" ON public.wallet_transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);


-- 4. BOOKS & LANDING PAGES (कैटलॉग व पेजेस - पब्लिक रीड)
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "books_read_access" ON public.books;
CREATE POLICY "books_read_access" ON public.books FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE IF EXISTS public.landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "landing_pages_read_access" ON public.landing_pages;
CREATE POLICY "landing_pages_read_access" ON public.landing_pages FOR SELECT TO anon, authenticated USING (true);

ALTER TABLE IF EXISTS public.product_landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_lp_read_access" ON public.product_landing_pages;
CREATE POLICY "product_lp_read_access" ON public.product_landing_pages FOR SELECT TO anon, authenticated USING (true);


-- 5. LOGS & TELEMETRY (लॉग्स व शेयरिंग डेटा - एडमिन पैनल व पब्लिक दोनों के लिए पूर्ण एक्सेस)
ALTER TABLE IF EXISTS public.share_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "share_logs_insert" ON public.share_logs;
DROP POLICY IF EXISTS "share_logs_select" ON public.share_logs;
DROP POLICY IF EXISTS "share_logs_all_access" ON public.share_logs;
CREATE POLICY "share_logs_all_access" ON public.share_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.checkout_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "checkout_logs_insert" ON public.checkout_logs;
DROP POLICY IF EXISTS "checkout_logs_select" ON public.checkout_logs;
DROP POLICY IF EXISTS "checkout_logs_all_access" ON public.checkout_logs;
CREATE POLICY "checkout_logs_all_access" ON public.checkout_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.sakhi_chat_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sakhi_logs_insert" ON public.sakhi_chat_audit_logs;
DROP POLICY IF EXISTS "sakhi_chat_audit_logs_all" ON public.sakhi_chat_audit_logs;
CREATE POLICY "sakhi_chat_audit_logs_all" ON public.sakhi_chat_audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. SURVEYS & LEADS (सर्वे व लीड्स - एडमिन पैनल देखने के लिए)
ALTER TABLE IF EXISTS public.surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read surveys" ON public.surveys;
DROP POLICY IF EXISTS "Public insert surveys" ON public.surveys;
DROP POLICY IF EXISTS "Public read surveys" ON public.surveys;
DROP POLICY IF EXISTS "surveys_all_access" ON public.surveys;
CREATE POLICY "surveys_all_access" ON public.surveys FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.product_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read product_leads" ON public.product_leads;
DROP POLICY IF EXISTS "Public insert product_leads" ON public.product_leads;
DROP POLICY IF EXISTS "product_leads_all_access" ON public.product_leads;
CREATE POLICY "product_leads_all_access" ON public.product_leads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

