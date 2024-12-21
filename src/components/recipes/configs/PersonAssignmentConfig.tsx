import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PersonAssignmentTriggerForm from '@/components/PersonAssignmentTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const PersonAssignmentConfig = () => {
  return (
    <RecipeConfigLayout title="Person Assignment Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Set up triggers that activate when specific people are assigned to items in Monday.com. Track assignments and team workload in your Google Sheet."
        />
        
        <Card>
          <CardContent className="pt-6">
            <PersonAssignmentTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default PersonAssignmentConfig;