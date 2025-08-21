import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GoogleOAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        console.error('OAuth error:', error);
        toast.error('Google authorization failed');
        
        // Signal error to parent window
        try {
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error }, '*');
          }
          localStorage.setItem('google_oauth_error', error);
        } catch (e) {
          console.log('Could not signal error to parent window:', e);
        }
        
        setTimeout(() => window.close(), 2000);
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        toast.error('Authorization failed');
        
        // Signal error to parent window
        try {
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_ERROR', error: 'No code received' }, '*');
          }
          localStorage.setItem('google_oauth_error', 'No code received');
        } catch (e) {
          console.log('Could not signal error to parent window:', e);
        }
        
        setTimeout(() => window.close(), 2000);
        return;
      }

      try {
        console.log('Starting token exchange...');
        
        // Exchange code for tokens using edge function
        const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth-exchange', {
          body: { code }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        console.log('Token exchange successful');
        toast.success('Google Sheets connected successfully!');
        
        // Signal success to parent window with enhanced Monday support
        const signalSuccess = () => {
          console.log('🎉 OAuth Success - Signaling to Monday iframe...');
          
          const successMessage = {
            type: 'GOOGLE_OAUTH_SUCCESS',
            timestamp: Date.now(),
            source: 'oauth-callback'
          };
          
          // Method 1: localStorage (fallback)
          try {
            localStorage.setItem('google_oauth_success', 'true');
            localStorage.setItem('google_oauth_timestamp', Date.now().toString());
            console.log('✅ localStorage success signal set');
          } catch (e) {
            console.log('❌ localStorage not available:', e);
          }
          
          // Method 2: Enhanced Monday communication
          try {
            // Try to find the Monday iframe by walking up the window hierarchy
            let targetWindow = window.opener;
            
            // If no opener, try to find Monday's parent window
            if (!targetWindow || targetWindow.closed) {
              // Look for Monday.com in the referrer or parent
              if (document.referrer.includes('monday.com')) {
                targetWindow = window.parent;
                console.log('📤 Using parent window (referrer suggests Monday)');
              }
            }
            
            if (targetWindow && !targetWindow.closed) {
              // Send to all possible Monday origins
              const mondayOrigins = [
                '*', // Wildcard as fallback
                'https://monday.com',
                'https://auth.monday.com',
                'https://app.monday.com',
                window.location.origin // In case it's embedded in our own domain
              ];
              
              mondayOrigins.forEach(origin => {
                try {
                  targetWindow.postMessage(successMessage, origin);
                  console.log(`📤 Message sent to origin: ${origin}`);
                } catch (e) {
                  console.log(`❌ Failed to send to ${origin}:`, e);
                }
              });
            } else {
              console.log('❌ No valid target window found');
            }
            
            // Also try broadcasting to all window references
            const windowRefs = [window.opener, window.parent, window.top];
            windowRefs.forEach((win, index) => {
              if (win && win !== window && !win.closed) {
                try {
                  win.postMessage(successMessage, '*');
                  console.log(`✅ Broadcasted to window ${index}`);
                } catch (e) {
                  console.log(`❌ Failed to broadcast to window ${index}:`, e);
                }
              }
            });
          } catch (e) {
            console.log('❌ Monday communication failed:', e);
          }
          
          // Method 3: Special handling for embedded iframe scenarios
          try {
            if (window.parent !== window) {
              window.parent.postMessage({
                ...successMessage,
                mondayApp: true,
                embedContext: 'monday-iframe'
              }, '*');
              console.log('📤 Sent embedded iframe message');
            }
          } catch (e) {
            console.log('❌ Embedded iframe messaging failed:', e);
          }
        };
        
        signalSuccess();
        
        // Keep signaling for a few seconds to ensure parent receives it
        const signalInterval = setInterval(signalSuccess, 500);
        setTimeout(() => {
          clearInterval(signalInterval);
        }, 5000);
        
        // Close the window after a short delay
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.log('Could not close window:', e);
            // If we can't close, navigate to success page
            navigate('/connect-sheets?success=true');
          }
        }, 2000);
        
      } catch (error) {
        console.error('Token exchange error:', error);
        toast.error('Failed to connect Google Sheets');
        
        // Signal error to parent window
        try {
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'GOOGLE_OAUTH_ERROR', 
              error: error.message || 'Token exchange failed' 
            }, '*');
          }
          localStorage.setItem('google_oauth_error', error.message || 'Token exchange failed');
        } catch (e) {
          console.log('Could not signal error to parent window:', e);
        }
        
        setTimeout(() => window.close(), 2000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting to Google Sheets</h2>
        <p className="text-gray-600">Please wait while we complete the authorization...</p>
      </div>
    </div>
  );
};

export default GoogleOAuth;