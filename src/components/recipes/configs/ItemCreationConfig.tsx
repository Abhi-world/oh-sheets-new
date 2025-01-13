import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import RecipeConfigShell from '../shared/RecipeConfigShell';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const ItemCreationConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [selectedColumn, setSelectedColumn] = useState('status');
  const [values, setValues] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  // Mock columns for demonstration
  const mockColumns = [
    { id: 'status', title: 'Status', type: 'status', settings: { labels: { '1': 'Done', '2': 'Working on it', '3': 'Stuck' } } },
    { id: 'priority', title: 'Priority', type: 'color', settings: { labels: { '1': 'High', '2': 'Medium', '3': 'Low' } } },
    { id: 'text', title: 'Text', type: 'text' },
    { id: 'person', title: 'Person', type: 'person' },
    { id: 'date', title: 'Date', type: 'date' },
    { id: 'numbers', title: 'Numbers', type: 'number' }
  ];

  return (
    <div className="min-h-[300px] flex flex-col">
      <div className="bg-[#111827] text-white p-6 rounded-lg mb-6">
        <p className="text-xl leading-relaxed text-white">
          When an item is created, add a row in{' '}
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
            columns={mockColumns}
            selectedColumn={selectedColumn}
            onColumnSelect={setSelectedColumn}
            className="text-white underline decoration-dotted hover:decoration-solid inline-flex items-center"
          />
        </p>
      </div>
    </div>
  );
};

export default ItemCreationConfig;