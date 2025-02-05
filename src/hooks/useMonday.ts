import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function getMondayAccessToken() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to access Monday.com boards');

  const { data: profile } = await supabase
    .from('profiles')
    .select('monday_access_token')
    .eq('id', user.id)
    .single();

  if (!profile?.monday_access_token) {
    throw new Error('Monday.com access token not found. Please connect your Monday.com account.');
  }

  return profile.monday_access_token;
}

async function fetchMondayBoards() {
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
      'Authorization': accessToken
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch Monday.com boards:', errorText);
    throw new Error('Failed to fetch Monday.com boards. Please check your connection and permissions.');
  }

  const data = await response.json();
  if (data.errors) {
    console.error('Monday.com API errors:', data.errors);
    throw new Error(data.errors[0]?.message || 'Error fetching boards from Monday.com');
  }

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
  
  const boards = data?.data?.boards?.filter((board: any) => 
    board.workspace?.id === workspaceId
  ) || [];

  return { boards };
};

export default useMonday;