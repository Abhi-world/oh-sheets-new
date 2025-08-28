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

    console.log('🔍 OAuth callback loaded:', { code: !!code, error });

    if (error) {
      console.log('❌ OAuth error detected:', error);
      setStatus('error');
      setMessage(`Authorization failed: ${error}`);
      // Store error in localStorage for main app to pick up
      localStorage.setItem('google_oauth_result', JSON.stringify({ 
        type: 'error', 
        error,
        timestamp: Date.now()
      }));
    } else if (code) {
      console.log('✅ OAuth code received');
      setStatus('success');
      setMessage('Success! Finalizing connection...');
      // Store success result in localStorage for main app to pick up
      localStorage.setItem('google_oauth_result', JSON.stringify({ 
        type: 'success', 
        code,
        timestamp: Date.now()
      }));
    } else {
      console.log('❌ No code or error received');
      setStatus('error');
      setMessage('No authorization code was received.');
      localStorage.setItem('google_oauth_result', JSON.stringify({ 
        type: 'error', 
        error: 'No code received',
        timestamp: Date.now()
      }));
    }

    setTimeout(() => {
      console.log('🚪 Closing popup window');
      window.close();
    }, 2000);
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

