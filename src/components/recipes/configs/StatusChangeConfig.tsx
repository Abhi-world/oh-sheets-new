import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';
import { getMondayApiKey } from '@/utils/monday';
import { toast } from 'sonner';

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
  const [boards, setBoards] = useState<Array<{ id: string, name: string }>>([]);
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
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchBoardColumns(selectedBoard);
    }
  }, [selectedBoard]);

  const fetchBoards = async () => {
    try {
      const apiKey = await getMondayApiKey();
      if (!apiKey) {
        toast.error('Monday.com API key not found');
        return;
      }

      const query = `
        query {
          boards {
            id
            name
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
        throw new Error('Failed to fetch boards');
      }

      const data = await response.json();
      console.log('Monday.com boards:', data);
      
      if (data.data?.boards) {
        setBoards(data.data.boards);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('Failed to fetch Monday.com boards');
    }
  };

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
          (col: ColumnValue) => col.type === 'status' || col.type === 'color'
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
          <Select value={selectedBoard} onValueChange={setSelectedBoard}>
            <SelectTrigger 
              className="w-[180px] inline-flex bg-navy-light border-none text-white focus:ring-white/20"
              onClick={() => fetchBoards()}
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select board"} />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border-none">
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id} className="text-white hover:bg-white/10">
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' / '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger 
              className="w-[180px] inline-flex bg-navy-light border-none text-white focus:ring-white/20"
              onClick={() => fetchSpreadsheets()}
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select spreadsheet"} />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border-none">
              {spreadsheets.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' / '}
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger 
              className="w-[150px] inline-flex bg-navy-light border-none text-white focus:ring-white/20"
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select sheet"} />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border-none">
              {sheets.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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