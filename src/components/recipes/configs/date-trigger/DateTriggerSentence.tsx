import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import DateSelector from './DateSelector';
import ValueSelector from '@/components/shared/ValueSelector';

interface DateTriggerSentenceProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerSentence = ({ onConfigValid }: DateTriggerSentenceProps) => {
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [isRelative, setIsRelative] = useState(false);
  const [relativeDays, setRelativeDays] = useState(1);
  const [relativeDirection, setRelativeDirection] = useState<'before' | 'after'>('before');
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
      <p className="text-xl text-white/90 leading-relaxed">
        When{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid">
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
        <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
          <SelectTrigger className="w-[200px] inline-flex bg-[#374151] border-none text-white">
            <SelectValue placeholder="spreadsheet" />
          </SelectTrigger>
          <SelectContent className="bg-[#374151] border-white/10">
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
        {' / '}
        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger className="w-[150px] inline-flex bg-[#374151] border-none text-white">
            <SelectValue placeholder="sheet" />
          </SelectTrigger>
          <SelectContent className="bg-[#374151] border-white/10">
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
        {' with these '}
        <ValueSelector
          value={selectedValues.join(',')}
          onChange={(val) => setSelectedValues(val.split(',').filter(Boolean))}
          className="inline-flex bg-[#374151] border-none text-white"
          placeholder="values"
        />
      </p>
    </div>
  );
};

export default DateTriggerSentence;