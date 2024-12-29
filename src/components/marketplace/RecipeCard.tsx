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
      className="relative overflow-hidden transition-all duration-300 hover:shadow-xl bg-white/90 backdrop-blur-sm border-0 group hover:-translate-y-1"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <span className="text-xs text-gray-500">{category}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        <Button 
          onClick={onClick}
          className="w-full bg-[#0F9D58] hover:bg-[#0F9D58]/90 text-white transition-colors shadow-md"
        >
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;