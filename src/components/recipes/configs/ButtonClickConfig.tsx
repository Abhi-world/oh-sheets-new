import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ButtonClickTriggerForm from '@/components/ButtonClickTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const ButtonClickConfig = () => {
  return (
    <RecipeConfigLayout title="Button Click Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Create triggers that activate when specific buttons are clicked in Monday.com. This allows you to add data to your Google Sheet with a single click."
        />
        
        <Card>
          <CardContent className="pt-6">
            <ButtonClickTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default ButtonClickConfig;