-- Create donor_responses table to track donor responses to blood requests
CREATE TABLE IF NOT EXISTS public.donor_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blood_request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    response_type TEXT NOT NULL CHECK (response_type IN ('accepted', 'declined')),
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(blood_request_id, donor_id) -- Prevent duplicate responses from same donor
);

-- Enable RLS
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for donor_responses
CREATE POLICY "Donors can view their own responses" 
ON public.donor_responses 
FOR SELECT 
USING (auth.uid() = donor_id);

CREATE POLICY "Donors can create their own responses" 
ON public.donor_responses 
FOR INSERT 
WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Requesters can view responses to their requests" 
ON public.donor_responses 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.blood_requests br 
        WHERE br.id = donor_responses.blood_request_id 
        AND br.user_id = auth.uid()
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donor_responses_blood_request_id ON public.donor_responses(blood_request_id);
CREATE INDEX IF NOT EXISTS idx_donor_responses_donor_id ON public.donor_responses(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_responses_response_type ON public.donor_responses(response_type);
CREATE INDEX IF NOT EXISTS idx_donor_responses_created_at ON public.donor_responses(created_at);

-- Create trigger for updated_at column
CREATE TRIGGER update_donor_responses_updated_at
    BEFORE UPDATE ON public.donor_responses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
