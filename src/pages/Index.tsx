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
      
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex flex-col items-center space-y-6">
              {/* Logo and title section with pulsing effects */}
              <div className="flex items-center space-x-3 mb-2">
                {/* Monday.com logo with pulse */}
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-400/30 rounded-full animate-pulse blur-xl"></div>
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/5e7a0614-eebd-4595-9634-40b17d9029c2.png" 
                      alt="Monday.com" 
                      className="w-12 h-12 relative z-10"
                    />
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
                  </div>
                </div>
                
                <span className="text-white opacity-80">to</span>
                
                {/* Google Sheets logo with pulse */}
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400/30 rounded-full animate-pulse blur-xl"></div>
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" 
                      alt="Google Sheets" 
                      className="w-12 h-12 relative z-10"
                    />
                    <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>

              {/* Title with enhanced styling and glow effect */}
              <div className="text-center relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-2xl animate-pulse"></div>
                <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl relative">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent">
                    Oh Sheets
                  </h1>
                </div>
                <p className="text-lg text-white mt-4 max-w-lg mx-auto">
                  Seamlessly sync your Monday.com data with Google Sheets using our automated integration templates
                </p>
              </div>

              {/* Decorative elements with pulse */}
              <div className="flex items-center space-x-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-[#228B22] opacity-80 animate-pulse"></div>
                <div className="w-24 h-1 bg-[#228B22] rounded-full opacity-80"></div>
                <div className="w-2 h-2 rounded-full bg-[#228B22] opacity-80 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Container with enhanced decorative elements */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        {/* Animated decorative circles */}
        <div className="absolute left-4 -top-8 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute right-8 top-4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        
        {/* Install button with updated positioning */}
        <div className="flex justify-end mb-6 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <Button 
            onClick={() => navigate('/install')}
            className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-semibold px-6 py-2 text-base shadow-lg relative"
          >
            Install App
          </Button>
        </div>

        {/* Section title with pulsing dots */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Integration Templates</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80 animate-pulse"></div>
            <div className="w-16 h-1 bg-[#0F9D58] rounded-full opacity-80"></div>
            <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80 animate-pulse"></div>
          </div>
        </div>

        {/* Recipe grid with enhanced glass effect */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/10">
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;