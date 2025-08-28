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

    // --- This is the main logic ---
    if (window.opener) {
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        // FIX: No backslashes in the type
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error }, window.location.origin);
      } else if (code) {
        setStatus('success');
        setMessage('Success! Finalizing connection...');
        // FIX: No backslashes in the type
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS', code }, window.location.origin);
      } else {
        setStatus('error');
        setMessage('No authorization code was received.');
        window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error: 'No code received' }, window.location.origin);
      }
    } else {
      setStatus('error');
      setMessage('Parent window could not be found. Please try again.');
    }
    
    // Close the popup after giving the message time to send
    setTimeout(() => window.close(), 2000);

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
