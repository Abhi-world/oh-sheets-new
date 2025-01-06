import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonday } from '@/hooks/useMonday';

interface BoardSelectorProps {
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
  className?: string; // Added className prop
}

const BoardSelector = ({ selectedBoard, onBoardSelect, className }: BoardSelectorProps) => {
  const { data: mondayData, isLoading } = useMonday();
  const boards = mondayData?.data?.boards || [];

  console.log('Monday.com boards:', boards);

  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger 
        className={className || "w-[180px] inline-flex bg-navy-light border-none text-white focus:ring-white/20"}
      >
        <SelectValue placeholder={isLoading ? "Loading..." : "Select board"} />
      </SelectTrigger>
      <SelectContent className="bg-navy-light border-none">
        {boards.map((board: any) => (
          <SelectItem key={board.id} value={board.id} className="text-white hover:bg-white/10">
            {board.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BoardSelector;