export default function OwnerLoading() {
  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6 animate-pulse">
      {/* Title */}
      <div className="h-8 w-48 bg-stone-200 rounded-lg" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-2xl" />
        ))}
      </div>

      {/* Tables */}
      <div className="space-y-4">
        <div className="h-64 bg-stone-200 rounded-2xl" />
        <div className="h-64 bg-stone-200 rounded-2xl" />
      </div>
    </div>
  );
}
