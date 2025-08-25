# Pino Logging Implementation Guide for ADAM Telehealth Platform

## Overview

This guide provides comprehensive insights and implementation strategies for using Pino logging in the ADAM telehealth platform, with focus on healthcare compliance, performance, and observability.

## Why Pino for Healthcare Applications

### Performance Benefits
- **5x faster** than Winston in benchmarks
- **Low memory footprint** - crucial for serverless/edge deployments  
- **JSON-first** - perfect for structured logging and observability
- **Child loggers** - excellent for request tracing
- **Zero-dependencies** core - smaller bundle size

### Healthcare Compliance Features
- **Structured logs** help with audit trails (HIPAA/SOX compliance)
- **Built-in redaction** for sensitive data (PII/PHI) 
- **Correlation IDs** for tracking patient interactions across services
- **Immutable log entries** for regulatory compliance
- **High-performance serialization** for real-time monitoring

## Implementation Architecture

### Core Components

1. **Base Logger Configuration** (`lib/logger/pino-config.ts`)
   - PII redaction for healthcare compliance
   - Request context injection
   - Custom serializers for domain objects
   - Environment-specific formatting

2. **Request Middleware** (`lib/logger/middleware.ts`)
   - Correlation ID generation
   - Request/response logging
   - Performance timing
   - Error boundary logging

3. **Domain-Specific Loggers** (`lib/logger/domain-loggers.ts`)
   - Pre-configured loggers for business domains
   - Context-aware logging for different services
   - Compliance-focused audit logging

## Key Features for ADAM Platform

### 1. PII/PHI Redaction
```typescript
const redactPaths = [
  'req.body.email',
  'req.body.phone', 
  'req.body.nic',
  'req.body.medical_history',
  'req.body.symptoms',
  'req.body.payment_token'
]
```

### 2. Correlation Tracking
```typescript
// Automatic correlation across requests
logger.info({
  requestId: 'uuid-1234',
  userId: 'user-5678', 
  orderId: 'order-9012',
  sessionId: 'session-3456'
}, 'Payment processed')
```

### 3. Domain-Specific Logging
```typescript
// Payment processing
paymentLogger(orderId, userId).info('Payment initiated')

// Medical consultations  
consultationLogger(consultationId, userId).info('Consultation assigned')

// E-Med integration
emedLogger(userId, orderId).info('Questionnaire submitted')
```

## Implementation Benefits

### For Development
- **Rich debugging** with structured context
- **Request tracing** across microservices
- **Performance profiling** with built-in timing
- **Beautiful development output** with pino-pretty

### For Production
- **High-performance logging** (minimal overhead)
- **JSON output** for log aggregation (ELK, Datadog, etc.)
- **Automatic PII redaction** for compliance
- **Correlation tracking** for incident investigation

### For Healthcare Compliance
- **Audit trails** with immutable log entries
- **Data privacy** through automatic redaction
- **Patient journey tracking** with correlation IDs
- **Regulatory compliance** with structured logging

## Usage Examples

### Basic Logging
```typescript
import { logger } from '@/lib/logger/pino-config'

logger.info('Application started')
logger.error({ err: new Error('DB connection failed') }, 'Database error')
```

### API Route Logging
```typescript
import { createApiHandler } from '@/lib/logger/middleware'

export const POST = createApiHandler(
  'payment-service',
  'process-payment', 
  async (req, { logger }) => {
    logger.info('Processing payment request')
    // ... payment logic
    logger.info({ orderId }, 'Payment completed')
    return NextResponse.json({ success: true })
  }
)
```

### Domain-Specific Logging
```typescript
import { paymentLogger, auditLogger } from '@/lib/logger/domain-loggers'

// Payment processing with context
const pLogger = paymentLogger(orderId, userId)
pLogger.info('Payment validation started')
pLogger.warn({ reason: 'insufficient_funds' }, 'Payment validation failed')

// Audit trail for compliance
auditLogger('payment_processed', userId, orderId).info({
  amount: 2500,
  currency: 'LKR',
  method: 'credit_card'
}, 'Payment audit entry')
```

### Error Logging with Context
```typescript
import { errorLogger } from '@/lib/logger/domain-loggers'

try {
  await processOrder(orderData)
} catch (error) {
  errorLogger('order-processing', userId).error({
    err: error,
    orderId,
    orderData: { id: orderData.id, total: orderData.total }
  }, 'Order processing failed')
  throw error
}
```

## Integration Points

### 1. API Routes
- Wrap all API routes with `createApiHandler`
- Automatic request/response logging
- Error boundary integration
- Performance timing

### 2. Webhook Handlers
```typescript
import { webhookLogger } from '@/lib/logger/domain-loggers'

export async function handleGenieWebhook(data: WebhookData) {
  const logger = webhookLogger('genie', data.eventType)
  
  logger.info({ transactionId: data.transactionId }, 'Webhook received')
  // ... processing logic
  logger.info('Webhook processed successfully')
}
```

### 3. Database Operations
```typescript
import { dbLogger } from '@/lib/logger/domain-loggers'

async function updateOrder(orderId: string, updates: any) {
  const logger = dbLogger('orders', 'update')
  
  logger.debug({ orderId, updates }, 'Updating order')
  const result = await supabase.from('orders').update(updates).eq('id', orderId)
  
  if (result.error) {
    logger.error({ err: result.error }, 'Order update failed')
    throw result.error
  }
  
  logger.info('Order updated successfully')
  return result
}
```

### 4. Background Jobs
```typescript
import { performanceLogger } from '@/lib/logger/domain-loggers'

async function processEmedSubmission(orderId: string) {
  const logger = performanceLogger('emed-submission')
  const startTime = Date.now()
  
  logger.info({ orderId }, 'Starting E-Med submission')
  
  try {
    await submitToEmed(orderData)
    const duration = Date.now() - startTime
    
    logger.info({ duration }, 'E-Med submission completed')
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error({ err: error, duration }, 'E-Med submission failed')
    throw error
  }
}
```

## Observability & Monitoring

### Log Aggregation
```bash
# Example log entry structure
{
  "level": "info",
  "time": 1640995200000,
  "requestId": "req_1234567890",
  "userId": "user_abcdefgh", 
  "orderId": "order_12345678",
  "component": "payment-service",
  "operation": "process-payment",
  "msg": "Payment processed successfully",
  "duration": 245,
  "amount": 2500,
  "currency": "LKR"
}
```

### Metrics & Alerts
- **Error rates** by component/operation
- **Performance metrics** (P95, P99 latencies)
- **Business metrics** (payment success rates, consultation completion)
- **Security events** (failed auth attempts, suspicious activity)

### Dashboard Integration
- **Real-time monitoring** with structured queries
- **Patient journey tracking** via correlation IDs
- **System health** monitoring with performance logs
- **Compliance reporting** with audit trail queries

## Security & Compliance

### PII Protection
- **Automatic redaction** of sensitive fields
- **Safe logging** of business events without exposing data
- **Audit-safe** logs for regulatory requirements

### Audit Trail
```typescript
// Comprehensive audit logging
auditLogger('patient_data_accessed', userId, patientId).info({
  action: 'view_medical_history',
  resource: 'patient_medical_records',
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  timestamp: new Date().toISOString()
}, 'Patient data access audit')
```

## Performance Considerations

### High-Throughput Scenarios
- **Asynchronous logging** to avoid blocking requests
- **Log level filtering** in production (info+ only)
- **Structured serialization** for efficient parsing
- **Child logger reuse** to reduce object creation

### Memory Management
- **Automatic object reuse** in Pino core
- **Minimal allocations** during hot paths
- **Efficient JSON serialization** 
- **Configurable log rotation** for disk usage

## Migration Strategy

### Phase 1: Core Setup
1. Install Pino configuration
2. Set up request middleware
3. Replace console.log statements

### Phase 2: Domain Integration  
1. Implement domain-specific loggers
2. Add correlation tracking
3. Set up error boundaries

### Phase 3: Observability
1. Integrate with log aggregation system
2. Set up monitoring dashboards
3. Configure alerts and metrics

### Phase 4: Compliance
1. Implement audit logging
2. Add PII redaction verification
3. Set up compliance reporting

## Installation & Setup

```bash
# Install Pino and related packages
npm install pino
npm install --save-dev pino-pretty  # Development formatting
```

```typescript
// Environment variables
LOG_LEVEL=info                    # Production
LOG_LEVEL=debug                   # Development
NODE_ENV=production              # JSON output
NODE_ENV=development             # Pretty output
```

## Best Practices

### Do's
- ✅ Use structured logging with context objects
- ✅ Include correlation IDs in all logs
- ✅ Use child loggers for request scoping
- ✅ Log business events, not just technical events
- ✅ Use appropriate log levels (debug/info/warn/error)

### Don'ts  
- ❌ Log sensitive data without redaction
- ❌ Use string concatenation in log messages
- ❌ Log in synchronous hot paths
- ❌ Create new logger instances in loops
- ❌ Mix business logic with logging logic

## Conclusion

Pino provides the perfect foundation for production logging in healthcare applications, offering the performance, security, and compliance features needed for the ADAM telehealth platform. The structured approach with domain-specific loggers and automatic PII redaction ensures both developer productivity and regulatory compliance.

The implementation files in `/lib/logger/` provide a complete, production-ready logging solution that can be incrementally adopted across the platform.