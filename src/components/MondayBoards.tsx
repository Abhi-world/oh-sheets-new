
import React from 'react';
import { useMonday, useMondayContext } from '@/hooks/useMonday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, FileSpreadsheet } from "lucide-react";
import MondayBoardSkeleton from './skeletons/MondayBoardSkeleton';

const MondayBoards = () => {
  const { data, isLoading, error } = useMonday();
  const { isInMonday } = useMondayContext();
  const boards = data?.data?.boards || [];

  console.log("Monday connection status:", {
    isLoading,
    hasError: !!error,
    errorMessage: error?.message,
    hasData: !!data,
    boardsCount: boards?.length,
    isInMonday,
    rawData: data
  });

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
            Monday.com Board View
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
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
            Monday.com Board View
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isInMonday ? (
            <>
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>
                  You're running inside Monday.com, but we encountered an error: {error.message}
                  <br />
                  Please make sure you have the necessary permissions to access boards.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {error.message}
                <br />
                Please make sure you're properly connected to Monday.com and try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-monday-blue" />
          Monday.com Board View
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isInMonday && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Running inside Monday.com</AlertTitle>
            <AlertDescription>
              You're currently running the app inside Monday.com. Boards are automatically detected.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <ScrollArea className="h-[400px]">
            {boards?.length > 0 ? (
              boards.map((board: any) => (
                <div key={board.id} className="mb-4 p-4 border rounded hover:border-monday-blue transition-colors">
                  <h3 className="text-lg font-semibold">{board.name}</h3>
                  <div className="mt-2">
                    <h4 className="font-medium mb-2">Items:</h4>
                    <ul className="pl-4 list-disc">
                      {board.items?.slice(0, 5).map((item: any) => (
                        <li key={item.id} className="text-sm text-gray-600">{item.name}</li>
                      ))}
                      {board.items?.length > 5 && (
                        <li className="text-sm text-gray-500 italic">
                          + {board.items.length - 5} more items
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No boards found. {!isInMonday && 'Please connect your Monday.com account.'}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default MondayBoards;
