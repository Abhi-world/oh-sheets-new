import React from 'react';
import { Card } from '@/components/ui/card';

interface RecipeConfigLayoutProps {
  title: string;
  children: React.ReactNode;
}

const RecipeConfigLayout = ({ title, children }: RecipeConfigLayoutProps) => {
  return (
    <Card className="w-full max-w-4xl mx-auto p-8 bg-[#0073ea] text-white">
      <h2 className="text-2xl font-semibold mb-8">{title}</h2>
      {children}
    </Card>
  );
};

export default RecipeConfigLayout;