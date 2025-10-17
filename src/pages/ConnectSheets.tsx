import { GoogleSheetsConnect } from '@/components/GoogleSheetsConnect';
import GoogleReconsentGuide from '@/components/GoogleReconsentGuide';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ConnectSheets = () => {
  const [showReconsentGuide, setShowReconsentGuide] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#7B61FF] via-[#9B87F5] to-[#7E69AB] p-4">
      {showReconsentGuide ? (
        <div className="w-full max-w-3xl">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              className="text-white flex items-center gap-1"
              onClick={() => setShowReconsentGuide(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Connect
            </Button>
          </div>
          <GoogleReconsentGuide />
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <GoogleSheetsConnect />
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100"
                onClick={() => setShowReconsentGuide(true)}
              >
                <AlertCircle className="h-4 w-4" />
                Having issues? View Re-consent Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectSheets;