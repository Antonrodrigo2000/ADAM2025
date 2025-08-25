"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Stethoscope, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Video,
  User
} from "lucide-react"
import type { Consultation } from "@/lib/types/dashboard"

interface ConsultationsCardProps {
  consultations?: Consultation[]
  loading?: boolean
  onViewConsultation?: (consultationId: string) => void
}

function getConsultationIcon(type: string) {
  switch (type) {
    case 'video_call':
      return <Video className="w-4 h-4" />
    case 'phone_call':
      return <Phone className="w-4 h-4" />
    case 'async':
    default:
      return <MessageSquare className="w-4 h-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'requires_call':
      return 'bg-orange-100 text-orange-800'
    case 'assigned':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPhysicianInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) return 'Dr'
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function ConsultationItem({ 
  consultation, 
  onViewConsultation 
}: { 
  consultation: Consultation; 
  onViewConsultation?: (id: string) => void 
}) {
  const isOverdue = new Date(consultation.sla_deadline) < new Date()
  const physician = consultation.physician

  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-blue-100 text-blue-700">
          {physician ? getPhysicianInitials(physician.first_name, physician.last_name) : <User className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {physician 
              ? `Dr. ${physician.first_name} ${physician.last_name}`
              : 'Physician Assignment Pending'
            }
          </p>
          <Badge 
            variant="secondary"
            className={`${getStatusColor(consultation.status)} text-xs`}
          >
            {formatStatus(consultation.status)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {getConsultationIcon(consultation.consultation_type)}
            {consultation.consultation_type.replace('_', ' ')}
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(consultation.assigned_at)}
          </div>
          
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>
        
        {physician?.specializations && physician.specializations.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {physician.specializations.slice(0, 2).map((spec, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
            {physician.specializations.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{physician.specializations.length - 2} more
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onViewConsultation?.(consultation.id)}
      >
        View
      </Button>
    </div>
  )
}

function ConsultationSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function ConsultationsCard({ 
  consultations, 
  loading, 
  onViewConsultation 
}: ConsultationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-xl">Active Consultations</CardTitle>
        </div>
        <CardDescription>
          Your ongoing physician consultations and reviews
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <ConsultationSkeleton key={i} />
            ))
          ) : consultations && consultations.length > 0 ? (
            consultations.map((consultation) => (
              <ConsultationItem 
                key={consultation.id}
                consultation={consultation}
                onViewConsultation={onViewConsultation}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No active consultations</p>
              <p className="text-sm">Your consultations will appear here when you place orders requiring physician review</p>
            </div>
          )}
        </div>
        
        {consultations && consultations.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Consultations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}