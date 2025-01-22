import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMonday } from '@/hooks/useMonday';

interface BoardSelectorProps {
  selectedBoard: string;
  onBoardSelect: (value: string) => void;
  className?: string;
}

const BoardSelector = ({ selectedBoard, onBoardSelect, className = '' }: BoardSelectorProps) => {
  const { data: mondayData } = useMonday();
  const boards = mondayData?.data?.boards || [];

  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className={`px-0 py-0 h-auto font-normal text-xl text-white underline decoration-dotted hover:decoration-solid border-none bg-transparent inline-block ${className}`}>
        <SelectValue placeholder="board" />
      </SelectTrigger>
      <SelectContent className="bg-[#1F2937] border-[#374151]">
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