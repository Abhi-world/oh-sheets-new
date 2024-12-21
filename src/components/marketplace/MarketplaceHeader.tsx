import React from 'react';

const MarketplaceHeader = () => {
  return (
    <div className="py-12 px-4 text-center bg-gradient-to-r from-monday-blue to-monday-blue/90">
      <h1 className="text-4xl font-bold text-white mb-4">
        Monday.com to Google Sheets Integration
      </h1>
      <p className="text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
        Seamlessly sync your Monday.com data with Google Sheets using our automated integration templates
      </p>
      <div className="w-32 h-1 bg-google-green mx-auto mt-8 rounded-full opacity-80" />
    </div>
  );
};

export default MarketplaceHeader;