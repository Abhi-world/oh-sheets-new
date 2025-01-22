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

  // Validate configuration
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
            className="inline-flex"
          />
          {' / '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="inline-block text-xl"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="inline-block text-xl"
          />
          {' '}from{' '}
          <ValueSelector
            value={values}
            onChange={setValues}
            placeholder="original values"
            className="text-xl underline decoration-dotted hover:decoration-solid inline-block"
          />
          {' '}update them to{' '}
          <ValueSelector
            value={newValues}
            onChange={setNewValues}
            placeholder="new values"
            className="text-xl underline decoration-dotted hover:decoration-solid inline-block"
          />
        </p>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;