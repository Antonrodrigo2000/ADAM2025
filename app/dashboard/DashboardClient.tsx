"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Package, Clock, MapPin, Phone, Mail, Calendar, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
// Removed useAuth import since we're using server-side auth

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

export default function DashboardClient({ user }: { user: any }) {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            // Fetch profile and orders here using user.id
            // ...
            setProfile(null) // Replace with real fetch
            setOrders([]) // Replace with real fetch
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                // Redirect to home page after successful sign out
                window.location.href = '/'
            } else {
                console.error('Sign out failed')
                // Fallback: redirect anyway
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Sign out error:', error)
            // Fallback: redirect anyway
            window.location.href = '/'
        }
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
            {/* ...existing dashboard JSX, use profile and orders as before... */}
            {/* You can use user prop if needed */}
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <Button onClick={handleSignOut} variant="outline" className="flex items-center">
                        <LogOut className="mr-2" />
                        Sign Out    </Button>
                </div>
            </div>
        </div>
    )
}
