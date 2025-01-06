import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface SheetSelectorProps {
  selectedSheet: string;
  onSheetSelect: (sheetId: string) => void;
  className?: string;
  placeholder?: string;
}

const SheetSelector = ({ 
  selectedSheet, 
  onSheetSelect, 
  className,
  placeholder = "select sheet"
}: SheetSelectorProps) => {
  const { sheets, isLoading } = useGoogleSheets();

  return (
    <Select value={selectedSheet} onValueChange={onSheetSelect}>
      <SelectTrigger className={`bg-transparent border-none p-0 h-auto underline decoration-dotted ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {sheets.map((s) => (
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

export default SheetSelector;