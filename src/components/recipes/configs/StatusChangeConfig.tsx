import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import RecipeConfigShell from '../shared/RecipeConfigShell';
import ConfigSelect from '../shared/ConfigSelect';
import ConfigInput from '../shared/ConfigInput';

const StatusChangeConfig = () => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [spreadsheet, setSpreadsheet] = useState<string>('');
  const [sheet, setSheet] = useState<string>('');
  const [values, setValues] = useState<string>('');

  const columnOptions = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' }
  ];

  const statusOptions = [
    { value: 'done', label: 'Done' },
    { value: 'working', label: 'Working on it' },
    { value: 'stuck', label: 'Stuck' }
  ];

  return (
    <RecipeConfigShell>
      <p className="text-3xl leading-relaxed">
        When{' '}
        <ConfigSelect
          value={selectedColumn}
          onValueChange={setSelectedColumn}
          placeholder="status"
          options={columnOptions}
        />
        {' '}changes to{' '}
        <ConfigSelect
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          placeholder="Select a Column first"
          options={statusOptions}
        />
        , add a row in{' '}
        <ConfigInput 
          value={spreadsheet}
          onChange={(e) => setSpreadsheet(e.target.value)}
          placeholder="Spreadsheet"
        />
        {' '}/{' '}
        <ConfigInput 
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          placeholder="Sheet"
        />
        {' '}with these{' '}
        <ConfigInput 
          value={values}
          onChange={(e) => setValues(e.target.value)}
          placeholder="values"
        />
      </p>

      <Button 
        size="lg"
        className="bg-[#0073ea] hover:bg-[#0073ea]/90 text-white"
      >
        Create automation
      </Button>
    </RecipeConfigShell>
  );
};

export default StatusChangeConfig;