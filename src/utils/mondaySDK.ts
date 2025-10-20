import mondaySdk from 'monday-sdk-js';
import { supabase } from '@/integrations/supabase/client';
import { scrubDanger } from '@/lib/safeJson';

// Create a single, globally initialized Monday SDK instance
const monday = mondaySdk();

/**
 * Gets the Monday SDK instance
 */
export function getMondaySDK() {
  return monday;
}

/**
 * Detects if the app is running in Monday.com embedded mode
 */
export function isEmbeddedMode(): boolean {
  if (typeof window === 'undefined') return false;
  // Simplified but effective check
  return window.self !== window.top || new URLSearchParams(window.location.search).has('boardId');
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
          boards(ids: [${Number(specificBoardId)}]) {
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
export async function fetchItemsWithSDK(boardId: string) {
  try {
    const mondayClient = getMondaySDK();
    
    console.log(`Fetching items from Monday.com board: ${boardId}`);
    
    const query = `
      query {
        boards(ids: [${Number(boardId)}]) {
          items_page(limit: 50) {
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
 * This function now correctly handles both embedded and standalone modes.
 */
export async function execMondayQuery(query: string, variables?: Record<string, any>) {
  if (isEmbeddedMode()) {
    console.log('🔵 [execMondayQuery] Using Monday SDK in embedded mode.');
    try {
      const mondayClient = getMondaySDK();
      
      // Safely handle variables to prevent circular references
      let safeVariables = {};
      if (variables) {
        try {
          // Use cross-realm safe scrubDanger function to remove problematic objects
          safeVariables = scrubDanger(variables);
        } catch (err) {
          console.warn('Error sanitizing variables:', err);
          // Continue with empty variables if there's an issue
        }
      }
      
      const response = (await mondayClient.api(query, { variables: safeVariables })) as any;

      console.log('✅ [execMondayQuery] SDK response:', response);

      if (response.errors && response.errors.length > 0) {
        throw new Error(response.errors[0]?.message || 'GraphQL error from Monday SDK');
      }
      if (response.data) {
        return { data: response.data };
      }
      throw new Error('Invalid response structure from Monday API');

    } catch (sdkError) {
      console.error('❌ [execMondayQuery] SDK api() method failed:', sdkError);
      throw sdkError;
    }
  } else {
    // Standalone mode: use stored OAuth token with direct API calls
    console.log('⚪️ [execMondayQuery] Using stored token in standalone mode.');
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You must be logged in.');
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('monday_access_token')
            .eq('id', user.id)
            .single();

        if (!profile?.monday_access_token) {
            throw new Error('Monday.com access token not found. Please connect your account.');
        }

        // Safely handle variables to prevent circular references
        let safeVariables = {};
        if (variables) {
          try {
            // Use cross-realm safe scrubDanger function to remove problematic objects
            safeVariables = scrubDanger(variables);
          } catch (err) {
            console.warn('Error sanitizing variables:', err);
            // Continue with empty variables if there's an issue
          }
        }

        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Authorization': profile.monday_access_token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables: safeVariables }),
        });

        if (!response.ok) {
            throw new Error(`Monday API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors[0]?.message || 'GraphQL error from Monday API');
        }
        return { data: result.data };
    } catch (error) {
        console.error('❌ [execMondayQuery] Standalone API call failed:', error);
        throw error;
    }
  }
}
