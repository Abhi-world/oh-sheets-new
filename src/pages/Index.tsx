import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/c931c08e-78b7-41b7-9722-c2db9e3875e9.png')] opacity-10 bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
      
      <MarketplaceHeader />
      
      <div className="container mx-auto py-12 px-4 relative z-10">
        <div className="flex justify-end mb-8">
          <Button 
            onClick={() => navigate('/install')}
            className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-semibold px-6 py-2 text-base shadow-lg"
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