'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { CartState, CartActions, CartItem, CheckoutData } from './types'

// Initial state
const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  discountCode: undefined,
  tax: 0,
  shipping: 0,
  total: 0,
  isLoading: false,
}

// Action types
type CartActionType =
  | { type: 'ADD_ITEM'; item: Omit<CartItem, 'id'> }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'UPDATE_ITEM'; itemId: string; updates: Partial<CartItem> }
  | { type: 'APPLY_DISCOUNT'; code: string; amount: number }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' }
  | { type: 'CALCULATE_TOTALS' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_CART'; cartData: CartState }

// Reducer
function cartReducer(state: CartState, action: CartActionType): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.productId === action.item.productId && 
                item.variantId === action.item.variantId &&
                item.months === action.item.months
      )

      let newItems: CartItem[]
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { 
                ...item, 
                quantity: item.quantity + action.item.quantity,
                totalPrice: (item.quantity + action.item.quantity) * item.months * item.monthlyPrice
              }
            : item
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          ...action.item,
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          totalPrice: action.item.quantity * action.item.months * action.item.monthlyPrice
        }
        newItems = [...state.items, newItem]
      }

      return { ...state, items: newItems }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.itemId),
      }

    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.itemId),
        }
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.itemId
            ? { 
                ...item, 
                quantity: action.quantity,
                totalPrice: action.quantity * item.months * item.monthlyPrice
              }
            : item
        ),
      }

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.itemId
            ? { ...item, ...action.updates }
            : item
        ),
      }

    case 'APPLY_DISCOUNT':
      return {
        ...state,
        discountCode: action.code,
        discount: action.amount,
      }

    case 'REMOVE_DISCOUNT':
      return {
        ...state,
        discountCode: undefined,
        discount: 0,
      }

    case 'CLEAR_CART':
      return {
        ...initialCartState,
      }

    case 'CALCULATE_TOTALS': {
      const subtotal = state.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const consultationFees = state.items.reduce((sum, item) => {
        return sum + (item.prescriptionRequired ? item.consultationFee : 0)
      }, 0)
      const tax = 0 // No tax
      const shipping = 400 // Fixed delivery fee of LKR 400
      const total = subtotal + consultationFees + shipping - state.discount

      return {
        ...state,
        subtotal: subtotal + consultationFees,
        tax,
        shipping,
        total: Math.max(0, total), // Ensure total is never negative
      }
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      }

    case 'LOAD_CART':
      return action.cartData

    default:
      return state
  }
}

// Context
interface CartContextType {
  state: CartState
  actions: CartActions
}

const CartContext = createContext<CartContextType | null>(null)

// Provider
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('adam-cart-state')
    
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        
        // Validate cart data structure
        if (cartData && Array.isArray(cartData.items)) {
          dispatch({ type: 'LOAD_CART', cartData })
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
        localStorage.removeItem('adam-cart-state')
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('adam-cart-state', JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }, 100) // Debounce to avoid excessive writes

    return () => clearTimeout(timeoutId)
  }, [state])

  // Recalculate totals whenever items, discount, or shipping changes
  useEffect(() => {
    dispatch({ type: 'CALCULATE_TOTALS' })
  }, [state.items, state.discount])

  // Actions
  const actions: CartActions = {
    addItem: (item: Omit<CartItem, 'id'>) => {
      dispatch({ type: 'ADD_ITEM', item })
    },

    removeItem: (itemId: string) => {
      dispatch({ type: 'REMOVE_ITEM', itemId })
    },

    updateQuantity: (itemId: string, quantity: number) => {
      dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity })
    },

    updateItem: (itemId: string, updates: Partial<CartItem>) => {
      dispatch({ type: 'UPDATE_ITEM', itemId, updates })
    },

    applyDiscount: async (code: string): Promise<boolean> => {
      dispatch({ type: 'SET_LOADING', loading: true })
      
      try {
        // Simulate API call to validate discount code
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock discount logic - replace with real API call
        const discountAmount = code === 'SAVE10' ? state.subtotal * 0.1 : 
                              code === 'SAVE20' ? state.subtotal * 0.2 : 0
        
        if (discountAmount > 0) {
          dispatch({ type: 'APPLY_DISCOUNT', code, amount: discountAmount })
          return true
        }
        return false
      } catch (error) {
        console.error('Error applying discount:', error)
        return false
      } finally {
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    },

    removeDiscount: () => {
      dispatch({ type: 'REMOVE_DISCOUNT' })
    },

    clearCart: () => {
      dispatch({ type: 'CLEAR_CART' })
      localStorage.removeItem('adam-cart-state')
      localStorage.removeItem('adam-checkout-data')
    },

    calculateTotals: () => {
      dispatch({ type: 'CALCULATE_TOTALS' })
    },

    saveCheckoutData: (data: CheckoutData) => {
      try {
        localStorage.setItem('adam-checkout-data', JSON.stringify(data))
      } catch (error) {
        console.error('Failed to save checkout data:', error)
      }
    },

    getCheckoutData: (): CheckoutData | null => {
      try {
        const data = localStorage.getItem('adam-checkout-data')
        return data ? JSON.parse(data) : null
      } catch (error) {
        console.error('Failed to load checkout data:', error)
        return null
      }
    },

    clearCheckoutData: () => {
      localStorage.removeItem('adam-checkout-data')
    },
  }

  return (
    <CartContext.Provider value={{ state, actions }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}