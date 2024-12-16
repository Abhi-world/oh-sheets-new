import { useEffect } from 'react';
import { Button } from "@/components/ui/button";

const ConnectMonday = () => {
  const handleOAuthConnect = () => {
    // Redirect to Monday.com OAuth endpoint
    const clientId = import.meta.env.VITE_MONDAY_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/monday`;
    const scope = 'boards:read boards:write';
    
    console.log('Initiating OAuth connection with client ID:', clientId);
    console.log('Redirect URI:', redirectUri);
    
    const authUrl = `https://auth.monday.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.location.href = authUrl;
  };

  useEffect(() => {
    // If this is opened in Monday.com's context, auto-initiate OAuth
    const isInMondayContext = window.location.href.includes('monday.com') || 
                             document.referrer.includes('monday.com');
    
    console.log('Checking Monday.com context:', isInMondayContext);
    
    if (isInMondayContext) {
      handleOAuthConnect();
    }
  }, []);

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Connect Monday.com</h2>
        <p className="text-gray-600 mb-6">
          Click below to securely connect your Monday.com account. No manual API token needed!
        </p>
        <Button 
          onClick={handleOAuthConnect}
          className="w-full bg-[#ff3d57] hover:bg-[#ff3d57]/90"
        >
          Connect Monday.com
        </Button>
      </div>
    </div>
  );
};

export default ConnectMonday;