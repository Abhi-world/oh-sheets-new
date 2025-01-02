import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-[#0F9D58] p-8 text-white">
      <div className="text-2xl leading-relaxed flex items-center gap-2 flex-wrap">
        When{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white underline decoration-dotted hover:decoration-solid">
              {selectedDateColumn ? dateColumns.find(c => c.id === selectedDateColumn)?.label : 'date'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white p-4">
            <h3 className="mb-4">When to notify on this date?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isRelative}
                  onChange={() => setIsRelative(false)}
                  className="text-blue-500"
                />
                <span>When date arrives at</span>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-24 bg-transparent border-white/20"
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
                <Input
                  type="number"
                  value={relativeDays}
                  onChange={(e) => setRelativeDays(Number(e.target.value))}
                  className="w-16 bg-transparent border-white/20"
                  disabled={!isRelative}
                />
                <span>days</span>
                <Select 
                  value={relativeDirection} 
                  onValueChange={setRelativeDirection}
                  disabled={!isRelative}
                >
                  <SelectTrigger className="w-24 bg-transparent border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">before</SelectItem>
                    <SelectItem value="after">after</SelectItem>
                  </SelectContent>
                </Select>
                <span>date arrives, at</span>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-24 bg-transparent border-white/20"
                  disabled={!isRelative}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {' '}arrives, add a row in{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white underline decoration-dotted hover:decoration-solid">
              {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
            <div className="p-2">
              <Input
                placeholder="Search spreadsheets..."
                className="mb-2 bg-transparent border-white/20"
              />
              {spreadsheets.map(sheet => (
                <Button
                  key={sheet.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => setSelectedSpreadsheet(sheet.id)}
                >
                  {sheet.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        {' '}/{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white underline decoration-dotted hover:decoration-solid">
              {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
            <div className="p-2">
              <Input
                placeholder="Search sheets..."
                className="mb-2 bg-transparent border-white/20"
              />
              {sheets.map(sheet => (
                <Button
                  key={sheet.id}
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => setSelectedSheet(sheet.id)}
                >
                  {sheet.name}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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
      </div>

      <Button 
        className="mt-8 bg-blue-500 hover:bg-blue-600 text-white"
      >
        Create automation
      </Button>

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
    </div>
  );
};

export default DateTriggerConfig;