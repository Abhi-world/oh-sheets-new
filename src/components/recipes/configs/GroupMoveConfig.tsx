import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import RecipeHeader from '../shared/RecipeHeader';
import RecipeConfigLayout from '../RecipeConfigLayout';

const GroupMoveConfig = () => {
  return (
    <RecipeConfigLayout title="Group Movement Integration">
      <div className="space-y-6">
        <RecipeHeader 
          description="Set up an automation to trigger when items are moved between groups in your Monday.com board."
        />
        
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This feature is coming soon. Stay tuned for updates!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </RecipeConfigLayout>
  );
};

export default GroupMoveConfig;