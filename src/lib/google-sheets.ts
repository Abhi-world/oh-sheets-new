import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleSheetsCredentials {
  client_id: string;
  client_secret: string;
  refresh_token: string;
  access_token?: string;
}

/**
 * Retrieves Google Sheets credentials from the user's profile
 */
export async function getGoogleSheetsCredentials(): Promise<GoogleSheetsCredentials | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to access Google Sheets');
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_sheets_credentials')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.google_sheets_credentials) {
      console.error('Error fetching Google credentials:', profileError);
      return null;
    }

    return profile.google_sheets_credentials as unknown as GoogleSheetsCredentials;
  } catch (error) {
    console.error('Error getting Google Sheets credentials:', error);
    return null;
  }
}

/**
 * Gets a valid access token for Google Sheets API
 * If needed, refreshes the token using the refresh token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const credentials = await getGoogleSheetsCredentials();
    if (!credentials) return null;

    // If we already have an access token, use it
    if (credentials.access_token) {
      return credentials.access_token;
    }

    // Otherwise, get a new access token using the refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Error refreshing token:', errorData);
      throw new Error(`Failed to refresh token: ${errorData.error_description || tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Store the new access token in the user's profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({
          google_sheets_credentials: {
            ...credentials,
            access_token: accessToken,
          },
        })
        .eq('id', user.id);
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Fetches all spreadsheets from Google Drive
 */
export async function fetchSpreadsheets() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.spreadsheet\'', 
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Handle unauthorized error by attempting to refresh token
      if (response.status === 401) {
        console.log('Google Sheets token expired, attempting to refresh...');
        // Force a new token refresh by clearing the current access token
        const credentials = await getGoogleSheetsCredentials();
        if (credentials) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({
                google_sheets_credentials: {
                  ...credentials,
                  access_token: null, // Clear the access token to force refresh
                },
              })
              .eq('id', user.id);
          }
          
          // Try again with a fresh token
          return await fetchSpreadsheets();
        }
      }
      
      throw new Error(`Failed to fetch spreadsheets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
    }));
  } catch (error) {
    console.error('Error fetching spreadsheets:', error);
    throw error;
  }
}

/**
 * Fetches all sheets from a specific spreadsheet
 */
export async function fetchSheets(spreadsheetId: string) {
  try {
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // Handle unauthorized error by attempting to refresh token
      if (response.status === 401) {
        console.log('Google Sheets token expired, attempting to refresh...');
        // Force a new token refresh by clearing the current access token
        const credentials = await getGoogleSheetsCredentials();
        if (credentials) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({
                google_sheets_credentials: {
                  ...credentials,
                  access_token: null, // Clear the access token to force refresh
                },
              })
              .eq('id', user.id);
          }
          
          // Try again with a fresh token
          return await fetchSheets(spreadsheetId);
        }
      }
      
      throw new Error(`Failed to fetch sheets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sheets.map((sheet: any) => ({
      id: sheet.properties.sheetId.toString(),
      name: sheet.properties.title,
    }));
  } catch (error) {
    console.error('Error fetching sheets:', error);
    throw error;
  }
}