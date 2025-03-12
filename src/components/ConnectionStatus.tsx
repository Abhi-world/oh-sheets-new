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
  const { isInMonday } = useMondayContext();
  
  // Don't show connect button for Monday.com when inside Monday environment
  const handleClick = () => {
    if (service === 'monday' && isInMonday) return;
    navigate(service === 'monday' ? '/connect-monday' : '/connect-sheets');
  };

  return (
    <Badge
      variant="outline"
      className={`
        cursor-pointer px-4 py-2 text-sm font-medium
        ${isConnected || (service === 'monday' && isInMonday)
          ? 'bg-white/95 text-navy border-google-green' 
          : 'bg-white/80 text-navy hover:bg-white/90'}
        transition-colors duration-200
      `}
      onClick={handleClick}
      style={{
        cursor: (service === 'monday' && isInMonday) ? 'default' : 'pointer'
      }}
    >
      {isConnected || (service === 'monday' && isInMonday) ? (
        <CheckCircle2 className="w-4 h-4 mr-2 text-google-green" />
      ) : (
        <XCircle className="w-4 h-4 mr-2 text-monday-blue" />
      )}
      {service === 'monday' ? 'Monday.com' : 'Google Sheets'}
      {!isConnected && !isInMonday && service === 'monday' && ' (Click to Connect)'}
      {!isConnected && service === 'sheets' && ' (Click to Connect)'}
    </Badge>
  );
};

export default ConnectionStatus;