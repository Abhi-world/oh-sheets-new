import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  useEffect(() => {
    if (selectedSpreadsheet) {
      fetchSheets(selectedSpreadsheet);
    } else {
      setSheets([]);
      setSelectedSheet('');
    }
  }, [selectedSpreadsheet]);

  const fetchSpreadsheets = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual Google Sheets API call
      const mockSpreadsheets = [
        { id: '1', name: 'Project Tracker' },
        { id: '2', name: 'Sales Report' },
        { id: '3', name: 'Task List' },
      ];
      setSpreadsheets(mockSpreadsheets);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast.error('Failed to fetch spreadsheets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSheets = async (spreadsheetId: string) => {
    try {
      // TODO: Replace with actual Google Sheets API call
      const mockSheets = [
        { id: '1', name: 'Sheet1' },
        { id: '2', name: 'Sheet2' },
        { id: '3', name: 'Sheet3' },
      ];
      setSheets(mockSheets);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      toast.error('Failed to fetch sheets');
    }
  };

  return {
    spreadsheets,
    sheets,
    isLoading,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  };
};