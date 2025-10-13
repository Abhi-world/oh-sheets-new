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
      console.log('Fetching spreadsheets from Google API');
      
      // Use real API call
      const spreadsheetsList = await fetchSpreadsheets();
      console.log('Fetched spreadsheets:', spreadsheetsList);
      
      setSpreadsheets(spreadsheetsList);
      
      // If we have spreadsheets but none selected, select the first one
      if (spreadsheetsList.length > 0 && !selectedSpreadsheet) {
        setSelectedSpreadsheet(spreadsheetsList[0].id);
      }
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast.error('Failed to load spreadsheets');
      setSpreadsheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleConnected, selectedSpreadsheet]);

  const fetchSheetsList = useCallback(async (spreadsheetId: string) => {
    if (!spreadsheetId || !isGoogleConnected) return;

    try {
      setIsLoading(true);
      console.log('Fetching sheets from Google API for spreadsheet:', spreadsheetId);

      // Use real API call
      const sheetsList = await fetchSheets(spreadsheetId);
      console.log('Fetched sheets:', sheetsList);
      
      setSheets(sheetsList);
      
      // If we have sheets but none selected, select the first one
      if (sheetsList.length > 0 && !selectedSheet) {
        setSelectedSheet(sheetsList[0].id);
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
      toast.error('Failed to load sheets');
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