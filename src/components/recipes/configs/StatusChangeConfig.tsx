import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import { getMondayApiKey } from '@/utils/monday';

interface ColumnValue {
  id: string;
  title: string;
  type: string;
  settings?: {
    labels?: { [key: string]: string };
  };
}

const StatusChangeConfig = () => {
  const [values, setValues] = useState('');
  const [columns, setColumns] = useState<ColumnValue[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets,
    isLoading,
  } = useGoogleSheets();

  const fetchBoardColumns = async (boardId: string) => {
    try {
      const apiKey = await getMondayApiKey();
      if (!apiKey) {
        console.error('Monday.com API key not found');
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
          (col: ColumnValue) => col.type === 'status' || col.type === 'color'
        );
        setColumns(statusColumns);
      }
    } catch (error) {
      console.error('Error fetching board columns:', error);
    }
  };

  useEffect(() => {
    if (selectedSpreadsheet) {
      fetchBoardColumns(selectedSpreadsheet);
    }
  }, [selectedSpreadsheet]);

  return (
    <div className="space-y-12">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          When a status changes to{' '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger 
              className="w-40 inline-flex bg-navy-light border-google-green focus:ring-google-green/50"
              onClick={() => fetchSpreadsheets()}
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select board"} />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border border-google-green">
              {(spreadsheets || []).map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' / '}
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger className="w-32 inline-flex bg-navy-light border-google-green focus:ring-google-green/50">
              <SelectValue placeholder={isLoading ? "Loading..." : "Select sheet"} />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border border-google-green">
              {(sheets || []).map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' '}with these{' '}
          <span className="text-white font-semibold bg-navy-light px-2 py-1 rounded">values</span>
          {' '}
          <div className="inline-block w-40">
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