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
        console.log('⚠️ [useGoogleSheetsStatus] No Monday user ID available, skipping check');
        setIsConnected(false);
        setIsLoading(false);
        return;
      }

      console.log('🔄 [useGoogleSheetsStatus] Checking Google Sheets connection for user:', mondayUserId);
      
      const { data, error } = await supabase.functions.invoke('check-google-connection', {
        body: { monday_user_id: String(mondayUserId) }
      });

      if (error) {
        console.error('❌ [useGoogleSheetsStatus] Connection check error:', error);
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      const isConnected = !!data?.connected;
      console.log(`${isConnected ? '✅' : '❌'} [useGoogleSheetsStatus] Connection status:`, isConnected);
      setIsConnected(isConnected);
    } catch (err) {
      // Safely log error without risking circular reference issues
      let errorMessage = 'Unknown error';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err instanceof Error) {
        errorMessage = err.message || 'Error object';
      }
      
      console.error('❌ [useGoogleSheetsStatus] Error checking Google Sheets connection:', errorMessage);
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