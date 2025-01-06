import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMonday } from '@/hooks/useMonday';
import { ChevronDown } from 'lucide-react';

interface BoardSelectorProps {
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
  className?: string;
}

const BoardSelector = ({ selectedBoard, onBoardSelect, className }: BoardSelectorProps) => {
  const { data: mondayData, isLoading } = useMonday();
  const boards = mondayData?.data?.boards || [];

  return (
    <Select value={selectedBoard} onValueChange={onBoardSelect}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Loading..." : "select board"} />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectTrigger>
      <SelectContent className="bg-navy-light border-none">
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