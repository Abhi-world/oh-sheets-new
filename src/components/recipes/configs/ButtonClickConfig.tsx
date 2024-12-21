import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ButtonClickTriggerForm from '@/components/ButtonClickTriggerForm';

const ButtonClickConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Create triggers that activate when specific buttons are clicked in Monday.com. 
          This allows you to add data to your Google Sheet with a single click.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <ButtonClickTriggerForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default ButtonClickConfig;