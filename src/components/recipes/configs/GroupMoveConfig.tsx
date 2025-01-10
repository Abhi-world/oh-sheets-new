import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const GroupMoveConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [groupName, setGroupName] = useState('');
  const [values, setValues] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  // Mock groups for demo - in production this would come from Monday.com API
  const groups = [
    { id: '1', name: 'To-Do' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Done' },
    { id: '4', name: 'Blocked' }
  ];

  useEffect(() => {
    if (onConfigValid) {
      const isValid = groupName.trim() !== '' && 
                     selectedSpreadsheet !== '' && 
                     selectedSheet !== '';
      onConfigValid(isValid);
    }
  }, [groupName, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1F2937] rounded-lg p-8">
          <div className="bg-[#111827] p-6 rounded-lg">
            <p className="text-2xl leading-relaxed text-white">
              When items are moved to{' '}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-white underline decoration-dotted hover:decoration-solid">
                    {groupName || 'group'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] bg-[#1F2937] border-none">
                  <div className="p-4">
                    <div className="flex items-center px-3 py-2 mb-2">
                      <Search className="w-4 h-4 text-white/50 mr-2" />
                      <Input 
                        placeholder="Search groups..."
                        className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                      />
                    </div>
                    <div className="space-y-1">
                      {groups.map(group => (
                        <button
                          key={group.id}
                          className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                          onClick={() => setGroupName(group.name)}
                        >
                          {group.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {', '}add a row in{' '}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-white underline decoration-dotted hover:decoration-solid">
                    {selectedSpreadsheet ? spreadsheets.find(s => s.id === selectedSpreadsheet)?.name : 'spreadsheet'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] bg-[#1F2937] border-none">
                  <div className="p-4">
                    <div className="space-y-1">
                      {spreadsheets.map(sheet => (
                        <button
                          key={sheet.id}
                          className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                          onClick={() => setSelectedSpreadsheet(sheet.id)}
                        >
                          {sheet.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {' / '}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-white underline decoration-dotted hover:decoration-solid">
                    {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name : 'sheet'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] bg-[#1F2937] border-none">
                  <div className="p-4">
                    <div className="space-y-1">
                      {sheets.map(sheet => (
                        <button
                          key={sheet.id}
                          className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                          onClick={() => setSelectedSheet(sheet.id)}
                        >
                          {sheet.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {' with these '}
              <ValueSelector
                value={values}
                onChange={setValues}
                className="w-[120px] inline-flex"
              />
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              className="bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white px-8 py-2 rounded-full text-lg"
            >
              Create Automation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMoveConfig;