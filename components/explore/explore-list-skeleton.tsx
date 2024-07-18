import PaginationSkeleton from "@/components/pagination-skeleton";

export default function ExploreListSkeleton({ length }: { length: number }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            className="max-w-screen-sm h-[400px] bg-slate-100 rounded-lg"
          />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  );
}
