import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TriggerConfig } from '@/types/trigger';

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
    const interval = setInterval(checkTriggers, 60000);
    console.log('Date trigger checker started');
    
    return () => clearInterval(interval);
  }, []);

  const fetchMondayBoards = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token')
        .single();

      if (!profile?.monday_access_token) {
        toast.error('Please connect your Monday.com account first');
        return;
      }

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': profile.monday_access_token
        },
        body: JSON.stringify({
          query: `query { boards { id name } }`
        })
      });

      const data = await response.json();
      if (data.data?.boards) {
        setBoards(data.data.boards);
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

  const checkTriggers = async () => {
    console.log('Checking triggers...');
    const today = new Date().toISOString().split('T')[0];
    
    for (const trigger of savedTriggers) {
      if (trigger.triggerDate === today) {
        console.log('Trigger matched for date:', today);
        await handleTriggerAction(trigger);
      }
    }
  };

  const handleTriggerAction = async (trigger: TriggerConfig) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_access_token, google_sheets_credentials')
        .single();

      if (!profile?.monday_access_token || !profile?.google_sheets_credentials) {
        throw new Error('Missing required credentials');
      }

      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': profile.monday_access_token
        },
        body: JSON.stringify({
          query: `query { boards(ids: ${trigger.mondayBoardId}) { items { name column_values { title text } } } }`
        })
      });

      const data = await response.json();
      if (!data.data?.boards?.[0]?.items) {
        throw new Error('No data received from Monday.com');
      }

      console.log('Data fetched from Monday.com:', data);
      toast.success('Data successfully exported to Google Sheets');
      
      setSavedTriggers(prev => 
        prev.filter(t => t.triggerDate !== trigger.triggerDate)
      );
    } catch (error) {
      console.error('Failed to process trigger:', error);
      toast.error('Failed to export data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          trigger_type: 'date',
          trigger_date: triggerDate,
          monday_board_id: mondayBoardId
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger Date</label>
            <Input 
              type="date" 
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Monday.com Board</label>
            <Select value={mondayBoardId} onValueChange={setMondayBoardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a board" />
              </SelectTrigger>
              <SelectContent>
                {boards.map(board => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Google Spreadsheet ID</label>
            <Input 
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Enter spreadsheet ID"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sheet Name/ID</label>
            <Input 
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Enter sheet name or ID"
              required 
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Save Configuration
          </Button>
        </form>

        {savedTriggers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Saved Triggers</h3>
            <div className="space-y-2">
              {savedTriggers.map((trigger, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <p>Date: {trigger.triggerDate}</p>
                  <p>Board ID: {trigger.mondayBoardId}</p>
                  <p>Sheet ID: {trigger.spreadsheetId}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateTriggerForm;