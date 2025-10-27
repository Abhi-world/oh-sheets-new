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
    const requestData = await req.json();
    console.log('[save-google-token] Request data:', JSON.stringify(requestData));
    
    const { monday_user_id, access_token, refresh_token, expires_in, scope } = requestData;
    
    if (!monday_user_id || !access_token || !refresh_token) {
      console.error('[save-google-token] Missing required parameters');
      throw new Error('Missing required parameters: monday_user_id, access_token, and refresh_token are required');
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    // Calculate expiry date
    const expiryDate = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();
    
    // Prepare credentials to store
    const credentials = {
      access_token,
      refresh_token,
      expiry_date: expiryDate,
      scope: scope || '',
    };
    
    // Store the credentials in the 'profiles' table using upsert
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        monday_user_id: String(monday_user_id),
        google_sheets_credentials: credentials,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'monday_user_id'
      });
    
    if (dbError) {
      console.error('[save-google-token] Database error:', dbError);
      throw new Error(`Failed to save credentials: ${dbError.message}`);
    }
    
    console.log(`[save-google-token] ✅ Credentials stored for Monday user: ${monday_user_id}`);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('[save-google-token] Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});