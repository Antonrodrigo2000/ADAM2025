"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import type { CustomerOrder } from "@/lib/types/dashboard"

interface OrdersTableProps {
  orders?: CustomerOrder[]
  loading?: boolean
  showViewAll?: boolean
  onViewOrder?: (orderId: string) => void
  onViewAll?: () => void
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />
    case 'shipped':
      return <Truck className="w-4 h-4" />
    case 'processing':
      return <Package className="w-4 h-4" />
    case 'payment_pending':
    case 'physician_review':
      return <Clock className="w-4 h-4" />
    case 'cancelled':
    case 'payment_failed':
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'shipped':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'processing':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
    case 'physician_review':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    case 'payment_pending':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    case 'cancelled':
    case 'payment_failed':
      return 'bg-red-100 text-red-800 hover:bg-red-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
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
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatCurrency(amount: number) {
  return `LKR ${amount.toLocaleString()}`
}

function OrderRow({ order, onViewOrder }: { order: CustomerOrder; onViewOrder?: (id: string) => void }) {
  const primaryProduct = order.order_items?.[0]?.product
  const itemCount = order.order_items?.length || 0
  
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">
        <div className="space-y-1">
          <p className="font-semibold">#{order.id.slice(-8)}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)}
          </p>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium">
            {primaryProduct?.name || 'Unknown Product'}
          </p>
          {itemCount > 1 && (
            <p className="text-sm text-muted-foreground">
              +{itemCount - 1} more item{itemCount > 2 ? 's' : ''}
            </p>
          )}
          {order.payment_flow_type === 'consultation_first' && (
            <Badge variant="outline" className="text-xs">
              Consultation Required
            </Badge>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge 
          variant="secondary"
          className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}
        >
          {getStatusIcon(order.status)}
          {formatStatus(order.status)}
        </Badge>
      </TableCell>
      
      <TableCell className="font-medium">
        {formatCurrency(order.total_amount)}
      </TableCell>
      
      <TableCell>
        {order.estimated_delivery ? (
          <span className="text-sm">
            {formatDate(order.estimated_delivery)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">TBD</span>
        )}
      </TableCell>
      
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewOrder?.(order.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="w-4 h-4" />
          <span className="sr-only">View order details</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}

function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
    </TableRow>
  )
}

function OrderCard({ order, onViewOrder }: { order: CustomerOrder; onViewOrder?: (id: string) => void }) {
  const primaryProduct = order.order_items?.[0]?.product
  const itemCount = order.order_items?.length || 0
  
  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold">#{order.id.slice(-8)}</p>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.created_at)}
          </p>
        </div>
        <Badge 
          variant="secondary"
          className={`${getStatusColor(order.status)} flex items-center gap-1`}
        >
          {getStatusIcon(order.status)}
          {formatStatus(order.status)}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <p className="font-medium">
          {primaryProduct?.name || 'Unknown Product'}
        </p>
        {itemCount > 1 && (
          <p className="text-sm text-muted-foreground">
            +{itemCount - 1} more item{itemCount > 2 ? 's' : ''}
          </p>
        )}
        {order.payment_flow_type === 'consultation_first' && (
          <Badge variant="outline" className="text-xs">
            Consultation Required
          </Badge>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm text-muted-foreground">Delivery</p>
          <p className="text-sm">
            {order.estimated_delivery ? formatDate(order.estimated_delivery) : 'TBD'}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewOrder?.(order.id)}
        >
          View
        </Button>
      </div>
    </div>
  )
}

function OrderCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex justify-between items-end pt-2">
        <div className="space-y-1">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
  )
}

export function OrdersTable({ 
  orders, 
  loading, 
  showViewAll = true, 
  onViewOrder,
  onViewAll 
}: OrdersTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Recent Orders</CardTitle>
          <CardDescription>
            Your latest purchases and their current status
          </CardDescription>
        </div>
        {showViewAll && orders && orders.length > 0 && (
          <Button variant="outline" onClick={onViewAll}>
            View All
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))
          ) : orders && orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onViewOrder={onViewOrder}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Package className="w-8 h-8" />
                <p>No orders found</p>
                <p className="text-sm">Your orders will appear here once you make a purchase</p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <OrderRowSkeleton key={i} />
                ))
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <OrderRow 
                    key={order.id} 
                    order={order} 
                    onViewOrder={onViewOrder}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="w-8 h-8" />
                      <p>No orders found</p>
                      <p className="text-sm">Your orders will appear here once you make a purchase</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}