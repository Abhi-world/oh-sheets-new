import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const RecipeCard = ({ title, description, category, icon, onClick }: RecipeCardProps) => {
  return (
    <Card 
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-navy-light backdrop-blur-sm border-t-2 border-t-google-green"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span className="text-xs text-white/60">{category}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/80 leading-relaxed">{description}</p>
        <Button 
          onClick={onClick}
          className="w-full bg-navy hover:bg-navy-light border border-google-green text-white hover:bg-opacity-90 transition-colors"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;