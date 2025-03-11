import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchSpreadsheets, fetchSheets } from '@/lib/google-sheets';

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

  const fetchSpreadsheetsList = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching spreadsheets from Google Sheets API...');
      
      const spreadsheetsList = await fetchSpreadsheets();
      setSpreadsheets(spreadsheetsList);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast.error('Failed to fetch spreadsheets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSheetsList = useCallback(async (spreadsheetId: string) => {
    if (!spreadsheetId) return;

    try {
      setIsLoading(true);
      console.log('Fetching sheets for spreadsheet:', spreadsheetId);

      const sheetsList = await fetchSheets(spreadsheetId);
      console.log('Processed sheets list:', sheetsList);
      setSheets(sheetsList);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      toast.error('Failed to fetch sheets');
    } finally {
      setIsLoading(false);
    }
  }, []);

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