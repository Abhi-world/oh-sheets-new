import React from 'react';
import { Input } from '@/components/ui/input';

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ValueSelector = ({ value, onChange, placeholder = "Enter values" }: ValueSelectorProps) => {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-navy-light border-google-green focus:ring-google-green/50 text-white"
    />
  );
};

export default ValueSelector;