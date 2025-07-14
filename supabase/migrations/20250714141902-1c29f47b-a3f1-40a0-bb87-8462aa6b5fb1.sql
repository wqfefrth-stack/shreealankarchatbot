-- Add seen column to chat_logs table
ALTER TABLE public.chat_logs 
ADD COLUMN seen BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on seen column
CREATE INDEX idx_chat_logs_seen ON public.chat_logs(seen);