// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/supabase

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  monday_user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { monday_user_id } = await req.json() as RequestBody;

    if (!monday_user_id) {
      return new Response(
        JSON.stringify({ error: 'Monday user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔄 Disconnecting Google Sheets for Monday user ID: ${monday_user_id}`);

    // Update the profile to remove Google Sheets credentials
    const { error } = await supabase
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(monday_user_id));

    if (error) {
      console.error('❌ Error disconnecting Google Sheets:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to disconnect Google Sheets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Successfully disconnected Google Sheets');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});