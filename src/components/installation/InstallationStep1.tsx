import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useMonday } from '@/hooks/useMonday';

interface InstallationStep1Props {
  workspaceType: string;
  selectedWorkspace: string;
  onWorkspaceTypeChange: (value: string) => void;
  onWorkspaceSelect: (value: string) => void;
  onNext: () => void;
  isLoading: boolean;
}

const InstallationStep1: React.FC<InstallationStep1Props> = ({
  workspaceType,
  selectedWorkspace,
  onWorkspaceTypeChange,
  onWorkspaceSelect,
  onNext,
  isLoading
}) => {
  const { data: mondayData, isLoading: isMondayLoading, error: mondayError } = useMonday();
  
  const workspaces = mondayData?.data?.boards?.reduce((acc: any[], board: any) => {
    if (board.workspace && !acc.find((w) => w.id === board.workspace.id)) {
      acc.push(board.workspace);
    }
    return acc;
  }, []) || [];

  const permissions = [
    { title: 'Read', description: 'all of your boards data' },
    { title: 'Send', description: 'notifications on your behalf' },
    { title: 'Read', description: 'updates and replies that you can see' },
    { title: 'Post', description: 'edit updates on your behalf' }
  ];

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
          <p className="text-lg text-white mt-4 max-w-lg mx-auto">
            Seamlessly sync your Monday.com data with Google Sheets using our automated integration templates
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
        <CardContent className="p-6">
          <p className="text-gray-600 mb-6">
            Note: This app will be available to all users in your account.
            By installing this app you agree to its Terms of Service.
          </p>

          <RadioGroup
            defaultValue="all"
            onValueChange={onWorkspaceTypeChange}
            className="space-y-6"
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="all-workspaces"
                value="all"
                checked={workspaceType === 'all'}
                onChange={(e) => onWorkspaceTypeChange(e.target.value)}
                className="mt-1"
              />
              <div>
                <label htmlFor="all-workspaces" className="font-medium text-gray-900">All Workspaces</label>
                <p className="text-sm text-gray-500">
                  This app will be available to all current and future workspaces.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="radio"
                id="specific-workspaces"
                value="specific"
                checked={workspaceType === 'specific'}
                onChange={(e) => onWorkspaceTypeChange(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="specific-workspaces" className="font-medium text-gray-900">Specific Workspaces</label>
                <p className="text-sm text-gray-500 mb-2">
                  Select at least one workspace, the app will be limited by this selection.
                </p>
                {workspaceType === 'specific' && (
                  <Select value={selectedWorkspace} onValueChange={onWorkspaceSelect}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {isMondayLoading ? (
                        <SelectItem value="loading" disabled>Loading workspaces...</SelectItem>
                      ) : mondayError ? (
                        <SelectItem value="error" disabled>Error loading workspaces</SelectItem>
                      ) : workspaces.length > 0 ? (
                        workspaces.map((workspace: any) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-workspaces" disabled>No workspaces found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </RadioGroup>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">On monday.com, Google Sheets Automations will be able to:</h2>
            <div className="space-y-3">
              {permissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-transparent p-2 rounded-lg">
                  <span className="font-medium text-purple-900">{permission.title}</span>
                  <span className="text-gray-600">{permission.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        className="w-full h-12 text-base bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white shadow-lg font-semibold" 
        onClick={onNext}
        disabled={workspaceType === 'specific' && !selectedWorkspace || isLoading}
      >
        {isLoading ? 'Loading...' : 'Next'}
      </Button>
    </div>
  );
};

export default InstallationStep1;