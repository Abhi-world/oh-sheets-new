import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { setupMondaySDK, fetchBoardsWithSDK, execMondayQuery } from "@/utils/mondaySDK";
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
    // Use centralized query execution that handles both embedded and standalone modes
    console.log("Using execMondayQuery to fetch boards");

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

    const result = await execMondayQuery(query);
    console.log('Monday.com boards response:', result);
    return result;
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