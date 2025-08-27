import { useState, useEffect } from 'react';
import { googleSheetsService } from '@/integrations/google/sheets';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw, ExternalLink } from 'lucide-react';
import { isEmbeddedMode } from '@/utils/mondaySDK';

export function GoogleSheetsConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);
  const { toast } = useToast();

  // Unified function to handle the result of the OAuth flow
  const handleAuthCompletion = async (status: 'success' | 'error', message?: string) => {
    setIsWaitingForAuth(false);
    setIsConnecting(false);

    if (status === 'success') {
      setConnectionError(null);
      toast({
        title: 'Success',
        description: 'Google Sheets connected successfully!',
      });
      // Retrieve tokens from Supabase and then verify the connection
      const tokensStored = await retrieveAndStoreTokens();
      if (tokensStored) {
        await checkConnection();
      } else {
        setIsConnected(false);
        setConnectionError('Could not retrieve credentials after authorization.');
        toast({
          title: 'Error',
          description: 'Failed to retrieve credentials. Please try connecting again.',
          variant: 'destructive',
        });
      }
    } else {
      const errorMsg = message || 'Unknown OAuth error';
      setConnectionError(`Authorization failed: ${errorMsg}`);
      toast({
        title: 'Authorization Error',
        description: `OAuth failed: ${errorMsg}`,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    // Initial connection check on component mount
    checkConnection();

    // Single, reliable listener for OAuth popup communication
    const handleMessage = (event: MessageEvent) => {
      // SECURITY: Always validate the message origin
      if (event.origin !== window.location.origin) {
        console.warn(`Blocked a message from an untrusted origin: ${event.origin}`);
        return;
      }

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        console.log('✅ OAuth success via postMessage');
        handleAuthCompletion('success');
      } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
        console.log('❌ OAuth error via postMessage', event.data.error);
        handleAuthCompletion('error', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  async function retrieveAndStoreTokens() {
    try {
      console.log('🔄 Attempting to retrieve tokens from Supabase...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user to retrieve tokens for.');
        return false;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_sheets_credentials')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return false;
      }

      if (profile?.google_sheets_credentials) {
        const credentials = profile.google_sheets_credentials as any;
        if (!credentials.access_token || !credentials.refresh_token) {
          console.log('❌ Incomplete credentials found in profile.');
          return false;
        }

        const tokens = {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          expiry_date: credentials.expiry_date,
        };

        localStorage.setItem('google_sheets_tokens', JSON.stringify(tokens));
        console.log('✅ Tokens stored in localStorage.');
        return true;
      }
      
      console.log('❌ No Google Sheets credentials found in profile.');
      return false;
    } catch (error) {
      console.error('❌ Critical error in retrieveAndStoreTokens:', error);
      return false;
    }
  }

  async function checkConnection() {
    setConnectionError(null);
    try {
      const hasStoredCredentials = await googleSheetsService.initializeWithStoredCredentials();
      
      if (hasStoredCredentials) {
        // Verify the token is still valid by making a simple API call
        const accessToken = await googleSheetsService.getAccessToken();
        if (!accessToken) {
            throw new Error("Could not retrieve access token.");
        }
        
        const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.spreadsheet\'&pageSize=1', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Successfully verified Google Sheets connection.');
          setIsConnected(true);
        } else {
          // This handles cases where the token is stored but expired/revoked
          throw new Error(`Token verification failed: ${response.statusText}`);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Google Sheets connection:', error);
      setIsConnected(false);
      // Don't show an error on initial load if not connected, only on failures
      if (localStorage.getItem('google_sheets_tokens')) {
        setConnectionError('Connection invalid. Please reconnect.');
      }
    }
  }

  async function handleConnect() {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      if (error) throw new Error(error.message);

      const { clientId } = data;
      const redirectUri = `${window.location.origin}/google-oauth`;
      const scope = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
      const state = encodeURIComponent(window.location.pathname + window.location.search);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      if (isEmbeddedMode()) {
        setIsWaitingForAuth(true);
        const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600,scrollbars=yes,resizable=yes');
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }
      } else {
        window.location.href = authUrl;
      }
    } catch (error: any) {
      console.error('Error initiating connection:', error);
      const errorMessage = error.message || 'Failed to start the connection process.';
      setConnectionError(errorMessage);
      toast({
        title: 'Connection Error',
        description: errorMessage,
        variant: 'destructive'
      });
      setIsConnecting(false);
      setIsWaitingForAuth(false);
    }
  }

  async function handleRefreshConnection() {
    setIsRefreshing(true);
    await checkConnection();
    setIsRefreshing(false);
    toast({
      title: 'Connection Refreshed',
      description: isConnected ? 'Google Sheets connection is active.' : 'Could not connect. Please try again.',
    });
  }

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
        
        {connectionError && (
          <Alert variant="destructive" className="w-full">
            <Info className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
        
        {isConnected ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-green-600 text-lg font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Connected to Google Sheets</span>
            </div>
            <Button onClick={handleRefreshConnection} disabled={isRefreshing} variant="outline" className="flex items-center gap-2">
              {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh Connection
            </Button>
          </div>
        ) : isWaitingForAuth ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-blue-600">
              <RefreshCw className="animate-spin h-5 w-5" />
              <span>Waiting for authorization...</span>
            </div>
            <Alert className="w-full border-blue-500 bg-blue-500/10">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <AlertTitle>Complete Authorization</AlertTitle>
              <AlertDescription>
                A popup window has opened. Please complete the sign-in process there. This window will update automatically.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white" size="lg">
            {isConnecting ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4" />
                <span>Connecting...</span>
              </>
            ) : (
              <span>Connect Google Sheets</span>
            )}
          </Button>
        )}
        
        <div className="text-sm text-gray-500 mt-4 text-center">
          <p>Connecting allows you to automatically export data from your monday.com boards to Google Sheets.</p>
        </div>
      </div>
    </Card>
  );
}