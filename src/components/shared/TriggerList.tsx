import React from 'react';
import { Button } from '@/components/ui/button';

interface TriggerListProps {
  triggers: any[];
  onToggle: (index: number) => void;
  onDelete: (index: number) => void;
  renderTriggerContent: (trigger: any) => React.ReactNode;
}

const TriggerList = ({ 
  triggers, 
  onToggle, 
  onDelete, 
  renderTriggerContent 
}: TriggerListProps) => {
  if (triggers.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-medium">Active Triggers</h3>
      {triggers.map((trigger, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex-1">
            {renderTriggerContent(trigger)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggle(index)}
              className={trigger.isActive ? 'bg-green-100' : 'bg-gray-100'}
            >
              {trigger.isActive ? 'Active' : 'Inactive'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(index)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TriggerList;