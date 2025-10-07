import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
// JWT verification removed (not needed for this public endpoint)

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
    
    // Parse helpers
    const url = new URL(req.url);
    const params = url.searchParams;

    let monday_user_id: string | undefined;
    let spreadsheet_id: string | undefined;

    // Safely parse body (may be empty when called from Monday field types)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    // Prefer JWT if provided
    // Skipping JWT verification (not required). We'll resolve monday_user_id from headers/body/params or fallback.

    // Extract from headers/params/body
    const headerUser = req.headers.get('x-monday-user-id') || req.headers.get('X-Monday-User-Id') || undefined;
    monday_user_id = monday_user_id 
      || headerUser 
      || body.monday_user_id 
      || body.user_id 
      || body.payload?.userId 
      || body.payload?.invocation?.userId 
      || params.get('monday_user_id') 
      || params.get('user_id') 
      || undefined;

    // Resolve spreadsheet_id from many possible Monday payload shapes
    const possibleSpreadsheetIds = [
      body.spreadsheet_id,
      body.dependency_fields?.spreadsheet_id,
      body.dependencyFields?.spreadsheet_id,
      body.dependencies?.spreadsheet_id,
      body.payload?.inputFields?.spreadsheet_id,
      body.payload?.dependency_fields?.spreadsheet_id,
      body.payload?.dependencies?.spreadsheet_id,
      req.headers.get('x-spreadsheet-id'),
      req.headers.get('X-Spreadsheet-Id'),
      params.get('spreadsheet_id'),
      params.get('spreadsheetId'),
    ].filter(Boolean);
    spreadsheet_id = possibleSpreadsheetIds[0] as string | undefined;

    console.log('📊 Spreadsheet ID resolved:', spreadsheet_id, ' method:', req.method, ' searchParams:', [...params.keys()]);

    // Initialize Supabase client (used for fallback lookup too)
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

    if (!spreadsheet_id) {
      throw new Error('spreadsheet_id is required');
    }

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
        
        // Format for Monday.com recipes (options array) or regular response
        const sheets = data.sheets.map((sheet: any) => ({
          id: String(sheet.properties.sheetId),
          name: sheet.properties.title,
          title: sheet.properties.title,  // Monday.com expects 'title'
          value: String(sheet.properties.sheetId),  // Monday.com expects 'value'
        }));
        
        console.log(`✅ Found ${sheets.length} sheets`);
        
        // Return format compatible with both Monday recipes and direct calls
        return new Response(JSON.stringify({ 
          sheets,
          options: sheets  // Monday.com recipes expect 'options' array
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Failed to fetch sheets: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Format for Monday.com recipes (options array) or regular response
    const sheets = data.sheets.map((sheet: any) => ({
      id: String(sheet.properties.sheetId),
      name: sheet.properties.title,
      title: sheet.properties.title,  // Monday.com expects 'title'
      value: String(sheet.properties.sheetId),  // Monday.com expects 'value'
    }));

    console.log(`✅ Found ${sheets.length} sheets`);

    // Return format compatible with both Monday recipes and direct calls
    return new Response(JSON.stringify({ 
      sheets,
      options: sheets  // Monday.com recipes expect 'options' array
    }), {
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
