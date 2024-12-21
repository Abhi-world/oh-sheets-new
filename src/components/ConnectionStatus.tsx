import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  service: 'monday' | 'sheets';
  isConnected: boolean;
}

const ConnectionStatus = ({ service, isConnected }: ConnectionStatusProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(service === 'monday' ? '/connect-monday' : '/connect-sheets');
  };

  return (
    <Badge
      variant="outline"
      className={`
        cursor-pointer px-4 py-2 text-sm font-medium
        ${isConnected 
          ? 'bg-white/95 text-navy border-google-green' 
          : 'bg-white/80 text-navy hover:bg-white/90'}
        transition-colors duration-200
      `}
      onClick={handleClick}
    >
      {isConnected ? (
        <CheckCircle2 className="w-4 h-4 mr-2 text-google-green" />
      ) : (
        <XCircle className="w-4 h-4 mr-2 text-monday-blue" />
      )}
      {service === 'monday' ? 'Monday.com' : 'Google Sheets'}
      {!isConnected && ' (Click to Connect)'}
    </Badge>
  );
};

export default ConnectionStatus;