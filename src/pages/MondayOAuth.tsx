import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MondayOAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      try {
        // Get the code from URL parameters
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (!code) {
          console.error('No authorization code received');
          toast.error('Authorization failed. Please try again.');
          navigate('/');
          return;
        }

        console.log('Received Monday.com OAuth code:', code);

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Exchange code for access token using Supabase Edge Function
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('monday-oauth-callback', {
          body: { code }
        });

        if (tokenError) throw tokenError;

        const { access_token, monday_user_id, monday_user_email } = tokenData;

        // Update the profile with Monday.com information
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            monday_user_id,
            monday_user_email,
            monday_access_token: access_token,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Connecting to Monday.com...</h2>
        <p className="text-gray-600">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default MondayOAuth;