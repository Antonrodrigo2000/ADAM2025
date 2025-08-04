"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Package, Clock, MapPin, Phone, Mail, Calendar, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/contexts'

interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  date_of_birth?: string
  sex?: string
  address?: any
  created_at: string
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  delivery_address: any
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { actions: authActions } = useAuth()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const supabase = createClient()
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth')
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile({ ...profileData, email: user.email })
      }

      // Get user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ordersData) {
        setOrders(ordersData)
      }

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await authActions.signOut()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'shipped':
        return 'text-blue-600 bg-blue-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {profile?.first_name || 'User'}!
                </h1>
                <p className="text-sm text-gray-600">Manage your health journey</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              <div className="space-y-4">
                {profile?.first_name && (
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>

                {profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile?.date_of_birth && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">{formatDate(profile.date_of_birth)}</p>
                    </div>
                  </div>
                )}

                {profile?.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <div className="font-medium text-sm">
                        <p>{profile.address.street}</p>
                        <p>{profile.address.city}, {profile.address.postcode}</p>
                        <p>{profile.address.country}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Account created: {formatDate(profile?.created_at || '')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders & Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
              
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            LKR {order.total_amount.toLocaleString()}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {order.delivery_address && (
                        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                          <p className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Delivery to: {order.delivery_address.street}, {order.delivery_address.city}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Button onClick={() => router.push('/')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => router.push('/')}>
                  <Package className="w-4 h-4 mr-2" />
                  Browse Products
                </Button>
                <Button variant="outline" onClick={() => router.push('/quiz')}>
                  <Clock className="w-4 h-4 mr-2" />
                  Take Health Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}