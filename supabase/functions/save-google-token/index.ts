// supabase/functions/save-google-token/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Parse request data
    const requestData = await req.json();
    console.log('[save-google-token] Request data:', JSON.stringify(requestData));
    
    const { code, monday_user_id } = requestData;

    if (!code || !monday_user_id) {
      console.error('❌ Missing required parameters: code or monday_user_id');
      throw new Error('Authorization code and Monday User ID are required.');
    }
    
    // Get Google OAuth credentials from environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    // Log environment variable status for debugging
    console.log('[save-google-token] Environment check:', {
      GOOGLE_CLIENT_ID_exists: !!clientId,
      GOOGLE_CLIENT_SECRET_exists: !!clientSecret,
      SUPABASE_URL_exists: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY_exists: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing environment variables: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
      throw new Error('Google API credentials not configured properly. Please check Supabase secrets deployment.');
    }
    
    // Use the correct redirect URI - MUST match exactly what's in google-oauth-init and Google Cloud Console
    const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
    
    // Exchange the authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorData);
      throw new Error(`Failed to exchange authorization code: ${tokenResponse.status} ${errorData}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('[save-google-token] Token exchange successful');
    
    // Calculate token expiration time
    const expiresIn = tokenData.expires_in || 3600; // Default to 1 hour if not specified
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Store the tokens in the database
    const { data, error } = await supabase
      .from('google_tokens')
      .upsert({
        monday_user_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'monday_user_id'
      });
    
    if (error) {
      console.error('❌ Error storing tokens:', error);
      throw new Error(`Failed to store Google tokens: ${error.message}`);
    }
    
    console.log('[save-google-token] Tokens stored successfully for user:', monday_user_id);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Google authorization successful',
        expires_at: expiresAt
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
    
  } catch (error) {
    console.error('[save-google-token] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});