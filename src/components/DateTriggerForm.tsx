import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TriggerConfig {
  triggerDate: string;
  values: string[];
}

const DateTriggerForm = () => {
  const [triggerDate, setTriggerDate] = useState('');
  const [valuesInput, setValuesInput] = useState('');
  const [savedTriggers, setSavedTriggers] = useState<TriggerConfig[]>([]);

  useEffect(() => {
    // Check for triggers every minute
    const interval = setInterval(checkTriggers, 60000);
    console.log('Date trigger checker started');
    
    // Initial check
    checkTriggers();

    return () => clearInterval(interval);
  }, [savedTriggers]);

  const checkTriggers = () => {
    console.log('Checking triggers...');
    const today = new Date().toISOString().split('T')[0];
    
    savedTriggers.forEach(trigger => {
      if (trigger.triggerDate === today) {
        console.log('Trigger matched for date:', today);
        handleTriggerAction(trigger);
      }
    });
  };

  const handleTriggerAction = async (trigger: TriggerConfig) => {
    try {
      // This is where we'll integrate with Google Sheets
      // For now, we'll just log the action
      console.log('Adding values to Google Sheets:', trigger.values);
      toast.success('Values added to Google Sheets successfully');
      
      // Remove the triggered config after successful execution
      setSavedTriggers(prev => 
        prev.filter(t => t.triggerDate !== trigger.triggerDate)
      );
    } catch (error) {
      console.error('Failed to add values to Google Sheets:', error);
      toast.error('Failed to add values to Google Sheets');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the comma-separated values
    const values = valuesInput.split(',').map(v => v.trim());
    
    // Create new trigger config
    const newTrigger: TriggerConfig = {
      triggerDate,
      values
    };

    // Save the trigger
    setSavedTriggers(prev => [...prev, newTrigger]);
    
    // Reset form
    setTriggerDate('');
    setValuesInput('');
    
    console.log('New trigger saved:', newTrigger);
    toast.success('Trigger configuration saved successfully');
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
            <label className="text-sm font-medium">Values to Add</label>
            <Input 
              placeholder="Value1, Value2, Value3..."
              value={valuesInput}
              onChange={(e) => setValuesInput(e.target.value)}
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
                  <p>Values: {trigger.values.join(', ')}</p>
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