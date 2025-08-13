import { CheckoutSessionProvider } from '@/contexts/checkout-session-context'
import { Header } from '@/components/layout/header'
import { Suspense } from 'react'

interface CheckoutLayoutProps {
  children: React.ReactNode
  params: Promise<{ sessionId: string }>
}

export default async function CheckoutLayout({ children, params }: CheckoutLayoutProps) {
  const { sessionId } = await params

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <Header variant="light" />
      
      {/* Main Content */}
      <div className="container mx-auto px-3 py-5 pt-24">
        <CheckoutSessionProvider sessionToken={sessionId}>
          <Suspense fallback={<CheckoutLoadingSkeleton />}>
            {children}
          </Suspense>
        </CheckoutSessionProvider>
      </div>
    </div>
  )
}

function CheckoutLoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      {/* Left side skeleton */}
      <div className="lg:col-span-2 space-y-5">
        <div className="neomorphic-container p-4 md:p-5">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
        
        <div className="neomorphic-container p-4 md:p-5">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-neutral-200 rounded w-full"></div>
              <div className="h-10 bg-neutral-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side skeleton */}
      <div className="lg:col-span-1">
        <div className="neomorphic-container p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}