-- =========================================================================
-- UCAS V1 — MARKETING ENGINE: LANDING PAGES SCHEMA
-- Stores user/admin created landing page configurations
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.landing_pages (
    id TEXT PRIMARY KEY,                          -- e.g. 'LP000001' or UUID
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_id TEXT,                                -- Creator's referral code / Share ID e.g. 'AI000004'
    title TEXT NOT NULL,                          -- e.g. 'Kharif Special 2026'
    category TEXT NOT NULL DEFAULT 'agriculture', -- 'agriculture', 'healthcare', 'cattlecare', 'beautycare', 'haircare', 'netsurf', 'other'
    content_type TEXT NOT NULL DEFAULT 'image',   -- 'image' or 'youtube'
    media_url TEXT NOT NULL,                      -- Image data URL / URL or YouTube link / ID
    thumbnail_url TEXT,                           -- YouTube high-res thumbnail or preview URL
    message TEXT NOT NULL,                        -- Custom invitation / call-to-action message
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast creator lookup
CREATE INDEX IF NOT EXISTS idx_landing_pages_profile_id ON public.landing_pages(profile_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_share_id ON public.landing_pages(share_id);
