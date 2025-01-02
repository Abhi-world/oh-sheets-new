import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DateSelectorProps {
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
  selectedTime,
  onTimeSelect,
  isRelative,
  onIsRelativeChange,
  relativeDays,
  onRelativeDaysChange,
  relativeDirection,
  onRelativeDirectionChange
}: DateSelectorProps) => {
  return (
    <div className="p-4 bg-[#1F2937] text-white rounded-lg">
      <h3 className="mb-4 text-white/90">When to notify on this date?</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="radio"
            checked={!isRelative}
            onChange={() => onIsRelativeChange(false)}
            className="text-blue-500 w-4 h-4"
          />
          <span className="text-white/90">When date arrives at</span>
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => onTimeSelect(e.target.value)}
            className="w-24 bg-[#374151] border-white/10 text-white"
            disabled={isRelative}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="radio"
            checked={isRelative}
            onChange={() => onIsRelativeChange(true)}
            className="text-blue-500 w-4 h-4"
          />
          <Input
            type="number"
            value={relativeDays}
            onChange={(e) => onRelativeDaysChange(Number(e.target.value))}
            className="w-16 bg-[#374151] border-white/10 text-white"
            disabled={!isRelative}
          />
          <span className="text-white/90">days</span>
          <Select 
            value={relativeDirection}
            onValueChange={(value: 'before' | 'after') => onRelativeDirectionChange(value)}
            disabled={!isRelative}
          >
            <SelectTrigger className="w-24 bg-[#374151] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#374151] border-white/10">
              <SelectItem value="before">before</SelectItem>
              <SelectItem value="after">after</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-white/90">date arrives, at</span>
          <Input
            type="time"
            value={selectedTime}
            onChange={(e) => onTimeSelect(e.target.value)}
            className="w-24 bg-[#374151] border-white/10 text-white"
            disabled={!isRelative}
          />
        </div>
      </div>
    </div>
  );
};

export default DateSelector;