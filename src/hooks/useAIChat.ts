
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface AIResponse {
  response: string;
  error?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const { language } = useLanguage();
  const { toast } = useToast();

  const sendAIMessage = async (message: string, customerName?: string, whatsappNo?: string): Promise<any> => {
    setIsLoading(true);
    
    try {
      console.log('Sending message to AI:', message);
      console.log('Customer name:', customerName);
      console.log('WhatsApp number:', whatsappNo);
      console.log('Current conversation history:', conversationHistory);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: message.trim(),
          language: language === 'marathi' ? 'marathi' : 'english',
          conversationHistory: conversationHistory,
          customerName: customerName || '',
          whatsappNo: whatsappNo || ''
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to get AI response');
      }

      const aiData = data as any;
      
      if (aiData.error) {
        console.error('AI service error:', aiData.error);
        throw new Error(aiData.error);
      }

      if (!aiData.response) {
        console.error('No response from AI service');
        throw new Error('No response received from AI');
      }

      console.log('AI response received:', aiData.response);
      
      // Update conversation history
      const newUserMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      
      const newAIMessage: ConversationMessage = {
        role: 'assistant',
        content: aiData.response,
        timestamp: new Date()
      };
      
      setConversationHistory(prev => [...prev, newUserMessage, newAIMessage]);
      
      // Save chat to database
      try {
        await supabase.from('chat_logs').insert({
          customer_name: customerName || 'Anonymous',
          message: message,
          response: aiData.response,
          whatsapp_no: whatsappNo || null
        });
        console.log('Chat saved to database');
      } catch (dbError) {
        console.error('Error saving chat to database:', dbError);
        // Don't throw error here, just log it
      }

      toast({
        title: language === 'marathi' ? 'उत्तर मिळाले' : 'Response Received',
        description: language === 'marathi' 
          ? 'AI ने तुमच्या प्रश्नाचे उत्तर दिले आहे.'
          : 'AI has responded to your question.',
      });
      
      // Return full data if it has showCallOptions, otherwise just the response
      return aiData.showCallOptions ? aiData : aiData.response;
      
    } catch (error) {
      console.error('Error in sendAIMessage:', error);
      
      // Enhanced fallback response with customer name
      const fallbackMessage = language === 'marathi' 
        ? `${customerName ? `${customerName} जी, ` : ''}माफ करा, सध्या AI सेवा अनुपलब्ध आहे. कृपया आमच्याशी थेट संपर्क साधा:

📞 **फोन:** +91 9921612155
📍 **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
🕒 **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०

📱 **सोशल मीडिया:**
📸 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
        : `${customerName ? `${customerName}, ` : ''}Sorry, AI service is currently unavailable. Please contact us directly:

📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
🕒 **Hours:** 9:00 AM to 7:30 PM Daily

📱 **Social Media:**
📸 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`;

      toast({
        title: language === 'marathi' ? 'AI सेवा अनुपलब्ध' : 'AI Service Unavailable',
        description: language === 'marathi' 
          ? 'कृपया थेट संपर्क साधा किंवा काही वेळानंतर प्रयत्न करा.'
          : 'Please contact us directly or try again later.',
        variant: "destructive",
      });
      
      return fallbackMessage;
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
  };

  return { sendAIMessage, isLoading, conversationHistory, clearConversationHistory };
};
