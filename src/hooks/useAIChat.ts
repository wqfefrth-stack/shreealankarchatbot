
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

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
          customerName: 'Anonymous'
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
            customer_name: 'Anonymous',
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

  const sendAIMessage = async (text: string, customerName: string = 'Anonymous') => {
    // Add to conversation history
    const userMessage: ConversationMessage = { role: 'user', content: text };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { 
          message: text.trim(),
          customerName: customerName,
          conversationHistory: conversationHistory
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      const aiResponse = data?.response || 'Sorry, I encountered an error. Please try again.';

      // Add AI response to conversation history
      const aiMessage: ConversationMessage = { role: 'assistant', content: aiResponse };
      setConversationHistory(prev => [...prev, aiMessage]);

      // Save to database
      try {
        const { error: insertError } = await supabase
          .from('chat_logs')
          .insert({
            customer_name: customerName,
            message: text.trim(),
            response: aiResponse
          });

        if (insertError) {
          console.error('Error saving chat log:', insertError);
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
      }

      return aiResponse;
    } catch (error) {
      console.error('Error sending AI message:', error);
      throw error;
    }
  };

  const clearConversationHistory = () => {
    setConversationHistory([]);
  };

  return { 
    messages, 
    sendMessage, 
    isLoading,
    sendAIMessage,
    conversationHistory,
    clearConversationHistory
  };
};
