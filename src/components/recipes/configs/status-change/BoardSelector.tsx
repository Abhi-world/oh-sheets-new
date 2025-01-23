import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MondayBoard } from '@/types/trigger';
import { ChevronDown } from 'lucide-react';

interface BoardSelectorProps {
  boards: MondayBoard[];
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
}

const BoardSelector = ({ boards = [], selectedBoard, onBoardSelect }: BoardSelectorProps) => {
  console.log('BoardSelector received boards:', boards);
  
  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className="inline-flex items-center p-0 m-0 h-auto min-w-[60px] bg-transparent border-0 shadow-none">
        <SelectValue 
          placeholder="board" 
          className="text-white underline decoration-dotted hover:decoration-solid p-0 m-0 text-base"
        />
        <ChevronDown className="h-4 w-4 text-white ml-1" />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {(boards || []).map((board) => (
          <SelectItem 
            key={board.id} 
            value={board.id}
            className="text-white hover:bg-white/10"
          >
            {board.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BoardSelector;