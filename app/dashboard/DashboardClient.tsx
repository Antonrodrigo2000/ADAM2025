"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { OrdersTable } from '@/components/dashboard/orders-table'
import { ConsultationsCard } from '@/components/dashboard/consultations-card'
import { ActivityTimeline } from '@/components/dashboard/activity-timeline'
import { DashboardBreadcrumbs } from '@/components/common/breadcrumbs'
import { DashboardApiService } from '@/lib/services/dashboard-api'
import type { DashboardData } from '@/lib/types/dashboard'

export default function DashboardClient({ user }: { user: any }) {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        loadDashboardData()
    }, [user.id])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await DashboardApiService.getDashboardData(user.id)
            
            if (response.error) {
                setError(response.error)
            } else {
                setDashboardData(response.data!)
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error)
            setError('Failed to load dashboard data')
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
                window.location.href = '/'
            } else {
                console.error('Sign out failed')
                window.location.href = '/'
            }
        } catch (error) {
            console.error('Sign out error:', error)
            window.location.href = '/'
        }
    }

    const handleViewOrder = (orderId: string) => {
        router.push(`/dashboard/orders/${orderId}`)
    }

    const handleViewAllOrders = () => {
        router.push('/dashboard/orders')
    }

    const handleViewConsultation = (consultationId: string) => {
        router.push(`/dashboard/consultations/${consultationId}`)
    }

    if (error) {
        return (
            <DashboardLayout user={user} onSignOut={handleSignOut} theme="light">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-red-500 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 19.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={loadDashboardData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout user={user} onSignOut={handleSignOut} theme="light">
            <div className="space-y-4">
                {/* Breadcrumbs */}
                <DashboardBreadcrumbs />
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                        <p className="text-muted-foreground mt-2">
                            Welcome back, {dashboardData?.profile.first_name || user?.user_metadata?.first_name || 'User'}
                        </p>
                    </div>
                </div>
                
                {/* Stats Overview */}
                <StatsCards stats={dashboardData?.stats} loading={loading} />
                
                {/* Main Content Grid */}
                <div className="space-y-6 lg:grid lg:gap-6 lg:grid-cols-3 lg:space-y-0">
                    {/* Orders and Consultations - 2 columns on desktop, stacked on mobile */}
                    <div className="space-y-6 lg:col-span-2">
                        <OrdersTable 
                            orders={dashboardData?.recent_orders}
                            loading={loading}
                            onViewOrder={handleViewOrder}
                            onViewAll={handleViewAllOrders}
                        />
                        
                        <ConsultationsCard 
                            consultations={dashboardData?.active_consultations}
                            loading={loading}
                            onViewConsultation={handleViewConsultation}
                        />
                    </div>
                    
                    {/* Activity Timeline - 1 column on desktop, stacked on mobile */}
                    <div className="lg:col-span-1">
                        <ActivityTimeline 
                            activities={dashboardData?.recent_activity}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
