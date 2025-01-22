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
          <span className="inline-text">
            <BoardSelector
              selectedBoard={selectedBoard}
              onBoardSelect={setSelectedBoard}
              className="inline-text"
            />
          </span>
          {' / '}
          <span className="inline-text">
            <SheetSelector
              items={spreadsheets}
              selectedId={selectedSpreadsheet}
              onSelect={setSelectedSpreadsheet}
              placeholder="spreadsheet"
              className="inline-text"
            />
          </span>
          {' / '}
          <span className="inline-text">
            <SheetSelector
              items={sheets}
              selectedId={selectedSheet}
              onSelect={setSelectedSheet}
              placeholder="sheet"
              className="inline-text"
            />
          </span>
          {' '}from{' '}
          <span className="inline-text">
            <ValueSelector
              value={values}
              onChange={setValues}
              placeholder="original values"
              className="inline-text"
            />
          </span>
          {' '}update them to{' '}
          <span className="inline-text">
            <ValueSelector
              value={newValues}
              onChange={setNewValues}
              placeholder="new values"
              className="inline-text"
            />
          </span>
        </p>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;