import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting add-google-sheet-row function');

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Parse the JWT token to get user info
    const token = authHeader.replace('Bearer ', '');
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const mondayUserId = payload.dat?.user_id || payload.user_id;

    if (!mondayUserId) {
      throw new Error('No Monday user ID in token');
    }

    console.log('✅ Monday User ID:', mondayUserId);

    // Parse request body
    const body = await req.json();
    console.log('📦 Request body:', JSON.stringify(body, null, 2));

    const { spreadsheetId, sheetId, values } = body.payload.inputFields;

    if (!spreadsheetId || !sheetId || !values) {
      throw new Error('Missing required fields: spreadsheetId, sheetId, or values');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Google credentials from database
    console.log('🔍 Fetching Google credentials...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', mondayUserId)
      .single();

    if (profileError || !profile?.google_sheets_credentials) {
      console.error('❌ No credentials found:', profileError);
      throw new Error('Google credentials not found. Please connect to Google Sheets first.');
    }

    const credentials = profile.google_sheets_credentials as any;
    let accessToken = credentials.access_token;

    // Check if token is expired
    const expiryDate = new Date(credentials.expiry_date);
    const now = new Date();
    
    if (expiryDate < now) {
      console.log('🔄 Token expired, refreshing...');

      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: credentials.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access_token;

      // Update token in database
      const newExpiryDate = new Date(Date.now() + refreshData.expires_in * 1000);
      credentials.access_token = accessToken;
      credentials.expiry_date = newExpiryDate.toISOString();
      
      await supabase
        .from('profiles')
        .update({
          google_sheets_credentials: credentials,
        })
        .eq('monday_user_id', mondayUserId);

      console.log('✅ Token refreshed');
    }

    // Get the sheet name from sheetId
    console.log('📊 Getting sheet metadata...');
    const metadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      throw new Error('Failed to fetch sheet metadata');
    }

    const metadata = await metadataResponse.json();
    const sheet = metadata.sheets.find((s: any) => s.properties.sheetId === parseInt(sheetId));
    
    if (!sheet) {
      throw new Error('Sheet not found');
    }

    const sheetName = sheet.properties.title;
    console.log('✅ Found sheet:', sheetName);

    // Prepare the row data (convert values object to array)
    const rowData = Object.values(values);
    console.log('📝 Row data to append:', rowData);

    // Append the row to Google Sheets
    console.log('➕ Appending row to sheet...');
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData],
        }),
      }
    );

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      console.error('❌ Append failed:', errorText);
      throw new Error(`Failed to append row: ${errorText}`);
    }

    const appendResult = await appendResponse.json();
    console.log('✅ Row appended successfully:', appendResult);

    return new Response(JSON.stringify({
      success: true,
      message: 'Row added successfully',
      result: appendResult,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
