import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ConnectMonday = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      // Fetch the Monday.com client ID from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-monday-client-id');
      
      if (error) {
        console.error('Error fetching Monday.com client ID:', error);
        throw new Error('Failed to get Monday.com client ID');
      }

      if (!data?.MONDAY_CLIENT_ID) {
        console.error('Monday.com client ID not found in response');
        throw new Error('Monday.com client ID not found');
      }
      
      // Construct the Monday.com OAuth URL
      const mondayAuthUrl = new URL('https://auth.monday.com/oauth2/authorize');
      
      // Add required OAuth parameters
      mondayAuthUrl.searchParams.append('client_id', data.MONDAY_CLIENT_ID);
      
      // Use the same redirect URI that's configured in the Supabase Edge Function
      const redirectUri = `${window.location.origin}/monday-oauth`;
      mondayAuthUrl.searchParams.append('redirect_uri', redirectUri);
      mondayAuthUrl.searchParams.append('response_type', 'code');
      
      console.log('Using redirect URI:', redirectUri);
      
      // Add required scopes
      const scopes = ['me:read', 'boards:read', 'boards:write', 'workspaces:read', 'users:read', 'updates:read', 'updates:write'];
      mondayAuthUrl.searchParams.append('scope', scopes.join(' '));
      
      console.log('Redirecting to Monday.com OAuth URL:', mondayAuthUrl.toString());
      
      // Redirect to Monday.com OAuth page
      window.location.href = mondayAuthUrl.toString();
    } catch (error) {
      console.error('Error connecting to Monday.com:', error);
      toast.error('Failed to connect to Monday.com. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Connect Monday.com</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            Click below to securely connect your Monday.com account.
          </p>
          <Button 
            onClick={handleConnect}
            className="w-full bg-[#ff3d57] hover:bg-[#ff3d57]/90 text-white py-6 text-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              'Connect Monday.com'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectMonday;