
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

  const sendAIMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      console.log('Sending Enhanced Gemini AI message:', message);
      console.log('Current conversation history:', conversationHistory);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: message.trim(),
          language: language === 'marathi' ? 'marathi' : 'english',
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        
        toast({
          title: language === 'marathi' ? 'तांत्रिक अडचण' : 'Technical Issue',
          description: language === 'marathi' 
            ? 'Enhanced AI सेवेशी कनेक्शन करण्यात अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.'
            : 'Unable to connect to Enhanced AI service. Please try again.',
          variant: "destructive",
        });
        
        throw new Error('Failed to get Enhanced AI response');
      }

      const aiData = data as AIResponse;
      
      if (aiData.error) {
        console.error('Enhanced Gemini AI API error:', aiData.error);
        
        toast({
          title: language === 'marathi' ? 'AI सेवा अनुपलब्ध' : 'AI Service Unavailable',
          description: aiData.error,
          variant: "destructive",
        });
        
        return aiData.error;
      }

      console.log('Enhanced Gemini AI response received:', aiData.response);
      
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
      
      toast({
        title: language === 'marathi' ? 'उन्नत उत्तर मिळाले' : 'Advanced Response Received',
        description: language === 'marathi' 
          ? 'Enhanced Gemini AI ने तुमच्या प्रश्नाचे विस्तृत उत्तर दिले आहे.'
          : 'Enhanced Gemini AI has provided a detailed response to your question.',
      });
      
      return aiData.response;
      
    } catch (error) {
      console.error('Error sending Enhanced Gemini AI message:', error);
      
      // Enhanced fallback response with correct social media links
      const fallbackMessage = language === 'marathi' 
        ? `माफ करा, सध्या Enhanced Gemini AI सेवा अनुपलब्ध आहे. आम्ही त्वरित समस्या सोडवण्याचा प्रयत्न करत आहोत.

📱 **तातडीच्या मदतीसाठी:**
📞 **फोन:** +91 9921612155
📍 **पत्ता:** श्री अलंकार, बँक ऑफ महाराष्ट्र जवळ, लोहोनेर
🕒 **वेळ:** दररोज सकाळी ९:०० ते संध्याकाळी ७:३०

📱 **सोशल मीडिया:**
📸 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`
        : `Sorry, Enhanced Gemini AI service is currently unavailable. We are working to resolve this quickly.

📱 **For immediate assistance:**
📞 **Phone:** +91 9921612155
📍 **Address:** Shree Alankar, Near Bank Of Maharashtra, Lohoner
🕒 **Hours:** 9:00 AM to 7:30 PM Daily

📱 **Social Media:**
📸 **Instagram:** https://www.instagram.com/shreealankar2112/#
📺 **YouTube:** https://www.youtube.com/@Shreealankar2112
🗺️ **Google Maps:** https://www.google.com/maps/place/Shree+Alankar/@20.5144759,74.2000775,18z/data=!4m6!3m5!1s0x3bde7d9ab173487f:0xf0a759b0a4f281e2!8m2!3d20.5137601!4d74.1991422!16s%2Fg%2F11qzzxsp6s?authuser=0&entry=ttu&g_ep=EgoyMDI1MDcwOC4wIKXMDSoASAFQAw%3D%3D`;

      toast({
        title: language === 'marathi' ? 'Enhanced AI सेवा अनुपलब्ध' : 'Enhanced AI Service Unavailable',
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
