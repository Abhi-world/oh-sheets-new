import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';

const DateTriggerContent = () => {
  return (
    <Card className="w-full bg-white shadow-lg">
      <CardContent className="p-8">
        <div className="text-2xl leading-relaxed text-gray-800">
          <DateTriggerSentence />
        </div>

        {/* Information box */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600 text-base">
                This automation will trigger when the specified date arrives, adding a new row to your selected Google Sheet with the chosen values.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateTriggerContent;