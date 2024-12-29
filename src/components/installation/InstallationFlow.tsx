import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { mockWorkspaces } from '@/utils/mockData';
import InstallationHeader from './InstallationHeader';
import InstallationStep2 from './InstallationStep2';
import { Card, CardContent } from '@/components/ui/card';

const InstallationFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const permissions = [
    { title: 'Read', description: 'all of your boards data' },
    { title: 'Send', description: 'notifications on your behalf' },
    { title: 'Read', description: 'updates and replies that you can see' },
    { title: 'Post', description: 'edit updates on your behalf' }
  ];

  const handleInstall = async () => {
    try {
      setIsLoading(true);
      console.log('Mock installation process...');
      console.log('Selected workspace:', selectedWorkspace);
      console.log('Selected board:', selectedBoard);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('App installed successfully! (Mock)');
      navigate('/');
    } catch (error) {
      console.error('Error in mock installation:', error);
      toast.error('Failed to install app');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#6366F1]">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/5e7a0614-eebd-4595-9634-40b17d9029c2.png')] bg-no-repeat bg-center opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 via-purple-500/30 to-pink-500/40" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-70" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse opacity-70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="mx-auto max-w-2xl">
          <InstallationHeader 
            onBack={() => step > 1 ? setStep(step - 1) : navigate('/')}
            onClose={() => navigate('/')}
          />

          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <img src="/lovable-uploads/5e7a0614-eebd-4595-9634-40b17d9029c2.png" alt="Monday.com" className="w-12 h-12" />
                  <span className="text-white opacity-80">to</span>
                  <img src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" alt="Google Sheets" className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent drop-shadow-lg">
                    Oh Sheets
                  </h1>
                  <p className="text-lg text-white/90 mt-2">
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
                    onValueChange={(value) => setWorkspaceType(value)}
                    className="space-y-6"
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        id="all-workspaces"
                        value="all"
                        checked={workspaceType === 'all'}
                        onChange={(e) => setWorkspaceType(e.target.value)}
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
                        onChange={(e) => setWorkspaceType(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="specific-workspaces" className="font-medium text-gray-900">Specific Workspaces</label>
                        <p className="text-sm text-gray-500 mb-2">
                          Select at least one workspace, the app will be limited by this selection.
                        </p>
                        {workspaceType === 'specific' && (
                          <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose workspace" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockWorkspaces.map((workspace) => (
                                <SelectItem key={workspace.id} value={workspace.id}>
                                  {workspace.name}
                                </SelectItem>
                              ))}
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
                onClick={() => setStep(2)}
                disabled={workspaceType === 'specific' && !selectedWorkspace || isLoading}
              >
                {isLoading ? 'Loading...' : 'Install'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <InstallationStep2
              selectedWorkspace={selectedWorkspace}
              selectedBoard={selectedBoard}
              onWorkspaceChange={setSelectedWorkspace}
              onBoardChange={setSelectedBoard}
              onInstall={handleInstall}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallationFlow;