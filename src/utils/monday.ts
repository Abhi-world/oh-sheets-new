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
  const apiKey = await getMondayApiKey();
  if (!apiKey) throw new Error('Monday.com API key not found');

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

  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Monday.com boards');
  }

  const data = await response.json();
  console.log('Monday.com boards data:', data);
  return data.data.boards;
}

export async function createMondayItem(boardId: string, itemName: string, columnValues: Record<string, any>) {
  const apiKey = await getMondayApiKey();
  if (!apiKey) throw new Error('Monday.com API key not found');

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

  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({
      query,
      variables: {
        boardId,
        itemName,
        columnValues: JSON.stringify(columnValues)
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create Monday.com item');
  }

  const data = await response.json();
  console.log('Created Monday.com item:', data);
  return data.data.create_item;
}

export async function updateMondayItem(itemId: string, boardId: string, columnValues: Record<string, any>) {
  const apiKey = await getMondayApiKey();
  if (!apiKey) throw new Error('Monday.com API key not found');

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

  const response = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    },
    body: JSON.stringify({
      query,
      variables: {
        itemId,
        boardId,
        columnValues: JSON.stringify(columnValues)
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update Monday.com item');
  }

  const data = await response.json();
  console.log('Updated Monday.com item:', data);
  return data.data.change_multiple_column_values;
}

export async function subscribeToBoardUpdates(boardId: string, callback: (item: MondayItem) => void) {
  const apiKey = await getMondayApiKey();
  if (!apiKey) throw new Error('Monday.com API key not found');

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

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Failed to fetch board updates');

      const data = await response.json();
      const items = data.data.boards[0].items;
      items.forEach(callback);
    } catch (error) {
      console.error('Error fetching board updates:', error);
    }
  }, 30000); // Poll every 30 seconds
}