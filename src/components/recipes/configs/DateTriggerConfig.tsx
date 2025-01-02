import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SheetSelector from './date-trigger/SheetSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  return (
    <div className="text-2xl leading-relaxed text-white">
      When{' '}
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
                <Button
                  key={column.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => setSelectedDateColumn(column.id)}
                >
                  {column.label}
                </Button>
              ))}
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
          <div className="p-2 space-y-2">
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
            <Button
              variant="ghost"
              className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              onClick={() => {
                toast.info('Add new column functionality coming soon');
              }}
            >
              + Add a new column
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Information box */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-white mt-1 flex-shrink-0" />
          <div>
            <p className="text-white/90">
              This automation will trigger when the specified date arrives, adding a new row to your selected Google Sheet with the chosen values.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          size="lg"
          className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white"
          onClick={() => {
            toast.success('Automation created successfully');
          }}
        >
          Create Automation
        </Button>
      </div>
    </div>
  );
};

export default DateTriggerConfig;