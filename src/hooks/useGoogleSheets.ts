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
  // Initialize with empty arrays to ensure we fetch real data
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [sheets, setSheets] = useState<SheetOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const { isConnected: isGoogleConnected } = useGoogleSheetsStatus();

  const fetchSpreadsheetsList = useCallback(async () => {
    if (!isGoogleConnected) {
      console.log('Google Sheets not connected, skipping fetch');
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching spreadsheets from Google API via gs-list-spreadsheets');
      
      // Force real API call with no caching
      const spreadsheetsList = await fetchSpreadsheets();
      console.log('Fetched spreadsheets:', spreadsheetsList);
      
      if (!spreadsheetsList || spreadsheetsList.length === 0) {
        console.warn('No spreadsheets returned from API - may need to re-consent with correct scopes');
        toast.warning('No spreadsheets found. You may need to re-consent with Google.');
      }
      
      setSpreadsheets(spreadsheetsList);
      
      // If we have spreadsheets but none selected, select the first one
      if (spreadsheetsList.length > 0 && !selectedSpreadsheet) {
        setSelectedSpreadsheet(spreadsheetsList[0].id);
      }
      
      return spreadsheetsList;
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast.error('Failed to load spreadsheets. Please check your Google connection.');
      setSpreadsheets([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleConnected, selectedSpreadsheet]);

  const fetchSheetsList = useCallback(async (spreadsheetId: string) => {
    if (!spreadsheetId || !isGoogleConnected) {
      console.log('Cannot fetch sheets: spreadsheetId or Google connection missing');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching sheets from Google API for spreadsheet:', spreadsheetId);

      // Force real API call with no caching
      const sheetsList = await fetchSheets(spreadsheetId);
      console.log('Fetched sheets:', sheetsList);
      
      if (!sheetsList || sheetsList.length === 0) {
        console.warn('No sheets returned from API for spreadsheet:', spreadsheetId);
        toast.warning('No sheets found in the selected spreadsheet');
      }
      
      setSheets(sheetsList);
      
      // If we have sheets but none selected, select the first one
      if (sheetsList.length > 0 && !selectedSheet) {
        setSelectedSheet(sheetsList[0].id);
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
      toast.error('Failed to load sheets. Please check your Google connection.');
      setSheets([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleConnected, selectedSheet]);

  // Auto-fetch spreadsheets when Google is connected
  useEffect(() => {
    if (isGoogleConnected) {
      console.log('Google connected, fetching spreadsheets automatically');
      fetchSpreadsheetsList();
    }
  }, [isGoogleConnected, fetchSpreadsheetsList]);
  
  // Force fetch on component mount to ensure data is always available
  useEffect(() => {
    if (isGoogleConnected) {
      console.log('Component mounted, forcing spreadsheet fetch');
      // Add a slight delay to ensure proper loading
      setTimeout(() => {
        fetchSpreadsheetsList();
      }, 300);
    }
  }, [isGoogleConnected]);

  // Fetch sheets when spreadsheet is selected
  useEffect(() => {
    if (selectedSpreadsheet) {
      console.log('Spreadsheet selected, fetching sheets:', selectedSpreadsheet);
      fetchSheetsList(selectedSpreadsheet);
    } else {
      setSheets([]);
      setSelectedSheet('');
    }
  }, [selectedSpreadsheet, fetchSheetsList]);
  
  // Force immediate fetch of sheets when a spreadsheet is selected in a recipe component
  const forceSheetsFetch = useCallback((spreadsheetId: string) => {
    if (spreadsheetId && isGoogleConnected) {
      console.log('Force fetching sheets for spreadsheet:', spreadsheetId);
      fetchSheetsList(spreadsheetId);
    }
  }, [fetchSheetsList, isGoogleConnected]);

  return {
    spreadsheets,
    sheets,
    isLoading,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets: fetchSpreadsheetsList,
    forceSheetsFetch,
  };
};