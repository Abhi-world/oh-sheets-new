import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import RecipeConfigShell from '../shared/RecipeConfigShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface PeriodicExportConfigProps {
  onConfigValid?: (isValid: boolean) => void;
}

const PeriodicExportConfig = ({ onConfigValid }: PeriodicExportConfigProps) => {
  const [interval, setInterval] = useState('');
  const [exportTime, setExportTime] = useState('09:00');
  const { isConnected } = useGoogleSheetsStatus();
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets,
  } = useGoogleSheets();

  useEffect(() => {
    fetchSpreadsheets();
  }, [fetchSpreadsheets]);

  useEffect(() => {
    const isValid = interval && selectedSpreadsheet && selectedSheet;
    onConfigValid?.(isValid);
  }, [interval, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="space-y-6">
      {/* Main configuration sentence */}
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <p className="text-xl leading-relaxed text-white">
          Every{' '}
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-32 inline-flex bg-navy-light border-google-green focus:ring-google-green/50">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-navy-light border border-google-green">
              <SelectItem value="hourly" className="text-white">Hour</SelectItem>
              <SelectItem value="daily" className="text-white">Day</SelectItem>
              <SelectItem value="weekly" className="text-white">Week</SelectItem>
              <SelectItem value="monthly" className="text-white">Month</SelectItem>
            </SelectContent>
          </Select>
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
        </p>
      </div>

      {/* Additional configuration options */}
      <Card className="bg-navy-dark/20 border-none">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            <h3 className="text-lg font-medium">Export Schedule Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Export Time</Label>
              <Input
                type="time"
                value={exportTime}
                onChange={(e) => setExportTime(e.target.value)}
                className="bg-navy-light border-google-green focus:ring-google-green/50 text-white"
              />
              <p className="text-sm text-white/60">
                Set the time when the export should run each {interval || 'period'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PeriodicExportConfig;