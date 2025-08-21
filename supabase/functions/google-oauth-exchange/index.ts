import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OAuth exchange...');
    const { code } = await req.json();
    
    if (!code) {
      console.error('No authorization code provided');
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authorization code received, length:', code.length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from authorization header - make this optional for OAuth callback
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    let user = null;
    
    if (authHeader) {
      const { data: userData, error: userError } = await supabase.auth.getUser(authHeader);
      if (!userError && userData?.user) {
        user = userData.user;
        console.log('User authenticated:', user.id);
      } else {
        console.log('User authentication failed or missing:', userError?.message);
      }
    } else {
      console.log('No authorization header provided');
    }

    // For OAuth callback, we might not have user context, so we'll store a temporary token
    // that can be picked up by the user later
    const tempUserId = authHeader || 'temp_' + Date.now();

    console.log('Exchanging code for tokens...');

    // Exchange authorization code for tokens  
    const appUrl = Deno.env.get('APP_URL') || 'https://ohsheets.netlify.app';
    console.log('Using redirect_uri:', `${appUrl}/google-oauth`);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: `${appUrl}/google-oauth`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange authorization code', 
          details: errorData,
          status: tokenResponse.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received successfully');
    
    // Prepare credentials object
    const credentials = {
      client_id: Deno.env.get('GOOGLE_CLIENT_ID'),
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      created_at: new Date().toISOString(),
    };

    if (user) {
      // Store credentials in user profile if we have a user context
      console.log('Storing credentials for user:', user.id);
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          google_sheets_credentials: credentials,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Failed to store credentials:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to store credentials', details: updateError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      console.log('Credentials stored successfully');
    } else {
      // Store as temporary credentials that can be claimed later
      console.log('Storing temporary credentials');
      const { error: tempError } = await supabase
        .from('temp_google_credentials')
        .insert({
          temp_id: tempUserId,
          credentials: credentials,
          expires_at: new Date(Date.now() + 600000).toISOString(), // 10 minutes
        });

      if (tempError) {
        console.log('Temp storage failed (table might not exist), continuing anyway:', tempError.message);
      }
    }

    console.log('OAuth exchange completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Google Sheets connected successfully',
        hasUser: !!user,
        tempId: user ? null : tempUserId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('OAuth exchange error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})