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
    const { refresh_token } = await req.json()

    if (!refresh_token) {
      throw new Error('No refresh token provided')
    }

    // Exchange refresh token for a new access token
    const tokenResponse = await fetch('https://auth.monday.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: Deno.env.get('MONDAY_CLIENT_ID'),
        client_secret: Deno.env.get('MONDAY_CLIENT_SECRET'),
        refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Failed to refresh token:', errorText)
      throw new Error(`Failed to refresh token: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenData

    // Get user information from Monday.com to confirm token validity
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
      throw new Error('Failed to validate new access token')
    }

    const userData = await userResponse.json()
    const { data: { me: { id: monday_user_id, email: monday_user_email } } } = userData

    return new Response(
      JSON.stringify({
        access_token,
        refresh_token: new_refresh_token || refresh_token, // Use new refresh token if provided, otherwise keep the old one
        expires_in,
        monday_user_id,
        monday_user_email
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('Token refresh error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})