import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RecipeConfigLayout from '../RecipeConfigLayout';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import { toast } from 'sonner';

const ButtonClickConfig = () => {
  const [buttonName, setButtonName] = useState('');
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

    if (!buttonName || !selectedSpreadsheet || !selectedSheet || !values) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Automation created successfully');
  };

  return (
    <RecipeConfigLayout title="Button Click Integration">
      <div className="space-y-12">
        <p className="text-2xl leading-relaxed">
          When button{' '}
          <Input
            value={buttonName}
            onChange={(e) => setButtonName(e.target.value)}
            className="w-40 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="button name"
          />
          {' '}is clicked, add a row in{' '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger className="w-40 inline-flex bg-transparent border-b border-t-0 border-x-0 rounded-none text-white">
              <SelectValue placeholder="Select spreadsheet" />
            </SelectTrigger>
            <SelectContent>
              {spreadsheets.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' / '}
          <Select value={selectedSheet} onValueChange={setSelectedSheet}>
            <SelectTrigger className="w-32 inline-flex bg-transparent border-b border-t-0 border-x-0 rounded-none text-white">
              <SelectValue placeholder="Select sheet" />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {' '}with these{' '}
          <Input
            value={values}
            onChange={(e) => setValues(e.target.value)}
            className="w-40 inline-block mx-1 bg-transparent border-b border-t-0 border-x-0 rounded-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white"
            placeholder="values"
          />
        </p>

        <Button
          onClick={handleCreateAutomation}
          className="bg-[#0073ea] hover:bg-[#0073ea]/90 text-white px-8"
          size="lg"
        >
          Create automation
        </Button>
      </div>
    </RecipeConfigLayout>
  );
};

export default ButtonClickConfig;