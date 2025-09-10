-- Create missing tables for blood donation platform
-- This migration adds tables for camps, certificates, donations, and other features

-- Create blood_donation_camps table
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

-- Create camp_registrations table
CREATE TABLE IF NOT EXISTS public.camp_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camp_id UUID NOT NULL REFERENCES public.blood_donation_camps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT NOT NULL,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('registered', 'confirmed', 'attended', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(camp_id, user_id)
);

-- Create donor_certificates table
CREATE TABLE IF NOT EXISTS public.donor_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_number TEXT NOT NULL UNIQUE,
    donor_name TEXT NOT NULL,
    blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    pledge_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    certificate_type TEXT DEFAULT 'pledge' CHECK (certificate_type IN ('pledge', 'donation', 'achievement')),
    achievement_level TEXT CHECK (achievement_level IN ('bronze', 'silver', 'gold', 'platinum')),
    total_donations INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create donation_records table
CREATE TABLE IF NOT EXISTS public.donation_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    camp_id UUID REFERENCES public.blood_donation_camps(id) ON DELETE SET NULL,
    blood_bank_id UUID REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    donation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    units_collected DECIMAL(4,2) DEFAULT 1.0,
    component_type TEXT DEFAULT 'whole_blood' CHECK (component_type IN ('whole_blood', 'rbc', 'platelets', 'plasma', 'ffp')),
    hemoglobin_level DECIMAL(4,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    pulse_rate INTEGER,
    temperature DECIMAL(4,2),
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    phlebotomist_id UUID REFERENCES auth.users(id),
    phlebotomist_name TEXT,
    collection_method TEXT DEFAULT 'manual' CHECK (collection_method IN ('manual', 'apheresis')),
    collection_time_minutes INTEGER,
    adverse_reactions TEXT[],
    notes TEXT,
    status TEXT DEFAULT 'collected' CHECK (status IN ('collected', 'processed', 'tested', 'approved', 'rejected', 'issued')),
    test_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create emergency_locations table
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

-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update blood_banks table with additional fields
ALTER TABLE public.blood_banks 
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'temporarily_closed', 'permanently_closed')),
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS accreditation TEXT[],
ADD COLUMN IF NOT EXISTS capacity_daily INTEGER,
ADD COLUMN IF NOT EXISTS last_inspection_date DATE,
ADD COLUMN IF NOT EXISTS next_inspection_date DATE;

-- Enable Row Level Security on new tables
ALTER TABLE public.blood_donation_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blood_donation_camps
CREATE POLICY "Everyone can view active camps" 
ON public.blood_donation_camps 
FOR SELECT 
USING (status IN ('upcoming', 'ongoing'));

CREATE POLICY "Hospital staff can manage their camps" 
ON public.blood_donation_camps 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = blood_donation_camps.organizer_id
        AND hs.is_active = true
    )
);

-- Create RLS policies for camp_registrations
CREATE POLICY "Users can view their own registrations" 
ON public.camp_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registrations" 
ON public.camp_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.camp_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Hospital staff can view camp registrations" 
ON public.camp_registrations 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.blood_donation_camps bdc
        JOIN public.hospital_staff hs ON hs.blood_bank_id = bdc.organizer_id
        WHERE bdc.id = camp_registrations.camp_id
        AND hs.user_id = auth.uid()
        AND hs.is_active = true
    )
);

-- Create RLS policies for donor_certificates
CREATE POLICY "Users can view their own certificates" 
ON public.donor_certificates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates" 
ON public.donor_certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for donation_records
CREATE POLICY "Users can view their own donation records" 
ON public.donation_records 
FOR SELECT 
USING (auth.uid() = donor_id);

CREATE POLICY "Hospital staff can manage donation records" 
ON public.donation_records 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = donation_records.blood_bank_id
        AND hs.is_active = true
    )
);

-- Create RLS policies for emergency_locations
CREATE POLICY "Everyone can view emergency locations" 
ON public.emergency_locations 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for admin_audit_logs
CREATE POLICY "Admins can view audit logs" 
ON public.admin_audit_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.user_id = auth.uid() 
        AND p.user_type = 'admin'
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_status ON public.blood_donation_camps(status);
CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_city_state ON public.blood_donation_camps(city, state);
CREATE INDEX IF NOT EXISTS idx_blood_donation_camps_dates ON public.blood_donation_camps(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_camp_registrations_camp_id ON public.camp_registrations(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_registrations_user_id ON public.camp_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_certificates_user_id ON public.donor_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_certificates_number ON public.donor_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_donation_records_donor_id ON public.donation_records(donor_id);
CREATE INDEX IF NOT EXISTS idx_donation_records_date ON public.donation_records(donation_date);
CREATE INDEX IF NOT EXISTS idx_donation_records_blood_group ON public.donation_records(blood_group);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_type ON public.emergency_locations(type);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_city_state ON public.emergency_locations(city, state);
CREATE INDEX IF NOT EXISTS idx_emergency_locations_coordinates ON public.emergency_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at);

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_blood_donation_camps_updated_at
    BEFORE UPDATE ON public.blood_donation_camps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_camp_registrations_updated_at
    BEFORE UPDATE ON public.camp_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_donation_records_updated_at
    BEFORE UPDATE ON public.donation_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_emergency_locations_updated_at
    BEFORE UPDATE ON public.emergency_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

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

-- Insert sample donor certificates
INSERT INTO public.donor_certificates (user_id, certificate_number, donor_name, blood_group, certificate_type, achievement_level, total_donations)
SELECT 
    p.user_id,
    'CERT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(ROW_NUMBER() OVER()::TEXT, 4, '0'),
    p.full_name,
    p.blood_group,
    'pledge',
    'bronze',
    0
FROM public.profiles p
WHERE p.blood_group IS NOT NULL
LIMIT 5;

-- Create function to generate certificate numbers
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    new_number TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(certificate_number FROM 'CERT-\d+-(\d+)$') AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM public.donor_certificates
    WHERE certificate_number LIKE 'CERT-' || year_part || '-%';
    
    new_number := 'CERT-' || year_part || '-' || LPAD(sequence_part, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create function to update camp participant count
CREATE OR REPLACE FUNCTION public.update_camp_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.blood_donation_camps 
        SET current_participants = current_participants + 1
        WHERE id = NEW.camp_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.blood_donation_camps 
        SET current_participants = current_participants - 1
        WHERE id = OLD.camp_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update camp participant count
CREATE TRIGGER update_camp_participant_count_trigger
    AFTER INSERT OR DELETE ON public.camp_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_camp_participant_count();

-- Create function to update donation count in profiles
CREATE OR REPLACE FUNCTION public.update_donor_donation_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE public.profiles 
        SET last_donation_date = NEW.donation_date
        WHERE user_id = NEW.donor_id;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update donor donation count
CREATE TRIGGER update_donor_donation_count_trigger
    AFTER INSERT OR UPDATE ON public.donation_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_donor_donation_count();
