-- =========================================================================
-- AAROGYAM INDIA — FARM & LIVESTOCK COLUMNS FOR USER PROFILES & SAKHI INSIGHTS
-- File: database/08_add_farm_livestock_columns.sql
-- =========================================================================

-- 1. Add Farm (Khet) & Livestock (Pashu) to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS khet_acres NUMERIC DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pashu_details TEXT DEFAULT NULL;

-- 2. Add conversational profiling columns to public.sakhi_user_insights (for Admin reporting)
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS khet_acres NUMERIC DEFAULT NULL;
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS pashu_details TEXT DEFAULT NULL;
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS user_district TEXT DEFAULT NULL;
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS user_state TEXT DEFAULT NULL;
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS user_dob TEXT DEFAULT NULL;
ALTER TABLE public.sakhi_user_insights ADD COLUMN IF NOT EXISTS user_occupation TEXT DEFAULT NULL;

COMMENT ON COLUMN public.profiles.khet_acres IS 'किसान के पास कुल कृषि भूमि (एकड़ में)';
COMMENT ON COLUMN public.profiles.pashu_details IS 'किसान के पास मौजूद दुधारू या अन्य पशुओं का विवरण (उदा. 2 गाय, 3 भैंस)';
