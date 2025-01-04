import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigShellProps {
  children: React.ReactNode;
  onSave?: () => void;
}

const RecipeConfigShell = ({ children, onSave }: RecipeConfigShellProps) => {
  return (
    <div className="space-y-8">
      {/* Main configuration sentence */}
      <div className="bg-[#111827] text-white p-6 rounded-lg">
        {children}
      </div>

      {/* Create Automation Button */}
      {onSave && (
        <div className="flex justify-end">
          <Button 
            onClick={onSave}
            className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white px-8 py-2 rounded-full text-lg"
          >
            Create Automation
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecipeConfigShell;