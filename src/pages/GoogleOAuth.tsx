import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { safeStringify } from '../lib/safeJson';

export function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    console.log('GoogleOAuth: Callback initiated');
    
    // Extract ONLY primitive values from URL as strings
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    
    console.log('GoogleOAuth: Extracted params:', { 
      code: code ? 'present' : 'missing', 
      error: error || 'none', 
      state: state ? 'present' : 'missing' 
    });

    // Build a simple serializable object with only primitive values
    const result = {
      type: 'google_oauth_result',
      code: code || null,
      error: error || null,
      state: state || null,
      timestamp: Date.now()
    };

    console.log('GoogleOAuth: Created result object (sanitized)');
    
    // CRITICAL FIX: Call save-google-token function to exchange code for tokens
    const exchangeCodeForToken = async () => {
      if (code && state) {
        try {
          setStatus('Exchanging authorization code for tokens...');
          
          // Get Supabase URL and anon key from environment
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseAnon) {
            throw new Error('Missing Supabase configuration');
          }
          
          // Call the save-google-token function with the code and monday_user_id (from state)
          const response = await fetch(`${supabaseUrl}/functions/v1/save-google-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnon,
              'Authorization': `Bearer ${supabaseAnon}`,
            },
            body: JSON.stringify({
              code,
              monday_user_id: state
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('GoogleOAuth: ❌ Token exchange failed:', response.status, errorText);
            setStatus('Authentication failed. Please try again.');
            result.error = `Token exchange failed: ${response.status}`;
          } else {
            const data = await response.json();
            console.log('GoogleOAuth: ✅ Token exchange successful');
            setStatus('Authentication successful!');
            result.success = true;
          }
        } catch (err) {
          console.error('GoogleOAuth: ❌ Token exchange error:', err.message);
          setStatus('Authentication error. Please try again.');
          result.error = err.message;
        }
      }
    };
    
    // First try: postMessage to parent window
    let postMessageSuccess = false;
    if (window.opener) {
      try {
        // Use safe serialization to avoid circular references
        const safeResult = JSON.parse(safeStringify(result));
        window.opener.postMessage(safeResult, '*');
        console.log('GoogleOAuth: ✅ Successfully sent via postMessage');
        postMessageSuccess = true;
      } catch (err) {
        console.error('GoogleOAuth: ❌ postMessage failed:', err.message);
      }
    } else {
      console.log('GoogleOAuth: No opener window found');
    }

    // Second try: localStorage fallback
    try {
      const resultString = safeStringify(result);
      localStorage.setItem('google_oauth_result', resultString);
      console.log('GoogleOAuth: ✅ Successfully saved to localStorage');
    } catch (err) {
      console.error('GoogleOAuth: ❌ localStorage write failed:', err.message);
    }
    
    // Execute the token exchange
    if (code && state) {
      exchangeCodeForToken().then(() => {
        // Close popup after delay (longer if postMessage failed)
        const closeDelay = postMessageSuccess ? 1500 : 2500;
        console.log(`GoogleOAuth: Window will close in ${closeDelay}ms`);
        
        setTimeout(() => {
          console.log('GoogleOAuth: Closing window now');
          window.close();
        }, closeDelay);
      });
    } else {
      // Close popup after delay if no code/state (error case)
      const closeDelay = postMessageSuccess ? 800 : 1500;
      console.log(`GoogleOAuth: Window will close in ${closeDelay}ms`);
      
      setTimeout(() => {
        console.log('GoogleOAuth: Closing window now');
        window.close();
      }, closeDelay);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>{status}</h2>
      <p>This window will close automatically.</p>
    </div>
  );
}

export default GoogleOAuthCallback;

