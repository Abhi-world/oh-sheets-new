import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TriggerSettingsProps {
  triggerDate: string;
  triggerTime: string;
  isRelative: boolean;
  relativeDays: string;
  relativeDirection: 'before' | 'after';
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onIsRelativeChange: (value: boolean) => void;
  onRelativeDaysChange: (value: string) => void;
  onRelativeDirectionChange: (value: 'before' | 'after') => void;
}

const TriggerSettings = ({
  triggerDate,
  triggerTime,
  isRelative,
  relativeDays,
  relativeDirection,
  onDateChange,
  onTimeChange,
  onIsRelativeChange,
  onRelativeDaysChange,
  onRelativeDirectionChange,
}: TriggerSettingsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Trigger Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white">Date</label>
          <Input
            type="date"
            value={triggerDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-navy-light border-google-green"
          />
        </div>
        <div>
          <label className="text-sm text-white">Time</label>
          <Input
            type="time"
            value={triggerTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="bg-navy-light border-google-green"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm text-white">
          <input
            type="checkbox"
            checked={isRelative}
            onChange={(e) => onIsRelativeChange(e.target.checked)}
            className="mr-2"
          />
          Use Relative Timing
        </label>
        
        {isRelative && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              value={relativeDays}
              onChange={(e) => onRelativeDaysChange(e.target.value)}
              placeholder="Number of days"
              className="bg-navy-light border-google-green"
            />
            <Select value={relativeDirection} onValueChange={onRelativeDirectionChange}>
              <SelectTrigger className="bg-navy-light border-google-green">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">Before</SelectItem>
                <SelectItem value="after">After</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default TriggerSettings;