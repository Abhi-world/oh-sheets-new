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
  automationType?: 'status' | 'date' | 'button' | 'column' | 'person' | 'group' | 'item' | 'form' | 'periodic';
}

const RecipeConfigLayout = ({ 
  title, 
  subtitle = "Google Sheets Integration", 
  icon, 
  children,
  automationType 
}: RecipeConfigLayoutProps) => {
  const navigate = useNavigate();

  const getAutomationExplanation = () => {
    switch (automationType) {
      case 'status':
        return "This automation monitors status changes in your Monday.com board. When an item's status changes, it automatically creates a new row in your selected Google Sheet. This helps track status updates, maintain change history, and keep your data synchronized between platforms.";
      case 'date':
        return "This automation triggers based on specific dates in your Monday.com board. When a date matches your configured trigger date, it automatically adds the item's data to your Google Sheet. Perfect for deadline tracking, milestone monitoring, and scheduled data exports.";
      case 'button':
        return "This automation creates a custom button in Monday.com that, when clicked, instantly sends the item's data to your Google Sheet. It's ideal for manual data exports, approval workflows, and creating audit trails of specific actions.";
      case 'column':
        return "This automation watches for changes in specific column values. When values change from one state to another in your Monday.com board, it automatically updates the corresponding data in your Google Sheet, ensuring data consistency across platforms.";
      case 'person':
        return "This automation triggers when someone is assigned to an item in Monday.com. When an assignment occurs, it automatically records the assignment details in your Google Sheet, helping track task ownership and workload distribution.";
      case 'group':
        return "This automation monitors when items are moved between groups in Monday.com. When an item is moved to a specified group, it automatically logs this change in your Google Sheet, perfect for tracking workflow progression and process compliance.";
      case 'item':
        return "This automation activates whenever a new item is created in Monday.com. It automatically adds the new item's details to your Google Sheet, helping maintain a comprehensive record of all items and their initial data.";
      case 'form':
        return "This automation captures form submissions in Monday.com and instantly records them in your Google Sheet. It's perfect for collecting and organizing form responses, survey data, and customer feedback in a structured spreadsheet format.";
      case 'periodic':
        return "This automation runs on a schedule you define, regularly exporting data from Monday.com to Google Sheets. It's ideal for creating daily/weekly reports, maintaining backup records, and ensuring your spreadsheet data stays up to date automatically.";
      default:
        return "This automation helps synchronize your Monday.com data with Google Sheets, streamlining your workflow and keeping your information organized across platforms.";
    }
  };

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
              {getAutomationExplanation()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecipeConfigLayout;