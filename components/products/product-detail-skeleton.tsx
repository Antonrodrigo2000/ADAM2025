export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-1"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-1"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-3">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-2">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-12 bg-gray-200 rounded-lg mb-3"></div>
          <div className="h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="h-96 bg-gray-200 rounded-lg mb-16"></div>

      {/* FAQ Skeleton */}
      <div className="h-64 bg-gray-200 rounded-lg mb-16"></div>

      {/* Related Products Skeleton */}
      <div className="h-80 bg-gray-200 rounded-lg"></div>
    </div>
  )
}
