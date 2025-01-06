import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Info } from 'lucide-react';
import BoardSelector from './status-change/BoardSelector';
import SpreadsheetSelector from './status-change/SpreadsheetSelector';
import SheetSelector from './status-change/SheetSelector';

const StatusChangeConfig = ({ onConfigValid }: { onConfigValid: (valid: boolean) => void }) => {
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

  useEffect(() => {
    const isValid = Boolean(selectedBoard && selectedSpreadsheet && selectedSheet);
    onConfigValid(isValid);
  }, [selectedBoard, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {/* Category heading */}
        <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">
          Status Change Trigger Recipe
        </h3>

        {/* Natural flowing sentence */}
        <p className="text-xl leading-relaxed text-white">
          When the <span className="text-google-green font-medium">Status</span> of any item changes in your{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
            className="min-w-[180px] inline-block bg-transparent border-none text-white hover:text-google-green underline decoration-dotted hover:decoration-solid"
          />{' '}
          board, automatically add a new row to your Google Sheet:{' '}
          <SpreadsheetSelector
            selectedSpreadsheet={selectedSpreadsheet}
            onSpreadsheetSelect={setSelectedSpreadsheet}
            className="min-w-[180px] inline-block bg-transparent border-none text-white hover:text-google-green underline decoration-dotted hover:decoration-solid"
          />{' '}
          /{' '}
          <SheetSelector
            selectedSheet={selectedSheet}
            onSheetSelect={setSelectedSheet}
            className="min-w-[150px] inline-block bg-transparent border-none text-white hover:text-google-green underline decoration-dotted hover:decoration-solid"
          />
        </p>
      </div>

      {/* Information box */}
      <div className="bg-navy-light/30 p-4 rounded-lg border border-google-green/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-google-green mt-1 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-white/90">
              This automation will create a new row in your Google Sheet whenever a status changes in Monday.com. 
              It tracks all status changes, helping you maintain a complete history of status updates.
            </p>
            <p className="text-white/80 text-sm">
              For example, when a task status changes from "In Progress" to "Done", 
              a new row will be added to your sheet with the item's details and its new status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeConfig;