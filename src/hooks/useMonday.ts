import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getMondayAccessToken() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('monday_access_token')
    .eq('id', user.id)
    .single();

  return profile?.monday_access_token;
}

async function fetchMondayBoards() {
  const accessToken = await getMondayAccessToken();
  if (!accessToken) {
    throw new Error('Monday.com access token not found');
  }

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
      'Authorization': accessToken
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    console.error('Failed to fetch Monday.com boards:', await response.text());
    throw new Error('Failed to fetch Monday.com boards');
  }

  const data = await response.json();
  console.log('Monday.com boards response:', data);
  return data;
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
  
  // Extract unique workspaces from boards
  const workspaces = data?.data?.boards?.reduce((acc: any[], board: any) => {
    if (board.workspace && !acc.find((w) => w.id === board.workspace.id)) {
      acc.push(board.workspace);
    }
    return acc;
  }, []) || [];

  return { workspaces };
};

export const useMondayBoardsByWorkspace = (workspaceId: string) => {
  const { data } = useMonday();
  
  // Filter boards by workspace
  const boards = data?.data?.boards?.filter((board: any) => 
    board.workspace?.id === workspaceId
  ) || [];

  return { boards };
};

export default useMonday;