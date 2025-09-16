-- Create a dedicated donor_registrations table for managing donor registration process
CREATE TABLE IF NOT EXISTS public.donor_registrations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Personal Information
    full_name text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    blood_group text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    
    -- Medical Information
    weight_kg numeric,
    height_cm integer,
    hemoglobin_level numeric,
    rbc_count numeric,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    pulse_rate integer,
    
    -- Health Status
    has_medical_conditions boolean DEFAULT false,
    taking_medications boolean DEFAULT false,
    recent_illness boolean DEFAULT false,
    recent_surgery boolean DEFAULT false,
    has_tattoos boolean DEFAULT false,
    
    -- Donation History
    last_donation_date date,
    
    -- Location
    latitude numeric,
    longitude numeric,
    
    -- Registration Status
    registration_status text DEFAULT 'pending', -- pending, approved, rejected
    eligibility_status text DEFAULT 'unchecked', -- unchecked, eligible, ineligible
    consent_given boolean DEFAULT false,
    
    -- Timestamps
    registered_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone,
    processed_by uuid REFERENCES auth.users(id),
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donor_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own registrations" 
ON public.donor_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own registrations" 
ON public.donor_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.donor_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donor_registrations_user_id ON public.donor_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_registrations_status ON public.donor_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_donor_registrations_eligibility ON public.donor_registrations(eligibility_status);
CREATE INDEX IF NOT EXISTS idx_donor_registrations_blood_group ON public.donor_registrations(blood_group);

-- Add trigger for updated_at
CREATE TRIGGER update_donor_registrations_updated_at
    BEFORE UPDATE ON public.donor_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();