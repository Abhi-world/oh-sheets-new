import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ValueSelector from '@/components/shared/ValueSelector';
import ConfigSelect from '../shared/ConfigSelect';

const DateTriggerConfig = () => {
  const [triggerDate, setTriggerDate] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  
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
        toast.error("Please connect your Monday.com account first");
        return;
      }

      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <p className="text-xl leading-relaxed text-gray-800">
          When date{' '}
          <input
            type="date"
            value={triggerDate}
            onChange={(e) => setTriggerDate(e.target.value)}
            className="inline-block w-auto px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-google-green focus:border-transparent"
          />
          {' '}is reached in{' '}
          <ConfigSelect
            label=""
            value={selectedBoard}
            onValueChange={setSelectedBoard}
            options={[
              { value: 'board1', label: 'Main Board' },
              { value: 'board2', label: 'Development Board' },
            ]}
            placeholder="Select board"
            className="inline-block w-[200px]"
          />
          {', add a row in '}
          <ConfigSelect
            label=""
            value={selectedSpreadsheet}
            onValueChange={setSelectedSpreadsheet}
            options={spreadsheets.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select spreadsheet"
            className="inline-block w-[200px]"
          />
          {' / '}
          <ConfigSelect
            label=""
            value={selectedSheet}
            onValueChange={setSelectedSheet}
            options={sheets.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select sheet"
            className="inline-block w-[200px]"
          />
          {' with these values'}
        </p>

        {/* Information box */}
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-google-green mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-gray-600">
                This automation will trigger when the specified date is reached, adding a new row to your selected Google Sheet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTriggerConfig;