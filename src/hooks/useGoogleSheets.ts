import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchSpreadsheets, fetchSheets } from '@/lib/google-sheets';
import { useGoogleSheetsStatus } from './useGoogleSheetsStatus';

interface SpreadsheetOption {
  id: string;
  name: string;
}

interface SheetOption {
  id: string;
  name: string;
}

export const useGoogleSheets = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [sheets, setSheets] = useState<SheetOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const { isConnected: isGoogleConnected } = useGoogleSheetsStatus();

  const fetchSpreadsheetsList = useCallback(async () => {
    if (!isGoogleConnected) {
      console.log('Google Sheets not connected, skipping fetch');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('TESTING MODE: Using mock spreadsheets data');
      
      // Use mock data instead of API call
      const spreadsheetsList = MOCK_SPREADSHEETS;
      console.log('Mock spreadsheets:', spreadsheetsList);
      
      setSpreadsheets(spreadsheetsList);
      
      // If we have spreadsheets but none selected, select the first one
      if (spreadsheetsList.length > 0 && !selectedSpreadsheet) {
        setSelectedSpreadsheet(spreadsheetsList[0].id);
      }
    } catch (error) {
      console.error('Error with mock spreadsheets:', error);
      toast.error('Failed to load mock spreadsheets');
      setSpreadsheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleConnected, selectedSpreadsheet]);

  const fetchSheetsList = useCallback(async (spreadsheetId: string) => {
    if (!spreadsheetId || !isGoogleConnected) return;

    try {
      setIsLoading(true);
      console.log('TESTING MODE: Using mock sheets data for spreadsheet:', spreadsheetId);

      // Use mock data instead of API call
      const sheetsList = MOCK_SHEETS[spreadsheetId] || [];
      console.log('Mock sheets:', sheetsList);
      
      setSheets(sheetsList);
      
      // If we have sheets but none selected, select the first one
      if (sheetsList.length > 0 && !selectedSheet) {
        setSelectedSheet(sheetsList[0].id);
      }
    } catch (error) {
      console.error('Error with mock sheets:', error);
      toast.error('Failed to load mock sheets');
      setSheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleConnected, selectedSheet]);

  // Auto-fetch spreadsheets when Google is connected
  useEffect(() => {
    if (isGoogleConnected) {
      fetchSpreadsheetsList();
    }
  }, [isGoogleConnected, fetchSpreadsheetsList]);

  // Fetch sheets when spreadsheet is selected
  useEffect(() => {
    if (selectedSpreadsheet) {
      fetchSheetsList(selectedSpreadsheet);
    } else {
      setSheets([]);
      setSelectedSheet('');
    }
  }, [selectedSpreadsheet, fetchSheetsList]);

  return {
    spreadsheets,
    sheets,
    isLoading,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets: fetchSpreadsheetsList,
  };
};