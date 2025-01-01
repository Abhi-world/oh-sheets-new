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

const ValueSelector = ({ 
  value,
  onChange,
  placeholder = "Select values...",
  columns = [],
  selectedColumn = "status",
  onColumnSelect
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

  const handleAddCustomValue = (customValue: string) => {
    if (customValue && !selectedValues.includes(customValue)) {
      const newValues = [...selectedValues, customValue];
      setSelectedValues(newValues);
      onChange(newValues.join(', '));
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
        {columns && columns.length > 0 && (
          <ColumnSelector
            columns={columns}
            selectedColumn={selectedColumn}
            onColumnSelect={onColumnSelect!}
          />
        )}
        
        <CustomValueInput onAddValue={handleAddCustomValue} />
        
        <ValueList
          values={columnValues}
          selectedValues={selectedValues}
          onToggleValue={handleValueToggle}
        />
      </PopoverContent>
    </Popover>
  );
};

export default ValueSelector;