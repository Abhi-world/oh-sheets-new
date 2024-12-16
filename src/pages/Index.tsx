import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import ConnectionStatus from '@/components/ConnectionStatus';
import ConnectionCards from '@/components/ConnectionCards';
import { toast } from 'sonner';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';

const Index = () => {
  const navigate = useNavigate();
  const [mondayConnected, setMondayConnected] = useState(false);
  const [sheetsConnected, setSheetsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    try {
      console.log("Checking connections...");
      
      // Check for Monday.com connection
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('monday_access_token, google_sheets_credentials')
        .eq('monday_user_id', window.localStorage.getItem('monday_user_id'))
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error checking connections");
        return;
      }

      console.log("Profile data:", profile);
      
      setMondayConnected(!!profile?.monday_access_token);
      setSheetsConnected(!!profile?.google_sheets_credentials);
    } catch (error) {
      console.error('Error checking connections:', error);
      toast.error("Error checking connections");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg">Loading...</p>
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

        {mondayConnected && sheetsConnected && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              Available Integration Recipes
            </h2>
            <RecipeGrid />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;