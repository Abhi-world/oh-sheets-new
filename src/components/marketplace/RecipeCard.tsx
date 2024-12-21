import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface RecipeCardProps {
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  description,
  category,
  icon,
  onClick
}) => {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F1F0FB] rounded-lg">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-[#1A1F2C]">{title}</h3>
              <Badge variant="secondary" className="bg-[#F1F0FB] text-[#6E59A5]">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Button 
          onClick={onClick}
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 text-white"
        >
          Use Template
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;