import { useState, useEffect, useCallback } from 'react';
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

interface GoogleSheetsCredentials {
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

export const useGoogleSheets = () => {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetOption[]>([]);
  const [sheets, setSheets] = useState<SheetOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');

  const fetchSpreadsheets = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching user profile to get Google Sheets credentials...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to access Google Sheets');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('google_sheets_credentials')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.google_sheets_credentials) {
        console.error('Error fetching Google credentials:', profileError);
        toast.error('Please connect your Google Sheets account first');
        return;
      }

      const credentials = profile.google_sheets_credentials as GoogleSheetsCredentials;

      console.log('Fetching spreadsheets from Google Sheets API...');
      const response = await fetch('https://www.googleapis.com/drive/v3/files', {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Accept': 'application/json',
        },
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheets');
      }

      const data = await response.json();
      const spreadsheetsList = data.files
        .filter((file: any) => file.mimeType === 'application/vnd.google-apps.spreadsheet')
        .map((file: any) => ({
          id: file.id,
          name: file.name,
        }));

      console.log('Fetched spreadsheets:', spreadsheetsList);
      setSpreadsheets(spreadsheetsList);
    } catch (error) {
      console.error('Error fetching spreadsheets:', error);
      toast.error('Failed to fetch spreadsheets');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSheets = useCallback(async (spreadsheetId: string) => {
    if (!spreadsheetId) return;

    try {
      setIsLoading(true);
      console.log('Fetching sheets for spreadsheet:', spreadsheetId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to access Google Sheets');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('google_sheets_credentials')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.google_sheets_credentials) {
        console.error('Error fetching Google credentials:', profileError);
        toast.error('Please connect your Google Sheets account first');
        return;
      }

      const credentials = profile.google_sheets_credentials as GoogleSheetsCredentials;

      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Accept': 'application/json',
        },
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sheets');
      }

      const data = await response.json();
      const sheetsList = data.sheets.map((sheet: any) => ({
        id: sheet.properties.sheetId,
        name: sheet.properties.title,
      }));

      console.log('Fetched sheets:', sheetsList);
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
      fetchSheets(selectedSpreadsheet);
    } else {
      setSheets([]);
      setSelectedSheet('');
    }
  }, [selectedSpreadsheet, fetchSheets]);

  return {
    spreadsheets,
    sheets,
    isLoading,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
    fetchSpreadsheets,
  };
};