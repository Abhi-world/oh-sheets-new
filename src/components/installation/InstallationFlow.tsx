import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import InstallationHeader from './InstallationHeader';
import InstallationStep1 from './InstallationStep1';
import InstallationStep2 from './InstallationStep2';

const InstallationFlow = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState('all');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInstall = async () => {
    try {
      setIsLoading(true);
      console.log('Installing app for workspace:', selectedWorkspace);
      console.log('Selected board:', selectedBoard);
      
      // Here you would make the actual API call to Monday.com to install the app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('App installed successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install app');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-[#6366F1]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/50 via-purple-500/30 to-pink-500/40" />
      
      <div className="relative p-6">
        <div className="mx-auto max-w-2xl">
          <InstallationHeader 
            onBack={() => step > 1 ? setStep(step - 1) : navigate('/')}
            onClose={() => navigate('/')}
          />

          {step === 1 && (
            <InstallationStep1
              workspaceType={workspaceType}
              selectedWorkspace={selectedWorkspace}
              onWorkspaceTypeChange={setWorkspaceType}
              onWorkspaceSelect={setSelectedWorkspace}
              onNext={() => setStep(2)}
              isLoading={isLoading}
            />
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