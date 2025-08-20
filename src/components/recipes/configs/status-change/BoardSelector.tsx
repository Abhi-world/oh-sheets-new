import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { MondayBoard } from '@/types/trigger';

interface BoardSelectorProps {
  boards: MondayBoard[];
  selectedBoard: string;
  onBoardSelect: (boardId: string) => void;
  isEmbedded?: boolean;
  detectedBoardName?: string;
}

const BoardSelector = ({ boards = [], selectedBoard, onBoardSelect, isEmbedded = false, detectedBoardName }: BoardSelectorProps) => {
  console.log('BoardSelector received boards:', boards);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    console.log('BoardSelector mounted with boards:', boards);
    console.log('Selected board ID:', selectedBoard);
    console.log('Board count:', boards.length);
  }, [boards, selectedBoard]);
  
  // Safely find the selected board name, with fallback to 'board'
  const selectedBoardName = isEmbedded && detectedBoardName 
    ? detectedBoardName
    : boards && boards.length > 0 
      ? (boards.find(board => board.id === selectedBoard)?.name || 'board') 
      : 'board';
  
  // In embedded mode with detected board, show as text instead of clickable button
  if (isEmbedded && selectedBoard && detectedBoardName) {
    return (
      <span className="text-2xl text-white underline decoration-dotted">
        {selectedBoardName}
      </span>
    );
  }
  
  // Only filter boards if the array exists and has items
  const filteredBoards = boards && boards.length > 0 ? 
    boards.filter(board => board.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="px-0 py-0 h-auto font-normal text-2xl text-white underline decoration-dotted hover:decoration-solid"
          onClick={() => {
            console.log('Board selector button clicked');
            setIsOpen(true);
          }}
        >
          {selectedBoardName}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-navy-dark border-none">
        <div className="p-2 space-y-2">
          <div className="flex items-center px-2 py-1 bg-white/5 rounded">
            <Search className="h-4 w-4 text-white/50 mr-2" />
            <Input
              placeholder="Search boards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
            />
          </div>
          <div className="space-y-1 max-h-[200px] overflow-y-auto">
            {boards && boards.length > 0 ? (
              filteredBoards.length > 0 ? (
                filteredBoards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => {
                      console.log('Selected board:', board.name, 'with ID:', board.id);
                      onBoardSelect(board.id);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                  >
                    {board.name}
                  </button>
                ))
              ) : (
                <div className="text-white/70 px-3 py-2 text-sm">
                  No boards found matching your search.
                </div>
              )
            ) : (
              <div className="text-white/70 px-3 py-2 text-sm">
                No boards available. Try refreshing the boards list.
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BoardSelector;