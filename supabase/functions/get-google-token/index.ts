// supabase/functions/get-google-token/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { monday_user_id } = await req.json();

    if (!monday_user_id) {
      throw new Error('monday_user_id is required');
    }

    // Get Supabase connection details from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the access token from the database
    const { data, error } = await supabase
      .from('google_tokens')
      .select('access_token, refresh_token, expires_at')
      .eq('monday_user_id', monday_user_id)
      .single();

    if (error) {
      console.error('Error fetching token:', error);
      throw new Error(`No Google token found for user: ${monday_user_id}`);
    }

    if (!data) {
      throw new Error('No Google token found. Please reconnect.');
    }

    // Check if token is expired and refresh if needed
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now >= expiresAt) {
      console.log('Token expired, refreshing...');
      
      // Get Google OAuth credentials
      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
      
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Missing Google OAuth credentials');
      }
      
      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: data.refresh_token,
          grant_type: 'refresh_token'
        })
      });
      
      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json().catch(() => ({}));
        console.error('Token refresh failed:', refreshResponse.status, errorData);
        
        // If refresh token is invalid, we need to prompt for re-authentication
        if (errorData.error === 'invalid_grant') {
          throw new Error('Google authorization expired. Please reconnect your Google account.');
        }
        
        throw new Error(`Failed to refresh access token: ${errorData.error || refreshResponse.statusText}`);
      }
      
      const refreshData = await refreshResponse.json();
      
      // Calculate new expiration time (default to 1 hour if not provided)
      const expiresIn = refreshData.expires_in || 3600;
      const newExpiresAt = new Date(now.getTime() + expiresIn * 1000);
      
      // Update the token in the database
      const { error: updateError } = await supabase
        .from('google_tokens')
        .update({
          access_token: refreshData.access_token,
          expires_at: newExpiresAt.toISOString()
        })
        .eq('monday_user_id', monday_user_id);
      
      if (updateError) {
        console.error('Error updating token:', updateError);
        throw new Error('Failed to update refreshed token');
      }
      
      // Return the new access token
      return new Response(
        JSON.stringify({ 
          access_token: refreshData.access_token,
          expires_at: newExpiresAt.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Return the current access token
    return new Response(
      JSON.stringify({ 
        access_token: data.access_token,
        expires_at: data.expires_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-google-token function:', error);
    
    // Determine appropriate status code based on error type
    let status = 400;
    let message = error.message;
    
    // Customize user-friendly error messages
    if (message.includes('No Google token found')) {
      message = 'Google Sheets connection not found. Please connect your Google account.';
    } else if (message.includes('authorization expired')) {
      message = 'Your Google authorization has expired. Please reconnect your Google account.';
    } else if (message.includes('refresh access token')) {
      message = 'Unable to refresh your Google access. Please reconnect your Google account.';
    }
    
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});