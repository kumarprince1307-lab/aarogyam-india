-- =========================================================================
-- UCAS V1 — UNIVERSAL CUSTOMER ACQUISITION SYSTEM
-- DATABASE SCHEMA: THREE APPROVED TABLES
-- =========================================================================

-- 1. PUBLIC.SURVEYS
-- Stores intelligent multi-category survey records (1 person, 1 record, multi-categories)
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    age INTEGER,
    sex TEXT,
    state TEXT,
    district TEXT,
    area TEXT,
    village TEXT,
    occupation TEXT,
    selected_categories JSONB DEFAULT '[]'::jsonb,
    category_answers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by user and mobile
CREATE INDEX IF NOT EXISTS idx_surveys_profile_id ON public.surveys(profile_id);
CREATE INDEX IF NOT EXISTS idx_surveys_mobile ON public.surveys(mobile);

-- 2. PUBLIC.PHONEBOOK
-- Stores contact management entries (manual, phonebook import, csv import)
CREATE TABLE IF NOT EXISTS public.phonebook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    place TEXT,
    source TEXT DEFAULT 'manual', -- 'manual', 'phonebook', 'csv', 'survey'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup & user ownership isolation
CREATE INDEX IF NOT EXISTS idx_phonebook_profile_id ON public.phonebook(profile_id);
CREATE INDEX IF NOT EXISTS idx_phonebook_mobile ON public.phonebook(mobile);

-- 3. PUBLIC.PERMISSIONS
-- Stores admin-controlled permission flags per profile
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_profile_permission UNIQUE (profile_id, permission_key)
);

-- Index for fast permission lookups
CREATE INDEX IF NOT EXISTS idx_permissions_profile_id ON public.permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON public.permissions(permission_key);
