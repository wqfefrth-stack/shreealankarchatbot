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
    console.log('Starting website-analyzer function...');
    
    const { url, query } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log(`Fetching content from: ${url}`);
    
    // Fetch website content
    const websiteResponse = await fetch(url);
    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
    }
    
    const htmlContent = await websiteResponse.text();
    console.log('Website content fetched successfully');
    
    // Create AI prompt to analyze website content
    const analysisPrompt = `You are an advanced AI assistant that analyzes website content. Please analyze the following HTML content from ${url} and extract relevant information.

${query ? `Specific Query: ${query}` : 'Please extract all key information including current gold/silver rates, business details, contact information, and any other relevant data.'}

HTML Content:
${htmlContent}

Please provide a comprehensive and structured analysis of the website content. Focus on:
1. Current gold and silver rates (if available)
2. Business information and details
3. Contact information
4. Operating hours
5. Services offered
6. Any other relevant information

Provide the information in a clear, organized format.`;

    console.log('Making Gemini API call for website analysis...');

    // Make API call to Gemini for analysis
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received for website analysis');
    
    // Extract response
    let analysisResult = '';
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        analysisResult = candidate.content.parts[0].text;
      }
    }
    
    if (!analysisResult) {
      throw new Error('No analysis result from AI');
    }

    console.log('Website analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        analysis: analysisResult,
        url: url,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in website-analyzer function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Website analysis failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});