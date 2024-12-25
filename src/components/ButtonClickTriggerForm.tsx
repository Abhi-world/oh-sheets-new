import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import TriggerFormLayout from './shared/TriggerFormLayout';
import TriggerFormField from './shared/TriggerFormField';
import TriggerList from './shared/TriggerList';
import ValueSelector from './shared/ValueSelector';

interface ButtonTrigger {
  buttonName: string;
  values: string;
  isActive: boolean;
}

const ButtonClickTriggerForm = () => {
  const [triggers, setTriggers] = useState<ButtonTrigger[]>([]);
  const [buttonName, setButtonName] = useState('');
  const [values, setValues] = useState('');

  const handleAddTrigger = () => {
    if (!buttonName || !values) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTrigger: ButtonTrigger = {
      buttonName,
      values,
      isActive: true
    };

    setTriggers(prev => [...prev, newTrigger]);
    toast.success('Button click trigger added successfully');
    
    setButtonName('');
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

  const renderTriggerContent = (trigger: ButtonTrigger) => (
    <>
      <p className="font-medium">Button: {trigger.buttonName}</p>
      <p className="text-sm text-gray-600">Values: {trigger.values}</p>
    </>
  );

  return (
    <TriggerFormLayout icon={Plus} title="Button Click Integration">
      <TriggerFormField
        label="Button Name"
        value={buttonName}
        onChange={setButtonName}
        placeholder="Enter button name"
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Values</label>
        <ValueSelector
          value={values}
          onChange={setValues}
          placeholder="Select column types..."
        />
      </div>

      <Button
        onClick={handleAddTrigger}
        className="w-full bg-monday-blue hover:bg-monday-blue/90"
      >
        Add Button Trigger
      </Button>

      <TriggerList
        triggers={triggers}
        onToggle={toggleTrigger}
        onDelete={handleDeleteTrigger}
        renderTriggerContent={renderTriggerContent}
      />
    </TriggerFormLayout>
  );
};

export default ButtonClickTriggerForm;