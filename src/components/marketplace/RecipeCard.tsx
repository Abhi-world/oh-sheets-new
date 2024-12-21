import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
      className="relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-white/95 backdrop-blur-sm border-t-2 border-t-google-green"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-navy">{title}</h3>
        </div>
        <span className="text-xs text-navy/60">{category}</span>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-navy leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;