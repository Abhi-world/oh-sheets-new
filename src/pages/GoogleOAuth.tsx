import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function GoogleOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract ONLY primitive values from URL
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Build plain JSON object - NO window/response/event references
    const result = {
      type: 'google_oauth_result',
      code: code || undefined,
      error: error || undefined,
      state: state || undefined,
      timestamp: Date.now()
    };

    // Send to parent window
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(result, '*');
        console.log('✅ OAuth result sent to opener');
      } catch (err) {
        console.error('❌ postMessage failed:', err);
      }
    }

    // Fallback: Store in localStorage
    try {
      localStorage.setItem('google_oauth_result', JSON.stringify(result));
    } catch (err) {
      console.error('localStorage write failed:', err);
    }

    // Close popup after 500ms
    setTimeout(() => {
      window.close();
    }, 500);

  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Processing authentication...</h2>
      <p>This window will close automatically.</p>
    </div>
  );
}

export default GoogleOAuthCallback;

