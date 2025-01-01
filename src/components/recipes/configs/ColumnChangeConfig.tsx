import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ValueSelector from '@/components/shared/ValueSelector';
import { Card } from '@/components/ui/card';
import BoardSelector from './status-change/BoardSelector';

const ColumnChangeConfig = () => {
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

  return (
    <div className="space-y-12">
      <Card className="bg-recipe-navy/40 p-6 rounded-lg border-none">
        <p className="text-xl leading-relaxed text-white">
          When a column value changes in{' '}
          <BoardSelector
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          {' / '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger 
              className="w-[180px] inline-flex bg-recipe-navy/90 border-none text-white focus:ring-white/20"
              onClick={() => fetchSpreadsheets()}
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select spreadsheet"} />
            </SelectTrigger>
            <SelectContent className="bg-recipe-navy border-none">
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
              className="w-[150px] inline-flex bg-recipe-navy/90 border-none text-white focus:ring-white/20"
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select sheet"} />
            </SelectTrigger>
            <SelectContent className="bg-recipe-navy border-none">
              {sheets.map((s) => (
                <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' '}with these{' '}
          <span className="text-white font-semibold bg-recipe-navy/90 px-2 py-1 rounded">values</span>
          {' '}
          <div className="inline-block w-[180px]">
            <ValueSelector
              value={values}
              onChange={setValues}
              placeholder="Enter values"
            />
          </div>
          {' '}update to{' '}
          <div className="inline-block w-[180px]">
            <ValueSelector
              value={newValues}
              onChange={setNewValues}
              placeholder="Enter new values"
            />
          </div>
        </p>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;