-- Add sample blood banks data for testing
-- This ensures there are hospitals available for appointment booking

-- Insert sample blood banks/hospitals
INSERT INTO public.blood_banks (id, name, address, phone, email, latitude, longitude, operating_hours, city, state, is_active, services) VALUES
(
  gen_random_uuid(),
  'Apollo Hospital',
  '154/11, Bannerghatta Road, Amalodbhavi Nagar, Panduranga Nagar',
  '+91-80-2630-4050',
  'info@apollohospitals.com',
  12.9141,
  77.5960,
  '24/7 Emergency, OPD: 8:00 AM - 8:00 PM',
  'Bangalore',
  'Karnataka',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']
),
(
  gen_random_uuid(),
  'Fortis Hospital',
  '154/9, Bannerghatta Road, Opposite IIM-B',
  '+91-80-6621-4444',
  'bangalore@fortishealthcare.com',
  12.8918,
  77.6018,
  '24/7 Emergency, OPD: 7:00 AM - 9:00 PM',
  'Bangalore',
  'Karnataka',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']
),
(
  gen_random_uuid(),
  'Manipal Hospital',
  '98, HAL Airport Road, Kodihalli',
  '+91-80-2502-4444',
  'info@manipalhospitals.com',
  12.9581,
  77.6605,
  '24/7 Emergency, OPD: 8:00 AM - 8:00 PM',
  'Bangalore',
  'Karnataka',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']
),
(
  gen_random_uuid(),
  'AIIMS Delhi',
  'Ansari Nagar, New Delhi',
  '+91-11-2658-8500',
  'info@aiims.edu',
  28.5665,
  77.2090,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'New Delhi',
  'Delhi',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']
),
(
  gen_random_uuid(),
  'Safdarjung Hospital',
  'Ansari Nagar East, New Delhi',
  '+91-11-2616-5000',
  'safdarjung@nic.in',
  28.5684,
  77.2078,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'New Delhi',
  'Delhi',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']
),
(
  gen_random_uuid(),
  'KEM Hospital',
  'Acharya Donde Marg, Parel',
  '+91-22-2410-7000',
  'info@kem.edu',
  19.0060,
  72.8410,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'Mumbai',
  'Maharashtra',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']
),
(
  gen_random_uuid(),
  'Tata Memorial Hospital',
  'Dr. E Borges Road, Parel',
  '+91-22-2417-7000',
  'info@tmc.gov.in',
  19.0040,
  72.8420,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'Mumbai',
  'Maharashtra',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Oncology']
),
(
  gen_random_uuid(),
  'Christian Medical College',
  'Ida Scudder Road, Vellore',
  '+91-416-228-2010',
  'info@cmcvellore.ac.in',
  12.9202,
  79.1500,
  '24/7 Emergency, OPD: 8:00 AM - 5:00 PM',
  'Vellore',
  'Tamil Nadu',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']
),
(
  gen_random_uuid(),
  'PGI Chandigarh',
  'Sector 12, Chandigarh',
  '+91-172-275-6000',
  'info@pgimer.edu.in',
  30.7333,
  76.7794,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'Chandigarh',
  'Chandigarh',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']
),
(
  gen_random_uuid(),
  'NIMS Hyderabad',
  'Punjagutta, Hyderabad',
  '+91-40-2348-9000',
  'info@nims.edu.in',
  17.4065,
  78.4772,
  '24/7 Emergency, OPD: 8:00 AM - 4:00 PM',
  'Hyderabad',
  'Telangana',
  true,
  ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']
)
ON CONFLICT DO NOTHING;

-- Ensure the RLS policy for blood_banks allows everyone to view active blood banks
-- Drop existing policy if it exists and recreate it
DROP POLICY IF EXISTS "Everyone can view active blood banks" ON public.blood_banks;
DROP POLICY IF EXISTS "Everyone can view blood banks" ON public.blood_banks;

CREATE POLICY "Everyone can view active blood banks" 
ON public.blood_banks 
FOR SELECT 
USING (is_active = true);

-- Also create a policy for authenticated users to view all blood banks (for admin purposes)
CREATE POLICY "Authenticated users can view all blood banks" 
ON public.blood_banks 
FOR SELECT 
USING (auth.role() = 'authenticated');
