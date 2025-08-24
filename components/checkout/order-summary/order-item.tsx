import { CartItem } from './types'
import { formatPrice } from './calculations'

interface OrderItemProps {
  item: CartItem
  index: number
}

export function OrderItem({ item, index }: OrderItemProps) {
  return (
    <div className="flex items-start space-x-4">
      {/* Product Image */}
      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <img 
          src={item.image || "/placeholder.svg"} 
          alt={item.productName || `Product ${item.product_id.slice(-8)}`} 
          className="w-8 h-8 object-contain" 
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-neutral-800 text-sm leading-tight mb-1">
          {item.productName || `Product ${item.product_id.slice(-8).toUpperCase()}`}
        </h3>
        
        {item.variantName && (
          <p className="text-sm text-neutral-600 mb-1">{item.variantName}</p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <span>Qty: {item.quantity}</span>
          
          {item.consultationRequired && (
            <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
              Requires consultation
            </span>
          )}
        </div>

        {item.months && item.months > 1 && item.monthlyPrice && (
          <p className="text-xs text-neutral-500 mt-1">
            {formatPrice(item.monthlyPrice)}/month × {item.months} months
          </p>
        )}
      </div>

      {/* Price (without consultation fee) */}
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-neutral-800 text-sm">
          {formatPrice(item.price * item.quantity)}
        </div>
      </div>
    </div>
  )
}