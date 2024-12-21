import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import DateTriggerForm from '@/components/DateTriggerForm';

const DateTriggerConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Configure a trigger that will add values to your Google Sheet on a specific date. 
          This is useful for scheduling data entries in advance.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <DateTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default DateTriggerConfig;