import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MultiItemMenu = () => {
  const navigate = useNavigate();

  const handleBulkSyncSetup = () => {
    navigate('/recipe/status-change');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
            Bulk Sync to Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Set up automatic syncing for multiple items to Google Sheets
          </p>
          <Button 
            onClick={handleBulkSyncSetup}
            className="w-full bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
          >
            Configure Bulk Sync
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiItemMenu;