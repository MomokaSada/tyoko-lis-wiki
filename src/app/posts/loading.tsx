export default function PostsLoading() {
  return (
    <div className="max-w-[72rem] mx-auto px-4 sm:px-6 py-8 md:py-10 space-y-6 animate-pulse">
      {/* Search / filter bar */}
      <div className="h-12 bg-stone-200 rounded-xl" />

      {/* Post list */}
      <div className="space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-stone-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
