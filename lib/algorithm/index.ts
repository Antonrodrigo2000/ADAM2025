/**
 * Main algorithm registry and exports
 */

// Export types
export * from './types'

// Export registry
export { algorithmRegistry, getRecommendations, validateResponses } from './registry'

// Import and register all algorithms
import { algorithmRegistry } from './registry'
import { hairLossAlgorithm } from './hair-loss-algorithm'
import { erectileDysfunctionAlgorithm } from './erectile-dysfunction-algorithm'

// Register all algorithms
algorithmRegistry.register(hairLossAlgorithm)
algorithmRegistry.register(erectileDysfunctionAlgorithm)

console.log('🔬 Initialized algorithm registry with health verticals:', algorithmRegistry.getRegisteredVerticals())

// Legacy export for backward compatibility
export { default as recommendTreatment } from './hairloss-recommendations'
export type { PatientData, RecommendationResult } from './hairloss-recommendations'