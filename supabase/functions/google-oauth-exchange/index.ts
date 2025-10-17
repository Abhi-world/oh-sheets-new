import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
 
Deno.serve(async (req) => {
  // This MUST be the first thing in the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
 
  try {
    // Log request details for debugging
    console.log('[google-oauth-exchange] Request received');
    
    const requestData = await req.json();
    console.log('[google-oauth-exchange] Request data:', JSON.stringify(requestData));
    
    const { code, monday_user_id } = requestData;
 
    if (!code || !monday_user_id) {
      console.error('❌ Missing required parameters:', { code: !!code, monday_user_id: !!monday_user_id });
      throw new Error('Authorization code and Monday User ID are required.');
    }
    
    // Create Supabase client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Check if we already have valid credentials
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', String(monday_user_id))
      .single();
    
    if (existingProfile?.google_sheets_credentials?.access_token) {
      const expiryDate = new Date(existingProfile.google_sheets_credentials.expiry_date);
      if (expiryDate > new Date()) {
        console.log('✅ Valid credentials already exist, skipping token exchange');
        return new Response(JSON.stringify({ success: true, message: 'Already connected' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
 
    // **THE FIX: Hardcode the redirect URI to match your Google Cloud Console setting**
    const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
 
    console.log('[google-oauth-exchange] Exchanging code for tokens with redirect_uri:', redirectUri);
    
    // Verify environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error('❌ Missing environment variables:', { 
        clientId: !!clientId, 
        clientSecret: !!clientSecret 
      });
      throw new Error('Google API credentials not configured properly.');
    }
    
    // Log request parameters (without exposing secrets)
    console.log('[google-oauth-exchange] Token request parameters:', {
      code: code.substring(0, 10) + '...',
      redirect_uri: redirectUri,
      client_id_exists: !!clientId,
      client_secret_exists: !!clientSecret
    });
 
    // Exchange the code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
 
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Google Token Exchange Failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorDetails: errorText
      });
      throw new Error(`Failed to exchange token with Google. Status: ${tokenResponse.status}. Details: ${errorText}`);
    }
 
    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received from Google successfully.');
 
    // Prepare credentials to be stored in the database
    const expiryIso = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();
    const credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: expiryIso,
      scope: tokens.scope,
    };
 
    // Store the credentials in the 'profiles' table
    // **CRITICAL FIX: Use UPSERT instead of UPDATE**
    // This will INSERT if the row doesn't exist, or UPDATE if it does
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
      console.error('❌ Database upsert error:', dbError);
      throw new Error(`Failed to save credentials: ${dbError.message}`);
    }
 
    console.log(`✅ Credentials stored for Monday user: ${monday_user_id}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
 
  } catch (error) {
    console.error('🔥 [google-oauth-exchange] Critical Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Return 400 for client-side errors, 500 for server-side
    });
  }
});
