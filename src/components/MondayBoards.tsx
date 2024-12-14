import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const MondayBoards = () => {
  const { boards, isLoadingBoards, boardsError } = useMonday();

  if (isLoadingBoards) {
    return <div>Loading boards...</div>;
  }

  if (boardsError) {
    return <div>Error loading boards</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Monday.com Boards</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {boards?.map((board: any) => (
            <div key={board.id} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-semibold">{board.name}</h3>
              <div className="mt-2">
                <h4 className="font-medium mb-2">Items:</h4>
                {board.items?.map((item: any) => (
                  <div key={item.id} className="ml-4 mb-2">
                    <p className="text-sm">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MondayBoards;