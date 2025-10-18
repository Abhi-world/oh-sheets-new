import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const requestData = await req.json();
    console.log('[gs-list-spreadsheets] Request data:', JSON.stringify(requestData));
    
    const { monday_user_id } = requestData;
    if (!monday_user_id) {
      throw new Error('Missing required parameter: monday_user_id');
    }

    // Initialize Supabase admin client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fetch tokens from DB
    const { data: tokenData, error: dbError } = await supabase
      .from('google_tokens')  // Assuming your table name
      .select('access_token, refresh_token, expires_at, scope')
      .eq('monday_user_id', monday_user_id)
      .single();

    if (dbError || !tokenData) {
      console.error('[gs-list-spreadsheets] DB error or no tokens:', dbError?.message);
      throw new Error('No valid Google tokens found for this user');
    }

    let { access_token, refresh_token, expires_at, scope } = tokenData;
    const now = Date.now() / 1000; // Convert to Unix timestamp
    console.log(`[gs-list-spreadsheets] Token expires at: ${expires_at}, now: ${now}`);

    // Refresh token if expired (expires_at is Unix timestamp)
    if (expires_at < now + 300) {  // Refresh 5min early
      if (!refresh_token) {
        console.error('[gs-list-spreadsheets] No refresh_token available');
        throw new Error('Token expired and no refresh available. Re-consent required.');
      }

      console.log('[gs-list-spreadsheets] Refreshing token...');
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token,
          grant_type: 'refresh_token'
        })
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('[gs-list-spreadsheets] Refresh failed:', tokenResponse.status, errorBody);
        throw new Error(`Token refresh failed: ${tokenResponse.status} - ${errorBody}`);
      }

      const refreshed = await tokenResponse.json();
      access_token = refreshed.access_token;
      expires_at = now + refreshed.expires_in;

      // Update DB with new access_token and expiry
      const { error: updateError } = await supabase
        .from('google_tokens')
        .update({ access_token, expires_at })
        .eq('monday_user_id', monday_user_id);

      if (updateError) {
        console.error('[gs-list-spreadsheets] Failed to update refreshed token:', updateError.message);
      }

      console.log('[gs-list-spreadsheets] Token refreshed successfully');
    }

    // Build Drive API request (robust query for spreadsheets in My Drive + Shared + All Drives)
    const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
    driveUrl.searchParams.append('q', "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    driveUrl.searchParams.append('includeItemsFromAllDrives', 'true');
    driveUrl.searchParams.append('supportsAllDrives', 'true');
    driveUrl.searchParams.append('pageSize', '1000');  // Max for most users
    driveUrl.searchParams.append('fields', 'files(id,name,webViewLink),nextPageToken');

    let allSpreadsheets: any[] = [];
    let nextPageToken: string | undefined;

    do {
      if (nextPageToken) {
        driveUrl.searchParams.set('pageToken', nextPageToken);
      }

      console.log(`[gs-list-spreadsheets] Calling Drive API: ${driveUrl.toString()}`);
      const driveResponse = await fetch(driveUrl, {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      console.log(`[gs-list-spreadsheets] Drive response status: ${driveResponse.status}`);
      if (!driveResponse.ok) {
        const errorBody = await driveResponse.text();
        console.error('[gs-list-spreadsheets] Drive API error:', driveResponse.status, errorBody);
        throw new Error(`Google Drive API error: ${driveResponse.status} - ${errorBody}`);
      }

      const data = await driveResponse.json();
      console.log(`[gs-list-spreadsheets] Found ${data.files?.length || 0} spreadsheets`);
      
      if (data.files && data.files.length > 0) {
        allSpreadsheets = [...allSpreadsheets, ...data.files];
      }
      
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    return new Response(
      JSON.stringify({ 
        spreadsheets: allSpreadsheets.map(file => ({
          id: file.id,
          name: file.name,
          url: file.webViewLink
        }))
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('[gs-list-spreadsheets] Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        spreadsheets: [] 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});