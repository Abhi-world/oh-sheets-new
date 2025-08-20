import { supabase } from "@/integrations/supabase/client";

export interface MondayItem {
  id: string;
  name: string;
  column_values: Array<{
    id: string;
    value: string;
    text: string;
  }>;
}

export async function getMondayApiKey(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('monday_api_key')
      .eq('id', user.id)
      .single();

    return profile?.monday_api_key || null;
  } catch (error) {
    console.error('Error fetching Monday.com API key:', error);
    return null;
  }
}

export async function fetchMondayBoards() {
  const { execMondayQuery } = await import('@/utils/mondaySDK');
  
  const query = `
    query {
      boards {
        id
        name
        items {
          id
          name
          column_values {
            id
            value
            text
          }
        }
      }
    }
  `;

  const result = await execMondayQuery(query);
  console.log('Monday.com boards data:', result.data);
  return result.data.boards;
}

export async function createMondayItem(boardId: string, itemName: string, columnValues: Record<string, any>) {
  const { execMondayQuery } = await import('@/utils/mondaySDK');
  
  const query = `
    mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
      create_item (
        board_id: $boardId,
        item_name: $itemName,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const variables = {
    boardId,
    itemName,
    columnValues: JSON.stringify(columnValues)
  };

  const result = await execMondayQuery(query, variables);
  console.log('Created Monday.com item:', result.data);
  return result.data.create_item;
}

export async function updateMondayItem(itemId: string, boardId: string, columnValues: Record<string, any>) {
  const { execMondayQuery } = await import('@/utils/mondaySDK');
  
  const query = `
    mutation ($itemId: ID!, $boardId: ID!, $columnValues: JSON!) {
      change_multiple_column_values (
        item_id: $itemId,
        board_id: $boardId,
        column_values: $columnValues
      ) {
        id
      }
    }
  `;

  const variables = {
    itemId,
    boardId,
    columnValues: JSON.stringify(columnValues)
  };

  const result = await execMondayQuery(query, variables);
  console.log('Updated Monday.com item:', result.data);
  return result.data.change_multiple_column_values;
}

export async function subscribeToBoardUpdates(boardId: string, callback: (item: MondayItem) => void) {
  const { execMondayQuery } = await import('@/utils/mondaySDK');
  
  // This is a simplified example. In a production environment,
  // you would typically use WebSockets or a webhook endpoint
  setInterval(async () => {
    try {
      const query = `
        query {
          boards(ids: [${boardId}]) {
            items {
              id
              name
              column_values {
                id
                value
                text
              }
            }
          }
        }
      `;

      const result = await execMondayQuery(query);
      if (result.data?.boards && result.data.boards.length > 0) {
        const items = result.data.boards[0].items;
        items.forEach(callback);
      }
    } catch (error) {
      console.error('Error fetching board updates:', error);
    }
  }, 30000); // Poll every 30 seconds
}