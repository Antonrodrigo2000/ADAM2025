// Quiz State Types
export interface QuizState {
  currentQuestionIndex: number
  answers: Record<string, any>
  questionFlow: string[]
  isReviewMode: boolean
  isCompleted: boolean
  recommendations: any | null // Support both legacy and new recommendation formats
  sessionId: string
  startedAt: Date | null
  completedAt: Date | null
  healthVertical: string // Add health vertical to state
}

export interface QuizActions {
  setAnswer: (questionId: string, value: any) => void
  nextQuestion: () => void
  previousQuestion: () => void
  goToQuestion: (index: number) => void
  enterReviewMode: () => void
  exitReviewMode: () => void
  submitQuiz: () => Promise<void>
  resetQuiz: () => Promise<void>
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
  months: number // Number of months supply
  monthlyPrice: number // Price per month
  totalPrice: number // Total price for the quantity * months
  consultationFee: number
  prescriptionRequired: boolean
  requiresQuestionnaire?: boolean // Whether this product requires questionnaire completion
  health_vertical_slug?: string // Health vertical slug (e.g., hair-loss)
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
  saveCheckoutData: (data: CheckoutData) => void
  getCheckoutData: () => CheckoutData | null
  clearCheckoutData: () => void
}

export interface CheckoutData {
  paymentToken?: string
  paymentMethod?: string
  userDetails?: {
    email: string
    firstName: string
    lastName: string
    phone: string
    dateOfBirth: string
    sex: string
  }
  deliveryAddress?: {
    street: string
    city: string
    postcode: string
    country: string
  }
  quizResponses?: Record<string, any>
  orderNotes?: string
  agreedToTerms: boolean
  agreedToMarketing: boolean
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
  id: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phone?: string
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  address?: Address
  preferences?: Record<string, any>
  verificationStatus: 'pending' | 'partial' | 'verified' | 'rejected'
  accountStatus: 'active' | 'suspended' | 'deleted' | 'pending_verification'
  agreedToTerms: boolean
  agreedToTermsAt?: string
  agreedToMarketing: boolean
  agreedToMarketingAt?: string
  marketingPreferences: MarketingPreferences
  privacyPreferences: Record<string, any>
  lastLoginAt?: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface MarketingPreferences {
  email?: boolean
  sms?: boolean
  push?: boolean
  newsletter?: boolean
  productUpdates?: boolean
  healthTips?: boolean
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
  updateConsent: (termsConsent?: boolean, marketingConsent?: boolean, marketingPrefs?: MarketingPreferences) => Promise<void>
  verifyEmail: () => Promise<void>
  verifyPhone: (code: string) => Promise<void>
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