import { Json } from '@/integrations/supabase/types';

export interface TriggerConfig {
  triggerDate: string;
  mondayBoardId: string;
  spreadsheetId: string;
  sheetId: string;
}

export interface MondayBoard {
  id: string;
  name: string;
}

export interface SyncConfig {
  spreadsheetId: string;
  sheetId: string;
  trigger_id?: string;
}