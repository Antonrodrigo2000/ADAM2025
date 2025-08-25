/**
 * Pino Express Middleware for Request Logging
 * Adds correlation IDs and structured logging to all requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { logger, requestContext } from './pino-config'

export function withRequestLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = uuidv4()
    const startTime = Date.now()
    
    // Extract context from headers/cookies
    const userId = req.headers.get('x-user-id') || extractUserFromToken(req)
    const sessionId = req.headers.get('x-session-id')
    const orderId = extractOrderId(req)
    
    const context = {
      requestId,
      userId,
      sessionId,
      orderId
    }
    
    // Create child logger for this request
    const requestLogger = logger.child({
      ...context,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent')
    })
    
    requestLogger.info('Request started')
    
    try {
      // Run handler within async context
      const response = await requestContext.run(context, async () => {
        return await handler(req)
      })
      
      const duration = Date.now() - startTime
      
      requestLogger.info({
        statusCode: response.status,
        duration,
        responseSize: response.headers.get('content-length')
      }, 'Request completed')
      
      // Add correlation headers to response
      response.headers.set('x-request-id', requestId)
      if (userId) response.headers.set('x-user-id', userId)
      
      return response
      
    } catch (error) {
      const duration = Date.now() - startTime
      
      requestLogger.error({
        err: error,
        duration
      }, 'Request failed')
      
      throw error
    }
  }
}

// Helper functions
function extractUserFromToken(req: NextRequest): string | undefined {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return undefined
    
    // Extract user ID from JWT or session
    // Implementation depends on your auth system
    return undefined
  } catch {
    return undefined
  }
}

function extractOrderId(req: NextRequest): string | undefined {
  // Extract order ID from URL params or body
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/')
  
  // Look for order ID in path: /api/orders/[orderId]
  const orderIndex = pathParts.indexOf('orders')
  if (orderIndex !== -1 && pathParts[orderIndex + 1]) {
    return pathParts[orderIndex + 1]
  }
  
  return undefined
}

// Usage wrapper for API routes
export function createApiHandler(
  component: string,
  operation: string,
  handler: (req: NextRequest, context: any) => Promise<NextResponse>
) {
  return withRequestLogging(async (req: NextRequest) => {
    const context = requestContext.getStore()
    const componentLogger = logger.child({
      ...context,
      component,
      operation
    })
    
    componentLogger.debug('Operation started')
    
    try {
      const result = await handler(req, { logger: componentLogger, ...context })
      componentLogger.info('Operation completed successfully')
      return result
    } catch (error) {
      componentLogger.error({ err: error }, 'Operation failed')
      throw error
    }
  })
}