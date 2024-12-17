import React from 'react';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import ConnectionStatus from '@/components/ConnectionStatus';

const Index = () => {
  const mondayConnected = false;
  const sheetsConnected = false;

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
          </div>
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