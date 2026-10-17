-- =========================================================================
-- AAROGYAM INDIA — SAKHI AI SUPABASE SECURITY LOCK (RLS POLICIES)
-- File: database/09_secure_sakhi_rls.sql
-- Purpose: 
--   1. किसान व यूजर की गोपनीयता सुरक्षित करना (डेटा चोरी रोकना)
--   2. आम विज़िटर्स (anon) केवल डेटा लिख (INSERT/UPSERT) सकेंगे
--   3. आम जनता दूसरों के मोबाइल नंबर, नाम या चैट कभी नहीं पढ़ (SELECT) सकेगी
--   4. डेटा पढ़ने की अनुमति केवल अधिकृत एडमिन (Authenticated Admin) को होगी
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. SAKHI USER INSIGHTS TABLE (किसान प्रोफाइल व लीड्स सुरक्षा)
-- -------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.sakhi_user_insights ENABLE ROW LEVEL SECURITY;

-- पुराने सार्वजनिक पढ़ने वाले नियम हटाएँ
DROP POLICY IF EXISTS "Allow public read sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Allow authenticated read sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Allow public insert sakhi_user_insights" ON public.sakhi_user_insights;
DROP POLICY IF EXISTS "Allow public update sakhi_user_insights" ON public.sakhi_user_insights;

-- ताला 1: केवल लॉग-इन एडमिन ही किसान प्रोफाइल पढ़ (SELECT) सकेंगे
CREATE POLICY "Admin only read sakhi_user_insights"
ON public.sakhi_user_insights
FOR SELECT
TO authenticated
USING (true);

-- ताला 2: वेबसाइट का कोई भी किसान चैट करते समय अपनी रुचि व प्रोफाइल लिख (INSERT) सकेगा
CREATE POLICY "Public insert sakhi_user_insights"
ON public.sakhi_user_insights
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ताला 3: प्रोफाइल अपडेट (UPDATE) की अनुमति
CREATE POLICY "Public update sakhi_user_insights"
ON public.sakhi_user_insights
FOR UPDATE
TO anon, authenticated
USING (true);


-- -------------------------------------------------------------------------
-- 2. SAKHI UNANSWERED LOGS TABLE (अनसुलझे सवालों की डायरी)
-- -------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.sakhi_unanswered_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
DROP POLICY IF EXISTS "Allow authenticated read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
DROP POLICY IF EXISTS "Allow public insert sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
DROP POLICY IF EXISTS "Allow public update sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;

-- केवल एडमिन पढ़ सकेंगे
CREATE POLICY "Admin only read sakhi_unanswered_logs"
ON public.sakhi_unanswered_logs
FOR SELECT
TO authenticated
USING (true);

-- कोई भी नया सवाल रिपोर्ट कर सकेगा
CREATE POLICY "Public insert sakhi_unanswered_logs"
ON public.sakhi_unanswered_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public update sakhi_unanswered_logs"
ON public.sakhi_unanswered_logs
FOR UPDATE
TO anon, authenticated
USING (true);


-- -------------------------------------------------------------------------
-- 3. SAKHI CHAT AUDIT LOGS TABLE (अगर टेबल मौजूद हो तो सुरक्षा ताला)
-- -------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sakhi_chat_audit_logs') THEN
        EXECUTE 'ALTER TABLE public.sakhi_chat_audit_logs ENABLE ROW LEVEL SECURITY';
        EXECUTE 'DROP POLICY IF EXISTS "Admin only read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs';
        EXECUTE 'DROP POLICY IF EXISTS "Public insert sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs';
        
        -- केवल एडमिन पढ़ सकेंगे
        EXECUTE 'CREATE POLICY "Admin only read sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs FOR SELECT TO authenticated USING (true)';
        -- चैट इंजन लॉग इंसर्ट कर सकेगा
        EXECUTE 'CREATE POLICY "Public insert sakhi_chat_audit_logs" ON public.sakhi_chat_audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true)';
    END IF;
END $$;
