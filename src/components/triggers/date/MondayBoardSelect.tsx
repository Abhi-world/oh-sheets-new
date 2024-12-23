import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MondayBoard } from '@/types/trigger';

interface MondayBoardSelectProps {
  boards: MondayBoard[];
  value: string;
  onChange: (value: string) => void;
}

const MondayBoardSelect = ({ boards, value, onChange }: MondayBoardSelectProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Monday.com Board</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a board" />
        </SelectTrigger>
        <SelectContent>
          {boards.map(board => (
            <SelectItem key={board.id} value={board.id}>
              {board.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MondayBoardSelect;