-- Add missing fields to profiles table for donor registration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS medical_conditions boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS taking_medications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recent_illness boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS distance_km numeric;

-- Add indexes for better performance on search queries
CREATE INDEX IF NOT EXISTS idx_profiles_blood_group ON public.profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(city, location);
CREATE INDEX IF NOT EXISTS idx_profiles_available ON public.profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles(latitude, longitude);