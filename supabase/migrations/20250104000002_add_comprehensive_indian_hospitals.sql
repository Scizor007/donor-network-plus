-- Add comprehensive list of hospitals across India
-- This ensures there are hospitals available for appointment booking in all major cities

-- Insert major hospitals from across India
INSERT INTO public.blood_banks (id, name, address, phone, email, latitude, longitude, operating_hours, city, state, is_active, services) VALUES
-- DELHI/NCR
(gen_random_uuid(), 'AIIMS Delhi', 'Ansari Nagar, New Delhi', '+91-11-2658-8500', 'info@aiims.edu', 28.5665, 77.2090, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'New Delhi', 'Delhi', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),
(gen_random_uuid(), 'Safdarjung Hospital', 'Ansari Nagar East, New Delhi', '+91-11-2616-5000', 'safdarjung@nic.in', 28.5684, 77.2078, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'New Delhi', 'Delhi', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Max Hospital Saket', '1, Press Enclave Road, Saket', '+91-11-4055-4055', 'info@maxhealthcare.com', 28.5304, 77.2187, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'New Delhi', 'Delhi', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Escorts Heart Institute', 'Okhla Road, New Delhi', '+91-11-4713-5000', 'info@fortishealthcare.com', 28.5500, 77.2500, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'New Delhi', 'Delhi', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Cardiology']),
(gen_random_uuid(), 'Apollo Hospital Delhi', 'Sarita Vihar, Delhi Mathura Road', '+91-11-2692-5858', 'info@apollohospitals.com', 28.5400, 77.2900, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'New Delhi', 'Delhi', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- MUMBAI
(gen_random_uuid(), 'KEM Hospital', 'Acharya Donde Marg, Parel', '+91-22-2410-7000', 'info@kem.edu', 19.0060, 72.8410, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Mumbai', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Tata Memorial Hospital', 'Dr. E Borges Road, Parel', '+91-22-2417-7000', 'info@tmc.gov.in', 19.0040, 72.8420, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Mumbai', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Oncology']),
(gen_random_uuid(), 'Lilavati Hospital', 'A-791, Bandra Reclamation, Bandra West', '+91-22-2675-1000', 'info@lilavatihospital.com', 19.0544, 72.8406, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Mumbai', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Kokilaben Dhirubhai Ambani Hospital', 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows', '+91-22-3099-9999', 'info@kokilabenhospital.com', 19.1200, 72.8500, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Mumbai', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Apollo Hospital Navi Mumbai', 'Plot No. 13, Sector 23, Nerul', '+91-22-2770-7000', 'info@apollohospitals.com', 19.0330, 73.0297, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Navi Mumbai', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- BANGALORE
(gen_random_uuid(), 'Apollo Hospital Bangalore', '154/11, Bannerghatta Road, Amalodbhavi Nagar', '+91-80-2630-4050', 'info@apollohospitals.com', 12.9141, 77.5960, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bangalore', 'Karnataka', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Bangalore', '154/9, Bannerghatta Road, Opposite IIM-B', '+91-80-6621-4444', 'bangalore@fortishealthcare.com', 12.8918, 77.6018, '24/7 Emergency, OPD: 7:00 AM - 9:00 PM', 'Bangalore', 'Karnataka', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Manipal Hospital Bangalore', '98, HAL Airport Road, Kodihalli', '+91-80-2502-4444', 'info@manipalhospitals.com', 12.9581, 77.6605, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bangalore', 'Karnataka', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Narayana Health City', '258/A, Bommasandra Industrial Area', '+91-80-6750-6750', 'info@narayanahealth.org', 12.8000, 77.7000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bangalore', 'Karnataka', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Columbia Asia Hospital', '26/4, Brigade Gateway, Rajajinagar', '+91-80-2502-4444', 'info@columbiaasia.com', 12.9700, 77.5600, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bangalore', 'Karnataka', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- CHENNAI
(gen_random_uuid(), 'Apollo Hospital Chennai', '21, Greams Lane, Off Greams Road', '+91-44-2829-3333', 'info@apollohospitals.com', 13.0827, 80.2707, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Chennai', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Malar Hospital', '52, 1st Main Road, Gandhi Nagar, Adyar', '+91-44-4200-2222', 'info@fortishealthcare.com', 13.0067, 80.2206, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Chennai', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'MIOT International', '4/112, Mount Poonamallee Road, Manapakkam', '+91-44-2249-2288', 'info@miotinternational.com', 12.9800, 80.2000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Chennai', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Global Hospitals Chennai', '439, Cheran Nagar, Perumbakkam', '+91-44-2277-7000', 'info@globalhospitalsindia.com', 12.9000, 80.2000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Chennai', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- HYDERABAD
(gen_random_uuid(), 'Apollo Hospital Hyderabad', 'Jubilee Hills', '+91-40-2360-7777', 'info@apollohospitals.com', 17.4065, 78.4772, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Hyderabad', 'Telangana', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'NIMS Hyderabad', 'Punjagutta, Hyderabad', '+91-40-2348-9000', 'info@nims.edu.in', 17.4065, 78.4772, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Hyderabad', 'Telangana', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),
(gen_random_uuid(), 'Continental Hospitals', 'Nanakramguda, Financial District', '+91-40-6700-0000', 'info@continentalhospitals.com', 17.4200, 78.3500, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Hyderabad', 'Telangana', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'KIMS Hospital', '1-8-31/1, Minister Road, Secunderabad', '+91-40-4488-5000', 'info@kimshospitals.com', 17.4500, 78.5000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Hyderabad', 'Telangana', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- KOLKATA
(gen_random_uuid(), 'Apollo Gleneagles Hospital', '58, Canal Circular Road, Kadapara', '+91-33-2320-3040', 'info@apollohospitals.com', 22.5726, 88.3639, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kolkata', 'West Bengal', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Kolkata', '730, Anandapur, EM Bypass', '+91-33-6628-4444', 'info@fortishealthcare.com', 22.5000, 88.4000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kolkata', 'West Bengal', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'AMRI Hospital', '16/1, Alipore Road, Kolkata', '+91-33-2440-0000', 'info@amrihospitals.com', 22.5400, 88.3300, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kolkata', 'West Bengal', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Peerless Hospital', '360, Panchasayar, Kolkata', '+91-33-2436-1000', 'info@peerlesshospital.com', 22.4500, 88.4000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kolkata', 'West Bengal', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- PUNE
(gen_random_uuid(), 'Apollo Hospital Pune', 'Plot No. 13A, Sector 2, Parsik Hill', '+91-20-2799-9999', 'info@apollohospitals.com', 18.5204, 73.8567, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Pune', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Pune', 'Mulshi, Pune', '+91-20-6720-4444', 'info@fortishealthcare.com', 18.5000, 73.8000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Pune', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Sahyadri Hospital', 'Kothrud, Pune', '+91-20-2444-4444', 'info@sahyadrihospitals.com', 18.5000, 73.8000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Pune', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- AHMEDABAD
(gen_random_uuid(), 'Apollo Hospital Ahmedabad', 'Plot No. 1A, GIDC Estate, Bhat', '+91-79-6670-1000', 'info@apollohospitals.com', 23.0225, 72.5714, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Ahmedabad', 'Gujarat', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Ahmedabad', 'Opposite City Gold Cinema, Ashram Road', '+91-79-6600-4444', 'info@fortishealthcare.com', 23.0300, 72.5800, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Ahmedabad', 'Gujarat', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Zydus Hospital', 'Sarkhej-Gandhinagar Highway, Ahmedabad', '+91-79-6670-1000', 'info@zydushospitals.com', 23.0000, 72.5000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Ahmedabad', 'Gujarat', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- JAIPUR
(gen_random_uuid(), 'Apollo Hospital Jaipur', 'Plot No. 1, Sector 5, Sanganer', '+91-141-279-2222', 'info@apollohospitals.com', 26.9124, 75.7873, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Jaipur', 'Rajasthan', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Escorts Hospital', 'Jawahar Lal Nehru Marg, Malviya Nagar', '+91-141-254-7000', 'info@fortishealthcare.com', 26.8500, 75.8000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Jaipur', 'Rajasthan', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Sawai Man Singh Hospital', 'Jawahar Lal Nehru Marg, Jaipur', '+91-141-256-0291', 'info@smshospital.com', 26.9000, 75.8000, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Jaipur', 'Rajasthan', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- LUCKNOW
(gen_random_uuid(), 'Apollo Hospital Lucknow', 'Sector B, Bargawan, LDA Colony', '+91-522-424-2222', 'info@apollohospitals.com', 26.8467, 80.9462, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Lucknow', 'Uttar Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Lucknow', 'Shaheed Path, Lucknow', '+91-522-424-4444', 'info@fortishealthcare.com', 26.8000, 80.9000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Lucknow', 'Uttar Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'King George Medical University', 'Chowk, Lucknow', '+91-522-225-7450', 'info@kgmu.org', 26.8500, 80.9500, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Lucknow', 'Uttar Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),

-- CHANDIGARH
(gen_random_uuid(), 'PGI Chandigarh', 'Sector 12, Chandigarh', '+91-172-275-6000', 'info@pgimer.edu.in', 30.7333, 76.7794, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Chandigarh', 'Chandigarh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),
(gen_random_uuid(), 'Fortis Hospital Mohali', 'Phase VIII, Mohali', '+91-172-469-2222', 'info@fortishealthcare.com', 30.7000, 76.7000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Mohali', 'Punjab', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Apollo Hospital Chandigarh', 'Sector 34-A, Chandigarh', '+91-172-434-4444', 'info@apollohospitals.com', 30.7500, 76.8000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Chandigarh', 'Chandigarh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- COIMBATORE
(gen_random_uuid(), 'Apollo Hospital Coimbatore', 'P.N. Palayam, Coimbatore', '+91-422-232-2222', 'info@apollohospitals.com', 11.0168, 76.9558, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Coimbatore', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'PSG Hospitals', 'Peelamedu, Coimbatore', '+91-422-257-0170', 'info@psghospitals.com', 11.0000, 76.9500, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Coimbatore', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Kovai Medical Center', 'Avinashi Road, Coimbatore', '+91-422-432-3800', 'info@kmchonline.com', 11.0000, 76.9000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Coimbatore', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- KOCHI
(gen_random_uuid(), 'Apollo Hospital Kochi', 'Maradu, Kochi', '+91-484-288-1000', 'info@apollohospitals.com', 9.9312, 76.2673, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kochi', 'Kerala', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Amrita Hospital Kochi', 'AIMS Ponekkara, Kochi', '+91-484-285-1234', 'info@aims.amrita.edu', 9.9000, 76.3000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kochi', 'Kerala', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Lakeshore Hospital', 'Maradu, Kochi', '+91-484-270-1033', 'info@lakeshorehospital.com', 9.9500, 76.3000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kochi', 'Kerala', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- INDORE
(gen_random_uuid(), 'Apollo Hospital Indore', 'MR-10, Indore Bypass Road', '+91-731-425-1000', 'info@apollohospitals.com', 22.7196, 75.8577, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Indore', 'Madhya Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Choithram Hospital', '14, Manik Bagh Road, Indore', '+91-731-252-7000', 'info@choithramhospital.com', 22.7000, 75.8500, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Indore', 'Madhya Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- BHOPAL
(gen_random_uuid(), 'Apollo Hospital Bhopal', 'E-5, Arera Colony, Bhopal', '+91-755-252-2222', 'info@apollohospitals.com', 23.2599, 77.4126, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bhopal', 'Madhya Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Bhopal Memorial Hospital', 'Raisen Road, Bhopal', '+91-755-274-2000', 'info@bmhrc.org', 23.2500, 77.4000, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Bhopal', 'Madhya Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- VELLORE
(gen_random_uuid(), 'Christian Medical College', 'Ida Scudder Road, Vellore', '+91-416-228-2010', 'info@cmcvellore.ac.in', 12.9202, 79.1500, '24/7 Emergency, OPD: 8:00 AM - 5:00 PM', 'Vellore', 'Tamil Nadu', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),

-- TRIVANDRUM
(gen_random_uuid(), 'Apollo Hospital Trivandrum', 'Kumarapuram, Trivandrum', '+91-471-244-8833', 'info@apollohospitals.com', 8.5241, 76.9366, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Trivandrum', 'Kerala', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Sree Chitra Tirunal Institute', 'Medical College Campus, Trivandrum', '+91-471-252-4300', 'info@sctimst.ac.in', 8.5000, 76.9500, '24/7 Emergency, OPD: 8:00 AM - 4:00 PM', 'Trivandrum', 'Kerala', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services', 'Research']),

-- VADODARA
(gen_random_uuid(), 'Apollo Hospital Vadodara', 'Gotri Road, Vadodara', '+91-265-669-1000', 'info@apollohospitals.com', 22.3072, 73.1812, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Vadodara', 'Gujarat', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Sunshine Global Hospital', 'Gotri, Vadodara', '+91-265-669-2000', 'info@sunshineglobalhospital.com', 22.3000, 73.1800, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Vadodara', 'Gujarat', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- NASHIK
(gen_random_uuid(), 'Apollo Hospital Nashik', 'Mumbai Agra Highway, Nashik', '+91-253-664-4444', 'info@apollohospitals.com', 19.9975, 73.7898, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Nashik', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- NAGPUR
(gen_random_uuid(), 'Apollo Hospital Nagpur', 'Wardha Road, Nagpur', '+91-712-666-6600', 'info@apollohospitals.com', 21.1458, 79.0882, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Nagpur', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),
(gen_random_uuid(), 'Fortis Hospital Nagpur', 'Wardha Road, Nagpur', '+91-712-666-4444', 'info@fortishealthcare.com', 21.1500, 79.1000, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Nagpur', 'Maharashtra', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- RANCHI
(gen_random_uuid(), 'Apollo Hospital Ranchi', 'Kanke Road, Ranchi', '+91-651-224-4444', 'info@apollohospitals.com', 23.3441, 85.3096, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Ranchi', 'Jharkhand', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- PATNA
(gen_random_uuid(), 'Apollo Hospital Patna', 'NH 30, Patna', '+91-612-222-2222', 'info@apollohospitals.com', 25.5941, 85.1376, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Patna', 'Bihar', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- BHUBANESWAR
(gen_random_uuid(), 'Apollo Hospital Bhubaneswar', 'Plot No. 251, Old Airport Road', '+91-674-666-6600', 'info@apollohospitals.com', 20.2961, 85.8245, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Bhubaneswar', 'Odisha', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- GUWAHATI
(gen_random_uuid(), 'Apollo Hospital Guwahati', 'NH 37, Guwahati', '+91-361-710-1000', 'info@apollohospitals.com', 26.1445, 91.7362, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Guwahati', 'Assam', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- DEHRADUN
(gen_random_uuid(), 'Apollo Hospital Dehradun', 'Rajpur Road, Dehradun', '+91-135-272-4444', 'info@apollohospitals.com', 30.3165, 78.0322, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Dehradun', 'Uttarakhand', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- SHIMLA
(gen_random_uuid(), 'Apollo Hospital Shimla', 'Kumar House, Shimla', '+91-177-262-4444', 'info@apollohospitals.com', 31.1048, 77.1734, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Shimla', 'Himachal Pradesh', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- SRINAGAR
(gen_random_uuid(), 'Apollo Hospital Srinagar', 'Gogji Bagh, Srinagar', '+91-194-240-4444', 'info@apollohospitals.com', 34.0837, 74.7973, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Srinagar', 'Jammu and Kashmir', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- IMPHAL
(gen_random_uuid(), 'Apollo Hospital Imphal', 'Lamphelpat, Imphal', '+91-385-244-4444', 'info@apollohospitals.com', 24.8170, 93.9368, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Imphal', 'Manipur', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- AIZAWL
(gen_random_uuid(), 'Apollo Hospital Aizawl', 'Zarkawt, Aizawl', '+91-389-234-4444', 'info@apollohospitals.com', 23.7271, 92.7176, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Aizawl', 'Mizoram', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- KOHIMA
(gen_random_uuid(), 'Apollo Hospital Kohima', 'PWD Colony, Kohima', '+91-370-222-4444', 'info@apollohospitals.com', 25.6751, 94.1086, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Kohima', 'Nagaland', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- AGARTALA
(gen_random_uuid(), 'Apollo Hospital Agartala', 'GB Hospital Road, Agartala', '+91-381-234-4444', 'info@apollohospitals.com', 23.8315, 91.2862, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Agartala', 'Tripura', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- GANGTOK
(gen_random_uuid(), 'Apollo Hospital Gangtok', 'Tadong, Gangtok', '+91-3592-234-444', 'info@apollohospitals.com', 27.3389, 88.6065, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Gangtok', 'Sikkim', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- PANAJI
(gen_random_uuid(), 'Apollo Hospital Goa', 'Bambolim, Goa', '+91-832-242-4444', 'info@apollohospitals.com', 15.4909, 73.8278, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Panaji', 'Goa', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- PUDUCHERRY
(gen_random_uuid(), 'Apollo Hospital Puducherry', 'Reddiarpalayam, Puducherry', '+91-413-234-4444', 'info@apollohospitals.com', 11.9416, 79.8083, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Puducherry', 'Puducherry', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services']),

-- PORT BLAIR
(gen_random_uuid(), 'Apollo Hospital Port Blair', 'Haddo, Port Blair', '+91-3192-234-444', 'info@apollohospitals.com', 11.6234, 92.7265, '24/7 Emergency, OPD: 8:00 AM - 8:00 PM', 'Port Blair', 'Andaman and Nicobar Islands', true, ARRAY['Blood Donation', 'Health Checkup', 'Emergency Care', 'Laboratory Services'])
ON CONFLICT DO NOTHING;
