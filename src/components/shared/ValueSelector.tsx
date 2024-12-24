import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ValueSelector = ({ value, onChange }: ValueSelectorProps) => {
  const columnTypes = [
    { value: 'budget', label: 'Budget' },
    { value: 'due_date', label: 'Due date' },
    { value: 'item_id', label: 'Item ID' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner' },
    { value: 'priority', label: 'Priority' }
  ];

  const handleSelect = (columnValue: string) => {
    const currentValues = value ? value.split(',').map(v => v.trim()) : [];
    const newValues = currentValues.includes(columnValue)
      ? currentValues.filter(v => v !== columnValue)
      : [...currentValues, columnValue];
    onChange(newValues.join(', '));
  };

  const selectedValues = value ? value.split(',').map(v => v.trim()) : [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Input
          value={value}
          readOnly
          placeholder="Click to select values"
          className="cursor-pointer bg-navy-light border-google-green focus-visible:ring-google-green/50 text-white"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-navy-dark border border-google-green">
        <DialogHeader>
          <DialogTitle className="text-white">Select Board Columns</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto mt-4">
          <div className="space-y-2">
            {columnTypes.map((column) => (
              <Button
                key={column.value}
                variant="ghost"
                className="w-full justify-start gap-2 text-left hover:bg-navy-light"
                onClick={() => handleSelect(column.value)}
              >
                {selectedValues.includes(column.value) && (
                  <Check className="h-4 w-4 text-google-green" />
                )}
                <span className={selectedValues.includes(column.value) ? 'text-google-green' : 'text-white'}>
                  {column.label}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ValueSelector;