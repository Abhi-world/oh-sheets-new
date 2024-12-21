import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DateTriggerForm from '@/components/DateTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const DateTriggerConfig = () => {
  return (
    <RecipeConfigLayout title="Date Trigger Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Configure a trigger that will add values to your Google Sheet on a specific date. This is useful for scheduling data entries in advance."
        />
        
        <Card>
          <CardContent className="pt-6">
            <DateTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default DateTriggerConfig;