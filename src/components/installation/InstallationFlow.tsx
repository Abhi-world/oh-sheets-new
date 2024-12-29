import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadioGroup } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const InstallationFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState('all');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [boards, setBoards] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const permissions = [
    { title: 'Read', description: 'all of your boards data' },
    { title: 'Send', description: 'notifications on your behalf' },
    { title: 'Read', description: 'updates and replies that you can see' },
    { title: 'Post', description: 'or edit updates on your behalf' }
  ];

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchBoards(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      setIsLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token')
        .single();

      if (!profile?.monday_access_token) {
        toast.error('Please connect your Monday.com account first');
        return;
      }

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': profile.monday_access_token
        },
        body: JSON.stringify({
          query: `
            query {
              workspaces {
                id
                name
              }
            }
          `
        })
      });

      const result = await response.json();
      if (result.data?.workspaces) {
        setWorkspaces(result.data.workspaces);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to fetch workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBoards = async (workspaceId: string) => {
    try {
      setIsLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token')
        .single();

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': profile?.monday_access_token || ''
        },
        body: JSON.stringify({
          query: `
            query {
              boards (workspace_ids: [${workspaceId}]) {
                id
                name
              }
            }
          `
        })
      });

      const result = await response.json();
      if (result.data?.boards) {
        setBoards(result.data.boards);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to fetch boards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = async () => {
    try {
      setIsLoading(true);
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_user_id')
        .single();

      if (!profile?.monday_user_id) {
        toast.error('User not authenticated');
        return;
      }

      // Save installation details
      const { error } = await supabase
        .from('triggers')
        .insert({
          monday_user_id: profile.monday_user_id,
          monday_board_id: selectedBoard,
          trigger_type: 'installation',
          is_active: true
        });

      if (error) throw error;

      toast.success('App installed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/')} 
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button onClick={handleClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" alt="Google Sheets" className="w-8 h-8" />
              <h1 className="text-2xl font-semibold">Install Google Sheets Automations</h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Note: This app will be available to all users in your account.
                By installing this app you agree to its Terms of Service.
              </p>

              <div className="space-y-4 mt-8">
                <RadioGroup
                  defaultValue="all"
                  onValueChange={(value) => setWorkspaceType(value)}
                  className="space-y-4"
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
                      <label htmlFor="all-workspaces" className="font-medium">All Workspaces</label>
                      <p className="text-sm text-muted-foreground">
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
                    <div>
                      <label htmlFor="specific-workspaces" className="font-medium">Specific Workspaces</label>
                      <p className="text-sm text-muted-foreground">
                        Select at least one workspace, the app will be limited by this selection.
                      </p>
                      {workspaceType === 'specific' && (
                        <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                          <SelectTrigger className="w-full mt-2">
                            <SelectValue placeholder="Choose workspace" />
                          </SelectTrigger>
                          <SelectContent>
                            {workspaces.map((workspace) => (
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
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-medium mb-4">On monday.com, Google Sheets Automations will be able to:</h2>
                <div className="space-y-4">
                  {permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="font-medium">{permission.title}</span>
                      <span className="text-muted-foreground">{permission.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-8" 
              onClick={() => setStep(2)}
              disabled={workspaceType === 'specific' && !selectedWorkspace || isLoading}
            >
              {isLoading ? 'Loading...' : 'Install'}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src="/lovable-uploads/aa37e716-a0c4-493f-9f04-9cc9c85c931a.png" alt="Google Sheets" className="w-8 h-8" />
              <h1 className="text-2xl font-semibold">Let's get started</h1>
            </div>
            
            <p className="text-lg">Choose where to add the app</p>

            <div className="space-y-4">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full mt-8" 
              onClick={handleInstall}
              disabled={!selectedWorkspace || !selectedBoard || isLoading}
            >
              {isLoading ? 'Installing...' : 'Add app'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallationFlow;