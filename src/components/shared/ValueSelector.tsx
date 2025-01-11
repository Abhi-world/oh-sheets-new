import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Search } from 'lucide-react';
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

  // Use provided columns or fallback to default board columns
  const defaultColumns = [
    { id: 'employee_id', title: 'Employee ID' },
    { id: 'first_name', title: 'First Name' },
    { id: 'budget', title: 'Budget' },
    { id: 'due_date', title: 'Due date' },
    { id: 'item_id', title: 'Item ID' },
    { id: 'name', title: 'Name' },
    { id: 'owner', title: 'Owner' },
    { id: 'priority', title: 'Priority' }
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "px-0 py-0 h-auto text-white underline decoration-dotted hover:decoration-solid",
            className
          )}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ValueSelector;