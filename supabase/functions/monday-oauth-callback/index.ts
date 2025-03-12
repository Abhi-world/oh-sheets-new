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
    const { code } = await req.json()

    if (!code) {
      throw new Error('No authorization code provided')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.monday.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: Deno.env.get('MONDAY_CLIENT_ID'),
        client_secret: Deno.env.get('MONDAY_CLIENT_SECRET'),
        redirect_uri: `${Deno.env.get('APP_URL') || Deno.env.get('SUPABASE_URL')}/monday-oauth`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user information from Monday.com
    const userResponse = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        query: `
          query {
            me {
              id
              email
            }
          }
        `,
      }),
    })

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information')
    }

    const { data: { me: { id: monday_user_id, email: monday_user_email } } } = await userResponse.json()

    return new Response(
      JSON.stringify({
        access_token,
        refresh_token,
        expires_in,
        monday_user_id,
        monday_user_email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})