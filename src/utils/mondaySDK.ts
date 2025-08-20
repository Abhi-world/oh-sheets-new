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
// Properly terminated file with newline