import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Card } from '@/components/ui/card';
import BoardSelector from './status-change/BoardSelector';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';

const ColumnChangeConfig = ({ onConfigValid }: { onConfigValid: (isValid: boolean) => void }) => {
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

  React.useEffect(() => {
    const isValid = Boolean(
      selectedBoard && 
      selectedSpreadsheet && 
      selectedSheet && 
      values && 
      newValues
    );
    onConfigValid(isValid);
  }, [selectedBoard, selectedSpreadsheet, selectedSheet, values, newValues, onConfigValid]);

  return (
    <div className="space-y-12">
      <Card className="bg-recipe-navy/40 p-6 rounded-lg border-none">
        <p className="text-xl leading-relaxed text-white">
          When a column value changes in{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline"
          />
          {' / '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline"
          />
          {' '}from{' '}
          <ValueSelector
            value={values}
            onChange={setValues}
            placeholder="original values"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline"
          />
          {' '}update them to{' '}
          <ValueSelector
            value={newValues}
            onChange={setNewValues}
            placeholder="new values"
            className="text-xl text-white underline decoration-dotted hover:decoration-solid inline"
          />
        </p>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;