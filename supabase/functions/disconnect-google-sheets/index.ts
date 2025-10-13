// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.com/deploy/docs/supabase

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define the required CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // This block is crucial for handling the browser's preflight OPTIONS request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const body = await req.json();
    const userId = body.monday_user_id || body.userId;

    if (!userId) {
      throw new Error('User ID is required.');
    }

    console.log(`🔄 Disconnecting Google Sheets for user ID: ${userId}`);

    // Update the profile to remove Google Sheets credentials
    const { error } = await supabase
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(userId));

    if (error) {
      console.error('❌ Error disconnecting Google Sheets:', error);
      throw error;
    }

    console.log('✅ Successfully disconnected Google Sheets');
    
    // Return a success response with CORS headers
    return new Response(
      JSON.stringify({ message: 'Successfully disconnected' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('💥 Error:', error.message);
    
    // Return an error response with CORS headers
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});