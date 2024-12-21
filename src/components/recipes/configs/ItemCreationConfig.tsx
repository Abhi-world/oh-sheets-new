import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ItemCreationTriggerForm from '@/components/ItemCreationTriggerForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const ItemCreationConfig = () => {
  return (
    <RecipeConfigLayout title="Item Creation Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Configure triggers that activate when new items are created in Monday.com. Automatically track new entries in your Google Sheet."
        />
        
        <Card>
          <CardContent className="pt-6">
            <ItemCreationTriggerForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default ItemCreationConfig;