import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateSelectorProps {
  selectedColumn: string;
  onColumnSelect: (column: string) => void;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  isRelative: boolean;
  onIsRelativeChange: (isRelative: boolean) => void;
  relativeDays: number;
  onRelativeDaysChange: (days: number) => void;
  relativeDirection: 'before' | 'after';
  onRelativeDirectionChange: (direction: 'before' | 'after') => void;
}

const DateSelector = ({
  selectedColumn,
  onColumnSelect,
  selectedTime,
  onTimeSelect,
  isRelative,
  onIsRelativeChange,
  relativeDays,
  onRelativeDaysChange,
  relativeDirection,
  onRelativeDirectionChange
}: DateSelectorProps) => {
  const dateColumns = [
    { id: 'due_date', label: 'Due date' },
    { id: 'timeline_start', label: 'Timeline start date' },
    { id: 'timeline_end', label: 'Timeline end date' }
  ];

  return (
    <span className="inline-flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white underline decoration-dotted hover:decoration-solid">
            {selectedColumn ? dateColumns.find(c => c.id === selectedColumn)?.label : 'date'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
          <div className="p-4">
            <h3 className="mb-4">When to notify on this date?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!isRelative}
                  onChange={() => onIsRelativeChange(false)}
                  className="text-blue-500"
                />
                <span>When date arrives at</span>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => onTimeSelect(e.target.value)}
                  className="w-24 bg-transparent border-white/20"
                  disabled={isRelative}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={isRelative}
                  onChange={() => onIsRelativeChange(true)}
                  className="text-blue-500"
                />
                <Input
                  type="number"
                  value={relativeDays}
                  onChange={(e) => onRelativeDaysChange(Number(e.target.value))}
                  className="w-16 bg-transparent border-white/20"
                  disabled={!isRelative}
                />
                <span>days</span>
                <Select 
                  value={relativeDirection}
                  onValueChange={(value: 'before' | 'after') => onRelativeDirectionChange(value)}
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
                  onChange={(e) => onTimeSelect(e.target.value)}
                  className="w-24 bg-transparent border-white/20"
                  disabled={!isRelative}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </span>
  );
};

export default DateSelector;