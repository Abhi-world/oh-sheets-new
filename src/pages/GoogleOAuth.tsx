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
    console.log('🔄 OAuth callback processing:', { code: !!code, error });
    
    if (window.opener) {
      // For Monday.com iframe context, send to all possible origins
      const sendMessage = (messageData: any) => {
        console.log('📤 Sending message to parent:', messageData);
        
        // Send to multiple possible origins for Monday.com compatibility
        const origins = [
          window.location.origin,
          '*', // Allow all origins as fallback
        ];
        
        origins.forEach(origin => {
          try {
            window.opener.postMessage(messageData, origin);
            console.log(`✅ Message sent to origin: ${origin}`);
          } catch (e) {
            console.warn(`❌ Failed to send to origin ${origin}:`, e);
          }
        });
      };

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        sendMessage({ type: 'GOOGLE_OAUTH_ERROR', error });
      } else if (code) {
        setStatus('success');
        setMessage('Success! Finalizing connection...');
        sendMessage({ type: 'GOOGLE_OAUTH_SUCCESS', code });
      } else {
        setStatus('error');
        setMessage('No authorization code was received.');
        sendMessage({ type: 'GOOGLE_OAUTH_ERROR', error: 'No code received' });
      }
    } else {
      setStatus('error');
      setMessage('Parent window could not be found. Please try again.');
      console.error('❌ No window.opener found');
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
