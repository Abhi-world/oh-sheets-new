import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

interface ColumnCenterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ColumnCenterModal = ({ open, onOpenChange }: ColumnCenterModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1F2937] text-white border-none max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">Column Center</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search" 
              className="pl-10 bg-[#111827] border-none text-white placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-lg bg-[#111827] hover:bg-[#2D3748] cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">People</h3>
                  <p className="text-sm text-gray-400">Assign people to improve team work</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnCenterModal;