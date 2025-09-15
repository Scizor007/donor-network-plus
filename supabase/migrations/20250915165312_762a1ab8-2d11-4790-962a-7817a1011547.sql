-- Create eligible_donors table to store vetted donor data with eligibility criteria
CREATE TABLE IF NOT EXISTS public.eligible_donors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name text NOT NULL,
    blood_group text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    city text NOT NULL,
    address text NOT NULL,
    latitude numeric,
    longitude numeric,
    
    -- Medical eligibility criteria
    hemoglobin_level numeric,
    rbc_count numeric,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    weight_kg numeric,
    height_cm integer,
    pulse_rate integer,
    
    -- Health conditions
    has_medical_conditions boolean DEFAULT false,
    taking_medications boolean DEFAULT false,
    recent_illness boolean DEFAULT false,
    recent_surgery boolean DEFAULT false,
    has_tattoos boolean DEFAULT false,
    
    -- Eligibility status
    is_eligible boolean DEFAULT false,
    eligibility_notes text,
    last_eligibility_check timestamp with time zone DEFAULT now(),
    
    -- Donation history
    last_donation_date date,
    total_donations integer DEFAULT 0,
    
    -- Verification
    is_verified boolean DEFAULT false,
    verified_by uuid REFERENCES auth.users(id),
    verified_at timestamp with time zone,
    
    -- Availability
    is_available boolean DEFAULT true,
    availability_notes text,
    
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on eligible_donors
ALTER TABLE public.eligible_donors ENABLE ROW LEVEL SECURITY;

-- Create policies for eligible_donors
CREATE POLICY "Everyone can view eligible donors" 
ON public.eligible_donors 
FOR SELECT 
USING (is_eligible = true AND is_available = true);

CREATE POLICY "Users can insert their own eligibility data" 
ON public.eligible_donors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own eligibility data" 
ON public.eligible_donors 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to check donor eligibility based on criteria
CREATE OR REPLACE FUNCTION public.check_donor_eligibility(donor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    donor_record public.eligible_donors%ROWTYPE;
    is_eligible boolean := true;
BEGIN
    SELECT * INTO donor_record FROM public.eligible_donors WHERE id = donor_id;
    
    -- Age check: 18-65 years
    IF donor_record.age < 18 OR donor_record.age > 65 THEN
        is_eligible := false;
    END IF;
    
    -- Weight check: minimum 50kg
    IF donor_record.weight_kg < 50 THEN
        is_eligible := false;
    END IF;
    
    -- Hemoglobin check: minimum 12.5 g/dL
    IF donor_record.hemoglobin_level < 12.5 THEN
        is_eligible := false;
    END IF;
    
    -- RBC count check: 4.5-5.5 million cells/μL for men, 4.0-5.0 for women
    IF donor_record.gender = 'male' AND (donor_record.rbc_count < 4.5 OR donor_record.rbc_count > 5.5) THEN
        is_eligible := false;
    ELSIF donor_record.gender = 'female' AND (donor_record.rbc_count < 4.0 OR donor_record.rbc_count > 5.0) THEN
        is_eligible := false;
    END IF;
    
    -- Blood pressure check: 120-180 systolic, 70-100 diastolic
    IF donor_record.blood_pressure_systolic < 120 OR donor_record.blood_pressure_systolic > 180 THEN
        is_eligible := false;
    END IF;
    
    IF donor_record.blood_pressure_diastolic < 70 OR donor_record.blood_pressure_diastolic > 100 THEN
        is_eligible := false;
    END IF;
    
    -- Pulse rate check: 50-100 bpm
    IF donor_record.pulse_rate < 50 OR donor_record.pulse_rate > 100 THEN
        is_eligible := false;
    END IF;
    
    -- Health conditions check
    IF donor_record.has_medical_conditions = true OR 
       donor_record.taking_medications = true OR
       donor_record.recent_illness = true OR
       donor_record.recent_surgery = true THEN
        is_eligible := false;
    END IF;
    
    -- Last donation check: minimum 90 days gap
    IF donor_record.last_donation_date IS NOT NULL AND 
       donor_record.last_donation_date > (CURRENT_DATE - INTERVAL '90 days') THEN
        is_eligible := false;
    END IF;
    
    -- Update eligibility status
    UPDATE public.eligible_donors 
    SET is_eligible = is_eligible, 
        last_eligibility_check = now()
    WHERE id = donor_id;
    
    RETURN is_eligible;
END;
$$;

-- Create trigger to update updated_at
CREATE TRIGGER update_eligible_donors_updated_at
    BEFORE UPDATE ON public.eligible_donors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eligible_donors_blood_group ON public.eligible_donors(blood_group);
CREATE INDEX IF NOT EXISTS idx_eligible_donors_eligible ON public.eligible_donors(is_eligible);
CREATE INDEX IF NOT EXISTS idx_eligible_donors_available ON public.eligible_donors(is_available);
CREATE INDEX IF NOT EXISTS idx_eligible_donors_location ON public.eligible_donors(latitude, longitude);