import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const PeriodicExportConfig = () => {
  return (
    <div className="space-y-6">
      <p className="text-lg">
        Every{' '}
        <Select defaultValue="daily">
          <SelectTrigger className="w-40 inline-block mx-1 underline">
            <SelectValue placeholder="Select interval" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Hour</SelectItem>
            <SelectItem value="daily">Day</SelectItem>
            <SelectItem value="weekly">Week</SelectItem>
            <SelectItem value="monthly">Month</SelectItem>
          </SelectContent>
        </Select>
        , export all items to{' '}
        <Input
          type="text"
          className="w-40 inline-block mx-1 underline"
          placeholder="Spreadsheet"
        />
        {' '}/{' '}
        <Input
          type="text"
          className="w-40 inline-block mx-1 underline"
          placeholder="Sheet"
        />
      </p>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <Label className="text-sm text-gray-600">Preview</Label>
        <p className="mt-2 text-sm">
          Every [interval], all items will be exported to [Spreadsheet]/[Sheet].
        </p>
      </div>
    </div>
  );
};

export default PeriodicExportConfig;