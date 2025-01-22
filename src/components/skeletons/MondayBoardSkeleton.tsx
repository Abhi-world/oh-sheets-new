import Skeleton from "@/components/shared/SkeletonLoader";

const MondayBoardSkeleton = () => {
  return (
    <div className="mb-4 p-4 border rounded">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-4">
        <div>
          <Skeleton className="h-5 w-24 mb-2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="ml-4 mb-2">
              <Skeleton className="h-4 w-full max-w-[200px]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MondayBoardSkeleton;