import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigShellProps {
  children: React.ReactNode;
  title: string;
  description: string;
  onSave?: () => void;
}

const RecipeConfigShell = ({ children, title, description, onSave }: RecipeConfigShellProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00c875] to-[#00a65a] text-white p-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 text-white hover:text-white/80"
        onClick={() => navigate('/')}
      >
        <ArrowLeftCircle className="w-6 h-6" />
      </Button>

      {/* Pre-built template banner */}
      <div className="bg-navy-800/20 text-sm text-white/90 px-4 py-2 rounded-lg mb-6 inline-flex items-center gap-2">
        <span>This is a pre-built template</span>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-white/80">{description}</p>
        </div>
        {children}
      </div>

      {/* Google Sheets icon and Help button */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-white/90">
        <img 
          src="/lovable-uploads/55c54574-060a-410d-8dd8-64cf691dc4bb.png" 
          alt="Google Sheets" 
          className="w-8 h-8"
        />
        <span>Google Sheets</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 text-white hover:bg-white/20"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default RecipeConfigShell;