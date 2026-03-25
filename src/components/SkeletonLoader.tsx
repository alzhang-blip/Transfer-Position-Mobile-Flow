export function SkeletonLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-questrade-grey-200 rounded w-1/3" />
            <div className="h-2.5 bg-questrade-grey-100 rounded w-2/3" />
          </div>
          <div className="h-8 w-16 bg-questrade-grey-200 rounded-md" />
        </div>
      ))}
    </div>
  );
}
