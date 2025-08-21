import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMondayContext } from '@/hooks/useMonday';

interface ConnectionStatusProps {
  service: 'monday' | 'sheets';
  isConnected: boolean;
}

const ConnectionStatus = ({ service, isConnected }: ConnectionStatusProps) => {
  const navigate = useNavigate();
  const { data: contextData } = useMondayContext();
  const isInMonday = contextData?.isInMonday || false;
  
  // Handle click behavior differently based on environment and connection status
  const handleClick = () => {
    // If we're inside Monday.com environment, don't navigate for Monday.com service
    if (service === 'monday' && isInMonday) return;
    
    // Otherwise navigate to the appropriate connection page
    navigate(service === 'monday' ? '/connect-monday' : '/connect-sheets');
  };

  return (
    <button
      onClick={handleClick}
      disabled={(service === 'monday' && isInMonday)}
      className={`
        inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors
        ${isConnected || (service === 'monday' && isInMonday)
          ? 'bg-white/95 text-navy border-green-500' 
          : 'bg-white/80 text-navy hover:bg-white/90 border-gray-300'}
        ${(service === 'monday' && isInMonday) ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      {isConnected || (service === 'monday' && isInMonday) ? (
        <CheckCircle2 className="w-4 h-4 mr-2 text-google-green" />
      ) : (
        <XCircle className="w-4 h-4 mr-2 text-monday-blue" />
      )}
      {service === 'monday' ? 'Monday.com' : 'Google Sheets'}
      {!isConnected && !isInMonday && service === 'monday' && ' (Click to Connect)'}
      {!isConnected && service === 'sheets' && ' (Click to Connect)'}
    </button>
  );
};

export default ConnectionStatus;