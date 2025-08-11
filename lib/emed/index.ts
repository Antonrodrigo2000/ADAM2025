/**
 * eMed Integration Service
 * Centralized exports for eMed patient management
 */

export * from './patient'
export * from './profile'

// Re-export the main service for convenience
export { medplumService } from '@/helpers/medplum/emed'