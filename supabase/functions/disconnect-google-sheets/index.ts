// File: supabase/functions/disconnect-google-sheets/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const body = await req.json();
    const userId = body.userId || body.monday_user_id;
    
    if (!userId) {
      throw new Error('User ID is required.');
    }

    console.log(`🔄 Disconnecting Google Sheets for user ID: ${userId}`);

    // Create an admin client to interact with the database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First try to update the profiles table (original approach)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(userId));

    if (profileError) {
      console.error('❌ Error updating profiles:', profileError);
    }

    // Also try to delete from google_credentials table (new approach)
    const { error: credentialsError } = await supabaseAdmin
      .from('google_credentials')
      .delete()
      .eq('user_id', userId);

    if (credentialsError && credentialsError.code !== 'PGRST116') {
      console.error('❌ Error deleting from google_credentials:', credentialsError);
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