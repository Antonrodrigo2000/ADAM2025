"use client"

import { useCart } from "@/contexts/cart-context"
import { CheckCircle, User } from "lucide-react"
import type { User as UserType } from "@/contexts/types"

interface AuthenticatedUserNoticeProps {
  user: UserType | null
}

export function AuthenticatedUserNotice({ user }: AuthenticatedUserNoticeProps) {
  const { state: cartState } = useCart()
  
  const requiresQuestionnaire = cartState.items.some(item => item.requiresQuestionnaire === true)
  
  if (!user) {
    return null
  }

  return (
    <div className="neomorphic-container p-4 mb-5">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">
            Welcome back, {user.firstName || 'valued customer'}!
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-neutral-700">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Account verified</span>
            </div>
            {requiresQuestionnaire && (
              <div className="flex items-center space-x-2 text-xs text-neutral-700">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Medical questionnaire will be processed for prescription items</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs text-neutral-700">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Ready to complete your order</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}