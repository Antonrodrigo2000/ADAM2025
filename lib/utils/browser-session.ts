/**
 * Browser session management for anonymous image uploads
 * Generates and persists a unique session ID per browser/device
 */

const SESSION_STORAGE_KEY = 'adam-browser-session-id'

/**
 * Gets or creates a unique browser session ID
 * This persists across page reloads but not browser restarts
 */
export function getBrowserSessionId(): string {
    // Try to get existing session ID from sessionStorage
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY)
    
    if (!sessionId) {
        // Generate new session ID: timestamp + random string
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 15)
        sessionId = `session_${timestamp}_${random}`
        
        // Store in sessionStorage (survives page refresh, cleared on browser close)
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId)
        
        console.log('🆔 Generated new browser session:', sessionId)
    }
    
    return sessionId
}

/**
 * Clears the current browser session ID
 * Use this after successful signup/migration
 */
export function clearBrowserSession(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    console.log('🧹 Cleared browser session ID')
}

/**
 * Gets session ID for server-side operations
 * This would come from the client request or be passed as parameter
 */
export function getSessionIdFromRequest(request?: Request): string | null {
    // In a real implementation, you might get this from:
    // - Request headers
    // - Cookies
    // - Request body
    // - JWT payload
    
    // For now, return null - client must pass it explicitly
    return null
}

/**
 * Check if browser has an active anonymous session
 */
export function hasActiveAnonymousSession(): boolean {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) !== null
}

/**
 * Get session-specific storage keys for localStorage
 */
export function getSessionStorageKey(key: string): string {
    const sessionId = getBrowserSessionId()
    return `${key}_${sessionId}`
}

/**
 * Store data with session-specific key
 */
export function setSessionData(key: string, data: any): void {
    const sessionKey = getSessionStorageKey(key)
    localStorage.setItem(sessionKey, JSON.stringify(data))
}

/**
 * Get data with session-specific key
 */
export function getSessionData(key: string): any {
    const sessionKey = getSessionStorageKey(key)
    const data = localStorage.getItem(sessionKey)
    return data ? JSON.parse(data) : null
}

/**
 * Clear all session-specific data
 */
export function clearSessionData(): void {
    const sessionId = getBrowserSessionId()
    
    // Find all keys that belong to this session
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.endsWith(`_${sessionId}`)) {
            keysToRemove.push(key)
        }
    }
    
    // Remove all session-specific keys
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log(`🧹 Cleared ${keysToRemove.length} session-specific localStorage items`)
}