import React from 'react';
import DateTriggerContent from './date-trigger/DateTriggerContent';

interface DateTriggerConfigProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerConfig = ({ onConfigValid }: DateTriggerConfigProps) => {
  return (
    <div>
      <DateTriggerContent onConfigValid={onConfigValid} />
    </div>
  );
};

export default DateTriggerConfig;