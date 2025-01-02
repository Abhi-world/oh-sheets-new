import React, { useState, useEffect } from 'react';
import DateTriggerSentence from './DateTriggerSentence';
import { Calendar } from 'lucide-react';

const DateTriggerContent = () => {
  return (
    <div className="space-y-6">
      {/* Main content */}
      <div className="bg-[#222222] backdrop-blur-sm rounded-lg p-8">
        <DateTriggerSentence />
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
    </div>
  );
};

export default DateTriggerContent;