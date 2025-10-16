import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GoogleOAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('🔍 [GoogleOAuth] Callback loaded:', { 
      code: code ? `${code.substring(0, 20)}...` : null, 
      error,
      fullUrl: window.location.href 
    });

    if (error) {
      console.log('❌ [GoogleOAuth] Error detected:', error);
      setStatus('error');
      setMessage(`Authorization failed: ${error}`);
      const errorResult = { 
        type: 'error', 
        error,
        timestamp: Date.now()
      };
      console.log('💾 [GoogleOAuth] Storing error in localStorage:', errorResult);
      localStorage.setItem('google_oauth_result', JSON.stringify(errorResult));
      try {
        if (window.opener) {
          // Allow communication with Monday.com by using '*' for targetOrigin
          window.opener.postMessage({ type: 'google_oauth_result', payload: errorResult }, '*');
          console.log('📨 [GoogleOAuth] Posted error message to opener with wildcard origin');
        }
      } catch (e) {
        console.log('⚠️ [GoogleOAuth] postMessage failed:', e);
      }
      console.log('✅ [GoogleOAuth] Error stored, localStorage now has:', localStorage.getItem('google_oauth_result'));
    } else if (code) {
      console.log('✅ [GoogleOAuth] Code received successfully');
      setStatus('success');
      setMessage('Success! Finalizing connection...');
      const successResult = { 
        type: 'success', 
        code,
        timestamp: Date.now()
      };
      console.log('💾 [GoogleOAuth] Storing success in localStorage:', { ...successResult, code: `${code.substring(0, 20)}...` });
      localStorage.setItem('google_oauth_result', JSON.stringify(successResult));
      // Notify opener directly (works even with storage partitioning)
      try {
        if (window.opener) {
          // Allow communication with Monday.com by using '*' for targetOrigin
          window.opener.postMessage({ type: 'google_oauth_result', payload: successResult }, '*');
          console.log('📨 [GoogleOAuth] Posted success message to opener with wildcard origin');
        }
      } catch (e) {
        console.log('⚠️ [GoogleOAuth] postMessage failed:', e);
      }
      console.log('✅ [GoogleOAuth] Success stored, localStorage now has:', localStorage.getItem('google_oauth_result')?.substring(0, 100) + '...');
    } else {
      console.log('❌ [GoogleOAuth] No code or error received');
      setStatus('error');
      setMessage('No authorization code was received.');
      const errorResult = { 
        type: 'error', 
        error: 'No code received',
        timestamp: Date.now()
      };
      console.log('💾 [GoogleOAuth] Storing no-code error:', errorResult);
      localStorage.setItem('google_oauth_result', JSON.stringify(errorResult));
    }

    // Give more time for localStorage to sync before closing
    setTimeout(() => {
      console.log('🚪 [GoogleOAuth] Closing popup window in 3 seconds...');
      setTimeout(() => {
        console.log('👋 [GoogleOAuth] Closing now!');
        window.close();
      }, 3000);
    }, 100);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm">
        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />}
        {status === 'success' && <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />}
        {status === 'error' && <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />}

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback;

