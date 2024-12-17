import React from 'react';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const mondayConnected = false; // This will be updated with real connection status
  const sheetsConnected = false; // This will be updated with real connection status

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-4">
              <ConnectionStatus service="monday" isConnected={mondayConnected} />
              <ConnectionStatus service="sheets" isConnected={sheetsConnected} />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/settings')}
              className="text-gray-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
          
          {(!mondayConnected || !sheetsConnected) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-yellow-800">
                Please connect both Monday.com and Google Sheets to start using the templates.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-800">
            Available Integration Templates
          </h2>
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;