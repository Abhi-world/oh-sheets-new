import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ItemMenu = () => {
  const navigate = useNavigate();

  const handleSyncSetup = () => {
    navigate('/recipe/item-creation');
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
            Sync to Google Sheets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Set up automatic syncing between this item and Google Sheets
          </p>
          <Button 
            onClick={handleSyncSetup}
            className="w-full bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
          >
            Configure Sync
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemMenu;