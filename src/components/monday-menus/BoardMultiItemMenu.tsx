import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportMultipleItemsToGoogleSheets } from '@/utils/exportToSheets';

interface BoardMultiItemMenuProps {
  itemIds?: string[];
  boardId?: string;
}

const BoardMultiItemMenu = ({ itemIds, boardId }: BoardMultiItemMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkSync = async () => {
    if (!itemIds?.length || !boardId) {
      toast.error('Item information is missing');
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

      // Check if we need to show a Google Sheets configuration modal
      const { data: sheetsConfig } = await supabase
        .from('profiles')
        .select('google_sheets_credentials, default_spreadsheet_id, default_sheet_id')
        .eq('id', user.id)
        .single();
      
      if (!sheetsConfig?.google_sheets_credentials) {
        toast.error('Please connect your Google Sheets account first');
        return;
      }

      if (!sheetsConfig.default_spreadsheet_id || !sheetsConfig.default_sheet_id) {
        toast.error('Please configure your default Google Sheets destination');
        return;
      }

      // Use the exportMultipleItemsToGoogleSheets utility function
      const success = await exportMultipleItemsToGoogleSheets(
        itemIds,
        boardId,
        {
          spreadsheetId: sheetsConfig.default_spreadsheet_id,
          sheetId: sheetsConfig.default_sheet_id,
          appendMode: true // Append to existing data rather than replacing
        }
      );

      if (success) {
        toast.success(`Successfully exported ${itemIds.length} items to Google Sheets`);
      }
    } catch (error) {
      console.error('Error syncing items:', error);
      toast.error('Failed to sync items to Google Sheets');
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
            Oh Sheets Multi-Item Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Export multiple Monday.com items to Google Sheets simultaneously for analysis, reporting, and collaboration
          </p>
          <Button 
            onClick={handleBulkSync}
            className="w-full bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Syncing...
              </>
            ) : (
              'Sync Selected Items to Google Sheets'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardMultiItemMenu;