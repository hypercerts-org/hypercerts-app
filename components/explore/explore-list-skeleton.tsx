import { HYPERCERTS_PER_PAGE } from "@/configs/ui";
import PaginationSkeleton from "@/components/pagination-skeleton";

export default function ExploreListSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-5">
        {Array.from({ length: HYPERCERTS_PER_PAGE }, (_, i) => (
          <div
            key={i}
            className="w-[275px] h-[300px] bg-slate-100 rounded-lg"
          />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  );
}
