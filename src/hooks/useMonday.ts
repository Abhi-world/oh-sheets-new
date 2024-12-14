import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchMondayBoards, createMondayItem, updateMondayItem } from '@/utils/monday';
import { toast } from 'sonner';

export function useMonday() {
  const { data: boards, isLoading: isLoadingBoards, error: boardsError } = useQuery({
    queryKey: ['monday-boards'],
    queryFn: fetchMondayBoards,
    onError: (error) => {
      console.error('Error fetching Monday.com boards:', error);
      toast.error('Failed to fetch Monday.com boards');
    }
  });

  const createItem = useMutation({
    mutationFn: ({ boardId, itemName, columnValues }: {
      boardId: string;
      itemName: string;
      columnValues: Record<string, any>;
    }) => createMondayItem(boardId, itemName, columnValues),
    onSuccess: () => {
      toast.success('Item created successfully');
    },
    onError: (error) => {
      console.error('Error creating Monday.com item:', error);
      toast.error('Failed to create item');
    }
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, columnValues }: {
      itemId: string;
      columnValues: Record<string, any>;
    }) => updateMondayItem(itemId, columnValues),
    onSuccess: () => {
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      console.error('Error updating Monday.com item:', error);
      toast.error('Failed to update item');
    }
  });

  return {
    boards,
    isLoadingBoards,
    boardsError,
    createItem,
    updateItem
  };
}