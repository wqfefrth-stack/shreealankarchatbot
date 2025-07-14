-- Update RLS policies for chat_logs to allow reading data
-- First, let's check current policies and fix them

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow read access to chat logs" ON public.chat_logs;
DROP POLICY IF EXISTS "Allow insert chat logs" ON public.chat_logs;

-- Create more permissive policies for owner dashboard access
-- Allow anyone to read chat logs (for owner dashboard)
CREATE POLICY "Allow read chat logs" 
  ON public.chat_logs 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert chat logs
CREATE POLICY "Allow insert chat logs" 
  ON public.chat_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Add update and delete policies for completeness
CREATE POLICY "Allow update chat logs" 
  ON public.chat_logs 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow delete chat logs" 
  ON public.chat_logs 
  FOR DELETE 
  USING (true);