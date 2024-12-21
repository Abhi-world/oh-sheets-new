import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';

const StatusChangeConfig = () => {
  const [status, setStatus] = useState('');
  const [values, setValues] = useState('');
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const handleCreateAutomation = () => {
    if (!status || !selectedSpreadsheet || !selectedSheet || !values) {
      toast.error('Please fill in all fields');
      return;
    }
    
    console.log('Creating automation with:', {
      status,
      spreadsheet: selectedSpreadsheet,
      sheet: selectedSheet,
      values
    });
    toast.success('Automation created successfully');
  };

  return (
    <div className="space-y-8">
      <div className="bg-[#F1F0FB] p-6 rounded-lg">
        <p className="text-xl leading-relaxed text-[#1A1F2C]">
          When status changes to{' '}
          <Input
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-32 inline-block mx-1 bg-white border-[#9b87f5] focus-visible:ring-[#7E69AB]"
            placeholder="Done"
          />
          {', '}add a row in{' '}
          <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
            <SelectTrigger className="w-40 inline-flex bg-white border-[#9b87f5] focus:ring-[#7E69AB]">
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
            <SelectTrigger className="w-32 inline-flex bg-white border-[#9b87f5] focus:ring-[#7E69AB]">
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
            className="w-40 inline-block mx-1 bg-white border-[#9b87f5] focus-visible:ring-[#7E69AB]"
            placeholder="values"
          />
        </p>
      </div>

      <Button
        onClick={handleCreateAutomation}
        className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white py-6 text-lg font-medium rounded-lg shadow-lg"
        size="lg"
      >
        Create automation
      </Button>
    </div>
  );
};

export default StatusChangeConfig;