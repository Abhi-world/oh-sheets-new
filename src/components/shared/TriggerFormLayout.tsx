import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface TriggerFormLayoutProps {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
}

const TriggerFormLayout = ({ icon: Icon, title, children }: TriggerFormLayoutProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-monday-blue" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default TriggerFormLayout;