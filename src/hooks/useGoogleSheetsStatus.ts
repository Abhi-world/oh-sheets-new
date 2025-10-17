import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { execMondayQuery } from '@/utils/mondaySDK';

export const useGoogleSheetsStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getMondayUserId = async () => {
    try {
      const userResponse = await execMondayQuery(`query { me { id } }`);
      return userResponse?.data?.me?.id;
    } catch (error) {
      console.error('❌ [useGoogleSheetsStatus] Error getting Monday user ID:', error);
      return null;
    }
  };

  const checkConnection = useCallback(async () => {
    try {
      console.log('🔍 [useGoogleSheetsStatus] Checking connection status...');
      const mondayUserId = await getMondayUserId();
      
      if (!mondayUserId) {
        console.log('❌ [useGoogleSheetsStatus] No Monday user ID');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      console.log('👤 [useGoogleSheetsStatus] Monday User ID:', mondayUserId);

      const { data, error } = await supabase
        .from('profiles')
        .select('google_sheets_credentials')
        .eq('monday_user_id', String(mondayUserId))
        .maybeSingle();

      if (error) {
        console.error('❌ [useGoogleSheetsStatus] Database error:', error);
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      // Log the raw data for debugging
      console.log('📄 [useGoogleSheetsStatus] Raw profile data:', data);
      console.log('📄 [useGoogleSheetsStatus] Credentials:', data?.google_sheets_credentials);

      const hasCredentials = !!(data?.google_sheets_credentials);
      console.log('✅ [useGoogleSheetsStatus] Has credentials:', hasCredentials);
      setIsConnected(hasCredentials);
    } catch (error) {
      console.error('❌ [useGoogleSheetsStatus] Error:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('🎬 [useGoogleSheetsStatus] Hook mounted, starting initial check');
    checkConnection();
    
    // Re-check when window gains focus (after OAuth redirect)
    const handleFocus = () => {
      console.log('🔄 [useGoogleSheetsStatus] Window focused, re-checking connection');
      checkConnection();
    };
    
    // Re-check after a delay (in case OAuth callback is still processing)
    const delayedCheck = setTimeout(() => {
      console.log('⏰ [useGoogleSheetsStatus] Running delayed check (3s after mount)');
      checkConnection();
    }, 3000);
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(delayedCheck);
    };
  }, [checkConnection]);

  return { isConnected, isLoading, refetch: checkConnection };
};