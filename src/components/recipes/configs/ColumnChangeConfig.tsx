import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useMonday } from '@/hooks/useMonday';
import { Card } from '@/components/ui/card';
import BoardSelector from './status-change/BoardSelector';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';

const ColumnChangeConfig = ({ onConfigValid }: { onConfigValid: (isValid: boolean) => void }) => {
  const [values, setValues] = useState('');
  const [newValues, setNewValues] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  
  const { data: mondayData } = useMonday();
  const boards = mondayData?.data?.boards || [];

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
        <p className="text-2xl leading-relaxed text-white">
          When a column value changes in{' '}
          <BoardSelector
            boards={boards}
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          {' / '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
          />
          {' '}from{' '}
          <ValueSelector
            value={values}
            onChange={setValues}
            placeholder="original values"
          />
          {' '}update them to{' '}
          <ValueSelector
            value={newValues}
            onChange={setNewValues}
            placeholder="new values"
          />
        </p>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;