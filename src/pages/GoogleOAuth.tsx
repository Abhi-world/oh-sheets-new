import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { safeStringify } from '../lib/safeJson';

export function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();

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

    // Close popup after delay (longer if postMessage failed)
    const closeDelay = postMessageSuccess ? 800 : 1500;
    console.log(`GoogleOAuth: Window will close in ${closeDelay}ms`);
    
    setTimeout(() => {
      console.log('GoogleOAuth: Closing window now');
      window.close();
    }, closeDelay);

  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Processing authentication...</h2>
      <p>This window will close automatically.</p>
    </div>
  );
}

export default GoogleOAuthCallback;

