import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import SheetSelector from './date-trigger/SheetSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DateTriggerConfig = () => {
  const [selectedDateColumn, setSelectedDateColumn] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [isRelative, setIsRelative] = useState(false);
  const [relativeDays, setRelativeDays] = useState(1);
  const [relativeDirection, setRelativeDirection] = useState<'before' | 'after'>('before');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const dateColumns = [
    { id: 'due_date', label: 'Due date' },
    { id: 'timeline_start', label: 'Timeline start date' },
    { id: 'timeline_end', label: 'Timeline end date' }
  ];

  const mondayColumns = [
    { value: 'budget', label: 'Budget' },
    { value: 'due_date', label: 'Due date' },
    { value: 'item_id', label: 'Item ID' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner' },
    { value: 'priority', label: 'Priority' }
  ];

  const handleAddNewDateColumn = () => {
    toast.info('Adding new date column - Feature coming soon');
  };

  return (
    <div className="text-2xl leading-relaxed text-white">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            When
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isRelative}
                onChange={() => setIsRelative(false)}
                className="text-blue-500"
              />
              <span>When date arrives at</span>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-24 bg-transparent border border-white/20 rounded px-2 py-1"
                disabled={isRelative}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                checked={isRelative}
                onChange={() => setIsRelative(true)}
                className="text-blue-500"
              />
              <input
                type="number"
                value={relativeDays}
                onChange={(e) => setRelativeDays(Number(e.target.value))}
                className="w-16 bg-transparent border border-white/20 rounded px-2 py-1"
                disabled={!isRelative}
              />
              <span>days</span>
              <select
                value={relativeDirection}
                onChange={(e) => setRelativeDirection(e.target.value as 'before' | 'after')}
                className="bg-transparent border border-white/20 rounded px-2 py-1"
                disabled={!isRelative}
              >
                <option value="before">before</option>
                <option value="after">after</option>
              </select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {' '}
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            {selectedDateColumn ? dateColumns.find(c => c.id === selectedDateColumn)?.label : 'date'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <h3 className="mb-4">Select a date column</h3>
            <div className="space-y-2">
              {dateColumns.map(column => (
                <button
                  key={column.id}
                  className="w-full text-left px-2 py-1 hover:bg-white/10 rounded"
                  onClick={() => setSelectedDateColumn(column.id)}
                >
                  {column.label}
                </button>
              ))}
              <button
                className="w-full text-left px-2 py-1 hover:bg-white/10 rounded text-blue-400 flex items-center gap-2"
                onClick={handleAddNewDateColumn}
              >
                <Plus className="w-4 h-4" />
                Add a new column
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {' '}arrives, add a row in{' '}
      <SheetSelector
        spreadsheets={spreadsheets}
        sheets={sheets}
        selectedSpreadsheet={selectedSpreadsheet}
        selectedSheet={selectedSheet}
        onSpreadsheetSelect={setSelectedSpreadsheet}
        onSheetSelect={setSelectedSheet}
      />
      {' '}with these{' '}
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            values
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3>Select values to sync</h3>
              <Button 
                size="sm"
                variant="outline"
                className="border-white/20 hover:bg-white/10"
                onClick={() => toast.info('Adding custom value - Feature coming soon')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {mondayColumns.map(column => (
                <div key={column.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(column.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedValues([...selectedValues, column.value]);
                      } else {
                        setSelectedValues(selectedValues.filter(v => v !== column.value));
                      }
                    }}
                    className="text-blue-500"
                  />
                  <span>{column.label}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Information box */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-white mt-1 flex-shrink-0" />
          <div>
            <p className="text-white/90 text-base">
              This automation will trigger when the specified date arrives, adding a new row to your selected Google Sheet with the chosen values.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTriggerConfig;