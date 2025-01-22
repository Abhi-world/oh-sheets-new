import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Skeleton from '@/components/shared/SkeletonLoader';

const RecipeConfigSkeleton = () => {
  return (
    <Card className="bg-[#1F2937] border-none shadow-xl">
      <CardContent className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Form fields skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeConfigSkeleton;