import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAutomationExplanation } from '@/utils/automationExplanations';

interface RecipeConfigLayoutProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  automationType?: 'status' | 'date' | 'button' | 'column' | 'person' | 'group' | 'item' | 'form' | 'periodic';
}

const AppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 512 512"
    className="w-10 h-10"
  >
    <rect width="512" height="512" rx="51.2" fill="#00c875"/>
    <path 
      d="M 307.2 128 H 179.2 C 167.6 128 156.4 132.8 148 141.2 C 139.6 149.6 134.8 160.8 134.8 172.4 V 339.6 C 134.8 351.2 139.6 362.4 148 370.8 C 156.4 379.2 167.6 384 179.2 384 H 332.8 C 344.4 384 355.6 379.2 364 370.8 C 372.4 362.4 377.2 351.2 377.2 339.6 V 198 L 307.2 128 Z" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 307.2 128 V 198 H 377.2" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 179.2 268 H 332.8" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path 
      d="M 256 233 V 303" 
      fill="none" 
      stroke="white" 
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RecipeConfigLayout = ({ 
  title, 
  subtitle = "Google Sheets Integration", 
  icon, 
  children,
  automationType 
}: RecipeConfigLayoutProps) => {
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

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          {icon || <AppIcon />}
          <div>
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="text-white/80">{subtitle}</p>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-[#1F2937] border-none shadow-xl">
          <div className="p-6">
            {children}
          </div>
        </Card>

        {/* How it works section */}
        <Card className="bg-gray-600/50 border-none backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white">?</span>
              </div>
              <h3 className="text-lg font-medium text-white">How does this automation work?</h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              {getAutomationExplanation(automationType)}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecipeConfigLayout;