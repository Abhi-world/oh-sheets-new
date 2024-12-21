import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const StatusChangeConfig = () => {
  const [fromStatus, setFromStatus] = useState('');
  const [toStatus, setToStatus] = useState('');
  const [spreadsheetName, setSpreadsheetName] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [values, setValues] = useState('');

  return (
    <div className="space-y-6">
      <p className="text-lg">
        When status changes from{' '}
        <Select value={fromStatus} onValueChange={setFromStatus}>
          <SelectTrigger className="w-40 inline-block mx-1 underline">
            <SelectValue placeholder="any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="working">Working on it</SelectItem>
            <SelectItem value="stuck">Stuck</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        {' '}to{' '}
        <Select value={toStatus} onValueChange={setToStatus}>
          <SelectTrigger className="w-40 inline-block mx-1 underline">
            <SelectValue placeholder="select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="working">Working on it</SelectItem>
            <SelectItem value="stuck">Stuck</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        , add row in{' '}
        <Input
          type="text"
          value={spreadsheetName}
          onChange={(e) => setSpreadsheetName(e.target.value)}
          className="w-40 inline-block mx-1 underline"
          placeholder="Spreadsheet"
        />
        {' '}/{' '}
        <Input
          type="text"
          value={sheetName}
          onChange={(e) => setSheetName(e.target.value)}
          className="w-40 inline-block mx-1 underline"
          placeholder="Sheet"
        />
        {' '}with these{' '}
        <Input
          type="text"
          value={values}
          onChange={(e) => setValues(e.target.value)}
          className="w-40 inline-block mx-1 underline"
          placeholder="values"
        />
      </p>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <Label className="text-sm text-gray-600">Preview</Label>
        <p className="mt-2 text-sm">
          {`When an item's status changes ${fromStatus ? `from "${fromStatus}"` : 'from any status'} ${
            toStatus ? `to "${toStatus}"` : ''
          }, a new row will be added to ${spreadsheetName || '[Spreadsheet]'}/${
            sheetName || '[Sheet]'
          } with ${values || '[values]'}.`}
        </p>
      </div>
    </div>
  );
};

export default StatusChangeConfig;