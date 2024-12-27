import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

const columnTypes = [
  { label: 'Status', value: 'status' },
  { label: 'Text', value: 'text' },
  { label: 'Numbers', value: 'number' },
  { label: 'Timeline', value: 'timeline' },
  { label: 'Date', value: 'date' },
  { label: 'People', value: 'people' },
  { label: 'Priority', value: 'priority' },
];

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ValueSelector = ({ value, onChange, placeholder = "Select values..." }: ValueSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    value ? value.split(',').map(v => v.trim()).filter(Boolean) : []
  );

  const handleSelect = (currentValue: string) => {
    console.log('Selecting value:', currentValue);
    const newValues = selectedValues.includes(currentValue)
      ? selectedValues.filter(v => v !== currentValue)
      : [...selectedValues, currentValue];
    
    console.log('New values:', newValues);
    setSelectedValues(newValues);
    onChange(newValues.join(', '));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-navy-light border-google-green focus:ring-google-green/50 text-white"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-navy-dark border border-google-green/20">
        <DialogHeader>
          <DialogTitle className="text-white">Select Column Types</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose one or more column types from the list below.
          </DialogDescription>
        </DialogHeader>
        <Command className="bg-navy-dark">
          <CommandInput 
            placeholder="Search column types..." 
            className="bg-navy-light text-white"
          />
          <CommandEmpty className="text-white">No column type found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {columnTypes.map((type) => (
              <CommandItem
                key={type.value}
                value={type.value}
                onSelect={() => handleSelect(type.label)}
                className={cn(
                  "text-white hover:bg-navy-light",
                  selectedValues.includes(type.label) && "bg-navy-light"
                )}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValues.includes(type.label) ? "opacity-100" : "opacity-0"
                  )}
                />
                {type.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default ValueSelector;