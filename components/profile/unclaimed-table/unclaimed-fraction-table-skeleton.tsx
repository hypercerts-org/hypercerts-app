export function UnclaimedFractionTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
          />
        ))}
      </div>

      {/* Table rows */}
      {[...Array(4)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-12 bg-gray-100 dark:bg-gray-900 rounded animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
