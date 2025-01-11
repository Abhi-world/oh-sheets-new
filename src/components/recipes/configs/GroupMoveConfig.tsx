import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import RecipeConfigShell from '../shared/RecipeConfigShell';
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

  // Mock groups for demo
  const groups = [
    { id: '1', name: 'To-Do' },
    { id: '2', name: 'In Progress' },
    { id: '3', name: 'Done' },
    { id: '4', name: 'Blocked' }
  ];

  return (
    <RecipeConfigShell onSave={() => console.log('Creating automation...')}>
      <p className="text-xl leading-relaxed text-white">
        When items are moved to{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white underline decoration-dotted hover:decoration-solid">
              {groupName || 'group'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#1F2937] border-none">
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
          </PopoverContent>
        </Popover>
        {' with these '}
        <ValueSelector
          value={values}
          onChange={setValues}
          placeholder="values"
          className="text-white underline decoration-dotted hover:decoration-solid"
        />
      </p>
    </RecipeConfigShell>
  );
};

export default GroupMoveConfig;