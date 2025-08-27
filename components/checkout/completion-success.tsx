"use client"

import { CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/components/checkout/order-summary/calculations"

interface CartItem {
  product_id: string
  quantity: number
  price: number
  productName?: string
  variantName?: string
  image?: string
  monthlyPrice?: number
  months?: number
  consultationRequired?: boolean
  consultationFee?: number
}

interface CompletionSuccessProps {
  sessionToken: string
  cartItems: CartItem[]
  cartTotal: number
  onDashboard: () => void
  onContinueShopping: () => void
}

export function CompletionSuccess({ sessionToken, cartItems, cartTotal, onDashboard, onContinueShopping }: CompletionSuccessProps) {
  // Determine if this is a consultation flow based on cart items
  const isConsultationFlow = cartItems.some(item => item.consultationRequired)

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-800 mb-3">
            Payment successful!
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 max-w-md mx-auto leading-relaxed">
            {isConsultationFlow 
              ? "Your consultation payment has been processed. Our medical team will review your order."
              : "Your payment has been processed successfully. Your order is now being prepared."}
          </p>
        </div>

        {/* Order Reference */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <div className="text-center">
            <p className="text-xs text-green-600 mb-1">Order Reference</p>
            <p className="text-sm font-medium text-green-800">#{sessionToken.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        {/* Cart Summary */}
        {cartItems && cartItems.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-left">
            <h4 className="font-medium text-gray-800 mb-3">Order Summary</h4>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.productName || item.product_id}</div>
                    {item.variantName && <div className="text-gray-500 text-xs">{item.variantName}</div>}
                    <div className="text-gray-500 text-xs">Quantity: {item.quantity}</div>
                  </div>
                  <div className="font-medium whitespace-nowrap min-w-[80px] text-right">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps - Conditional based on flow type */}
        {isConsultationFlow ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <h4 className="font-medium text-blue-800 mb-3 text-center sm:text-left">What happens next?</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You'll receive a consultation confirmation email</p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Our medical team will review your questionnaire</p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Once approved, you'll be charged for the products</p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Track your order status in your dashboard</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-left">
            <h4 className="font-medium text-green-800 mb-3 text-center sm:text-left">What happens next?</h4>
            <div className="text-sm text-green-700 space-y-2">
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>You'll receive an order confirmation email</p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Your order will be processed and shipped</p>
              </div>
              <div className="flex items-start">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p>Track your delivery status in your dashboard</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onDashboard}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button
            onClick={onContinueShopping}
            variant="outline"
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Need help?{' '}
            <a href="mailto:support@adam.lk" className="text-orange-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}