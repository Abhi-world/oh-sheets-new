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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('google_access_token, google_refresh_token, google_token_expiry')
        .eq('id', user.id)
        .single();

      if (profile?.google_access_token) {
        // Check if token is expired
        const expiryDate = profile.google_token_expiry ? new Date(profile.google_token_expiry) : null;
        const isExpired = expiryDate && (new Date() > expiryDate);
        
        this.auth.setCredentials({
          access_token: profile.google_access_token,
          refresh_token: profile.google_refresh_token,
          expiry_date: profile.google_token_expiry
        });
        
        // If token is expired, we'll still return true but the next API call will trigger a refresh
        console.log('Google Sheets credentials loaded, token ' + (isExpired ? 'is expired' : 'is valid'));
        return true;
      }

      console.log('No Google Sheets credentials found');
      return false;
    } catch (error) {
      console.error('Error initializing with stored credentials:', error);
      return false;
    }
  }
  
  /**
   * Gets the current access token
   */
  async getAccessToken() {
    try {
      const { credentials } = this.auth;
      
      if (credentials && credentials.access_token) {
        // Check if token is expired or about to expire (within 5 minutes)
        if (credentials.expiry_date && Date.now() >= (credentials.expiry_date - 5 * 60 * 1000)) {
          console.log('Google Sheets token expired or about to expire, refreshing...');
          try {
            // Token is expired, refresh it
            const { tokens } = await this.auth.refreshToken();
            
            // Update stored credentials
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase
                .from('profiles')
                .update({
                  google_access_token: tokens.access_token,
                  google_refresh_token: tokens.refresh_token || credentials.refresh_token,
                  google_token_expiry: tokens.expiry_date
                })
                .eq('id', user.id);
            }
            
            console.log('Successfully refreshed Google Sheets token');
            return tokens.access_token;
          } catch (refreshError) {
            console.error('Error refreshing Google Sheets token:', refreshError);
            // If refresh fails, try to use the existing token anyway
            // This might fail, but it's better than returning null immediately
            if (credentials.access_token) {
              console.log('Using existing token despite refresh failure');
              return credentials.access_token;
            }
            throw refreshError;
          }
        }
        
        return credentials.access_token;
      }
      
      console.error('No access token available');
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }
}

// Create and export the service instance
export const googleSheetsService = new GoogleSheetsService({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${import.meta.env.VITE_APP_URL || ''}/auth/google/callback`
});