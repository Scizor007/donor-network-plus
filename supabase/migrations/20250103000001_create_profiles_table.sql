-- Create profiles table for user profiles and donor information
-- This is the main table for storing user profile data

-- Create profiles table
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

-- Create blood_banks table
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

-- Create blood_inventory table
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_available INTEGER DEFAULT 0,
    expiry_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blood_requests table
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

-- Create donation_requests table (for hospital portal)
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

-- Create hospital_staff table
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

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view donor profiles" 
ON public.profiles 
FOR SELECT 
USING (user_type = 'donor' AND is_available = true);

-- Create RLS policies for blood_banks
CREATE POLICY "Everyone can view active blood banks" 
ON public.blood_banks 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for blood_inventory
CREATE POLICY "Everyone can view blood inventory" 
ON public.blood_inventory 
FOR SELECT 
USING (true);

-- Create RLS policies for blood_requests
CREATE POLICY "Everyone can view blood requests" 
ON public.blood_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create blood requests" 
ON public.blood_requests 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for donation_requests
CREATE POLICY "Everyone can view donation requests" 
ON public.donation_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Hospital staff can manage donation requests" 
ON public.donation_requests 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = donation_requests.hospital_id
        AND hs.is_active = true
    )
);

-- Create RLS policies for hospital_staff
CREATE POLICY "Hospital staff can view their own records" 
ON public.hospital_staff 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Hospital staff can update their own records" 
ON public.hospital_staff 
FOR UPDATE 
USING (auth.uid() = user_id);

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

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_banks_updated_at
    BEFORE UPDATE ON public.blood_banks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blood_requests_updated_at
    BEFORE UPDATE ON public.blood_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donation_requests_updated_at
    BEFORE UPDATE ON public.donation_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hospital_staff_updated_at
    BEFORE UPDATE ON public.hospital_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample blood banks
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

-- Insert sample blood requests
INSERT INTO public.blood_requests (blood_group, units_needed, hospital_name, hospital_address, contact_phone, urgency_level, additional_notes) VALUES
('O+', 2, 'Emergency Hospital', '456 Emergency St, Downtown', '+91-20-9999-8888', 'high', 'Emergency surgery required'),
('A-', 1, 'City Medical Center', '789 Medical Ave, Midtown', '+91-22-7777-6666', 'medium', 'Regular blood transfusion'),
('B+', 3, 'Regional Hospital', '321 Regional Rd, Uptown', '+91-11-5555-4444', 'critical', 'Multiple trauma patients');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
