-- Create appointments table for health checkup bookings
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('initial_checkup', 'follow_up', 'regular_checkup')),
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health checkups table for storing medical results
CREATE TABLE IF NOT EXISTS public.health_checkups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    checkup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Physical measurements
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    bmi DECIMAL(4,1),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    pulse_rate INTEGER,
    temperature_celsius DECIMAL(4,1),
    
    -- Blood tests
    hemoglobin_gdl DECIMAL(4,1),
    rbc_count DECIMAL(4,2),
    wbc_count DECIMAL(4,1),
    platelet_count INTEGER,
    hematocrit DECIMAL(4,1),
    
    -- Health screening
    has_medical_conditions BOOLEAN DEFAULT false,
    taking_medications BOOLEAN DEFAULT false,
    recent_illness BOOLEAN DEFAULT false,
    recent_surgery BOOLEAN DEFAULT false,
    has_tattoos BOOLEAN DEFAULT false,
    last_donation_date DATE,
    
    -- Results and verification
    is_eligible BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- File attachments
    lab_reports_url TEXT[],
    medical_certificate_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for appointments
CREATE POLICY "Donors can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() = donor_id);

CREATE POLICY "Donors can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = donor_id);

CREATE POLICY "Hospital staff can view appointments for their hospital" 
ON public.appointments 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = appointments.hospital_id
        AND hs.is_active = true
    )
);

CREATE POLICY "Hospital staff can update appointments for their hospital" 
ON public.appointments 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = appointments.hospital_id
        AND hs.is_active = true
    )
);

-- Create RLS policies for health checkups
CREATE POLICY "Donors can view their own health checkups" 
ON public.health_checkups 
FOR SELECT 
USING (auth.uid() = donor_id);

CREATE POLICY "Hospital staff can view health checkups for their hospital" 
ON public.health_checkups 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = health_checkups.hospital_id
        AND hs.is_active = true
    )
);

CREATE POLICY "Hospital staff can manage health checkups for their hospital" 
ON public.health_checkups 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = health_checkups.hospital_id
        AND hs.is_active = true
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_donor_id ON public.appointments(donor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON public.appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

CREATE INDEX IF NOT EXISTS idx_health_checkups_donor_id ON public.health_checkups(donor_id);
CREATE INDEX IF NOT EXISTS idx_health_checkups_hospital_id ON public.health_checkups(hospital_id);
CREATE INDEX IF NOT EXISTS idx_health_checkups_appointment_id ON public.health_checkups(appointment_id);
CREATE INDEX IF NOT EXISTS idx_health_checkups_eligible ON public.health_checkups(is_eligible);
CREATE INDEX IF NOT EXISTS idx_health_checkups_verified ON public.health_checkups(is_verified);

-- Create triggers for updated_at columns
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_checkups_updated_at
    BEFORE UPDATE ON public.health_checkups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
