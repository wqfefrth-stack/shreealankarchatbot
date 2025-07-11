import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced retry function with exponential backoff
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

    // Enhanced system prompt for more accurate responses
    const systemPrompt = language === 'marathi' 
      ? `तुम्ही श्री अलंकार ज्वेलर्सचे Advanced AI असिस्टंट आहात. तुम्ही अत्यंत बुद्धिमान आणि सहाय्यक आहात. तुमचे उत्तर अचूक, तपशीलवार आणि उपयुक्त असावेत.

🏪 **श्री अलंकार - संपूर्ण माहिती:**
- **नाव:** श्री अलंकार ज्वेलर्स
- **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
- **फोन:** +91 9921612155
- **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

**महत्वाचे सूचना:**
- नेहमी अचूक आणि विश्वसनीय माहिती द्या
- सोशल मीडिया लिंक्स शेअर करताना वरील अचूक URL वापरा
- ग्राहकांना सविस्तर मार्गदर्शन करा
- दागिन्यांचे दर, सेवा, आणि तपशील नेहमी अद्यतन माहितीसह द्या`
      : `You are an Advanced AI Assistant for Shree Alankar Jewellers. You are highly intelligent and helpful. Your responses should be accurate, detailed, and useful.

🏪 **Shree Alankar - Complete Information:**
- **Name:** Shree Alankar Jewellers
- **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
- **Phone:** +91 9921612155
- **Hours:** 9:00 AM to 7:30 PM Daily
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

**Important Instructions:**
- Always provide accurate and reliable information
- When sharing social media links, use the exact URLs provided above
- Give detailed guidance to customers
- Always provide updated information about jewelry rates, services, and details`;

    // Function to make enhanced Gemini API call
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
                { text: `Customer question: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more consistent, accurate responses
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 800, // Increased for more detailed responses
            candidateCount: 1,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });
    };

    console.log('Making Enhanced Gemini AI call...');
    const response = await retryWithBackoff(makeGeminiCall, 3);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Enhanced Gemini API error: ${response.status} - ${errorText}`);
      
      // Enhanced error handling with more specific messages
      let errorMessage = '';
      if (response.status === 503) {
        errorMessage = language === 'marathi' 
          ? 'Advanced Gemini AI सेवा सध्या अनुपलब्ध आहे. कृपया काही क्षणांनी पुन्हा प्रयत्न करा.'
          : 'Advanced Gemini AI service is temporarily unavailable. Please try again in a few moments.';
      } else if (response.status === 429) {
        errorMessage = language === 'marathi'
          ? 'बर्याच विनंत्या आल्या आहेत. कृपया थोडा वेळ थांबा आणि पुन्हा प्रयत्न करा.'
          : 'Too many requests. Please wait a moment and try again.';
      } else if (response.status === 400) {
        errorMessage = language === 'marathi'
          ? 'तुमचा प्रश्न समजला नाही. कृपया स्पष्टपणे प्रश्न विचारा.'
          : 'Could not understand your question. Please ask your question clearly.';
      } else {
        errorMessage = language === 'marathi'
          ? 'Advanced AI सेवेत तांत्रिक अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.'
          : 'Advanced AI service encountered a technical issue. Please try again.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Enhanced Gemini AI response:', data);
    
    // Enhanced response processing
    let aiResponse = '';
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        aiResponse = candidate.content.parts[0].text;
      }
    }
    
    // Enhanced fallback response
    if (!aiResponse) {
      console.error('No valid response from Enhanced Gemini AI:', data);
      aiResponse = language === 'marathi' 
        ? `माफ करा, मी तुमच्या प्रश्नाचे योग्य उत्तर देऊ शकत नाही. कृपया आमच्याशी थेट संपर्क साधा:

📞 **फोन:** +91 9921612155
📍 **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
🕒 **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०
📱 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
        : `Sorry, I could not generate a proper response. Please contact us directly:

📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
🕒 **Hours:** 9:00 AM to 7:30 PM Daily
📱 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`;
    }

    console.log('Final Enhanced AI response:', aiResponse);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced chat-ai function:', error);
    
    // Enhanced error response with contact information
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
