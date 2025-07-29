export function CategorySkeleton() {
  return (
    <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
      <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6" />
      <div className="h-8 bg-gray-200 rounded mb-3 w-3/4" />
      <div className="space-y-2 mb-6">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-4 bg-gray-200 rounded w-12 mb-1" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-12 bg-gray-200 rounded-xl" />
    </div>
  )
}
