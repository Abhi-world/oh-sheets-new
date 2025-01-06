import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface SpreadsheetSelectorProps {
  selectedSpreadsheet: string;
  onSpreadsheetSelect: (spreadsheetId: string) => void;
  className?: string;
  placeholder?: string;
}

const SpreadsheetSelector = ({ 
  selectedSpreadsheet, 
  onSpreadsheetSelect, 
  className,
  placeholder = "select..." 
}: SpreadsheetSelectorProps) => {
  const { spreadsheets, isLoading, fetchSpreadsheets } = useGoogleSheets();

  return (
    <Select value={selectedSpreadsheet} onValueChange={onSpreadsheetSelect}>
      <SelectTrigger 
        className={`bg-transparent border-none p-0 h-auto ${className}`}
        onClick={() => fetchSpreadsheets()}
      >
        <SelectValue placeholder={placeholder} />
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