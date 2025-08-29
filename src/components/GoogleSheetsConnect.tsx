import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '@/integrations/google/sheets';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import { isEmbeddedMode } from '@/utils/mondaySDK';

export function GoogleSheetsConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isExchangingTokens, setIsExchangingTokens] = useState(false);
  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    console.log('🔄 Starting connection check...');
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      if (!isEmbeddedMode()) {
        console.log('❌ Not running in Monday.com embedded mode');
        setIsConnected(false);
        setConnectionError('Not running in Monday.com');
        setIsLoading(false);
        return;
      }

      // Get Monday user using the existing utility
      const { getMondaySDK, execMondayQuery } = await import('@/utils/mondaySDK');
      
      try {
        const userResponse = await execMondayQuery('query { me { id email } }');
        
        if (!userResponse?.data?.me?.id) {
          console.error('❌ No Monday user found');
          setIsConnected(false);
          setConnectionError('No Monday user found');
          setIsLoading(false);
          return;
        }

        const mondayUserId = userResponse.data.me.id;
        console.log('✅ Monday user ID:', mondayUserId);

        // Create a Supabase client with service role for server-side operations
        const supabaseServiceRole = createClient(
          'https://tzgqqrphtppgxpfduecs.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Z3FxcnBodHBwZ3hwZmR1ZWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxNjkzNSwiZXhwIjoyMDcxMTkyOTM1fQ.dOFRx8mmZi-nDJBJKBuwE5ih5gh5z6coElkn0tEJq5s'
        );

        // Check if user has Google Sheets credentials in their profile
        const { data: profile, error: profileError } = await supabaseServiceRole
          .from('profiles')
          .select('google_sheets_credentials')
          .eq('monday_user_id', mondayUserId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('❌ Error fetching profile:', profileError);
          setIsConnected(false);
          setConnectionError('Failed to check connection status.');
          setIsLoading(false);
          return;
        }

        if (!profile?.google_sheets_credentials) {
          console.log('❌ No Google Sheets credentials found in profile');
          setIsConnected(false);
          setIsLoading(false);
          return;
        }

        console.log('✅ Google Sheets credentials found in profile');
        setIsConnected(true);
      } catch (mondayError) {
        console.error('❌ Monday API error:', mondayError);
        setIsConnected(false);
        setConnectionError('Failed to get Monday user information');
      }
    } catch (error) {
      console.error('❌ Connection check failed:', error);
      setIsConnected(false);
      setConnectionError('Failed to verify connection.');
    } finally {
      setIsLoading(false);
      console.log('🏁 Connection check completed');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    // Polling mechanism to check for OAuth results in localStorage
    const pollForOAuthResult = () => {
      const resultStr = localStorage.getItem('google_oauth_result');
      if (!resultStr) return;

      try {
        const result = JSON.parse(resultStr);
        const isRecent = Date.now() - result.timestamp < 30000; // 30 seconds

        if (!isRecent) {
          localStorage.removeItem('google_oauth_result');
          return;
        }

        console.log('🔄 Found OAuth result in localStorage:', result);
        
        // Clear the result so we don't process it again
        localStorage.removeItem('google_oauth_result');

        if (result.type === 'success' && result.code) {
          if (isExchangingTokens) {
            console.log('⏳ Already exchanging tokens, skipping');
            return;
          }

          console.log('🚀 Starting token exchange process');
          setIsExchangingTokens(true);
          toast({ title: 'Authorization successful!', description: 'Exchanging tokens...' });

          (async () => {
            try {
              console.log('📞 Calling edge function with code');
              // Get Monday user ID first
              const { execMondayQuery } = await import('@/utils/mondaySDK');
              const userResponse = await execMondayQuery('query { me { id email } }');
              
              if (!userResponse?.data?.me?.id) {
                throw new Error('Unable to get Monday user information');
              }

              const mondayUserId = userResponse.data.me.id;
              
              const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth-exchange', {
                body: { 
                  code: result.code,
                  monday_user_id: mondayUserId 
                }
              });

              if (exchangeError) {
                console.error('❌ Edge function error:', exchangeError);
                throw exchangeError;
              }

              console.log('✅ Token exchange successful:', data);
              toast({ title: 'Success!', description: 'Google Sheets connected successfully!' });
              
              setConnectionError(null);
              await checkConnection();
            } catch (error) {
              console.error('❌ Token exchange failed:', error);
              setConnectionError('Failed to exchange authorization code for tokens.');
              toast({
                title: 'Connection Error',
                description: 'Failed to complete the connection process.',
                variant: 'destructive',
              });
            } finally {
              setIsExchangingTokens(false);
            }
          })();

        } else if (result.type === 'error') {
          console.log('❌ OAuth error from popup:', result.error);
          setConnectionError(result.error || 'An unknown error occurred during authorization.');
          toast({
            title: 'Authorization Error',
            description: result.error || 'Failed to connect.',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('❌ Failed to parse OAuth result:', err);
        localStorage.removeItem('google_oauth_result');
      }
    };

    // Poll every 500ms for OAuth results
    const interval = setInterval(pollForOAuthResult, 500);
    
    // Also check immediately
    pollForOAuthResult();

    return () => clearInterval(interval);
  }, [toast, checkConnection, isExchangingTokens]);


  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      if (!isEmbeddedMode()) {
        throw new Error('Not running in Monday.com embedded mode');
      }

      // Get Monday user ID first
      const { execMondayQuery } = await import('@/utils/mondaySDK');
      const userResponse = await execMondayQuery('query { me { id email } }');
      
      if (!userResponse?.data?.me?.id) {
        throw new Error('Unable to get Monday user information');
      }

      const mondayUserId = userResponse.data.me.id;
      console.log('✅ Monday user ID for connection:', mondayUserId);

      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      if (error) throw error;

      const redirectUri = `${window.location.origin}/google-oauth`;
      const scope = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${data.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&prompt=consent&` +
        `state=${encodeURIComponent(mondayUserId)}`;

      const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600');
      if (!popup) {
          throw new Error('Popup blocked. Please allow popups.');
      }
      popup.focus();
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to start connection.');
      toast({
          title: 'Connection Error',
          description: err.message || 'Could not start the connection process.',
          variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Checking connection...</span>
        </div>
      );
    }
    
    if (isConnected) {
      return (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-2 text-green-600 text-lg font-medium">
            <CheckCircle className="h-6 w-6" />
            <span>Connected to Google Sheets</span>
          </div>
          <Button onClick={checkConnection} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Connection
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Button onClick={handleConnect} className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white" size="lg">
          <span>Connect Google Sheets</span>
        </Button>
        {connectionError && (
            <Alert variant="destructive" className="w-full">
                <Info className="h-4 w-4" />
                <AlertTitle>Connection Issue</AlertTitle>
                <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
        )}
      </div>
    );
  };
  
  return (
    <Card className="w-full p-6 shadow-lg">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.07 8.93l-4-4A1 1 0 0014 4.5H7a2.5 2.5 0 00-2.5 2.5v10A2.5 2.5 0 007 19.5h10a2.5 2.5 0 002.5-2.5V9.5a1 1 0 00-.43-.57zM14 5.5l3.5 3.5H14z" fill="#0F9D58"/>
            <path d="M14 12.75H8.5v-1.5H14zM16 15.5H8.5V14H16z" fill="#FFFFFF"/>
          </svg>
          <h2 className="text-2xl font-bold">Connect to Google Sheets</h2>
        </div>
        
        {renderContent()}

        <div className="text-sm text-gray-500 mt-4 text-center">
          <p>Connecting allows you to automatically export data from your monday.com boards to Google Sheets.</p>
        </div>
      </div>
    </Card>
  );
}
