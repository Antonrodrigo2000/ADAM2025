import { OrderCalculation } from './types'
import { formatPrice } from './calculations'

interface SummaryBreakdownProps {
  calculation: OrderCalculation
}

export function SummaryBreakdown({ calculation }: SummaryBreakdownProps) {
  return (
    <div className="space-y-3 border-t border-gray-200 pt-4">
      {/* Subtotal */}
      <div className="flex justify-between text-sm text-neutral-700">
        <span>Subtotal</span>
        <span>{formatPrice(calculation.subtotal)}</span>
      </div>

      {/* Consultation Fee - Only show if there are consultation items */}
      {calculation.hasConsultationItems && (
        <div className="flex justify-between text-sm text-neutral-700">
          <div className="flex flex-col">
            <span>Consultation fee</span>
            <span className="text-xs text-neutral-500">One-time fee for prescription items</span>
          </div>
          <span>{formatPrice(calculation.consultationFee)}</span>
        </div>
      )}

      {/* Delivery Fee */}
      <div className="flex justify-between text-sm text-neutral-700">
        <span>Delivery</span>
        <span className={calculation.deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
          {calculation.deliveryFee === 0 ? "Free" : formatPrice(calculation.deliveryFee)}
        </span>
      </div>

      {/* Total */}
      <div className="flex justify-between text-lg font-semibold text-neutral-800 pt-3 border-t border-gray-200">
        <span>Total</span>
        <span>{formatPrice(calculation.total)}</span>
      </div>
    </div>
  )
}