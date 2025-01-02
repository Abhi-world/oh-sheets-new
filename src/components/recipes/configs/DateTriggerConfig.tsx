import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ConfigSelect from '../shared/ConfigSelect';
import DateColumnSelect from './date-trigger/DateColumnSelect';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DateTriggerConfig = () => {
  const [selectedDateColumn, setSelectedDateColumn] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [isRelative, setIsRelative] = useState(false);
  const [relativeDays, setRelativeDays] = useState(1);
  const [relativeDirection, setRelativeDirection] = useState<'before' | 'after'>('before');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const mondayColumns = [
    { value: 'budget', label: 'Budget' },
    { value: 'due_date', label: 'Due date' },
    { value: 'item_id', label: 'Item ID' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner' },
    { value: 'priority', label: 'Priority' }
  ];

  const handleAddValue = (value: string) => {
    if (!selectedValues.includes(value)) {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleRemoveValue = (value: string) => {
    setSelectedValues(selectedValues.filter(v => v !== value));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-xl leading-relaxed text-gray-800 flex items-center gap-2 flex-wrap">
          When
          <DateColumnSelect
            selectedColumn={selectedDateColumn}
            onColumnSelect={setSelectedDateColumn}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
            isRelative={isRelative}
            onIsRelativeChange={setIsRelative}
            relativeDays={relativeDays}
            onRelativeDaysChange={setRelativeDays}
            relativeDirection={relativeDirection}
            onRelativeDirectionChange={setRelativeDirection}
          />
          in
          <ConfigSelect
            label=""
            value={selectedBoard}
            onValueChange={setSelectedBoard}
            options={[
              { value: 'board1', label: 'Main Board' },
              { value: 'board2', label: 'Development Board' },
            ]}
            placeholder="Select board"
            className="inline-block w-[200px]"
          />
          , add a row in
          <ConfigSelect
            label=""
            value={selectedSpreadsheet}
            onValueChange={setSelectedSpreadsheet}
            options={spreadsheets.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select spreadsheet"
            className="inline-block w-[200px]"
          />
          /
          <ConfigSelect
            label=""
            value={selectedSheet}
            onValueChange={setSelectedSheet}
            options={sheets.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select sheet"
            className="inline-block w-[200px]"
          />
          with these
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                values ({selectedValues.length})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px]">
              <div className="space-y-2">
                {mondayColumns.map(column => (
                  <div key={column.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(column.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAddValue(column.value);
                        } else {
                          handleRemoveValue(column.value);
                        }
                      }}
                    />
                    <span>{column.label}</span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2 text-blue-500"
                  onClick={() => {
                    // TODO: Implement add new column functionality
                    toast.info('Add new column functionality coming soon');
                  }}
                >
                  + Add a new column
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </p>

        {/* Information box */}
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-google-green mt-1 flex-shrink-0" />
            <div>
              <p className="text-gray-600">
                This automation will trigger when the specified date column reaches the configured time, adding a new row to your selected Google Sheet with the chosen values.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTriggerConfig;