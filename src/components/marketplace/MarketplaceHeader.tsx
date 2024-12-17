import React from 'react';

const MarketplaceHeader = () => {
  return (
    <div className="bg-gradient-to-r from-[#00c875] to-[#00a65a] text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">Monday.com Integration Templates</h1>
        <p className="text-lg opacity-90">
          Pre-built automations to sync data between Monday.com and Google Sheets
        </p>
        <div className="flex gap-2 mt-4">
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            Easy setup
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            No code required
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;