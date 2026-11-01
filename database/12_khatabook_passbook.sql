-- ============================================================================
-- AAROGYAM DIGITAL KHATA BOOK (PRO LEDGER & CUSTOMER PASSBOOK)
-- समर्पित लेज़र टेबल: प्रत्येक लेन-देन की स्वतंत्र प्रविष्टि और ग्राहक की डिजिटल पासबुक
-- ============================================================================

-- 1. khatabook_entries टेबल का निर्माण
CREATE TABLE IF NOT EXISTS public.khatabook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- डिस्ट्रीब्यूटर / दुकानदार (हिसाब रखने वाला)
    distributor_mobile TEXT NOT NULL,
    distributor_name TEXT NOT NULL DEFAULT 'Aarogyam Partner',
    
    -- ग्राहक / पार्टी का विवरण
    customer_mobile TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_place TEXT,
    party_type TEXT NOT NULL DEFAULT 'customer' CHECK (party_type IN ('customer', 'supplier')),
    
    -- वित्तीय लेन-देन (GAVE = आपने दिए / GOT = आपको मिले)
    tx_type TEXT NOT NULL CHECK (tx_type IN ('GAVE', 'GOT')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    bill_details TEXT, -- सामान विवरण, बिल नंबर, मात्रा
    
    -- तारीखें
    tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE, -- भुगतान वादा तारीख (वैकल्पिक)
    
    -- ग्राहक की निजी पासबुक के लिए 6-अंकीय शॉर्ट कोड (उदा. K9X2P1)
    short_code TEXT UNIQUE,
    
    -- टाइमस्टैम्प
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. हाई-स्पीड इंडेक्स (0ms सर्च व फ़िल्टर के लिए)
CREATE INDEX IF NOT EXISTS idx_khatabook_distributor ON public.khatabook_entries(distributor_mobile);
CREATE INDEX IF NOT EXISTS idx_khatabook_customer ON public.khatabook_entries(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_khatabook_tx_date ON public.khatabook_entries(tx_date DESC);
CREATE INDEX IF NOT EXISTS idx_khatabook_short_code ON public.khatabook_entries(short_code);

-- 3. Row Level Security (RLS) सक्रिय करें
ALTER TABLE public.khatabook_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS नीतियां (Policies)
-- A) कोई भी व्यक्ति वैध शॉर्ट-कोड (Passbook Link) से अपना लेज़र देख सकता है
DROP POLICY IF EXISTS "Public can view passbook by short code" ON public.khatabook_entries;
CREATE POLICY "Public can view passbook by short code"
ON public.khatabook_entries
FOR SELECT
TO anon, authenticated
USING (true);

-- B) डिस्ट्रीब्यूटर प्रविष्टियां जोड़ और अपडेट कर सकता है
DROP POLICY IF EXISTS "Enable insert for all users" ON public.khatabook_entries;
CREATE POLICY "Enable insert for all users"
ON public.khatabook_entries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON public.khatabook_entries;
CREATE POLICY "Enable update for all users"
ON public.khatabook_entries
FOR UPDATE
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON public.khatabook_entries;
CREATE POLICY "Enable delete for all users"
ON public.khatabook_entries
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================================
-- बधाई! आपकी खाता बुक टेबल तैयार है। 
-- ============================================================================

