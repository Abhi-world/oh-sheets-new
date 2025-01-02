import React from 'react';
import RecipeConfigLayout from '../RecipeConfigLayout';
import DateTriggerContent from './date-trigger/DateTriggerContent';

const DateTriggerConfig = () => {
  return (
    <RecipeConfigLayout title="Date-Based Integration">
      <DateTriggerContent />
    </RecipeConfigLayout>
  );
};

export default DateTriggerConfig;