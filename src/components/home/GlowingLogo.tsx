import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const GlowingLogo = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 mx-auto mb-2 flex items-center justify-center">
        <div 
          className="absolute inset-0 rounded-full border-2 border-[#FEF7CD] animate-[spin_3s_linear_infinite]" 
          style={{
            boxShadow: '0 0 25px rgba(254, 247, 205, 0.8), 0 0 15px rgba(254, 247, 205, 0.6), 0 0 35px rgba(254, 247, 205, 0.4)',
            animation: 'spin 3s linear infinite'
          }}
        />
        <FileSpreadsheet 
          className="w-14 h-14 relative z-10 text-white"
        />
      </div>
      <span className="text-white text-lg font-medium mb-4">Google Sheets Integration</span>
    </div>
  );
};

export default GlowingLogo;