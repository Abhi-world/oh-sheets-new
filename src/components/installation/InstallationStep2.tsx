import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockWorkspaces } from '@/utils/mockData';

interface InstallationStep2Props {
  selectedWorkspace: string;
  selectedBoard: string;
  onWorkspaceChange: (value: string) => void;
  onBoardChange: (value: string) => void;
  onInstall: () => Promise<void>;
  isLoading: boolean;
}

const InstallationStep2: React.FC<InstallationStep2Props> = ({
  selectedWorkspace,
  selectedBoard,
  onWorkspaceChange,
  onBoardChange,
  onInstall,
  isLoading
}) => {
  const { data: mondayData, isLoading: isMondayLoading } = useMonday();
  const boards = mondayData?.data?.boards || [];

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Workspace</label>
            <Select value={selectedWorkspace} onValueChange={onWorkspaceChange}>
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
            <label className="text-sm font-medium text-gray-700">Select Board</label>
            <Select value={selectedBoard} onValueChange={onBoardChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select board" />
              </SelectTrigger>
              <SelectContent>
                {isMondayLoading ? (
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