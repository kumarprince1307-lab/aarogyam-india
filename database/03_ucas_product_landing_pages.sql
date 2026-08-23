-- =========================================================================
-- UCAS V1 — PRODUCT LANDING PAGES & SOCIAL OPEN GRAPH SCHEMA
-- Supabase SQL Script with OG Title, OG Description, OG Image & Leads Tracking
-- =========================================================================

-- =========================================================================
-- 1. PRODUCT LANDING PAGES TABLE (उत्पाद लैंडिंग पेज + Open Graph थंबनेल सपोर्ट)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.product_landing_pages (
    id TEXT PRIMARY KEY,                                -- उदा. 'LP_PROD_001' या UUID
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    share_id TEXT,                                      -- प्रमोटर की Share ID (उदा. 'AI000004')
    title TEXT NOT NULL,                                -- प्रोडक्ट का नाम / शीर्षक
    category TEXT NOT NULL DEFAULT 'product',           -- 'product', 'agriculture', 'healthcare', 'beautycare'
    content_type TEXT NOT NULL DEFAULT 'product',       -- 'product'
    image_url TEXT,                                     -- प्रोडक्ट की मुख्य इमेज
    thumbnail_url TEXT,                                 -- थंबनेल इमेज
    description TEXT,                                   -- प्रोडक्ट विवरण / मैसेज
    mrp NUMERIC(10, 2) DEFAULT 0.00,                   -- असली MRP (₹)
    offer_price NUMERIC(10, 2) NOT NULL,               -- ऑफर / डिस्काउंट प्राइस (₹)
    buynow_url TEXT NOT NULL,                           -- थर्ड-पार्टी "Buy Now" लिंक

    -- 🌟 Open Graph (OG) थंबनेल, टाइटल व डिस्क्रिप्शन (WhatsApp/Facebook/Insta शेयरिंग के लिए)
    og_title TEXT,                                      -- WhatsApp/FB शेयर टाइटल (अलग-अलग पोस्टर टाइटल)
    og_description TEXT,                                -- WhatsApp/FB शेयर विवरण / मैसेज
    og_image_url TEXT,                                  -- WhatsApp/FB शेयर थंबनेल पोस्टर इमेज URL

    status TEXT NOT NULL DEFAULT 'active',              -- 'active', 'pending_review', 'disabled'
    response_count INTEGER DEFAULT 0,                   -- कुल विज़िटर्स / क्लिक्स
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- फ़ास्ट सर्च के लिए इंडेक्स (Indexes)
CREATE INDEX IF NOT EXISTS idx_prod_lp_profile_id ON public.product_landing_pages(profile_id);
CREATE INDEX IF NOT EXISTS idx_prod_lp_share_id ON public.product_landing_pages(share_id);
CREATE INDEX IF NOT EXISTS idx_prod_lp_status ON public.product_landing_pages(status);


-- =========================================================================
-- 2. PRODUCT LEADS TABLE (बाय नाउ क्लिक पर लीड कैप्चर)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.product_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    landing_id TEXT,                                    -- किस लैंडिंग पेज से क्लिक आया
    referrer_share_id TEXT,                             -- प्रमोटर की Share ID
    name TEXT NOT NULL DEFAULT 'Product Visitor',       -- ग्राहक का नाम
    mobile TEXT NOT NULL,                               -- ग्राहक का मोबाइल नंबर
    product_name TEXT NOT NULL,                         -- किस प्रोडक्ट पर क्लिक किया
    source TEXT NOT NULL DEFAULT 'product_landing_page',-- लीड सोर्स
    external_url TEXT,                                  -- जिस थर्ड-पार्टी लिंक पर भेजा गया
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- लीड्स सर्च व रिपोर्टिंग के लिए इंडेक्स
CREATE INDEX IF NOT EXISTS idx_prod_leads_profile_id ON public.product_leads(profile_id);
CREATE INDEX IF NOT EXISTS idx_prod_leads_mobile ON public.product_leads(mobile);
CREATE INDEX IF NOT EXISTS idx_prod_leads_source ON public.product_leads(source);
CREATE INDEX IF NOT EXISTS idx_prod_leads_created_at ON public.product_leads(created_at DESC);


-- =========================================================================
-- 3. मौजूदा landing_pages टेबल में प्रोडक्ट व OG कॉलम्स जोड़ना (यदि पहले से बनी हो)
-- =========================================================================
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS product_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS offer_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS buynow_url TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image_url TEXT;


-- =========================================================================
-- 4. ROW LEVEL SECURITY (RLS) सुरक्षा नियम
-- =========================================================================
ALTER TABLE public.product_landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_leads ENABLE ROW LEVEL SECURITY;

-- 1. कोई भी विज़िटर एक्टिव लैंडिंग पेज देख सकता है
CREATE POLICY "Public can view active product landing pages" 
ON public.product_landing_pages FOR SELECT 
USING (status = 'active');

-- 2. यूजर अपने बनाए प्रोडक्ट लैंडिंग पेज मैनेज कर सकता है
CREATE POLICY "Users can manage own product landing pages" 
ON public.product_landing_pages FOR ALL 
USING (auth.uid() = profile_id);

-- 3. बाय नाउ क्लिक करने पर कोई भी लीड इंसर्ट हो सकती है
CREATE POLICY "Public can insert product leads" 
ON public.product_leads FOR INSERT 
WITH CHECK (true);

-- 4. यूजर अपने हिस्से की लीड्स देख सकता है
CREATE POLICY "Users can view own product leads" 
ON public.product_leads FOR SELECT 
USING (auth.uid() = profile_id);
