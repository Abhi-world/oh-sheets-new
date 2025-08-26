import { useState, useEffect } from 'react';
import { googleSheetsService } from '@/integrations/google/sheets';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw, ExternalLink } from 'lucide-react';
import { isEmbeddedMode, getMondaySDK } from '@/utils/mondaySDK';

export function GoogleSheetsConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    
    // Enhanced OAuth completion detection
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 Storage change detected:', e.key, e.newValue);
      
      if (e.key === 'google_oauth_status') {
        if (e.newValue === 'success') {
          console.log('✅ OAuth success detected via localStorage');
          setIsWaitingForAuth(false);
          setIsConnecting(false);
          setConnectionError(null);
          
          // Clear all OAuth-related localStorage items
          localStorage.removeItem('google_oauth_success');
          localStorage.removeItem('google_oauth_status');
          localStorage.removeItem('google_oauth_timestamp');
          
          // Check connection with a delay to ensure tokens are saved
          setTimeout(() => {
            checkConnection();
          }, 2000);
          
          toast({
            title: 'Success',
            description: 'Google Sheets connected successfully!',
          });
        } else if (e.newValue === 'error') {
          console.log('❌ OAuth error detected via localStorage');
          setIsWaitingForAuth(false);
          setIsConnecting(false);
          const errorMsg = localStorage.getItem('google_oauth_error') || 'Unknown error';
          
          // Clear error items
          localStorage.removeItem('google_oauth_error');
          localStorage.removeItem('google_oauth_status');
          
          setConnectionError(`OAuth error: ${errorMsg}`);
          toast({
            title: 'Authorization Error',
            description: `OAuth failed: ${errorMsg}`,
            variant: 'destructive'
          });
        }
      }
    };

    const handleMessage = (event: MessageEvent) => {
      // Filter out non-OAuth messages
      if (!event.data || typeof event.data !== 'object') {
        return;
      }
      
      // Only process messages with valid OAuth structure
      if (!event.data.type || typeof event.data.type !== 'string') {
        return;
      }
      
      console.log('🔄 Received valid postMessage:', {
        type: event.data.type,
        timestamp: event.data.timestamp,
        source: event.data.source,
        origin: event.origin
      });
      
      if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
        console.log('✅ OAuth success via postMessage');
        setIsWaitingForAuth(false);
        setIsConnecting(false);
        setConnectionError(null);
        
        // Retrieve tokens from Supabase and store in localStorage
        setTimeout(async () => {
          await retrieveAndStoreTokens();
          checkConnection();
        }, 2000);
        
        toast({
          title: 'Success', 
          description: 'Google Sheets connected successfully!',
        });
        
      } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
        console.log('❌ OAuth error via postMessage');
        setIsWaitingForAuth(false);
        setIsConnecting(false);
        const errorMsg = event.data.error || 'Unknown error';
        setConnectionError(`OAuth error: ${errorMsg}`);
        toast({
          title: 'Authorization Error',
          description: `OAuth failed: ${errorMsg}`,
          variant: 'destructive'
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);

    // Robust polling mechanism for OAuth completion
    let oauthPollingInterval: NodeJS.Timeout | null = null;
    
    const startOAuthPolling = () => {
      if (oauthPollingInterval) return;
      
      console.log('🔄 Starting OAuth polling...');
      let pollAttempts = 0;
      const maxAttempts = 150; // 5 minutes at 2-second intervals
      
      oauthPollingInterval = setInterval(() => {
        pollAttempts++;
        
        // Check localStorage for OAuth status
        const oauthStatus = localStorage.getItem('google_oauth_status');
        const oauthSuccess = localStorage.getItem('google_oauth_success');
        const oauthError = localStorage.getItem('google_oauth_error');
        
        if (oauthStatus === 'success' || oauthSuccess) {
          console.log('✅ OAuth success found in polling');
          setIsWaitingForAuth(false);
          setConnectionError(null);
          
          // Clean up localStorage
          localStorage.removeItem('google_oauth_success');
          localStorage.removeItem('google_oauth_status');
          localStorage.removeItem('google_oauth_timestamp');
          localStorage.removeItem('google_oauth_error');
          
          clearInterval(oauthPollingInterval!);
          oauthPollingInterval = null;
          
          // Check connection with delay
        setTimeout(async () => {
          await retrieveAndStoreTokens();  
          checkConnection();
        }, 2000);
          
          toast({
            title: 'Success',
            description: 'Google Sheets connected successfully!',
          });
          
        } else if (oauthStatus === 'error' || oauthError) {
          console.log('❌ OAuth error found in polling');
          setIsWaitingForAuth(false);
          const errorMsg = oauthError || 'OAuth failed';
          
          // Clean up localStorage
          localStorage.removeItem('google_oauth_error');
          localStorage.removeItem('google_oauth_status');
          localStorage.removeItem('google_oauth_success');
          localStorage.removeItem('google_oauth_timestamp');
          
          clearInterval(oauthPollingInterval!);
          oauthPollingInterval = null;
          
          setConnectionError(`OAuth error: ${errorMsg}`);
          toast({
            title: 'Authorization Error',
            description: `OAuth failed: ${errorMsg}`,
            variant: 'destructive'
          });
          
        } else if (pollAttempts >= maxAttempts) {
          console.log('⏰ OAuth polling timeout');
          clearInterval(oauthPollingInterval!);
          oauthPollingInterval = null;
          setIsWaitingForAuth(false);
          setConnectionError('OAuth timeout - please try again');
          toast({
            title: 'Timeout',
            description: 'OAuth process took too long. Please try again.',
            variant: 'destructive'
          });
        }
      }, 2000); // Check every 2 seconds
    };

    // Start polling when waiting for auth
    if (isWaitingForAuth) {
      startOAuthPolling();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      if (oauthPollingInterval) {
        clearInterval(oauthPollingInterval);
      }
    };
  }, [isWaitingForAuth]);

  async function retrieveAndStoreTokens() {
    try {
      console.log('🔄 Attempting to retrieve tokens from Supabase...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user to retrieve tokens for');
        return false;
      }

      console.log('✅ Found authenticated user:', user.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_sheets_credentials')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        return false;
      }

      console.log('📄 Profile data:', profile);
      
      if (profile?.google_sheets_credentials) {
        const credentials = profile.google_sheets_credentials as any;
        console.log('🔑 Found credentials in profile:', Object.keys(credentials));
        
        // Store tokens in the format expected by GoogleSheetsService
        const tokens = {
          access_token: credentials.access_token,
          refresh_token: credentials.refresh_token,
          expires_in: credentials.expires_in,
          expiry_date: new Date(credentials.created_at).getTime() + (credentials.expires_in * 1000)
        };
        
        localStorage.setItem('google_sheets_tokens', JSON.stringify(tokens));
        console.log('✅ Tokens stored in localStorage:', tokens);
        return true;
      }
      
      console.log('❌ No Google Sheets credentials found in profile');
      return false;
    } catch (error) {
      console.error('❌ Error retrieving tokens from Supabase:', error);
      return false;
    }
  }

  async function checkConnection() {
    try {
      setConnectionError(null);
      const hasStoredCredentials = await googleSheetsService.initializeWithStoredCredentials();
      
      if (hasStoredCredentials) {
        // Verify the connection by attempting to fetch spreadsheets
        try {
          const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.spreadsheet\'', {
            headers: {
              'Authorization': `Bearer ${await googleSheetsService.getAccessToken()}`,
              'Accept': 'application/json',
            },
          });
          
          if (!response.ok) {
            throw new Error(`Google API error: ${response.status} ${response.statusText}`);
          }
          
          console.log('Successfully verified Google Sheets connection');
          setIsConnected(true);
        } catch (verifyError) {
          console.error('Error verifying Google Sheets connection:', verifyError);
          // If verification fails, we need to reconnect
          setIsConnected(false);
          setConnectionError('Your Google Sheets connection needs to be refreshed. Please reconnect.');
          toast({
            title: 'Connection Issue',
            description: 'Your Google Sheets connection needs to be refreshed. Please reconnect.',
            variant: 'destructive'
          });
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Google Sheets connection:', error);
      setIsConnected(false);
      setConnectionError('Failed to check Google Sheets connection. Please try again.');
    }
  }

  async function handleConnect() {
    try {
      setIsConnecting(true);
      setConnectionError(null);
      
      // Get Google Client ID from backend
      const response = await supabase.functions.invoke('get-google-client-id');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      const { clientId } = response.data;
      const redirectUri = `${window.location.origin}/google-oauth`;
      const scope = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
      
      // Store current page as state for redirect after OAuth
      const currentPath = window.location.pathname + window.location.search;
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(currentPath)}`;
      
      // Check if we're in Monday embedded mode
      if (isEmbeddedMode()) {
        console.log('🚀 Opening OAuth popup (Monday embedded mode)');
        setIsWaitingForAuth(true);
        
        // Always use popup for proper communication
        const popup = window.open(
          authUrl, 
          'google-oauth-popup', 
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups and try again.');
        }
        
        console.log('✅ Popup opened successfully');
        
        // Monitor popup for closure without success
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            console.log('🔄 Popup was closed');
            
            // Give a brief delay for any pending messages
            setTimeout(() => {
              if (isWaitingForAuth) {
                console.log('⚠️ Popup closed without success message');
                setIsWaitingForAuth(false);
                setIsConnecting(false);
                // Don't show error toast here as user might have just cancelled
              }
            }, 1000);
          }
        }, 1000);
        
      } else {
        // Regular redirect for non-embedded mode
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Google Sheets:', error);
      setConnectionError('Failed to connect to Google Sheets. Please try again.');
      setIsWaitingForAuth(false);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect to Google Sheets. Please try again.',
        variant: 'destructive'
      });
    } finally {
      if (!isEmbeddedMode()) {
        setIsConnecting(false);
      }
      // Don't set isConnecting to false in embedded mode here, 
      // let the success/error handlers do it
    }
  }
  
  async function handleRefreshConnection() {
    setIsRefreshing(true);
    try {
      await checkConnection();
      toast({
        title: 'Connection Refreshed',
        description: isConnected ? 'Google Sheets connection is active.' : 'Please reconnect to Google Sheets.',
      });
    } catch (error) {
      console.error('Error refreshing connection:', error);
      toast({
        title: 'Refresh Error',
        description: 'Failed to refresh connection status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRefreshing(false);
    }
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
          <Alert className="w-full border-yellow-500 bg-yellow-500/10">
            <Info className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}
        
        {isConnected ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-green-600 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Connected to Google Sheets</span>
            </div>
            
            <Button
              onClick={handleRefreshConnection}
              disabled={isRefreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Connection
            </Button>
          </div>
        ) : isWaitingForAuth ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center gap-2 text-blue-600">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Waiting for authorization...</span>
            </div>
            
            <Alert className="w-full border-blue-500 bg-blue-500/10">
              <ExternalLink className="h-4 w-4 text-blue-500" />
              <AlertTitle>Authorization in Progress</AlertTitle>
              <AlertDescription>
                A new tab has opened for Google authorization. Please complete the process there and then return to this page.
                The connection will be automatically completed once you authorize.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => {
                setIsWaitingForAuth(false);
                checkConnection();
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Check Connection Status
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
            size="lg"
          >
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
               >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 10-5.656-5.656l-1.102 1.101"
                  />
                </svg>
                <span>Connect Google Sheets</span>
              </>
            )}
          </Button>
        )}
        
        {/* Always show check connection button for debugging */}
        {!isConnected && !isWaitingForAuth && (
          <Button
            onClick={() => {
              console.log('🔍 Manual connection check requested');
              checkConnection();
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Check Connection Status
          </Button>
        )}
        
        <div className="text-sm text-gray-500 mt-4 text-center">
          <p>Connecting to Google Sheets allows you to automatically export data from Monday.com boards.</p>
          <p className="mt-1">Your connection is secure and you can disconnect at any time.</p>
        </div>
      </div>
    </Card>
  );
}