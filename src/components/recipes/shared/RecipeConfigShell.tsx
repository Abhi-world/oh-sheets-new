import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: React.ReactNode;
  onSave?: () => void;
}

const RecipeConfigShell = ({ children, title, description, icon, onSave }: RecipeConfigShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-600 hover:text-gray-800"
        onClick={() => navigate('/')}
      >
        <ArrowLeftCircle className="w-5 h-5 mr-2" />
        Back to Templates
      </Button>

      {/* Main content */}
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          </div>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {children}
        </div>

        {onSave && (
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={onSave}
              className="bg-google-green hover:bg-google-green/90 text-white"
            >
              Create Automation
            </Button>
          </div>
        )}
      </div>

      {/* Google Sheets icon */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-gray-600">
        <img 
          src="/lovable-uploads/55c54574-060a-410d-8dd8-64cf691dc4bb.png" 
          alt="Google Sheets" 
          className="w-8 h-8"
        />
        <span>Google Sheets</span>
      </div>
    </div>
  );
};

export default RecipeConfigShell;