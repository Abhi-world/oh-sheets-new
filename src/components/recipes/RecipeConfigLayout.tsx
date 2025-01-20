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
        return "This automation monitors status changes in your Monday.com board. When a task's status changes (e.g., from 'Working on it' to 'Done'), it automatically updates your Google Sheet. For example, if you mark a task as 'Complete', the automation will instantly add a new row to your sheet with the task details, status, and completion time. This helps teams track progress, generate status reports, and maintain a history of completed work without manual data entry.";
      case 'date':
        return "This automation tracks date-related events in your Monday.com board. When a task's date matches your specified trigger (like 'today' or '2 days before deadline'), it automatically exports that task's information to Google Sheets. For instance, if you set it to trigger '3 days before due date', it will create a row in your sheet for each task approaching its deadline, helping you stay ahead of upcoming work and manage deadlines effectively.";
      case 'button':
        return "This automation adds a custom action button to your Monday.com items. When someone clicks this button, it instantly exports the item's data to your specified Google Sheet. For example, you might add an 'Approve' button that, when clicked, moves the item's details to an 'Approved Items' spreadsheet. This gives you manual control over when data is exported while automating the export process itself, perfect for approval workflows or quality control processes.";
      case 'column':
        return "This automation watches for changes in specific column values on your Monday.com board. When a value changes (like priority level changing from 'Low' to 'High'), it automatically updates your Google Sheet. For instance, if you're tracking project priorities, whenever a task's priority is updated, the automation will record this change in your sheet, helping you maintain an up-to-date list of high-priority items and track how priorities shift over time.";
      case 'person':
        return "This automation tracks changes in task assignments on your Monday.com board. When someone is assigned to or removed from a task, it automatically records this change in your Google Sheet. For example, when a team member is assigned to a new task, the automation adds an entry to your sheet showing who was assigned, when, and to what task. This helps track workload distribution, maintain assignment history, and monitor team capacity.";
      case 'group':
        return "This automation monitors when items move between groups in your Monday.com board. When an item moves from one group to another (like from 'Planning' to 'In Progress'), it records this transition in your Google Sheet. For example, if you move a task from 'To Do' to 'In Progress', the automation logs when this happened, helping you track how work flows through different stages and identify bottlenecks in your process.";
      case 'item':
        return "This automation triggers whenever new items are created in your Monday.com board. As soon as someone adds a new item, all its details are automatically exported to your Google Sheet. For example, when a new task is created, the automation immediately adds its name, creator, creation date, and other details to your sheet. This helps maintain a complete record of all items and when they were created, perfect for tracking new requests or projects.";
      case 'form':
        return "This automation captures Monday.com form submissions and sends them directly to your Google Sheet. When someone submits a form (like a request form or feedback survey), all their responses are automatically organized in your spreadsheet. For example, if you have a client intake form, each submission will create a new row in your sheet with all the client's information, making it easy to track and manage incoming requests without manual data transfer.";
      case 'periodic':
        return "This automation runs on a schedule you define (hourly, daily, weekly, etc.). At your specified times, it automatically exports data from your Monday.com board to Google Sheets. For example, you could set it to create a daily snapshot of all active tasks at 5 PM, or generate a weekly summary every Monday morning. This ensures you have regular, automated updates of your board's status without any manual intervention.";
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