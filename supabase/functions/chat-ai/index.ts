
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry function with exponential backoff
async function retryWithBackoff(fn: () => Promise<Response>, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fn();
      if (response.ok) {
        return response;
      }
      
      // If it's a server error (5xx), retry
      if (response.status >= 500 && attempt < maxRetries) {
        console.log(`Attempt ${attempt} failed with status ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed:`, error.message);
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
}

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

    const geminiApiKey = 'AIzaSyAR7PeMiRvpDyvdYgRw8J7e2A4O56vESlE';

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

    // Function to make Gemini API call
    const makeGeminiCall = async (): Promise<Response> => {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User message: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });
    };

    console.log('Making Gemini API call...');
    const response = await retryWithBackoff(makeGeminiCall, 3);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      
      // Return a more helpful error message based on the status
      let errorMessage = '';
      if (response.status === 503) {
        errorMessage = language === 'marathi' 
          ? 'Gemini AI सेवा सध्या अनुपलब्ध आहे. कृपया काही क्षणांनी पुन्हा प्रयत्न करा.'
          : 'Gemini AI service is temporarily unavailable. Please try again in a few moments.';
      } else if (response.status === 429) {
        errorMessage = language === 'marathi'
          ? 'बर्याच विनंत्या आल्या आहेत. कृपया थोडा वेळ थांबा आणि पुन्हा प्रयत्न करा.'
          : 'Too many requests. Please wait a moment and try again.';
      } else if (response.status === 400) {
        errorMessage = language === 'marathi'
          ? 'तुमचा प्रश्न समजला नाही. कृपया पुन्हा प्रयत्न करा.'
          : 'Could not understand your question. Please try again.';
      } else {
        errorMessage = language === 'marathi'
          ? 'AI सेवेत तांत्रिक अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.'
          : 'AI service encountered a technical issue. Please try again.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Gemini API response:', data);
    
    // Handle various response formats from Gemini
    let aiResponse = '';
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        aiResponse = candidate.content.parts[0].text;
      }
    }
    
    // Fallback if no response found
    if (!aiResponse) {
      console.error('No valid response from Gemini API:', data);
      aiResponse = language === 'marathi' 
        ? 'माफ करा, मी तुमच्या प्रश्नाचे उत्तर देऊ शकत नाही. कृपया पुन्हा प्रयत्न करा किंवा आमच्याशी थेट संपर्क साधा.'
        : 'Sorry, I could not generate a proper response. Please try again or contact us directly.';
    }

    console.log('Final AI response:', aiResponse);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    // Provide language-specific error messages
    const errorMessage = error.message || 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
