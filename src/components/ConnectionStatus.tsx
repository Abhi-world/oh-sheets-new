import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  service: 'monday' | 'sheets';
  isConnected: boolean;
}

const ConnectionStatus = ({ service, isConnected }: ConnectionStatusProps) => {
  const serviceName = service === 'monday' ? 'Monday.com' : 'Google Sheets';
  const icon = isConnected ? (
    <CheckCircle className="w-5 h-5 text-google-green" />
  ) : (
    <XCircle className="w-5 h-5 text-google-red" />
  );

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-white shadow-sm">
      {icon}
      <span className="text-sm font-medium">
        {serviceName} {isConnected ? 'Connected' : 'Not Connected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;