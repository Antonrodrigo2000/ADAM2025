import { CartItem, OrderCalculation } from './types'

export const CONSULTATION_FEE = 1000
export const DELIVERY_FEE = 450 // Free delivery

export function calculateOrderTotals(items: CartItem[]): OrderCalculation {
  // Calculate base subtotal (product prices only, no consultation fees)
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity)
  }, 0)

  // Check if any items require consultation
  const hasConsultationItems = items.some(item => item.consultationRequired)
  
  // Single consultation fee if any items require it
  const consultationFee = hasConsultationItems ? CONSULTATION_FEE : 0
  
  // Fixed delivery fee (currently free)
  const deliveryFee = DELIVERY_FEE
  
  // Calculate total
  const total = subtotal + consultationFee + deliveryFee

  return {
    subtotal,
    consultationFee,
    deliveryFee,
    total,
    hasConsultationItems
  }
}

export function formatPrice(amount: number): string {
  return `LKR ${amount.toLocaleString()}`
}