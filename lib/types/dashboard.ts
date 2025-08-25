/**
 * Comprehensive dashboard data types based on database schema
 */

export interface CustomerProfile {
  id: string
  first_name?: string
  last_name?: string
  date_of_birth?: string
  phone?: string
  email?: string
  address?: {
    street?: string
    city?: string
    postal_code?: string
    country?: string
  }
  verification_status: 'pending' | 'partial' | 'verified'
  genie_customer_id?: string
  emed_patient_id?: string
  nic?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  product: {
    id: string
    name: string
    brand?: string
    form?: string
    strength?: string
    description?: string
    health_vertical_slug?: string
  }
}

export interface PaymentPhase {
  id: string
  phase_type: 'consultation' | 'products'
  phase_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  genie_transaction_id?: string
  amount: number
  currency: string
  initiated_at: string
  completed_at?: string
  payment_metadata?: any
}

export interface CustomerOrder {
  id: string
  user_id: string
  status: 'payment_pending' | 'physician_review' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'payment_failed'
  payment_flow_type: 'consultation_first' | 'full_upfront'
  total_amount: number
  consultation_fee_total: number
  consultation_status?: 'pending' | 'paid' | 'approved' | 'rejected'
  consultation_payment_id?: string
  product_payment_id?: string
  payment_status?: 'pending' | 'consultation_paid' | 'confirmed' | 'failed'
  delivery_address: any
  estimated_delivery?: string
  physician_notes?: string
  approved_at?: string
  approved_by?: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  payment_phases: PaymentPhase[]
  health_vertical?: {
    name: string
    slug: string
  }
}

export interface Consultation {
  id: string
  order_id: string
  physician_id?: string
  status: 'assigned' | 'in_progress' | 'requires_call' | 'completed' | 'cancelled'
  consultation_type: 'async' | 'video_call' | 'phone_call'
  physician_notes?: string
  decision?: 'approved' | 'denied' | 'requires_consultation'
  scheduled_call_at?: string
  assigned_at: string
  completed_at?: string
  sla_deadline: string
  physician?: {
    first_name: string
    last_name: string
    specializations: string[]
  }
}

export interface PaymentMethod {
  id: string
  payment_token: string
  gateway_provider: string
  card_last_four: string
  card_brand: string
  card_type: string
  cardholder_name?: string
  expiry_month?: number
  expiry_year?: number
  is_default: boolean
  is_active: boolean
  created_at: string
}

export interface DashboardStats {
  total_orders: number
  active_orders: number
  completed_orders: number
  total_spent: number
  consultations_pending: number
  consultations_completed: number
  prescriptions_active: number
}

export interface RecentActivity {
  id: string
  type: 'order_placed' | 'consultation_assigned' | 'prescription_approved' | 'order_shipped' | 'payment_completed'
  title: string
  description: string
  timestamp: string
  metadata?: any
}

export interface DashboardData {
  profile: CustomerProfile
  stats: DashboardStats
  recent_orders: CustomerOrder[]
  active_consultations: Consultation[]
  recent_activity: RecentActivity[]
  payment_methods: PaymentMethod[]
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_next: boolean
  has_previous: boolean
}