import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const GroupMoveConfig = () => {
  return (
    <div className="space-y-6">
      <div className="prose">
        <p className="text-gray-600">
          Set up an automation to trigger when items are moved between groups in your Monday.com board.
        </p>
      </div>
      
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
  );
};

export default GroupMoveConfig;