// In src/components/GoogleSheetsConnect.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js'; // For admin client
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { isEmbeddedMode, execMondayQuery } from '@/utils/mondaySDK';

export function GoogleSheetsConnect() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    console.log('🔄 [checkConnection] Starting...');
    setIsLoading(true);
    setConnectionError(null);

    try {
      if (!isEmbeddedMode()) {
        throw new Error('This app must be run inside Monday.com.');
      }

      const userResponse = await execMondayQuery(`query { me { id } }`);
      const mondayUserId = userResponse?.data?.me?.id;

      if (!mondayUserId) {
        throw new Error('Could not retrieve Monday.com user information.');
      }
      
      const { data, error } = await supabase.functions.invoke('check-google-connection', {
        body: { monday_user_id: String(mondayUserId) }
      });

      if (error) throw error;

      if (data?.connected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (err: any) {
      console.error('❌ [checkConnection] Failed:', err);
      setConnectionError(err.message || 'An unknown error occurred.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exchangeCodeForTokens = useCallback(async (code: string) => {
    setIsAuthorizing(true);
    toast({ title: 'Authorization successful', description: 'Finalizing connection...' });
    try {
        const userResponse = await execMondayQuery(`query { me { id } }`);
        const mondayUserId = userResponse?.data?.me?.id;
        if (!mondayUserId) {
            throw new Error('Could not retrieve Monday.com user to link account.');
        }
        
        const { error } = await supabase.functions.invoke('google-oauth-exchange', {
            body: { code, monday_user_id: String(mondayUserId) }
        });
        
        if (error) throw error;

        toast({ title: 'Success!', description: 'Google Sheets connected successfully!' });
        await checkConnection();
    } catch (err: any)
    {
        setConnectionError(err.message || 'Failed to finalize connection.');
        toast({
            title: 'Connection Error',
            description: err.message || 'Could not complete the connection.',
            variant: 'destructive',
        });
    } finally {
        setIsAuthorizing(false);
    }
  }, [checkConnection, toast]);

  useEffect(() => {
    checkConnection();

    const handleOAuthResult = () => {
        const resultStr = localStorage.getItem('google_oauth_result');
        if (!resultStr) return;

        localStorage.removeItem('google_oauth_result');

        try {
            const result = JSON.parse(resultStr);
            if (Date.now() - result.timestamp > 60000) return; // 1 minute expiry

            if (result.type === 'success' && result.code) {
                exchangeCodeForTokens(result.code);
            } else if (result.type === 'error') {
                throw new Error(result.error || 'Authorization failed in popup.');
            }
        } catch (err: any) {
            setConnectionError(err.message);
            toast({ title: 'Authorization Error', description: err.message, variant: 'destructive' });
        }
    };

    // Add event listener for postMessage from popup window
    const handlePostMessage = (event: MessageEvent) => {
        console.log('📨 [GoogleSheetsConnect] Received postMessage:', event);
        
        // Accept messages from any origin since we're in an iframe
        // Process the message data
        if (event.data && event.data.type === 'google_oauth_result') {
            const result = event.data.payload;
            console.log('📨 [GoogleSheetsConnect] Processing OAuth result from postMessage:', result);
            
            if (result.type === 'success' && result.code) {
                console.log('✅ [GoogleSheetsConnect] Success result from postMessage, exchanging code');
                exchangeCodeForTokens(result.code);
            } else if (result.type === 'error') {
                console.log('❌ [GoogleSheetsConnect] Error result from postMessage:', result.error);
                setConnectionError(result.error || 'Authorization failed in popup.');
                toast({ 
                    title: 'Authorization Error', 
                    description: result.error || 'Authorization failed in popup.', 
                    variant: 'destructive' 
                });
            }
        }
    };

    window.addEventListener('message', handlePostMessage);
    const intervalId = setInterval(handleOAuthResult, 500);
    
    return () => {
        clearInterval(intervalId);
        window.removeEventListener('message', handlePostMessage);
    };
  }, [checkConnection, exchangeCodeForTokens, toast]);


  const handleConnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const userResponse = await execMondayQuery('query { me { id } }');
      const mondayUserId = userResponse?.data?.me?.id;
      if (!mondayUserId) throw new Error('Could not get Monday.com user to initiate connection.');

      const { data, error } = await supabase.functions.invoke('get-google-client-id');
      if (error) throw error;

      // *** THIS IS THE FIX ***
      // We hardcode the exact redirect URI that is registered in the Google Cloud Console.
      // This prevents the iframe from creating a mismatched "monday.com" URL.
      const redirectUri = 'https://funny-otter-9faa67.netlify.app/google-oauth';
      
      console.log('🔗 [handleConnect] Using hardcoded redirect URI:', redirectUri);
      
      const scope = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly";
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${data.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&prompt=consent&` +
        `state=${encodeURIComponent(mondayUserId)}`;

      // Set up message listener before opening popup
      const messageHandler = (event: MessageEvent) => {
        console.log('📩 [handleConnect] Received message:', event);
        if (event.data && event.data.type === 'google_oauth_result') {
          const result = event.data.payload;
          if (result.type === 'success' && result.code) {
            console.log('✅ [handleConnect] Success message received with code');
            exchangeCodeForTokens(result.code);
          }
          // Remove the listener after receiving a message
          window.removeEventListener('message', messageHandler);
        }
      };
      
      // Add the message listener
      window.addEventListener('message', messageHandler);

      const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600');
      if (!popup) {
        window.removeEventListener('message', messageHandler);
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Set a timeout to remove the listener if no message is received
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
      }, 300000); // 5 minutes timeout

    } catch (err: any) {
      setConnectionError(err.message || 'Failed to start connection.');
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const userResponse = await execMondayQuery(`query { me { id } }`);
      const mondayUserId = userResponse?.data?.me?.id;
      if (!mondayUserId) throw new Error('Could not get Monday.com user to disconnect.');
      
      // IMPORTANT: This requires setting up Row Level Security (RLS) in Supabase
      // to ensure a user can only update their own profile.
      const { error } = await supabase
        .from('profiles')
        .update({ google_sheets_credentials: null })
        .eq('monday_user_id', String(mondayUserId));
      
      if (error) throw error;

      toast({ 
        title: 'Disconnected', 
        description: 'Google Sheets has been disconnected successfully.' 
      });
      
      setIsConnected(false);
    } catch (err: any) {
      setConnectionError(err.message || 'Failed to disconnect.');
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to disconnect Google Sheets.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // The rest of your component's return statement (JSX) remains the same...
  // ... (pasting the render logic for brevity)
    const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center gap-2 text-gray-500"><RefreshCw className="h-5 w-5 animate-spin" /><span>Checking connection...</span></div>;
    }
    if (isAuthorizing) {
        return <div className="flex items-center gap-2 text-gray-500"><RefreshCw className="h-5 w-5 animate-spin" /><span>Finalizing connection...</span></div>;
    }
    if (isConnected) {
      return (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-2 text-green-600 text-lg font-medium"><CheckCircle className="h-6 w-6" /><span>Connected to Google Sheets</span></div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/')} className="flex items-center gap-2">
              Continue to Recipes <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={checkConnection} variant="outline" className="flex items-center gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
          </div>
          <div className="mt-4">
            <Button 
              onClick={handleDisconnect} 
              variant="outline" 
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Disconnect Google Sheets
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Button onClick={handleConnect} disabled={isLoading || isAuthorizing} className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white" size="lg">Connect Google Sheets</Button>
        {connectionError && (<Alert variant="destructive" className="w-full"><Info className="h-4 w-4" /><AlertTitle>Connection Issue</AlertTitle><AlertDescription>{connectionError}</AlertDescription></Alert>)
        }
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