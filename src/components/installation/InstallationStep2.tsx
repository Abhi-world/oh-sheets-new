import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockWorkspaces } from '@/utils/mockData';

interface InstallationStep2Props {
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
}

const InstallationStep2: React.FC<InstallationStep2Props> = ({
  selectedBoard,
  onBoardSelect,
}) => {
  const { data: mondayData, isLoading } = useMonday();
  const boards = mondayData?.data?.boards || [];

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Workspace</label>
            <Select defaultValue={mockWorkspaces[0].id}>
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {mockWorkspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Board</label>
            <Select value={selectedBoard} onValueChange={onBoardSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading boards...
                  </SelectItem>
                ) : boards.length > 0 ? (
                  boards.map((board: any) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-boards" disabled>
                    No boards available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallationStep2;