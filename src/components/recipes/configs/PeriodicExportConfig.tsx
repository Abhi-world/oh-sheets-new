import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { ConfigComponentProps } from '@/types/recipe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PeriodicExportConfig = ({ onConfigValid }: ConfigComponentProps) => {
  const [interval, setInterval] = useState('');
  const [exportTime, setExportTime] = useState('09:00');
  const [frequency, setFrequency] = useState(1);
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
    const isValid = Boolean(interval && selectedSpreadsheet && selectedSheet);
    onConfigValid(isValid);
  }, [interval, selectedSpreadsheet, selectedSheet, onConfigValid]);

  return (
    <div className="space-y-8 text-white">
      <p className="text-xl leading-relaxed">
        Every{' '}
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid">
              {interval ? `${frequency} ${interval}${frequency > 1 ? 's' : ''}` : 'time period'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((period) => (
                  <Button
                    key={period}
                    variant={interval === period ? 'default' : 'outline'}
                    onClick={() => setInterval(period)}
                    className={interval === period ? 'bg-google-green' : 'hover:bg-google-green/10'}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
              
              {interval && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Every</span>
                    <Input
                      type="number"
                      min="1"
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      className="w-16 bg-transparent border-google-green focus:ring-google-green/50"
                    />
                    <span className="text-sm">{interval}{frequency > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-white/60" />
                      <span className="text-sm">at</span>
                    </div>
                    <Input
                      type="time"
                      value={exportTime}
                      onChange={(e) => setExportTime(e.target.value)}
                      className="bg-transparent border-google-green focus:ring-google-green/50"
                    />
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {' '}add a row in{' '}
        <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
          <SelectTrigger className="w-[180px] inline-flex bg-transparent border-none text-white underline decoration-dotted hover:decoration-solid">
            <SelectValue placeholder="spreadsheet" />
          </SelectTrigger>
          <SelectContent className="bg-[#1F2937] border-none">
            {spreadsheets.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {' / '}
        <Select value={selectedSheet} onValueChange={setSelectedSheet}>
          <SelectTrigger className="w-[150px] inline-flex bg-transparent border-none text-white underline decoration-dotted hover:decoration-solid">
            <SelectValue placeholder="sheet" />
          </SelectTrigger>
          <SelectContent className="bg-[#1F2937] border-none">
            {sheets.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-white hover:bg-white/10">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </p>

      {/* How it works section */}
      <div className="mt-8 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
            <span>?</span>
          </div>
          <h3 className="text-lg font-medium">How does this automation work?</h3>
        </div>
        <p className="text-white/80 leading-relaxed">
          This automation will export data from your Monday.com board to Google Sheets 
          at the specified interval and time. It will automatically create a new row 
          in your chosen Google Sheet with the latest data from your board.
        </p>
      </div>
    </div>
  );
};

export default PeriodicExportConfig;