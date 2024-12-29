import React from 'react';
import { ArrowLeft, X } from 'lucide-react';

interface InstallationHeaderProps {
  onBack: () => void;
  onClose: () => void;
}

const InstallationHeader = ({ onBack, onClose }: InstallationHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <ArrowLeft className="h-5 w-5" />
      </button>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default InstallationHeader;