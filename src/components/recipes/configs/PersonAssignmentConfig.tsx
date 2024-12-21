import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PersonAssignmentTriggerForm from '@/components/PersonAssignmentTriggerForm';

const PersonAssignmentConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Set up triggers that activate when specific people are assigned to items in Monday.com. 
          Track assignments and team workload in your Google Sheet.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <PersonAssignmentTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonAssignmentConfig;