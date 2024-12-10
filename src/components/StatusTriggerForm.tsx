import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StatusTrigger {
  columnName: string;
  desiredStatus: string;
  values: string;
  type: 'trigger' | 'export';
  isActive: boolean;
}

const StatusTriggerForm = () => {
  const [triggers, setTriggers] = useState<StatusTrigger[]>([]);
  const [columnName, setColumnName] = useState('');
  const [desiredStatus, setDesiredStatus] = useState('');
  const [values, setValues] = useState('');
  const [triggerType, setTriggerType] = useState<'trigger' | 'export'>('trigger');

  const handleAddTrigger = () => {
    if (!columnName || !desiredStatus || (triggerType === 'trigger' && !values)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTrigger: StatusTrigger = {
      columnName,
      desiredStatus,
      values,
      type: triggerType,
      isActive: true
    };

    setTriggers(prev => [...prev, newTrigger]);
    toast.success('Status trigger added successfully');

    // Reset form
    setColumnName('');
    setDesiredStatus('');
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
          <AlertCircle className="w-5 h-5 text-monday-blue" />
          Status Change Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger Type</label>
            <Select
              value={triggerType}
              onValueChange={(value: 'trigger' | 'export') => setTriggerType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trigger">Add New Row</SelectItem>
                <SelectItem value="export">Export All Rows</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status Column Name</label>
            <Input
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Desired Status</label>
            <Input
              value={desiredStatus}
              onChange={(e) => setDesiredStatus(e.target.value)}
              placeholder="Enter desired status"
            />
          </div>

          {triggerType === 'trigger' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Values (comma-separated)</label>
              <Input
                value={values}
                onChange={(e) => setValues(e.target.value)}
                placeholder="Value1, Value2, Value3"
              />
            </div>
          )}

          <Button
            onClick={handleAddTrigger}
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Add Status Trigger
          </Button>

          {triggers.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Active Triggers</h3>
              {triggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex-1">
                    <p className="font-medium">{trigger.columnName}</p>
                    <p className="text-sm text-gray-600">
                      {trigger.type === 'trigger' ? 'Add Row' : 'Export All'} when status is "{trigger.desiredStatus}"
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

export default StatusTriggerForm;