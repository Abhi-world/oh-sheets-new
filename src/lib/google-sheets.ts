import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { execMondayQuery } from '@/utils/mondaySDK';

/**
 * Gets the Monday user ID from the Monday SDK
 */
async function getMondayUserId(): Promise<string | null> {
  try {
    // Fix GraphQL validation error by using a properly formatted query
    const userResponse = await execMondayQuery(`query { 
      me { 
        id
        name
        email 
      }
    }`);
    const mondayUserId = userResponse?.data?.me?.id;
    return mondayUserId ? String(mondayUserId) : null;
  } catch (error) {
    console.error('Error getting Monday user ID:', error);
    return null;
  }
}

/**
 * Fetches all spreadsheets from Google Drive using Monday user ID
 */
export const fetchSpreadsheets = async (): Promise<SpreadsheetOption[]> => {
  try {
    console.log('📋 Fetching spreadsheets from gs-list-spreadsheets...');
    const mondayUserId = await getMondayUserId();
    
    if (!mondayUserId) {
      console.error('Could not get Monday user ID');
      toast.error('Could not identify your Monday.com account');
      return [];
    }

    console.log('👤 Using Monday User ID:', mondayUserId);

    // Use gs-list-spreadsheets with explicit timestamp to prevent caching
    const response = await supabase.functions.invoke('gs-list-spreadsheets', {
      body: { 
        monday_user_id: mondayUserId,
        _timestamp: Date.now() // Prevent caching
      },
    });
    
    if (response.error) {
      console.error('Error fetching spreadsheets:', response.error);
      throw new Error(`Failed to fetch spreadsheets: ${response.error.message}`);
    }
    
    // Log the raw response for debugging
    console.log('Raw API response:', response);
    
    // Check if response.data exists and has the expected structure
    if (!response.data) {
      console.error('Invalid response format: missing data property', response);
      toast.error('Invalid response from Google Sheets API');
      return [];
    }
    
    // Handle all possible response formats from the list-spreadsheets function
    let spreadsheets = [];
    if (Array.isArray(response.data)) {
      console.log('Response data is an array, using directly');
      spreadsheets = response.data;
    } else if (response.data.spreadsheets && Array.isArray(response.data.spreadsheets)) {
      console.log('Response data has spreadsheets property, using that');
      spreadsheets = response.data.spreadsheets;
    } else if (response.data.files && Array.isArray(response.data.files)) {
      console.log('Response data has files property, using that');
      spreadsheets = response.data.files;
    } else if (typeof response.data === 'object' && response.data !== null) {
      // Try to extract any array property that might contain spreadsheets
      const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
      if (possibleArrays.length > 0) {
        console.log('Found array property in response data, using first one');
        spreadsheets = possibleArrays[0];
      } else {
        console.error('Unexpected response format:', response.data);
        toast.error('Unexpected data format from Google Sheets API');
        return [];
      }
    } else {
      console.error('Unexpected response format:', response.data);
      toast.error('Unexpected data format from Google Sheets API');
      return [];
    }
    
    console.log('Successfully fetched spreadsheets:', spreadsheets.length);
    
    if (spreadsheets.length === 0) {
      console.warn('No spreadsheets found - may need to re-consent with correct scopes');
    }
    
    // Return actual spreadsheets, even if empty
    return spreadsheets;
  } catch (error) {
    console.error('Error in fetchSpreadsheets:', error);
    // Return empty array on error instead of mock data
    toast.error('Failed to fetch spreadsheets. Please check your Google connection.');
    return [];
  }
}

/**
 * Fetches all sheets from a specific spreadsheet using Monday user ID
 */
export async function fetchSheets(spreadsheetId: string) {
  try {
    if (!spreadsheetId) {
      console.error('Spreadsheet ID is required');
      return [];
    }

    console.log('📑 Fetching sheets for spreadsheet:', spreadsheetId);
    const mondayUserId = await getMondayUserId();
    
    if (!mondayUserId) {
      console.error('Could not get Monday user ID');
      return [];
    }

    console.log('👤 Using Monday User ID:', mondayUserId);

    const { data, error } = await supabase.functions.invoke('gs-list-sheets', {
      body: { 
        monday_user_id: mondayUserId,
        spreadsheet_id: spreadsheetId 
      }
    });

    if (error) {
      console.error('Error from edge function:', error);
      return [];
    }

    if (data?.error) {
      console.error('Error from API:', data.error);
      return [];
    }

    const sheets = data?.sheets || [];
    console.log('✅ Fetched sheets:', sheets.length);
    return Array.isArray(sheets) ? sheets : [];
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return [];
  }
}