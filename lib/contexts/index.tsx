'use client'

import React from 'react'
import { QuizProvider } from './quiz-context'
import { CartProvider } from './cart-context'
import { AuthProvider } from './auth-context'
import { AppProvider } from './app-context'

// Combined provider that wraps all contexts
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <CartProvider>
          <QuizProvider>
            {children}
          </QuizProvider>
        </CartProvider>
      </AuthProvider>
    </AppProvider>
  )
}

// Export all contexts and hooks
export { QuizProvider, useQuiz } from './quiz-context'
export { CartProvider, useCart } from './cart-context'
export { AuthProvider, useAuth } from './auth-context'
export { AppProvider, useApp } from './app-context'

// Export types
export * from './types'