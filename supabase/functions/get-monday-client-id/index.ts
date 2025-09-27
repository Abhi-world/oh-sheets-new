import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MONDAY_CLIENT_ID = Deno.env.get('MONDAY_CLIENT_ID')
    
    if (!MONDAY_CLIENT_ID) {
      throw new Error('Monday.com client ID not found in environment variables')
    }

    return new Response(
      JSON.stringify({ MONDAY_CLIENT_ID }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    const err = error as any;
    return new Response(
      JSON.stringify({ error: err?.message ?? String(error) }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})