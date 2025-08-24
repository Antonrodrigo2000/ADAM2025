'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CheckoutSession {
  id: string
  session_token: string
  status: 'active' | 'completed' | 'expired' | 'cancelled'
  current_step: 'information' | 'payment' | 'processing' | 'complete'
  cart_items: Array<{
    product_id: string
    quantity: number
    price: number
    productName?: string
    variantName?: string
    image?: string
    monthlyPrice?: number
    months?: number
    consultationRequired?: boolean
    consultationFee?: number
  }>
  cart_total: number
  customer_info?: any
  shipping_address?: any
  billing_address?: any
  selected_payment_method_id?: string
  user_id?: string
  expires_at: string
  created_at: string
  updated_at: string
}

interface CheckoutSessionContextType {
  session: CheckoutSession | null
  updateSession: (updates: Partial<CheckoutSession>) => Promise<void>
  progressToStep: (step: string) => Promise<void>
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CheckoutSessionContext = createContext<CheckoutSessionContextType | null>(null)

export function CheckoutSessionProvider({ 
  children, 
  sessionToken 
}: { 
  children: React.ReactNode
  sessionToken: string 
}) {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load session on mount and when token changes
  useEffect(() => {
    if (sessionToken) {
      loadSession()
    }
  }, [sessionToken])
  
  const loadSession = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/checkout/${sessionToken}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load session')
      }
      
      setSession(data.session)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load checkout session'
      setError(errorMessage)
      console.error('Failed to load session:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateSession = async (updates: Partial<CheckoutSession>) => {
    if (!session) return
    
    try {
      setError(null)
      
      const response = await fetch(`/api/checkout/${sessionToken}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update session')
      }
      
      setSession(data.session)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update session'
      setError(errorMessage)
      console.error('Failed to update session:', err)
    }
  }
  
  const progressToStep = async (step: string) => {
    await updateSession({ current_step: step as any })
    // Navigation will be handled by the component calling this
  }
  
  const refresh = async () => {
    await loadSession()
  }
  
  return (
    <CheckoutSessionContext.Provider value={{
      session,
      updateSession,
      progressToStep,
      isLoading,
      error,
      refresh
    }}>
      {children}
    </CheckoutSessionContext.Provider>
  )
}

export function useCheckoutSession() {
  const context = useContext(CheckoutSessionContext)
  if (!context) {
    throw new Error('useCheckoutSession must be used within CheckoutSessionProvider')
  }
  return context
}