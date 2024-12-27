import React from 'react';
import RecipeConfigShell from '../shared/RecipeConfigShell';
import ConfigInput from '../shared/ConfigInput';
import ConfigSelect from '../shared/ConfigSelect';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DateTriggerConfig = () => {
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const handleSave = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_user_id')
        .single();

      if (!profile?.monday_user_id) {
        toast.error('Please connect your Monday.com account first');
        return;
      }

      toast.success('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    }
  };

  return (
    <RecipeConfigShell
      title="Date-Based Sync Configuration"
      description="Configure when and how to sync data based on dates from Monday.com to Google Sheets"
      onSave={handleSave}
    >
      <div className="space-y-6">
        <ConfigInput
          label="Trigger Date"
          type="date"
          placeholder="Select trigger date"
          onChange={() => {}}
        />

        <ConfigSelect
          label="Monday.com Board"
          value=""
          onChange={() => {}}
          options={[
            { value: 'board1', label: 'Main Board' },
            { value: 'board2', label: 'Development Board' },
          ]}
          placeholder="Select a board"
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Google Sheets Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <ConfigSelect
              label="Spreadsheet"
              value={selectedSpreadsheet}
              onChange={setSelectedSpreadsheet}
              options={spreadsheets.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Select spreadsheet"
            />

            <ConfigSelect
              label="Sheet"
              value={selectedSheet}
              onChange={setSelectedSheet}
              options={sheets.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Select sheet"
            />
          </div>
        </div>
      </div>
    </RecipeConfigShell>
  );
};

export default DateTriggerConfig;