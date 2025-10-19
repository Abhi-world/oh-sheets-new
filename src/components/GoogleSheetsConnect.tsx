// In src/components/GoogleSheetsConnect.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js'; // For admin client
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { isEmbeddedMode, execMondayQuery } from '@/utils/mondaySDK';

// Helper function to normalize errors before showing in UI/toast
const toMsg = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (typeof (err as any).message === 'string') return (err as any).message;
  try { return JSON.stringify(err); } catch { return 'Unexpected error'; }
};

export function GoogleSheetsConnect() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [forceReconnect, setForceReconnect] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [noSpreadsheetsFound, setNoSpreadsheetsFound] = useState(false);
  const { toast } = useToast();

  const checkConnection = useCallback(async () => {
    console.log('🔄 [checkConnection] Starting...');
    setIsLoading(true);
    setConnectionError(null);
    setNoSpreadsheetsFound(false);

    try {
      if (!isEmbeddedMode()) {
        throw new Error('This app must be run inside Monday.com.');
      }

      // Use a try-catch block to handle potential circular structure errors
      let mondayUserId;
      try {
        const userResponse = await execMondayQuery(`query { me { id } }`);
        mondayUserId = userResponse?.data?.me?.id;
      } catch (err) {
        console.error('Error executing Monday query:', err);
        throw new Error('Failed to retrieve Monday.com user information.');
      }

      if (!mondayUserId) {
        throw new Error('Could not retrieve Monday.com user information.');
      }
      
      // If force reconnect is enabled, skip the connection check
      if (forceReconnect) {
        setIsConnected(false);
        setForceReconnect(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-google-connection', {
        body: { monday_user_id: String(mondayUserId) }
      });

      if (error) throw error;

      if (data?.connected) {
        setIsConnected(true);
        
        // Check if we can fetch spreadsheets to verify OAuth scopes
        try {
          console.log('🔍 Checking if spreadsheets can be fetched...');
          const { data: sheetsData, error: sheetsError } = await supabase.functions.invoke('gs-list-spreadsheets', {
            body: { monday_user_id: String(mondayUserId) }
          });
          
          if (sheetsError) throw sheetsError;
          
          // If no spreadsheets are returned, it might be an OAuth scope issue
          if (!sheetsData?.spreadsheets || sheetsData.spreadsheets.length === 0) {
            console.log('⚠️ No spreadsheets found - likely an OAuth scope issue');
            setNoSpreadsheetsFound(true);
          } else {
            console.log('✅ Spreadsheets found:', sheetsData.spreadsheets.length);
            setNoSpreadsheetsFound(false);
          }
        } catch (sheetsErr) {
          const msg = toMsg(sheetsErr);
          console.error('❌ Sheets fetch error details:', msg);
          setConnectionError(`Fetch failed: ${msg}`);
          setNoSpreadsheetsFound(true);
          // Don't throw here, we still want to show connected state
        }
      } else {
        setIsConnected(false);
      }
    } catch (err) {
      const msg = toMsg(err);
      console.error('❌ [checkConnection] Failed:', msg);
      setConnectionError(msg);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [forceReconnect]);

  // Create a ref to track if a token exchange is in progress
  const isExchangingRef = useRef(false);
  
  const exchangeCodeForTokens = useCallback(async (code: string) => {
    // Prevent duplicate calls with a lock mechanism
    if (isExchangingRef.current) {
      console.log('🔒 [exchangeCodeForTokens] Token exchange already in progress, skipping duplicate call');
      return;
    }
    
    // Set the lock
    isExchangingRef.current = true;
    console.log('🔒 [exchangeCodeForTokens] Setting exchange lock, preventing duplicate calls');
    
    setIsAuthorizing(true);
    toast({ title: 'Authorization successful', description: 'Finalizing connection...' });
    try {
        // Safely get Monday user ID with error handling for circular structure
        let mondayUserId;
        try {
            const userResponse = await execMondayQuery(`query { me { id } }`);
            mondayUserId = userResponse?.data?.me?.id;
        } catch (err) {
            console.error('Error executing Monday query:', err);
            throw new Error('Failed to retrieve Monday.com user information.');
        }
        
        if (!mondayUserId) {
            throw new Error('Could not retrieve Monday.com user to link account.');
        }
        
        console.log('🔄 [exchangeCodeForTokens] Calling google-oauth-exchange function');
        const { error } = await supabase.functions.invoke('google-oauth-exchange', {
            body: { code, monday_user_id: String(mondayUserId) }
        });
        
        if (error) throw error;

        toast({ title: 'Success!', description: 'Google Sheets connected successfully!' });
        await checkConnection();
    } catch (err)
    {
        const msg = toMsg(err);
        setConnectionError(msg);
        toast({
            title: 'Connection Error',
            description: msg,
            variant: 'destructive',
        });
    } finally {
        setIsAuthorizing(false);
        
        // Release the lock after a delay to ensure any potential duplicate calls have been processed
        setTimeout(() => {
          isExchangingRef.current = false;
          console.log('🔓 [exchangeCodeForTokens] Releasing exchange lock after delay');
        }, 3000);
    }
  }, [checkConnection, toast]);

  useEffect(() => {
    checkConnection();

    const handleOAuthResult = () => {
        const raw = localStorage.getItem('google_oauth_result');
        if (!raw) return;
        localStorage.removeItem('google_oauth_result');

        let result: any;
        try { 
            result = JSON.parse(raw); 
            if (result?.type !== 'google_oauth_result') return;
            if (typeof result.timestamp !== 'number' || Date.now() - result.timestamp > 60000) return;

            if (typeof result.code === 'string' && result.code) {
                exchangeCodeForTokens(result.code);
            } else if (result.error) {
                const msg = toMsg(result.error);
                setConnectionError(msg);
                toast({ title: 'Authorization Error', description: msg, variant: 'destructive' });
            }
        } catch (err) {
            const msg = toMsg(err);
            setConnectionError(msg);
            toast({ title: 'Authorization Error', description: msg, variant: 'destructive' });
        }
    };

    // Add event listener for postMessage from popup window
    const handlePostMessage = (evt: MessageEvent) => {
        // Never log the entire MessageEvent (contains circular window refs)
        console.log('📨 [GoogleSheetsConnect] origin:', evt.origin);

        // Accept only our message type and ensure payload is plain JSON
        const data = evt?.data;
        if (!data || data.type !== 'google_oauth_result') return;

        // Some popups send { type, payload: { ... } }, others send fields at top-level.
        const result = typeof data.payload === 'object' && data.payload
            ? data.payload
            : data;

        // Log only primitives
        console.log('📨 [GoogleSheetsConnect] type:', result.type);
        console.log('📨 [GoogleSheetsConnect] hasCode:', Boolean(result.code));
        console.log('📨 [GoogleSheetsConnect] hasError:', Boolean(result.error));

        if (result.type === 'success' && typeof result.code === 'string' && result.code) {
            exchangeCodeForTokens(result.code);
            return;
        }

        if (result.type === 'error') {
            const msg = typeof result.error === 'string' ? result.error : 'Authorization failed in popup.';
            setConnectionError(msg);
            toast({ title: 'Authorization Error', description: msg, variant: 'destructive' });
        }
    };

    window.addEventListener('message', handlePostMessage);
    const intervalId = setInterval(handleOAuthResult, 500);
    
    return () => {
        clearInterval(intervalId);
        window.removeEventListener('message', handlePostMessage);
    };
  }, [checkConnection, exchangeCodeForTokens, toast]);


  const handleConnect = async (forceConsent = false) => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // Safely get Monday user ID with error handling for circular structure
      let mondayUserId;
      try {
        const userResponse = await execMondayQuery('query { me { id } }');
        mondayUserId = userResponse?.data?.me?.id;
      } catch (err) {
        console.error('Error executing Monday query:', err);
        throw new Error('Failed to retrieve Monday.com user information.');
      }
      
      if (!mondayUserId) throw new Error('Could not get Monday.com user to initiate connection.');

      // Use the new google-oauth-init Edge Function to get the auth URL with correct scopes
      const { data, error } = await supabase.functions.invoke('google-oauth-init', {
        body: { 
          monday_user_id: String(mondayUserId),
          force_consent: forceConsent 
        }
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error('Failed to generate OAuth URL');
      
      const authUrl = data.url;
      console.log('🔗 [handleConnect] Using OAuth URL from Edge Function with force_consent:', forceConsent);

      // Just open the popup - the useEffect listener will handle the response
      console.log('🔍 [handleConnect] Opening popup, relying on useEffect listener for response');
      const popup = window.open(authUrl, 'google-oauth-popup', 'width=500,height=600');
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

    } catch (err) {
      const msg = toMsg(err);
      setConnectionError(msg);
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // Safely get Monday user ID with error handling for circular structure
      let mondayUserId;
      try {
        const userResponse = await execMondayQuery(`query { me { id } }`);
        mondayUserId = userResponse?.data?.me?.id;
      } catch (err) {
        console.error('Error executing Monday query:', err);
        throw new Error('Failed to retrieve Monday.com user information.');
      }
      
      if (!mondayUserId) throw new Error('Could not get Monday.com user to disconnect.');
      
      // Call the Supabase edge function to disconnect Google Sheets
      const { error } = await supabase.functions.invoke('disconnect-google-sheets', {
        body: { monday_user_id: String(mondayUserId) }
      });
      
      if (error) throw error;

      toast({ 
        title: 'Disconnected', 
        description: 'Google Sheets has been disconnected successfully.' 
      });
      
      setIsConnected(false);
    } catch (err) {
      const msg = toMsg(err);
      setConnectionError(msg);
      toast({ 
        title: 'Error', 
        description: msg, 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForceReconnect = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // Safely get Monday user ID with error handling for circular structure
      let mondayUserId;
      try {
        const userResponse = await execMondayQuery(`query { me { id } }`);
        mondayUserId = userResponse?.data?.me?.id;
      } catch (err) {
        console.error('Error executing Monday query:', err);
        throw new Error('Failed to retrieve Monday.com user information.');
      }
      
      if (!mondayUserId) throw new Error('Could not get Monday.com user to force reconnect.');
      
      console.log('🔄 [handleForceReconnect] Starting force reconnect process for user:', mondayUserId);
      
      // First, disconnect from Google Sheets to clear the token
      const { error: disconnectError } = await supabase.functions.invoke('disconnect-google-sheets', {
        body: { monday_user_id: String(mondayUserId) }
      });
      
      if (disconnectError) {
        console.error('❌ [handleForceReconnect] Error disconnecting:', disconnectError);
        throw disconnectError;
      }
      
      console.log('✅ [handleForceReconnect] Successfully disconnected Google Sheets');
      
      // Execute SQL to ensure the token is removed from the database
      const { error: sqlError } = await supabase.functions.invoke('force-clear-google-tokens', {
        body: { monday_user_id: String(mondayUserId) }
      });
      
      if (sqlError) {
        console.warn('⚠️ [handleForceReconnect] Error clearing tokens:', sqlError);
        // Continue anyway as the disconnect should have cleared the token
      } else {
        console.log('✅ [handleForceReconnect] Successfully cleared tokens from database');
      }
      
      // Clear any local storage tokens
      localStorage.removeItem('google_sheets_tokens');
      localStorage.removeItem('google_oauth_result');
      
      toast({ 
        title: 'Connection Reset', 
        description: 'Google Sheets connection has been reset. Now reconnecting with correct permissions...' 
      });
      
      // Set connected to false to show the connect button
      setIsConnected(false);
      
      // Immediately start the OAuth flow with force_consent=true to ensure new scopes are requested
      setTimeout(() => {
        handleConnect(true); // Pass true to force consent with new scopes
      }, 1000); // Short delay to allow UI to update
      
    } catch (err) {
      const msg = toMsg(err);
      console.error('❌ [handleForceReconnect] Force reconnect error:', msg);
      // Even if there's an error, we want to force the reconnect UI to show
      setIsConnected(false);
      setConnectionError('Connection reset. Please reconnect to Google Sheets.');
      toast({ 
        title: 'Connection Reset', 
        description: 'Please reconnect to Google Sheets to fix any issues.', 
        variant: 'default' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // New function to handle reconnecting with proper scopes
  const reconnectGoogle = async () => {
    setIsReconnecting(true);
    
    try {
      // Step 1: Get Monday user ID
      const userResponse = await execMondayQuery(`query { me { id } }`);
      const mondayUserId = userResponse?.data?.me?.id;
      if (!mondayUserId) throw new Error('Could not get Monday.com user to reconnect.');
      
      // Step 2: Clear existing credentials
      const { error } = await supabase.functions.invoke('disconnect-google-sheets', {
        body: { monday_user_id: String(mondayUserId) }
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Disconnected', 
        description: 'Now reconnecting with full permissions...' 
      });
      
      // Step 3: Start new OAuth flow with force_consent=true
      await handleConnect(true);
    } catch (err) {
      const msg = toMsg(err);
      console.error('Reconnection error:', msg);
      toast({ title: 'Failed to reconnect', description: msg, variant: 'destructive' });
      setConnectionError(msg);
    } finally {
      setIsReconnecting(false);
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
          
          {/* Add warning banner for OAuth scope issues */}
          {noSpreadsheetsFound && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200 w-full">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">No Spreadsheets Found</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">Your Google account may need additional permissions to access spreadsheets.</p>
                <Button 
                  onClick={reconnectGoogle} 
                  disabled={isReconnecting}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isReconnecting ? 'Reconnecting...' : 'Reconnect with Full Permissions'}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/')} className="flex items-center gap-2">
              Continue to Recipes <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={checkConnection} variant="outline" className="flex items-center gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button 
              onClick={handleDisconnect} 
              variant="outline" 
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Disconnect Google Sheets
            </Button>
            <Button 
              onClick={() => {
                setForceReconnect(true);
                handleForceReconnect();
              }} 
              variant="outline" 
              className="text-amber-500 border-amber-200 hover:bg-amber-50 hover:text-amber-600"
            >
              Force Reconnect (Fix Connection Issues)
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <Button onClick={handleConnect} disabled={isLoading || isAuthorizing} className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white" size="lg">Connect Google Sheets</Button>
        {connectionError && (<Alert variant="destructive" className="w-full"><Info className="h-4 w-4" /><AlertTitle>Connection Issue</AlertTitle><AlertDescription>{safeText(connectionError)}</AlertDescription></Alert>)
        }
      </div>
    );
  };
 
  // Safety net function to ensure we always render strings in alerts
  const safeText = (v: unknown) => (typeof v === 'string' ? v : toMsg(v));
  
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