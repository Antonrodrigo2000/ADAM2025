'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AppState, AppActions, Notification } from './types'

// Initial state
const initialAppState: AppState = {
  theme: 'light',
  sidebarOpen: false,
  notifications: [],
  isOnline: true,
}

// Action types
type AppActionType =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; open: boolean }
  | { type: 'ADD_NOTIFICATION'; notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'REMOVE_NOTIFICATION'; id: string }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'SET_ONLINE_STATUS'; isOnline: boolean }
  | { type: 'LOAD_APP_STATE'; appState: Partial<AppState> }

// Reducer
function appReducer(state: AppState, action: AppActionType): AppState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      }

    case 'SET_THEME':
      return {
        ...state,
        theme: action.theme,
      }

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }

    case 'SET_SIDEBAR':
      return {
        ...state,
        sidebarOpen: action.open,
      }

    case 'ADD_NOTIFICATION': {
      const newNotification: Notification = {
        ...action.notification,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        isRead: false,
      }
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      }
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
      }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, isRead: true } : n
        ),
      }

    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.isOnline,
      }

    case 'LOAD_APP_STATE':
      return {
        ...state,
        ...action.appState,
      }

    default:
      return state
  }
}

// Context
interface AppContextType {
  state: AppState
  actions: AppActions
}

const AppContext = createContext<AppContextType | null>(null)

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  // Load app state from localStorage on mount
  useEffect(() => {
    const savedAppState = localStorage.getItem('app-state')
    if (savedAppState) {
      try {
        const appState = JSON.parse(savedAppState)
        dispatch({ type: 'LOAD_APP_STATE', appState })
      } catch (error) {
        console.error('Failed to load app state from localStorage:', error)
      }
    }
  }, [])

  // Save app state to localStorage whenever it changes (excluding notifications)
  useEffect(() => {
    const { notifications, ...persistentState } = state
    localStorage.setItem('app-state', JSON.stringify(persistentState))
  }, [state.theme, state.sidebarOpen])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', isOnline: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', isOnline: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Set initial status
    dispatch({ type: 'SET_ONLINE_STATUS', isOnline: navigator.onLine })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(state.theme)
  }, [state.theme])

  // Actions
  const actions: AppActions = {
    toggleTheme: () => {
      dispatch({ type: 'TOGGLE_THEME' })
    },

    toggleSidebar: () => {
      dispatch({ type: 'TOGGLE_SIDEBAR' })
    },

    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      dispatch({ type: 'ADD_NOTIFICATION', notification })

      // Auto-remove success notifications after 5 seconds
      if (notification.type === 'success') {
        setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', id: notification.title + notification.message })
        }, 5000)
      }
    },

    removeNotification: (id: string) => {
      dispatch({ type: 'REMOVE_NOTIFICATION', id })
    },

    markNotificationRead: (id: string) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', id })
    },

    setOnlineStatus: (isOnline: boolean) => {
      dispatch({ type: 'SET_ONLINE_STATUS', isOnline })
    },
  }

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
