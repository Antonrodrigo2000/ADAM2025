'use client'

import { AlertTriangle, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'

interface ConsultationConflictModalProps {
  isOpen: boolean
  onClose: () => void
  currentVertical: string
  conflictingVertical: string
  productName: string
  onProceedWithClear?: () => void
}

export function ConsultationConflictModal({
  isOpen,
  onClose,
  currentVertical,
  conflictingVertical,
  productName,
  onProceedWithClear
}: ConsultationConflictModalProps) {
  const router = useRouter()
  const { actions } = useCart()

  const formatVerticalName = (slug: string): string => {
    switch (slug) {
      case 'hair-loss': return 'Hair Loss'
      case 'sexual-health': return 'Sexual Health'
      case 'erectile-dysfunction': return 'Sexual Health'
      case 'premature-ejaculation': return 'Sexual Health'
      default: return slug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const handleProceedToCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  const handleClearAndAdd = () => {
    actions.clearCart()
    onClose()
    if (onProceedWithClear) {
      onProceedWithClear()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Separate Consultation Required
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left space-y-3 text-gray-600">
            <p>
              Your cart currently contains consultation products from <strong>{formatVerticalName(currentVertical)}</strong>.
            </p>
            <p>
              <strong>{productName}</strong> requires consultation for <strong>{formatVerticalName(conflictingVertical)}</strong>.
            </p>
            <p>
              For your safety and privacy, products requiring consultation from different health areas must be ordered separately with their respective specialists.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          <Button 
            onClick={handleProceedToCheckout}
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Proceed to Checkout with Current Items
          </Button>
          
          <Button 
            onClick={handleClearAndAdd}
            variant="outline"
            className="w-full border-red-200 text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart & Add {productName}
          </Button>

          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Why separate orders?</strong> Different health areas require specialized consultations with appropriate medical professionals to ensure your safety and the best treatment outcomes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}