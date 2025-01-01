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
  const [selectedColumn, setSelectedColumn] = useState<string>('');
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
    if (selectedBoard) {
      fetchBoardColumns(selectedBoard);
    }
  }, [selectedBoard]);

  const fetchBoardColumns = async (boardId: string) => {
    try {
      const apiKey = await getMondayApiKey();
      if (!apiKey) {
        toast.error('Monday.com API key not found');
        return;
      }

      const query = `
        query {
          boards(ids: [${boardId}]) {
            columns {
              id
              title
              type
              settings_str
            }
          }
        }
      `;

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch board columns');
      }

      const data = await response.json();
      console.log('Monday.com board columns:', data);
      
      if (data.data?.boards?.[0]?.columns) {
        const statusColumns = data.data.boards[0].columns.filter(
          (col: any) => col.type === 'status' || col.type === 'color'
        );
        setColumns(statusColumns);
      }
    } catch (error) {
      console.error('Error fetching board columns:', error);
      toast.error('Failed to fetch board columns');
    }
  };

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
            />
          </div>
        </p>
      </div>
    </div>
  );
};

export default StatusChangeConfig;