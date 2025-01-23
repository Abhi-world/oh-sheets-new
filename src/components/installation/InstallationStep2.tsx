import React from 'react';
import { useMonday } from '@/hooks/useMonday';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/e65968c4-d39a-4ecb-ba57-9c9bea1f36ac.png" alt="Monday.com" className="w-12 h-12" />
          <span className="text-white opacity-80">to</span>
          <img src="/lovable-uploads/93eea699-d5bc-4e01-8375-e441bfc62486.png" alt="Google Sheets" className="w-12 h-12" />
        </div>
        <div className="text-center">
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent">
              Oh Sheets
            </h1>
          </div>
        </div>
      </div>

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

      <Button 
        className="w-full h-12 text-base bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white shadow-lg font-semibold" 
        onClick={onInstall}
        disabled={!selectedWorkspace || !selectedBoard || isLoading}
      >
        {isLoading ? 'Installing...' : 'Install'}
      </Button>
    </div>
  );
};

export default InstallationStep2;