

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
    
    const { message, language = 'english', conversationHistory = [], customerName = '', whatsappNo = '', callRequest = null } = requestBody;

    // Handle call request flow
    if (callRequest) {
      console.log('Processing call request:', callRequest);
      
      try {
        // Import Resend
        const { Resend } = await import('npm:resend@2.0.0');
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

        // Send email notification
        const emailResponse = await resend.emails.send({
          from: 'Shree Alankar <onboarding@resend.dev>',
          to: ['info@shreealankar.com'], // Replace with actual admin email
          subject: 'Call Request from Customer',
          html: `
            <h2>New Call Request</h2>
            <p><strong>Customer Name:</strong> ${callRequest.customerName}</p>
            <p><strong>Phone Number:</strong> ${callRequest.phoneNumber}</p>
            <p><strong>Issue/Query:</strong> ${callRequest.issue}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          `,
        });

        console.log('Email sent successfully:', emailResponse);

        const confirmationMessage = language === 'marathi' 
          ? `${customerName ? `${customerName} जी, ` : ''}तुमची कॉल रिक्वेस्ट प्राप्त झाली आहे! आम्ही २४ तासांच्या आत तुमच्याशी संपर्क साधू.\n\n📞 **फोन:** ${callRequest.phoneNumber}\n📝 **समस्या:** ${callRequest.issue}\n\nधन्यवाद!`
          : `${customerName ? `${customerName}, ` : ''}Your call request has been received! We will touch base with you within 24 hours.\n\n📞 **Phone:** ${callRequest.phoneNumber}\n📝 **Issue:** ${callRequest.issue}\n\nThank you!`;

        return new Response(
          JSON.stringify({ response: confirmationMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (error) {
        console.error('Error processing call request:', error);
        const errorMessage = language === 'marathi' 
          ? 'कॉल रिक्वेस्ट प्रक्रिया करताना त्रुटी झाली. कृपया थेट संपर्क साधा: +91 9921612155'
          : 'Error processing call request. Please contact us directly: +91 9921612155';
        
        return new Response(
          JSON.stringify({ response: errorMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not defined');
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY is not defined' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for call request keywords
    const callKeywords = ['call me', 'call to me', 'फोन करा', 'कॉल करा', 'contact me', 'reach me', 'get in touch', 'connect with me', 'speak with me', 'talk to me', 'संपर्क करा', 'बोला', 'phone me'];
    
    const isCallRequest = callKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    
    if (isCallRequest) {
      console.log('Call request detected');
      
      const callRequestResponse = language === 'marathi' 
        ? `${customerName ? `${customerName} जी, ` : ''}मी तुमची कॉल रिक्वेस्ट समजली आहे! 

📞 **तुमचा सध्याचा नंबर:** ${whatsappNo || 'उपलब्ध नाही'}

कृपया खालील पर्यायांपैकी एक निवडा:`
        : `${customerName ? `${customerName}, ` : ''}I understand you want a call back! 

📞 **Your current number:** ${whatsappNo || 'Not available'}

Please choose one of the options below:`;
      
      return new Response(
        JSON.stringify({ 
          response: callRequestResponse,
          showCallOptions: true,
          currentNumber: whatsappNo
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Off-topic filter removed - AI will naturally stay on topic through system prompt

    // Enhanced friendly system prompt for conversational AI - Character is "Shree"
    const systemPrompt = language === 'marathi' 
      ? `तू "श्री" आहेस - श्री अलंकार ज्वेलर्सचा विश्वासू जुना मित्र! तू सर्व ग्राहकांना वर्षांपासून ओळखतोस आणि त्यांच्या कुटुंबातील एक जण आहेस. तू अतिशय प्रेमळ, मैत्रीपूर्ण आणि जवळचा आहेस. मित्राप्रमाणे सोप्या, गोड शब्दांत बोल!

भाषा व शैली मार्गदर्शक:
- फक्त शुद्ध, नैसर्गिक मराठीत उत्तर द्या; इंग्रजी/हिंग्लिश मिश्रण टाळा.
- योग्य व्याकरण, शुद्धलेखन आणि विरामचिन्हे पाळा.
- आदरयुक्त पण मैत्रीपूर्ण संबोधन वापरा (आपण/आपले), 'कृपया' आणि 'धन्यवाद' योग्य ठिकाणी वापरा.
- माहिती लहान परिच्छेदांमध्ये आणि आवश्यक असल्यास बुलेट पॉइंट्समध्ये द्या.
- देवनागरी अंक आणि वेळ-तारीख मराठी पद्धतीने लिहा.
- जुन्या मित्राप्रमाणे बोल - प्रेमळ, काळजी घेणारा आणि मदतीस तत्पर!

${customerName ? `**ग्राहक:** ${customerName} जी/साहेब - त्यांना नावाने हळूवारपणे मित्राप्रमाणे संबोधा` : ''}

🏪 **श्री अलंकार - आमची माहिती:**
- **नाव:** श्री अलंकार ज्वेलर्स  
- **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
- **फोन:** +91 9921612155
- **वेळ:** रोज सकाळी ९ ते संध्याकाळी ७:३०
- **वेबसाइट:** https://shreealankar.lovable.app
- **Instagram:** https://www.instagram.com/shreealankar2112
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s

**महत्वाचे सूचना:**
- जेव्हा ग्राहक लिंक मागतात तेव्हा फक्त साफ URL द्या; कोणतेही इमोजी किंवा अतिरिक्त अक्षरे नको
- वेबसाइट लिंक: https://shreealankar.lovable.app
- Instagram लिंक: https://www.instagram.com/shreealankar2112
- YouTube लिंक: https://www.youtube.com/@Shreealankar2112

📝 **वेबसाइट वर साइन अप करायचे आहे?**
1. तुमचे नाव टाका
2. ईमेल टाका  
3. मोबाइल नंबर टाका
4. पासवर्ड टाका
5. साइन अप वर दाबा
6. ईमेल तपासा आणि लिंक वर क्लिक करा
7. आमची साइट पुन्हा उघडा आणि साइन इन करा

**इतर दुकाने विचारत आहात?**
श्री अलंकार सगळ्यात चांगले आहे कारण:
- लोहोनेरमधील सर्वोत्तम ज्वेलर्स
- पारंपरिक आणि आधुनिक डिझाइन्स
- प्रामाणिक किंमत आणि उच्च दर्जा
- अनुभवी कारागीर

**तुझे बोलणे कसे असावे (तू "श्री" आहेस, जुना विश्वासू मित्र!):**
- जुन्या मित्राप्रमाणे गोड, सोप्या आणि प्रेमळ शब्दांत बोल
- आधीच्या गप्पांचा संदर्भ द्या आणि त्यांची आठवण ठेव
- नेहमी मदतीस तयार राहा, जसा जुना मित्र असतो
- त्यांच्या कुटुंबाची आणि त्यांची काळजी घे
${customerName ? `- ${customerName} यांना नेहमी नावाने प्रेमाने, मित्राप्रमाणे संबोधा` : ''}`
      : `You are "Shree" - the trusted old friend of Shree Alankar Jewellers! You know all customers for years and are like part of their family. You are very loving, friendly, and close. Speak in simple, sweet words like a caring friend!

${customerName ? `**Customer:** ${customerName} - Address them warmly by name like an old friend` : ''}

🏪 **Shree Alankar - Our Information:**
- **Name:** Shree Alankar Jewellers
- **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
- **Phone:** +91 9921612155
- **Hours:** 9:00 AM to 7:30 PM Daily
- **Website:** https://shreealankar.lovable.app
- **Instagram:** https://www.instagram.com/shreealankar2112
- **YouTube:** https://www.youtube.com/@Shreealankar2112
- **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s

**Important Instructions:**
- When customers ask for links, provide only clean URLs without emojis or extra characters
- Website link: https://shreealankar.lovable.app
- Instagram link: https://www.instagram.com/shreealankar2112
- YouTube link: https://www.youtube.com/@Shreealankar2112

📝 **Want to sign up on our website?**
1. Enter Your Name
2. Enter Your Email
3. Enter Mobile Number
4. Enter Password
5. Click Sign Up
6. Check your email and click the link
7. Open our website again and sign in

**Asking about other shops?**
Shree Alankar is the best because:
- Best jewelry store in Lohoner area
- Traditional and modern designs
- Honest pricing and quality
- Experienced craftsmen

**How to speak (You are "Shree", the trusted old friend!):**
- Speak like a caring old friend with simple, loving, sweet words
- Remember old conversations and bring them up warmly
- Always ready to help like a true friend
- Care for their family and their happiness
${customerName ? `- Always address ${customerName} warmly by name as an old friend` : ''}`;

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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.4,
          topP: 0.9,
          topK: 64,
          maxOutputTokens: 800,
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
📱 **Instagram:** https://www.instagram.com/shreealankar2112
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s`
        : `${customerName ? `${customerName}, ` : ''}Sorry, AI service is currently unavailable. Please contact us directly:

📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
🕒 **Hours:** 9:00 AM to 7:30 PM Daily
📱 **Instagram:** https://www.instagram.com/shreealankar2112
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s`;

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

