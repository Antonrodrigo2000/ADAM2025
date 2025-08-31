'use client'

import { useCheckoutSession } from '@/contexts/checkout-session-context'
import { AddressPaymentView } from '@/components/checkout/address-payment-view'
import { CheckoutProgressIndicator } from '@/components/checkout/checkout-progress-indicator'
import { SessionOrderSummary } from '@/components/checkout/session-order-summary'
import { ConsultationPaymentWarning } from '@/components/checkout/consultation-payment-warning'
import { ConsentWarning } from '@/components/checkout/consent-warning'
import { AdhocPricingTable } from '@/components/checkout/adhoc-pricing-table'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PaymentPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { session, progressToStep, isLoading, error, refresh } = useCheckoutSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [showCardAddedMessage, setShowCardAddedMessage] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<any>(null)
  const [consentValid, setConsentValid] = useState(true)

  // Extract sessionId from params
  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  // Check if user just returned from adding a card
  useEffect(() => {
    const cardAdded = searchParams.get('cardAdded')
    if (cardAdded === 'true') {
      setShowCardAddedMessage(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowCardAddedMessage(false), 5000)

      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('cardAdded')
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])


  // Refresh session only if really needed (fallback for edge cases)
  useEffect(() => {
    if (sessionId && session && !isLoading) {
      // Only refresh if session seems stale AND we've been on this page for a bit
      // This avoids immediate refresh conflicts with navigation from information page
      if (session.current_step === 'payment' && !session.user_id) {
        const timeoutId = setTimeout(() => {
          console.log('Fallback: Refreshing session to get latest user data...')
          refresh()
        }, 500) // Longer delay to avoid conflicts

        return () => clearTimeout(timeoutId)
      }
    }
  }, [sessionId, session, isLoading, refresh])

  // Load customer information from database if session has user but no customer_info
  useEffect(() => {
    const loadCustomerInfo = async () => {
      // Don't run if session is still loading
      if (isLoading) {
        console.log('Skipping customer info load: session still loading')
        return
      }

      console.log('useEffect triggered:', {
        hasUserId: !!session?.user_id,
        hasCustomerInfo: !!customerInfo,
        hasSessionCustomerInfo: !!session?.customer_info,
        userId: session?.user_id,
        isLoading
      })

      // Check if we have meaningful customer info (not just empty object)
      const hasSessionCustomerInfo = session?.customer_info &&
        Object.keys(session.customer_info).length > 0 &&
        session.customer_info.first_name

      if (!session?.user_id || customerInfo || hasSessionCustomerInfo) {
        console.log('Skipping customer info load:', {
          reason: !session?.user_id ? 'no user_id' :
            customerInfo ? 'already have customerInfo' :
              'already have valid session.customer_info'
        })
        return
      }

      try {
        console.log('Loading customer info from database for user:', session.user_id)

        const supabase = createClient()
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, phone')
          .eq('id', session.user_id)
          .single()

        console.log('Database query result:', { profile, profileError })

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
        } else if (profile) {
          console.log('Setting customer info from DB:', profile)

          // Get email from auth user if available
          const { data: authUser } = await supabase.auth.getUser()

          setCustomerInfo({
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: authUser?.user?.email || '', // Get email from auth
            phone: profile.phone
          })
        }
      } catch (error) {
        console.error('Error loading customer info:', error)
      }
    }

    // Add a small delay to ensure session is fully loaded
    const timeoutId = setTimeout(loadCustomerInfo, 300)
    return () => clearTimeout(timeoutId)
  }, [session?.user_id, customerInfo, session, isLoading])

  // Redirect to information step if user is not set in session
  useEffect(() => {
    if (session && !session.user_id && sessionId) {
      router.replace(`/checkout/${sessionId}/information`)
    }
  }, [session, sessionId, router])

  // Check if any items require consultation
  const hasConsultationItems = session?.cart_items.some(item => item.consultationRequired) || false
  
  // Check if any items have adhoc pricing
  const hasAdhocItems = session?.cart_items.some(item => 
    (item as any).product_type === 'consultation_adhoc' || (item as any).is_adhoc_quantity
  ) || false

  const handlePayNow = async (addressId?: string, paymentMethodId?: string) => {
    if (!session) return

    // Check consent validation before proceeding
    if (!consentValid) {
      alert('Please confirm all required consents before proceeding.')
      return
    }

    setIsProcessing(true)
    try {
      // Immediately navigate to processing page for better UX
      const processingUrl = `/checkout/${sessionId}/processing`
      router.push(processingUrl)

      // Update session to processing step (in background)
      await progressToStep('processing')

      // Call payment API (in background)
      const response = await fetch('/api/checkout/address-payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.session_token,
          addressId,
          paymentMethodId,
          cartItems: session.cart_items,
          cartTotal: session.cart_total,
          consents: {
            normalProductsConsent: true, // We validate this is true before allowing payment
            consultationConsent: session.cart_items.some(item => item.consultationRequired),
            adhocPricingConsent: false // Will be true when we have adhoc products
          }
        }),
      })

      const result = await response.json()

      if (result.success && result.redirect_url) {
        // Payment API succeeded - update the processing page URL with proper query params
        router.replace(result.redirect_url)
      } else if (!result.success) {
        // If payment fails, redirect back to payment page with error
        router.push(`/checkout/${sessionId}/payment?error=${encodeURIComponent(result.error || 'Payment failed')}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      // Show error to user - could add toast notification here
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return <PaymentLoadingSkeleton />
  }

  if (error || !session) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Session Error</h2>
          <p className="text-neutral-600 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/cart')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
          >
            Return to Cart
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      {/* Left side - Address & Payment */}
      <div className="lg:col-span-2 space-y-5">
        <CheckoutProgressIndicator
          currentStep="payment"
          isAuthenticated={!!session.user_id}
        />

        {/* Card Added Success Message */}
        {showCardAddedMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Payment method added successfully!</p>
                <p className="text-xs text-green-600">Your new card is now available for checkout.</p>
              </div>
            </div>
          </div>
        )}

        {/* Consultation Payment Warning */}
        <ConsultationPaymentWarning hasConsultationItems={hasConsultationItems} />

        {/* Adhoc Pricing Table */}
        <AdhocPricingTable hasAdhocProducts={hasAdhocItems} />

        {/* Customer Info Summary (from information step or database) */}
        {(customerInfo || (session.customer_info && session.customer_info.first_name)) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Customer Information</h3>
            <div className="text-sm text-neutral-600 space-y-1">
              <p className="font-medium">
                {(customerInfo || session.customer_info).first_name} {(customerInfo || session.customer_info).last_name}
              </p>
              <p>{(customerInfo || session.customer_info).email}</p>
              {(customerInfo || session.customer_info).phone && (
                <p>{(customerInfo || session.customer_info).phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Address & Payment Form */}
        <AddressPaymentView
          user={session.user_id ? {
            id: session.user_id,
            email: (customerInfo || session.customer_info)?.email || '',
            firstName: (customerInfo || session.customer_info)?.first_name,
            lastName: (customerInfo || session.customer_info)?.last_name,
            profile: (customerInfo || (session.customer_info && session.customer_info.first_name)) ? {
              id: session.user_id,
              firstName: (customerInfo || session.customer_info).first_name,
              lastName: (customerInfo || session.customer_info).last_name,
              phone: (customerInfo || session.customer_info).phone,
              verificationStatus: 'pending' as const,
              accountStatus: 'active' as const,
              agreedToTerms: true,
              agreedToMarketing: false,
              marketingPreferences: {
                email: false,
                sms: false,
                push: false
              },
              privacyPreferences: {},
              emailVerified: false,
              phoneVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } : undefined
          } : null}
          cartItems={session.cart_items}
          sessionId={sessionId}
          onPayNow={handlePayNow}
          isProcessing={isProcessing}
          consentComponent={
            <ConsentWarning 
              cartItems={session.cart_items.map(item => ({
                id: item.product_id,
                productId: item.product_id,
                variantId: item.product_id,
                productName: item.productName || '',
                variantName: item.productName || '',
                price: item.price,
                quantity: item.quantity,
                months: 1,
                monthlyPrice: item.price,
                totalPrice: item.price * item.quantity,
                consultationFee: item.consultationFee || 0,
                consultationRequired: item.consultationRequired || false,
                product_type: (item as any).product_type || 'normal',
                is_adhoc_quantity: (item as any).is_adhoc_quantity || false
              }))}
              onConsentChange={setConsentValid}
            />
          }
        />
      </div>

      {/* Right side - Order Summary */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-5">
          <SessionOrderSummary session={session} />
        </div>
      </div>
    </div>
  )
}


function PaymentLoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="animate-pulse h-16 bg-neutral-200 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-32 bg-neutral-200 rounded w-full"></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}