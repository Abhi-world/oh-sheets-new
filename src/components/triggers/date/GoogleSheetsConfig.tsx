import React from 'react';
import { Input } from '@/components/ui/input';

interface GoogleSheetsConfigProps {
  spreadsheetId: string;
  sheetId: string;
  onSpreadsheetChange: (value: string) => void;
  onSheetChange: (value: string) => void;
}

const GoogleSheetsConfig = ({ 
  spreadsheetId, 
  sheetId, 
  onSpreadsheetChange, 
  onSheetChange 
}: GoogleSheetsConfigProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Google Spreadsheet ID</label>
        <Input 
          value={spreadsheetId}
          onChange={(e) => onSpreadsheetChange(e.target.value)}
          placeholder="Enter spreadsheet ID"
          required 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sheet Name/ID</label>
        <Input 
          value={sheetId}
          onChange={(e) => onSheetChange(e.target.value)}
          placeholder="Enter sheet name or ID"
          required 
        />
      </div>
    </div>
  );
};

export default GoogleSheetsConfig;