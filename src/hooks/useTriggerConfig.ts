import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TriggerConfig } from '@/types/trigger';
import { toast } from 'sonner';

export const useTriggerConfig = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveTriggerConfig = async (config: TriggerConfig) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          user_id: user.id,
          trigger_type: 'date',
          trigger_date: config.triggerDate,
          monday_board_id: config.mondayBoardId
        })
        .select()
        .single();

      if (triggerError) throw triggerError;

      const { error: syncError } = await supabase
        .from('sync_configurations')
        .insert({
          trigger_id: trigger.id,
          spreadsheet_id: config.spreadsheetId,
          sheet_id: config.sheetId,
          column_mappings: []
        });

      if (syncError) throw syncError;

      toast.success('Trigger configuration saved successfully');
      return trigger.id;
    } catch (error) {
      console.error('Error saving trigger configuration:', error);
      toast.error('Failed to save trigger configuration');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTriggerConfig = async (triggerId: string) => {
    try {
      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .select(`
          *,
          sync_configurations (*)
        `)
        .eq('id', triggerId)
        .single();

      if (triggerError) throw triggerError;
      return trigger;
    } catch (error) {
      console.error('Error fetching trigger configuration:', error);
      toast.error('Failed to fetch trigger configuration');
      throw error;
    }
  };

  return {
    isLoading,
    saveTriggerConfig,
    getTriggerConfig,
  };
};