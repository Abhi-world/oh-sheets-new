import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import jwt from 'https://esm.sh/jsonwebtoken@9.0.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
};

Deno.serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    console.log('[disconnect-google-sheets] Function invoked.');

    // Authenticate the request from Monday.com using the JWT
    const authHeader = req.headers.get('Authorization');
    const signingSecret = Deno.env.get('MONDAY_SIGNING_SECRET');
    
    if (!authHeader || !signingSecret) {
      throw new Error('Missing authorization token or server signing secret.');
    }

    const decoded = jwt.verify(authHeader, signingSecret) as { userId: number };
    const mondayUserId = decoded.userId;
    
    if (!mondayUserId) {
      throw new Error('Could not identify user from Monday.com token.');
    }
    
    console.log(`[disconnect-google-sheets] Authenticated Monday User ID: ${mondayUserId}`);

    // Also try to get userId from request body as fallback
    let bodyUserId;
    try {
      const body = await req.json();
      bodyUserId = body.userId || body.monday_user_id;
    } catch {
      // If body parsing fails, continue with JWT userId
    }

    // Use JWT userId as primary, body userId as fallback
    const userIdToUse = mondayUserId || bodyUserId;

    if (!userIdToUse) {
      throw new Error('User ID is required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(userIdToUse));

    if (error) throw error;

    console.log(`[disconnect-google-sheets] Successfully disconnected user ${userIdToUse}`);
    return new Response(
      JSON.stringify({ message: 'Successfully disconnected' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[disconnect-google-sheets] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});