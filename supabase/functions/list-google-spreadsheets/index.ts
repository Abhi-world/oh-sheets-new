import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function refreshGoogleToken(refreshToken, clientId, clientSecret) {
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
    throw new Error('Failed to refresh token: ' + (errorData.error_description || tokenResponse.statusText));
  }
  return (await tokenResponse.json()).access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    let body = {};
    try { body = await req.json(); } catch { body = {}; }
    const params = new URL(req.url).searchParams;
    let monday_user_id = req.headers.get('x-monday-user-id')
      || req.headers.get('X-Monday-User-Id')
      || body.monday_user_id
      || body.user_id
      || params.get('monday_user_id')
      || params.get('user_id')
      || undefined;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!monday_user_id) {
      const { data: fallbackProfiles } = await supabase
        .from('profiles').select('monday_user_id')
        .not('google_sheets_credentials', 'is', null)
        .order('updated_at', { ascending: false }).limit(1);
      if (!fallbackProfiles || fallbackProfiles.length === 0)
        return new Response(JSON.stringify({ error: 'Google Sheets not connected.' }), { status: 400, headers: corsHeaders });
      monday_user_id = String(fallbackProfiles[0].monday_user_id);
    }

    const { data: profile } = await supabase
      .from('profiles').select('google_sheets_credentials')
      .eq('monday_user_id', String(monday_user_id)).maybeSingle();

    if (!profile || !profile.google_sheets_credentials || typeof profile.google_sheets_credentials !== 'object')
      return new Response(JSON.stringify({ error: 'Google Sheets not connected.' }), { status: 400, headers: corsHeaders });

    const credentials = profile.google_sheets_credentials;
    let accessToken = credentials.access_token;

    if (credentials.expiry_date && new Date(credentials.expiry_date) <= new Date()) {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      accessToken = await refreshGoogleToken(credentials.refresh_token, clientId, clientSecret);
      await supabase
        .from('profiles')
        .update({
          google_sheets_credentials: { ...(credentials || {}), access_token: accessToken, expiry_date: new Date(Date.now() + 3600 * 1000).toISOString() }
        })
        .eq('monday_user_id', String(monday_user_id));
    }

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=100",
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' } }
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: errorData.error || 'Failed to fetch spreadsheets.' }), { status: response.status, headers: corsHeaders });
    }
    const data = await response.json();
    const spreadsheets = (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      title: file.name,
      value: file.id,
    }));

    return new Response(JSON.stringify({ spreadsheets, options: spreadsheets }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
});
