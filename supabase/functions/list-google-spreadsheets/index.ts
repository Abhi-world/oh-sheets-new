// In supabase/functions/list-google-spreadsheets/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import jwt from 'https://esm.sh/jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Main function to handle requests from Monday.com recipes
Deno.serve(async (req) => {
  // Immediately handle the browser's preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[list-spreadsheets] Function invoked.');

    // 1) Authenticate the request from Monday.com using the JWT
    const authHeader = req.headers.get('Authorization');
    const signingSecret = Deno.env.get('MONDAY_SIGNING_SECRET');
    if (!authHeader || !signingSecret) {
      throw new Error('Missing authorization token or server signing secret.');
    }

    const decoded = jwt.verify(authHeader, signingSecret) as { userId: number };
    const mondayUserId = decoded.userId;
    if (!mondayUserId) {
      throw new Error('Could not identify user from Monday.com token.');
    }
    console.log(`[list-spreadsheets] Authenticated Monday User ID: ${mondayUserId}`);

    // 2) Get the user's Google credentials from the same table used elsewhere (google_tokens)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: tokenRow, error: tokenErr } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('monday_user_id', String(mondayUserId))
      .maybeSingle();

    if (tokenErr || !tokenRow) {
      console.error('[list-spreadsheets] No tokens found in google_tokens table:', tokenErr?.message);
      throw new Error(`Google account not connected for user ${mondayUserId}.`);
    }

    let accessToken: string = tokenRow.access_token;
    const refreshToken: string | null = tokenRow.refresh_token;
    const expiresAt: number | null = tokenRow.expires_at; // unix seconds

    // 3) Refresh the token if it's close to expiring
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && expiresAt < now + 300) {
      if (!refreshToken) {
        throw new Error('Google token expired and no refresh token available. Please reconnect Google.');
      }

      console.log('[list-spreadsheets] Refreshing Google token...');
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!tokenResponse.ok) {
        const errorBody = await tokenResponse.text();
        console.error('[list-spreadsheets] Token refresh failed:', tokenResponse.status, errorBody);
        throw new Error('Failed to refresh Google access token.');
      }

      const refreshed = await tokenResponse.json();
      accessToken = refreshed.access_token;

      // Persist new access token and new expiry
      const newExpiresAt = now + (refreshed.expires_in ?? 3600);
      const { error: updateErr } = await supabase
        .from('google_tokens')
        .update({ access_token: accessToken, expires_at: newExpiresAt })
        .eq('monday_user_id', String(mondayUserId));
      if (updateErr) {
        console.error('[list-spreadsheets] Failed to update refreshed token:', updateErr.message);
      }
      console.log('[list-spreadsheets] Token refreshed successfully');
    }

    // 4) Fetch spreadsheets from Google Drive API (supports shared drives and paging)
    const baseUrl = new URL('https://www.googleapis.com/drive/v3/files');
    baseUrl.searchParams.append('q', "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
    baseUrl.searchParams.append('includeItemsFromAllDrives', 'true');
    baseUrl.searchParams.append('supportsAllDrives', 'true');
    baseUrl.searchParams.append('pageSize', '1000');
    baseUrl.searchParams.append('fields', 'files(id,name,webViewLink),nextPageToken');

    let allFiles: Array<{ id: string; name: string; webViewLink?: string }> = [];
    let nextPageToken: string | undefined;
    do {
      if (nextPageToken) baseUrl.searchParams.set('pageToken', nextPageToken);
      const driveResp = await fetch(baseUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!driveResp.ok) {
        const txt = await driveResp.text();
        console.error('[list-spreadsheets] Google Drive API error:', driveResp.status, txt);
        throw new Error('Failed to fetch spreadsheets from Google Drive.');
      }
      const json = await driveResp.json();
      const files = Array.isArray(json.files) ? json.files : [];
      allFiles.push(...files);
      nextPageToken = json.nextPageToken;
    } while (nextPageToken);

    console.log(`[list-spreadsheets] Found ${allFiles.length} spreadsheets.`);

    // 5) Format for Monday.com dynamic options
    const options = allFiles.map((file: { id: string; name: string }) => ({
      title: file.name,
      value: file.id,
    }));

    return new Response(JSON.stringify({ options }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[list-spreadsheets] Critical Error:', error.message);
    // Return an empty list on failure so the UI doesn't break
    return new Response(JSON.stringify({ options: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 so Monday doesn't show a generic error
    });
  }
});
