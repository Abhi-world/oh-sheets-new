import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';

interface SheetSelectorProps {
  selectedSheet: string;
  onSheetSelect: (sheetId: string) => void;
}

const SheetSelector = ({ selectedSheet, onSheetSelect }: SheetSelectorProps) => {
  const { sheets, isLoading } = useGoogleSheets();

  return (
    <Select value={selectedSheet} onValueChange={onSheetSelect}>
      <SelectTrigger 
        className="w-[150px] inline-flex bg-navy-light border-none text-white focus:ring-white/20"
      >
        <SelectValue placeholder={isLoading ? "Loading..." : "Select sheet"} />
      </SelectTrigger>
      <SelectContent className="bg-navy-light border-none">
        {sheets.map((s) => (
          <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SheetSelector;