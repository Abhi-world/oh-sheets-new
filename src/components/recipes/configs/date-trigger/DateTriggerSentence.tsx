import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import ValueSelector from '@/components/shared/ValueSelector';
import SheetSelector from '@/components/shared/SheetSelector';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DateTriggerSentenceProps {
  onConfigValid?: (isValid: boolean) => void;
}

const DateTriggerSentence = ({ onConfigValid }: DateTriggerSentenceProps) => {
  const [selectedDateColumn, setSelectedDateColumn] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const { isConnected: isGoogleConnected, isLoading: isGoogleLoading } = useGoogleSheetsStatus();
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets,
    isLoading: isSheetsLoading,
  } = useGoogleSheets();

  useEffect(() => {
    if (isGoogleConnected && !isSheetsLoading) {
      fetchSpreadsheets();
    }
  }, [isGoogleConnected, fetchSpreadsheets, isSheetsLoading]);

  useEffect(() => {
    const isValid = selectedDateColumn && selectedSpreadsheet && selectedSheet && selectedValues.length > 0 && isGoogleConnected;
    onConfigValid?.(isValid);
  }, [selectedDateColumn, selectedSpreadsheet, selectedSheet, selectedValues, isGoogleConnected, onConfigValid]);
  
  const handleConnectGoogle = () => {
    navigate('/connect-sheets');
  };
  
  const handleRefreshSheets = async () => {
    setIsRefreshing(true);
    try {
      await fetchSpreadsheets();
    } catch (error) {
      console.error('Error refreshing spreadsheets:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const dateColumns = [
    { id: 'due_date', label: 'Due date' },
    { id: 'timeline_start', label: 'Timeline start date' },
    { id: 'timeline_end', label: 'Timeline end date' }
  ];

  return (
    <div className="space-y-6">
      {!isGoogleConnected && (
        <Alert className="mb-4 border-yellow-500 bg-yellow-500/10">
          <Info className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Google Sheets Connection Required</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>You need to connect to Google Sheets before configuring this automation.</p>
            <Button 
              onClick={handleConnectGoogle} 
              variant="outline" 
              className="self-start"
            >
              Connect Google Sheets
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-[#1F2937] p-8 rounded-lg">
        <p className="text-2xl text-white/90 leading-relaxed">
          When{' '}
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-2xl text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid">
                {selectedDateColumn ? dateColumns.find(c => c.id === selectedDateColumn)?.label : 'date'}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] bg-[#374151] border-none">
              <div className="p-4">
                <div className="flex items-center px-3 py-2 mb-2">
                  <Search className="w-4 h-4 text-white/50 mr-2" />
                  <Input 
                    placeholder="Search date columns..."
                    className="border-none bg-transparent text-white placeholder:text-white/50 focus-visible:ring-0"
                  />
                </div>
                <div className="space-y-1">
                  {dateColumns.map(column => (
                    <button
                      key={column.id}
                      className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded"
                      onClick={() => setSelectedDateColumn(column.id)}
                    >
                      {column.label}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {' '}arrives, add a row in{' '}
          <SheetSelector
            items={spreadsheets}
            selectedId={selectedSpreadsheet}
            onSelect={setSelectedSpreadsheet}
            placeholder="spreadsheet"
            className="inline-block"
          />
          {' / '}
          <SheetSelector
            items={sheets}
            selectedId={selectedSheet}
            onSelect={setSelectedSheet}
            placeholder="sheet"
            className="inline-block"
          />
          {' '}with these{' '}
          <ValueSelector
            value={selectedValues.join(',')}
            onChange={(val) => setSelectedValues(val.split(',').filter(Boolean))}
            className="text-2xl text-white/90 hover:text-white underline decoration-dotted hover:decoration-solid"
            placeholder="values"
          />
        </p>
        
        {isGoogleConnected && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleRefreshSheets} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-white border-white/20 hover:bg-white/10"
              disabled={isRefreshing || isSheetsLoading}
            >
              {isRefreshing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh Sheets
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateTriggerSentence;