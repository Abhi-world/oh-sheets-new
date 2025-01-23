import React from 'react';

interface AnimatedUnderlineTextProps {
  text: string;
}

const AnimatedUnderlineText = ({ text }: AnimatedUnderlineTextProps) => {
  return (
    <span className="relative inline-block pb-1">
      {text}
      <span 
        className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FEF7CD] transform transition-transform duration-500"
        style={{
          boxShadow: '0 0 8px rgba(254, 247, 205, 0.8)',
          animation: 'underlineWave 20s linear infinite'
        }}
      />
    </span>
  );
};

export default AnimatedUnderlineText;