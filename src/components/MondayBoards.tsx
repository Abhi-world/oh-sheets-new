import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const MondayBoards = () => {
  const { data, isLoading, error } = useMonday();
  const boards = data?.data?.boards || [];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-monday-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading boards</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img src="/lovable-uploads/55c54574-060a-410d-8dd8-64cf691dc4bb.png" alt="App Icon" className="w-6 h-6" />
          Google Sheets Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>How to use this app</AlertTitle>
          <AlertDescription>
            1. Go to any board in your Monday.com workspace
            2. Click the "+" button in the top menu
            3. Select "Integrate" from the menu
            4. Find "Google Sheets Integration" in the list
            5. Click to configure the integration for your board
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