import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { supabase } from '@/integrations/supabase/client';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

interface GoogleSheetsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class GoogleSheetsService {
  private auth: GoogleAuth;
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.initializeClient();
  }

  private initializeClient() {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    this.auth = oauth2Client;
    this.sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  }

  /**
   * Generates the URL for OAuth2 authorization
   */
  getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Handles the OAuth2 callback and exchanges the code for tokens
   */
  async handleAuthCallback(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);

      // Store the tokens in Supabase for the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            google_access_token: tokens.access_token,
            google_refresh_token: tokens.refresh_token,
            google_token_expiry: tokens.expiry_date
          })
          .eq('id', user.id);
      }

      return tokens;
    } catch (error) {
      console.error('Error handling Google Sheets auth callback:', error);
      throw error;
    }
  }

  /**
   * Creates a new Google Sheet
   */
  async createSpreadsheet(title: string) {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Updates values in a spreadsheet
   */
  async updateValues(spreadsheetId: string, range: string, values: any[][]) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error updating spreadsheet values:', error);
      throw error;
    }
  }

  /**
   * Gets values from a spreadsheet
   */
  async getValues(spreadsheetId: string, range: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });

      return response.data.values;
    } catch (error) {
      console.error('Error getting spreadsheet values:', error);
      throw error;
    }
  }

  /**
   * Initializes the service with stored credentials
   */
  async initializeWithStoredCredentials() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, google_token_expiry')
      .eq('id', user.id)
      .single();

    if (profile?.google_access_token) {
      this.auth.setCredentials({
        access_token: profile.google_access_token,
        refresh_token: profile.google_refresh_token,
        expiry_date: profile.google_token_expiry
      });
      return true;
    }

    return false;
  }
}

// Create and export the service instance
export const googleSheetsService = new GoogleSheetsService({
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${process.env.APP_URL}/auth/google/callback`
});