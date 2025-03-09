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

      // Fetch the item details from Monday.com
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

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profile.monday_access_token}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch Monday.com item:', errorText);
        
        if (response.status === 401) {
          // Attempt to refresh token and retry
          toast.info('Refreshing connection to Monday.com...');
          try {
            // Get a fresh token using our refresh mechanism
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('You must be logged in');
            
            // Call the token refresh edge function directly
            const { data: tokenData } = await supabase.functions.invoke('monday-token-refresh', {
              body: { refresh_token: profile.monday_refresh_token }
            });
            
            if (tokenData?.access_token) {
              // Update the profile with new token
              await supabase
                .from('profiles')
                .update({
                  monday_access_token: tokenData.access_token,
                  monday_refresh_token: tokenData.refresh_token || profile.monday_refresh_token,
                  monday_token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);
                
              // Retry the request
              return await handleSyncItem();
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            throw new Error('Your Monday.com session has expired. Please reconnect your account.');
          }
        }
        throw new Error(`Monday API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Error fetching item details');
      }

      const itemData = data.data.items[0];
      
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