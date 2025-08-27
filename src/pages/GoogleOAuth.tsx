import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GoogleOAuth = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authorization...');

  console.log('🚀 GoogleOAuth component mounted');
  console.log('🌐 Current URL:', window.location.href);
  
  const allParams = {};
  for (const [key, value] of searchParams.entries()) {
    allParams[key] = value;
  }
  console.log('📋 All URL parameters:', allParams);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('🔄 OAuth callback processing started');
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');
      
      console.log('🔍 Extracted parameters:', {
        code: code ? `${code.substring(0, 20)}...` : null,
        error,
        state,
        hasOpener: !!window.opener,
        origin: window.location.origin
      });

      if (error) {
        console.error('❌ OAuth error:', error);
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        toast.error('Google authorization failed');
        
        // Send error to parent
        const errorMessage = { 
          type: 'GOOGLE_OAUTH_ERROR', 
          error, 
          timestamp: Date.now() 
        };
        
        if (window.opener) {
          try {
            window.opener.postMessage(errorMessage, window.location.origin);
            console.log('📤 Error message sent to parent window');
          } catch (e) {
            console.error('❌ Failed to send error message:', e);
          }
        }
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (!code) {
        console.error('❌ No authorization code received');
        setStatus('error');
        setMessage('No authorization code received');
        toast.error('Authorization failed - no code received');
        
        const errorMessage = { 
          type: 'GOOGLE_OAUTH_ERROR', 
          error: 'No authorization code received', 
          timestamp: Date.now() 
        };
        
        if (window.opener) {
          try {
            window.opener.postMessage(errorMessage, window.location.origin);
            console.log('📤 Error message sent to parent window');
          } catch (e) {
            console.error('❌ Failed to send error message:', e);
          }
        }
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      // Success case
      console.log('✅ Authorization code received successfully');
      setStatus('success');
      setMessage('Authorization successful! Connecting to Google Sheets...');
      toast.success('Authorization successful! Finalizing connection...');
      
      // Send success message with code to parent window
      const successMessage = {
        type: 'GOOGLE_OAUTH_SUCCESS',
        code: code,
        timestamp: Date.now(),
        source: 'oauth-callback'
      };
      
      if (window.opener) {
        try {
          window.opener.postMessage(successMessage, window.location.origin);
          console.log('✅ Success message sent to parent window');
          
          // Keep sending the message for reliability
          let attempts = 0;
          const maxAttempts = 10;
          const interval = setInterval(() => {
            attempts++;
            try {
              window.opener.postMessage(successMessage, window.location.origin);
              console.log(`✅ Retry message ${attempts} sent`);
            } catch (e) {
              console.error(`❌ Failed retry ${attempts}:`, e);
            }
            
            if (attempts >= maxAttempts) {
              clearInterval(interval);
              console.log('🔄 Finished retry attempts');
            }
          }, 200);
          
          // Stop retrying after 3 seconds and close window
          setTimeout(() => {
            clearInterval(interval);
            setMessage('Connection complete! This window will close automatically.');
            setTimeout(() => {
              try {
                window.close();
              } catch (e) {
                console.log('❌ Could not close window:', e);
                setMessage('You can close this window now.');
              }
            }, 1000);
          }, 3000);
          
        } catch (e) {
          console.error('❌ Failed to send success message:', e);
          setStatus('error');
          setMessage('Failed to communicate with parent window');
        }
      } else {
        console.warn('⚠️ No opener window found');
        setStatus('error');
        setMessage('Parent window not found. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Connecting to Google Sheets
              </h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Success!
              </h2>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Connection Failed
              </h2>
            </>
          )}
          
          <p className="text-gray-600">{message}</p>
          
          {status === 'error' && (
            <button 
              onClick={() => window.close()}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close Window
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuth;