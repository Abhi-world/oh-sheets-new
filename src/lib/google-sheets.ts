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
export async function fetchSpreadsheets() {
  try {
    console.log('📋 Fetching spreadsheets...');
    const mondayUserId = await getMondayUserId();
    
    if (!mondayUserId) {
      console.error('Could not get Monday user ID');
      return [];
    }

    console.log('👤 Using Monday User ID:', mondayUserId);

    const { data, error } = await supabase.functions.invoke('list-google-spreadsheets', {
      body: { monday_user_id: mondayUserId }
    });

    if (error) {
      console.error('Error from edge function:', error);
      return [];
    }

    if (data?.error) {
      console.error('Error from API:', data.error);
      return [];
    }

    const spreadsheets = data?.spreadsheets || [];
    console.log('✅ Fetched spreadsheets:', spreadsheets.length);
    return Array.isArray(spreadsheets) ? spreadsheets : [];
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
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