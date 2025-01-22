import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card } from '@/components/ui/card';
import BoardSelector from './status-change/BoardSelector';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';

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
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="inline-block"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="inline-block"
          />
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

      <div className="hidden">
        <BoardSelector
          selectedBoard={selectedBoard}
          onBoardSelect={setSelectedBoard}
        />
      </div>
    </div>
  );
};

export default ColumnChangeConfig;