import { useState, useEffect } from 'react';
import { googleSheetsService } from '@/integrations/google/sheets';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function GoogleSheetsConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    try {
      const hasStoredCredentials = await googleSheetsService.initializeWithStoredCredentials();
      setIsConnected(hasStoredCredentials);
    } catch (error) {
      console.error('Error checking Google Sheets connection:', error);
      setIsConnected(false);
    }
  }

  async function handleConnect() {
    try {
      setIsConnecting(true);
      const authUrl = googleSheetsService.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Google Sheets:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to Google Sheets. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Connect to Google Sheets</h2>
      
      {isConnected ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Connected to Google Sheets</span>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Connect Google Sheets</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}