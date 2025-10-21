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
    console.log('[google-oauth-init] Request data:', JSON.stringify(requestData));
    
    const { monday_user_id, force_consent = false } = requestData;

    if (!monday_user_id) {
      console.error('❌ Missing required parameter: monday_user_id');
      throw new Error('Monday User ID is required.');
    }
    
    // Get Google client ID from environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      console.error('❌ Missing environment variable: GOOGLE_CLIENT_ID');
      throw new Error('Google API client ID not configured properly.');
    }
    
    // Hardcode the redirect URI to match Google Cloud Console setting
    const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
    
    // Define the required scopes for Google Sheets and Drive access
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.readonly',        // REQUIRED: Read access to files
      'https://www.googleapis.com/auth/spreadsheets'           // REQUIRED: Allow writing for sheets
    ];
    
    // Build the OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('include_granted_scopes', 'true');
    authUrl.searchParams.append('approval_prompt', 'force'); // For older OAuth clients
    
    // Force consent if requested (important for re-consent with new scopes)
    if (force_consent) {
      authUrl.searchParams.append('prompt', 'consent');
    } else {
      // Even on normal connect, request consent if incremental auth might miss new scopes
      authUrl.searchParams.append('prompt', 'select_account consent');
    }
    
    // Add state parameter with Monday user ID
    authUrl.searchParams.append('state', monday_user_id);
    
    console.log(`✅ Generated OAuth URL with scopes: ${scopes.join(' ')}`);
    console.log(`✅ Force consent: ${force_consent}`);
    
    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('🔥 [google-oauth-init] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});