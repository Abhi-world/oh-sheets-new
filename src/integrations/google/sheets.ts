interface GoogleSheetsConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  expiry_date?: number;
}

interface GoogleSpreadsheet {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
    };
  }>;
}

class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private accessToken: string | null = null;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  /**
   * Generates the URL for OAuth2 authorization
   */
  getAuthUrl(): string {
    // Correct scopes (space-separated URLs, no Markdown formatting)
    const scopes = [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ].join(" ");
    
    const p = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri, // must match Google Console exact URI
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  }

  /**
   * Handles the OAuth2 callback and exchanges the code for tokens
   */
  async handleAuthCallback(code: string): Promise<GoogleTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth error: ${response.status} ${response.statusText}`);
      }

      const tokens: GoogleTokens = await response.json();
      
      // Calculate expiry date
      if (tokens.expires_in) {
        tokens.expiry_date = Date.now() + (tokens.expires_in * 1000);
      }

      this.accessToken = tokens.access_token;

      // Store tokens in localStorage as fallback
      localStorage.setItem('google_sheets_tokens', JSON.stringify(tokens));

      return tokens;
    } catch (error) {
      console.error('Error handling Google Sheets auth callback:', error);
      throw error;
    }
  }

  /**
   * Refreshes the access token using the refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh error: ${response.status} ${response.statusText}`);
      }

      const tokens: GoogleTokens = await response.json();
      
      // Calculate expiry date
      if (tokens.expires_in) {
        tokens.expiry_date = Date.now() + (tokens.expires_in * 1000);
      }

      this.accessToken = tokens.access_token;

      return tokens;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Creates a new Google Sheet
   */
  async createSpreadsheet(title: string): Promise<GoogleSpreadsheet> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Spreadsheet creation error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Updates values in a spreadsheet
   */
  async updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<any> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Spreadsheet update error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating spreadsheet values:', error);
      throw error;
    }
  }

  /**
   * Gets values from a spreadsheet
   */
  async getValues(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spreadsheet read error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Error getting spreadsheet values:', error);
      throw error;
    }
  }

  /**
   * Gets a list of spreadsheets
   */
  async getSpreadsheets(): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Stronger Drive query with shared drives support
      const qs = new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: "files(id,name)",
        orderBy: "modifiedTime desc",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
        pageSize: "50"
      });

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${qs}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error getting spreadsheets:', error);
      throw error;
    }
  }

  /**
   * Initializes the service with stored credentials
   */
  async initializeWithStoredCredentials(): Promise<boolean> {
    try {
      // Try to get stored tokens from localStorage
      const storedTokens = localStorage.getItem('google_sheets_tokens');
      if (storedTokens) {
        const tokens: GoogleTokens = JSON.parse(storedTokens);
        
        // Check if token is expired
        if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
          console.log('Stored Google Sheets token is expired');
          if (tokens.refresh_token) {
            try {
              const newTokens = await this.refreshAccessToken(tokens.refresh_token);
              localStorage.setItem('google_sheets_tokens', JSON.stringify(newTokens));
              console.log('Successfully refreshed Google Sheets token');
              return true;
            } catch (error) {
              console.error('Failed to refresh token:', error);
              return false;
            }
          }
          return false;
        }

        this.accessToken = tokens.access_token;
        console.log('Google Sheets credentials loaded from localStorage');
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
  async getAccessToken(): Promise<string | null> {
    try {
      if (this.accessToken) {
        return this.accessToken;
      }

      // Try to initialize with stored credentials
      const hasCredentials = await this.initializeWithStoredCredentials();
      if (hasCredentials && this.accessToken) {
        return this.accessToken;
      }

      console.error('No access token available');
      return null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Clears stored credentials
   */
  clearCredentials(): void {
    this.accessToken = null;
    localStorage.removeItem('google_sheets_tokens');
  }
}

// Create and export the service instance
export const googleSheetsService = new GoogleSheetsService({
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${window.location.origin}/auth/google/callback`
});