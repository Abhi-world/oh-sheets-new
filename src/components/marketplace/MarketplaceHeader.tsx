import React from 'react';
import { ArrowLeftCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MarketplaceHeader = () => {
  return (
    <div className="relative bg-gradient-to-r from-[#00c875] to-[#00a65a] text-white py-12">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button variant="ghost" className="text-white hover:text-white/80">
          <ArrowLeftCircle className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Help button */}
      <div className="absolute bottom-4 right-4">
        <Button variant="ghost" className="text-white hover:text-white/80">
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-4">
          Monday.com Integration Templates
        </h1>
        <p className="text-lg opacity-90 mb-6">
          Pre-built automations to sync data between Monday.com and Google Sheets
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm">
            Easy setup
          </div>
          <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm">
            No code required
          </div>
          <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm">
            Real-time sync
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;