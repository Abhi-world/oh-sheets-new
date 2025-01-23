import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MondayBoard } from '@/types/trigger';

interface BoardSelectorProps {
  boards: MondayBoard[];
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
}

const BoardSelector = ({ boards = [], selectedBoard, onBoardSelect }: BoardSelectorProps) => {
  console.log('BoardSelector received boards:', boards);
  
  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className="inline-block px-0 py-0 h-auto min-w-0 w-auto text-2xl text-white bg-transparent border-none shadow-none">
        <SelectValue 
          placeholder="board" 
          className="decoration-dotted decoration-white underline hover:decoration-solid m-0 p-0"
        />
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