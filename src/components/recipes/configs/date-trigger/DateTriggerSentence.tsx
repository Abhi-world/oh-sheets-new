import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';

interface DateTriggerSentenceProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerSentence = ({ onConfigValid }: DateTriggerSentenceProps) => {
  const [selectedDateColumn, setSelectedDateColumn] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  useEffect(() => {
    const isValid = selectedDateColumn && selectedSpreadsheet && selectedSheet && selectedValues.length > 0;
    onConfigValid?.(isValid);
  }, [selectedDateColumn, selectedSpreadsheet, selectedSheet, selectedValues, onConfigValid]);

  const dateColumns = [
    { id: 'due_date', label: 'Due date' },
    { id: 'timeline_start', label: 'Timeline start date' },
    { id: 'timeline_end', label: 'Timeline end date' }
  ];

  return (
    <div className="bg-[#1F2937] p-8 rounded-lg">
      <p className="text-2xl text-white/90 leading-relaxed">
        When{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-2xl text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid">
              {selectedDateColumn ? dateColumns.find(c => c.id === selectedDateColumn)?.label : 'date'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#374151] border-none">
            <div className="p-4">
              <div className="flex items-center px-3 py-2 mb-2">
                <Search className="w-4 h-4 text-white/50 mr-2" />
                <Input 
                  placeholder="Search date columns..."
                  className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                />
              </div>
              <div className="space-y-1">
                {dateColumns.map(column => (
                  <button
                    key={column.id}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                    onClick={() => setSelectedDateColumn(column.id)}
                  >
                    {column.label}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {' '}arrives, add a row in{' '}
        <SheetSelector
          items={spreadsheets}
          selectedId={selectedSpreadsheet}
          onSelect={setSelectedSpreadsheet}
          placeholder="spreadsheet"
          className="inline-block"
        />
        {' / '}
        <SheetSelector
          items={sheets}
          selectedId={selectedSheet}
          onSelect={setSelectedSheet}
          placeholder="sheet"
          className="inline-block"
        />
        {' '}with these{' '}
        <ValueSelector
          value={selectedValues.join(',')}
          onChange={(val) => setSelectedValues(val.split(',').filter(Boolean))}
          className="text-2xl text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid"
          placeholder="values"
        />
      </p>
    </div>
  );
};

export default DateTriggerSentence;