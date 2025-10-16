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
    console.log('📋 Fetching spreadsheets...');
    const mondayUserId = await getMondayUserId();
    
    if (!mondayUserId) {
      console.error('Could not get Monday user ID');
      return [];
    }

    console.log('👤 Using Monday User ID:', mondayUserId);

    // Use gs-list-spreadsheets directly as it's more reliable
    const response = await supabase.functions.invoke('gs-list-spreadsheets', {
      body: { monday_user_id: mondayUserId },
    });
    
    if (response.error) {
      console.error('Error fetching spreadsheets:', response.error);
      throw new Error(`Failed to fetch spreadsheets: ${response.error.message}`);
    }
    
    const spreadsheets = response.data?.spreadsheets || [];
    console.log('Successfully fetched spreadsheets:', spreadsheets.length);
    
    // Add mock data if no spreadsheets found (for testing)
    if (spreadsheets.length === 0) {
      console.log('No spreadsheets found, adding mock data for testing');
      return [
        { id: 'mock-1', name: 'Sample Spreadsheet 1', title: 'Sample Spreadsheet 1', value: 'mock-1' },
        { id: 'mock-2', name: 'Sample Spreadsheet 2', title: 'Sample Spreadsheet 2', value: 'mock-2' }
      ];
    }
    
    return spreadsheets;
  } catch (error) {
    console.error('Error in fetchSpreadsheets:', error);
    // Return mock data on error for testing
    return [
      { id: 'mock-1', name: 'Sample Spreadsheet 1', title: 'Sample Spreadsheet 1', value: 'mock-1' },
      { id: 'mock-2', name: 'Sample Spreadsheet 2', title: 'Sample Spreadsheet 2', value: 'mock-2' }
    ];
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

    const { data, error } = await supabase.functions.invoke('list-google-sheets', {
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