import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ValueSelectorProps } from './value-selector/types';
import { cn } from '@/lib/utils';

const ValueSelector = ({ 
  value,
  onChange,
  placeholder = "Select values...",
  className,
  columns = [],
  selectedColumn,
  onColumnSelect
}: ValueSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customValue, setCustomValue] = useState('');

  const defaultColumns = [
    { id: 'status', title: 'Status', type: 'status', settings: { labels: { '1': 'Done', '2': 'Working on it', '3': 'Stuck' } } },
    { id: 'priority', title: 'Priority', type: 'color', settings: { labels: { '1': 'High', '2': 'Medium', '3': 'Low' } } },
    { id: 'text', title: 'Text', type: 'text' },
    { id: 'person', title: 'Person', type: 'person' },
    { id: 'date', title: 'Date', type: 'date' },
    { id: 'numbers', title: 'Numbers', type: 'number' }
  ];

  const boardColumns = columns.length > 0 ? columns : defaultColumns;

  const filteredColumns = boardColumns.filter(column =>
    column.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (columnId: string) => {
    onChange(columnId);
    if (onColumnSelect) {
      onColumnSelect(columnId);
    }
    setOpen(false);
  };

  const handleAddCustomValue = () => {
    if (customValue) {
      handleSelect(customValue);
      setCustomValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "px-0 py-0 h-auto font-normal text-white underline decoration-dotted hover:decoration-solid",
            className
          )}
        >
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-[#1F2937] border-[#374151]">
        <div className="p-4 space-y-4">
          <div className="flex items-center px-3 py-2 bg-[#374151] rounded-md">
            <Search className="w-4 h-4 text-white/50 mr-2" />
            <Input 
              placeholder="Search board columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
            />
          </div>
          <div className="space-y-1">
            {filteredColumns.map(column => (
              <button
                key={column.id}
                className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                onClick={() => handleSelect(column.title)}
              >
                {column.title}
              </button>
            ))}
          </div>
          <div className="border-t border-[#374151] pt-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add custom value..."
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="flex-1 bg-[#374151] border-none text-white placeholder:text-white/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomValue();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAddCustomValue}
                className="bg-google-green hover:bg-google-green/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ValueSelector;