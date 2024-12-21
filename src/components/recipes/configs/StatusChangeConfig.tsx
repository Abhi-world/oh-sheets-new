import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import StatusTriggerForm from '@/components/StatusTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const StatusChangeConfig = () => {
  return (
    <RecipeConfigLayout title="Status Change Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Set up triggers that activate when status changes occur in Monday.com. Automatically track status updates in your Google Sheet."
        />
        
        <Card>
          <CardContent className="pt-6">
            <StatusTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default StatusChangeConfig;