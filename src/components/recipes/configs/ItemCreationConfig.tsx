import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import BoardSelector from './status-change/BoardSelector';
import ValueSelector from '@/components/shared/ValueSelector';

const ItemCreationConfig = () => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('status');
  const [values, setValues] = useState('');
  const { isConnected } = useGoogleSheetsStatus();
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  // Mock columns for testing
  const mockColumns = [
    { id: 'status', title: 'Status' },
    { id: 'priority', title: 'Priority' },
    { id: 'text', title: 'Text' },
    { id: 'person', title: 'Person' },
    { id: 'date', title: 'Date' },
    { id: 'numbers', title: 'Numbers' },
    { id: 'dropdown', title: 'Dropdown' }
  ];

  return (
    <div className="space-y-12">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          When a new item is created in{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          {', '}add a row in{' '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger className="w-40 inline-flex bg-navy-light border-google-green focus:ring-google-green/50">
              <SelectValue placeholder="Select spreadsheet" />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border border-google-green">
              {spreadsheets.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' / '}
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger className="w-32 inline-flex bg-navy-light border-google-green focus:ring-google-green/50">
              <SelectValue placeholder="Select sheet" />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border border-google-green">
              {sheets.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' '}with these{' '}
          <div className="inline-block w-[180px]">
            <ValueSelector
              value={values}
              onChange={setValues}
              placeholder="Enter values"
              columns={mockColumns}
              selectedColumn={selectedColumn}
              onColumnSelect={setSelectedColumn}
            />
          </div>
        </p>
      </div>
    </div>
  );
};

export default ItemCreationConfig;