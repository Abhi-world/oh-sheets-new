import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateColumnSelectProps {
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

const DateColumnSelect = ({
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
}: DateColumnSelectProps) => {
  const dateColumns = [
    { id: 'due_date', label: 'Due date' },
    { id: 'timeline_start', label: 'Timeline start date' },
    { id: 'timeline_end', label: 'Timeline end date' }
  ];

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <Calendar className="mr-2 h-4 w-4" />
            {selectedColumn ? dateColumns.find(c => c.id === selectedColumn)?.label : 'Select date column'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2">
            {dateColumns.map((column) => (
              <Button
                key={column.id}
                variant="ghost"
                className="w-full justify-start text-left"
                onClick={() => onColumnSelect(column.id)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {column.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-blue-500"
            >
              + Add a new column
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          <input
            type="checkbox"
            checked={isRelative}
            onChange={(e) => onIsRelativeChange(e.target.checked)}
            className="mr-2"
          />
          Use relative timing
        </label>

        {isRelative ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={relativeDays}
              onChange={(e) => onRelativeDaysChange(Number(e.target.value))}
              className="w-20"
            />
            <span>days</span>
            <Select value={relativeDirection} onValueChange={onRelativeDirectionChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">before</SelectItem>
                <SelectItem value="after">after</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeSelect(e.target.value)}
              className="w-[120px]"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateColumnSelect;