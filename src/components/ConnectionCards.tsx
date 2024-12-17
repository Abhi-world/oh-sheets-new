import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface ConnectionCardsProps {
  mondayConnected: boolean;
  sheetsConnected: boolean;
}

const ConnectionCards = ({ mondayConnected, sheetsConnected }: ConnectionCardsProps) => {
  // Temporarily return null to hide connection requirements
  return null;
};

export default ConnectionCards;