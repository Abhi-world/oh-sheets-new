import React from 'react';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const mondayConnected = false;
  const sheetsConnected = false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-monday-blue/5 to-monday-lightBlue">
      <MarketplaceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-4">
              <ConnectionStatus service="monday" isConnected={mondayConnected} />
              <ConnectionStatus service="sheets" isConnected={sheetsConnected} />
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/settings')}
              className="text-navy hover:bg-monday-blue/10 border-b border-google-green"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
          
          {(!mondayConnected || !sheetsConnected) && (
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 mt-4 border-t-2 border-google-green shadow-lg">
              <p className="text-sm text-navy">
                Please connect both Monday.com and Google Sheets to start using the templates.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-navy border-l-4 border-google-green pl-4">
            Available Integration Templates
          </h2>
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;