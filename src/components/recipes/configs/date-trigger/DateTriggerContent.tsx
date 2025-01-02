import React, { useState } from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const DateTriggerContent = () => {
  const navigate = useNavigate();
  const [isConfigValid, setIsConfigValid] = useState(false);

  const handleCreateAutomation = () => {
    // Here we'll implement the automation creation logic
    console.log('Creating automation with current configuration');
    toast.success('Automation created successfully!');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Main content */}
      <div className="bg-[#222222] backdrop-blur-sm rounded-lg p-8">
        <DateTriggerSentence onConfigValid={setIsConfigValid} />
      </div>

      {/* Info banner */}
      <div className="bg-[#2A2F3C] backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
        <Calendar className="w-6 h-6 text-gray-100 mt-1 flex-shrink-0" />
        <div className="space-y-2 text-gray-100">
          <p>
            This automation will trigger when the specified date arrives, adding a new row
            to your selected Google Sheet with the chosen values.
          </p>
          <p>
            The values shown above are common examples, but you can add custom values or leave them
            empty. The automation will still work with any value change in the selected column.
          </p>
        </div>
      </div>

      {/* Google Sheets branding */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-white/90">
        <img 
          src="/lovable-uploads/55c54574-060a-410d-8dd8-64cf691dc4bb.png" 
          alt="Google Sheets" 
          className="w-8 h-8"
        />
        <span>Google Sheets</span>
      </div>

      {/* Create Automation button */}
      <div className="fixed bottom-8 right-8">
        <Button
          onClick={handleCreateAutomation}
          className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white px-8 py-6 text-lg rounded-lg shadow-lg transition-all hover:shadow-xl"
          disabled={!isConfigValid}
        >
          Create Automation
        </Button>
      </div>
    </div>
  );
};

export default DateTriggerContent;