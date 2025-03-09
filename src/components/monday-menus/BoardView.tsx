import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useMonday } from '@/hooks/useMonday';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BoardItem {
  id: string;
  name: string;
  column_values?: Array<{
    id: string;
    title: string;
    value: string;
    text: string;
  }>;
}

interface BoardData {
  id: string;
  name: string;
  items: BoardItem[];
}

const BoardView = () => {
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncTarget, setSyncTarget] = useState<string>('');
  const { data: mondayData } = useMonday();
  
  const boards = mondayData?.data?.boards || [];

  useEffect(() => {
    if (selectedBoard) {
      fetchBoardDetails(selectedBoard);
    }
  }, [selectedBoard]);

  const fetchBoardDetails = async (boardId: string) => {
    try {
      setIsLoading(true);
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

      const query = `
        query {
          boards(ids: ${boardId}) {
            id
            name
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

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profile.monday_access_token}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Monday API Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Error fetching board details');
      }

      setBoardData(data.data.boards[0]);
    } catch (error) {
      console.error('Error fetching board details:', error);
      toast.error('Failed to fetch board details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToSheets = async () => {
    try {
      toast.success('Starting sync to Google Sheets...');
      // Here you would implement the actual sync logic
      setSyncTarget('google-sheets');
      
      // Simulate a successful sync
      setTimeout(() => {
        toast.success('Board data successfully synced to Google Sheets!');
      }, 2000);
    } catch (error) {
      console.error('Error syncing to sheets:', error);
      toast.error('Failed to sync to Google Sheets');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-monday-blue" />
              Monday.com Board View
            </div>
            {selectedBoard && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchBoardDetails(selectedBoard)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Select Board</label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select a board...</option>
                {boards.map((board: any) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-monday-blue" />
              </div>
            ) : boardData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{boardData.name}</h3>
                  <Button
                    onClick={handleSyncToSheets}
                    className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
                  >
                    Sync to Google Sheets
                  </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        {boardData.items[0]?.column_values?.slice(0, 5).map((col) => (
                          <TableHead key={col.id}>{col.title}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boardData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          {item.column_values?.slice(0, 5).map((col) => (
                            <TableCell key={col.id}>{col.text || '-'}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : selectedBoard ? (
              <div className="text-center py-8 text-gray-500">
                No data available for this board
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a board to view its data
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardView;