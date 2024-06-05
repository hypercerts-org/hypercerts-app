export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin">
        <div className="h-12 w-12 border-t-4 border-b-4 border-blue-500 rounded-full"></div>
      </div>
    </div>
  );
}
