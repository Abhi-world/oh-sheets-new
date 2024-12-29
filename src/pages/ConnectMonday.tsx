import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ConnectMonday = () => {
  const navigate = useNavigate();

  // Temporarily disabled OAuth for testing
  const handleConnect = () => {
    console.log('Bypassing OAuth for testing purposes');
    // Navigate directly to installation flow for testing
    navigate('/install');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Connect Monday.com</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600 text-center">
            Click below to securely connect your Monday.com account. No manual API token needed!
          </p>
          <Button 
            onClick={handleConnect}
            className="w-full bg-[#ff3d57] hover:bg-[#ff3d57]/90 text-white py-6 text-lg font-medium"
          >
            Connect Monday.com
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Note: OAuth is temporarily disabled for testing purposes
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectMonday;