import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const GroupMoveConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [groupName, setGroupName] = useState('');
  const [values, setValues] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('status');
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
    <div className="bg-[#111827] text-white p-6 rounded-lg">
      <p className="text-2xl leading-relaxed text-white">
        When items are moved to{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-2xl text-white underline decoration-dotted hover:decoration-solid">
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
        <SheetSelector
          items={spreadsheets.length > 0 ? spreadsheets : [
            { id: 'mock-1', name: 'Sample Spreadsheet 1' },
            { id: 'mock-2', name: 'Sample Spreadsheet 2' }
          ]}
          selectedId={selectedSpreadsheet}
          onSelect={setSelectedSpreadsheet}
          placeholder="spreadsheet"
          className="text-2xl"
        />
        {' / '}
        <SheetSelector
          items={sheets}
          selectedId={selectedSheet}
          onSelect={setSelectedSheet}
          placeholder="sheet"
          className="text-2xl"
        />
        {' with these '}
        <ValueSelector
          value={values}
          onChange={setValues}
          placeholder="values"
          columns={[]}
          selectedColumn={selectedColumn}
          onColumnSelect={setSelectedColumn}
          className="text-2xl text-white underline decoration-dotted hover:decoration-solid"
        />
      </p>
    </div>
  );
};

export default GroupMoveConfig;