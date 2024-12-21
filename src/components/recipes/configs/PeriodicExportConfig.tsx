import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PeriodicExportForm from '@/components/PeriodicExportForm';

const PeriodicExportConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Set up automated exports from Monday.com to Google Sheets on a regular schedule. 
          Choose how often you want to sync your data.
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <PeriodicExportForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodicExportConfig;