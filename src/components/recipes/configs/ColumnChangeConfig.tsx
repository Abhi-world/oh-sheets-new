import React, { useState } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ValueSelector from '@/components/shared/ValueSelector';
import { Card } from '@/components/ui/card';

const ColumnChangeConfig = () => {
  const [values, setValues] = useState('');
  const [newValues, setNewValues] = useState('');
  
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
      <Card className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          When a column value changes in{' '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger 
              className="w-[180px] inline-flex bg-navy-light border-google-green focus:ring-google-green/50"
              onClick={() => fetchSpreadsheets()}
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select spreadsheet"} />
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
            <SelectTrigger 
              className="w-[150px] inline-flex bg-navy-light border-google-green focus:ring-google-green/50"
            >
              <SelectValue placeholder={isLoading ? "Loading..." : "Select sheet"} />
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
          <span className="text-white font-semibold bg-navy-light px-2 py-1 rounded">values</span>
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