"use client"

export function CompletionLoading() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-6"></div>
        <div className="h-6 bg-neutral-200 rounded w-48 mx-auto mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-64 mx-auto mb-8"></div>
        <div className="h-20 bg-neutral-200 rounded w-full mb-6"></div>
        <div className="h-24 bg-neutral-200 rounded w-full mb-8"></div>
        <div className="flex gap-3">
          <div className="h-10 bg-neutral-200 rounded flex-1"></div>
          <div className="h-10 bg-neutral-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}