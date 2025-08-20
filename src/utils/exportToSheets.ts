import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getAccessToken } from '@/lib/google-sheets';

interface MondayItem {
  id: string;
  name: string;
  column_values: Array<{
    id: string;
    title: string;
    value: string;
    text: string;
  }>;
}

interface ExportOptions {
  spreadsheetId: string;
  sheetId: string;
  columns?: string[]; // Optional array of column IDs to export (if not provided, export all)
  appendMode?: boolean; // Whether to append to existing data or replace
}

/**
 * Exports Monday.com item data to Google Sheets
 * @param items Array of Monday.com items to export
 * @param options Export configuration options
 * @returns Promise resolving to success status
 */
export async function exportItemsToGoogleSheets(
  items: MondayItem[],
  options: ExportOptions
): Promise<boolean> {
  try {
    if (!items.length) {
      toast.error('No items to export');
      return false;
    }

    if (!options.spreadsheetId || !options.sheetId) {
      toast.error('Google Sheets destination not properly configured');
      return false;
    }

    // Get a valid access token for Google Sheets API
    const accessToken = await getAccessToken();
    if (!accessToken) {
      toast.error('Failed to get Google Sheets access token. Please check your credentials.');
      return false;
    }

    // Prepare the data for export
    // First row is headers
    const headers = ['Item ID', 'Item Name'];
    
    // Get all unique column titles from items
    const columnSet = new Set<string>();
    items.forEach(item => {
      item.column_values.forEach(col => {
        // If specific columns are requested, only include those
        if (!options.columns || options.columns.includes(col.id)) {
          columnSet.add(col.title);
        }
      });
    });
    
    // Add column titles to headers
    columnSet.forEach(colTitle => headers.push(colTitle));
    
    // Prepare rows data
    const rows = [headers];
    
    items.forEach(item => {
      const row = [item.id, item.name];
      
      // For each column in our headers (starting from index 2 to skip ID and Name)
      for (let i = 2; i < headers.length; i++) {
        const colTitle = headers[i];
        const colValue = item.column_values.find(col => col.title === colTitle);
        row.push(colValue?.text || ''); // Use text representation or empty string
      }
      
      rows.push(row);
    });

    // Determine the range to update (e.g., A1:Z100)
    const endColumn = String.fromCharCode(64 + Math.min(26, headers.length)); // Convert to letter (A-Z)
    const range = `A1:${endColumn}${rows.length}`;

    // Call the Google Sheets API to update the data
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${options.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range,
          majorDimension: 'ROWS',
          values: rows,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Sheets API error:', errorData);
      throw new Error(`Failed to update spreadsheet: ${errorData.error?.message || response.statusText}`);
    }

    toast.success(`Successfully exported ${items.length} items to Google Sheets`);
    return true;
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    toast.error('Failed to export data to Google Sheets');
    return false;
  }
}

/**
 * Exports a single Monday.com item to Google Sheets
 * @param itemId The ID of the Monday.com item to export
 * @param boardId The ID of the board containing the item
 * @param options Export configuration options
 * @returns Promise resolving to success status
 */
export async function exportSingleItemToGoogleSheets(
  itemId: string,
  boardId: string,
  options: ExportOptions
): Promise<boolean> {
  try {
    // Get the current user and their Monday.com access token
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in');

    const { data: profile } = await supabase
      .from('profiles')
      .select('monday_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.monday_access_token) {
      throw new Error('Monday.com access token not found');
    }

    // Fetch the item details from Monday.com using centralized query execution
    const { execMondayQuery } = await import('@/utils/mondaySDK');
    const query = `
      query {
        items(ids: [${itemId}]) {
          id
          name
          column_values {
            id
            title
            value
            text
          }
        }
      }
    `;

    const result = await execMondayQuery(query);
    if (!result.data?.items) {
      throw new Error('Item not found');
    }

    const items = result.data.items;
    return await exportItemsToGoogleSheets(items, options);
  } catch (error) {
    console.error('Error exporting item to Google Sheets:', error);
    toast.error('Failed to export item to Google Sheets');
    return false;
  }
}

/**
 * Exports multiple Monday.com items to Google Sheets
 * @param itemIds Array of Monday.com item IDs to export
 * @param boardId The ID of the board containing the items
 * @param options Export configuration options
 * @returns Promise resolving to success status
 */
export async function exportMultipleItemsToGoogleSheets(
  itemIds: string[],
  boardId: string,
  options: ExportOptions
): Promise<boolean> {
  try {
    // Get the current user and their Monday.com access token
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in');

    const { data: profile } = await supabase
      .from('profiles')
      .select('monday_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.monday_access_token) {
      throw new Error('Monday.com access token not found');
    }

    // Fetch the items details from Monday.com using centralized query execution
    const { execMondayQuery } = await import('@/utils/mondaySDK');
    const query = `
      query {
        items(ids: [${itemIds.join(',')}]) {
          id
          name
          column_values {
            id
            title
            value
            text
          }
        }
      }
    `;

    const result = await execMondayQuery(query);
    if (!result.data?.items) {
      throw new Error('Items not found');
    }

    const items = result.data.items;
    return await exportItemsToGoogleSheets(items, options);
  } catch (error) {
    console.error('Error exporting items to Google Sheets:', error);
    toast.error('Failed to export items to Google Sheets');
    return false;
  }
}

/**
 * Exports an entire Monday.com board to Google Sheets
 * @param boardId The ID of the Monday.com board to export
 * @param options Export configuration options
 * @returns Promise resolving to success status
 */
export async function exportBoardToGoogleSheets(
  boardId: string,
  options: ExportOptions
): Promise<boolean> {
  try {
    // Get the current user and their Monday.com access token
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in');

    const { data: profile } = await supabase
      .from('profiles')
      .select('monday_access_token')
      .eq('id', user.id)
      .single();

    if (!profile?.monday_access_token) {
      throw new Error('Monday.com access token not found');
    }

    // Fetch the board details from Monday.com using centralized query execution
    const { execMondayQuery } = await import('@/utils/mondaySDK');
    const query = `
      query {
        boards(ids: ${boardId}) {
          items {
            id
            name
            column_values {
              id
              title
              value
              text
            }
          }
        }
      }
    `;

    const result = await execMondayQuery(query);
    if (!result.data?.boards || result.data.boards.length === 0) {
      throw new Error('Board not found');
    }

    const items = result.data.boards[0].items;
    return await exportItemsToGoogleSheets(items, options);
  } catch (error) {
    console.error('Error exporting board to Google Sheets:', error);
    toast.error('Failed to export board to Google Sheets');
    return false;
  }
}