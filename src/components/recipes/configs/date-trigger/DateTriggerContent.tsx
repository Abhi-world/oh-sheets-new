import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';

interface DateTriggerContentProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerContent = ({ onConfigValid }: DateTriggerContentProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#1F2937] rounded-lg">
        <DateTriggerSentence onConfigValid={onConfigValid} />
      </div>
    </div>
  );
};

export default DateTriggerContent;