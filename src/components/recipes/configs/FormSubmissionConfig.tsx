import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FormSubmissionTriggerForm from '@/components/FormSubmissionTriggerForm';

const FormSubmissionConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Configure triggers that activate when specific forms are submitted in Monday.com. 
          This allows you to automatically capture form responses in your Google Sheet.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <FormSubmissionTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default FormSubmissionConfig;