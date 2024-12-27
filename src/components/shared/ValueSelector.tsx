import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

const columnTypes = [
  { label: 'Budget', value: 'budget' },
  { label: 'Due date', value: 'due_date' },
  { label: 'Item ID', value: 'item_id' },
  { label: 'Name', value: 'name' },
  { label: 'Owner', value: 'owner' },
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
          <DialogTitle className="text-white">Board columns</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select one or more columns from the list below
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <div className="flex items-center border border-navy-light rounded-md mb-4">
            <input
              type="text"
              placeholder="Add text"
              className="flex-1 bg-transparent border-none text-white px-3 py-2 focus:outline-none"
            />
            <Button 
              size="sm" 
              className="mr-1.5 bg-recipe-blue hover:bg-recipe-blue/90"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
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