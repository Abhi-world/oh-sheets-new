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
    
    // Check if we're in Monday's environment and get context
    let context;
    try {
      context = await mondayClient.get('context');
      console.log('Monday SDK context:', context);
    } catch (contextError) {
      console.warn('Error getting Monday context, will try alternative detection:', contextError);
      context = { data: {} };
    }
    
    // Check URL parameters for board ID
    const urlParams = new URLSearchParams(window.location.search);
    const urlBoardId = urlParams.get('boardId');
    
    // More robust environment detection
    const isInMondayEnvironment = !!(context.data && 
      (context.data.token || 
       context.data.instanceId || 
       context.data.boardId || 
       context.data.theme ||
       window.location.hostname.includes('monday.com'))) ||
       urlBoardId !== null;
    
    if (isInMondayEnvironment) {
      console.log('Detected running inside Monday.com environment');
      
      // Use session token if available
      if (context.data.token) {
        mondayClient.setToken(context.data.token);
        console.log('Monday SDK initialized with session token');
        return { mondayClient, isInMonday: true, boardId: context.data.boardId || urlBoardId };
      }
      
      // If we have a boardId in the context or URL, store it for later use
      const contextBoardId = context.data.boardId || urlBoardId;
      if (contextBoardId) {
        console.log('Detected board ID:', contextBoardId);
      }
      
      // If no session token but we're in Monday environment, try to get stored token
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('monday_access_token')
          .eq('id', user.id)
          .single();
        
        if (profile?.monday_access_token) {
          mondayClient.setToken(profile.monday_access_token);
          console.log('Monday SDK initialized with stored token while in Monday environment');
          return { mondayClient, isInMonday: true, boardId: contextBoardId };
        }
      }
      
      return { mondayClient, isInMonday: true, boardId: contextBoardId };
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