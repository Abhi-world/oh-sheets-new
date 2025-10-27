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
import { safeStringify, toMsg, scrubDanger } from '@/lib/safeJson';

// Add a safer error handling utility function
const toSafeMsg = (e: unknown) => 
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unexpected error';

// Using the safer toMsg function from safeJson utility

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
    console.log('🔄 [checkConnection] Starting connection check...');
    setIsLoading(true);
    setConnectionError(null);
    setNoSpreadsheetsFound(false);

    try {
      if (!isEmbeddedMode()) {
        console.error('❌ [checkConnection] Not running in embedded mode');
        throw new Error('This app must be run inside Monday.com.');
      }

      // Use a try-catch block to handle potential circular structure errors
      let mondayUserId;
      try {
        console.log('🔄 [checkConnection] Retrieving Monday user ID...');
        const userResponse = await execMondayQuery(`query { me { id } }`);
        mondayUserId = userResponse?.data?.me?.id;
        console.log('✅ [checkConnection] Successfully retrieved Monday user ID:', mondayUserId);
      } catch (err) {
        console.error('❌ [checkConnection] Error executing Monday query:', toSafeMsg(err));
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
      
      console.log('🔄 [checkConnection] Invoking check-google-connection function...');
      const { data, error } = await supabase.functions.invoke('check-google-connection', {
        body: { monday_user_id: String(mondayUserId) }
      });

      if (error) {
        console.error('❌ [checkConnection] Error checking connection:', toSafeMsg(error));
        throw error;
      }

      console.log('✅ [checkConnection] Connection check result:', data?.connected ? 'Connected' : 'Not connected');
      if (data?.connected) {
        setIsConnected(true);
        
        // Check if we can fetch spreadsheets to verify OAuth scopes
      try {
        console.log('🔍 [checkConnection] Getting access token for spreadsheets fetch...');
        
        // Call the function to get the access token for this user
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-google-token', {
          body: { monday_user_id: String(mondayUserId) }
        });
        
        if (tokenError) {
          console.error('❌ [checkConnection] Error getting access token:', toSafeMsg(tokenError));
          throw tokenError;
        }
        
        const accessToken = tokenData?.access_token;
        if (!accessToken) {
          throw new Error('No access token found - please reconnect');
        }
        
        console.log('✅ [checkConnection] Got access token, now fetching spreadsheets...');
        
        // Now call gs-list-spreadsheets with the access_token
        const { data: sheetsData, error: sheetsError } = await supabase.functions.invoke('gs-list-spreadsheets', {
          body: { access_token: accessToken }  // Pass access_token, not monday_user_id
        });
        
        if (sheetsError) {
          console.error('❌ [checkConnection] Error fetching spreadsheets:', toSafeMsg(sheetsError));
          throw sheetsError;
        }
        
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
            console.error('Error executing Monday query:', toSafeMsg(err));
            throw new Error('Failed to retrieve Monday.com user information.');
        }
        
        if (!mondayUserId) {
            throw new Error('Could not retrieve Monday.com user to link account.');
        }
        
        console.log('🔄 [exchangeCodeForTokens] Calling save-google-token function');
        
        // Exchange the authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
                redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code'
            }).toString()
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenResponse.ok) {
            console.error('Google token exchange failed:', tokenData);
            throw new Error(`Failed to exchange code for tokens: ${tokenData.error_description || tokenData.error}`);
        }
        
        // Now save the tokens to our backend
        const { data, error } = await supabase.functions.invoke('save-google-token', {
            body: { 
                monday_user_id: String(mondayUserId),
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_in: tokenData.expires_in,
                scope: tokenData.scope
            }
        });
        
        if (error) throw error;
        
        if (data?.success) {
            console.log('✅ [exchangeCodeForTokens] Token exchange successful');
            toast({ title: 'Success!', description: 'Google Sheets connected successfully!' });
        } else {
            console.log('⚠️ [exchangeCodeForTokens] Token exchange succeeded but no success flag');
        }
        
        await checkConnection();
    } catch (err)
    {
        const msg = toMsg(err);
        console.error('❌ [exchangeCodeForTokens] Error during token exchange:', msg);
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
        try {
            // Never log the entire MessageEvent (contains circular window refs)
            // Only log primitive values like origin
            const safeOrigin = typeof evt.origin === 'string' ? evt.origin : 'unknown';
            console.log('📨 [GoogleSheetsConnect] origin:', safeOrigin);
            
            // Log connection attempt for debugging
            console.log('🔄 [GoogleSheetsConnect] Processing message from origin:', safeOrigin);
            
            // Use cross-realm safe approach to handle MessageEvent data
            // This prevents circular references from Window/Event objects across iframes
            let safeData;
            if (evt?.data) {
                const rawData = evt.data;
                
                if (typeof rawData === 'object') {
                    try {
                        // Extract only the properties we need directly to avoid circular references
                        // Don't use any methods that might cause circular reference issues
                        safeData = {
                            type: typeof rawData.type === 'string' ? rawData.type : null,
                            code: typeof rawData.code === 'string' ? rawData.code : null,
                            error: rawData.error ? 
                                (typeof rawData.error === 'string' ? rawData.error : 'Unknown error') : 
                                null
                        };
                    } catch (err) {
                        console.error('Error extracting data from message event:', toSafeMsg(err));
                        safeData = { type: null };
                    }
                } else if (typeof rawData === 'string') {
                    try {
                        // Try to parse if it's a JSON string
                        safeData = JSON.parse(rawData);
                    } catch {
                        // Not JSON, use as is
                        safeData = { type: null };
                    }
                } else {
                    safeData = { type: null };
                }
            } else {
                safeData = { type: null };
            }
            
            // Accept only our message type
            if (!safeData || safeData.type !== 'google_oauth_result') return;
            
            // Log only primitives
            console.log('📨 [GoogleSheetsConnect] hasCode:', Boolean(safeData.code));
            console.log('📨 [GoogleSheetsConnect] hasError:', Boolean(safeData.error));
            
            if (typeof safeData.code === 'string' && safeData.code) {
                exchangeCodeForTokens(safeData.code);
                return;
            }
            
            if (safeData.error) {
                const msg = typeof safeData.error === 'string' ? safeData.error : 'Authorization failed in popup.';
                setConnectionError(msg);
                toast({ title: 'Authorization Error', description: msg, variant: 'destructive' });
            }
        } catch (err) {
            console.error('Error handling postMessage:', err);
            const msg = 'Error processing authentication response';
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


  const handleConnect = (forceConsent = true) => {
    setIsLoading(true);
    setConnectionError(null);
    
    // Step 1: Open a blank popup immediately on click (synchronous)
    // This avoids popup blockers since it's directly triggered by user action
    const popupFeatures = 'width=600,height=700,resizable=yes,scrollbars=yes,top=50,left=50';
    const popupUrl = 'about:blank';
    const popupName = 'google-oauth-popup';
    
    // Open the popup without storing a direct reference to the window object
    // Use a try-catch to handle potential errors with window.open
    let popup;
    try {
      popup = window.open(popupUrl, popupName, popupFeatures);
    } catch (err) {
      console.error('❌ [handleConnect] Error opening popup:', toSafeMsg(err));
      toast({
        title: 'Error',
        description: 'Failed to open authentication popup. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    
    if (!popup) {
      toast({
        title: 'Error',
        description: 'Popup blocked. Please allow popups for this site and try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }
    
    // Add a loading message to the popup so user knows it's working
    try {
      // Use a simple loading page with no complex DOM manipulation
      const loadingHtml = `
        <html>
          <head>
            <title>Connecting to Google Sheets...</title>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f5f5f5;">
            <div style="text-align: center;">
              <h2>Connecting to Google Sheets</h2>
              <p>Please wait while we redirect you to Google authentication...</p>
              <div style="width: 40px; height: 40px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite; margin: 20px auto;"></div>
              <style>@keyframes spin {0% { transform: rotate(0deg); }100% { transform: rotate(360deg); }}</style>
            </div>
          </body>
        </html>
      `;
      popup.document.write(loadingHtml);
      popup.document.close();
    } catch (e) {
      console.warn('Could not write to popup document, but continuing anyway:', toSafeMsg(e));
    }
    
    // Step 2: Asynchronously get the URL and redirect the popup
    const getUrlAndRedirect = async () => {
      try {
        console.log('🔄 [handleConnect] Getting Monday user ID...');
        let mondayUserId: string | null = null;
        
        try {
          const userResponse = await execMondayQuery('query { me { id } }');
          const rawId = userResponse?.data?.me?.id;
          // Force clean primitive string - no object references
          mondayUserId = rawId ? String(rawId) : null;
          console.log('✅ [handleConnect] Got Monday user ID:', mondayUserId);
        } catch (mondayErr) {
          const errorMsg = toSafeMsg(mondayErr);
          console.error('❌ [handleConnect] Monday query error:', errorMsg);
          throw new Error(`Monday API error: ${errorMsg}`);
        }
        
        if (!mondayUserId) {
          throw new Error('Could not get Monday.com user to initiate connection.');
        }
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnon) {
          throw new Error('Missing Supabase configuration. Please check your environment variables.');
        }
        
        let authUrl: string | undefined;
        
        try {
          console.log('🔄 [handleConnect] Building request body...');
          
          // Create a completely fresh plain object with explicit primitives
          const requestPayload = {
            monday_user_id: String(mondayUserId),
            force_consent: Boolean(forceConsent)
          };
          
          // Pre-stringify with error handling to catch circular refs
          let requestBody: string;
          try {
            requestBody = JSON.stringify(requestPayload);
            console.log('✅ [handleConnect] Request body stringified, length:', requestBody.length);
          } catch (stringifyError) {
            console.error('❌ [handleConnect] JSON.stringify failed:', toSafeMsg(stringifyError));
            throw new Error('Failed to serialize request data. Please try again.');
          }
          
          console.log('🔄 [handleConnect] Sending request to google-oauth-init endpoint');
          
          const res = await fetch(`${supabaseUrl}/functions/v1/google-oauth-init`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseAnon,
              'Authorization': `Bearer ${supabaseAnon}`, // no-verify-jwt function
            },
            body: requestBody, // Use pre-stringified body
          });
          
          if (!res.ok) {
            const errBody = await res.text();
            console.error('❌ [handleConnect] OAuth init HTTP error:', res.status, errBody);
            throw new Error(`OAuth init failed (${res.status}): ${errBody}`);
          }
          
          const responseText = await res.text();
          console.log('✅ [handleConnect] Received response from google-oauth-init');
          
          try {
            const data = JSON.parse(responseText);
            authUrl = data?.url;
            if (!authUrl) throw new Error('Backend did not return OAuth URL');
            console.log('✅ [handleConnect] Successfully parsed OAuth URL');
          } catch (parseError) {
            console.error('❌ [handleConnect] Failed to parse response:', toSafeMsg(parseError));
            throw new Error(`Failed to parse OAuth response: ${toSafeMsg(parseError)}`);
          }
        } catch (fetchErr) {
          console.error('❌ [handleConnect] Fetch error:', toSafeMsg(fetchErr));
          throw new Error(`Failed to get OAuth URL: ${toSafeMsg(fetchErr)}`);
        }
        
        // Step 3: Redirect the popup to the OAuth URL
        // Check if popup is closed without directly accessing properties that might cause circular references
        let isPopupClosed = false;
        try {
          isPopupClosed = popup.closed;
        } catch (err) {
          console.error('❌ [handleConnect] Error checking if popup is closed:', err);
          isPopupClosed = true;
        }
        
        if (isPopupClosed) {
          console.error('❌ [handleConnect] Popup was closed by user before redirect');
          throw new Error('Authentication popup was closed');
        }
        
        // Validate that we have the authUrl before proceeding
        if (!authUrl) {
          throw new Error('OAuth URL is undefined after fetch');
        }
        
        // Use a safer approach to redirect
        try {
          // First try: Direct location change with safe error handling
          try {
            popup.location.href = authUrl;
            console.log('✅ [handleConnect] Popup redirected successfully to OAuth URL');
          } catch (redirectErr) {
            // Handle the error without trying to stringify the entire error object
            console.error('❌ [handleConnect] Error with direct redirect:', typeof redirectErr === 'string' ? redirectErr : 'Redirect error');
            throw redirectErr; // Re-throw to try alternative methods
          }
        } catch (firstMethodErr) {
          // Second try: Open a new window with the URL
          try {
            const newPopup = window.open(authUrl, popupName);
            if (!newPopup) {
              throw new Error('Failed to open OAuth URL in popup');
            }
            console.log('✅ [handleConnect] Opened new popup with OAuth URL');
          } catch (newPopupErr) {
            console.error('❌ [handleConnect] Error opening new popup:', typeof newPopupErr === 'string' ? newPopupErr : 'New popup error');
            
            // Last resort: Try to write a redirect script to the popup
            try {
              // Check if popup is closed again before attempting to write to it
              let isStillOpen = false;
              try {
                isStillOpen = !popup.closed;
              } catch (checkErr) {
                console.error('❌ [handleConnect] Error checking if popup is still open:', checkErr);
              }
              
              if (isStillOpen) {
                popup.document.write(`
                  <html>
                    <head>
                      <meta http-equiv="refresh" content="0;url=${authUrl}">
                      <script>window.location.href = "${authUrl}";</script>
                    </head>
                    <body>
                      <p>Redirecting to Google authentication...</p>
                      <p>If you are not redirected, <a href="${authUrl}" target="_self">click here</a>.</p>
                    </body>
                  </html>
                `);
                popup.document.close();
              } else {
                throw new Error('Popup was closed');
              }
            } catch (writeErr) {
              throw new Error(`All redirect methods failed: ${toMsg(writeErr)}`);
            }
          }
        }
        
      } catch (err) {
        const msg = toSafeMsg(err);
        console.error('❌ [handleConnect] Error during OAuth process:', msg);
        setConnectionError(msg);
        toast({ 
          title: 'Connection Error', 
          description: msg, 
          variant: 'destructive' 
        });
        
        // Show error in popup if it's still open
        try {
          if (popup && !popup.closed) {
            const errorHtml = `
              <html>
                <head>
                  <title>Connection Error</title>
                  <meta charset="utf-8">
                </head>
                <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fff0f0;">
                  <div style="text-align: center; max-width: 80%;">
                    <h2 style="color: #e74c3c;">Connection Error</h2>
                    <p>${msg}</p>
                    <p>Please close this window and try again.</p>
                    <p>If the problem persists, check your Google Cloud Console configuration.</p>
                    <button onclick="window.close()" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px;">Close Window</button>
                  </div>
                </body>
              </html>
            `;
            popup.document.write(errorHtml);
            popup.document.close();
          }
        } catch (e) {
          console.warn('Could not write error to popup:', toMsg(e));
          if (popup && !popup.closed) {
            popup.close();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Start the async process
    getUrlAndRedirect();
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
              <AlertTitle className="text-amber-800 text-lg">No Spreadsheets Found</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2 font-medium">Your Google account needs to reconnect with updated permissions to access spreadsheets.</p>
                <p className="mb-3">We've updated our permissions to fix issues with accessing Google Sheets. Please click the button below to reconnect.</p>
                <Button 
                  onClick={reconnectGoogle} 
                  disabled={isReconnecting}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 text-md"
                  size="lg"
                >
                  {isReconnecting ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Reconnecting...</> : <><RefreshCw className="h-4 w-4 mr-2" /> Reconnect with Full Permissions</>}
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
        {connectionError && (
          <Alert variant="destructive" className="w-full">
            <Info className="h-4 w-4" />
            <AlertTitle>Connection Issue</AlertTitle>
            <AlertDescription>
              {connectionError.includes('circular structure') ? (
                <>
                  Failed to get OAuth URL: Converting circular structure to JSON
                  --&gt; starting at object with constructor 'Window'
                  --- property 'window' closes the circle
                  <div className="mt-2 text-sm">
                    <p>Please close this window and try again. If the problem persists, check your Google Cloud Console configuration.</p>
                  </div>
                </>
              ) : (
                safeText(connectionError)
              )}
            </AlertDescription>
          </Alert>
        )}
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