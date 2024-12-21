import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ItemCreationTriggerForm from '@/components/ItemCreationTriggerForm';

const ItemCreationConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Configure triggers that activate when new items are created in Monday.com. 
          Automatically track new entries in your Google Sheet.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ItemCreationTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemCreationConfig;