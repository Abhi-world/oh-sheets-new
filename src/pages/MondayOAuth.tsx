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

        // Exchange code for access token (this would typically be done through your backend)
        const tokenResponse = await fetch('https://api.monday.com/v2/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            client_id: process.env.MONDAY_CLIENT_ID,
            client_secret: process.env.MONDAY_CLIENT_SECRET,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const { access_token } = await tokenResponse.json();

        // Get user information from Monday.com
        const userResponse = await fetch('https://api.monday.com/v2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': access_token,
          },
          body: JSON.stringify({
            query: `
              query {
                me {
                  id
                  email
                }
              }
            `,
          }),
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user information');
        }

        const { data: { me: { id: mondayUserId, email: mondayUserEmail } } } = await userResponse.json();

        // Get or create Supabase user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Update the profile with Monday.com information
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            monday_user_id: mondayUserId,
            monday_user_email: mondayUserEmail,
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