import mondaySdk from 'monday-sdk-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize the Monday SDK
const monday = mondaySdk();

/**
 * Initializes the Monday SDK and returns the instance
 * This should be called when the application starts
 */
export function initMondaySDK() {
  // Use import.meta.env for Vite environment variables instead of process.env
  // This ensures compatibility with Vite's production builds
  const apiToken = typeof import.meta !== 'undefined' ? 
    import.meta.env.VITE_MONDAY_API_TOKEN || '' : 
    '';
  monday.setToken(apiToken);
  return monday;
}

/**
 * Checks if the application is running inside Monday.com's environment
 * and automatically gets the session token if available
 */
export async function setupMondaySDK() {
  try {
    // Client-side check
    if (typeof window === 'undefined') {
      return { mondayClient: monday, isInMonday: false };
    }
    
    // Initialize the SDK
    const mondayClient = initMondaySDK();
    
    // Check if we're in Monday's environment and get context + session token
    let context, sessionToken;
    try {
      [context, sessionToken] = await Promise.all([
        mondayClient.get('context'),
        mondayClient.get('sessionToken')
      ]);
      console.log('Monday SDK context:', context);
      console.log('Monday SDK session token available:', !!sessionToken?.data);
    } catch (contextError) {
      console.warn('Error getting Monday context/session, will try alternative detection:', contextError);
      context = { data: {} };
      sessionToken = { data: null };
    }
    
    // Check URL parameters for board ID
    const urlParams = new URLSearchParams(window.location.search);
    const urlBoardId = urlParams.get('boardId');
    
    // More robust environment detection
    const isInMondayEnvironment = !!(
      // Check if we're in an iframe (Monday embeds apps in iframes)
      window.self !== window.top ||
      // Check for Monday context data
      (context.data && (
        context.data.instanceId || 
        context.data.boardId || 
        context.data.theme ||
        context.data.user
      )) ||
      // Check URL indicators
      urlBoardId !== null ||
      // Check domain
      window.location.hostname.includes('monday.com') ||
      // Check for Monday-specific URL params
      urlParams.has('instanceId') || 
      urlParams.has('app')
    );
    
    if (isInMondayEnvironment) {
      console.log('Detected running inside Monday.com environment');
      
      // Use session token if available (this is the preferred method for embedded apps)
      if (sessionToken?.data) {
        mondayClient.setToken(sessionToken.data);
        console.log('Monday SDK initialized with session token');
        return { 
          mondayClient, 
          isInMonday: true, 
          boardId: context.data.boardId || urlBoardId,
          sessionToken: sessionToken.data,
          context: context.data
        };
      }
      
      // Fallback: Use context token if available
      if (context.data.token) {
        mondayClient.setToken(context.data.token);
        console.log('Monday SDK initialized with context token');
        return { 
          mondayClient, 
          isInMonday: true, 
          boardId: context.data.boardId || urlBoardId,
          sessionToken: context.data.token,
          context: context.data
        };
      }
      
      console.log('Running in Monday environment but no session token available');
      return { 
        mondayClient, 
        isInMonday: true, 
        boardId: context.data.boardId || urlBoardId,
        context: context.data
      };
    }
    
    // Not in Monday or no token available, try to use stored token
    console.log('Not running inside Monday.com, will use stored token if available');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token')
        .eq('id', user.id)
        .single();
      
      if (profile?.monday_access_token) {
        mondayClient.setToken(profile.monday_access_token);
        console.log('Monday SDK initialized with stored token');
      }
    }
    
    return { mondayClient, isInMonday: false };
  } catch (error) {
    console.error('Error setting up Monday SDK:', error);
    return { mondayClient: monday, isInMonday: false };
  }
}

/**
 * Gets the Monday SDK instance
 * If not already initialized, it will initialize it
 */
export function getMondaySDK() {
  return monday;
}

/**
 * Fetches boards directly using the Monday SDK
 * This is more reliable when running inside Monday's environment
 */
export async function fetchBoardsWithSDK(specificBoardId: string | null = null) {
  try {
    const mondayClient = getMondaySDK();
    
    // If we have a specific board ID, fetch just that board
    if (specificBoardId) {
      console.log(`Fetching specific Monday.com board: ${specificBoardId}`);
      
      const query = `
        query {
          boards(ids: ${specificBoardId}) {
            id
            name
            workspace {
              id
              name
            }
            items {
              id
              name
            }
          }
        }
      `;
      
      const response = await mondayClient.api(query);
      console.log('Monday SDK specific board response:', response);
      
      if ((response as any).errors && (response as any).errors.length > 0) {
        throw new Error((response as any).errors[0]?.message || 'Error fetching specific board');
      }
      
      return response;
    }
    
    // Otherwise fetch all boards
    const query = `
      query {
        boards {
          id
          name
          workspace {
            id
            name
          }
          items {
            id
            name
          }
        }
      }
    `;
    
    const response = await mondayClient.api(query);
    console.log('Monday SDK boards response:', response);
    
    if ((response as any).errors) {
      throw new Error((response as any).errors[0]?.message || 'Error fetching boards');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching boards with SDK:', error);
    throw error;
  }
}

/**
 * Fetches items from a specific board using the Monday SDK
 */
export async function fetchItemsWithSDK(boardId: string) {  // Add type annotation
  try {
    const mondayClient = getMondaySDK();
    
    console.log(`Fetching items from Monday.com board: ${boardId}`);
    
    const query = `
      query {
        boards(ids: ${boardId}) {
          items {
            id
            name
            column_values {
              id
              title
              text
              value
              type
            }
          }
        }
      }
    `;
    
    const response = await mondayClient.api(query);
    console.log('Monday SDK items response:', response);
    
    if ((response as any).errors) {
      throw new Error((response as any).errors[0]?.message || 'Error fetching items');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching items with SDK:', error);
    throw error;
  }
}

/**
 * Centralized Monday GraphQL query execution
 * Uses Monday SDK in embedded mode, stored OAuth tokens in standalone mode
 */
export async function execMondayQuery(query: string, variables?: Record<string, any>) {
  try {
    console.log('Executing Monday GraphQL query:', query.substring(0, 100) + '...');
    
    // Get Monday SDK setup
    const { mondayClient, isInMonday, sessionToken } = await setupMondaySDK();
    
    if (isInMonday && sessionToken) {
      console.log('Using Monday SDK api() method in embedded mode');
      
      try {
        const response = await mondayClient.api(query, { variables });
        console.log('Monday SDK response:', response);
        
        if ((response as any).errors && (response as any).errors.length > 0) {
          console.error('Monday SDK GraphQL errors:', (response as any).errors);
          throw new Error((response as any).errors[0]?.message || 'GraphQL error from Monday SDK');
        }
        
        return { data: (response as any).data };
      } catch (sdkError) {
        console.error('Monday SDK api() failed:', sdkError);
        
        // Fallback to direct API call with session token
        console.log('Falling back to direct API call with session token');
        const directResponse = await fetch('https://api.monday.com/v2', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables })
        });
        
        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.error('Direct fetch with session token failed:', directResponse.status, errorText);
          throw new Error(`Monday API error: ${directResponse.status} - ${errorText}`);
        }
        
        const directData = await directResponse.json();
        console.log('Direct API response with session token:', directData);
        
        if (directData.errors && directData.errors.length > 0) {
          throw new Error(directData.errors[0]?.message || 'GraphQL error from Monday API');
        }
        
        return { data: directData.data };
      }
    }
    
    // Standalone mode: use stored OAuth token
    console.log('Using stored OAuth token for Monday API call');
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in');
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('monday_access_token, monday_refresh_token, monday_token_expires_at')
      .eq('id', user.id)
      .single();
    
    if (!profile?.monday_access_token) {
      throw new Error('Monday.com access token not found. Please connect your Monday.com account.');
    }
    
    // Make direct API call with stored token
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profile.monday_access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      console.error('Monday API call failed:', response.status, response.statusText);
      
      // Handle 401 errors by attempting token refresh
      if (response.status === 401 && profile.monday_refresh_token) {
        console.log('Access token expired, attempting refresh...');
        
        try {
          // Call token refresh function
          const { data: tokenData } = await supabase.functions.invoke('monday-token-refresh', {
            body: { refresh_token: profile.monday_refresh_token }
          });
          
          if (tokenData?.access_token) {
            // Update profile with new token
            await supabase
              .from('profiles')
              .update({
                monday_access_token: tokenData.access_token,
                monday_refresh_token: tokenData.refresh_token || profile.monday_refresh_token,
                monday_token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            console.log('Token refreshed successfully, retrying query');
            
            // Retry the request with new token
            const retryResponse = await fetch('https://api.monday.com/v2', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query, variables })
            });
            
            if (!retryResponse.ok) {
              const errorText = await retryResponse.text();
              throw new Error(`Monday API error after token refresh: ${retryResponse.status} - ${errorText}`);
            }
            
            const retryData = await retryResponse.json();
            if (retryData.errors && retryData.errors.length > 0) {
              throw new Error(retryData.errors[0]?.message || 'GraphQL error from Monday API');
            }
            
            return { data: retryData.data };
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('Your Monday.com session has expired. Please reconnect your account.');
        }
      }
      
      const errorText = await response.text();
      throw new Error(`Monday API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Monday API response:', data);
    
    if (data.errors && data.errors.length > 0) {
      console.error('Monday API GraphQL errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'GraphQL error from Monday API');
    }
    
    return { data: data.data };
  } catch (error) {
    console.error('Error executing Monday query:', error);
    throw error;
  }
}
// Properly terminated file with newline