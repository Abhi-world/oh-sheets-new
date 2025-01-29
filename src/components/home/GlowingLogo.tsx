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
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 512 512"
          className="w-14 h-14 relative z-10"
        >
          <rect width="512" height="512" rx="51.2" fill="#228B22"/>
          <path 
            d="M 307.2 128 H 179.2 C 167.6 128 156.4 132.8 148 141.2 C 139.6 149.6 134.8 160.8 134.8 172.4 V 339.6 C 134.8 351.2 139.6 362.4 148 370.8 C 156.4 379.2 167.6 384 179.2 384 H 332.8 C 344.4 384 355.6 379.2 364 370.8 C 372.4 362.4 377.2 351.2 377.2 339.6 V 198 L 307.2 128 Z" 
            fill="none" 
            stroke="white" 
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M 307.2 128 V 198 H 377.2" 
            fill="none" 
            stroke="white" 
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M 179.2 268 H 332.8" 
            fill="none" 
            stroke="white" 
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M 256 233 V 303" 
            fill="none" 
            stroke="white" 
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-white text-lg font-medium mb-4">Google Sheets Integration</span>
    </div>
  );
};

export default GlowingLogo;