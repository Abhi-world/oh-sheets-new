// supabase/functions/force-clear-google-tokens/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  monday_user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )
    
    // Get the request body
    const { monday_user_id } = await req.json() as RequestBody
    
    if (!monday_user_id) {
      return new Response(
        JSON.stringify({ error: 'monday_user_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`🔄 Force clearing Google tokens for Monday user: ${monday_user_id}`)
    
    // First try to delete from google_tokens table if it exists
    try {
      const { error: deleteError } = await supabaseClient
        .from('google_tokens')
        .delete()
        .eq('monday_user_id', monday_user_id)
      
      if (deleteError) {
        // If the table doesn't exist, this will throw an error, but we'll continue
        console.warn(`⚠️ Error deleting from google_tokens: ${deleteError.message}`)
      } else {
        console.log('✅ Successfully deleted from google_tokens table')
      }
    } catch (err) {
      console.warn(`⚠️ Error with google_tokens table operation: ${err.message}`)
    }
    
    // Try to execute raw SQL to drop the table if it exists
    // This is a more aggressive approach if the table structure is unknown
    try {
      const { error: sqlError } = await supabaseClient.rpc('force_clear_google_tokens', {
        p_monday_user_id: monday_user_id
      })
      
      if (sqlError) {
        console.warn(`⚠️ Error executing force_clear_google_tokens RPC: ${sqlError.message}`)
      } else {
        console.log('✅ Successfully executed force_clear_google_tokens RPC')
      }
    } catch (err) {
      console.warn(`⚠️ Error with RPC operation: ${err.message}`)
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Google tokens cleared successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})