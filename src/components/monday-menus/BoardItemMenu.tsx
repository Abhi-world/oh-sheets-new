import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportSingleItemToGoogleSheets } from '@/utils/exportToSheets';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface BoardItemMenuProps {
  itemId?: string;
  boardId?: string;
}

const BoardItemMenu = ({ itemId, boardId }: BoardItemMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets,
  } = useGoogleSheets();

  // Fetch spreadsheets when component mounts
  useEffect(() => {
    fetchSpreadsheets();
  }, [fetchSpreadsheets]);

  const handleSyncItem = async () => {
    if (!itemId || !boardId) {
      toast.error('Item information is missing');
      return;
    }

    if (!selectedSpreadsheet || !selectedSheet) {
      toast.error('Please select a destination spreadsheet and sheet');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the current user and their Monday.com access token
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token, monday_refresh_token, monday_token_expires_at')
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
      if (!result.data?.items || result.data.items.length === 0) {
        throw new Error('Item not found');
      }

      const itemData = result.data.items[0];
      
      // Export the item to Google Sheets using our utility function
      const success = await exportSingleItemToGoogleSheets(itemId, boardId, {
        spreadsheetId: selectedSpreadsheet,
        sheetId: selectedSheet,
        appendMode: true, // Append to existing data rather than replacing
      });

      if (success) {
        toast.success(`Item "${itemData.name}" successfully exported to Google Sheets`);
      } else {
        throw new Error('Export operation failed');
      }
    } catch (error) {
      console.error('Error syncing item:', error);
      toast.error('Failed to sync item to Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
            Sync Item to Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Export this item's data to Google Sheets for further analysis or reporting
          </p>
          
          {/* Spreadsheet selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Spreadsheet</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={selectedSpreadsheet}
              onChange={(e) => setSelectedSpreadsheet(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select a spreadsheet...</option>
              {spreadsheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
              ))}
            </select>
          </div>
          
          {/* Sheet selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Sheet</label>
            <select 
              className="w-full p-2 border rounded-md"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
              disabled={isLoading || !selectedSpreadsheet}
            >
              <option value="">Select a sheet...</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>{sheet.name}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={handleSyncItem}
            className="w-full bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
            disabled={isLoading || !selectedSpreadsheet || !selectedSheet}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              'Sync to Google Sheets'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardItemMenu;