import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SheetSelectorProps {
  items: Array<{ id: string; name: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  placeholder: string;
}

const SheetSelector = ({ items, selectedId, onSelect, placeholder }: SheetSelectorProps) => {
  const selectedItem = items.find(item => item.id === selectedId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
          {selectedItem ? selectedItem.name : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] bg-[#1F2937] border-none p-2">
        {items.map(item => (
          <button
            key={item.id}
            className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded"
            onClick={() => onSelect(item.id)}
          >
            {item.name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default SheetSelector;