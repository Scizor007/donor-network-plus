-- Create storage bucket for health reports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-reports', 'health-reports', false);

-- Create storage policies for health reports
CREATE POLICY "Users can upload their own health reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'health-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own health reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'health-reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add hospital role and verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type text DEFAULT 'donor' CHECK (user_type IN ('donor', 'hospital', 'patient')),
ADD COLUMN IF NOT EXISTS hospital_license text,
ADD COLUMN IF NOT EXISTS is_verified_hospital boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS health_report_url text;

-- Create hospital_staff table for hospital portal access  
CREATE TABLE IF NOT EXISTS public.hospital_staff (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    hospital_id uuid REFERENCES public.blood_banks(id) ON DELETE CASCADE NOT NULL,
    role text DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'technician')),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, hospital_id)
);

-- Enable RLS on hospital_staff
ALTER TABLE public.hospital_staff ENABLE ROW LEVEL SECURITY;

-- Create policies for hospital_staff
CREATE POLICY "Hospital staff can view their own records" 
ON public.hospital_staff 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can manage staff" 
ON public.hospital_staff 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.role = 'admin' 
        AND hs.hospital_id = hospital_staff.hospital_id
        AND hs.is_active = true
    )
);

-- Update blood_inventory policies to allow hospital staff to manage
CREATE POLICY "Hospital staff can manage blood inventory" 
ON public.blood_inventory 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.hospital_staff hs 
        WHERE hs.user_id = auth.uid() 
        AND hs.blood_bank_id = blood_inventory.blood_bank_id
        AND hs.is_active = true
    )
);

-- Create donation_requests table for proactive donation drives
CREATE TABLE IF NOT EXISTS public.donation_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    hospital_id uuid REFERENCES public.blood_banks(id) ON DELETE CASCADE NOT NULL,
    blood_group text NOT NULL,
    units_needed integer DEFAULT 1,
    urgency_level text DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    campaign_name text NOT NULL,
    description text,
    event_date date,
    location text,
    contact_phone text NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on donation_requests
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for donation_requests
CREATE POLICY "Everyone can view active donation requests" 
ON public.donation_requests 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Hospital staff can manage their donation requests" 
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_staff_user_id ON public.hospital_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_staff_hospital_id ON public.hospital_staff(hospital_id);
CREATE INDEX IF NOT EXISTS idx_donation_requests_blood_group ON public.donation_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_donation_requests_status ON public.donation_requests(status);

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_hospital_staff_updated_at
    BEFORE UPDATE ON public.hospital_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_donation_requests_updated_at
    BEFORE UPDATE ON public.donation_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();