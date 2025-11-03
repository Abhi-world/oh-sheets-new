import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://funny-otter-9faa67.netlify.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

Deno.serve(async (req) => {
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
    
    console.log('[save-google-token] Exchanging authorization code for tokens');
    
    const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('[save-google-token] Google token exchange failed:', tokenData);
      throw new Error(`Failed to exchange code for tokens: ${tokenData.error_description || tokenData.error}`);
    }
    
    const { access_token, refresh_token, expires_in, scope } = tokenData;
    
    // 🔥 CRITICAL FIX: Check if refresh_token exists
    if (!access_token) {
      console.error('[save-google-token] Missing access_token in Google response');
      throw new Error('Google did not return an access token');
    }

    if (!refresh_token) {
      console.warn('[save-google-token] ⚠️ No refresh_token received. This may require user re-authorization with approval_prompt=force');
      // Continue anyway - existing refresh_token in DB will be preserved
    }
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();
    
    // Get existing credentials to preserve refresh_token if new one not provided
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', String(monday_user_id))
      .single();

    const existingCredentials = existingProfile?.google_sheets_credentials || {};
    
    // Prepare credentials to store
    // If no new refresh_token, keep the existing one
    const credentials = {
      access_token,
      refresh_token: refresh_token || existingCredentials.refresh_token,
      expiry_date: expiryDate,
      scope: scope || existingCredentials.scope || '',
    };

    // Verify we have a refresh_token to save
    if (!credentials.refresh_token) {
      throw new Error('No refresh_token available. User must re-authorize with full permissions.');
    }
    
    // 🔥 FIX: Delete existing credentials before saving new ones
    console.log(`[save-google-token] Deleting old credentials for user: ${monday_user_id}`);
    
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
    console.log(`[save-google-token] Has refresh_token: ${!!credentials.refresh_token}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      has_refresh_token: !!credentials.refresh_token 
    }), {
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