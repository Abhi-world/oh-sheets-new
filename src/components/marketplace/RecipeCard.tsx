import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecipeCardProps {
  title: string;
  description: string;
  category: string;
  Component: React.ComponentType;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  description,
  category,
  Component
}) => {
  const [isConfiguring, setIsConfiguring] = React.useState(false);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{title}</CardTitle>
            <Badge variant="secondary" className="mb-2">
              {category}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        {isConfiguring ? (
          <Component />
        ) : (
          <Button 
            onClick={() => setIsConfiguring(true)}
            className="w-full bg-monday-blue hover:bg-monday-blue/90"
          >
            Configure Recipe
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeCard;