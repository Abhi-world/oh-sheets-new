import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockWorkspaces, mockBoards } from '@/utils/mockData';

interface InstallationStep2Props {
  selectedWorkspace: string;
  selectedBoard: string;
  onWorkspaceChange: (value: string) => void;
  onBoardChange: (value: string) => void;
  onInstall: () => void;
  isLoading: boolean;
}

const InstallationStep2 = ({
  selectedWorkspace,
  selectedBoard,
  onWorkspaceChange,
  onBoardChange,
  onInstall,
  isLoading
}: InstallationStep2Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <img src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" alt="Google Sheets" className="w-12 h-12" />
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Let's get started</h1>
          <p className="text-lg text-gray-600 mt-2">Choose where to add the app</p>
        </div>
      </div>

      <Card className="border-2 border-gray-100/50 shadow-lg backdrop-blur-sm bg-white/80">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Main workspace</label>
            <Select value={selectedWorkspace} onValueChange={onWorkspaceChange}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Choose a workspace" />
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

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Choose a board</label>
            <Select value={selectedBoard} onValueChange={onBoardChange}>
              <SelectTrigger className="w-full h-12 text-base">
                <SelectValue placeholder="Choose a board" />
              </SelectTrigger>
              <SelectContent>
                {mockBoards.map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full h-12 text-base bg-monday-blue hover:bg-monday-blue/90 shadow-lg" 
        onClick={onInstall}
        disabled={!selectedWorkspace || !selectedBoard || isLoading}
      >
        {isLoading ? 'Installing...' : 'Add app'}
      </Button>

      <div className="flex items-center justify-center">
        <span className="text-sm text-gray-500">14 days trial left</span>
      </div>
    </div>
  );
};

export default InstallationStep2;