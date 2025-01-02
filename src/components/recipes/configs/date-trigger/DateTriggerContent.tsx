import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';

const DateTriggerContent = () => {
  return (
    <div className="space-y-6">
      {/* Main content */}
      <div className="bg-[#222222]/90 backdrop-blur-sm rounded-lg p-8">
        <DateTriggerSentence />
      </div>

      {/* Info banner */}
      <div className="bg-[#222222]/80 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
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
    </div>
  );
};

export default DateTriggerContent;