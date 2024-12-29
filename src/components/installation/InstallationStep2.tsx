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
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src="/lovable-uploads/5e7a0614-eebd-4595-9634-40b17d9029c2.png" alt="Monday.com" className="w-12 h-12" />
          <span className="text-white opacity-80">to</span>
          <img src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" alt="Google Sheets" className="w-12 h-12" />
        </div>
        <div className="text-center">
          <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent">
              Oh Sheets
            </h1>
          </div>
          <p className="text-lg text-white mt-4 max-w-lg mx-auto">
            Seamlessly sync your Monday.com data with Google Sheets using our automated integration templates
          </p>
        </div>
        <div className="mt-4">
          <h2 className="text-3xl font-semibold text-white">Let's get started</h2>
          <p className="text-lg text-white/80 mt-2">Choose where to add the app</p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Main workspace</label>
            <Select value={selectedWorkspace} onValueChange={onWorkspaceChange}>
              <SelectTrigger className="w-full h-12 text-base bg-white">
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
              <SelectTrigger className="w-full h-12 text-base bg-white">
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
        className="w-full h-12 text-base bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white shadow-lg font-semibold" 
        onClick={onInstall}
        disabled={!selectedWorkspace || !selectedBoard || isLoading}
      >
        {isLoading ? 'Installing...' : 'Add app'}
      </Button>

      <div className="flex items-center justify-center">
        <span className="text-sm text-white/80">14 days trial left</span>
      </div>
    </div>
  );
};

export default InstallationStep2;