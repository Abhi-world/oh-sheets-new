import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ConnectMonday = () => {
  const navigate = useNavigate();

  const handleConnect = () => {
    // Construct the Monday.com OAuth URL
    const mondayAuthUrl = new URL('https://auth.monday.com/oauth2/authorize');
    
    // Add required OAuth parameters
    mondayAuthUrl.searchParams.append('client_id', import.meta.env.VITE_MONDAY_CLIENT_ID);
    mondayAuthUrl.searchParams.append('redirect_uri', `${window.location.origin}/monday-oauth`);
    mondayAuthUrl.searchParams.append('response_type', 'code');
    
    // Add required scopes
    const scopes = ['boards:read', 'workspaces:read', 'users:read'];
    mondayAuthUrl.searchParams.append('scope', scopes.join(' '));
    
    // Redirect to Monday.com OAuth page
    window.location.href = mondayAuthUrl.toString();
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
          >
            Connect Monday.com
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectMonday;