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
      <Label className="text-white">{label}</Label>
      <Input 
        type={type}
        value={value}
        onChange={onChange}
        className={`bg-transparent border-b-2 border-white/50 rounded-none text-white px-0 ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default ConfigInput;