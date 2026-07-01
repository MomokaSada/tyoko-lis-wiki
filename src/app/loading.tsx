export default function RootLoading() {
  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-8 animate-pulse">
      {/* Welcome Banner Skeleton */}
      <div className="h-48 bg-stone-200 rounded-2xl" />

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
        <div className="lg:col-span-3 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-200 rounded-xl" />
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="h-64 bg-stone-200 rounded-xl" />
        </div>
      </div>

      {/* Ranking Skeleton */}
      <div className="h-72 bg-stone-200 rounded-2xl" />
    </div>
  );
}
