import mondaySdk from 'monday-sdk-js';
import { supabase } from '@/integrations/supabase/client';

// Create a single, globally initialized Monday SDK instance
const monday = mondaySdk();
console.log('🚀 Monday SDK initialized globally');

// Track context state
let contextReceived = false;
let contextData: any = null;

// Initialize SDK and listen for context in embedded mode
if (typeof window !== 'undefined') {
  // Monday SDK doesn't need explicit init() call
  monday.listen('context', (res: any) => {
    console.log('📋 Monday context received:', res);
    contextReceived = true;
    contextData = res?.data;
  });
}

/**
 * Gets the Monday SDK instance (already initialized in main.tsx)
 * @returns The globally initialized Monday SDK instance
 */
export function getMondaySDK() {
  return monday;
}

/**
 * Wait for Monday context to be received in embedded mode
 */
export async function waitForMondayContext(timeout = 5000): Promise<any> {
  if (!isEmbeddedMode()) {
    return null;
  }

  if (contextReceived) {
    return contextData;
  }

  return new Promise((resolve) => {
    let timeoutId: NodeJS.Timeout;
    let listenerAdded = false;
    
    const contextListener = (res: any) => {
      if (!listenerAdded) return; // Ignore if listener was removed
      
      clearTimeout(timeoutId);
      contextReceived = true;
      contextData = res?.data;
      console.log('📋 Context received and stored:', contextData);
      listenerAdded = false;
      resolve(contextData);
    };

    monday.listen('context', contextListener);
    listenerAdded = true;

    timeoutId = setTimeout(() => {
      listenerAdded = false;
      console.warn('⏰ Timeout waiting for Monday context');
      resolve(contextData); // Return whatever we have
    }, timeout);
  });
}

/**
 * Gets context information including board ID
 */
export async function getMondayContextInfo() {
  if (!isEmbeddedMode()) {
    return { isInMonday: false, boardId: null, context: null };
  }

  // Wait for context if we don't have it yet
  const context = await waitForMondayContext();
  
  // Also check URL parameters as fallback
  const urlParams = new URLSearchParams(window.location.search);
  const urlBoardId = urlParams.get('boardId');
  
  return {
    isInMonday: true,
    boardId: context?.boardId || urlBoardId,
    context: context || {},
  };
}

/**
 * Detects if the app is running in Monday.com embedded mode
 * @returns boolean indicating if app is embedded
 */
export function isEmbeddedMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return !!(
    window.self !== window.top ||
    window.location.hostname.includes('monday.com') ||
    urlParams.has('instanceId') || 
    urlParams.has('app') ||
    urlParams.get('boardId') !== null ||
    window.location.pathname.includes('/boards/') ||
    window.location.pathname.includes('/views/')
  );
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
    
    // Otherwise fetch all boards - simplified query without items
    const query = `
      query {
        boards {
          id
          name
          workspace {
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
    
    // Check if we're in embedded mode
    if (isEmbeddedMode()) {
      console.log('🔵 Using Monday SDK api() method in embedded mode');
      
      // Wait for context before making API calls
      console.log('⏳ Waiting for Monday context before API call...');
      await waitForMondayContext();
      
      try {
        const mondayClient = getMondaySDK();
        // ALWAYS use Monday SDK api() method in embedded mode - never fetch()
        const response = await mondayClient.api(query, { variables });
        console.log('✅ Monday SDK response:', response);
        
        if ((response as any).errors && (response as any).errors.length > 0) {
          console.error('❌ Monday SDK GraphQL errors:', (response as any).errors);
          throw new Error((response as any).errors[0]?.message || 'GraphQL error from Monday SDK');
        }
        
        return { data: (response as any).data };
      } catch (sdkError) {
        console.error('❌ Monday SDK api() failed in embedded mode:', sdkError);
        throw sdkError; // Don't fall back to fetch in embedded mode
      }
    }
    
    // Standalone mode: use stored OAuth token with direct API calls
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
