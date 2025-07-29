export default function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
        <div className="h-4 bg-gray-200 rounded w-4"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-4"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16">
        {/* Left Column - Images */}
        <div className="lg:col-span-3">
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          {/* Trust badges skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="lg:col-span-2">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>

          {/* Price section */}
          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3 mb-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 mb-6">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Delivery info */}
          <div className="h-16 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-gray-100 rounded-lg p-6 mb-16">
        <div className="flex space-x-8 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-20"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
