import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface SpreadsheetSelectorProps {
  selectedSpreadsheet: string;
  onSpreadsheetSelect: (spreadsheetId: string) => void;
  className?: string;
}

const SpreadsheetSelector = ({ selectedSpreadsheet, onSpreadsheetSelect, className }: SpreadsheetSelectorProps) => {
  const { spreadsheets, isLoading, fetchSpreadsheets } = useGoogleSheets();

  return (
    <Select value={selectedSpreadsheet} onValueChange={onSpreadsheetSelect}>
      <SelectTrigger 
        className={className}
        onClick={() => fetchSpreadsheets()}
      >
        <SelectValue placeholder={isLoading ? "Loading..." : "select spreadsheet"} />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {spreadsheets.map((s) => (
          <SelectItem 
            key={s.id} 
            value={s.id} 
            className="text-white hover:bg-white/10"
          >
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SpreadsheetSelector;