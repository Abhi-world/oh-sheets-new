import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoogleReconsentGuide = () => {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-500" />
          Google Sheets Re-consent Required
        </CardTitle>
        <CardDescription>
          Recent updates require you to reconnect your Google account with the correct permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Action Required</AlertTitle>
          <AlertDescription className="text-amber-700">
            You need to remove the current Oh Sheets permissions from your Google account and reconnect.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Step 1: Remove Current Permissions</h3>
            <p className="text-gray-600 mb-2">
              Visit your Google Account permissions page and remove access for Oh Sheets.
            </p>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Open Google Permissions
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Step 2: Reconnect in the App</h3>
            <p className="text-gray-600 mb-2">
              Return to Oh Sheets and connect your Google account with the updated permissions.
            </p>
            <Button 
              className="flex items-center gap-2"
              onClick={() => navigate('/connect-sheets')}
            >
              <RefreshCw className="h-4 w-4" />
              Reconnect Google Sheets
            </Button>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Step 3: Verify Connection</h3>
            <p className="text-gray-600">
              After reconnecting, open any dropdown that lists spreadsheets to verify you can see all your spreadsheets, including those in shared drives.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-2">What's Changed</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Fixed scope string format to use proper space-separated URL format</li>
            <li>Enhanced Drive API query to include shared drives</li>
            <li>Improved dropdown functionality to properly list all spreadsheets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleReconsentGuide;