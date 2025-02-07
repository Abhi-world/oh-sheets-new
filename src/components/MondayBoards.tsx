import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, FileSpreadsheet, Puzzle, MoreHorizontal } from "lucide-react";
import MondayBoardSkeleton from './skeletons/MondayBoardSkeleton';

const MondayBoards = () => {
  const { data, isLoading, error } = useMonday();
  const boards = data?.data?.boards || [];

  console.log("Monday connection status:", {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasData: !!data,
    boardsCount: boards?.length,
    rawData: data
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
            Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Loading your boards...</AlertTitle>
            <AlertDescription>
              Please wait while we fetch your Monday.com boards.
            </AlertDescription>
          </Alert>
          
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Connected Boards</h3>
            <ScrollArea className="h-[400px]">
              <MondayBoardSkeleton />
              <MondayBoardSkeleton />
              <MondayBoardSkeleton />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
            Google Sheets Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription className="mt-2">
              {error.message}
              <br />
              Please make sure you:
              <ul className="list-disc ml-6 mt-2">
                <li>Have installed the app in your Monday.com workspace</li>
                <li>Have granted the necessary permissions</li>
                <li>Have added the app to at least one board</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Installation Steps:</h4>
                <ol className="list-decimal ml-4">
                  <li>Go to the Monday.com Developer Center</li>
                  <li>Find your app and click "Use App"</li>
                  <li>Select the workspace where you want to use the app</li>
                  <li>Grant the requested permissions</li>
                  <li>Go to any board and click the "..." menu next to an item</li>
                  <li>Look for "Oh Sheets" in the menu options</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
          Google Sheets Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>How to Add Oh Sheets to Your Board</AlertTitle>
          <AlertDescription className="space-y-4">
            <div className="flex items-start gap-2 mt-2">
              <Puzzle className="w-5 h-5 mt-1 text-monday-blue" />
              <div>
                <p className="font-semibold">Method 1: Using the Item Menu</p>
                <ol className="list-decimal ml-4">
                  <li>Go to any board where you want to use Oh Sheets</li>
                  <li>Click the three dots (⋮) next to any item</li>
                  <li>Look for "Oh Sheets" in the menu</li>
                  <li>If not visible, click "More actions" at the bottom</li>
                </ol>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MoreHorizontal className="w-5 h-5 mt-1 text-monday-blue" />
              <div>
                <p className="font-semibold">Method 2: Using Multi-Item Selection</p>
                <ol className="list-decimal ml-4">
                  <li>Select multiple items in your board</li>
                  <li>Click the "..." menu in the top bar</li>
                  <li>Look for "Bulk Sync to Google Sheets"</li>
                </ol>
              </div>
            </div>
          </AlertDescription>
        </Alert>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Connected Boards</h3>
          <ScrollArea className="h-[400px]">
            {boards?.length > 0 ? (
              boards.map((board: any) => (
                <div key={board.id} className="mb-4 p-4 border rounded hover:border-monday-blue transition-colors">
                  <h3 className="text-lg font-semibold">{board.name}</h3>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Items:</h4>
                    {board.items?.map((item: any) => (
                      <div key={item.id} className="ml-4 mb-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4">
                No boards connected yet. Add the integration to a board to get started.
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default MondayBoards;