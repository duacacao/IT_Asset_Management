-- Database Initialization Script

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create profiles table (mocking auth.users for standalone DB)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to gen_random_uuid()
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    avatar_url TEXT, -- Added avatar_url
    settings JSONB DEFAULT '{}', -- Kept for compatibility if needed, though not in snippet
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create devices table (without end_user_id FK initially to avoid circular dependency)
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to gen_random_uuid()
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Changed from user_id to owner_id
    code TEXT UNIQUE, -- Added UNIQUE constraint
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    specs JSONB DEFAULT '{}', -- Renamed from device_info? Snippet has specs. Kept specs.
    location TEXT, -- Added
    purchase_date TIMESTAMP, -- Added
    warranty_exp TIMESTAMP, -- Added
    notes TEXT, -- Added
    end_user_id UUID UNIQUE, -- 1-1 relationship with end_users, FK added later
    device_info JSONB DEFAULT '{}', -- Kept to avoid breaking existing logic if any
    file_name TEXT, -- Kept
    metadata JSONB DEFAULT '{}', -- Kept
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create end_users table
CREATE TABLE IF NOT EXISTS public.end_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_id UUID UNIQUE REFERENCES public.devices(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create device_sheets table
CREATE TABLE IF NOT EXISTS public.device_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    sheet_name TEXT NOT NULL,
    sheet_data JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Add Circular Foreign Key for devices -> end_users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_devices_end_user'
    ) THEN
        ALTER TABLE public.devices 
        ADD CONSTRAINT fk_devices_end_user 
        FOREIGN KEY (end_user_id) REFERENCES public.end_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. Add Indexes
CREATE INDEX IF NOT EXISTS idx_devices_owner_id ON public.devices(owner_id); -- Changed to owner_id
CREATE INDEX IF NOT EXISTS idx_devices_end_user_id ON public.devices(end_user_id);
CREATE INDEX IF NOT EXISTS idx_device_sheets_device_id ON public.device_sheets(device_id);
CREATE INDEX IF NOT EXISTS idx_end_users_device_id ON public.end_users(device_id);
CREATE INDEX IF NOT EXISTS idx_end_users_user_id ON public.end_users(user_id);

-- 9. Setup RLS (Row Level Security)
ALTER TABLE public.end_users ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
DO $$
BEGIN
    -- Drop existing policies to avoid errors on re-run
    DROP POLICY IF EXISTS "Users can view own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can insert own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can update own end_users" ON public.end_users;
    DROP POLICY IF EXISTS "Users can delete own end_users" ON public.end_users;

    -- Create policies
    CREATE POLICY "Users can view own end_users" ON public.end_users
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own end_users" ON public.end_users
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own end_users" ON public.end_users
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own end_users" ON public.end_users
        FOR DELETE USING (auth.uid() = user_id);
END $$;