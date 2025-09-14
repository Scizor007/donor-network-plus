-- Complete Database Setup for Donor Network Plus
-- Run this script in your Supabase SQL Editor

-- 1. Create profiles table (main user profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    location TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_available BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_verified_hospital BOOLEAN DEFAULT false,
    user_type TEXT DEFAULT 'user' CHECK (user_type IN ('user', 'donor', 'hospital', 'admin')),
    last_donation_date DATE,
    medical_conditions BOOLEAN DEFAULT false,
    taking_medications BOOLEAN DEFAULT false,
    recent_illness BOOLEAN DEFAULT false,
    health_report_url TEXT,
    hospital_license TEXT,
    distance_km DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Create blood_banks table
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    operating_hours TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    is_active BOOLEAN DEFAULT true,
    license_number TEXT,
    city TEXT,
    state TEXT,
    district TEXT,
    services TEXT[],
    status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'temporarily_closed', 'permanently_closed')),
    website TEXT,
    accreditation TEXT[],
    capacity_daily INTEGER,
    last_inspection_date DATE,
    next_inspection_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create blood_inventory table
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_available INTEGER DEFAULT 0,
    expiry_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Create blood_requests table
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_needed INTEGER NOT NULL DEFAULT 1,
    hospital_name TEXT NOT NULL,
    hospital_address TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    additional_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Create donation_requests table
CREATE TABLE IF NOT EXISTS public.donation_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_needed INTEGER NOT NULL DEFAULT 1,
    campaign_name TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    contact_phone TEXT,
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Create hospital_staff table
CREATE TABLE IF NOT EXISTS public.hospital_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    position TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- 7. Create emergency_locations table
CREATE TABLE IF NOT EXISTS public.emergency_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hospital', 'blood_bank', 'clinic', 'emergency_center')),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_24_hours BOOLEAN DEFAULT false,
    operating_hours TEXT,
    services TEXT[],
    emergency_contact TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Create blood_donation_camps table
CREATE TABLE IF NOT EXISTS public.blood_donation_camps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    organizer_id UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    organizer_name TEXT NOT NULL,
    venue TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DECIMAL,
    longitude DECIMAL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_units INTEGER DEFAULT 0,
    actual_units INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    registration_required BOOLEAN DEFAULT true,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donation_camps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Everyone can view donor profiles" ON public.profiles;
CREATE POLICY "Everyone can view donor profiles" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'donor' AND is_available = true);

-- Create RLS policies for other tables
DROP POLICY IF EXISTS "Everyone can view active blood banks" ON public.blood_banks;
CREATE POLICY "Everyone can view active blood banks" 
ON public.blood_banks 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Everyone can view blood inventory" ON public.blood_inventory;
CREATE POLICY "Everyone can view blood inventory" 
ON public.blood_inventory 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Everyone can view blood requests" ON public.blood_requests;
CREATE POLICY "Everyone can view blood requests" 
ON public.blood_requests 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create blood requests" ON public.blood_requests;
CREATE POLICY "Authenticated users can create blood requests" 
ON public.blood_requests 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Everyone can view donation requests" ON public.donation_requests;
CREATE POLICY "Everyone can view donation requests" 
ON public.donation_requests 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Everyone can view emergency locations" ON public.emergency_locations;
CREATE POLICY "Everyone can view emergency locations" 
ON public.emergency_locations 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Everyone can view active camps" ON public.blood_donation_camps;
CREATE POLICY "Everyone can view active camps" 
ON public.blood_donation_camps 
FOR SELECT 
USING (status IN ('upcoming', 'ongoing'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_is_available ON public.profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_blood_banks_city_state ON public.blood_banks(city, state);
CREATE INDEX IF NOT EXISTS idx_blood_banks_is_active ON public.blood_banks(is_active);

CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_bank_id ON public.blood_inventory(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_group ON public.blood_inventory(blood_group);

CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_donation_requests_hospital_id ON public.donation_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_blood_group ON public.donation_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON public.donation_requests(status);

CREATE INDEX IF NOT EXISTS idx_hospital_staff_user_id ON public.hospital_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_staff_blood_bank_id ON public.hospital_staff(blood_bank_id);

CREATE INDEX IF NOT EXISTS idx_emergency_locations_type ON public.emergency_locations(type);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_city_state ON public.emergency_locations(city, state);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_coordinates ON public.emergency_locations(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_status ON public.blood_donation_camps(status);
CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_city_state ON public.blood_donation_camps(city, state);
CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_dates ON public.blood_donation_camps(start_date, end_date);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blood_banks_updated_at ON public.blood_banks;
CREATE TRIGGER update_blood_banks_updated_at
    BEFORE UPDATE ON public.blood_banks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blood_requests_updated_at ON public.blood_requests;
CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_donation_requests_updated_at ON public.donation_requests;
CREATE TRIGGER update_donation_requests_updated_at
    BEFORE UPDATE ON public.donation_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_hospital_staff_updated_at ON public.hospital_staff;
CREATE TRIGGER update_hospital_staff_updated_at
    BEFORE UPDATE ON public.hospital_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_locations_updated_at ON public.emergency_locations;
CREATE TRIGGER update_emergency_locations_updated_at
    BEFORE UPDATE ON public.emergency_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blood_donation_camps_updated_at ON public.blood_donation_camps;
CREATE TRIGGER update_blood_donation_camps_updated_at
    BEFORE UPDATE ON public.blood_donation_camps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.blood_banks (name, address, phone, email, city, state, latitude, longitude, services) VALUES
('City General Hospital Blood Bank', '123 Medical Center Dr, Downtown', '+91-20-1234-5678', 'bloodbank@citygeneral.com', 'Pune', 'Maharashtra', 18.5204, 73.8567, ARRAY['Blood Collection', 'Blood Storage', 'Emergency Response']),
('Metro Blood Center', '456 Health Plaza, Midtown', '+91-22-5555-8888', 'info@metroblood.com', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, ARRAY['Blood Collection', 'Blood Testing', 'Component Separation']),
('Community Blood Bank', '789 Relief Road, Uptown', '+91-11-2222-3333', 'contact@communityblood.org', 'New Delhi', 'Delhi', 28.6139, 77.2090, ARRAY['Blood Collection', 'Emergency Response', 'Mobile Blood Drives']),
('Regional Blood Center', '321 Life Avenue, Metro District', '+91-80-4444-5555', 'admin@regionalblood.in', 'Bangalore', 'Karnataka', 12.9716, 77.5946, ARRAY['Blood Collection', 'Blood Storage', 'Research']);

-- Insert sample blood inventory
INSERT INTO public.blood_inventory (blood_bank_id, blood_group, units_available, expiry_date)
SELECT 
    bb.id,
    bg.blood_group,
    FLOOR(RANDOM() * 50) + 10,
    CURRENT_DATE + INTERVAL '30 days'
FROM public.blood_banks bb
CROSS JOIN (
    SELECT unnest(ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']) as blood_group
) bg
WHERE bb.name = 'City General Hospital Blood Bank';

-- Insert sample emergency locations
INSERT INTO public.emergency_locations (name, type, address, city, state, latitude, longitude, phone, is_24_hours, services) VALUES
('City General Hospital Emergency', 'hospital', '123 Medical Center Dr, Downtown', 'Pune', 'Maharashtra', 18.5204, 73.8567, '+91-20-1234-5678', true, ARRAY['Emergency', 'Trauma', 'Blood Bank']),
('Red Cross Emergency Center', 'emergency_center', '456 Relief Road, Midtown', 'Mumbai', 'Maharashtra', 19.0760, 72.8777, '+91-22-5555-8888', true, ARRAY['Emergency', 'Blood Collection', 'Disaster Relief']),
('Community Health Clinic', 'clinic', '789 Health St, Uptown', 'New Delhi', 'Delhi', 28.6139, 77.2090, '+91-11-2222-3333', false, ARRAY['Primary Care', 'Blood Collection']),
('Metro Blood Bank Emergency', 'blood_bank', '321 Blood Ave, Metro District', 'Bangalore', 'Karnataka', 12.9716, 77.5946, '+91-80-4444-5555', true, ARRAY['24/7 Blood Bank', 'Emergency Collection']);

-- Insert sample blood donation camps
INSERT INTO public.blood_donation_camps (name, description, organizer_id, organizer_name, venue, address, city, state, latitude, longitude, start_date, end_date, expected_units, contact_phone, contact_email, registration_required, max_participants) 
SELECT 
    'Community Health Drive',
    'Join us for a neighborhood blood donation camp to support local hospitals.',
    bb.id,
    bb.name,
    'Community Hall, Sector 5',
    '123 Health St, Sector 5',
    'Pune',
    'Maharashtra',
    18.5204,
    73.8567,
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
    120,
    '+91-20-1234-5678',
    'camps@citygeneral.com',
    true,
    150
FROM public.blood_banks bb 
WHERE bb.name = 'City General Hospital Blood Bank'
LIMIT 1;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully! All tables created with sample data.' as message;
