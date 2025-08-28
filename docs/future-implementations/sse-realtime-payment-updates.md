# Real-time Payment Updates: SSE + Polling Fallback

## Overview

This document outlines a future implementation for real-time payment status updates using Server-Sent Events (SSE) with polling fallback, specifically designed for Next.js 13+ App Router and Supabase.

## Current vs Future Implementation

### Current (Polling Only)
```typescript
// Client polls every 1 second for 30 seconds
const pollForPayment = async () => {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId)
  // Check status and update UI
}
setInterval(pollForPayment, 1000)
```

**Issues:**
- 30+ unnecessary requests per payment
- 1-second delay for updates
- Poor mobile battery life
- Server load with concurrent users

### Future (SSE + Supabase + Polling Fallback)
```typescript
// Real-time updates via SSE, polling as backup
const usePaymentStatus = (sessionId) => {
  // Try SSE first, fallback to polling if needed
  return { status, isRealtime, error }
}
```

**Benefits:**
- Instant updates (< 100ms)
- 95% fewer requests
- Better UX and performance
- Graceful degradation

## Architecture Options

### Option 1: Pure SSE with Database Polling
```
┌─────────────┐    SSE    ┌─────────────┐    Poll DB    ┌─────────────┐
│   Client    │ ◄─────── │   Next.js   │ ◄─────────── │  Supabase   │
│  (Browser)  │          │   Server    │              │  Database   │
└─────────────┘          └─────────────┘              └─────────────┘
                                 ▲
                                 │ Webhook
                           ┌─────────────┐
                           │    Genie    │
                           │  Payments   │
                           └─────────────┘
```

### Option 2: Supabase Realtime + SSE Relay
```
┌─────────────┐    SSE    ┌─────────────┐  Realtime   ┌─────────────┐
│   Client    │ ◄─────── │   Next.js   │ ◄─────────── │  Supabase   │
│  (Browser)  │          │   Server    │  Subscribe   │  Realtime   │
└─────────────┘          └─────────────┘              └─────────────┘
                                                              ▲
                                                              │ Update
                                                        ┌─────────────┐
                                                        │   Webhook   │
                                                        │   Handler   │
                                                        └─────────────┘
```

### Option 3: Direct Supabase Realtime (Recommended)
```
┌─────────────┐  Realtime  ┌─────────────┐
│   Client    │ ◄───────── │  Supabase   │
│  (Browser)  │  Subscribe │  Realtime   │
└─────────────┘            └─────────────┘
                                   ▲
                                   │ Update
                             ┌─────────────┐
                             │   Webhook   │
                             │   Handler   │
                             └─────────────┘
```

## Implementation Plan

### Phase 1: Supabase Realtime (Recommended)

#### Client Implementation
```typescript
// hooks/usePaymentStatus.ts
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function usePaymentStatus(sessionId: string, type: 'consultation' | 'upfront') {
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [isRealtime, setIsRealtime] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let channel: any
    let pollInterval: NodeJS.Timeout
    let realtimeTimeout: NodeJS.Timeout

    const setupRealtime = async () => {
      try {
        // Get initial order
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (!orders || orders.length === 0) return

        const order = orders[0]
        setOrderId(order.id)

        // Set up realtime subscription
        channel = supabase
          .channel(`order_${order.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${order.id}`
            },
            (payload) => {
              console.log('🔄 Real-time order update:', payload.new)
              setIsRealtime(true)
              clearTimeout(realtimeTimeout)
              clearInterval(pollInterval)
              
              const updatedOrder = payload.new
              handleStatusUpdate(updatedOrder, type)
            }
          )
          .subscribe((status) => {
            console.log('📡 Supabase realtime status:', status)
            if (status === 'SUBSCRIBED') {
              setIsRealtime(true)
              console.log('✅ Real-time subscription active')
            }
          })

        // Fallback to polling if realtime doesn't work within 5 seconds
        realtimeTimeout = setTimeout(() => {
          if (!isRealtime) {
            console.log('⏰ Realtime timeout, falling back to polling')
            startPolling(order.id)
          }
        }, 5000)

      } catch (error) {
        console.error('❌ Realtime setup failed:', error)
        startPolling()
      }
    }

    const startPolling = (orderId?: string) => {
      setIsRealtime(false)
      console.log('🔄 Starting polling fallback')
      
      const poll = async () => {
        try {
          const query = orderId 
            ? supabase.from('orders').select('*').eq('id', orderId).single()
            : supabase.from('orders').select('*').eq('session_id', sessionId)
                .order('created_at', { ascending: false }).limit(1).single()

          const { data: order } = await query
          if (order) {
            setOrderId(order.id)
            handleStatusUpdate(order, type)
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }

      poll() // Initial poll
      pollInterval = setInterval(poll, 2000) // Poll every 2 seconds
    }

    const handleStatusUpdate = (order: any, flowType: string) => {
      if (flowType === 'consultation' && order.consultation_status === 'paid') {
        setStatus('success')
        return 'success'
      } else if (flowType === 'upfront' && 
                 order.payment_status === 'confirmed' && 
                 order.status === 'processing') {
        setStatus('success')
        return 'success'
      } else if (order.status === 'payment_failed' || 
                 order.payment_status === 'failed' ||
                 order.consultation_status === 'failed') {
        setStatus('failed')
        return 'failed'
      }
      return 'processing'
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (realtimeTimeout) {
        clearTimeout(realtimeTimeout)
      }
    }
  }, [sessionId, type])

  return { status, isRealtime, orderId }
}
```

#### Usage in Processing Page
```typescript
// app/checkout/[sessionId]/processing/page.tsx
export default function ProcessingPage({ params }: { params: { sessionId: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') as 'consultation' | 'upfront'
  const { status, isRealtime, orderId } = usePaymentStatus(params.sessionId, type)

  useEffect(() => {
    if (status === 'success' && orderId) {
      setTimeout(() => {
        router.push(`/checkout/${params.sessionId}/complete?order=${orderId}&type=${type}`)
      }, 3000)
    }
  }, [status, orderId])

  return (
    <div>
      <ProcessingStatus status={status} />
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div>Connection: {isRealtime ? 'Real-time' : 'Polling'}</div>
      )}
    </div>
  )
}
```

### Phase 2: SSE Relay (Alternative)

#### SSE Endpoint with Supabase Subscription
```typescript
// app/api/checkout/[sessionId]/events/route.ts
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }) {
  const { sessionId } = params
  const supabase = createServiceRoleClient()

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let channel: any

      // Set up Supabase realtime subscription
      const setupSubscription = async () => {
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('session_id', sessionId)
          .limit(1)

        if (orders && orders.length > 0) {
          const orderId = orders[0].id

          channel = supabase
            .channel(`sse_${orderId}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`
              },
              (payload) => {
                const event = createPaymentEvent(payload.new)
                if (event) {
                  const data = `data: ${JSON.stringify(event)}\n\n`
                  controller.enqueue(encoder.encode(data))
                }
              }
            )
            .subscribe()
        }
      }

      setupSubscription()

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        if (channel) supabase.removeChannel(channel)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
```

## Performance Comparison

### Current Implementation
```
User Payment → 30 seconds × 1 req/sec = 30 requests
100 concurrent users = 3,000 requests for single payment
Daily with 1,000 payments = 3,000,000 requests
```

### With Supabase Realtime
```
User Payment → 1 subscription + 0 polling = 1 connection
100 concurrent users = 100 connections
Daily with 1,000 payments = 1,000 connections
Reduction: 99.97% fewer requests
```

## Security Considerations

### Row Level Security (RLS)
```sql
-- Only allow users to see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Realtime will respect RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### Authentication
```typescript
// Verify user can access session before subscription
const { data: session } = await supabase
  .from('checkout_sessions')
  .select('user_id')
  .eq('session_token', sessionId)
  .eq('user_id', user.id) // Ensure ownership
  .single()
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/usePaymentStatus.test.ts
describe('usePaymentStatus', () => {
  it('should connect to realtime and receive updates', async () => {
    // Mock Supabase realtime
    // Test realtime subscription
    // Verify status updates
  })

  it('should fallback to polling when realtime fails', async () => {
    // Mock realtime failure
    // Verify polling starts
    // Test polling behavior
  })
})
```

### Integration Tests
```typescript
// __tests__/payment-flow.e2e.ts
describe('Payment Flow', () => {
  it('should receive real-time payment confirmation', async () => {
    // Trigger webhook
    // Verify instant UI update
    // Confirm < 500ms response time
  })
})
```

## Migration Plan

### Phase 1: Feature Flag
```typescript
// Feature flag for gradual rollout
const useRealtime = process.env.ENABLE_REALTIME_PAYMENTS === 'true'

if (useRealtime) {
  return usePaymentStatusRealtime(sessionId, type)
} else {
  return usePaymentStatusPolling(sessionId, type)
}
```

### Phase 2: A/B Testing
```typescript
// Split traffic for performance comparison
const userId = user.id
const useRealtime = parseInt(userId.slice(-1), 16) % 2 === 0

// Track metrics: response time, success rate, user satisfaction
```

### Phase 3: Full Rollout
- Monitor error rates and performance
- Gradual increase from 10% → 50% → 100%
- Keep polling as fallback indefinitely

## Cost Analysis

### Supabase Realtime Pricing
- **Free Tier**: 200 concurrent connections
- **Pro Tier**: $25/month for 500 connections
- **Scale**: $10 per 1,000 connections

### Estimated Savings
- **Current**: ~3M API requests/day at $2 per 100K = $60/day
- **Realtime**: ~1K connections/day at $0.01 each = $10/day
- **Net Savings**: $50/day = $1,500/month

## Recommended Implementation

**Use Supabase Realtime directly** (Option 3) because:

✅ **Simplest architecture**
✅ **Lowest latency** (~50ms vs 1000ms)  
✅ **Best performance** (99.9% fewer requests)
✅ **Built-in authentication** via RLS
✅ **Automatic reconnection** handling
✅ **Cost effective** at scale

The key is implementing robust fallback to polling when realtime isn't available, ensuring 100% reliability while optimizing for performance.