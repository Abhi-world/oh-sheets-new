import { useState, useEffect, useCallback } from 'react';
import { googleSheetsService } from '@/integrations/google/sheets';
import { supabase } from '@/integrations/supabase/client';
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
    setIsLoading(true);
    setConnectionError(null);
    try {
      const hasStoredCredentials = await googleSheetsService.initializeWithStoredCredentials();
      if (!hasStoredCredentials) {
        setIsConnected(false);
        setIsLoading(false);
        return;
      }
      
      const accessToken = await googleSheetsService.getAccessToken();
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=1`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
        setConnectionError('Your connection has expired. Please reconnect.');
        localStorage.removeItem('google_sheets_tokens');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError('Failed to verify connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log('🔄 Received postMessage:', {
        origin: event.origin,
        windowOrigin: window.location.origin,
        data: event.data,
        type: event.data?.type
      });

      // Allow messages from popup (different origin in Monday.com iframe)
      if (!event.data?.type?.startsWith('GOOGLE_OAUTH_')) {
        console.log('❌ Ignoring non-Google OAuth message, type:', event.data?.type);
        return;
      }

      console.log('✅ Processing Google OAuth message:', event.data.type);

      if (event.data?.type === 'GOOGLE_OAUTH_SUCCESS') {
        // Prevent duplicate token exchanges
        setIsExchangingTokens(current => {
          if (current) {
            console.log('⏳ Already exchanging tokens, skipping duplicate request');
            return current;
          }
          
          console.log('🚀 Starting token exchange process');
          toast({ title: 'Authorization successful!', description: 'Exchanging tokens...' });
          
          const { code } = event.data;
          if (!code) {
            setConnectionError('Authorization code not received.');
            return false;
          }

          // Start token exchange
          (async () => {
            try {
              console.log('📞 Calling edge function with code');
              const { data, error: exchangeError } = await supabase.functions.invoke('google-oauth-exchange', {
                body: { code }
              });

              if (exchangeError) {
                console.error('❌ Edge function error:', exchangeError);
                throw exchangeError;
              }

              console.log('✅ Token exchange successful:', data);
              toast({ title: 'Success!', description: 'Google Sheets connected successfully!' });
              
              // Clear any previous errors
              setConnectionError(null);
              
              // Check connection status
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
          
          return true;
        });
      } else if (event.data?.type === 'GOOGLE_OAUTH_ERROR') {
        console.log('❌ OAuth error received:', event.data.error);
        setConnectionError(event.data.error || 'An unknown error occurred during authorization.');
        toast({
            title: 'Authorization Error',
            description: event.data.error || 'Failed to connect.',
            variant: 'destructive',
        });
      }
    };

    console.log('📡 Setting up message listener');
    window.addEventListener('message', handleMessage);
    return () => {
      console.log('🧹 Cleaning up message listener');
      window.removeEventListener('message', handleMessage);
    };
  }, [toast, checkConnection]);


  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      if (error) throw error;

      const redirectUri = `${window.location.origin}/google-oauth`;
      const scope = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${data.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&prompt=consent`;

      if (isEmbeddedMode()) {
        const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600');
        if (!popup) {
            throw new Error('Popup blocked. Please allow popups.');
        }
        popup.focus();
      } else {
        window.location.href = authUrl;
      }
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
