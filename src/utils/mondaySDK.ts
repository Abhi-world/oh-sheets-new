import mondaySdk from 'monday-sdk-js';

// Create a single, globally initialized Monday SDK instance
const monday = mondaySdk();
console.log('🚀 Monday SDK initialized globally');

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
export async function fetchItemsWithSDK(boardId: string) {  // Add type annotation
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
 * SIMPLIFIED: Removed explicit waitForMondayContext. Let the SDK queue the request.
 */
export async function execMondayQuery(query: string, variables?: Record<string, any>) {
  console.log('🔵 [execMondayQuery] Using Monday SDK in embedded mode.');
  try {
    const mondayClient = getMondaySDK();
    // The SDK will internally wait for initialization before sending the API call.
    // This is much more reliable than manual waiting.
    const response = (await mondayClient.api(query, { variables })) as any;

    console.log('✅ [execMondayQuery] SDK response:', response);

    if (response.errors && response.errors.length > 0) {
      console.error('❌ [execMondayQuery] GraphQL errors:', response.errors);
      throw new Error(response.errors[0]?.message || 'GraphQL error from Monday SDK');
    }

    if (response.data) {
      return { data: response.data };
    }
    
    // Handle cases where the response might be malformed
    throw new Error('Invalid response structure from Monday API');

  } catch (sdkError) {
    console.error('❌ [execMondayQuery] SDK api() method failed:', sdkError);
    throw sdkError;
  }
}
