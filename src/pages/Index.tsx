import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const [mondayConnected, setMondayConnected] = useState(false);
  const [sheetsConnected] = useState(false);

  useEffect(() => {
    checkMondayConnection();
  }, []);

  const checkMondayConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('monday_api_key')
        .eq('id', user.id)
        .single();

      setMondayConnected(!!profile?.monday_api_key);
    } catch (error) {
      console.error('Error checking Monday connection:', error);
    }
  };

  const handleConnect = (service: 'monday' | 'sheets') => {
    if (service === 'monday') {
      navigate('/connect-monday');
    } else {
      console.log(`Connecting to ${service}`);
      toast.info(`Connecting to ${service}...`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Successfully logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Monday.com + Google Sheets Integration
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
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
                  <Button
                    onClick={() => handleConnect('monday')}
                    className="bg-[#ff3d57] hover:bg-[#ff3d57]/90"
                  >
                    Connect Monday.com
                  </Button>
                )}
                {!sheetsConnected && (
                  <Button
                    onClick={() => handleConnect('sheets')}
                    className="bg-[#34a853] hover:bg-[#34a853]/90"
                  >
                    Connect Google Sheets
                  </Button>
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