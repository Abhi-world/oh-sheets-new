import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MondayBoard } from '@/types/trigger';

interface BoardSelectorProps {
  boards: MondayBoard[];
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
}

const BoardSelector = ({ boards = [], selectedBoard, onBoardSelect }: BoardSelectorProps) => {
  console.log('BoardSelector received boards:', boards);
  
  const selectedBoardName = boards.find(board => board.id === selectedBoard)?.name || 'board';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="px-0 py-0 h-auto font-normal text-2xl text-white underline decoration-dotted hover:decoration-solid"
        >
          {selectedBoardName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-navy-dark border-none">
        <div className="space-y-1">
          {(boards || []).map((board) => (
            <button
              key={board.id}
              onClick={() => {
                onBoardSelect(board.id);
              }}
              className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
            >
              {board.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BoardSelector;