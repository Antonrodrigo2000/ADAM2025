import type { CartItem } from '@/contexts/types'

export interface CartValidationResult {
  isValid: boolean
  conflictingVertical?: string
  currentVertical?: string
  message?: string
}

export function validateHealthVerticalCompatibility(
  cartItems: CartItem[],
  newItem: {
    consultationRequired: boolean
    health_vertical_slug?: string
  }
): CartValidationResult {
  // If new item doesn't require consultation, it's always compatible
  if (!newItem.consultationRequired) {
    return { isValid: true }
  }

  // Find existing consultation-required items in cart
  const existingConsultationItems = cartItems.filter(item => item.consultationRequired)
  
  // If no existing consultation items, new item is compatible
  if (existingConsultationItems.length === 0) {
    return { isValid: true }
  }

  // Get the health vertical of existing consultation items
  const existingVertical = existingConsultationItems[0].health_vertical_slug
  const newVertical = newItem.health_vertical_slug

  // If same vertical or either is undefined, it's compatible
  if (existingVertical === newVertical || !existingVertical || !newVertical) {
    return { isValid: true }
  }

  // Different health verticals - not compatible
  return {
    isValid: false,
    currentVertical: existingVertical,
    conflictingVertical: newVertical,
    message: `Your cart contains consultation products from ${formatVerticalName(existingVertical)}. Products requiring consultation from different health areas must be ordered separately.`
  }
}

function formatVerticalName(slug: string): string {
  switch (slug) {
    case 'hair-loss': return 'Hair Loss'
    case 'sexual-health': return 'Sexual Health'
    case 'erectile-dysfunction': return 'Sexual Health'
    case 'premature-ejaculation': return 'Sexual Health'
    default: return slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}