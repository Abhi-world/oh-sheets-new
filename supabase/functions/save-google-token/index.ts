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
    const requestData = await req.json();
    console.log('[save-google-token] Request data:', JSON.stringify(requestData));
    
    const { monday_user_id, code } = requestData;
    
    if (!monday_user_id || !code) {
      console.error('[save-google-token] Missing required parameters');
      throw new Error('Missing required parameters: monday_user_id and code are required');
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Exchange the authorization code for tokens
    console.log('[save-google-token] Exchanging authorization code for tokens');
    
    // Using the exact format Google expects for token exchange
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: Deno.env.get('GOOGLE_REDIRECT_URI')!,
        grant_type: 'authorization_code'
        // Removed scope parameter as it violates Google's OAuth 2.0 specification
      }).toString()
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('[save-google-token] Google token exchange failed:', tokenData);
      throw new Error(`Failed to exchange code for tokens: ${tokenData.error_description || tokenData.error}`);
    }
    
    const { access_token, refresh_token, expires_in, scope } = tokenData;
    
    if (!access_token || !refresh_token) {
      console.error('[save-google-token] Missing tokens in Google response');
      throw new Error('Google did not return the required tokens');
    }
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();
    
    // Prepare credentials to store
    const credentials = {
      access_token,
      refresh_token,
      expiry_date: expiryDate,
      scope: scope || '',
    };
    
    // Store the credentials in the 'profiles' table using upsert
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        monday_user_id: String(monday_user_id),
        google_sheets_credentials: credentials,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'monday_user_id'
      });
    
    if (dbError) {
      console.error('[save-google-token] Database error:', dbError);
      throw new Error(`Failed to save credentials: ${dbError.message}`);
    }
    
    console.log(`[save-google-token] ✅ Credentials stored for Monday user: ${monday_user_id}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('[save-google-token] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});