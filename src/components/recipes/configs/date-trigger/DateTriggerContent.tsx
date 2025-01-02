import React from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const DateTriggerContent = () => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 flex items-start gap-3">
        <Calendar className="w-6 h-6 text-gray-600 mt-1" />
        <p className="text-gray-600">
          This automation will trigger when the specified date arrives, adding a new row
          to your selected Google Sheet with the chosen values.
        </p>
      </div>

      {/* Main content */}
      <Card className="p-6 bg-white shadow-sm border border-gray-200">
        <DateTriggerSentence />
      </Card>
    </div>
  );
};

export default DateTriggerContent;