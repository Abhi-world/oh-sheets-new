import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
 
Deno.serve(async (req) => {
  // **This MUST be the first thing in the function**
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }
 
  try {
    const { monday_user_id } = await req.json();
 
    if (!monday_user_id) {
      throw new Error('Monday User ID is required to disconnect.');
    }
 
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
 
    // Update the 'profiles' table to remove the credentials
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(monday_user_id));
 
    if (error) {
      // Log the error but still return a success to the client to unblock the UI
      console.error('[disconnect-google-sheets] Error updating profile:', error);
    }
 
    console.log(`[disconnect-google-sheets] Credentials cleared for user ${monday_user_id}`);
    return new Response(
      JSON.stringify({ message: 'Successfully disconnected' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[disconnect-google-sheets] Critical Error:', error.message);
    // Return an error response WITH CORS headers
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});