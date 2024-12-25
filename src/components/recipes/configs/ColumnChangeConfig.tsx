import React from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';

const ColumnChangeConfig = () => {
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              Select Spreadsheet
            </label>
            <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
              <SelectTrigger className="w-full bg-navy-light border-google-green focus:ring-google-green/50">
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
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">
              Select Sheet
            </label>
            <Select value={selectedSheet} onValueChange={setSelectedSheet}>
              <SelectTrigger className="w-full bg-navy-light border-google-green focus:ring-google-green/50">
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
          </div>
        </div>
      </div>

      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <h3 className="text-lg font-medium text-white mb-6">Column Change Triggers</h3>
        <ColumnChangeTriggerForm />
      </div>
    </div>
  );
};

export default ColumnChangeConfig;