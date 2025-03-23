import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface SheetSelectorProps {
  spreadsheets: Array<{ id: string; name: string }>;
  sheets: Array<{ id: string; name: string }>;
  selectedSpreadsheet: string;
  selectedSheet: string;
  onSpreadsheetSelect: (id: string) => void;
  onSheetSelect: (id: string) => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

const SheetSelector = ({
  spreadsheets,
  sheets,
  selectedSpreadsheet,
  selectedSheet,
  onSpreadsheetSelect,
  onSheetSelect,
  onRefresh,
  isLoading
}: SheetSelectorProps) => {
  const [searchSpreadsheetTerm, setSearchSpreadsheetTerm] = useState('');
  const [searchSheetTerm, setSearchSheetTerm] = useState('');
  
  const filteredSpreadsheets = spreadsheets.filter(s => 
    s.name.toLowerCase().includes(searchSpreadsheetTerm.toLowerCase())
  );
  
  const filteredSheets = sheets.filter(s => 
    s.name.toLowerCase().includes(searchSheetTerm.toLowerCase())
  );
  return (
    <span className="inline-flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <Input
              placeholder="Search spreadsheets..."
              value={searchSpreadsheetTerm}
              onChange={(e) => setSearchSpreadsheetTerm(e.target.value)}
              className="mb-4 bg-[#374151] border-white/10 text-white placeholder:text-white/50"
            />
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filteredSpreadsheets.map(sheet => (
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
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <Input
              placeholder="Search sheets..."
              value={searchSheetTerm}
              onChange={(e) => setSearchSheetTerm(e.target.value)}
              className="mb-4 bg-[#374151] border-white/10 text-white placeholder:text-white/50"
            />
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {filteredSheets.map(sheet => (
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