import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Button } from '@/components/ui/button';

interface DateTriggerContentProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerContent = ({ onConfigValid }: DateTriggerContentProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#1F2937] rounded-lg">
        <DateTriggerSentence onConfigValid={onConfigValid} />
      </div>

      <div className="flex justify-end">
        <Button 
          className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white px-8 py-2 rounded-full text-lg"
        >
          Create Automation
        </Button>
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