import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define flexible CORS headers
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Get the origin of the request
  const origin = req.headers.get('Origin') || '*'
  
  // A list of allowed origins
  const allowedOrigins = [
    'https://funny-otter-9faa67.netlify.app',
    'http://localhost:5173', // Local dev environment
    'https://monday.com',
    'https://*.monday.com'
  ]
  
  // Set the correct Allow-Origin header
  if (allowedOrigins.includes(origin) || origin.endsWith('.monday.com')) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  } else {
    // For other origins, allow all during development
    corsHeaders['Access-Control-Allow-Origin'] = '*'
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting connection check...');
    const { monday_user_id } = await req.json();
    const mondayUserId = String(monday_user_id || '').trim();
    
    if (!mondayUserId) {
      console.error('❌ No Monday user ID provided');
      return new Response(
        JSON.stringify({ error: 'Monday user ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Checking connection for Monday user:', mondayUserId);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user has Google Sheets credentials in their profile
    console.log('🔍 Querying profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('monday_user_id', mondayUserId)
      .maybeSingle();

    console.log('📊 Profile query result:', { profile, profileError });

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ 
          error: 'Database query failed', 
          details: profileError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!profile) {
      console.log('❌ No profile found for Monday user');
      return new Response(
        JSON.stringify({ 
          connected: false, 
          message: 'No user profile found. Please connect your Google account.' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const hasCredentials = profile?.google_sheets_credentials ? true : false;
    console.log('✅ Connection check result:', hasCredentials);

    return new Response(
      JSON.stringify({ 
        connected: hasCredentials,
        message: hasCredentials ? 'Connected to Google Sheets' : 'Not connected to Google Sheets'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Connection check error:', error);
    const err = error as any;
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: err?.message ?? String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})