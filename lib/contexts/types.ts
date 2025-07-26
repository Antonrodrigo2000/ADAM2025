// Quiz State Types
export interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, any>
  questionFlow: string[]
  isReviewMode: boolean
  isCompleted: boolean
  recommendations: any | null
  sessionId: string
  startedAt: Date | null
  completedAt: Date | null
}

export interface QuizActions {
  setAnswer: (questionId: string, value: any) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  enterReviewMode: () => void
  exitReviewMode: () => void
  submitQuiz: () => void
  resetQuiz: () => void
  loadSavedQuiz: () => void
}

// Cart State Types
export interface CartItem {
  id: string
  productId: string
  variantId: string
  productName: string
  variantName: string
  price: number
  originalPrice?: number
  quantity: number
  subscription?: {
    frequency: string
    isActive: boolean
  }
  selectedOptions?: Record<string, string>
  image?: string
}

export interface CartState {
  items: CartItem[]
  subtotal: number
  discount: number
  discountCode?: string
  tax: number
  shipping: number
  total: number
  isLoading: boolean
}

export interface CartActions {
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateItem: (itemId: string, updates: Partial<CartItem>) => void
  applyDiscount: (code: string) => Promise<boolean>
  removeDiscount: () => void
  clearCart: () => void
  calculateTotals: () => void
}

// Auth State Types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  profile?: UserProfile
}

export interface UserProfile {
  dateOfBirth?: string
  phone?: string
  address?: Address
}

export interface Address {
  street: string
  city: string
  postcode: string
  country: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: any) => Promise<void>
  signOut: () => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

// App State Types
export interface AppState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
  isOnline: boolean
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
}

export interface AppActions {
  toggleTheme: () => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void
  removeNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  setOnlineStatus: (isOnline: boolean) => void
}