import React from 'react';
import { Input } from '@/components/ui/input';

interface ConfigInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const ConfigInput = ({ value, onChange, placeholder, className }: ConfigInputProps) => {
  return (
    <Input 
      value={value}
      onChange={onChange}
      className={`w-40 inline-flex bg-transparent border-b-2 border-white/50 rounded-none text-white px-0 ${className}`}
      placeholder={placeholder}
    />
  );
};

export default ConfigInput;