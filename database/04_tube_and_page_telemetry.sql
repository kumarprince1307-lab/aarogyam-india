-- =========================================================================
-- AAROGYAM INDIA — TUBE & PAGE TELEMETRY SCHEMA (0-EGRESS OPTIMIZED)
-- Version: 1.0 (Live Views, Likes, Comments & Page Demand Tracking)
-- =========================================================================

-- 1. AAROGYAMTUBE VIDEO STATS TABLE (1 Row per Video - Aggregated Counters)
CREATE TABLE IF NOT EXISTS public.tube_video_stats (
    video_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Agriculture',
    views BIGINT DEFAULT 0,
    completions BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    comments_count BIGINT DEFAULT 0,
    total_watch_seconds BIGINT DEFAULT 0,
    last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning-fast queries and zero-lag sorting
CREATE INDEX IF NOT EXISTS idx_tube_video_stats_views ON public.tube_video_stats(views DESC);
CREATE INDEX IF NOT EXISTS idx_tube_video_stats_likes ON public.tube_video_stats(likes DESC);
CREATE INDEX IF NOT EXISTS idx_tube_video_stats_cat ON public.tube_video_stats(category);

-- 2. PAGE VISIT STATS TABLE (1 Row per Page - Aggregated Counters)
CREATE TABLE IF NOT EXISTS public.page_visit_stats (
    page_key TEXT PRIMARY KEY,
    page_path TEXT NOT NULL,
    category TEXT DEFAULT 'health',
    visits BIGINT DEFAULT 0,
    total_duration_seconds BIGINT DEFAULT 0,
    last_visit_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_visit_stats_visits ON public.page_visit_stats(visits DESC);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.tube_video_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visit_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for admin reporting & live counters)
DROP POLICY IF EXISTS "Allow public read tube_video_stats" ON public.tube_video_stats;
CREATE POLICY "Allow public read tube_video_stats" 
ON public.tube_video_stats FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public read page_visit_stats" ON public.page_visit_stats;
CREATE POLICY "Allow public read page_visit_stats" 
ON public.page_visit_stats FOR SELECT TO anon, authenticated USING (true);

-- 4. ULTRA-EFFICIENT ATOMIC RPC FUNCTIONS (ZERO-EGRESS WRITE CALLS)
-- Calling these returns 204 No-Content (0 bytes egress!) while incrementing counters atomically.

-- A) Video Stat Increment RPC
CREATE OR REPLACE FUNCTION public.increment_video_stat(
    v_id TEXT,
    v_title TEXT,
    v_category TEXT DEFAULT 'Agriculture',
    stat_type TEXT DEFAULT 'view',
    watch_secs BIGINT DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.tube_video_stats (video_id, title, category, views, completions, likes, comments_count, total_watch_seconds, last_viewed_at)
    VALUES (
        v_id,
        v_title,
        v_category,
        CASE WHEN stat_type = 'view' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'completion' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'like' THEN 1 ELSE 0 END,
        CASE WHEN stat_type = 'comment' THEN 1 ELSE 0 END,
        watch_secs,
        NOW()
    )
    ON CONFLICT (video_id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        views = public.tube_video_stats.views + (CASE WHEN stat_type = 'view' THEN 1 ELSE 0 END),
        completions = public.tube_video_stats.completions + (CASE WHEN stat_type = 'completion' THEN 1 ELSE 0 END),
        likes = public.tube_video_stats.likes + (CASE WHEN stat_type = 'like' THEN 1 ELSE 0 END),
        comments_count = public.tube_video_stats.comments_count + (CASE WHEN stat_type = 'comment' THEN 1 ELSE 0 END),
        total_watch_seconds = public.tube_video_stats.total_watch_seconds + watch_secs,
        last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B) Page Visit Increment RPC
CREATE OR REPLACE FUNCTION public.increment_page_stat(
    p_key TEXT,
    p_path TEXT,
    p_cat TEXT DEFAULT 'health',
    dur_secs BIGINT DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.page_visit_stats (page_key, page_path, category, visits, total_duration_seconds, last_visit_at)
    VALUES (p_key, p_path, p_cat, 1, dur_secs, NOW())
    ON CONFLICT (page_key) DO UPDATE SET
        visits = public.page_visit_stats.visits + 1,
        total_duration_seconds = public.page_visit_stats.total_duration_seconds + dur_secs,
        last_visit_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
