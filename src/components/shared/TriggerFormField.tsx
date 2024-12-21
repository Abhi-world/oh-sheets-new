import React from 'react';
import { Input } from '@/components/ui/input';

interface TriggerFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

const TriggerFormField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text' 
}: TriggerFormFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TriggerFormField;