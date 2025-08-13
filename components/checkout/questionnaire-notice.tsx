"use client"

import { useCart } from "@/contexts/cart-context"
import { AlertCircle, CheckCircle } from "lucide-react"

export function QuestionnaireNotice() {
  const { state: cartState } = useCart()
  
  // Check if any cart items require questionnaire
  const requiresQuestionnaire = cartState.items.some(item => item.requiresQuestionnaire === true)
  const questionnaireProducts = cartState.items.filter(item => item.requiresQuestionnaire === true)
  
  if (!requiresQuestionnaire) {
    return null
  }

  return (
    <div className="neomorphic-container p-4 mb-5">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-800 mb-2">
            Questionnaire Required
          </h3>
          <p className="text-xs text-neutral-600 mb-3">
            Some items in your cart require a medical questionnaire to ensure safe treatment:
          </p>
          <ul className="space-y-1 mb-3">
            {questionnaireProducts.map((item) => (
              <li key={item.id} className="flex items-center space-x-2 text-xs text-neutral-700">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>{item.productName}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500">
            During signup, you'll complete a brief medical questionnaire. Our licensed physicians will review your 
            responses to ensure the treatment is safe and appropriate for you.
          </p>
        </div>
      </div>
    </div>
  )
}