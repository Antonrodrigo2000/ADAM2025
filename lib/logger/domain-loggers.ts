/**
 * Domain-specific loggers for ADAM platform
 * Pre-configured loggers for different business domains
 */

import { createContextLogger } from './pino-config'

// Payment processing logger
export const paymentLogger = (orderId?: string, userId?: string) =>
  createContextLogger({
    component: 'payment-service',
    orderId,
    userId
  })

// Consultation workflow logger  
export const consultationLogger = (consultationId?: string, userId?: string) =>
  createContextLogger({
    component: 'consultation-service',
    operation: 'consultation-workflow',
    userId
  })

// E-Med integration logger
export const emedLogger = (userId?: string, orderId?: string) =>
  createContextLogger({
    component: 'emed-integration',
    userId,
    orderId
  })

// Genie API logger
export const genieLogger = (operation?: string) =>
  createContextLogger({
    component: 'genie-api',
    operation
  })

// Database operations logger
export const dbLogger = (table?: string, operation?: string) =>
  createContextLogger({
    component: 'database',
    operation: `${table}.${operation}`
  })

// Authentication logger
export const authLogger = (userId?: string) =>
  createContextLogger({
    component: 'authentication',
    userId
  })

// Webhook processing logger
export const webhookLogger = (provider: string, eventType?: string) =>
  createContextLogger({
    component: 'webhook-handler',
    operation: `${provider}.${eventType}`
  })

// Dashboard analytics logger
export const analyticsLogger = (userId?: string) =>
  createContextLogger({
    component: 'analytics',
    userId
  })

// Audit trail logger for compliance
export const auditLogger = (action: string, userId?: string, resourceId?: string) =>
  createContextLogger({
    component: 'audit-trail',
    operation: action,
    userId
  }).child({ resourceId, action, timestamp: new Date().toISOString() })

// Performance monitoring logger
export const performanceLogger = (operation: string) =>
  createContextLogger({
    component: 'performance',
    operation
  })

// Error boundary logger
export const errorLogger = (component: string, userId?: string) =>
  createContextLogger({
    component: `error-boundary.${component}`,
    userId
  })

// Business metrics logger
export const metricsLogger = (metric: string) =>
  createContextLogger({
    component: 'business-metrics',
    operation: metric
  })

// Security events logger
export const securityLogger = (event: string, userId?: string) =>
  createContextLogger({
    component: 'security',
    operation: event,
    userId
  })