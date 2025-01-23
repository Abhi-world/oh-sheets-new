import React from 'react';

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
        <img 
          src="/lovable-uploads/ea26a2c2-cb2f-4e61-8ecd-c7cbc79e0780.png" 
          alt="Google Sheets" 
          className="w-14 h-14 relative z-10"
        />
      </div>
      <span className="text-white text-lg font-medium mb-4">Google Sheets</span>
    </div>
  );
};

export default GlowingLogo;