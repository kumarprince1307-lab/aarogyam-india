-- =========================================================================
-- AAROGYAM INDIA — AAROGYAM SAKHI AI TELEMETRY & INSIGHTS SCHEMA
-- File: database/07_sakhi_user_insights.sql
-- Version: 1.0 (Zero-Egress Optimized / Minimal Sync)
-- =========================================================================

-- 1. SAKHI USER INSIGHTS TABLE (1 Row per User - Aggregated Interest Summary)
-- Note: 'user_key' can be 10-digit mobile or profile_id. No rigid FK constraint
-- to ensure guest chats & logins never throw database foreign key errors.
CREATE TABLE IF NOT EXISTS public.sakhi_user_insights (
    user_key TEXT PRIMARY KEY,
    profile_id UUID,
    mobile TEXT,
    user_name TEXT DEFAULT 'किसान साथी',
    primary_domain TEXT DEFAULT 'omni', -- 'agri', 'health', 'pashu', 'beauty', 'netsurf', 'business', 'omni'
    domain_scores JSONB DEFAULT '{"agri":0,"health":0,"pashu":0,"beauty":0,"netsurf":0,"business":0}'::jsonb,
    top_subdomains JSONB DEFAULT '[]'::jsonb, -- e.g. ["wheat_rust", "spray_calendar", "diabetes"]
    interaction_count INT DEFAULT 0,
    last_query_topic TEXT, -- Short topic tag only (max 100 chars), NO raw private chat text
    user_tone TEXT DEFAULT 'standard', -- 'dehati', 'business', 'homemaker', 'patient', 'standard'
    recommended_ebook TEXT DEFAULT 'BK002',
    recommended_tube TEXT DEFAULT 'krishi_khetee_doctor',
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup indexes for Admin User Details & Reports
CREATE INDEX IF NOT EXISTS idx_sakhi_insights_mobile ON public.sakhi_user_insights(mobile);
CREATE INDEX IF NOT EXISTS idx_sakhi_insights_profile_id ON public.sakhi_user_insights(profile_id);
CREATE INDEX IF NOT EXISTS idx_sakhi_insights_primary_domain ON public.sakhi_user_insights(primary_domain);
CREATE INDEX IF NOT EXISTS idx_sakhi_insights_last_active ON public.sakhi_user_insights(last_active_at DESC);


-- 2. SAKHI UNANSWERED QUESTIONS TABLE (For Admin Knowledge Hub & Intent Builder)
-- Stores missing/untrained questions from real users so Admin can add answers in 1 click
CREATE TABLE IF NOT EXISTS public.sakhi_unanswered_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    domain TEXT DEFAULT 'omni',
    user_mobile TEXT,
    user_name TEXT,
    share_id TEXT,
    hit_count INT DEFAULT 1,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_asked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_sakhi_unanswered_query UNIQUE (query_text)
);

CREATE INDEX IF NOT EXISTS idx_sakhi_unanswered_domain ON public.sakhi_unanswered_logs(domain);
CREATE INDEX IF NOT EXISTS idx_sakhi_unanswered_hit_count ON public.sakhi_unanswered_logs(hit_count DESC);
CREATE INDEX IF NOT EXISTS idx_sakhi_unanswered_resolved ON public.sakhi_unanswered_logs(is_resolved);


-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.sakhi_user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sakhi_unanswered_logs ENABLE ROW LEVEL SECURITY;

-- Allow read for both anon & authenticated (Admin queries & client profile loaders)
DROP POLICY IF EXISTS "Allow public read sakhi_user_insights" ON public.sakhi_user_insights;
CREATE POLICY "Allow public read sakhi_user_insights" 
ON public.sakhi_user_insights FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
CREATE POLICY "Allow public read sakhi_unanswered_logs" 
ON public.sakhi_unanswered_logs FOR SELECT TO anon, authenticated USING (true);

-- Allow upsert/insert
DROP POLICY IF EXISTS "Allow public insert sakhi_user_insights" ON public.sakhi_user_insights;
CREATE POLICY "Allow public insert sakhi_user_insights" 
ON public.sakhi_user_insights FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update sakhi_user_insights" ON public.sakhi_user_insights;
CREATE POLICY "Allow public update sakhi_user_insights" 
ON public.sakhi_user_insights FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
CREATE POLICY "Allow public insert sakhi_unanswered_logs" 
ON public.sakhi_unanswered_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update sakhi_unanswered_logs" ON public.sakhi_unanswered_logs;
CREATE POLICY "Allow public update sakhi_unanswered_logs" 
ON public.sakhi_unanswered_logs FOR UPDATE TO anon, authenticated USING (true);


-- 4. ULTRA-LOW-EGRESS ATOMIC RPC FUNCTION (0 BYTES SERVER RETURN = 204 NO-CONTENT)
-- Calling this function writes/updates the row atomically and returns VOID (0 egress bill).
CREATE OR REPLACE FUNCTION public.sync_sakhi_user_insight(
    p_user_key TEXT,
    p_profile_id UUID DEFAULT NULL,
    p_mobile TEXT DEFAULT NULL,
    p_user_name TEXT DEFAULT 'किसान साथी',
    p_primary_domain TEXT DEFAULT 'omni',
    p_domain_scores JSONB DEFAULT '{}'::jsonb,
    p_top_subdomains JSONB DEFAULT '[]'::jsonb,
    p_increment_chats INT DEFAULT 1,
    p_last_query_topic TEXT DEFAULT '',
    p_user_tone TEXT DEFAULT 'standard',
    p_recommended_ebook TEXT DEFAULT 'BK002',
    p_recommended_tube TEXT DEFAULT 'krishi_khetee_doctor'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.sakhi_user_insights (
        user_key,
        profile_id,
        mobile,
        user_name,
        primary_domain,
        domain_scores,
        top_subdomains,
        interaction_count,
        last_query_topic,
        user_tone,
        recommended_ebook,
        recommended_tube,
        last_active_at,
        created_at,
        updated_at
    )
    VALUES (
        p_user_key,
        p_profile_id,
        p_mobile,
        p_user_name,
        p_primary_domain,
        p_domain_scores,
        p_top_subdomains,
        GREATEST(1, p_increment_chats),
        LEFT(p_last_query_topic, 100),
        p_user_tone,
        p_recommended_ebook,
        p_recommended_tube,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (user_key) DO UPDATE SET
        profile_id = COALESCE(EXCLUDED.profile_id, public.sakhi_user_insights.profile_id),
        mobile = COALESCE(EXCLUDED.mobile, public.sakhi_user_insights.mobile),
        user_name = COALESCE(EXCLUDED.user_name, public.sakhi_user_insights.user_name),
        primary_domain = EXCLUDED.primary_domain,
        domain_scores = EXCLUDED.domain_scores,
        top_subdomains = EXCLUDED.top_subdomains,
        interaction_count = public.sakhi_user_insights.interaction_count + EXCLUDED.interaction_count,
        last_query_topic = COALESCE(NULLIF(EXCLUDED.last_query_topic, ''), public.sakhi_user_insights.last_query_topic),
        user_tone = EXCLUDED.user_tone,
        recommended_ebook = EXCLUDED.recommended_ebook,
        recommended_tube = EXCLUDED.recommended_tube,
        last_active_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. ATOMIC RPC FOR UNANSWERED QUESTIONS LOGGING
CREATE OR REPLACE FUNCTION public.log_sakhi_unanswered_query(
    p_query_text TEXT,
    p_domain TEXT DEFAULT 'omni',
    p_user_mobile TEXT DEFAULT NULL,
    p_user_name TEXT DEFAULT NULL,
    p_share_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.sakhi_unanswered_logs (
        query_text,
        domain,
        user_mobile,
        user_name,
        share_id,
        hit_count,
        last_asked_at
    )
    VALUES (
        TRIM(p_query_text),
        p_domain,
        p_user_mobile,
        p_user_name,
        p_share_id,
        1,
        NOW()
    )
    ON CONFLICT (query_text) DO UPDATE SET
        hit_count = public.sakhi_unanswered_logs.hit_count + 1,
        last_asked_at = NOW(),
        domain = COALESCE(EXCLUDED.domain, public.sakhi_unanswered_logs.domain);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
