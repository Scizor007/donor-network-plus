-- Enable RLS on tables that need it and add policies for camp and blood bank creation

-- Add policies for blood_donation_camps
CREATE POLICY "Users can create camps" 
ON public.blood_donation_camps 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own camps" 
ON public.blood_donation_camps 
FOR UPDATE 
USING (auth.uid() = organizer_id);

-- Add policies for blood_banks  
CREATE POLICY "Admins can create blood banks" 
ON public.blood_banks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can update blood banks" 
ON public.blood_banks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND user_type = 'admin'
  )
);