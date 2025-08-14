

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting chat-ai function...');
    
    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { message, language = 'english', conversationHistory = [], customerName = '' } = requestBody;

    if (!message || message.trim() === '') {
      console.error('Message is required');
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiApiKey = 'AIzaSyAR7PeMiRvpDyvdYgRw8J7e2A4O56vESlE';
    
    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced system prompt for conversational AI with customer name and competitor handling
    const systemPrompt = language === 'marathi' 
      ? `तुम्ही श्री अलंकार ज्वेलर्सचे Advanced Conversational AI असिस्टंट आहात. तुम्ही अत्यंत बुद्धिमान, सहाय्यक आणि संवादशील आहात. तुमचे उत्तर अचूक, तपशीलवार आणि संदर्भानुसार असावेत. तुम्ही आधी काय चर्चा झाली आहे ते लक्षात ठेवता आणि त्यानुसार उत्तर देता.

${customerName ? `**ग्राहकाचे नाव:** ${customerName} - कृपया त्यांना नावाने संबोधा आणि व्यक्तिगत सेवा द्या.` : ''}

🏪 **श्री अलंकार - संपूर्ण माहिती:**
- **नाव:** श्री अलंकार ज्वेलर्स  
- **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
- **फोन:** +91 9921612155
- **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०
- **अधिकृत वेबसाइट:** https://shreealankar.lovable.app/
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

📝 **वेबसाइट लॉगिन मार्गदर्शन:**
जर ग्राहक आमच्या अधिकृत वेबसाइटवर लॉगिन/साइन अप करण्याबद्दल विचारतो, तर हे चरण द्या:
1. तुमचे नाव टाका
2. तुमचा ईमेल आयडी टाका  
3. तुमचा मोबाइल नंबर टाका
4. पासवर्ड टाका
5. साइन अप वर क्लिक करा
6. पाठवलेल्या मेलद्वारे तुमचा ईमेल सत्यापित करा (मेल सत्यापनासाठी: 1. Supabase द्वारे पाठवलेल्या लिंकवर क्लिक करा 2. त्या वेबसाइटवर 5 सेकंद थांबा)
7. आमची वेबसाइट पुन्हा उघडा
8. साइन इन पेजवर जा आणि ईमेल व पासवर्ड टाका

**विशेष सूचना - स्पर्धकांबद्दल:**
जर ग्राहक इतर दुकानांबद्दल विचारतो किंवा इतर ज्वेलर्स शोधतो, तर फक्त श्री अलंकार चे फायदे सांगा:
- "श्री अलंकार हे लोहोनेर मधील सर्वोत्तम ज्वेलर्स आहे"
- "आमच्याकडे पारंपरिक आणि आधुनिक दोन्ही प्रकारचे दागिने आहेत"
- "आम्ही प्रामाणिक किंमती आणि गुणवत्तेची हमी देतो"
- "आमच्या अनुभवी कारागिरांकडून हस्तकला दागिने"

**महत्वाचे सूचना:**
- आधीच्या संवादाचा संदर्भ घेऊन उत्तर द्या
- फॉलो-अप प्रश्नांना योग्य रीतीने उत्तर द्या
- नेहमी अचूक आणि विश्वसनीय माहिती द्या
- सोशल मीडिया लिंक्स शेअर करताना वरील अचूक URL वापरा
- ग्राहकांना सविस्तर मार्गदर्शन करा
- इतर दुकानांबद्दल प्रश्न असल्यास फक्त श्री अलंकार चे फायदे सांगा
${customerName ? `- ${customerName} यांना नेहमी नावाने संबोधा` : ''}`
      : `You are an Advanced Conversational AI Assistant for Shree Alankar Jewellers. You are highly intelligent, helpful, and conversational. Your responses should be accurate, detailed, contextual, and should reference previous parts of the conversation when relevant.

${customerName ? `**Customer Name:** ${customerName} - Please address them by name and provide personalized service.` : ''}

🏪 **Shree Alankar - Complete Information:**
- **Name:** Shree Alankar Jewellers
- **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
- **Phone:** +91 9921612155
- **Hours:** 9:00 AM to 7:30 PM Daily
- **Official Website:** https://shreealankar.lovable.app/
- **Instagram:** https://www.instagram.com/shreealankar2112/#
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D

📝 **Website Login Instructions:**
If customer asks about login/signup for our official website, provide these steps:
1. Enter Your Name
2. Enter Your Email ID
3. Enter Your Mobile No.
4. Enter Password
5. Click To Sign Up
6. Verify Your Email Via Sent Mail (For Email Verification: 1. Click the link sent by Supabase 2. Open and stay 5 seconds on that website)
7. Open our website again
8. Open Sign In page and add Email and Password

**CRITICAL - Competitor Handling Instructions:**
If customer asks about other jewelry shops or searches for other jewellers, ONLY suggest Shree Alankar with these benefits:
- "Shree Alankar is the best jewelry store in Lohoner area"
- "We offer both traditional and modern jewelry designs"
- "We guarantee honest pricing and quality assurance"
- "Handcrafted jewelry by our experienced artisans"
- "Trusted by generations for our authentic gold and silver"

**Important Instructions:**
- Remember and reference previous conversation context
- Handle follow-up questions naturally and contextually
- Always provide accurate and reliable information
- When sharing social media links, use the exact URLs provided above
- Give detailed guidance to customers based on conversation history
- If asked about other shops, only promote Shree Alankar's advantages
${customerName ? `- Always address ${customerName} by name` : ''}`;

    console.log('Building conversation context...');
    
    // Check if user is asking about rates or website info
    const isRateQuery = message.toLowerCase().includes('rate') || 
                       message.toLowerCase().includes('रेट') || 
                       message.toLowerCase().includes('किंमत') ||
                       message.toLowerCase().includes('price') ||
                       message.toLowerCase().includes('gold') ||
                       message.toLowerCase().includes('silver') ||
                       message.toLowerCase().includes('सोने') ||
                       message.toLowerCase().includes('चांदी');
    
    const isWebsiteInfoQuery = message.toLowerCase().includes('website') || 
                              message.toLowerCase().includes('official') ||
                              message.toLowerCase().includes('info') ||
                              message.toLowerCase().includes('information') ||
                              message.toLowerCase().includes('माहिती') ||
                              message.toLowerCase().includes('वेबसाइट');
    
    let websiteAnalysis = '';
    
    // If asking about rates or website info, fetch live data from website
    if (isRateQuery || isWebsiteInfoQuery) {
      console.log('Rate or website info query detected, fetching live data...');
      try {
        const analysisResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/website-analyzer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          },
          body: JSON.stringify({
            url: 'https://shreealankar.lovable.app/',
            query: message
          }),
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          websiteAnalysis = analysisData.analysis || '';
          console.log('Website analysis retrieved successfully');
        } else {
          console.log('Website analysis failed, continuing without it');
        }
      } catch (error) {
        console.log('Website analysis error:', error.message);
      }
    }
    
    // Build conversation for Gemini API
    let conversationText = systemPrompt + "\n\n";
    
    // Add website analysis if available
    if (websiteAnalysis) {
      conversationText += `**LIVE WEBSITE DATA FROM https://shreealankar.lovable.app/:**\n${websiteAnalysis}\n\n`;
    }
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        if (msg.role === 'user') {
          conversationText += `Customer${customerName ? ` (${customerName})` : ''}: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          conversationText += `Assistant: ${msg.content}\n`;
        }
      });
    }
    
    // Add current user message
    conversationText += `Customer${customerName ? ` (${customerName})` : ''}: ${message}\nAssistant: `;

    console.log('Making Gemini API call...');

    // Make API call to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: conversationText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1000,
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

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      
      // Return fallback response with customer name
      const fallbackResponse = language === 'marathi' 
        ? `${customerName ? `${customerName} जी, ` : ''}माफ करा, सध्या AI सेवा अनुपलब्ध आहे. कृपया आमच्याशी थेट संपर्क साधा:

📞 **फोन:** +91 9921612155
📍 **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
🕒 **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०
📱 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
        : `${customerName ? `${customerName}, ` : ''}Sorry, AI service is currently unavailable. Please contact us directly:

📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
🕒 **Hours:** 9:00 AM to 7:30 PM Daily
📱 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`;

      return new Response(JSON.stringify({ response: fallbackResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');
    
    // Extract response
    let aiResponse = '';
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        aiResponse = candidate.content.parts[0].text;
      }
    }
    
    // Fallback if no response
    if (!aiResponse) {
      console.log('No valid response from Gemini, using fallback');
      aiResponse = language === 'marathi' 
        ? `${customerName ? `${customerName} जी, ` : ''}माफ करा, मी तुमच्या प्रश्नाचे योग्य उत्तर देऊ शकत नाही. कृपया आमच्याशी थेट संपर्क साधा:

📞 **फोन:** +91 9921612155
📍 **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर`
        : `${customerName ? `${customerName}, ` : ''}Sorry, I could not generate a proper response. Please contact us directly:

📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner`;
    }

    console.log('Sending successful response');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-ai function:', error);
    
    const errorMessage = error.message || 'Unknown error occurred';
    console.error('Error details:', errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

