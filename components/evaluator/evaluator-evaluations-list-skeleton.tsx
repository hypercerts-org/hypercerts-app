import { Skeleton } from "../ui/skeleton";

export default function EvaluatorEvaluationsListSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <Skeleton className="h-[150px] w-full rounded-xl" />
      <Skeleton className="h-[150px] w-full rounded-xl" />
    </div>
  );
}
