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
        navigate('/');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        toast.error('Authorization failed');
        navigate('/');
        return;
      }

      try {
        // Exchange code for tokens using edge function
        const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth-exchange', {
          body: { code }
        });

        if (exchangeError) {
          throw exchangeError;
        }

        toast.success('Google Sheets connected successfully!');
        
        // Signal success to parent window (for Monday embedded mode)
        try {
          // Try localStorage first (same domain)
          localStorage.setItem('google_oauth_success', 'true');
          
          // Try postMessage (works across tabs)
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, '*');
          }
          
          // Try to close window if it was opened as popup
          if (window.opener || window.name === 'oauth_popup') {
            setTimeout(() => {
              window.close();
            }, 1000);
            return;
          }
        } catch (e) {
          console.log('Could not signal to parent window:', e);
        }
        
        // Navigate back to where the user came from or home (for regular flow)
        const redirectTo = state ? decodeURIComponent(state) : '/';
        navigate(redirectTo);
      } catch (error) {
        console.error('Token exchange error:', error);
        toast.error('Failed to connect Google Sheets');
        navigate('/');
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