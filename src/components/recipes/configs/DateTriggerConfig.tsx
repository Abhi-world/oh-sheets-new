import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RecipeConfigLayout from '../RecipeConfigLayout';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import { toast } from 'sonner';

const DateTriggerConfig = () => {
  const [triggerDate, setTriggerDate] = useState('');
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

  const handleCreateAutomation = () => {
    if (!isConnected) {
      toast.error('Please connect to Google Sheets first');
      return;
    }

    if (!triggerDate || !selectedSpreadsheet || !selectedSheet || !values) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Automation created successfully');
  };

  return (
    <div className="space-y-12">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed">
          On{' '}
          <Input
            type="date"
            value={triggerDate}
            onChange={(e) => setTriggerDate(e.target.value)}
            className="w-40 inline-block mx-1 bg-navy-light border-google-green focus-visible:ring-google-green/50"
          />
          , add a row in{' '}
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
          <Input
            value={values}
            onChange={(e) => setValues(e.target.value)}
            className="w-40 inline-block mx-1 bg-navy-light border-google-green focus-visible:ring-google-green/50"
            placeholder="values"
          />
        </p>
      </div>

      <Button
        onClick={handleCreateAutomation}
        className="w-full bg-navy hover:bg-navy-light border border-google-green text-white hover:bg-opacity-90 transition-colors py-6 text-lg font-medium rounded-lg shadow-lg"
        size="lg"
      >
        Create automation
      </Button>
    </div>
  );
};

export default DateTriggerConfig;