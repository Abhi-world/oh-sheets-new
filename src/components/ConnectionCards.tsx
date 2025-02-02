import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ConnectionCardsProps {
  sheetsConnected: boolean;
}

const ConnectionCards = ({ sheetsConnected }: ConnectionCardsProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto px-4 mt-8">
      {/* Google Sheets Connection Card */}
      <Card className="border border-white/20 bg-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Google Sheets Connection</CardTitle>
          <CardDescription className="text-white/80">
            Connect your Google Sheets account to sync data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => navigate('/connect-sheets')}
            className="w-full bg-[#34A853] hover:bg-[#34A853]/90"
            disabled={sheetsConnected}
          >
            {sheetsConnected ? 'Connected to Google Sheets' : 'Connect Google Sheets'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectionCards;