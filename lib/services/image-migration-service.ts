import { createServiceRoleClient } from '../supabase/server'

export interface ImageMigrationResult {
    success: boolean
    migratedCount: number
    failedCount: number
    updatedResponsesCount: number
    error?: string
}

/**
 * Service to handle migrating anonymous questionnaire images to user folders after signup
 */
export class ImageMigrationService {
    
    /**
     * Migrates anonymous images from a specific browser session to the newly authenticated user's folder
     * This should be called after successful user signup/signin
     */
    static async migrateAnonymousImagesToUser(
        newUserId: string,
        browserSessionId: string
    ): Promise<ImageMigrationResult> {
        
        console.log(`🔄 Migrating anonymous images from session ${browserSessionId} to user ${newUserId}`)
        
        try {
            const supabase = createServiceRoleClient()
            
            // Call the database function to migrate images
            const { data, error } = await supabase.rpc('migrate_anonymous_images_to_user', {
                p_new_user_id: newUserId,
                p_session_id: browserSessionId
            })
            
            if (error) {
                console.error('❌ Image migration failed:', error)
                return {
                    success: false,
                    migratedCount: 0,
                    failedCount: 0,
                    updatedResponsesCount: 0,
                    error: error.message
                }
            }
            
            const result = data[0]
            const { migrated_count, failed_count, updated_responses_count } = result
            
            console.log(`✅ Image migration completed: ${migrated_count} images migrated, ${updated_responses_count} responses updated, ${failed_count} failed`)
            
            return {
                success: true,
                migratedCount: migrated_count,
                failedCount: failed_count,
                updatedResponsesCount: updated_responses_count
            }
            
        } catch (error) {
            console.error('❌ Image migration service error:', error)
            return {
                success: false,
                migratedCount: 0,
                failedCount: 0,
                updatedResponsesCount: 0,
                error: `Service error: ${error}`
            }
        }
    }
    
    /**
     * Gets count of anonymous images for a specific browser session
     */
    static async getAnonymousImageCount(browserSessionId: string): Promise<number> {
        try {
            const supabase = createServiceRoleClient()
            
            const { data: files, error } = await supabase.storage
                .from(process.env.SUPABASE_QUESTIONNAIRE_BUCKET!)
                .list(`anonymous/${browserSessionId}`, { limit: 1000 })
            
            if (error) {
                console.warn('⚠️  Could not count anonymous images:', error.message)
                return 0
            }
            
            return files?.length || 0
            
        } catch (error) {
            console.warn('⚠️  Error counting anonymous images:', error)
            return 0
        }
    }
    
    /**
     * Cleanup orphaned anonymous images older than specified days
     * Should be called by a cron job or scheduled task
     */
    static async cleanupOrphanedAnonymousImages(): Promise<{ success: boolean; cleanedCount?: number; error?: string }> {
        console.log('🧹 Starting cleanup of orphaned anonymous images...')
        
        try {
            const supabase = createServiceRoleClient()
            
            // Call the database cleanup function
            const { error } = await supabase.rpc('cleanup_orphaned_anonymous_images')
            
            if (error) {
                console.error('❌ Cleanup failed:', error)
                return {
                    success: false,
                    error: error.message
                }
            }
            
            console.log('✅ Cleanup completed successfully')
            
            return {
                success: true
            }
            
        } catch (error) {
            console.error('❌ Cleanup service error:', error)
            return {
                success: false,
                error: `Service error: ${error}`
            }
        }
    }
    
    /**
     * Checks if there are anonymous images for a specific session that need migration
     */
    static async hasAnonymousImages(browserSessionId: string): Promise<boolean> {
        const count = await this.getAnonymousImageCount(browserSessionId)
        return count > 0
    }
}

export default ImageMigrationService