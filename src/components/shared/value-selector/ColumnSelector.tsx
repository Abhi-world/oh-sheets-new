import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColumnValue } from './types';

interface ColumnSelectorProps {
  columns: ColumnValue[];
  selectedColumn?: string;
  onColumnSelect: (columnId: string) => void;
}

const ColumnSelector = ({ columns, selectedColumn, onColumnSelect }: ColumnSelectorProps) => {
  return (
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
  );
};

export default ColumnSelector;