import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CustomValueInputProps {
  onAddValue: (value: string) => void;
}

const CustomValueInput = ({ onAddValue }: CustomValueInputProps) => {
  const [customValue, setCustomValue] = useState('');

  const handleAddValue = () => {
    if (customValue) {
      onAddValue(customValue);
      setCustomValue('');
    }
  };

  return (
    <div className="flex items-center border-b border-navy-light p-2">
      <Input
        value={customValue}
        onChange={(e) => setCustomValue(e.target.value)}
        placeholder="Add custom value"
        className="flex-1 bg-transparent border-none text-white focus:ring-0"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddValue();
          }
        }}
      />
      <Button
        size="sm"
        className="ml-2 bg-recipe-blue hover:bg-recipe-blue/90"
        onClick={handleAddValue}
      >
        Add
      </Button>
    </div>
  );
};

export default CustomValueInput;