-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  location TEXT,
  last_donation_date DATE,
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood requests table
CREATE TABLE public.blood_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  hospital_name TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  units_needed INTEGER DEFAULT 1,
  needed_by DATE,
  status TEXT CHECK (status IN ('active', 'fulfilled', 'cancelled')) DEFAULT 'active',
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood banks table
CREATE TABLE public.blood_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  operating_hours TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blood inventory table
CREATE TABLE public.blood_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blood_bank_id UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_available INTEGER DEFAULT 0,
  expiry_date DATE,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('blood_request', 'donation_reminder', 'eligibility', 'general')) DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for blood requests
CREATE POLICY "Users can view all blood requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Users can create their own blood requests" ON public.blood_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own blood requests" ON public.blood_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own blood requests" ON public.blood_requests FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for blood banks (public read access)
CREATE POLICY "Blood banks are viewable by everyone" ON public.blood_banks FOR SELECT USING (true);

-- Create RLS policies for blood inventory (public read access)
CREATE POLICY "Blood inventory is viewable by everyone" ON public.blood_inventory FOR SELECT USING (true);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blood_requests_updated_at BEFORE UPDATE ON public.blood_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blood_banks_updated_at BEFORE UPDATE ON public.blood_banks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX idx_profiles_location ON public.profiles(location);
CREATE INDEX idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX idx_blood_inventory_blood_group ON public.blood_inventory(blood_group);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- Insert sample blood banks
INSERT INTO public.blood_banks (name, address, phone, email, latitude, longitude, operating_hours) VALUES
('City General Hospital Blood Bank', '123 Medical Center Dr, Downtown', '+1-555-0123', 'bloodbank@citygeneral.com', 40.7128, -74.0060, '24/7'),
('Red Cross Blood Center', '456 Charity Ave, Midtown', '+1-555-0124', 'info@redcross-local.org', 40.7589, -73.9851, 'Mon-Fri 8AM-6PM, Sat 9AM-4PM'),
('Community Health Blood Bank', '789 Community Blvd, Uptown', '+1-555-0125', 'donate@communityhealth.org', 40.7831, -73.9712, 'Mon-Sun 7AM-8PM'),
('University Medical Blood Center', '321 Campus Dr, University District', '+1-555-0126', 'blood@unimedical.edu', 40.8075, -73.9626, 'Mon-Fri 9AM-5PM');

-- Insert sample blood inventory
INSERT INTO public.blood_inventory (blood_bank_id, blood_group, units_available, expiry_date) 
SELECT 
  bb.id,
  bg.blood_group,
  (RANDOM() * 20 + 5)::INTEGER,
  CURRENT_DATE + INTERVAL '30 days' + (RANDOM() * INTERVAL '60 days')
FROM public.blood_banks bb
CROSS JOIN (VALUES ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-')) AS bg(blood_group);