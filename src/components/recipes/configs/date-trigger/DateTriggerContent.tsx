import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';

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