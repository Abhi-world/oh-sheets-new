import React, { useState } from 'react';
import ConnectionStatus from '@/components/ConnectionStatus';
import DateTriggerForm from '@/components/DateTriggerForm';
import PeriodicExportForm from '@/components/PeriodicExportForm';
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;