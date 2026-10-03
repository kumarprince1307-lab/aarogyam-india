-- =========================================================================
-- AAROGYAM INDIA — EBOOK READER & AUDIO TELEMETRY (0-EGRESS OPTIMIZED)
-- Version: 1.0 (Real Live Reading Progress, Pages & Audio Listening)
-- =========================================================================

-- 1. READER PROGRESS STATS TABLE (1 Row per User per Book)
CREATE TABLE IF NOT EXISTS public.reader_progress_stats (
    user_key TEXT NOT NULL,
    user_name TEXT DEFAULT 'किसान साथी',
    book_id TEXT NOT NULL,
    current_page INT DEFAULT 1,
    total_pages INT DEFAULT 1,
    percent INT DEFAULT 0,
    audio_seconds BIGINT DEFAULT 0,
    opens_count BIGINT DEFAULT 1,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_key, book_id)
);

-- Indexes for ultra-fast sorting and 0-lag queries
CREATE INDEX IF NOT EXISTS idx_reader_progress_book ON public.reader_progress_stats(book_id);
CREATE INDEX IF NOT EXISTS idx_reader_progress_user ON public.reader_progress_stats(user_key);
CREATE INDEX IF NOT EXISTS idx_reader_progress_last_read ON public.reader_progress_stats(last_read_at DESC);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.reader_progress_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for admin reporting & live reader counts)
DROP POLICY IF EXISTS "Allow public read reader_progress_stats" ON public.reader_progress_stats;
CREATE POLICY "Allow public read reader_progress_stats" 
ON public.reader_progress_stats FOR SELECT TO anon, authenticated USING (true);

-- 3. ZERO-EGRESS ATOMIC RPC FUNCTION (RETURNS 204 NO-CONTENT = 0 BYTES EGRESS)
CREATE OR REPLACE FUNCTION public.sync_reader_progress(
    p_user_key TEXT,
    p_user_name TEXT DEFAULT 'किसान साथी',
    p_book_id TEXT DEFAULT 'BK002',
    p_page INT DEFAULT 1,
    p_total_pages INT DEFAULT 1,
    p_audio_secs INT DEFAULT 0,
    p_is_open BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
DECLARE
    calc_percent INT;
BEGIN
    IF p_total_pages > 0 THEN
        calc_percent := LEAST(100, ROUND((p_page::numeric / p_total_pages::numeric) * 100));
    ELSE
        calc_percent := 0;
    END IF;

    INSERT INTO public.reader_progress_stats (
        user_key,
        user_name,
        book_id,
        current_page,
        total_pages,
        percent,
        audio_seconds,
        opens_count,
        last_read_at,
        created_at
    )
    VALUES (
        p_user_key,
        COALESCE(NULLIF(p_user_name, ''), 'किसान साथी'),
        p_book_id,
        p_page,
        p_total_pages,
        calc_percent,
        p_audio_secs,
        CASE WHEN p_is_open THEN 1 ELSE 0 END,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_key, book_id) DO UPDATE SET
        user_name = COALESCE(NULLIF(EXCLUDED.user_name, ''), public.reader_progress_stats.user_name),
        current_page = GREATEST(public.reader_progress_stats.current_page, EXCLUDED.current_page),
        total_pages = GREATEST(public.reader_progress_stats.total_pages, EXCLUDED.total_pages),
        percent = CASE 
            WHEN GREATEST(public.reader_progress_stats.total_pages, EXCLUDED.total_pages) > 0 THEN 
                LEAST(100, ROUND((GREATEST(public.reader_progress_stats.current_page, EXCLUDED.current_page)::numeric / GREATEST(public.reader_progress_stats.total_pages, EXCLUDED.total_pages)::numeric) * 100))
            ELSE 0 
        END,
        audio_seconds = public.reader_progress_stats.audio_seconds + EXCLUDED.audio_seconds,
        opens_count = public.reader_progress_stats.opens_count + (CASE WHEN p_is_open THEN 1 ELSE 0 END),
        last_read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
