
-- Create a table for storing chat logs
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - for owner access only, we'll keep it simple
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all authenticated users to read chat logs (for now, we can refine this later)
CREATE POLICY "Allow read access to chat logs" 
  ON public.chat_logs 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy that allows inserting chat logs
CREATE POLICY "Allow insert chat logs" 
  ON public.chat_logs 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
