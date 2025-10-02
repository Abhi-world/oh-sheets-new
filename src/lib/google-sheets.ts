import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { execMondayQuery } from '@/utils/mondaySDK';

/**
 * Gets the Monday user ID from the Monday SDK
 */
async function getMondayUserId(): Promise<string | null> {
  try {
    const userResponse = await execMondayQuery('query { me { id } }');
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
      throw new Error('Could not get Monday user ID');
    }

    console.log('👤 Using Monday User ID:', mondayUserId);

    const { data, error } = await supabase.functions.invoke('list-google-spreadsheets', {
      body: { monday_user_id: mondayUserId }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    console.log('✅ Fetched spreadsheets:', data?.spreadsheets?.length || 0);
    return data.spreadsheets || [];
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    throw error;
  }
}

/**
 * Fetches all sheets from a specific spreadsheet using Monday user ID
 */
export async function fetchSheets(spreadsheetId: string) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    console.log('📑 Fetching sheets for spreadsheet:', spreadsheetId);
    const mondayUserId = await getMondayUserId();
    
    if (!mondayUserId) {
      throw new Error('Could not get Monday user ID');
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
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    console.log('✅ Fetched sheets:', data?.sheets?.length || 0);
    return data.sheets || [];
  } catch (error) {
    console.error('Error fetching sheets:', error);
    throw error;
  }
}