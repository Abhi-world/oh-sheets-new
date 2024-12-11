import React, { useState } from 'react';
import ConnectionStatus from '@/components/ConnectionStatus';
import DateTriggerForm from '@/components/DateTriggerForm';
import PeriodicExportForm from '@/components/PeriodicExportForm';
import StatusTriggerForm from '@/components/StatusTriggerForm';
import ItemCreationTriggerForm from '@/components/ItemCreationTriggerForm';
import ColumnChangeTriggerForm from '@/components/ColumnChangeTriggerForm';
import PersonAssignmentTriggerForm from '@/components/PersonAssignmentTriggerForm';
import CustomValueTriggerForm from '@/components/CustomValueTriggerForm';
import FormSubmissionTriggerForm from '@/components/FormSubmissionTriggerForm';
import ButtonClickTriggerForm from '@/components/ButtonClickTriggerForm';
import { toast } from 'sonner';

const Index = () => {
  const [mondayConnected] = useState(false);
  const [sheetsConnected] = useState(false);

  const handleConnect = (service: 'monday' | 'sheets') => {
    console.log(`Connecting to ${service}`);
    toast.info(`Connecting to ${service}...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Monday.com + Google Sheets Integration
          </h1>
          <div className="flex flex-wrap gap-4">
            <ConnectionStatus service="monday" isConnected={mondayConnected} />
            <ConnectionStatus service="sheets" isConnected={sheetsConnected} />
          </div>
        </header>

        <main className="space-y-8">
          {(!mondayConnected || !sheetsConnected) && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Connect Your Services</h2>
              <div className="flex gap-4">
                {!mondayConnected && (
                  <button
                    onClick={() => handleConnect('monday')}
                    className="px-4 py-2 bg-monday-blue text-white rounded-md hover:bg-monday-blue/90 transition-colors"
                  >
                    Connect Monday.com
                  </button>
                )}
                {!sheetsConnected && (
                  <button
                    onClick={() => handleConnect('sheets')}
                    className="px-4 py-2 bg-google-green text-white rounded-md hover:bg-google-green/90 transition-colors"
                  >
                    Connect Google Sheets
                  </button>
                )}
              </div>
            </div>
          )}

          {mondayConnected && sheetsConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Date Trigger Template</h2>
                <DateTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Periodic Export Template</h2>
                <PeriodicExportForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Status Change Template</h2>
                <StatusTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Item Creation Template</h2>
                <ItemCreationTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Column Change Template</h2>
                <ColumnChangeTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Person Assignment Template</h2>
                <PersonAssignmentTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Custom Value Template</h2>
                <CustomValueTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Form Submission Template</h2>
                <FormSubmissionTriggerForm />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Button Click Template</h2>
                <ButtonClickTriggerForm />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;