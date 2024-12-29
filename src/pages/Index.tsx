import React from 'react';
import { useNavigate } from 'react-router-dom';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] relative">
      {/* Clean background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
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