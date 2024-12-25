import React from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';
import { Card } from '@/components/ui/card';

const ColumnChangeConfig = () => {
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    isLoading,
  } = useGoogleSheets();

  return (
    <div className="space-y-8">
      <p className="text-lg text-white/80">
        When a column value changes in Monday.com, automatically update corresponding rows in Google Sheets.
      </p>

      <Card className="bg-navy-light/50 border-google-green/30">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Spreadsheet
              </label>
              <Select 
                value={selectedSpreadsheet} 
                onValueChange={setSelectedSpreadsheet}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-navy-light border-google-green focus:ring-google-green/50">
                  <SelectValue placeholder="Choose a spreadsheet" />
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

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Sheet
              </label>
              <Select 
                value={selectedSheet} 
                onValueChange={setSelectedSheet}
                disabled={!selectedSpreadsheet || isLoading}
              >
                <SelectTrigger className="w-full bg-navy-light border-google-green focus:ring-google-green/50">
                  <SelectValue placeholder="Choose a sheet" />
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
      </Card>

      <Card className="bg-navy-dark/40 border border-google-green/20">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-6">Column Change Triggers</h3>
          <ColumnChangeTriggerForm />
        </div>
      </Card>
    </div>
  );
};

export default ColumnChangeConfig;