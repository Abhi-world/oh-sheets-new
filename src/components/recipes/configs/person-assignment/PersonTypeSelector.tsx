import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { User, Users } from 'lucide-react';

interface PersonTypeSelectorProps {
  personType: string;
  setPersonType: (type: string) => void;
  onAddColumn: () => void;
}

const personTypes = [
  { id: 'owner', label: 'Owner', icon: User },
  { id: 'people', label: 'People', icon: Users },
];

const PersonTypeSelector = ({ personType, setPersonType, onAddColumn }: PersonTypeSelectorProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
          {personType || 'person'}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] bg-[#1F2937] border-none p-2">
        {personTypes.map(type => (
          <button
            key={type.id}
            className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded flex items-center gap-2"
            onClick={() => setPersonType(type.label)}
          >
            <type.icon className="w-4 h-4" />
            {type.label}
          </button>
        ))}
        <button
          className="w-full text-left px-2 py-1.5 text-blue-400 hover:bg-white/10 rounded mt-2"
          onClick={onAddColumn}
        >
          + Add a new column
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default PersonTypeSelector;