"use client"

import { useState } from "react"
import { Check, Plus, Info } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  subscription?: string
  image?: string
  deliveryInfo?: string
}

interface OrderData {
  items: OrderItem[]
  subtotal: number
  discount: number
  discountLabel?: string
  delivery: number
  deliveryLabel?: string
  total: number
}

export function PaymentPage() {
  const [sameAsDelivery, setSameAsDelivery] = useState(true)
  const [orderData] = useState<OrderData>({
    items: [
      {
        id: "hair-kit",
        name: "Hair Kit - Medicated Spray, Finasteride & Supplement",
        price: 120.0,
        deliveryInfo: "(Delivered as 3 kits every 3 months)",
        image: "/placeholder.svg?height=60&width=60&text=HK",
      },
      {
        id: "rosemary-oil",
        name: "Rosemary Oil",
        price: 21.0,
        originalPrice: 28.0,
        subscription: "Monthly",
        image: "/placeholder.svg?height=60&width=60&text=RO",
      },
    ],
    subtotal: 141.0,
    discount: 40.0,
    discountLabel: "Save 50% on your first order (max. £40)",
    delivery: 0,
    deliveryLabel: "Free",
    total: 101.0,
  })

  const removeItem = (itemId: string) => {
    // Handle item removal logic here
    console.log("Remove item:", itemId)
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="container mx-auto px-3 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">Order summary</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Left side - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery and Payment Details */}
            <div className="neomorphic-container p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-4">Delivery and payment details</h2>
              <p className="text-sm text-neutral-600 mb-6">
                Please make sure the delivery address and payment details below are correct before placing your order.
              </p>

              {/* Delivery Address Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                    1
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Delivery address</h3>
                </div>

                <div className="flex items-center mb-4">
                  <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-neutral-700">Ejf Traffic Ltd, 14 Temple Road, Norwich, NR31ED</span>
                </div>

                <button className="w-full neomorphic-input-wrapper h-12 flex items-center justify-center text-neutral-700 font-medium hover:bg-neutral-50 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  Use new address
                </button>
              </div>

              {/* Billing Address Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                    2
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800">Billing address</h3>
                </div>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(e) => setSameAsDelivery(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-2 border-neutral-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-neutral-700 font-medium">Same as delivery address</span>
                </label>
              </div>

              {/* Payment Method Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4">How would you like to pay?</h3>

                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add payment method
                </button>
              </div>

              {/* Payment Notice */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  You won't be charged until our clinical team have reviewed and confirmed your order.
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="neomorphic-container p-6">
                <h2 className="text-xl font-bold text-neutral-800 mb-6">Your order</h2>

                {/* Order Items */}
                <div className="space-y-6 mb-6">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-800 text-sm leading-tight mb-1">{item.name}</h3>
                        {item.deliveryInfo && <p className="text-xs text-neutral-600 mb-2">{item.deliveryInfo}</p>}
                        {item.subscription && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600">{item.subscription}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-neutral-500 hover:text-red-600 underline transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-neutral-800 text-lg">£{item.price.toFixed(2)}</div>
                        {item.originalPrice && (
                          <div className="text-sm text-neutral-500 line-through">£{item.originalPrice.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Money Back Guarantee */}
                <div className="bg-green-600 text-white p-4 rounded-xl mb-6 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm">See results in 180 days</div>
                      <div className="font-bold text-sm">or your money back!¹</div>
                    </div>
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mt-2 opacity-90">
                    ¹ Claim a full refund between 180-210 days from order approval if treatment is not effective at
                    stabilising or reversing hair loss. First time users only. Full T&Cs.
                  </p>
                </div>

                {/* Order Totals */}
                <div className="space-y-3 border-t border-neutral-200 pt-4">
                  <div className="flex justify-between text-neutral-700">
                    <span>Subtotal</span>
                    <span>£{orderData.subtotal.toFixed(2)}</span>
                  </div>

                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-neutral-700">
                      <div>
                        <div>Promo discount</div>
                        <button className="text-xs text-neutral-500 hover:text-neutral-700 underline">Remove</button>
                      </div>
                      <div className="text-right">
                        <div>-£{orderData.discount.toFixed(2)}</div>
                        <div className="text-xs text-neutral-500">{orderData.discountLabel}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-700">
                    <span>Delivery</span>
                    <span className="text-green-600 font-semibold">{orderData.deliveryLabel}</span>
                  </div>

                  <div className="flex justify-between text-xl font-bold text-neutral-800 pt-3 border-t border-neutral-200">
                    <span>Total</span>
                    <span>£{orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
