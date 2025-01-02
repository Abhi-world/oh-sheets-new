import React from 'react';
import DateTriggerContent from './date-trigger/DateTriggerContent';
import { ConfigComponentProps } from '@/types/recipe';

const DateTriggerConfig = ({ onConfigValid }: ConfigComponentProps) => {
  return (
    <div>
      <DateTriggerContent onConfigValid={onConfigValid} />
    </div>
  );
};

export default DateTriggerConfig;