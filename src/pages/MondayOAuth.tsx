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
          toast.error('No authorization code received');
          navigate('/');
          return;
        }

        console.log('Received Monday.com OAuth code:', code);

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to connect Monday.com');
          navigate('/login');
          return;
        }

        // Store the code temporarily - in production you would exchange this for an access token
        const { error } = await supabase
          .from('profiles')
          .update({ monday_api_key: code })
          .eq('id', user.id);

        if (error) throw error;

        toast.success('Successfully connected to Monday.com!');
        navigate('/');
      } catch (error) {
        console.error('Error during Monday.com OAuth:', error);
        toast.error('Failed to connect to Monday.com');
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