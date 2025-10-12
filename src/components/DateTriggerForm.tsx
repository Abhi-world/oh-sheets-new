import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TriggerConfig } from '@/types/trigger';
import TriggerDateInput from './triggers/date/TriggerDateInput';
import MondayBoardSelect from './triggers/date/MondayBoardSelect';
import GoogleSheetsConfig from './triggers/date/GoogleSheetsConfig';
import SavedTriggersList from './triggers/date/SavedTriggersList';

const DateTriggerForm = () => {
  const [triggerDate, setTriggerDate] = useState('');
  const [mondayBoardId, setMondayBoardId] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetId, setSheetId] = useState('');
  const [savedTriggers, setSavedTriggers] = useState<TriggerConfig[]>([]);
  const [boards, setBoards] = useState<Array<{ id: string, name: string }>>([]);

  useEffect(() => {
    fetchMondayBoards();
    loadSavedTriggers();
  }, []);

  const fetchMondayBoards = async () => {
    try {
      const { execMondayQuery } = await import('@/utils/mondaySDK');
      // Fix GraphQL validation error with properly formatted query
      const query = `query { 
        boards { 
          id 
          name
          state
          board_folder_id
          workspace_id
        } 
      }`;
      
      const result = await execMondayQuery(query);
      if (result.data?.boards) {
        setBoards(result.data.boards);
      }
    } catch (error) {
      console.error('Error fetching Monday.com boards:', error);
      toast.error('Failed to fetch Monday.com boards');
    }
  };

  const loadSavedTriggers = async () => {
    try {
      const { data: triggers } = await supabase
        .from('triggers')
        .select(`
          id,
          trigger_date,
          monday_board_id,
          sync_configurations (
            spreadsheet_id,
            sheet_id
          )
        `)
        .eq('trigger_type', 'date');

      if (triggers) {
        setSavedTriggers(triggers.map(t => ({
          triggerDate: t.trigger_date,
          mondayBoardId: t.monday_board_id,
          spreadsheetId: t.sync_configurations[0]?.spreadsheet_id,
          sheetId: t.sync_configurations[0]?.sheet_id
        })));
      }
    } catch (error) {
      console.error('Error loading saved triggers:', error);
      toast.error('Failed to load saved triggers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_user_id')
        .single();

      if (!profile?.monday_user_id) {
        toast.error('Please connect your Monday.com account first');
        return;
      }

      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          trigger_type: 'date',
          trigger_date: triggerDate,
          monday_board_id: mondayBoardId,
          monday_user_id: profile.monday_user_id
        })
        .select()
        .single();

      if (triggerError) throw triggerError;

      const { error: syncError } = await supabase
        .from('sync_configurations')
        .insert({
          trigger_id: trigger.id,
          spreadsheet_id: spreadsheetId,
          sheet_id: sheetId,
          column_mappings: []
        });

      if (syncError) throw syncError;

      setSavedTriggers(prev => [...prev, {
        triggerDate,
        mondayBoardId,
        spreadsheetId,
        sheetId
      }]);
      
      setTriggerDate('');
      setMondayBoardId('');
      setSpreadsheetId('');
      setSheetId('');
      
      toast.success('Trigger configuration saved successfully');
    } catch (error) {
      console.error('Error saving trigger configuration:', error);
      toast.error('Failed to save trigger configuration');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-monday-blue" />
          Date Trigger Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TriggerDateInput 
            value={triggerDate}
            onChange={setTriggerDate}
          />
          
          <MondayBoardSelect
            boards={boards}
            value={mondayBoardId}
            onChange={setMondayBoardId}
          />

          <GoogleSheetsConfig
            spreadsheetId={spreadsheetId}
            sheetId={sheetId}
            onSpreadsheetChange={setSpreadsheetId}
            onSheetChange={setSheetId}
          />

          <Button 
            type="submit"
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Save Configuration
          </Button>
        </form>

        <SavedTriggersList triggers={savedTriggers} />
      </CardContent>
    </Card>
  );
};

export default DateTriggerForm;