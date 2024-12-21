import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import FormSubmissionTriggerForm from '@/components/FormSubmissionTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const FormSubmissionConfig = () => {
  return (
    <RecipeConfigLayout title="Form Submission Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Configure triggers that activate when specific forms are submitted in Monday.com. This allows you to automatically capture form responses in your Google Sheet."
        />
        
        <Card>
          <CardContent className="pt-6">
            <FormSubmissionTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default FormSubmissionConfig;