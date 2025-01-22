import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockWorkspaces } from '@/utils/mockData';

interface BoardSelectorProps {
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
  className?: string;
}

const BoardSelector = ({ selectedBoard, onBoardSelect, className = '' }: BoardSelectorProps) => {
  const boards = mockWorkspaces;

  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className={`px-0 py-0 h-auto font-normal text-lg text-white underline decoration-dotted hover:decoration-solid border-none bg-transparent ${className}`}>
        <SelectValue placeholder="board" />
      </SelectTrigger>
      <SelectContent className="bg-[#1F2937] border-[#374151]">
        {boards.map((board: any) => (
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