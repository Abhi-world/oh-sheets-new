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
    
    // Log environment variable status for debugging
    console.log('[google-oauth-init] Environment check:', {
      GOOGLE_CLIENT_ID_exists: !!clientId,
      SUPABASE_URL_exists: !!Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY_exists: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    });
    
    if (!clientId) {
      console.error('❌ Missing environment variable: GOOGLE_CLIENT_ID');
      throw new Error('Google API client ID not configured properly. Please check Supabase secrets deployment.');
    }
    
    // Use the correct redirect URI based on the deployment environment
    // This should match exactly what's configured in Google Cloud Console
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
    
    // Modern OAuth 2.0 best practices - use prompt instead of approval_prompt
    // Remove approval_prompt as it's deprecated
    
    // Force consent if requested (important for re-consent with new scopes)
    if (force_consent) {
      authUrl.searchParams.append('prompt', 'consent');
    } else {
      // Even on normal connect, request consent if incremental auth might miss new scopes
      authUrl.searchParams.append('prompt', 'select_account consent');
    }
    
    // Add state parameter with Monday user ID
    authUrl.searchParams.append('state', monday_user_id);
    
    // Log the full URL for debugging (but mask the client ID)
    const debugUrl = authUrl.toString().replace(clientId, 'REDACTED_CLIENT_ID');
    console.log(`✅ Generated OAuth URL: ${debugUrl}`);
    console.log(`✅ Force consent: ${force_consent}`);
    console.log(`✅ Scopes requested: ${scopes.join(' ')}`);
    
    return new Response(JSON.stringify({ url: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // Safe error handling to avoid circular references
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('🔥 [google-oauth-init] Error:', errorMessage);
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to initialize OAuth. Please check environment variables and Google Cloud Console configuration.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Use 500 for server errors instead of 400
    });
  }
});