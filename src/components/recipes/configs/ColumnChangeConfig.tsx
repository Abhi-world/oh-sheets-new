import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ValueSelector from '@/components/shared/ValueSelector';
import { Card } from '@/components/ui/card';
import BoardSelector from './status-change/BoardSelector';

const ColumnChangeConfig = () => {
  const [values, setValues] = useState('');
  const [newValues, setNewValues] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    isLoading,
    fetchSpreadsheets
  } = useGoogleSheets();

  return (
    <div className="space-y-12">
      <Card className="bg-recipe-navy/40 p-6 rounded-lg border-none">
        <p className="text-xl leading-relaxed text-white">
          When a column value changes in{' '}
          <button 
            onClick={() => setSelectedBoard(selectedBoard)}
            className="text-white underline decoration-dotted hover:decoration-solid"
          >
            {selectedBoard || 'board'}
          </button>
          {' / '}
          <button 
            className="text-white underline decoration-dotted hover:decoration-solid"
            onClick={() => fetchSpreadsheets()}
          >
            {selectedSpreadsheet ? sheets.find(s => s.id === selectedSpreadsheet)?.name || 'spreadsheet' : 'spreadsheet'}
          </button>
          {' / '}
          <button 
            className="text-white underline decoration-dotted hover:decoration-solid"
            onClick={() => setSelectedSheet(selectedSheet)}
          >
            {selectedSheet ? sheets.find(s => s.id === selectedSheet)?.name || 'sheet' : 'sheet'}
          </button>
          {' '}from{' '}
          <ValueSelector
            value={values}
            onChange={setValues}
            placeholder="original values"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline-block"
          />
          {' '}update them to{' '}
          <ValueSelector
            value={newValues}
            onChange={setNewValues}
            placeholder="new values"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline-block"
          />
        </p>
      </Card>

      {/* Hidden selects for functionality */}
      <div className="hidden">
        <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {spreadsheets.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sheets.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <BoardSelector
          selectedBoard={selectedBoard}
          onBoardSelect={setSelectedBoard}
        />
      </div>
    </div>
  );
};

export default ColumnChangeConfig;