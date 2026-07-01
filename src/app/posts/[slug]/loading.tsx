export default function PostDetailLoading() {
  return (
    <div className="max-w-[48rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-stone-200 rounded" />

      {/* Title */}
      <div className="h-10 w-3/4 bg-stone-200 rounded-lg" />

      {/* Meta */}
      <div className="flex gap-4">
        <div className="h-4 w-24 bg-stone-200 rounded" />
        <div className="h-4 w-32 bg-stone-200 rounded" />
      </div>

      {/* Thumbnail */}
      <div className="h-64 w-full bg-stone-200 rounded-2xl" />

      {/* Content */}
      <div className="space-y-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-4 bg-stone-200 rounded" style={{ width: `${65 + Math.random() * 35}%` }} />
        ))}
      </div>
    </div>
  );
}
