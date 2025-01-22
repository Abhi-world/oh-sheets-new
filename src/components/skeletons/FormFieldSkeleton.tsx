import Skeleton from "@/components/shared/SkeletonLoader";

const FormFieldSkeleton = () => {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
};

export default FormFieldSkeleton;