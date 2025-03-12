import mondaySdk from 'monday-sdk-js';
import { supabase } from '@/integrations/supabase/client';

// Initialize the Monday SDK
const monday = mondaySdk();

/**
 * Initializes the Monday SDK and returns the instance
 * This should be called when the application starts
 */
export function initMondaySDK() {
  monday.setToken(process.env.MONDAY_API_TOKEN || '');
  return monday;
}

/**
 * Checks if the application is running inside Monday.com's environment
 * and automatically gets the session token if available
 */
export async function setupMondaySDK() {
  try {
    // Initialize the SDK
    const mondayClient = initMondaySDK();
    
    // Check if we're in Monday's environment
    const context = await mondayClient.get('context');
    console.log('Monday SDK context:', context);
    
    // More robust check for Monday.com environment
    const isInMondayEnvironment = !!(context.data && 
      (context.data.token || 
       context.data.instanceId || 
       context.data.boardId || 
       context.data.theme));
    
    if (isInMondayEnvironment) {
      console.log('Detected running inside Monday.com environment');
      
      // We're inside Monday's environment, use the session token if available
      if (context.data.token) {
        mondayClient.setToken(context.data.token);
        console.log('Monday SDK initialized with session token');
      } else {
        console.log('Running in Monday.com but no token in context, will use stored token if available');
      }
      
      return { mondayClient, isInMonday: true };
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
export async function fetchBoardsWithSDK() {
  try {
    const mondayClient = getMondaySDK();
    
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
    
    if (response.errors) {
      throw new Error(response.errors[0]?.message || 'Error fetching boards');
    }
    
    return response;
  } catch (error) {
    console.error('Error fetching boards with SDK:', error);
    throw error;
  }
}