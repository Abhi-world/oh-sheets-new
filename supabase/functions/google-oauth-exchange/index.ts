import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 [google-oauth-exchange] Starting OAuth exchange');
    const { code, monday_user_id } = await req.json();
    const mondayUserId = String(monday_user_id || '').trim();

    if (!code) {
      console.error('❌ Missing authorization code');
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mondayUserId) {
      console.error('❌ Missing monday_user_id');
      return new Response(
        JSON.stringify({ error: 'monday_user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('ℹ️ Code length:', String(code).length, 'Monday User:', mondayUserId);

    // Initialize Supabase client with SERVICE ROLE (bypasses RLS for this server env)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const appUrl = Deno.env.get('APP_URL');
    if (!appUrl) {
      console.error('❌ APP_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: APP_URL not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const redirectUri = appUrl.endsWith('/') ? `${appUrl}google-oauth` : `${appUrl}/google-oauth`;
    console.log('🔁 Using redirect_uri:', redirectUri);

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to exchange authorization code',
          details: errorText,
          status: tokenResponse.status,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens received from Google');

    // Prepare credentials payload
    const expiryIso = new Date(Date.now() + (tokens.expires_in ?? 0) * 1000).toISOString();
    const credentials = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      expiry_date: expiryIso,
      created_at: new Date().toISOString(),
    };

    // Upsert by monday_user_id (no Supabase Auth required in Monday embedded apps)
    console.log('🗄️ Upserting credentials for monday_user_id:', mondayUserId);

    // Check if profile exists for this monday_user_id
    const { data: existingProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('id, monday_user_id')
      .eq('monday_user_id', mondayUserId)
      .maybeSingle();

    if (fetchErr) {
      console.error('❌ Failed fetching profile:', fetchErr);
      return new Response(
        JSON.stringify({ error: 'Database read failed', details: fetchErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let dbError = null as any;
    if (existingProfile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          google_sheets_credentials: credentials,
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expiry: expiryIso,
          updated_at: new Date().toISOString(),
        })
        .eq('monday_user_id', mondayUserId);
      dbError = error;
    } else {
      const { error } = await supabase.from('profiles').insert({
        monday_user_id: mondayUserId,
        google_sheets_credentials: credentials,
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: expiryIso,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      dbError = error;
    }

    if (dbError) {
      console.error('❌ Failed to store credentials:', dbError);
      const details = (dbError as any)?.message ?? String(dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store credentials', details }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Credentials stored successfully for monday_user_id:', mondayUserId);

    return new Response(
      JSON.stringify({ success: true, message: 'Google Sheets connected successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const err = error as any;
    const details = err?.message ?? String(error);
    console.error('🔥 OAuth exchange error:', details);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
