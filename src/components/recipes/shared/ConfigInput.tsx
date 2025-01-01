import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfigInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

const ConfigInput = ({ label, value, onChange, placeholder, type = "text", className }: ConfigInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700">{label}</Label>
      <Input 
        type={type}
        value={value}
        onChange={onChange}
        className={`border-gray-200 focus:border-google-green focus:ring-google-green ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ConfigInput;