
import React from 'react';
import Hero from '@/components/home/Hero';
import RecipeGrid from '@/components/marketplace/RecipeGrid';
import DecorativeDivider from '@/components/home/DecorativeDivider';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useMonday } from '@/hooks/useMonday';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { data, isLoading, error } = useMonday();
  const isMondayConnected = !!data?.data?.boards;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] relative">
      {/* Clean background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      <Hero />
      
      <div className="container mx-auto px-4 mt-12 relative z-10">
        {/* Connection Status */}
        <div className="mb-8 flex justify-center gap-4">
          <ConnectionStatus service="monday" isConnected={isMondayConnected} />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error.message}
              <br />
              Please make sure you're properly connected to Monday.com and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Integration Templates</h2>
          <DecorativeDivider startColor="[#0F9D58]" endColor="[#0052CC]" />
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/10">
          <RecipeGrid />
        </div>
      </div>
    </div>
  );
};

export default Index;
