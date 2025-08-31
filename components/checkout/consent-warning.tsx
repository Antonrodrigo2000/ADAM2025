'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CartItem } from '@/contexts/types'

interface ConsentWarningProps {
  cartItems: CartItem[]
  onConsentChange?: (isValid: boolean) => void
}

export function ConsentWarning({ cartItems, onConsentChange }: ConsentWarningProps) {
  const [consents, setConsents] = useState({
    normalProducts: false,
    consultationProducts: false,
    adhocProducts: false
  })

  // Analyze cart items - use existing consultationRequired field since product_type may not be available
  const hasNormalProducts = cartItems.length > 0 // Always show normal consent if there are any products
  const hasConsultationProducts = cartItems.some(item => 
    item.consultationRequired
  )
  const hasAdhocProducts = cartItems.some(item => 
    item.product_type === 'consultation_adhoc' || item.is_adhoc_quantity
  )

  const handleConsentChange = (type: keyof typeof consents, checked: boolean) => {
    const newConsents = { ...consents, [type]: checked }
    setConsents(newConsents)

    // Validate - all required consents must be checked
    const isValid = (!hasNormalProducts || newConsents.normalProducts) &&
                   (!hasConsultationProducts || newConsents.consultationProducts) &&
                   (!hasAdhocProducts || newConsents.adhocProducts)

    onConsentChange?.(isValid)
  }

  // Don't show if no items need consent
  if (!hasNormalProducts && !hasConsultationProducts && !hasAdhocProducts) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Normal Products Consent */}
      {hasNormalProducts && (
        <div className="flex items-start space-x-3">
          <Checkbox
            id="normal-consent"
            theme="light"
            checked={consents.normalProducts}
            onCheckedChange={(checked) => 
              handleConsentChange('normalProducts', checked as boolean)
            }
            error={hasNormalProducts && !consents.normalProducts}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="normal-consent" className="text-sm font-normal leading-normal" theme="light">
              I agree to purchase the products in my cart
            </Label>
            {hasNormalProducts && !consents.normalProducts && (
              <p className="text-xs text-red-600">Please confirm your purchase agreement</p>
            )}
          </div>
        </div>
      )}

      {/* Consultation Products Consent */}
      {hasConsultationProducts && (
        <div className="flex items-start space-x-3">
          <Checkbox
            id="consultation-consent"
            theme="light"
            checked={consents.consultationProducts}
            onCheckedChange={(checked) => 
              handleConsentChange('consultationProducts', checked as boolean)
            }
            error={hasConsultationProducts && !consents.consultationProducts}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="consultation-consent" className="text-sm font-normal leading-normal" theme="light">
              I agree to the consultation process and fees for prescription products
            </Label>
            {hasConsultationProducts && !consents.consultationProducts && (
              <p className="text-xs text-red-600">Please confirm your consultation agreement</p>
            )}
          </div>
        </div>
      )}

      {/* Adhoc Products Consent */}
      {hasAdhocProducts && (
        <div className="flex items-start space-x-3">
          <Checkbox
            id="adhoc-consent"
            theme="light"
            checked={consents.adhocProducts}
            onCheckedChange={(checked) => 
              handleConsentChange('adhocProducts', checked as boolean)
            }
            error={hasAdhocProducts && !consents.adhocProducts}
            className="mt-0.5"
          />
          <div className="space-y-1">
            <Label htmlFor="adhoc-consent" className="text-sm font-normal leading-normal" theme="light">
              I agree that the doctor will determine quantities and pricing for custom products
            </Label>
            {hasAdhocProducts && !consents.adhocProducts && (
              <p className="text-xs text-red-600">Please confirm your adhoc pricing agreement</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}