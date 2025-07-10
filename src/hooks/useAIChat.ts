
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface AIResponse {
  response: string;
  error?: string;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const { toast } = useToast();

  const sendAIMessage = async (message: string): Promise<string> => {
    setIsLoading(true);
    
    try {
      console.log('Sending Gemini AI message:', message);
      
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: message.trim(),
          language: language === 'marathi' ? 'marathi' : 'english'
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        
        // Show user-friendly toast notification
        toast({
          title: language === 'marathi' ? 'तांत्रिक अडचण' : 'Technical Issue',
          description: language === 'marathi' 
            ? 'AI सेवेशी कनेक्शन करण्यात अडचण आली आहे. कृपया पुन्हा प्रयत्न करा.'
            : 'Unable to connect to AI service. Please try again.',
          variant: "destructive",
        });
        
        throw new Error('Failed to get AI response');
      }

      const aiData = data as AIResponse;
      
      if (aiData.error) {
        console.error('Gemini AI API error:', aiData.error);
        
        // Show specific error message from AI
        toast({
          title: language === 'marathi' ? 'AI सेवा अनुपलब्ध' : 'AI Service Unavailable',
          description: aiData.error,
          variant: "destructive",
        });
        
        return aiData.error;
      }

      console.log('Gemini AI response received:', aiData.response);
      
      // Show success toast for successful AI responses
      toast({
        title: language === 'marathi' ? 'उत्तर मिळाले' : 'Response Received',
        description: language === 'marathi' 
          ? 'Gemini AI ने तुमच्या प्रश्नाचे उत्तर दिले आहे.'
          : 'Gemini AI has responded to your question.',
      });
      
      return aiData.response;
      
    } catch (error) {
      console.error('Error sending Gemini AI message:', error);
      
      // Return a more helpful fallback response
      const fallbackMessage = language === 'marathi' 
        ? 'माफ करा, सध्या Gemini AI सेवा अनुपलब्ध आहे. आम्ही त्वरित समस्या सोडवण्याचा प्रयत्न करत आहोत.\n\n📱 तातडीच्या मदतीसाठी:\n📞 फोन: +91 9921612155\n📍 पत्ता: Shop No. 2, Ground Floor, Akurdi, Pune\n🕒 वेळ: सकाळी ११ ते रात्री ९ वाजेपर्यंत'
        : 'Sorry, Gemini AI service is currently unavailable. We are working to resolve this quickly.\n\n📱 For immediate assistance:\n📞 Phone: +91 9921612155\n📍 Address: Shop No. 2, Ground Floor, Akurdi, Pune\n🕒 Hours: 11 AM to 9 PM daily';

      // Show final fallback toast
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

  return { sendAIMessage, isLoading };
};
