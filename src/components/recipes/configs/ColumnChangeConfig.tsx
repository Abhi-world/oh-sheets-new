import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';

const ColumnChangeConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Set up triggers that activate when specific column values change in Monday.com. 
          Track changes and updates automatically in your Google Sheet.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ColumnChangeTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;