// File: supabase/functions/disconnect-google-sheets/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import jwt from 'https://esm.sh/jsonwebtoken@9.0.2';

// Define CORS headers that allow requests from any origin
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  // This is the crucial fix: Immediately handle the browser's preflight "permission" request.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the request to make sure a valid user is making it
    const authHeader = req.headers.get('Authorization');
    const signingSecret = Deno.env.get('MONDAY_SIGNING_SECRET');

    if (!authHeader || !signingSecret) {
      throw new Error('Missing authorization or server configuration.');
    }

    // Verify the JWT to get the user's Monday ID
    const decoded: any = jwt.verify(authHeader, signingSecret);
    const mondayUserId = decoded.userId;
    
    if (!mondayUserId) {
      throw new Error('User ID is required.');
    }

    console.log(`🔄 Disconnecting Google Sheets for user ID: ${mondayUserId}`);

    // Create an admin client to interact with the database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // First try to update the profiles table (original approach)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(mondayUserId));

    if (profileError) {
      console.error('❌ Error updating profiles:', profileError);
    }

    // Also try to delete from google_credentials table (new approach)
    const { error: credentialsError } = await supabaseAdmin
      .from('google_credentials')
      .delete()
      .eq('monday_user_id', String(mondayUserId));

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