-- =========================================================================
-- AAROGYAM INDIA — WALLET & WALLET_TRANSACTIONS TABLES
-- Version: 1.0 (Share & Earn Reward Engine — Zero Egress)
-- =========================================================================

-- 1. WALLETS TABLE (1 row per user — summary / running balance)
CREATE TABLE IF NOT EXISTS public.wallets (
    profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance         NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    total_earned    NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    total_spent     NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    expires_at      TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_wallets_profile ON public.wallets(profile_id);

-- 2. WALLET_TRANSACTIONS TABLE (audit trail of every credit/debit)
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    title       TEXT NOT NULL,
    order_id    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_txn_profile ON public.wallet_transactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txn_created ON public.wallet_transactions(created_at DESC);

-- 3. ROW LEVEL SECURITY
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallets: user can read/write only their own row
DROP POLICY IF EXISTS "wallet_own_read" ON public.wallets;
CREATE POLICY "wallet_own_read"
ON public.wallets FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "wallet_own_upsert" ON public.wallets;
CREATE POLICY "wallet_own_upsert"
ON public.wallets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "wallet_own_update" ON public.wallets;
CREATE POLICY "wallet_own_update"
ON public.wallets FOR UPDATE
TO authenticated
USING (auth.uid() = profile_id);

-- Admin can read all wallets (for reporting)
DROP POLICY IF EXISTS "wallet_admin_read" ON public.wallets;
CREATE POLICY "wallet_admin_read"
ON public.wallets FOR SELECT
TO anon, authenticated
USING (true);  -- adjust to admin check if needed

-- Wallet Transactions: user can read own + insert own
DROP POLICY IF EXISTS "wallet_txn_own_read" ON public.wallet_transactions;
CREATE POLICY "wallet_txn_own_read"
ON public.wallet_transactions FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "wallet_txn_own_insert" ON public.wallet_transactions;
CREATE POLICY "wallet_txn_own_insert"
ON public.wallet_transactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- Admin can read all transactions
DROP POLICY IF EXISTS "wallet_txn_admin_read" ON public.wallet_transactions;
CREATE POLICY "wallet_txn_admin_read"
ON public.wallet_transactions FOR SELECT
TO anon, authenticated
USING (true);  -- adjust to admin check if needed
