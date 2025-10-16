import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleSheetsCredentials {
  access_token: string;
  refresh_token: string;
  expiry_date?: string;
}

async function refreshGoogleToken(refreshToken: string, clientId: string, clientSecret: string): Promise<string> {
  console.log('🔄 Refreshing Google access token...');
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    console.error('❌ Error refreshing token:', errorData);
    throw new Error(`Failed to refresh token: ${errorData.error_description || tokenResponse.statusText}`);
  }
  const tokenData = await tokenResponse.json();
  console.log('✅ Token refreshed successfully');
  return tokenData.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📋 [gs-list-spreadsheets] Starting...');

    // Parse helpers
    const url = new URL(req.url);
    const params = url.searchParams;

    let monday_user_id: string | undefined;

    // Safely parse body (may be empty)
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    // Extract from headers/params/body (no JWT verification required)
    const headerUser = req.headers.get('x-monday-user-id') || req.headers.get('X-Monday-User-Id') || undefined;
    monday_user_id = headerUser || body.monday_user_id || params.get('monday_user_id') || params.get('user_id') || undefined;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // If monday_user_id not provided (common in Field Types), fallback to the most recently connected profile
    if (!monday_user_id) {
      console.warn('⚠️ monday_user_id missing. Falling back to the most recently connected profile...');
      const { data: fallbackProfiles, error: fallbackErr } = await supabase
        .from('profiles')
        .select('monday_user_id')
        .not('google_sheets_credentials', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (fallbackErr || !fallbackProfiles || fallbackProfiles.length === 0) {
        throw new Error('Could not determine user. Ensure Google Sheets is connected.');
      }
      monday_user_id = String(fallbackProfiles[0].monday_user_id);
      console.log('✅ Using fallback monday_user_id:', monday_user_id);
    }

    // Fetch Google Sheets credentials for this Monday user
    console.log('🔍 Fetching credentials from profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', String(monday_user_id))
      .maybeSingle();

    if (profileError || !profile?.google_sheets_credentials) {
      console.error('❌ No credentials found:', profileError);
      throw new Error('Google Sheets not connected. Please connect your Google account first.');
    }

    const credentials = profile.google_sheets_credentials as GoogleSheetsCredentials;
    console.log('✅ Credentials found');

    // Get or refresh access token
    let accessToken = credentials.access_token;
    if (credentials.expiry_date) {
      const expiryDate = new Date(credentials.expiry_date);
      if (expiryDate <= new Date()) {
        console.log('🔄 Token expired, refreshing...');
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
        accessToken = await refreshGoogleToken(credentials.refresh_token, clientId, clientSecret);
        const newExpiryDate = new Date(Date.now() + 3600 * 1000);
        await supabase
          .from('profiles')
          .update({
            google_sheets_credentials: { ...credentials, access_token: accessToken, expiry_date: newExpiryDate.toISOString() },
          })
          .eq('monday_user_id', String(monday_user_id));
      }
    }

    // Fetch spreadsheets from Google Drive API
    console.log('📊 Fetching spreadsheets from Google Drive...');
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,owners(emailAddress))&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=100",
      {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Google API error:', errorData);
      if (response.status === 401) {
        console.log('🔄 Token invalid, refreshing...');
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
        accessToken = await refreshGoogleToken(credentials.refresh_token, clientId, clientSecret);
        const retryResponse = await fetch(
          "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet' and trashed=false&fields=files(id,name,owners(emailAddress))&orderBy=modifiedTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true&pageSize=100",
          { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
        );
        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch spreadsheets after token refresh: ${retryResponse.statusText}`);
        }
        const retryData = await retryResponse.json();
        const spreadsheets = (retryData.files || []).map((file: any) => ({
          id: file.id,
          name: file.name,
          title: file.name,
          value: file.id,
        }));
        console.log(`✅ Found ${spreadsheets.length} spreadsheets`);
        return new Response(JSON.stringify({ spreadsheets, options: spreadsheets }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      throw new Error(`Failed to fetch spreadsheets: ${response.statusText}`);
    }

    const data = await response.json();
    const spreadsheets = (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      title: file.name,
      value: file.id,
    }));

    console.log(`✅ Found ${spreadsheets.length} spreadsheets`);
    return new Response(JSON.stringify({ spreadsheets, options: spreadsheets }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('💥 Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});