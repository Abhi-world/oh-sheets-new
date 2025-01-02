import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';

const DateTriggerContent = () => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
        <Calendar className="w-6 h-6 text-white/80 mt-1" />
        <p className="text-white/80">
          This automation will trigger when the specified date arrives, adding a new row
          to your selected Google Sheet with the chosen values.
        </p>
      </div>

      {/* Main content */}
      <div className="bg-gray-400/20 backdrop-blur-sm rounded-lg p-8">
        <DateTriggerSentence />
      </div>
    </div>
  );
};

export default DateTriggerContent;