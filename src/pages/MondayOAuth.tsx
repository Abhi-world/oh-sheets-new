import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const MondayOAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        // Get the code from URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          console.error('No authorization code received from Monday.com');
          toast.error('Authorization failed. Please try again.');
          navigate('/');
          return;
        }

        console.log('Received Monday.com OAuth code, exchanging for token...');

        // Exchange code for access token using Supabase Edge Function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('monday-oauth-callback', {
          body: { code }
        });

        if (tokenError) {
          console.error('Error exchanging code for token:', tokenError);
          throw tokenError;
        }

        const { access_token, monday_user_id, monday_user_email } = tokenData;

        if (!access_token || !monday_user_id) {
          console.error('Invalid token data received:', tokenData);
          throw new Error('Invalid token data received');
        }

        console.log('Successfully received Monday.com access token');

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          throw new Error('No authenticated user found');
        }

        // Update the profile with Monday.com information
        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            monday_user_id,
            monday_user_email,
            monday_access_token: access_token,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        console.log('Successfully stored Monday.com user information');
        toast.success('Successfully connected to Monday.com!');
        navigate('/');
      } catch (error) {
        console.error('Error during Monday.com OAuth:', error);
        toast.error('Failed to connect to Monday.com. Please try again.');
        navigate('/');
      }
    };

    handleOAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-white text-lg">Connecting to Monday.com...</p>
      </div>
    </div>
  );
};

export default MondayOAuth;