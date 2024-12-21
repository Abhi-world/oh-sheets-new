import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const ColumnChangeConfig = () => {
  return (
    <RecipeConfigLayout title="Column Change Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Set up triggers that activate when specific column values change in Monday.com. Track changes and updates automatically in your Google Sheet."
        />
        
        <Card>
          <CardContent className="pt-6">
            <ColumnChangeTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default ColumnChangeConfig;