import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SheetSelectorProps {
  items: Array<{ id: string; name: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  placeholder: string;
}

const SheetSelector = ({ items, selectedId, onSelect, placeholder }: SheetSelectorProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-white underline decoration-dotted hover:decoration-solid">
          {selectedId ? items.find(item => item.id === selectedId)?.name : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white">
        <div className="p-4">
          <Input
            placeholder={`Search ${placeholder}s...`}
            className="mb-4 bg-[#374151] border-white/10 text-white placeholder:text-white/50"
          />
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {items.map(item => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => onSelect(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SheetSelector;