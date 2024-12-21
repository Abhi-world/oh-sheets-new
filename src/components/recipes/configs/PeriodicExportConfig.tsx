import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PeriodicExportForm from '@/components/PeriodicExportForm';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const PeriodicExportConfig = () => {
  return (
    <RecipeConfigLayout title="Periodic Export Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Set up automated exports from Monday.com to Google Sheets on a regular schedule. Choose how often you want to sync your data."
        />
        
        <Card>
          <CardContent className="pt-6">
            <PeriodicExportForm />
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default PeriodicExportConfig;