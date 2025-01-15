import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface ColumnCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (columnType: string) => void;
}

const ColumnCenterModal = ({ isOpen, onClose, onSelect }: ColumnCenterModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl bg-navy-dark border-none text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-normal">Column Center</DialogTitle>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
            <Input
              placeholder="Search"
              className="pl-10 bg-navy-light border-none text-white placeholder:text-white/50"
            />
          </div>
        </DialogHeader>

        <div className="mt-4">
          <h3 className="text-xl mb-4">Board Power-Up</h3>
          <div className="bg-navy-light/50 p-4 rounded-lg hover:bg-navy-light/70 cursor-pointer"
               onClick={() => onSelect("button")}>
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="text-2xl">🔘</span>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium">Button</h4>
                <p className="text-sm text-white/70">Perform actions on items by clicking a button</p>
              </div>
              <Button 
                variant="secondary"
                className="ml-auto bg-white/10 text-white hover:bg-white/20 border-none"
              >
                Add to board
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnCenterModal;