import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import { getMondayApiKey } from '@/utils/monday';
import { toast } from 'sonner';
import BoardSelector from './status-change/BoardSelector';
import SpreadsheetSelector from './status-change/SpreadsheetSelector';
import SheetSelector from './status-change/SheetSelector';

const StatusChangeConfig = () => {
  const [values, setValues] = useState('');
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('status');
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
    // Mock columns for testing with required 'type' property
    const mockColumns = [
      { id: 'status', title: 'Status', type: 'status' },
      { id: 'priority', title: 'Priority', type: 'color' },
      { id: 'text', title: 'Text', type: 'text' },
      { id: 'person', title: 'Person', type: 'person' },
      { id: 'date', title: 'Date', type: 'date' },
      { id: 'numbers', title: 'Numbers', type: 'number' },
      { id: 'dropdown', title: 'Dropdown', type: 'dropdown' }
    ];
    setColumns(mockColumns);
  }, [selectedBoard]);

  return (
    <div className="space-y-12">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          When a status changes in{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          {' / '}
          <SpreadsheetSelector
            selectedSpreadsheet={selectedSpreadsheet}
            onSpreadsheetSelect={setSelectedSpreadsheet}
          />
          {' / '}
          <SheetSelector
            selectedSheet={selectedSheet}
            onSheetSelect={setSelectedSheet}
          />
          {' '}with these{' '}
          <span className="text-white font-semibold bg-navy-light px-2 py-1 rounded">values</span>
          {' '}
          <div className="inline-block w-[180px]">
            <ValueSelector
              value={values}
              onChange={setValues}
              columns={columns}
              selectedColumn={selectedColumn}
              onColumnSelect={setSelectedColumn}
              placeholder="Select values"
            />
          </div>
        </p>
      </div>
    </div>
  );
};

export default StatusChangeConfig;