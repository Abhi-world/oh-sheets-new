import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ColumnMappingData, convertToColumnMapping } from '@/types/trigger';

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

  const dataTypes = [
    { value: 'budget', label: 'Budget Value' },
    { value: 'date', label: 'Due Date' },
    { value: 'id', label: 'Item/Task ID' },
    { value: 'name', label: 'Name' },
    { value: 'owner', label: 'Owner Assignment' },
    { value: 'priority', label: 'Priority Level' },
  ];

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save trigger configuration');
        return;
      }

      // Convert ColumnMappingData[] to ColumnMapping[] for Supabase
      const supabaseColumnMappings = columnMappings.map(convertToColumnMapping);

      // Create trigger
      const { data: trigger, error: triggerError } = await supabase
        .from('triggers')
        .insert({
          user_id: user.id,
          trigger_type: 'date',
          trigger_date: triggerDate,
          trigger_time: triggerTime,
          relative_days: isRelative ? parseInt(relativeDays) : null,
          relative_direction: isRelative ? relativeDirection : null,
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
    } catch (error) {
      console.error('Error saving trigger configuration:', error);
      toast.error('Failed to save trigger configuration');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-navy-dark/40 p-6 rounded-lg border border-google-green/20">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Trigger Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white">Date</label>
                <Input
                  type="date"
                  value={triggerDate}
                  onChange={(e) => setTriggerDate(e.target.value)}
                  className="bg-navy-light border-google-green"
                />
              </div>
              <div>
                <label className="text-sm text-white">Time</label>
                <Input
                  type="time"
                  value={triggerTime}
                  onChange={(e) => setTriggerTime(e.target.value)}
                  className="bg-navy-light border-google-green"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-white">
                <input
                  type="checkbox"
                  checked={isRelative}
                  onChange={(e) => setIsRelative(e.target.checked)}
                  className="mr-2"
                />
                Use Relative Timing
              </label>
              
              {isRelative && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    value={relativeDays}
                    onChange={(e) => setRelativeDays(e.target.value)}
                    placeholder="Number of days"
                    className="bg-navy-light border-google-green"
                  />
                  <Select value={relativeDirection} onValueChange={(value: 'before' | 'after') => setRelativeDirection(value)}>
                    <SelectTrigger className="bg-navy-light border-google-green">
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before</SelectItem>
                      <SelectItem value="after">After</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

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

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Column Mappings</h3>
              <Button 
                onClick={addColumnMapping}
                variant="outline" 
                className="border-google-green text-google-green hover:bg-google-green/10"
              >
                Add Mapping
              </Button>
            </div>

            {columnMappings.map((mapping, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 items-center">
                <Input
                  value={mapping.sourceColumn}
                  onChange={(e) => updateColumnMapping(index, 'sourceColumn', e.target.value)}
                  placeholder="Source column"
                  className="bg-navy-light border-google-green"
                />
                <Input
                  value={mapping.targetColumn}
                  onChange={(e) => updateColumnMapping(index, 'targetColumn', e.target.value)}
                  placeholder="Target column"
                  className="bg-navy-light border-google-green"
                />
                <div className="flex gap-2">
                  <Select 
                    value={mapping.dataType} 
                    onValueChange={(value) => updateColumnMapping(index, 'dataType', value)}
                  >
                    <SelectTrigger className="bg-navy-light border-google-green">
                      <SelectValue placeholder="Data type" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => removeColumnMapping(index)}
                    variant="destructive"
                    size="icon"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>

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
