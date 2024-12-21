import React from 'react';

interface RecipeHeaderProps {
  description: string;
}

const RecipeHeader = ({ description }: RecipeHeaderProps) => {
  return (
    <div className="prose">
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default RecipeHeader;