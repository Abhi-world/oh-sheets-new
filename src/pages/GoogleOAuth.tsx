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
      console.log('🔄 OAuth callback page loaded');
      console.log('📍 Current URL:', window.location.href);
      console.log('🔗 Referrer:', document.referrer);
      console.log('🪟 Window opener available:', !!window.opener);
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      if (error) {
        console.error('❌ OAuth error:', error);
        toast.error('Google authorization failed');
        
        // Signal error immediately and persistently
        const errorMessage = { type: 'GOOGLE_OAUTH_ERROR', error, timestamp: Date.now() };
        
        // localStorage fallback
        try {
          localStorage.setItem('google_oauth_error', error);
          localStorage.setItem('google_oauth_status', 'error');
        } catch (e) {
          console.log('❌ localStorage not available:', e);
        }
        
        // PostMessage to all possible targets
        const targets = [window.opener, window.parent, window.top];
        targets.forEach((target, index) => {
          if (target && target !== window) {
            try {
              target.postMessage(errorMessage, '*');
              console.log(`📤 Error message sent to target ${index}`);
            } catch (e) {
              console.log(`❌ Failed to send error to target ${index}:`, e);
            }
          }
        });
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (!code) {
        console.error('❌ No authorization code received');
        toast.error('Authorization failed - no code received');
        
        const errorMessage = { type: 'GOOGLE_OAUTH_ERROR', error: 'No code received', timestamp: Date.now() };
        
        try {
          localStorage.setItem('google_oauth_error', 'No code received');
          localStorage.setItem('google_oauth_status', 'error');
        } catch (e) {
          console.log('❌ localStorage not available:', e);
        }
        
        const targets = [window.opener, window.parent, window.top];
        targets.forEach((target, index) => {
          if (target && target !== window) {
            try {
              target.postMessage(errorMessage, '*');
              console.log(`📤 Error message sent to target ${index}`);
            } catch (e) {
              console.log(`❌ Failed to send error to target ${index}:`, e);
            }
          }
        });
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      try {
        console.log('🔄 Starting token exchange with code length:', code.length);
        
        // Exchange code for tokens using edge function
        const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth-exchange', {
          body: { code }
        });

        if (exchangeError) {
          console.error('❌ Edge function error:', exchangeError);
          throw exchangeError;
        }

        console.log('✅ Token exchange successful');
        toast.success('Google Sheets connected successfully!');
        
        // Signal success immediately and persistently
        const successMessage = {
          type: 'GOOGLE_OAUTH_SUCCESS',
          timestamp: Date.now(),
          source: 'oauth-callback'
        };
        
        // localStorage signal
        try {
          localStorage.setItem('google_oauth_success', 'true');
          localStorage.setItem('google_oauth_status', 'success');
          localStorage.setItem('google_oauth_timestamp', Date.now().toString());
          console.log('✅ localStorage success signal set');
        } catch (e) {
          console.log('❌ localStorage not available:', e);
        }
        
        // PostMessage to all possible targets
        const targets = [window.opener, window.parent, window.top];
        let messagesSent = 0;
        
        targets.forEach((target, index) => {
          if (target && target !== window) {
            try {
              target.postMessage(successMessage, '*');
              messagesSent++;
              console.log(`✅ Success message sent to target ${index}`);
            } catch (e) {
              console.log(`❌ Failed to send success to target ${index}:`, e);
            }
          }
        });
        
        console.log(`📊 Total messages sent: ${messagesSent}`);
        
        // Keep signaling for better reliability
        let attempts = 0;
        const maxAttempts = 20;
        const signalInterval = setInterval(() => {
          attempts++;
          
          targets.forEach((target, index) => {
            if (target && target !== window) {
              try {
                target.postMessage(successMessage, '*');
              } catch (e) {
                // Silent fail on repeated attempts
              }
            }
          });
          
          if (attempts >= maxAttempts) {
            clearInterval(signalInterval);
            console.log('🔄 Finished signaling attempts');
          }
        }, 200);
        
        // Close window after delay
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.log('❌ Could not close window:', e);
            // Show success message if window won't close
            document.body.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; background: #f0f9ff;">
                <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <div style="color: #10b981; font-size: 48px; margin-bottom: 1rem;">✅</div>
                  <h2 style="color: #1f2937; margin-bottom: 0.5rem;">Connected Successfully!</h2>
                  <p style="color: #6b7280;">You can close this window and return to Monday.com</p>
                </div>
              </div>
            `;
          }
        }, 3000);
        
      } catch (error) {
        console.error('❌ Token exchange error:', error);
        toast.error('Failed to connect Google Sheets');
        
        const errorMessage = { 
          type: 'GOOGLE_OAUTH_ERROR', 
          error: error.message || 'Token exchange failed',
          timestamp: Date.now()
        };
        
        try {
          localStorage.setItem('google_oauth_error', error.message || 'Token exchange failed');
          localStorage.setItem('google_oauth_status', 'error');
        } catch (e) {
          console.log('❌ localStorage not available:', e);
        }
        
        const targets = [window.opener, window.parent, window.top];
        targets.forEach((target, index) => {
          if (target && target !== window) {
            try {
              target.postMessage(errorMessage, '*');
              console.log(`📤 Error message sent to target ${index}`);
            } catch (e) {
              console.log(`❌ Failed to send error to target ${index}:`, e);
            }
          }
        });
        
        setTimeout(() => window.close(), 3000);
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