
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'english' } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // System prompt based on language
    const systemPrompt = language === 'marathi' 
      ? `तुम्ही श्री अलंकार ज्वेलर्सचे AI असिस्टंट आहात. तुम्ही दागिन्यांबद्दल, सोने-चांदीच्या दरांबद्दल, आणि ज्वेलरी सेवांबद्दल मदत करता. नेहमी मराठीत उत्तर द्या. तुमचे उत्तर मैत्रीपूर्ण आणि उपयुक्त असावेत.

दुकानाची माहिती:
- नाव: श्री अलंकार ज्वेलर्स
- पत्ता: Shop No. 2, Ground Floor, Akurdi, Pune
- फोन: +91 9921612155
- वेळ: सकाळी ११ ते रात्री ९ वाजेपर्यंत
- इंस्टाग्राम: @shreealankar2112
- यूट्यूब: @Shreealankar2112`
      : `You are an AI assistant for Shree Alankar Jewellers. You help customers with jewelry inquiries, gold/silver rates, and jewelry services. Always respond in English. Keep your responses friendly and helpful.

Store Information:
- Name: Shree Alankar Jewellers
- Address: Shop No. 2, Ground Floor, Akurdi, Pune
- Phone: +91 9921612155
- Hours: 11 AM to 9 PM daily
- Instagram: @shreealankar2112
- YouTube: @Shreealankar2112`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
