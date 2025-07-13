
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const useAIChat = (customerName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: text.trim(),
          customerName: customerName || 'Anonymous'
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      const aiResponse = data?.response || 'Sorry, I encountered an error. Please try again.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save to database
      try {
        const { error: insertError } = await supabase
          .from('chat_logs')
          .insert({
            customer_name: customerName || 'Anonymous',
            message: text.trim(),
            response: aiResponse
          });

        if (insertError) {
          console.error('Error saving chat log:', insertError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};
