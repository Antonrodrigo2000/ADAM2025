"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Activity,
  ShoppingCart, 
  Stethoscope, 
  FileText, 
  Truck, 
  CheckCircle,
  Clock
} from "lucide-react"
import type { RecentActivity } from "@/lib/types/dashboard"

interface ActivityTimelineProps {
  activities?: RecentActivity[]
  loading?: boolean
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'order_placed':
      return <ShoppingCart className="w-4 h-4" />
    case 'consultation_assigned':
      return <Stethoscope className="w-4 h-4" />
    case 'prescription_approved':
      return <FileText className="w-4 h-4" />
    case 'order_shipped':
      return <Truck className="w-4 h-4" />
    case 'payment_completed':
      return <CheckCircle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'order_placed':
      return 'bg-blue-500'
    case 'consultation_assigned':
      return 'bg-purple-500'
    case 'prescription_approved':
      return 'bg-green-500'
    case 'order_shipped':
      return 'bg-yellow-500'
    case 'payment_completed':
      return 'bg-emerald-500'
    default:
      return 'bg-gray-500'
  }
}

function formatTimeAgo(timestamp: string) {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return time.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
}

function ActivityItem({ activity, isLast }: { activity: RecentActivity; isLast: boolean }) {
  return (
    <div className="flex items-start space-x-3">
      {/* Timeline indicator */}
      <div className="relative">
        <div className={`w-8 h-8 rounded-full ${getActivityColor(activity.type)} flex items-center justify-center text-white`}>
          {getActivityIcon(activity.type)}
        </div>
        {!isLast && (
          <div className="absolute top-8 left-1/2 w-px h-6 bg-border transform -translate-x-1/2" />
        )}
      </div>
      
      {/* Activity content */}
      <div className="flex-1 space-y-1 pb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{activity.title}</p>
          <Badge variant="outline" className="text-xs">
            {formatTimeAgo(activity.timestamp)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {activity.description}
        </p>
      </div>
    </div>
  )
}

function ActivitySkeleton({ isLast }: { isLast: boolean }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="relative">
        <Skeleton className="w-8 h-8 rounded-full" />
        {!isLast && (
          <div className="absolute top-8 left-1/2 w-px h-6 bg-border transform -translate-x-1/2" />
        )}
      </div>
      <div className="flex-1 space-y-2 pb-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </div>
        <CardDescription>
          Your latest updates and order progress
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-0">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ActivitySkeleton key={i} isLast={i === 3} />
            ))
          ) : activities && activities.length > 0 ? (
            activities.map((activity, index) => (
              <ActivityItem 
                key={activity.id}
                activity={activity}
                isLast={index === activities.length - 1}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No recent activity</p>
              <p className="text-sm">Your activity timeline will show here as you use the platform</p>
            </div>
          )}
        </div>
        
        {activities && activities.length >= 5 && (
          <div className="mt-6 pt-4 border-t text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}