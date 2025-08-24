"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard'
import type { UserProfile } from '@/components/dashboard/types'

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
        <DashboardLayout user={user} onSignOut={handleSignOut} theme="light">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, {user?.user_metadata?.first_name || 'User'}
                    </p>
                </div>
                
                {/* Dashboard Content Placeholder */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        <p className="text-sm text-gray-600">Active Orders</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        <p className="text-sm text-gray-600">Consultations</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        <p className="text-sm text-gray-600">Prescriptions</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                        <h3 className="text-2xl font-bold text-gray-900">0</h3>
                        <p className="text-sm text-gray-600">Messages</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
