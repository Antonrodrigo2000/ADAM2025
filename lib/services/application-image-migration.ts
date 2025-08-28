import { createServiceRoleClient } from '@/lib/supabase/server'

export interface ApplicationMigrationResult {
  success: boolean
  storageFilesMigrated: number
  storageFailures: number
  databasePathsUpdated: number
  error?: string
}

/**
 * Application-level image migration service
 * Handles both storage file migration and database path updates
 */
export class ApplicationImageMigration {
  
  /**
   * Complete migration: storage files + database path updates
   */
  static async migrateAnonymousImages(
    newUserId: string,
    browserSessionId: string
  ): Promise<ApplicationMigrationResult> {
    
    console.log(`🔄 Starting application-level migration for user ${newUserId}, session ${browserSessionId}`)
    
    try {
      const supabase = createServiceRoleClient()
      
      // Step 1: Migrate storage files using proper copy/delete (not direct DB update)
      const migrationResult = await this.migrateStorageFilesProperly(newUserId, browserSessionId, supabase)
      const { storageFilesMigrated, storageFailures } = migrationResult
      
      console.log(`✅ Storage migration: ${storageFilesMigrated} files migrated, ${storageFailures} failures`)
      
      // Step 2: Update database paths (application level)
      const databasePathsUpdated = await this.updateDatabasePaths(
        newUserId, 
        browserSessionId, 
        supabase
      )
      
      console.log(`✅ Database path updates: ${databasePathsUpdated} responses updated`)
      
      return {
        success: true,
        storageFilesMigrated,
        storageFailures,
        databasePathsUpdated
      }
      
    } catch (error) {
      console.error('❌ Application migration failed:', error)
      return {
        success: false,
        storageFilesMigrated: 0,
        storageFailures: 0,
        databasePathsUpdated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Properly migrate storage files using copy/delete (not direct DB manipulation)
   */
  private static async migrateStorageFilesProperly(
    newUserId: string,
    browserSessionId: string,
    supabase: any
  ): Promise<{ storageFilesMigrated: number; storageFailures: number }> {
    
    let migrated = 0
    let failures = 0
    
    try {
      // List all files in the anonymous session folder
      const { data: files, error: listError } = await supabase.storage
        .from('medical-questionnaire-uploads')
        .list(`anonymous/${browserSessionId}`, { limit: 100 })
      
      if (listError) {
        console.error('Failed to list anonymous files:', listError)
        return { storageFilesMigrated: 0, storageFailures: 1 }
      }
      
      if (!files || files.length === 0) {
        console.log('⚠️ No files found in anonymous session folder')
        return { storageFilesMigrated: 0, storageFailures: 0 }
      }
      
      console.log(`📋 Found ${files.length} files to migrate from anonymous/${browserSessionId}/`)
      
      for (const file of files) {
        try {
          const oldPath = `anonymous/${browserSessionId}/${file.name}`
          const newPath = `${newUserId}/${file.name}`
          
          console.log(`🔄 Migrating: ${oldPath} → ${newPath}`)
          
          // Step 1: Copy file to new location
          const { data: copyData, error: copyError } = await supabase.storage
            .from('medical-questionnaire-uploads')
            .copy(oldPath, newPath)
          
          if (copyError) {
            console.error(`❌ Failed to copy ${oldPath}:`, copyError)
            failures++
            continue
          }
          
          // Step 2: Delete file from old location
          const { error: deleteError } = await supabase.storage
            .from('medical-questionnaire-uploads')
            .remove([oldPath])
          
          if (deleteError) {
            console.error(`⚠️ Failed to delete ${oldPath} after copy:`, deleteError)
            // Don't count as failure since copy succeeded
          }
          
          migrated++
          console.log(`✅ Successfully migrated: ${file.name}`)
          
        } catch (error) {
          console.error(`❌ Error migrating file ${file.name}:`, error)
          failures++
        }
      }
      
    } catch (error) {
      console.error('❌ Storage migration failed:', error)
      return { storageFilesMigrated: 0, storageFailures: 1 }
    }
    
    return { storageFilesMigrated: migrated, storageFailures: failures }
  }

  /**
   * Update database paths in user_responses (application level)
   */
  private static async updateDatabasePaths(
    userId: string,
    sessionId: string,
    supabase: any
  ): Promise<number> {
    
    console.log(`🔄 Updating database paths for user ${userId}, session ${sessionId}`)
    
    // Get all user responses (should be just one for questionnaire)
    const { data: allResponses, error: selectError } = await supabase
      .from('user_responses')
      .select('id, responses')
      .eq('user_id', userId)
    
    if (selectError) {
      throw new Error(`Failed to fetch user responses: ${selectError.message}`)
    }
    
    // Filter responses that contain the session path (JavaScript filtering)
    const responses = allResponses?.filter((response: { id: string; responses: any }) => 
      JSON.stringify(response.responses).includes(`anonymous/${sessionId}`)
    ) || []
    
    if (!responses || responses.length === 0) {
      console.log('⚠️ No user_responses found containing session paths')
      return 0
    }
    
    console.log(`📋 Found ${responses.length} user_responses to update`)
    
    let updatedCount = 0
    
    for (const response of responses) {
      try {
        // Update paths in the JSON using string replacement (safe and simple)
        const updatedResponses = this.replacePathsInJson(
          response.responses,
          `anonymous/${sessionId}/`,
          `${userId}/`
        )
        
        // Update the database record
        const { error: updateError } = await supabase
          .from('user_responses')
          .update({ 
            responses: updatedResponses
          })
          .eq('id', response.id)
        
        if (updateError) {
          console.error(`❌ Failed to update response ${response.id}:`, updateError)
          continue
        }
        
        updatedCount++
        console.log(`✅ Updated response ${response.id}`)
        
      } catch (error) {
        console.error(`❌ Error processing response ${response.id}:`, error)
        continue
      }
    }
    
    return updatedCount
  }
  
  /**
   * Replace paths in JSON object (recursive string replacement)
   */
  private static replacePathsInJson(
    jsonObj: any,
    oldPath: string,
    newPath: string
  ): any {
    
    if (typeof jsonObj === 'string') {
      return jsonObj.includes(oldPath) ? jsonObj.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath) : jsonObj
    }
    
    if (Array.isArray(jsonObj)) {
      return jsonObj.map(item => this.replacePathsInJson(item, oldPath, newPath))
    }
    
    if (jsonObj && typeof jsonObj === 'object') {
      const result: any = {}
      for (const [key, value] of Object.entries(jsonObj)) {
        result[key] = this.replacePathsInJson(value, oldPath, newPath)
      }
      return result
    }
    
    return jsonObj
  }
}