import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';

interface DateTriggerContentProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerContent = ({ onConfigValid }: DateTriggerContentProps) => {
  return (
    <div className="space-y-6">
      {/* Main content */}
      <div className="bg-[#222222] backdrop-blur-sm rounded-lg p-8">
        <DateTriggerSentence onConfigValid={onConfigValid} />
      </div>

      {/* Info banner */}
      <div className="bg-[#222222]/50 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-6 h-6 text-white mt-1" />
          <div>
            <h3 className="text-white font-medium mb-1">
              How does this automation work?
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              This automation will monitor the selected date column in your Monday.com board. 
              When the specified date condition is met (either on the exact date or the offset you set), 
              it will automatically create a new row in your chosen Google Sheet with the values you selected.
            </p>
          </div>
        </div>
      </div>

      {/* Google Sheets branding */}
      <div className="fixed bottom-4 left-4 flex items-center gap-2 text-white/80">
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

export default DateTriggerContent;