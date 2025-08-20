import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface MondaySessionPayload {
  userId: number;
  accountId: number;
  backToUrl: string;
  shortLivedToken: string;
  exp: number;
  iat: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'Session token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Decode the JWT without verification for now (Monday.com session tokens)
    // In production, you should verify the signature using Monday's public key
    const parts = sessionToken.split('.');
    if (parts.length !== 3) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const payload = JSON.parse(atob(parts[1])) as MondaySessionPayload;
    
    // Basic validation
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return new Response(
        JSON.stringify({ error: 'Token has expired' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return the decoded payload for use in the application
    return new Response(
      JSON.stringify({
        success: true,
        userId: payload.userId,
        accountId: payload.accountId,
        backToUrl: payload.backToUrl,
        shortLivedToken: payload.shortLivedToken
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error verifying Monday session token:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to verify session token' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});