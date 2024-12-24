import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ColumnMappingData, convertToColumnMapping } from '@/types/trigger';
import TriggerSettings from './date-trigger/TriggerSettings';
import ColumnMappings from './date-trigger/ColumnMappings';

const DateTriggerConfig = () => {
  const [triggerDate, setTriggerDate] = useState('');
  const [triggerTime, setTriggerTime] = useState('');
  const [isRelative, setIsRelative] = useState(false);
  const [relativeDays, setRelativeDays] = useState('');
  const [relativeDirection, setRelativeDirection] = useState<'before' | 'after'>('before');
  const [columnMappings, setColumnMappings] = useState<ColumnMappingData[]>([]);
  
  const {
    spreadsheets,
    sheets,
    selectedSpreadsheet,
    selectedSheet,
    setSelectedSpreadsheet,
    setSelectedSheet,
  } = useGoogleSheets();

  const addColumnMapping = () => {
    setColumnMappings([
      ...columnMappings,
      { sourceColumn: '', targetColumn: '', dataType: '' }
    ]);
  };

  const updateColumnMapping = (index: number, field: keyof ColumnMappingData, value: string) => {
    const newMappings = [...columnMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setColumnMappings(newMappings);
  };

  const removeColumnMapping = (index: number) => {
    setColumnMappings(columnMappings.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_user_id')
        .maybeSingle();

      if (!profile?.monday_user_id) {
        toast.error('Please connect your Monday.com account first');
        return;
      }

      // Convert ColumnMappingData[] to ColumnMapping[] for Supabase
      const supabaseColumnMappings = columnMappings.map(convertToColumnMapping);

      // Create trigger
      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          monday_user_id: profile.monday_user_id,
          trigger_type: 'date',
          trigger_date: triggerDate,
        })
        .select()
        .single();

      if (triggerError) throw triggerError;

      // Create sync configuration
      const { error: syncError } = await supabase
        .from('sync_configurations')
        .insert({
          trigger_id: trigger.id,
          spreadsheet_id: selectedSpreadsheet,
          sheet_id: selectedSheet,
          column_mappings: supabaseColumnMappings,
        });

      if (syncError) throw syncError;

      toast.success('Trigger configuration saved successfully');
      
      // Reset form
      setTriggerDate('');
      setTriggerTime('');
      setIsRelative(false);
      setRelativeDays('');
      setRelativeDirection('before');
      setColumnMappings([]);
      setSelectedSpreadsheet('');
      setSelectedSheet('');
    } catch (error) {
      console.error('Error saving trigger configuration:', error);
      toast.error('Failed to save trigger configuration');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <div className="space-y-6">
          <TriggerSettings
            triggerDate={triggerDate}
            triggerTime={triggerTime}
            isRelative={isRelative}
            relativeDays={relativeDays}
            relativeDirection={relativeDirection}
            onDateChange={setTriggerDate}
            onTimeChange={setTriggerTime}
            onIsRelativeChange={setIsRelative}
            onRelativeDaysChange={setRelativeDays}
            onRelativeDirectionChange={setRelativeDirection}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Google Sheets Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <Select value={selectedSpreadsheet} onValueChange={setSelectedSpreadsheet}>
                <SelectTrigger className="bg-navy-light border-google-green">
                  <SelectValue placeholder="Select spreadsheet" />
                </SelectTrigger>
                <SelectContent>
                  {spreadsheets.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger className="bg-navy-light border-google-green">
                  <SelectValue placeholder="Select sheet" />
                </SelectTrigger>
                <SelectContent>
                  {sheets.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ColumnMappings
            mappings={columnMappings}
            onAdd={addColumnMapping}
            onUpdate={updateColumnMapping}
            onRemove={removeColumnMapping}
          />

          <Button 
            onClick={handleSave}
            className="w-full bg-google-green hover:bg-google-green/90"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DateTriggerConfig;