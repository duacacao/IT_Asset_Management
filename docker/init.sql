-- Database Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (mocking auth.users for standalone DB)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create devices table
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    end_user_id UUID UNIQUE, -- 1-1 relationship with end_users
    code TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    device_info JSONB DEFAULT '{}',
    file_name TEXT,
    metadata JSONB DEFAULT '{}',
    specs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create end_users table (người dùng cuối sử dụng thiết bị)
CREATE TABLE IF NOT EXISTS public.end_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create device_sheets table
CREATE TABLE IF NOT EXISTS public.device_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    sheet_name TEXT NOT NULL,
    sheet_data JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for end_user_id in devices (after end_users table exists)
ALTER TABLE public.devices 
ADD CONSTRAINT fk_devices_end_user 
FOREIGN KEY (end_user_id) REFERENCES public.end_users(id) ON DELETE SET NULL;

-- Add default indexes
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_end_user_id ON public.devices(end_user_id);
CREATE INDEX IF NOT EXISTS idx_device_sheets_device_id ON public.device_sheets(device_id);
CREATE INDEX IF NOT EXISTS idx_end_users_device_id ON public.end_users(device_id);
