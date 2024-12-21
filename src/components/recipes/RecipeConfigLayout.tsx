import React from 'react';
import { ArrowLeftCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigLayoutProps {
  children: React.ReactNode;
  title: string;
}

const RecipeConfigLayout = ({ children, title }: RecipeConfigLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#00c875] to-[#00a65a] text-white">
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white/80"
          onClick={() => navigate('/')}
        >
          <ArrowLeftCircle className="w-6 h-6" />
        </Button>
      </div>
      
      {/* Help button */}
      <div className="absolute bottom-4 right-4">
        <Button variant="ghost" className="text-white hover:text-white/80">
          <HelpCircle className="w-6 h-6" />
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="bg-navy-800/20 text-sm text-white/90 px-4 py-2 rounded-lg mb-6">
            This is a pre-built template
          </div>
          <h1 className="text-2xl font-semibold mb-4">{title}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RecipeConfigLayout;