"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  ShoppingCart, 
  Stethoscope, 
  FileText, 
  DollarSign,
  TrendingUp,
  Clock
} from "lucide-react"
import type { DashboardStats } from "@/lib/types/dashboard"

interface StatsCardsProps {
  stats?: DashboardStats
  loading?: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50'
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <Badge 
                variant="secondary"
                className={`text-xs ${trend.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}
              >
                <TrendingUp className={`w-3 h-3 mr-1 ${trend.isPositive ? '' : 'rotate-180'}`} />
                {Math.abs(trend.value)}%
              </Badge>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return `LKR ${amount.toLocaleString()}`
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Orders"
        value={stats.total_orders}
        icon={ShoppingCart}
        color="blue"
        subtitle="All time"
      />
      
      <StatCard
        title="Active Orders"
        value={stats.active_orders}
        icon={Clock}
        color="orange"
        subtitle="In progress"
      />
      
      <StatCard
        title="Total Spent"
        value={formatCurrency(stats.total_spent)}
        icon={DollarSign}
        color="purple"
        subtitle="All purchases"
      />
      
      <StatCard
        title="Consultations"
        value={stats.consultations_completed}
        icon={Stethoscope}
        color="blue"
        subtitle={`${stats.consultations_pending} pending`}
      />
    </div>
  )
}