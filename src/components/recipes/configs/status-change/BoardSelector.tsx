import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMonday } from '@/hooks/useMonday';

interface BoardSelectorProps {
  selectedBoard: string;
  onBoardSelect: (value: string) => void;
}

const BoardSelector = ({ selectedBoard, onBoardSelect }: BoardSelectorProps) => {
  const { data: mondayData } = useMonday();
  const boards = mondayData?.data?.boards || [];

  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className="inline-text text-2xl text-white">
        <SelectValue placeholder="board" />
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