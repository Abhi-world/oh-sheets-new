import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const columnTypes = [
  { label: 'Budget', value: 'budget' },
  { label: 'Due date', value: 'due_date' },
  { label: 'Item ID', value: 'item_id' },
  { label: 'Name', value: 'name' },
  { label: 'Owner', value: 'owner' },
  { label: 'Priority', value: 'priority' },
];

const ValueSelector = ({ value, onChange, placeholder = "Select values..." }: ValueSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');

  // Initialize selected values from prop
  useEffect(() => {
    if (value) {
      const values = value.split(',').map(v => v.trim()).filter(Boolean);
      setSelectedValues(values);
    }
  }, [value]);

  const handleValueToggle = (valueToToggle: string) => {
    const newValues = selectedValues.includes(valueToToggle)
      ? selectedValues.filter(v => v !== valueToToggle)
      : [...selectedValues, valueToToggle];
    
    setSelectedValues(newValues);
    onChange(newValues.join(', '));
  };

  const handleAddCustomValue = () => {
    if (customValue && !selectedValues.includes(customValue)) {
      const newValues = [...selectedValues, customValue];
      setSelectedValues(newValues);
      onChange(newValues.join(', '));
      setCustomValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-navy-light border-google-green focus:ring-google-green/50 text-white"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-navy-dark border border-google-green/20">
        <div className="flex items-center border-b border-navy-light p-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Add custom value"
            className="flex-1 bg-transparent border-none text-white focus:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomValue();
              }
            }}
          />
          <Button
            size="sm"
            className="ml-2 bg-recipe-blue hover:bg-recipe-blue/90"
            onClick={handleAddCustomValue}
          >
            Add
          </Button>
        </div>
        <div className="max-h-60 overflow-auto">
          {columnTypes.map((type) => (
            <div
              key={type.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-navy-light text-white",
                selectedValues.includes(type.label) && "bg-navy-light"
              )}
              onClick={() => handleValueToggle(type.label)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedValues.includes(type.label) ? "opacity-100" : "opacity-0"
                )}
              />
              {type.label}
            </div>
          ))}
          {selectedValues.map(value => (
            !columnTypes.find(type => type.label === value) && (
              <div
                key={value}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-navy-light text-white bg-navy-light"
                onClick={() => handleValueToggle(value)}
              >
                <Check className="mr-2 h-4 w-4" />
                {value}
              </div>
            )
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ValueSelector;