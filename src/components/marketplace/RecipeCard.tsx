import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00c875]/10 rounded-lg">
              {icon}
            </div>
            <div>
              <CardTitle className="text-xl mb-2">{title}</CardTitle>
              <Badge variant="secondary" className="mb-2">
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <Button 
          onClick={onClick}
          className="w-full bg-[#00c875] hover:bg-[#00c875]/90 text-white"
        >
          Use Template
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;