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
    const { code, monday_user_id } = await req.json();
 
    if (!code || !monday_user_id) {
      throw new Error('Authorization code and Monday User ID are required.');
    }
 
    // **THE FIX: Hardcode the redirect URI to match your Google Cloud Console setting**
    const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
 
    console.log('[google-oauth-exchange] Exchanging code for tokens with redirect_uri:', redirectUri);
 
    // Exchange the code for tokens with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
 
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Google Token Exchange Failed:', errorText);
      throw new Error(`Failed to exchange token with Google. Details: ${errorText}`);
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
 
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: credentials })
      .eq('monday_user_id', String(monday_user_id));
 
    if (dbError) {
      console.error('❌ Database update error:', dbError);
      throw new Error('Failed to save credentials to the database.');
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
