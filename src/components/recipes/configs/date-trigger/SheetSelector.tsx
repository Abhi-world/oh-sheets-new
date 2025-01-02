import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SheetSelectorProps {
  spreadsheets: Array<{ id: string; name: string }>;
  sheets: Array<{ id: string; name: string }>;
  selectedSpreadsheet: string;
  selectedSheet: string;
  onSpreadsheetSelect: (id: string) => void;
  onSheetSelect: (id: string) => void;
}

const SheetSelector = ({
  spreadsheets,
  sheets,
  selectedSpreadsheet,
  selectedSheet,
  onSpreadsheetSelect,
  onSheetSelect
}: SheetSelectorProps) => {
  return (
    <span className="inline-flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-gray-800 underline decoration-dotted hover:decoration-solid">
            {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <Input
              placeholder="Search spreadsheets..."
              className="mb-4 bg-[#374151] border-white/10 text-white placeholder:text-white/50"
            />
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {spreadsheets.map(sheet => (
                <Button
                  key={sheet.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => onSpreadsheetSelect(sheet.id)}
                >
                  {sheet.name}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {' / '}
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-gray-800 underline decoration-dotted hover:decoration-solid">
            {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <Input
              placeholder="Search sheets..."
              className="mb-4 bg-[#374151] border-white/10 text-white placeholder:text-white/50"
            />
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {sheets.map(sheet => (
                <Button
                  key={sheet.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => onSheetSelect(sheet.id)}
                >
                  {sheet.name}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </span>
  );
};

export default SheetSelector;