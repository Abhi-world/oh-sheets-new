import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import ValueSelector from './shared/ValueSelector';

interface CustomTrigger {
  condition: string;
  values: string;
  isActive: boolean;
}

const CustomValueTriggerForm = () => {
  const [triggers, setTriggers] = useState<CustomTrigger[]>([]);
  const [condition, setCondition] = useState('');
  const [values, setValues] = useState('');

  const handleAddTrigger = () => {
    if (!condition || !values) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTrigger: CustomTrigger = {
      condition,
      values,
      isActive: true
    };

    setTriggers(prev => [...prev, newTrigger]);
    toast.success('Custom value trigger added successfully');
    
    // Reset form
    setCondition('');
    setValues('');
  };

  const handleDeleteTrigger = (index: number) => {
    setTriggers(prev => prev.filter((_, i) => i !== index));
    toast.info('Trigger removed');
  };

  const toggleTrigger = (index: number) => {
    setTriggers(prev => prev.map((trigger, i) => {
      if (i === index) {
        return { ...trigger, isActive: !trigger.isActive };
      }
      return trigger;
    }));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-monday-blue" />
          Custom Value Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Condition</label>
            <Input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g., Priority = High"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Values</label>
            <ValueSelector
              value={values}
              onChange={setValues}
            />
          </div>

          <Button
            onClick={handleAddTrigger}
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Add Custom Value Trigger
          </Button>

          {triggers.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Active Triggers</h3>
              {triggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="font-medium">When {trigger.condition}</p>
                    <p className="text-sm text-gray-600">
                      Add values: {trigger.values}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTrigger(index)}
                      className={trigger.isActive ? 'bg-green-100' : 'bg-gray-100'}
                    >
                      {trigger.isActive ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTrigger(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomValueTriggerForm;