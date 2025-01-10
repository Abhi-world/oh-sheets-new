import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ValueSelectorProps } from './value-selector/types';
import CustomValueInput from './value-selector/CustomValueInput';
import ColumnSelector from './value-selector/ColumnSelector';
import ValueList from './value-selector/ValueList';
import { useMondayColumns } from './value-selector/useMondayColumns';
import { cn } from '@/lib/utils';

const ValueSelector = ({ 
  value,
  onChange,
  placeholder = "Select values...",
  columns = [],
  selectedColumn = "status",
  onColumnSelect,
  className
}: ValueSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const { columnValues } = useMondayColumns(selectedColumn);

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

  const displayText = value || selectedColumn || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "px-3 py-1 h-auto min-h-[2rem] bg-[#374151] hover:bg-[#4B5563] border-none text-white underline decoration-dotted hover:decoration-solid inline-flex",
            className
          )}
        >
          {displayText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-[#1F2937] border-[#374151]">
        <div className="p-4 space-y-4">
          {columns.length > 0 && (
            <ColumnSelector
              columns={columns}
              selectedColumn={selectedColumn}
              onColumnSelect={onColumnSelect!}
            />
          )}
          
          <CustomValueInput onAddValue={(value) => handleValueToggle(value)} />
          
          <ValueList
            values={columnValues}
            selectedValues={selectedValues}
            onToggleValue={handleValueToggle}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ValueSelector;