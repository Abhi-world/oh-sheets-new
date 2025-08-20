import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { setupMondaySDK, fetchBoardsWithSDK } from "@/utils/mondaySDK";
import { useState, useEffect } from "react";

async function getMondayAccessToken() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to access Monday.com boards');

  const { data: profile } = await supabase
    .from('profiles')
    .select('monday_access_token, monday_token_expires_at, monday_refresh_token')
    .eq('id', user.id)
    .single();

  if (!profile?.monday_access_token) {
    throw new Error('Monday.com access token not found. Please connect your Monday.com account.');
  }

  // Check if token is expired or about to expire (within 5 minutes)
  const expiresAt = profile.monday_token_expires_at ? new Date(profile.monday_token_expires_at) : null;
  const isExpired = expiresAt && (new Date() > new Date(expiresAt.getTime() - 5 * 60 * 1000));

  if (isExpired && profile.monday_refresh_token) {
    console.log('Monday.com token expired or about to expire, refreshing...');
    return await refreshMondayToken(profile.monday_refresh_token, user.id);
  }

  return profile.monday_access_token;
}

async function refreshMondayToken(refreshToken: string, userId: string) {
  try {
    console.log('Refreshing Monday.com access token...');
    
    // Call the token refresh edge function
    const { data: tokenData, error } = await supabase.functions.invoke('monday-token-refresh', {
      body: { refresh_token: refreshToken }
    });

    if (error || tokenData?.error) {
      console.error('Error refreshing token:', error || tokenData?.error);
      throw new Error('Failed to refresh Monday.com token');
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Update the profile with new token information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        monday_access_token: access_token,
        monday_refresh_token: refresh_token || refreshToken, // Use new refresh token if provided
        monday_token_expires_at: new Date(Date.now() + (expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile with new token:', updateError);
      throw new Error('Failed to update profile with new token');
    }

    console.log('Successfully refreshed Monday.com access token');
    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh Monday.com token. Please reconnect your account.');
  }
}

async function fetchMondayBoards() {
  try {
    // First try to use the Monday SDK if we're in Monday's environment
    const { mondayClient, isInMonday, boardId, sessionToken, context } = await setupMondaySDK();
    
    if (isInMonday) {
      console.log("Using Monday SDK to fetch boards in embedded mode");
      
      // Use centralized query execution for embedded mode
      const query = boardId ? `
        query {
          boards(ids: ${boardId}) {
            id
            name
            workspace {
              id
              name
            }
            items {
              id
              name
            }
          }
        }
      ` : `
        query {
          boards {
            id
            name
            workspace {
              id
              name
            }
            items {
              id
              name
            }
          }
        }
      `;

      const { execMondayQuery } = await import('@/utils/mondaySDK');
      return await execMondayQuery(query);
      
      // If no session token but we have board context, create a mock response
      if (boardId && context) {
        console.log("Creating board data from context without API call");
        return {
          data: {
            boards: [{
              id: boardId,
              name: context.boardName || `Board ${boardId}`,
              workspace: context.workspace || { id: 'workspace', name: 'Main Workspace' },
              items: []
            }]
          }
        };
      }
    }
    
    // If not in Monday's environment, use the traditional API approach
    const accessToken = await getMondayAccessToken();
    console.log("Fetching Monday.com boards with access token");

    const query = `
      query {
        boards {
          id
          name
          workspace {
            id
            name
          }
          items {
            id
            name
          }
        }
      }
    `;

    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch Monday.com boards:', errorText);
      
      if (response.status === 401) {
        // Attempt token refresh
        console.log('Received 401 unauthorized error, attempting to refresh token...');
        try {
          // Get a fresh token using our refresh mechanism
          const newToken = await getMondayAccessToken(); // This will trigger the refresh if needed
          
          // Retry the request with the new token
          console.log('Token refreshed, retrying request...');
          return await fetchMondayBoards();
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          throw new Error('SESSION_EXPIRED');
        }
      }
      throw new Error(`Monday API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error('Monday.com API errors:', data.errors);
      throw new Error(data.errors[0]?.message || 'Error fetching boards from Monday.com');
    }

    console.log('Monday.com boards response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchMondayBoards:', error);
    throw error;
  }
}

export const useMonday = () => {
  return useQuery({
    queryKey: ["monday-boards"],
    queryFn: fetchMondayBoards,
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useMondayWorkspaces = () => {
  const { data } = useMonday();
  
  const workspaces = data?.data?.boards?.reduce((acc: any[], board: any) => {
    if (board.workspace && !acc.find((w) => w.id === board.workspace.id)) {
      acc.push(board.workspace);
    }
    return acc;
  }, []) || [];
  
  return { workspaces };
};

export const useMondayContext = () => {
  const [isInMonday, setIsInMonday] = useState(false);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [context, setContext] = useState<any>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  useEffect(() => {
    const checkMondayContext = async () => {
      const { isInMonday: inMonday, boardId: detectedBoardId, context: mondayContext, sessionToken: token } = await setupMondaySDK();
      setIsInMonday(inMonday);
      setBoardId(detectedBoardId || null);
      setContext(mondayContext || null);
      setSessionToken(token || null);
    };
    
    checkMondayContext();
  }, []);
  
  return { isInMonday, boardId, context, sessionToken };
};

export const useMondayBoardsByWorkspace = (workspaceId: string) => {
  const { data } = useMonday();
  
  const boards = data?.data?.boards?.filter((board: any) => 
    board.workspace?.id === workspaceId
  ) || [];

  return { boards };
};

export default useMonday;