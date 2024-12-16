import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface ConnectionCardsProps {
  mondayConnected: boolean;
  sheetsConnected: boolean;
}

const ConnectionCards = ({ mondayConnected, sheetsConnected }: ConnectionCardsProps) => {
  const navigate = useNavigate();
  
  if (mondayConnected && sheetsConnected) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4">First, Connect Your Services</h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        {!mondayConnected && (
          <div className="flex-1 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Connect Monday.com</h3>
            <p className="text-gray-600 mb-4">
              Click below to securely connect your Monday.com account. We'll handle the authentication automatically.
            </p>
            <Button
              onClick={() => navigate('/connect-monday')}
              className="w-full bg-[#ff3d57] hover:bg-[#ff3d57]/90"
            >
              Connect Monday.com
            </Button>
          </div>
        )}
        {!sheetsConnected && (
          <div className="flex-1 p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">Connect Google Sheets</h3>
            <p className="text-gray-600 mb-4">Connect your Google Sheets account to enable data syncing.</p>
            <Button
              onClick={() => navigate('/connect-sheets')}
              className="w-full bg-[#34a853] hover:bg-[#34a853]/90"
            >
              Connect Google Sheets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionCards;