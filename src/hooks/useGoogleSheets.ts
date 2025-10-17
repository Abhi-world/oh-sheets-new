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
  // Add debug log at the very top
  console.log('🔧 [useGoogleSheets] Hook initialized');
  
  // Initialize with empty arrays to ensure we fetch real data
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [sheets, setSheets] = useState<SheetOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');
  const { isConnected: isGoogleConnected } = useGoogleSheetsStatus();

  // Add debug log for connection status
  console.log('🔌 [useGoogleSheets] isGoogleConnected:', isGoogleConnected);

  const fetchSpreadsheetsList = useCallback(async () => {
    console.log('🚀 [useGoogleSheets] fetchSpreadsheetsList called');
    console.log('🚀 [useGoogleSheets] isGoogleConnected:', isGoogleConnected);
    
    if (!isGoogleConnected) {
      console.log('❌ [useGoogleSheets] Google Sheets not connected, skipping fetch');
      return [];
    }
    
    try {
      setIsLoading(true);
      console.log('📋 [useGoogleSheets] Fetching spreadsheets from Google API via gs-list-spreadsheets');
      
      // Force real API call with no caching
      const spreadsheetsList = await fetchSpreadsheets();
      console.log('🔍 [useGoogleSheets] Raw spreadsheets response:', JSON.stringify(spreadsheetsList));
      
      if (!spreadsheetsList || spreadsheetsList.length === 0) {
        console.warn('⚠️ [useGoogleSheets] No spreadsheets returned from API - may need to re-consent with correct scopes');
        toast.warning('No spreadsheets found. You may need to re-consent with Google.');
      }
      
      // Ensure we're getting the expected data structure
      if (Array.isArray(spreadsheetsList)) {
        console.log(`✅ [useGoogleSheets] Found ${spreadsheetsList.length} spreadsheets with correct array structure`);
        setSpreadsheets(spreadsheetsList);
        
        // If we have spreadsheets but none selected, select the first one
        if (spreadsheetsList.length > 0 && !selectedSpreadsheet) {
          console.log('📌 [useGoogleSheets] Auto-selecting first spreadsheet:', spreadsheetsList[0]);
          setSelectedSpreadsheet(spreadsheetsList[0].id);
        }
      } else {
        console.error('❌ [useGoogleSheets] Spreadsheets response is not an array:', typeof spreadsheetsList);
        toast.error('Invalid spreadsheet data format received');
        setSpreadsheets([]);
      }
      
      return spreadsheetsList;
    } catch (error) {
      console.error('❌ [useGoogleSheets] Error fetching spreadsheets:', error);
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

  // Add useEffect to force fetch spreadsheets on hook initialization
  useEffect(() => {
    console.log('🔄 [useGoogleSheets] useEffect triggered - checking connection status');
    if (isGoogleConnected) {
      console.log('🔄 [useGoogleSheets] Google connected, triggering initial fetch');
      fetchSpreadsheetsList();
    } else {
      console.log('⚠️ [useGoogleSheets] Google not connected on initial load');
    }
  }, [isGoogleConnected, fetchSpreadsheetsList]);

  // Force fetch spreadsheets (exposed for components to call)
  const fetchSpreadsheets = useCallback(async () => {
    console.log('🔄 [useGoogleSheets] fetchSpreadsheets called directly');
    return fetchSpreadsheetsList();
  }, [fetchSpreadsheetsList]);

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