import React from 'react';

interface DecorativeDividerProps {
  startColor?: string;
  endColor?: string;
}

const DecorativeDivider = ({ 
  startColor = '[#228B22]', 
  endColor = '[#0052CC]' 
}: DecorativeDividerProps) => {
  return (
    <div className="flex items-center space-x-2 mt-6">
      <div className={`w-2 h-2 rounded-full bg-${startColor} opacity-80`} />
      <div className={`w-24 h-1 bg-gradient-to-r from-${startColor}/80 to-${endColor}/80 rounded-full`} />
      <div className={`w-2 h-2 rounded-full bg-${endColor} opacity-80`} />
    </div>
  );
};

export default DecorativeDivider;