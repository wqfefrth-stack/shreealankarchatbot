
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, customerName } = await req.json()

    // Simple AI response logic - you can replace this with actual AI integration
    const responses = [
      "Thank you for your message! How can I help you today?",
      "I understand your concern. Let me provide you with some information.",
      "That's a great question! Here's what I can tell you about that.",
      "I'm here to help! Could you provide more details about your inquiry?",
      "Thanks for reaching out! I'll do my best to assist you with that.",
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    // Add some context-aware responses based on keywords
    let response = randomResponse
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = "For pricing information, I'd be happy to help! Our rates vary depending on your specific needs. Could you tell me more about what you're looking for?"
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = "I'm here to help! What specific issue or question can I assist you with today?"
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = `Hello ${customerName}! Welcome! How can I assist you today?`
    } else if (lowerMessage.includes('thank')) {
      response = "You're very welcome! Is there anything else I can help you with?"
    }

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
