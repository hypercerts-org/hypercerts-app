import { ATTESTORS_PER_PAGE } from "../../configs/ui";
import PaginationSkeleton from "../global/pagination/pagination-skeleton";

export default function EvaluatorsListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 w-full">
        {Array.from({ length: ATTESTORS_PER_PAGE }, (_, i) => (
          <div key={i} className="w-full h-[50px] bg-slate-100 rounded-lg" />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  );
}
