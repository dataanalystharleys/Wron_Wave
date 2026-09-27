-- ==============================================================================
-- WRON_WAVE CLOTHING - 100% FREE TIER SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Run this in your Supabase Project Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Users Table (Customer Data Storage)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Orders Table (Customer Orders Storage)
CREATE TABLE IF NOT EXISTS public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    shipping_address TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) Configuration
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Public Policies for Testing (Permits Web App to Insert & Read without Complex Policies)
CREATE POLICY "Allow public select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

-- 5. Indexes for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders (order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
