import { useState, useEffect } from 'react';

declare global {
  interface Window {
    monday?: any;
  }
}

/**
 * Checks if the application is running inside Monday.com's environment
 * by looking for Monday SDK or iframe environment indicators
 */
export function isMondayEnvironment(): boolean {
  // Check if we're in an iframe (Monday.com embeds apps in iframes)
  const isInIframe = window.self !== window.top;
  
  // Check for Monday.com specific URL parameters or domains
  const urlParams = new URLSearchParams(window.location.search);
  const hasMondayParams = urlParams.has('monday_token') || 
                         urlParams.has('instanceId') || 
                         urlParams.has('boardId') || 
                         urlParams.has('app');
  
  // Check if the parent domain is monday.com
  const isMondayDomain = window.location.hostname.includes('monday.com');
  
  // Check for Monday SDK global object
  const hasMondaySDK = typeof window.monday !== 'undefined';
  
  return isInIframe || hasMondayParams || isMondayDomain || hasMondaySDK;
}

/**
 * React hook to check if the app is running inside Monday.com's environment
 */
export function useMondayContext() {
  const [isInMonday, setIsInMonday] = useState<boolean>(false);
  
  useEffect(() => {
    setIsInMonday(isMondayEnvironment());
  }, []);
  
  return { isInMonday };
}