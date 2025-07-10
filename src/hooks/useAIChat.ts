
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface AIResponse {
  response: string;
  error?: string;
}

export const useAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

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
        throw new Error('Failed to get AI response');
      }

      const aiData = data as AIResponse;
      
      if (aiData.error) {
        console.error('Gemini AI API error:', aiData.error);
        throw new Error(aiData.error);
      }

      console.log('Gemini AI response received:', aiData.response);
      return aiData.response;
      
    } catch (error) {
      console.error('Error sending Gemini AI message:', error);
      // Return a fallback response
      return language === 'marathi' 
        ? 'माफ करा, सध्या AI सेवा उपलब्ध नाही. कृपया नंतर प्रयत्न करा किंवा आमच्याशी थेट संपर्क साधा.'
        : 'Sorry, AI service is currently unavailable. Please try again later or contact us directly.';
    } finally {
      setIsLoading(false);
    }
  };

  return { sendAIMessage, isLoading };
};
