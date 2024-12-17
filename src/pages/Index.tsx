import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import ConnectionStatus from '@/components/ConnectionStatus';
import ConnectionCards from '@/components/ConnectionCards';
import { toast } from 'sonner';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import BoardTemplates from '@/components/BoardTemplates';
import MondayBoards from '@/components/MondayBoards';

const Index = () => {
  const navigate = useNavigate();
  // Temporarily set these to true for testing
  const [mondayConnected, setMondayConnected] = useState(true);
  const [sheetsConnected, setSheetsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Temporarily disable connection check
  useEffect(() => {
    console.log("Connection checks temporarily disabled for testing");
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monday-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketplaceHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-4">
              <ConnectionStatus service="monday" isConnected={mondayConnected} />
              <ConnectionStatus service="sheets" isConnected={sheetsConnected} />
            </div>
          </div>

          <ConnectionCards 
            mondayConnected={mondayConnected} 
            sheetsConnected={sheetsConnected} 
          />
        </div>

        <div className="space-y-8">
          <MondayBoards />
          <h2 className="text-2xl font-semibold text-gray-800">
            Available Integration Recipes
          </h2>
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;