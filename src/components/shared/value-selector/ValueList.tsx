import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValueListProps {
  values: string[];
  selectedValues: string[];
  onToggleValue: (value: string) => void;
}

const ValueList = ({ values, selectedValues, onToggleValue }: ValueListProps) => {
  return (
    <div className="max-h-60 overflow-auto">
      {values.map((value) => (
        <div
          key={value}
          className={cn(
            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-navy-light text-white",
            selectedValues.includes(value) && "bg-navy-light"
          )}
          onClick={() => onToggleValue(value)}
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
        !values.includes(value) && (
          <div
            key={value}
            className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-navy-light text-white bg-navy-light"
            onClick={() => onToggleValue(value)}
          >
            <Check className="mr-2 h-4 w-4" />
            {value}
          </div>
        )
      ))}
    </div>
  );
};

export default ValueList;