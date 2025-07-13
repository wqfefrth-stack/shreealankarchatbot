
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = 'english', conversationHistory = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const geminiApiKey = 'AIzaSyAR7PeMiRvpDyvdYgRw8J7e2A4O56vESlE';

    // Enhanced system prompt for conversational AI
    const systemPrompt = language === 'marathi' 
      ? `तुम्ही श्री अलंकार ज्वेलर्सचे Advanced Conversational AI असिस्टंट आहात. तुम्ही अत्यंत बुद्धिमान, सहाय्यक आणि संवादशील आहात. तुमचे उत्तर अचूक, तपशीलवार आणि संदर्भानुसार असावेत. तुम्ही आधी काय चर्चा झाली आहे ते लक्षात ठेवता आणि त्यानुसार उत्तर देता.

🏪 **श्री अलंकार - संपूर्ण माहिती:**
- **नाव:** श्री अलंकार ज्वेलर्स
- **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
- **फोन:** +91 9921612155
- **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

**महत्वाचे सूचना:**
- आधीच्या संवादाचा संदर्भ घेऊन उत्तर द्या
- फॉलो-अप प्रश्नांना योग्य रीतीने उत्तर द्या
- नेहमी अचूक आणि विश्वसनीय माहिती द्या
- सोशल मीडिया लिंक्स शेअर करताना वरील अचूक URL वापरा
- ग्राहकांना सविस्तर मार्गदर्शन करा`
      : `You are an Advanced Conversational AI Assistant for Shree Alankar Jewellers. You are highly intelligent, helpful, and conversational. Your responses should be accurate, detailed, contextual, and should reference previous parts of the conversation when relevant.

🏪 **Shree Alankar - Complete Information:**
- **Name:** Shree Alankar Jewellers
- **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
- **Phone:** +91 9921612155
- **Hours:** 9:00 AM to 7:30 PM Daily
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

**Important Instructions:**
- Remember and reference previous conversation context
- Handle follow-up questions naturally and contextually
- Always provide accurate and reliable information
- When sharing social media links, use the exact URLs provided above
- Give detailed guidance to customers based on conversation history`;

    // Build conversation messages for Gemini
    const conversationMessages = [];
    
    // Add system message
    conversationMessages.push({
      parts: [{ text: systemPrompt }]
    });
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user') {
          conversationMessages.push({
            parts: [{ text: `Previous user question: ${msg.content}` }]
          });
        } else if (msg.role === 'assistant') {
          conversationMessages.push({
            parts: [{ text: `Previous assistant response: ${msg.content}` }]
          });
        }
      });
    }
    
    // Add current user message
    conversationMessages.push({
      parts: [{ text: `Current customer question: ${message}` }]
    });

    console.log('Building conversational context with', conversationMessages.length, 'messages');

    // Function to make enhanced Gemini API call with conversation context
    const makeGeminiCall = async (): Promise<Response> => {
      return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: conversationMessages,
          generationConfig: {
            temperature: 0.3,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1000,
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

    console.log('Making Enhanced Conversational Gemini AI call...');
    const response = await retryWithBackoff(makeGeminiCall, 3);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Enhanced Gemini API error: ${response.status} - ${errorText}`);
      
      // Enhanced error handling with more specific messages
      let errorMessage = '';
      if (response.status === 503) {
        errorMessage = language === 'marathi' 
          ? 'Advanced Conversational AI सेवा सध्या अनुपलब्ध आहे. कृपया काही क्षणांनी पुन्हा प्रयत्न करा.'
          : 'Advanced Conversational AI service is temporarily unavailable. Please try again in a few moments.';
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
          ? 'Advanced Conversational AI सेवेत तांत्रिक अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.'
          : 'Advanced Conversational AI service encountered a technical issue. Please try again.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Enhanced Conversational Gemini AI response:', data);
    
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
      console.error('No valid response from Enhanced Conversational Gemini AI:', data);
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

    console.log('Final Enhanced Conversational AI response:', aiResponse);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced conversational chat-ai function:', error);
    
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
