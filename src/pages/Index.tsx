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
      
      {/* Updated container with reduced spacing and decorative elements */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Decorative circles */}
        <div className="absolute left-4 -top-8 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        <div className="absolute right-8 top-4 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        
        {/* Install button with updated positioning */}
        <div className="flex justify-end mb-6 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-full border-t border-white/10" />
          </div>
          <Button 
            onClick={() => navigate('/install')}
            className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-semibold px-6 py-2 text-base shadow-lg relative"
          >
            Install App
          </Button>
        </div>

        {/* Section title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Integration Templates</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80" />
            <div className="w-16 h-1 bg-[#0F9D58] rounded-full opacity-80" />
            <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80" />
          </div>
        </div>

        {/* Recipe grid with glass effect container */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/10">
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;