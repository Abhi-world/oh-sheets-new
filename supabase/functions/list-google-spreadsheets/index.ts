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

    // 1. Authenticate the request from Monday.com using the JWT
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

    // 2. Get the user's Google Credentials from the database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', mondayUserId)
      .single();

    if (dbError || !profile?.google_sheets_credentials) {
      throw new Error(`Google account not connected for user ${mondayUserId}.`);
    }

    let credentials = profile.google_sheets_credentials as any;
    let accessToken = credentials.access_token;

    // 3. (Optional but Recommended) Refresh the Google Token if it's expired
    // This logic can be added here if needed to prevent future failures.

    // 4. Fetch the list of spreadsheets from the Google Drive API
    console.log('[list-spreadsheets] Fetching spreadsheets from Google Drive API...');
    const driveResponse = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)&pageSize=200", {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text();
      console.error("[list-spreadsheets] Google API Error:", errorText);
      throw new Error('Failed to fetch spreadsheets from Google Drive.');
    }

    const driveData = await driveResponse.json();
    console.log(`[list-spreadsheets] Found ${driveData.files.length} spreadsheets.`);

    // 5. Format the response exactly as Monday.com expects
    const options = driveData.files.map((file: { id: string; name: string }) => ({
      title: file.name, // The text the user sees
      value: file.id,   // The value that gets saved
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
