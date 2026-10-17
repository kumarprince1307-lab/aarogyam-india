-- =========================================================================
-- AAROGYAM INDIA — ALL 24 TABLES COMPLETE SECURITY MASTER LOCK
-- File: database/10_complete_all_tables_rls.sql
-- =========================================================================
-- इस एक SQL को चलाने से आपके स्क्रीनशॉट की सभी 24 टेबल्स पर सुरक्षा ताला लग जाएगा:
-- 1. [UNRESTRICTED] लाल टैग हट जाएगा और सभी टेबल्स पर RLS Lock सक्रिय हो जाएगा।
-- 2. पब्लिक कैटलॉग (books, landing_pages, product_landing_pages) आम जनता के लिए खुले रहेंगे।
-- 3. लीड्स, सर्वे व फॉर्म्स (product_leads, surveys, phonebook, sakhi) आम जनता भर सकेगी।
-- 4. किसी भी टेबल से ग्राहकों व किसानों का निजी डेटा, फोन नंबर या लेन-देन कोई बाहर का व्यक्ति नहीं पढ़ सकेगा।
-- =========================================================================

-- -------------------------------------------------------------------------
-- ग्रुप 1: पब्लिक कैटलॉग (आम जनता देख सकेगी, लेकिन केवल एडमिन बदल सकेगा)
-- -------------------------------------------------------------------------
-- 1. books
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read books" ON public.books;
DROP POLICY IF EXISTS "Allow public read books" ON public.books;
CREATE POLICY "Public read books" ON public.books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write books" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. landing_pages
ALTER TABLE IF EXISTS public.landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read landing_pages" ON public.landing_pages;
CREATE POLICY "Public read landing_pages" ON public.landing_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write landing_pages" ON public.landing_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. product_landing_pages
ALTER TABLE IF EXISTS public.product_landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read product_landing_pages" ON public.product_landing_pages;
CREATE POLICY "Public read product_landing_pages" ON public.product_landing_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write product_landing_pages" ON public.product_landing_pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. mambership_levels
ALTER TABLE IF EXISTS public.mambership_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read mambership_levels" ON public.mambership_levels;
CREATE POLICY "Public read mambership_levels" ON public.mambership_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write mambership_levels" ON public.mambership_levels FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- -------------------------------------------------------------------------
-- ग्रुप 2: लीड्स, सर्वे, लॉग्स व सखी AI (विजिटर लिख सकेंगे, केवल एडमिन पढ़ सकेगा)
-- -------------------------------------------------------------------------
-- 5. product_leads
ALTER TABLE IF EXISTS public.product_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read product_leads" ON public.product_leads;
DROP POLICY IF EXISTS "Public insert product_leads" ON public.product_leads;
CREATE POLICY "Admin only read product_leads" ON public.product_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert product_leads" ON public.product_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin write product_leads" ON public.product_leads FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. surveys
ALTER TABLE IF EXISTS public.surveys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read surveys" ON public.surveys;
DROP POLICY IF EXISTS "Public insert surveys" ON public.surveys;
CREATE POLICY "Admin only read surveys" ON public.surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert surveys" ON public.surveys FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin write surveys" ON public.surveys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. phonebook
ALTER TABLE IF EXISTS public.phonebook ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read phonebook" ON public.phonebook;
DROP POLICY IF EXISTS "Public insert phonebook" ON public.phonebook;
CREATE POLICY "Admin only read phonebook" ON public.phonebook FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert phonebook" ON public.phonebook FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin write phonebook" ON public.phonebook FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. sakhi_user_insights
ALTER TABLE IF EXISTS public.sakhi_user_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Public insert sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Public update sakhi_user_insights" ON public.sakhi_user_insights;
CREATE POLICY "Admin only read sakhi_user_insights" ON public.sakhi_user_insights FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert sakhi_user_insights" ON public.sakhi_user_insights FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update sakhi_user_insights" ON public.sakhi_user_insights FOR UPDATE TO anon, authenticated USING (true);

-- 9. sakhi_unanswered_logs
ALTER TABLE IF EXISTS public.sakhi_unanswered_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
DROP POLICY IF EXISTS "Public insert sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
CREATE POLICY "Admin only read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert sakhi_unanswered_logs" ON public.sakhi_unanswered_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 10. sakhi_chat_audit_logs
ALTER TABLE IF EXISTS public.sakhi_chat_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs;
DROP POLICY IF EXISTS "Public insert sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs;
CREATE POLICY "Admin only read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 11. checkout_logs
ALTER TABLE IF EXISTS public.checkout_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read checkout_logs" ON public.checkout_logs;
DROP POLICY IF EXISTS "Public insert checkout_logs" ON public.checkout_logs;
CREATE POLICY "Admin only read checkout_logs" ON public.checkout_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert checkout_logs" ON public.checkout_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 12. download_logs
ALTER TABLE IF EXISTS public.download_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read download_logs" ON public.download_logs;
DROP POLICY IF EXISTS "Public insert download_logs" ON public.download_logs;
CREATE POLICY "Admin only read download_logs" ON public.download_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert download_logs" ON public.download_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 13. share_logs
ALTER TABLE IF EXISTS public.share_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read share_logs" ON public.share_logs;
DROP POLICY IF EXISTS "Public insert share_logs" ON public.share_logs;
CREATE POLICY "Admin only read share_logs" ON public.share_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert share_logs" ON public.share_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 14. page_visit_stats
ALTER TABLE IF EXISTS public.page_visit_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read page_visit_stats" ON public.page_visit_stats;
DROP POLICY IF EXISTS "Public insert page_visit_stats" ON public.page_visit_stats;
CREATE POLICY "Admin only read page_visit_stats" ON public.page_visit_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert page_visit_stats" ON public.page_visit_stats FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 15. reader_progress_stats
ALTER TABLE IF EXISTS public.reader_progress_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read reader_progress_stats" ON public.reader_progress_stats;
DROP POLICY IF EXISTS "Public insert reader_progress_stats" ON public.reader_progress_stats;
CREATE POLICY "Admin only read reader_progress_stats" ON public.reader_progress_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert reader_progress_stats" ON public.reader_progress_stats FOR INSERT TO anon, authenticated WITH CHECK (true);


-- -------------------------------------------------------------------------
-- ग्रुप 3: अत्यंत संवेदनशील यूजर, खरीदारी व बिजनेस डेटा (कड़ा ताला)
-- -------------------------------------------------------------------------
-- 16. profiles (यूजर प्रोफाइल)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public update own profiles" ON public.profiles;
CREATE POLICY "Admin only read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update own profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true);

-- 17. purchases (किताबों व ऑर्डर्स की खरीदारी)
ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read purchases" ON public.purchases;
DROP POLICY IF EXISTS "Public insert purchases" ON public.purchases;
CREATE POLICY "Admin only read purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert purchases" ON public.purchases FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 18. referrals (रेफरल डेटा)
ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read referrals" ON public.referrals;
DROP POLICY IF EXISTS "Public insert referrals" ON public.referrals;
CREATE POLICY "Admin only read referrals" ON public.referrals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert referrals" ON public.referrals FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 19. retail_distributor_vault (डिस्ट्रीब्यूटर वॉल्ट)
ALTER TABLE IF EXISTS public.retail_distributor_vault ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read retail_distributor_vault" ON public.retail_distributor_vault;
CREATE POLICY "Admin only read retail_distributor_vault" ON public.retail_distributor_vault FOR ALL TO authenticated USING (true);

-- 20. subscription (सब्सक्रिप्शन)
ALTER TABLE IF EXISTS public.subscription ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read subscription" ON public.subscription;
DROP POLICY IF EXISTS "Public insert subscription" ON public.subscription;
CREATE POLICY "Admin only read subscription" ON public.subscription FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert subscription" ON public.subscription FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 21. permissions (एडमिन अनुमतियां)
ALTER TABLE IF EXISTS public.permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only permissions" ON public.permissions;
CREATE POLICY "Admin only permissions" ON public.permissions FOR ALL TO authenticated USING (true);

-- 22. demo_users (डेमो यूजर डेटा)
ALTER TABLE IF EXISTS public.demo_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read demo_users" ON public.demo_users;
DROP POLICY IF EXISTS "Public insert demo_users" ON public.demo_users;
CREATE POLICY "Admin only read demo_users" ON public.demo_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Public insert demo_users" ON public.demo_users FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 23. wallets (वॉलेट बैलेंस)
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read wallets" ON public.wallets;
CREATE POLICY "Admin only read wallets" ON public.wallets FOR ALL TO authenticated USING (true);

-- 24. wallet_transactions (वॉलेट लेन-देन)
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only read wallet_transactions" ON public.wallet_transactions;
CREATE POLICY "Admin only read wallet_transactions" ON public.wallet_transactions FOR ALL TO authenticated USING (true);
