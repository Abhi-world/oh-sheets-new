import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigLayoutProps {
  title: string;
  children: React.ReactNode;
}

const RecipeConfigLayout = ({ title, children }: RecipeConfigLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] p-8">
      <Button 
        variant="ghost" 
        className="mb-6 text-white hover:bg-white/10"
        onClick={() => navigate('/')}
      >
        <ChevronLeft className="w-5 h-5 mr-2" />
        Back to Templates
      </Button>

      {/* Pre-built template banner with Google Sheets branding */}
      <div className="bg-white/10 backdrop-blur-sm text-white/90 px-6 py-3 rounded-lg mb-6 flex items-center gap-4">
        <img 
          src="/lovable-uploads/68adb195-310b-4fb6-8cce-a0d4e2ab7a4b.png" 
          alt="Google Sheets" 
          className="w-8 h-8"
        />
        <div>
          <div className="font-medium">Google Sheets Integration</div>
          <div className="text-sm opacity-80">This is a pre-built template</div>
        </div>
      </div>

      <Card className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-none">
        <div className="p-8">
          <h2 className="text-2xl font-semibold mb-8 text-gray-800">{title}</h2>
          
          {children}
          
          {/* Help button in footer */}
          <div className="mt-8 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-recipe-green/90 rounded-full bg-recipe-green"
            >
              <HelpCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecipeConfigLayout;