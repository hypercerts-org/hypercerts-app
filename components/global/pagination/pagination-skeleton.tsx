export default async function Pagination() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center justify-start gap-2 w-[250px]">
        <div className="w-[90px] h-[40px] bg-slate-100 rounded-lg" />
        <div className="w-[90px] h-[40px] bg-slate-100 rounded-lg" />
      </div>

      <div className="flex items-center justify-end gap-2 w-[250px]">
        <div className="w-[90px] h-[40px] bg-slate-100 rounded-lg" />
        <div className="w-[90px] h-[40px] bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}
