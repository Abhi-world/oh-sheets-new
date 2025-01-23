import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import BoardSelector from './status-change/BoardSelector';
import SheetSelector from './date-trigger/SheetSelector';
import ValueSelector from '@/components/shared/ValueSelector';

const StatusChangeConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedValues, setSelectedValues] = useState('');
  
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  useEffect(() => {
    const isValid = Boolean(selectedBoard && selectedSpreadsheet && selectedSheet);
    onConfigValid?.(isValid);
  }, [selectedBoard, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="space-y-8">
      <div className="bg-navy-dark/40 p-6 rounded-lg">
        <p className="text-2xl leading-relaxed text-white">
          When the Status of any item changes in your{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          , automatically add a row with these{' '}
          <ValueSelector
            value={selectedValues}
            onChange={setSelectedValues}
            placeholder="values"
            className="inline-text text-2xl text-white"
          />
          {' '}in{' '}
          <SheetSelector
            spreadsheets={spreadsheets}
            sheets={sheets}
            selectedSpreadsheet={selectedSpreadsheet}
            selectedSheet={selectedSheet}
            onSpreadsheetSelect={setSelectedSpreadsheet}
            onSheetSelect={setSelectedSheet}
          />
        </p>
      </div>
    </div>
  );
};

export default StatusChangeConfig;