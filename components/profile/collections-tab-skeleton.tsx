export default function CollectionsTabSkeleton({ length }: { length: number }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-rows-[repeat(auto-fit,_minmax(270px,_1fr))] gap-4">
        {Array.from({ length }, (_, i) => (
          <div
            key={i}
            className="max-w-screen-sm h-[150px] bg-slate-100 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
