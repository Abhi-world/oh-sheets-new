import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import ValueSelector from '@/components/shared/ValueSelector';

const GroupMoveConfig = () => {
  const [groupName, setGroupName] = useState('');
  const [values, setValues] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  return (
    <div className="space-y-12">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          When items are moved to group{' '}
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-40 inline-block mx-1 bg-navy-light border-google-green focus-visible:ring-google-green/50"
            placeholder="group name"
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
          <div className="inline-block w-40">
            <ValueSelector
              value={values}
              onChange={setValues}
            />
          </div>
        </p>
      </div>
    </div>
  );
};

export default GroupMoveConfig;