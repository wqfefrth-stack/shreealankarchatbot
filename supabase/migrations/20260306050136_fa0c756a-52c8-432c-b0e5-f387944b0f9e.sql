
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT 'Anonymous',
  whatsapp_no TEXT,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow public access (no auth required for this chatbot)
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.chat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON public.chat_logs FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.chat_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.chat_logs FOR DELETE USING (true);
