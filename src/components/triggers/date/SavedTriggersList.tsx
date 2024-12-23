import React from 'react';
import { TriggerConfig } from '@/types/trigger';

interface SavedTriggersListProps {
  triggers: TriggerConfig[];
}

const SavedTriggersList = ({ triggers }: SavedTriggersListProps) => {
  if (triggers.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Saved Triggers</h3>
      <div className="space-y-2">
        {triggers.map((trigger, index) => (
          <div key={index} className="text-sm p-2 bg-gray-50 rounded">
            <p>Date: {trigger.triggerDate}</p>
            <p>Board ID: {trigger.mondayBoardId}</p>
            <p>Sheet ID: {trigger.spreadsheetId}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedTriggersList;