/**
 * eMed Integration Service
 * Centralized exports for eMed patient management
 */

export * from './patient'
export * from './profile'

// eMed-specific services
export * from './emed-service'
export * from './fhir-builders'
export * from './image-compressor'

// Re-export the main service for convenience
export { medplumService } from './emed-service'