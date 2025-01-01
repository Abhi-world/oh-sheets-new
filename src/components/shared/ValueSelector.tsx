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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMondayApiKey } from '@/utils/monday';

interface ValueSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  columns?: Array<{
    id: string;
    title: string;
    type: string;
    settings?: {
      labels?: { [key: string]: string };
    };
  }>;
  selectedColumn?: string;
  onColumnSelect?: (columnId: string) => void;
}

const ValueSelector = ({ 
  value, 
  onChange, 
  placeholder = "Select values...",
  columns = [],
  selectedColumn,
  onColumnSelect
}: ValueSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [customValue, setCustomValue] = useState('');
  const [availableValues, setAvailableValues] = useState<string[]>([]);
  const [columnValues, setColumnValues] = useState<any[]>([]);

  useEffect(() => {
    if (value) {
      const values = value.split(',').map(v => v.trim()).filter(Boolean);
      setSelectedValues(values);
    }
  }, [value]);

  useEffect(() => {
    fetchColumnValues();
  }, [selectedColumn]);

  const fetchColumnValues = async () => {
    if (!selectedColumn) return;

    try {
      const apiKey = await getMondayApiKey();
      if (!apiKey) {
        console.error('Monday.com API key not found');
        return;
      }

      const query = `
        query {
          boards {
            columns {
              id
              title
              type
              settings_str
            }
          }
        }
      `;

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch column values');
      }

      const data = await response.json();
      console.log('Monday.com column values:', data);

      if (data.data?.boards?.[0]?.columns) {
        const selectedCol = data.data.boards[0].columns.find(
          (col: any) => col.id === selectedColumn
        );

        if (selectedCol?.settings_str) {
          const settings = JSON.parse(selectedCol.settings_str);
          if (settings.labels) {
            setColumnValues(Object.values(settings.labels));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching column values:', error);
    }
  };

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
        {columns && columns.length > 0 && (
          <div className="p-2 border-b border-navy-light">
            <Select value={selectedColumn} onValueChange={onColumnSelect}>
              <SelectTrigger className="w-full bg-transparent border-none text-white">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map(column => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
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
          {columnValues.map((value) => (
            <div
              key={value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-navy-light text-white",
                selectedValues.includes(value) && "bg-navy-light"
              )}
              onClick={() => handleValueToggle(value)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedValues.includes(value) ? "opacity-100" : "opacity-0"
                )}
              />
              {value}
            </div>
          ))}
          {selectedValues.map(value => (
            !columnValues.includes(value) && (
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