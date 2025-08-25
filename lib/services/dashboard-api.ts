/**
 * Dashboard API service layer
 * Handles all data fetching for customer dashboard
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  DashboardData, 
  CustomerOrder, 
  CustomerProfile, 
  DashboardStats, 
  Consultation,
  PaymentMethod,
  RecentActivity,
  ApiResponse,
  PaginatedResponse 
} from '@/lib/types/dashboard'

export class DashboardApiService {
  private static supabase = createClient()

  /**
   * Fetch complete dashboard data for user
   */
  static async getDashboardData(userId: string): Promise<ApiResponse<DashboardData>> {
    try {
      const [
        profileResult,
        statsResult,
        ordersResult,
        consultationsResult,
        paymentMethodsResult
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getDashboardStats(userId),
        this.getRecentOrders(userId, 5),
        this.getActiveConsultations(userId),
        this.getPaymentMethods(userId)
      ])

      // Generate recent activity from orders and consultations
      const recentActivity = await this.generateRecentActivity(userId)

      const dashboardData: DashboardData = {
        profile: profileResult.data!,
        stats: statsResult.data!,
        recent_orders: ordersResult.data || [],
        active_consultations: consultationsResult.data || [],
        recent_activity: recentActivity.data || [],
        payment_methods: paymentMethodsResult.data || []
      }

      return {
        data: dashboardData,
        message: 'Dashboard data loaded successfully'
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return {
        error: 'Failed to load dashboard data'
      }
    }
  }

  /**
   * Get user profile information
   */
  static async getUserProfile(userId: string): Promise<ApiResponse<CustomerProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Get email from auth metadata if needed
      const { data: authData } = await this.supabase.auth.getUser()
      
      const profile: CustomerProfile = {
        ...data,
        email: authData.user?.email
      }

      return { data: profile }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { error: 'Failed to load profile' }
    }
  }

  /**
   * Calculate dashboard statistics
   */
  static async getDashboardStats(userId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get order statistics
      const { data: orderStats, error: orderError } = await this.supabase
        .from('orders')
        .select('status, total_amount')
        .eq('user_id', userId)

      if (orderError) throw orderError

      // Get consultation statistics (may not exist for all orders)
      const orderIds = orderStats?.map(o => o.id) || []
      let consultationStats: any[] = []
      
      if (orderIds.length > 0) {
        const { data, error: consultationError } = await this.supabase
          .from('consultations')
          .select('status')
          .in('order_id', orderIds)
        
        if (!consultationError) {
          consultationStats = data || []
        }
      }

      const stats: DashboardStats = {
        total_orders: orderStats?.length || 0,
        active_orders: orderStats?.filter(o => 
          ['payment_pending', 'physician_review', 'processing', 'shipped'].includes(o.status)
        ).length || 0,
        completed_orders: orderStats?.filter(o => o.status === 'completed').length || 0,
        total_spent: orderStats?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
        consultations_pending: consultationStats?.filter(c => 
          ['assigned', 'in_progress'].includes(c.status)
        ).length || 0,
        consultations_completed: consultationStats?.filter(c => c.status === 'completed').length || 0,
        prescriptions_active: orderStats?.filter(o => 
          o.status === 'processing' || o.status === 'shipped'
        ).length || 0
      }

      return { data: stats }
    } catch (error) {
      console.error('Error calculating dashboard stats:', error)
      return { error: 'Failed to calculate statistics' }
    }
  }

  /**
   * Get recent orders with full details
   */
  static async getRecentOrders(
    userId: string, 
    limit: number = 10
  ): Promise<ApiResponse<CustomerOrder[]>> {
    try {
      console.log('Fetching orders for user:', userId)
      
      // Get orders with cart snapshot for product names
      const { data: orders, error: orderError } = await this.supabase
        .from('orders')
        .select('*, cart_snapshot')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (orderError) {
        console.error('Order query error:', orderError)
        throw orderError
      }

      console.log('Found orders:', orders?.length || 0)

      if (!orders || orders.length === 0) {
        return { data: [] }
      }

      // Get order items and use cart snapshot for product details
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          // Get order items from database
          const { data: orderItems, error: itemsError } = await this.supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id)

          if (itemsError) {
            console.error('Order items error for order', order.id, ':', itemsError)
          }

          // Use cart snapshot for product names and details since that has the full product info
          const cartSnapshot = order.cart_snapshot || []
          const orderItemsWithProducts = (orderItems || []).map((item) => {
            // Find matching cart item for product details
            const cartItem = cartSnapshot.find((cartItem: any) => cartItem.product_id === item.product_id)
            
            return {
              ...item,
              product: {
                id: item.product_id,
                name: cartItem?.productName || `Product ${item.product_id.slice(-8)}`,
                brand: cartItem?.variantName || null,
                form: null,
                strength: null,
                description: null,
                health_vertical_slug: null
              }
            }
          })

          // Get payment phases
          const { data: paymentPhases, error: phasesError } = await this.supabase
            .from('order_payment_phases')
            .select('*')
            .eq('order_id', order.id)

          if (phasesError) {
            console.error('Payment phases error for order', order.id, ':', phasesError)
          }

          return {
            ...order,
            order_items: orderItemsWithProducts,
            payment_phases: paymentPhases || []
          }
        })
      )

      return { data: ordersWithDetails as CustomerOrder[] }
    } catch (error) {
      console.error('Error fetching recent orders:', error)
      return { error: 'Failed to load recent orders' }
    }
  }

  /**
   * Get active consultations
   */
  static async getActiveConsultations(userId: string): Promise<ApiResponse<Consultation[]>> {
    try {
      // First get user's orders
      const { data: orders } = await this.supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
      
      const orderIds = orders?.map(o => o.id) || []
      
      if (orderIds.length === 0) {
        return { data: [] }
      }

      const { data, error } = await this.supabase
        .from('consultations')
        .select(`
          *,
          physicians (
            first_name,
            last_name,
            specializations
          )
        `)
        .in('order_id', orderIds)
        .in('status', ['assigned', 'in_progress', 'requires_call'])
        .order('assigned_at', { ascending: false })

      if (error) throw error

      return { data: data as Consultation[] }
    } catch (error) {
      console.error('Error fetching active consultations:', error)
      return { error: 'Failed to load consultations' }
    }
  }

  /**
   * Get user's payment methods
   */
  static async getPaymentMethods(userId: string): Promise<ApiResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('is_default', { ascending: false })

      if (error) throw error

      return { data: data as PaymentMethod[] }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      return { error: 'Failed to load payment methods' }
    }
  }

  /**
   * Generate recent activity timeline
   */
  static async generateRecentActivity(userId: string): Promise<ApiResponse<RecentActivity[]>> {
    try {
      // Get order data with cart snapshot for product names
      const { data: orders, error } = await this.supabase
        .from('orders')
        .select('id, status, total_amount, created_at, updated_at, cart_snapshot')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Activity orders query error:', error)
        throw error
      }

      const activities: RecentActivity[] = []

      if (!orders || orders.length === 0) {
        return { data: [] }
      }

      // For each order, get the first product name from cart snapshot
      for (const order of orders) {
        let productName = 'products'
        
        try {
          // Get product name from cart snapshot first (has actual product names)
          const cartSnapshot = order.cart_snapshot || []
          if (cartSnapshot.length > 0) {
            const firstCartItem = cartSnapshot[0]
            productName = firstCartItem.productName || `Product ${firstCartItem.product_id?.slice(-8) || 'Unknown'}`
          } else {
            // Fallback to order items if no cart snapshot
            const { data: firstItem } = await this.supabase
              .from('order_items')
              .select('product_id')
              .eq('order_id', order.id)
              .limit(1)
              .single()
            
            if (firstItem?.product_id) {
              productName = `Product ${firstItem.product_id.slice(-8)}`
            }
          }
        } catch (itemError) {
          // Continue with default product name if item fetch fails
          console.log('Could not fetch order item for order:', order.id)
        }

        // Order placed activity
        activities.push({
          id: `order_${order.id}_placed`,
          type: 'order_placed',
          title: 'Order Placed',
          description: `Order for ${productName} - LKR ${order.total_amount}`,
          timestamp: order.created_at,
          metadata: { orderId: order.id }
        })

        // Status change activities
        if (order.status === 'completed') {
          activities.push({
            id: `order_${order.id}_completed`,
            type: 'order_shipped',
            title: 'Order Completed',
            description: 'Your order has been delivered successfully',
            timestamp: order.updated_at,
            metadata: { orderId: order.id }
          })
        } else if (order.status === 'shipped') {
          activities.push({
            id: `order_${order.id}_shipped`,
            type: 'order_shipped',
            title: 'Order Shipped',
            description: 'Your order is on the way',
            timestamp: order.updated_at,
            metadata: { orderId: order.id }
          })
        }
      }

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      return { data: sortedActivities }
    } catch (error) {
      console.error('Error generating recent activity:', error)
      return { error: 'Failed to generate activity timeline' }
    }
  }

  /**
   * Get paginated order history
   */
  static async getOrderHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<CustomerOrder>>> {
    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await this.supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const total = count || 0
      const hasNext = offset + limit < total
      const hasPrevious = page > 1

      // For paginated history, we can return basic order info without nested details
      // This is more efficient and the UI can fetch details on demand
      return {
        data: {
          data: (data || []).map(order => ({
            ...order,
            order_items: [],
            payment_phases: []
          })) as CustomerOrder[],
          total,
          page,
          limit,
          has_next: hasNext,
          has_previous: hasPrevious
        }
      }
    } catch (error) {
      console.error('Error fetching order history:', error)
      return { error: 'Failed to load order history' }
    }
  }
}