import React from 'react';
import GlowingLogo from './GlowingLogo';
import AnimatedUnderlineText from './AnimatedUnderlineText';
import DecorativeDivider from './DecorativeDivider';

const Hero = () => {
  return (
    <div className="relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center">
              <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-xl mb-8">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#228B22] to-[#0052CC] bg-clip-text text-transparent">
                  Oh Sheets
                </h1>
              </div>

              <GlowingLogo />

              <p className="text-lg text-white mt-4 max-w-lg mx-auto">
                Seamlessly sync your{' '}
                <AnimatedUnderlineText text="Monday.com" />
                {' '}data with{' '}
                <AnimatedUnderlineText text="Google Sheets" />
                {' '}using our automated integration templates
              </p>

              <style>
                {`
                  @keyframes underlineWave {
                    0%, 100% {
                      transform: scaleX(1) translateY(0) rotate(-0.5deg);
                      opacity: 1;
                    }
                    25% {
                      transform: scaleX(1.1) translateY(1px) rotate(0.5deg);
                    }
                    50% {
                      transform: scaleX(0) translateY(0) rotate(-0.5deg);
                      opacity: 0;
                    }
                    75% {
                      transform: scaleX(1.1) translateY(-1px) rotate(0.5deg);
                    }
                  }
                `}
              </style>
            </div>

            <DecorativeDivider />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;