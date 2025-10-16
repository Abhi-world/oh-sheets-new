import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

// Define flexible CORS headers
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Get the origin of the request
  const origin = req.headers.get('Origin') || '*'
  
  // A list of allowed origins
  const allowedOrigins = [
    'https://funny-otter-9faa67.netlify.app',
    'http://localhost:5173', // Local dev environment
    'https://monday.com',
    'https://*.monday.com'
  ]
  
  // Set the correct Allow-Origin header
  if (allowedOrigins.includes(origin) || origin.endsWith('.monday.com')) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  } else {
    // For other origins, allow all during development
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hardcoded Google Client ID to match the one configured in Google Cloud Console
    const googleClientId = '733843448601-od0r114ua2tpdm08ghos6a5tff72uelk.apps.googleusercontent.com'
    
    // No need to check if it's configured since it's hardcoded

    return new Response(
      JSON.stringify({ clientId: googleClientId }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error getting Google Client ID:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get Google Client ID' }),
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