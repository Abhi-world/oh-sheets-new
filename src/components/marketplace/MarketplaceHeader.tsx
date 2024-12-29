import React from 'react';
import { ArrowRight } from 'lucide-react';

const MarketplaceHeader = () => {
  return (
    <div className="relative z-10">
      {/* Main content container */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header content with enhanced styling */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="flex flex-col items-center space-y-6">
            {/* Logo and title section */}
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src="/lovable-uploads/5e7a0614-eebd-4595-9634-40b17d9029c2.png" 
                alt="Monday.com" 
                className="w-10 h-10"
              />
              <ArrowRight className="w-6 h-6 text-white/80" />
              <img 
                src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" 
                alt="Google Sheets" 
                className="w-10 h-10"
              />
            </div>

            {/* Title with enhanced typography */}
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight text-center">
              Monday.com to Google Sheets
              <span className="block text-4xl mt-2">Integration</span>
            </h1>

            {/* Description with improved readability */}
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed text-center">
              Seamlessly sync your Monday.com data with Google Sheets using our automated integration templates
            </p>

            {/* Decorative elements */}
            <div className="flex items-center space-x-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80"></div>
              <div className="w-24 h-1 bg-[#0F9D58] rounded-full opacity-80"></div>
              <div className="w-2 h-2 rounded-full bg-[#0F9D58] opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;