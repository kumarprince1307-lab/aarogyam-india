-- =========================================================================
-- AAROGYAM INDIA — EMERGENCY REVERT & RESTORE ORIGINAL WORKING STATE
-- File: database/11_revert_restore_original.sql
-- =========================================================================
-- इस SQL को चलाते ही एडमिन पैनल में डेटा तुरंत पहले की तरह वापस आ जाएगा।
-- =========================================================================

-- 1. जो टेबल्स पहले UNRESTRICTED थीं, उनसे RLS हटाएँ (ताकि एडमिन पैनल बिना रुकावट डेटा पढ़ सके)
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retail_distributor_vault DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.share_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.checkout_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.demo_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.download_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mambership_levels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_landing_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_transactions DISABLE ROW LEVEL SECURITY;

-- 2. जिन टेबल्स पर RLS चालू है (ग्लोब वाली टेबल्स), उनमें एडमिन/पब्लिक रीड वापस चालू करें
DROP POLICY IF EXISTS "Admin only read sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Public read sakhi_user_insights" ON public.sakhi_user_insights;
CREATE POLICY "Public read sakhi_user_insights" ON public.sakhi_user_insights FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
DROP POLICY IF EXISTS "Public read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
CREATE POLICY "Public read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs;
DROP POLICY IF EXISTS "Public read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs;
CREATE POLICY "Public read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read surveys" ON public.surveys;
DROP POLICY IF EXISTS "Public read surveys" ON public.surveys;
CREATE POLICY "Public read surveys" ON public.surveys FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read phonebook" ON public.phonebook;
DROP POLICY IF EXISTS "Public read phonebook" ON public.phonebook;
CREATE POLICY "Public read phonebook" ON public.phonebook FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read page_visit_stats" ON public.page_visit_stats;
DROP POLICY IF EXISTS "Public read page_visit_stats" ON public.page_visit_stats;
CREATE POLICY "Public read page_visit_stats" ON public.page_visit_stats FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin only read reader_progress_stats" ON public.reader_progress_stats;
DROP POLICY IF EXISTS "Public read reader_progress_stats" ON public.reader_progress_stats;
CREATE POLICY "Public read reader_progress_stats" ON public.reader_progress_stats FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read books" ON public.books;
CREATE POLICY "Public read books" ON public.books FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read landing_pages" ON public.landing_pages;
CREATE POLICY "Public read landing_pages" ON public.landing_pages FOR SELECT TO anon, authenticated USING (true);
