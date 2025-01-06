import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeConfigLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const RecipeConfigLayout = ({ title, subtitle = "Google Sheets Integration", icon, children }: RecipeConfigLayoutProps) => {
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
          {icon || (
            <img 
              src="/lovable-uploads/68adb195-310b-4fb6-8cce-a0d4e2ab7a4b.png" 
              alt="Google Sheets" 
              className="w-10 h-10"
            />
          )}
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
              This automation monitors status changes in your Monday.com board. When a status column's value 
              changes to your specified condition (e.g., "Done" or "In Progress"), it automatically creates 
              a new row in your selected Google Sheet. This helps track status updates, maintain change history, 
              and automate your workflow between Monday.com and Google Sheets.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecipeConfigLayout;