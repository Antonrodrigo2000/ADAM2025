# Checkout Session Architecture

## 🏗️ URL Structure & Routing

### URL Pattern (Shopify-style)
```
/checkout/{sessionToken}/{step}

Examples:
- /checkout/cs_1234567890abcdef/information
- /checkout/cs_1234567890abcdef/payment  
- /checkout/cs_1234567890abcdef/processing
- /checkout/cs_1234567890abcdef/complete
```

### Next.js File Structure
```
app/
├── checkout/
│   ├── [sessionId]/
│   │   ├── information/
│   │   │   └── page.tsx          # New user signup + info collection
│   │   ├── payment/
│   │   │   └── page.tsx          # Payment methods + address
│   │   ├── processing/
│   │   │   └── page.tsx          # Payment processing state
│   │   ├── complete/
│   │   │   └── page.tsx          # Order confirmation
│   │   ├── layout.tsx            # Session-aware layout
│   │   └── loading.tsx           # Loading state
│   ├── create/
│   │   └── route.ts              # API: Create new session
│   └── page.tsx                  # Redirect to create session
```

## 🔐 Session Security & Validation

### Session Validation Middleware
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if it's a checkout session route
  const checkoutSessionMatch = pathname.match(/^\/checkout\/([^\/]+)\/(.+)$/)
  
  if (checkoutSessionMatch) {
    const [, sessionToken, step] = checkoutSessionMatch
    
    // Validate session
    const supabase = await createClient()
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !session) {
      // Redirect to create new session
      return NextResponse.redirect(new URL('/checkout', request.url))
    }
    
    // Step validation logic
    return validateCheckoutStep(session, step, request)
  }
  
  return NextResponse.next()
}

function validateCheckoutStep(session: any, requestedStep: string, request: NextRequest) {
  const { current_step, user_id } = session
  
  // Step progression rules
  const stepOrder = ['information', 'payment', 'processing', 'complete']
  const currentStepIndex = stepOrder.indexOf(current_step)
  const requestedStepIndex = stepOrder.indexOf(requestedStep)
  
  // For authenticated users, skip information step
  if (user_id && requestedStep === 'information') {
    return NextResponse.redirect(
      new URL(`/checkout/${session.session_token}/payment`, request.url)
    )
  }
  
  // Can't skip ahead more than one step
  if (requestedStepIndex > currentStepIndex + 1) {
    const redirectStep = stepOrder[currentStepIndex] || 'information'
    return NextResponse.redirect(
      new URL(`/checkout/${session.session_token}/${redirectStep}`, request.url)
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/checkout/:path*'
}
```

## 🛍️ Session Flow Logic

### 1. Session Creation
```typescript
// User adds items to cart and clicks "Checkout"
// → POST /api/checkout/create
// → Returns session token
// → Redirects to appropriate step
```

### 2. Flow Decision Tree
```
Start Checkout
├── User Authenticated?
│   ├── YES → /checkout/{token}/payment
│   └── NO → /checkout/{token}/information
│
Information Step (New Users)
├── Collect: name, email, password, address
├── Create account + authenticate
└── → /checkout/{token}/payment
│
Payment Step  
├── Show saved payment methods (auth users)
├── Or collect new payment info (new users)
├── Process payment
└── → /checkout/{token}/processing
│
Processing Step
├── Show loading state
├── Complete order creation
├── Send confirmation emails
└── → /checkout/{token}/complete
```

## 📊 Session State Management

### Session Context Provider
```typescript
// contexts/checkout-session-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CheckoutSession {
  id: string
  session_token: string
  status: string
  current_step: string
  cart_items: any[]
  cart_total: number
  customer_info: any
  shipping_address: any
  user_id?: string
}

interface CheckoutSessionContextType {
  session: CheckoutSession | null
  updateSession: (updates: Partial<CheckoutSession>) => Promise<void>
  progressToStep: (step: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

const CheckoutSessionContext = createContext<CheckoutSessionContextType | null>(null)

export function CheckoutSessionProvider({ 
  children, 
  sessionToken 
}: { 
  children: React.ReactNode
  sessionToken: string 
}) {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load session on mount
  useEffect(() => {
    loadSession()
  }, [sessionToken])
  
  const loadSession = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('checkout_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('status', 'active')
        .single()
      
      if (error) throw error
      setSession(data)
    } catch (err) {
      setError('Failed to load checkout session')
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateSession = async (updates: Partial<CheckoutSession>) => {
    if (!session) return
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('checkout_sessions')
        .update(updates)
        .eq('id', session.id)
        .select()
        .single()
      
      if (error) throw error
      setSession(data)
    } catch (err) {
      setError('Failed to update session')
    }
  }
  
  const progressToStep = async (step: string) => {
    await updateSession({ current_step: step })
    // Navigation will be handled by the component
  }
  
  return (
    <CheckoutSessionContext.Provider value={{
      session,
      updateSession,
      progressToStep,
      isLoading,
      error
    }}>
      {children}
    </CheckoutSessionContext.Provider>
  )
}

export function useCheckoutSession() {
  const context = useContext(CheckoutSessionContext)
  if (!context) {
    throw new Error('useCheckoutSession must be used within CheckoutSessionProvider')
  }
  return context
}
```

## 🔄 Migration Strategy

### Phase 1: Create Infrastructure
1. ✅ Run migration: `009_checkout_sessions.sql`
2. Create API endpoints for session management
3. Implement middleware for route protection

### Phase 2: Update Routing  
1. Create new file structure under `/checkout/[sessionId]/`
2. Implement session-aware components
3. Add redirect logic for old checkout routes

### Phase 3: Enhanced Features
1. Cart recovery emails for abandoned sessions
2. Analytics dashboard for conversion tracking  
3. A/B testing capabilities for checkout flow

## 🛡️ Security Considerations

### Session Token Security
- ✅ Cryptographically secure random tokens
- ✅ URL-safe encoding (no special characters)
- ✅ Reasonable length (32 chars) for security vs UX
- ✅ Automatic expiry (7 days like Shopify)

### Access Control
- ✅ RLS policies prevent cross-session access
- ✅ Server-side validation of session ownership
- ✅ IP address tracking for fraud detection
- ✅ Automatic session cleanup

### Data Protection
- ✅ No sensitive payment data in sessions
- ✅ Tokenized payment methods only
- ✅ Encrypted cart contents (JSONB in Postgres)
- ✅ Audit trail for all session changes

## 📈 Analytics & Monitoring

### Conversion Funnel Tracking
```sql
-- Built-in analytics views
SELECT * FROM checkout_funnel_analytics 
WHERE date >= CURRENT_DATE - INTERVAL '30 days';

-- Abandoned cart recovery
SELECT * FROM abandoned_carts
WHERE hours_since_last_activity BETWEEN 1 AND 72;
```

### Key Metrics to Track
- Session creation rate
- Information → Payment conversion
- Payment → Completion conversion  
- Average session duration
- Drop-off points analysis
- Cart recovery email effectiveness