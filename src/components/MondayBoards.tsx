import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, FileSpreadsheet } from "lucide-react";
import MondayBoardSkeleton from './skeletons/MondayBoardSkeleton';

const MondayBoards = () => {
  const { data, isLoading, error } = useMonday();
  const boards = data?.data?.boards || [];

  console.log("Monday boards data:", data);
  console.log("Monday boards error:", error);

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
                <li>Are properly connected to Monday.com</li>
                <li>Have granted the necessary permissions</li>
                <li>Have promoted your app to "Live" in Monday.com Developer Center</li>
              </ul>
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
          <AlertTitle>How to use this app</AlertTitle>
          <AlertDescription>
            1. Go to any board in your Monday.com workspace
            2. Click the "Integrate" button in the top menu
            3. Find "Oh Sheets" in the integration list
            4. Click to add the integration to your board
            5. Use the item menu (⋮) to sync items to Google Sheets
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