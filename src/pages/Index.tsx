import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-dark">
      <MarketplaceHeader />
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-end mb-8">
          <Button 
            onClick={() => navigate('/install')}
            className="bg-google-green hover:bg-google-green/90 text-white"
          >
            Install App
          </Button>
        </div>
        <RecipeGrid />
      </div>
    </div>
  );
};

export default Index;