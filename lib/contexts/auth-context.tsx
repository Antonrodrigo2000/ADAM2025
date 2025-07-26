'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AuthState, AuthActions, User, UserProfile } from './types'

// Initial state
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
type AuthActionType =
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; user: User }
  | { type: 'SIGN_IN_ERROR'; error: string }
  | { type: 'SIGN_UP_START' }
  | { type: 'SIGN_UP_SUCCESS'; user: User }
  | { type: 'SIGN_UP_ERROR'; error: string }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_PROFILE_START' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; profile: UserProfile }
  | { type: 'UPDATE_PROFILE_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_USER'; user: User }

// Reducer
function authReducer(state: AuthState, action: AuthActionType): AuthState {
  switch (action.type) {
    case 'SIGN_IN_START':
    case 'SIGN_UP_START':
    case 'UPDATE_PROFILE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case 'SIGN_IN_SUCCESS':
    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }

    case 'SIGN_IN_ERROR':
    case 'SIGN_UP_ERROR':
    case 'UPDATE_PROFILE_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }

    case 'SIGN_OUT':
      return {
        ...initialAuthState,
        isLoading: false,
      }

    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: state.user ? { ...state.user, profile: action.profile } : null,
        isLoading: false,
        error: null,
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      }

    case 'LOAD_USER':
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
      }

    default:
      return state
  }
}

// Context
interface AuthContextType {
  state: AuthState
  actions: AuthActions
}

const AuthContext = createContext<AuthContextType | null>(null)

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState)

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = localStorage.getItem('auth-user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          dispatch({ type: 'LOAD_USER', user })
        } else {
          dispatch({ type: 'SET_LOADING', loading: false })
        }
      } catch (error) {
        console.error('Failed to load user session:', error)
        dispatch({ type: 'SET_LOADING', loading: false })
      }
    }

    checkExistingSession()
  }, [])

  // Save user to localStorage when authenticated
  useEffect(() => {
    if (state.user && state.isAuthenticated) {
      localStorage.setItem('auth-user', JSON.stringify(state.user))
    } else {
      localStorage.removeItem('auth-user')
    }
  }, [state.user, state.isAuthenticated])

  // Actions
  const actions: AuthActions = {
    signIn: async (email: string, password: string) => {
      dispatch({ type: 'SIGN_IN_START' })
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock authentication - replace with real API call
        if (email === 'test@example.com' && password === 'password') {
          const user: User = {
            id: '1',
            email: email,
            firstName: 'Test',
            lastName: 'User',
          }
          dispatch({ type: 'SIGN_IN_SUCCESS', user })
        } else {
          throw new Error('Invalid email or password')
        }
      } catch (error) {
        dispatch({ type: 'SIGN_IN_ERROR', error: error instanceof Error ? error.message : 'Sign in failed' })
      }
    },

    signUp: async (userData: any) => {
      dispatch({ type: 'SIGN_UP_START' })
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock user creation - replace with real API call
        const user: User = {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }
        
        dispatch({ type: 'SIGN_UP_SUCCESS', user })
      } catch (error) {
        dispatch({ type: 'SIGN_UP_ERROR', error: error instanceof Error ? error.message : 'Sign up failed' })
      }
    },

    signOut: () => {
      dispatch({ type: 'SIGN_OUT' })
      localStorage.removeItem('auth-user')
    },

    updateProfile: async (profile: Partial<UserProfile>) => {
      dispatch({ type: 'UPDATE_PROFILE_START' })
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock profile update - replace with real API call
        const updatedProfile = { ...state.user?.profile, ...profile }
        dispatch({ type: 'UPDATE_PROFILE_SUCCESS', profile: updatedProfile })
      } catch (error) {
        dispatch({ type: 'UPDATE_PROFILE_ERROR', error: error instanceof Error ? error.message : 'Profile update failed' })
      }
    },

    clearError: () => {
      dispatch({ type: 'CLEAR_ERROR' })
    },
  }

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}