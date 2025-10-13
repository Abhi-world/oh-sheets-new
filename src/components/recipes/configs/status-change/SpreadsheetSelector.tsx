import React, { useEffect } from 'react';
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
  const { spreadsheets, isLoading, fetchSpreadsheets, forceSheetsFetch } = useGoogleSheets();

  // Force fetch spreadsheets on component mount
  useEffect(() => {
    console.log('SpreadsheetSelector mounted, fetching spreadsheets');
    fetchSpreadsheets();
  }, []);

  // Handle spreadsheet selection with improved error handling
  const handleSpreadsheetSelect = (id: string) => {
    console.log('Selected spreadsheet:', id);
    onSpreadsheetSelect(id);
    
    // Force fetch sheets for this spreadsheet
    if (id) {
      forceSheetsFetch(id);
    }
  };

  return (
    <Select value={selectedSpreadsheet} onValueChange={handleSpreadsheetSelect}>
      <SelectTrigger 
        className={`bg-transparent border-none p-0 h-auto underline decoration-dotted hover:decoration-solid ${className}`}
        onClick={() => fetchSpreadsheets()}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {spreadsheets.length === 0 && !isLoading && (
          <SelectItem value="no-spreadsheets" disabled>
            No spreadsheets found
          </SelectItem>
        )}
        {isLoading && (
          <SelectItem value="loading" disabled>
            Loading...
          </SelectItem>
        )}
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