import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';

const PersonAssignmentConfig = () => {
  const [personType, setPersonType] = useState('');
  const [showColumnCenter, setShowColumnCenter] = useState(false);
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const personTypes = [
    { id: 'owner', label: 'Owner', icon: User },
    { id: 'coworker', label: 'Coworker', icon: User },
  ];

  return (
    <div className="flex flex-col">
      <div className="bg-[#111827] text-white p-6 rounded-lg">
        <p className="text-xl leading-relaxed text-white">
          When{' '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
                {personType || 'person'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] bg-[#1F2937] border-none p-2">
              {personTypes.map(type => (
                <button
                  key={type.id}
                  className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded flex items-center gap-2"
                  onClick={() => setPersonType(type.label)}
                >
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </button>
              ))}
              <button
                className="w-full text-left px-2 py-1.5 text-blue-400 hover:bg-white/10 rounded mt-2"
                onClick={() => setShowColumnCenter(true)}
              >
                + Add a new column
              </button>
            </PopoverContent>
          </Popover>
          {' '}is assigned, add a row in{' '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
                {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] bg-navy-dark border-none p-2">
              {spreadsheets.map(sheet => (
                <button
                  key={sheet.id}
                  className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded"
                  onClick={() => setSelectedSpreadsheet(sheet.id)}
                >
                  {sheet.name}
                </button>
              ))}
            </PopoverContent>
          </Popover>
          {' / '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-xl text-white underline decoration-dotted hover:decoration-solid">
                {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] bg-navy-dark border-none p-2">
              {sheets.map(sheet => (
                <button
                  key={sheet.id}
                  className="w-full text-left px-2 py-1.5 text-white hover:bg-white/10 rounded"
                  onClick={() => setSelectedSheet(sheet.id)}
                >
                  {sheet.name}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </p>
      </div>

      <Dialog open={showColumnCenter} onOpenChange={setShowColumnCenter}>
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
    </div>
  );
};

export default PersonAssignmentConfig;