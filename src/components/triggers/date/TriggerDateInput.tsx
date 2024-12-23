import React from 'react';
import { Input } from '@/components/ui/input';

interface TriggerDateInputProps {
  value: string;
  onChange: (value: string) => void;
}

const TriggerDateInput = ({ value, onChange }: TriggerDateInputProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Trigger Date</label>
      <Input 
        type="date" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required 
      />
    </div>
  );
};

export default TriggerDateInput;