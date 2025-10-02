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
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
    console.log('📄 [list-google-sheets] Starting...');
    
    const { monday_user_id, spreadsheet_id } = await req.json();
    console.log('👤 Monday User ID:', monday_user_id);
    console.log('📊 Spreadsheet ID:', spreadsheet_id);

    if (!monday_user_id || !spreadsheet_id) {
      throw new Error('monday_user_id and spreadsheet_id are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Google Sheets credentials for this Monday user
    console.log('🔍 Fetching credentials from profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', String(monday_user_id))
      .single();

    if (profileError || !profile?.google_sheets_credentials) {
      console.error('❌ No credentials found:', profileError);
      throw new Error('Google Sheets not connected. Please connect your Google account first.');
    }

    const credentials = profile.google_sheets_credentials as GoogleSheetsCredentials;
    console.log('✅ Credentials found');

    // Get or refresh access token
    let accessToken = credentials.access_token;
    
    // Check if token might be expired
    if (credentials.expiry_date) {
      const expiryDate = new Date(credentials.expiry_date);
      const now = new Date();
      if (expiryDate <= now) {
        console.log('🔄 Token expired, refreshing...');
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
        accessToken = await refreshGoogleToken(credentials.refresh_token, clientId, clientSecret);
        
        // Update the credentials with new access token
        const newExpiryDate = new Date(Date.now() + 3600 * 1000); // 1 hour from now
        await supabase
          .from('profiles')
          .update({
            google_sheets_credentials: {
              ...credentials,
              access_token: accessToken,
              expiry_date: newExpiryDate.toISOString(),
            },
          })
          .eq('monday_user_id', String(monday_user_id));
      }
    }

    // Fetch sheets from Google Sheets API
    console.log('📑 Fetching sheets from Google Sheets API...');
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Google API error:', errorData);
      
      // If unauthorized, try refreshing token
      if (response.status === 401) {
        console.log('🔄 Token invalid, refreshing...');
        const clientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
        const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;
        accessToken = await refreshGoogleToken(credentials.refresh_token, clientId, clientSecret);
        
        // Try again with fresh token
        const retryResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
          }
        );
        
        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch sheets after token refresh: ${retryResponse.statusText}`);
        }
        
        const data = await retryResponse.json();
        const sheets = data.sheets.map((sheet: any) => ({
          id: sheet.properties.sheetId.toString(),
          name: sheet.properties.title,
        }));
        
        console.log(`✅ Found ${sheets.length} sheets`);
        
        return new Response(JSON.stringify({ sheets }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Failed to fetch sheets: ${response.statusText}`);
    }

    const data = await response.json();
    const sheets = data.sheets.map((sheet: any) => ({
      id: sheet.properties.sheetId.toString(),
      name: sheet.properties.title,
    }));

    console.log(`✅ Found ${sheets.length} sheets`);

    return new Response(JSON.stringify({ sheets }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
