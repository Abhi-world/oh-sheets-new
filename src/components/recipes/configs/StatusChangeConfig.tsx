import React, { useState, useEffect } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { useMonday, useMondayContext } from '@/hooks/useMonday';
import { useGoogleSheetsStatus } from '@/hooks/useGoogleSheetsStatus';
import BoardSelector from './status-change/BoardSelector';
import SheetSelector from './date-trigger/SheetSelector';
import ValueSelector from '@/components/shared/ValueSelector';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { setupMondaySDK } from '@/utils/mondaySDK';

const StatusChangeConfig = ({ onConfigValid }: { onConfigValid?: (isValid: boolean) => void }) => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedValues, setSelectedValues] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [detectedBoardId, setDetectedBoardId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { data: mondayData, isLoading: isMondayLoading, refetch: refetchMondayData } = useMonday();
  const { isInMonday } = useMondayContext();
  const { isConnected: isGoogleConnected, isLoading: isGoogleLoading } = useGoogleSheetsStatus();
  const boards = mondayData?.data?.boards || [];
  
  useEffect(() => {
    console.log('StatusChangeConfig - Monday data:', mondayData);
    console.log('StatusChangeConfig - Boards:', boards);
  }, [mondayData, boards]);
  
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
  
  // Detect board ID from Monday.com context when in Monday environment
  useEffect(() => {
    const detectBoardFromContext = async () => {
      if (isInMonday) {
        try {
          const { boardId } = await setupMondaySDK();
          if (boardId) {
            console.log('Detected board ID from Monday context:', boardId);
            setDetectedBoardId(boardId);
            setSelectedBoard(boardId);
          }
        } catch (error) {
          console.error('Error detecting board from Monday context:', error);
        }
      }
    };
    
    detectBoardFromContext();
  }, [isInMonday]);
  
  // Fetch spreadsheets when component mounts if connected to Google Sheets
  useEffect(() => {
    if (isGoogleConnected && !isSheetsLoading) {
      fetchSpreadsheets();
    }
  }, [isGoogleConnected, fetchSpreadsheets, isSheetsLoading]);

  useEffect(() => {
    const isValid = Boolean(selectedBoard && selectedSpreadsheet && selectedSheet && isGoogleConnected);
    onConfigValid?.(isValid);
  }, [selectedBoard, selectedSpreadsheet, selectedSheet, isGoogleConnected, onConfigValid]);
  
  const handleConnectGoogle = () => {
    navigate('/connect-sheets');
  };
  
  const handleRefreshBoards = async () => {
    setIsRefreshing(true);
    try {
      await refetchMondayData();
    } catch (error) {
      console.error('Error refreshing boards:', error);
    } finally {
      setIsRefreshing(false);
    }
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

  return (
    <div className="space-y-8">
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
      
      {isInMonday && (
        <Alert className="mb-4 border-green-500 bg-green-500/10">
          <Info className="h-4 w-4 text-green-500" />
          <AlertTitle>Running inside Monday.com</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>You're currently running the app inside Monday.com. {detectedBoardId ? 'Board has been automatically detected.' : 'Attempting to detect board...'}</p>
            <Button 
              onClick={handleRefreshBoards} 
              variant="outline" 
              size="sm"
              className="self-start flex items-center gap-2"
              disabled={isRefreshing || isMondayLoading}
            >
              {isRefreshing ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh Boards
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-navy-dark/40 p-6 rounded-lg">
        <p className="text-2xl leading-relaxed text-white">
          When the Status of any item changes in your{' '}
          <BoardSelector
            boards={boards}
            selectedBoard={selectedBoard}
            onBoardSelect={setSelectedBoard}
          />
          , automatically add a row with these{' '}
          <ValueSelector
            value={selectedValues}
            onChange={setSelectedValues}
            placeholder="values"
            className="inline-text text-2xl text-white"
          />
          {' '}in{' '}
          <SheetSelector
            spreadsheets={spreadsheets}
            sheets={sheets}
            selectedSpreadsheet={selectedSpreadsheet}
            selectedSheet={selectedSheet}
            onSpreadsheetSelect={setSelectedSpreadsheet}
            onSheetSelect={setSelectedSheet}
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

export default StatusChangeConfig;