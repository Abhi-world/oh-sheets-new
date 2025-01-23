import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { ConfigComponentProps } from '@/types/recipe';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';
import SheetSelector from '@/components/shared/SheetSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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

  const getDisplayText = () => {
    if (!interval) return 'time period';
    return `${frequency} ${interval}${frequency > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-8 text-white max-w-3xl mx-auto py-4">
      <div className="bg-[#111827] text-white p-6 rounded-lg flex items-center justify-center min-h-[100px]">
        <p className="text-2xl leading-relaxed">
          Every{' '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-2xl text-white underline decoration-dotted hover:decoration-solid">
                {getDisplayText()}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] bg-[#1F2937] border-none text-white p-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setInterval(period)}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        interval === period 
                          ? 'bg-google-green text-white' 
                          : 'bg-[#374151] hover:bg-[#4B5563] text-white'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
                
                {interval && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-white/60">Repeat every</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={frequency}
                          onChange={(e) => setFrequency(Number(e.target.value))}
                          className="w-20 bg-[#374151] border-none text-white focus:ring-1 focus:ring-google-green"
                        />
                        <span className="text-sm">{interval}{frequency > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm text-white/60 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Export time
                      </label>
                      <Input
                        type="time"
                        value={exportTime}
                        onChange={(e) => setExportTime(e.target.value)}
                        className="bg-[#374151] border-none text-white focus:ring-1 focus:ring-google-green"
                      />
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          {' '}add a row in{' '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="text-2xl inline-block"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="text-2xl inline-block"
          />
        </p>
      </div>
    </div>
  );
};

export default PeriodicExportConfig;