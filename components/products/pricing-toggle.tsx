"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

interface PricingToggleProps {
  isSubscription: boolean
  setIsSubscription: (value: boolean) => void
  pricing: {
    oneTime: { price: number; originalPrice: number }
    subscription: { price: number; originalPrice: number; savings: number }
  }
  accentColor?: "blue" | "emerald"
}

export default function PricingToggle({
  isSubscription,
  setIsSubscription,
  pricing,
  accentColor = "blue",
}: PricingToggleProps) {
  const currentPricing = isSubscription ? pricing.subscription : pricing.oneTime
  const accentClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  }

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="p-4">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${!isSubscription ? "text-gray-900" : "text-gray-500"}`}>
              One-time
            </span>
            <Switch
              checked={isSubscription}
              onCheckedChange={setIsSubscription}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm font-medium ${isSubscription ? "text-gray-900" : "text-gray-500"}`}>
              Subscription
            </span>
          </div>
          {isSubscription && (
            <Badge className={`${accentClasses[accentColor]} text-xs`}>Save {pricing.subscription.savings}%</Badge>
          )}
        </div>

        {/* Pricing Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold text-gray-900">£{currentPricing.price}</span>
          <span className="text-sm lg:text-base text-gray-500 line-through">£{currentPricing.originalPrice}</span>
          {isSubscription && <span className="text-xs text-gray-600">/month</span>}
        </div>

        {isSubscription && (
          <p className="text-xs text-gray-600 mt-2">Cancel anytime • Free shipping • Priority support</p>
        )}
      </CardContent>
    </Card>
  )
}
