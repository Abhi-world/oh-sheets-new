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
              {/* Title section */}
              <div className="text-center">
                <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl mb-8">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent">
                    Oh Sheets
                  </h1>
                </div>

                {/* Google Sheets logo with enhanced glowing animation */}
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div 
                    className="absolute inset-0 -m-3 rounded-full border-2 border-[#FEF7CD] animate-[spin_3s_linear_infinite]" 
                    style={{
                      boxShadow: '0 0 25px rgba(254, 247, 205, 0.8), 0 0 15px rgba(254, 247, 205, 0.6), 0 0 35px rgba(254, 247, 205, 0.4)',
                      animation: 'spin 3s linear infinite'
                    }}
                  ></div>
                  <img 
                    src="/lovable-uploads/ea26a2c2-cb2f-4e61-8ecd-c7cbc79e0780.png" 
                    alt="Google Sheets" 
                    className="w-16 h-16 relative z-10 mt-2"
                  />
                </div>

                <p className="text-lg text-white mt-4 max-w-lg mx-auto">
                  Seamlessly sync your{' '}
                  <span className="relative inline-block pb-1">
                    Monday.com
                    <span 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FEF7CD] transform transition-transform duration-500"
                      style={{
                        boxShadow: '0 0 8px rgba(254, 247, 205, 0.8)',
                        animation: 'underlineWave 20s linear infinite'
                      }}
                    ></span>
                  </span>
                  {' '}data with{' '}
                  <span className="relative inline-block pb-1">
                    Google Sheets
                    <span 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FEF7CD] transform transition-transform duration-500"
                      style={{
                        boxShadow: '0 0 8px rgba(254, 247, 205, 0.8)',
                        animation: 'underlineWave 20s linear infinite'
                      }}
                    ></span>
                  </span>
                  {' '}using our automated integration templates
                </p>
                <style>
                  {`
                    @keyframes underlineWave {
                      0%, 100% {
                        transform: scaleX(1) translateY(0) rotate(-0.5deg);
                        opacity: 1;
                      }
                      25% {
                        transform: scaleX(1.1) translateY(1px) rotate(0.5deg);
                      }
                      50% {
                        transform: scaleX(0) translateY(0) rotate(-0.5deg);
                        opacity: 0;
                      }
                      75% {
                        transform: scaleX(1.1) translateY(-1px) rotate(0.5deg);
                      }
                    }
                  `}
                </style>
              </div>

              {/* Decorative elements */}
              <div className="flex items-center space-x-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-[#228B22] opacity-80"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-[#228B22]/80 to-[#0052CC]/80 rounded-full"></div>
                <div className="w-2 h-2 rounded-full bg-[#0052CC] opacity-80"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="flex justify-end mb-6 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <Button 
            onClick={() => navigate('/install')}
            className="relative bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white font-semibold px-6 py-2 text-base shadow-lg"
          >
            Install App
          </Button>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Integration Templates</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-[#0F9D58]/80 to-[#0052CC]/80 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-[#0052CC] opacity-80"></div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/10">
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;
