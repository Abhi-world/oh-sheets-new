import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import ConnectionStatus from '@/components/ConnectionStatus';
import ConnectionCards from '@/components/ConnectionCards';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import RecipeGrid from '@/components/marketplace/RecipeGrid';

interface GoogleSheetsCredentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

interface SupabaseProfile {
  monday_api_key: string | null;
  google_sheets_credentials: Json | null;
}

interface Profile {
  monday_api_key: string | null;
  google_sheets_credentials: GoogleSheetsCredentials | null;
}

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, redirecting to login");
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('monday_api_key, google_sheets_credentials')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error checking connections");
        return;
      }

      console.log("Profile data:", profile);
      
      const supabaseProfile = profile as SupabaseProfile;
      
      const isValidGoogleCredentials = (creds: any): creds is GoogleSheetsCredentials => {
        return (
          creds &&
          typeof creds === 'object' &&
          'client_id' in creds &&
          'client_secret' in creds &&
          'refresh_token' in creds &&
          typeof creds.client_id === 'string' &&
          typeof creds.client_secret === 'string' &&
          typeof creds.refresh_token === 'string'
        );
      };

      const typedProfile: Profile = {
        monday_api_key: supabaseProfile.monday_api_key,
        google_sheets_credentials: isValidGoogleCredentials(supabaseProfile.google_sheets_credentials) 
          ? supabaseProfile.google_sheets_credentials 
          : null
      };
      
      setMondayConnected(!!typedProfile?.monday_api_key);
      setSheetsConnected(!!typedProfile?.google_sheets_credentials);
    } catch (error) {
      console.error('Error checking connections:', error);
      toast.error("Error checking connections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Successfully logged out');
    navigate('/login');
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
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
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