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
        return "When you set up this automation, it will watch for any status changes in your Monday.com board items. For example, when a task status changes from 'In Progress' to 'Done', or from 'Not Started' to 'Working on it', the automation will instantly create a new row in your Google Sheet with all the item's details. This is particularly useful for teams who need to track project progress, create status reports, or maintain an audit trail of task completions.";
      case 'date':
        return "This automation helps you manage date-sensitive tasks and deadlines. When you set it up, you choose specific date columns in your Monday.com board (like 'Due Date' or 'Start Date'). The automation will monitor these dates and when they match your specified trigger date (such as 'today' or '3 days before'), it will automatically add the item's information to your Google Sheet. This is perfect for creating daily task lists, tracking upcoming deadlines, or generating reports of overdue items.";
      case 'button':
        return "This automation adds a custom action button to your Monday.com items. Once configured, users can click this button to instantly export the item's data to your Google Sheet. For example, you might create a 'Mark as Reviewed' button that, when clicked, sends the item details to a 'Reviewed Items' spreadsheet. This is especially useful for approval processes, quality checks, or when you need manual control over when data is exported.";
      case 'column':
        return "This automation monitors specific columns in your Monday.com board for value changes. For instance, if you're tracking a 'Priority' column, you can set it to trigger when the priority changes from 'Low' to 'High'. When such a change occurs, it will update or add a new row in your Google Sheet. This helps teams track important changes, create alerts for critical updates, or maintain historical records of how values evolve over time.";
      case 'person':
        return "This automation tracks assignment changes in your Monday.com board. Whenever someone is assigned to or removed from an item, the automation will record this change in your Google Sheet. For example, you can track who was assigned to a task, when the assignment happened, and maintain a history of task ownership. This is invaluable for resource management, workload tracking, and team accountability reporting.";
      case 'group':
        return "This automation monitors item movements between groups in your Monday.com board. When items are moved from one group to another (like from 'To Do' to 'In Progress'), it automatically records this transition in your Google Sheet. This is particularly useful for tracking workflow stages, process compliance, and creating progress reports. For example, you can track how long items spend in each stage of your process.";
      case 'item':
        return "This automation triggers whenever new items are created in your Monday.com board. As soon as a new item is added, all its initial data is automatically exported to your specified Google Sheet. This helps maintain a complete inventory of all items, create backup records, or generate reports of new entries. It's particularly useful for teams who need to track when and what new tasks, projects, or items are being created.";
      case 'form':
        return "This automation captures data from Monday.com form submissions and instantly transfers it to your Google Sheet. When someone submits a form (like a request form, feedback survey, or application), all their responses are automatically organized in your spreadsheet. This streamlines data collection, eliminates manual data entry, and helps create organized databases of form responses that can be easily analyzed or shared.";
      case 'periodic':
        return "This automation runs on a schedule that you define (daily, weekly, or monthly). At your specified times, it automatically exports data from your Monday.com board to Google Sheets. For example, you can set it to create daily snapshots of your board at 5 PM, or generate weekly progress reports every Monday morning. This ensures your spreadsheet data is always up to date without any manual intervention.";
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