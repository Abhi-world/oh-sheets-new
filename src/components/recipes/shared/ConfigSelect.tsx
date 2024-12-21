import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
}

const ConfigSelect = ({ value, onValueChange, placeholder, options, className }: ConfigSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        <SelectItem value="new">+ Add a new column</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ConfigSelect;