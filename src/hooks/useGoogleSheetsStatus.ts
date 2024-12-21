import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleSheetsStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsConnected(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('google_sheets_credentials')
          .eq('id', user.id)
          .single();

        setIsConnected(!!profile?.google_sheets_credentials);
      } catch (error) {
        console.error('Error checking Google Sheets connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return { isConnected, isLoading };
};