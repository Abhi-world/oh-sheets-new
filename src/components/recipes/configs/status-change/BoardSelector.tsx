import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MondayBoard } from '@/types/trigger';

interface BoardSelectorProps {
  boards: MondayBoard[];
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
}

const BoardSelector = ({ boards, selectedBoard, onBoardSelect }: BoardSelectorProps) => {
  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className="inline-flex px-0 py-0 h-auto font-normal text-2xl text-white bg-transparent border-none shadow-none">
        <SelectValue 
          placeholder="board" 
          className="decoration-dotted decoration-white underline hover:decoration-solid"
        />
      </SelectTrigger>
      <SelectContent className="bg-navy-dark border-none">
        {boards.map((board) => (
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