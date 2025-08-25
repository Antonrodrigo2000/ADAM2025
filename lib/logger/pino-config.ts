/**
 * Pino Logger Configuration for ADAM Telehealth Platform
 * Optimized for healthcare applications with PII redaction
 */

import pino from 'pino'
import { AsyncLocalStorage } from 'async_hooks'

// Request context storage for correlation IDs
export const requestContext = new AsyncLocalStorage<{
  requestId: string
  userId?: string
  sessionId?: string
  orderId?: string
}>()

// PII redaction for healthcare compliance
const redactPaths = [
  // User PII
  'req.body.email',
  'req.body.phone',
  'req.body.nic',
  'req.body.first_name',
  'req.body.last_name',
  'req.body.date_of_birth',
  'req.body.address',
  
  // Payment data
  'req.body.payment_token',
  'req.body.card_number',
  'req.body.cvv',
  
  // Medical data
  'req.body.medical_history',
  'req.body.symptoms',
  'req.body.questionnaire_responses',
  
  // Response PII
  'res.body.email',
  'res.body.phone',
  'res.body.nic',
  'res.body.patient_info',
  
  // Headers
  'req.headers.authorization',
  'req.headers.cookie'
]

const pinoConfig = {
  level: process.env.LOG_LEVEL || 'info',
  
  // Redact sensitive data
  redact: {
    paths: redactPaths,
    censor: '[REDACTED]'
  },
  
  // Add request context to all logs
  mixin() {
    const context = requestContext.getStore()
    return context ? {
      requestId: context.requestId,
      userId: context.userId,
      sessionId: context.sessionId,
      orderId: context.orderId
    } : {}
  },
  
  // Custom serializers for complex objects
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      },
      query: req.query,
      // Body will be redacted by redact paths
      body: req.body
    }),
    
    res: (res: any) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeader('content-type'),
        'content-length': res.getHeader('content-length')
      }
    }),
    
    err: pino.stdSerializers.err,
    
    // Custom serializer for order data
    order: (order: any) => ({
      id: order.id,
      status: order.status,
      payment_flow_type: order.payment_flow_type,
      total_amount: order.total_amount,
      created_at: order.created_at
    }),
    
    // Custom serializer for consultation data
    consultation: (consultation: any) => ({
      id: consultation.id,
      status: consultation.status,
      consultation_type: consultation.consultation_type,
      assigned_at: consultation.assigned_at
    })
  },
  
  // Environment-specific configuration
  ...(process.env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: true
      }
    }
  } : {
    // Production: JSON output for log aggregation
    formatters: {
      level: (label: string) => ({ level: label }),
      log: (object: any) => object
    }
  })
}

export const logger = pino(pinoConfig)

// Typed logger for different contexts
export const createContextLogger = (context: {
  component: string
  operation?: string
  userId?: string
  sessionId?: string
  orderId?: string
}) => {
  return logger.child({
    component: context.component,
    operation: context.operation,
    userId: context.userId,
    sessionId: context.sessionId,
    orderId: context.orderId
  })
}