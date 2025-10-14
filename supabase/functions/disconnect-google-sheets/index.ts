import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}
 
Deno.serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
 
  try {
    const { userId, monday_user_id } = await req.json()
    const userIdToUse = userId || monday_user_id
 
    if (!userIdToUse) {
      throw new Error('User ID is required')
    }
 
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
 
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ google_sheets_credentials: null })
      .eq('monday_user_id', String(userIdToUse))
 
    if (error) throw error
 
    return new Response(
      JSON.stringify({ message: 'Successfully disconnected' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})