import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SheetSelectorProps {
  items: Array<{ id: string; name: string }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  placeholder: string;
  className?: string; // Added className as optional prop
}

const SheetSelector = ({ 
  items, 
  selectedId, 
  onSelect, 
  placeholder,
  className = '' // Default to empty string if not provided
}: SheetSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={`text-white underline decoration-dotted hover:decoration-solid ${className}`}>
          {selectedId ? items.find(item => item.id === selectedId)?.name : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-[#1F2937] border-none">
        <div className="p-4 space-y-4">
          <div className="flex items-center px-3 py-2 bg-[#374151] rounded-md">
            <Search className="w-4 h-4 text-white/50 mr-2" />
            <Input 
              placeholder={`Search ${placeholder.toLowerCase()}s...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
            />
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {filteredItems.map(item => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded text-lg"
                onClick={() => {
                  onSelect(item.id);
                  setSearchTerm('');
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SheetSelector;