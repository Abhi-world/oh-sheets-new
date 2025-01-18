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
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-white/20">
        <p className="text-2xl leading-relaxed text-white">
          When the Status of any item changes in your{' '}
          <span className="relative inline-block">
            <span className="underline decoration-dotted cursor-pointer">board</span>
            <BoardSelector
              selectedBoard={selectedBoard}
              onBoardSelect={setSelectedBoard}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
          </span>
          , automatically add a row with these{' '}
          <ValueSelector
            value={selectedValues}
            onChange={setSelectedValues}
            placeholder="values"
            className="text-2xl text-white underline decoration-dotted hover:decoration-solid"
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