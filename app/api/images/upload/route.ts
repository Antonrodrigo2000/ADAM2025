import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { encryptFile, generateSecureFilename } from '@/lib/encryption/image-encryption'

const BUCKET_NAME = process.env.SUPABASE_QUESTIONNAIRE_BUCKET!

export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const formData = await request.formData()
        const file = formData.get('file') as File
        const questionId = formData.get('questionId') as string
        const browserSessionId = formData.get('browserSessionId') as string | null
        
        if (!file || !questionId) {
            return NextResponse.json(
                { error: 'Missing file or questionId' },
                { status: 400 }
            )
        }

        // Check authentication
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        // Determine folder structure
        let currentUserId: string
        let sessionId: string | undefined
        
        if (!authError && user) {
            // Authenticated user: userId/filename.enc
            currentUserId = user.id
            sessionId = undefined
        } else {
            // Anonymous user: anonymous/sessionId/filename.enc
            currentUserId = 'anonymous'
            sessionId = browserSessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        }

        // Encrypt the image (server-side only)
        const { encryptedData, originalMetadata } = await encryptFile(file)
        
        // Generate secure filename
        const secureFilename = generateSecureFilename(questionId)
        
        // Create folder path
        const fileName = sessionId 
            ? `${currentUserId}/${sessionId}/${secureFilename}`
            : `${currentUserId}/${secureFilename}`

        // Create encrypted file for upload
        const encryptedJson = JSON.stringify(encryptedData)
        const encryptedBlob = new Blob([encryptedJson], { type: 'application/json' })
        
        // Upload to Supabase using service role (bypasses RLS for upload)
        const serviceSupabase = createServiceRoleClient()
        const { data, error } = await serviceSupabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, encryptedBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'application/json'
            })

        if (error) {
            console.error('❌ Upload error:', error)
            return NextResponse.json(
                { error: `Upload failed: ${error.message}` },
                { status: 500 }
            )
        }

        console.log('✅ Encrypted image uploaded:', {
            path: data.path,
            originalSize: originalMetadata.size,
            encryptedSize: encryptedBlob.size,
            isAnonymous: !user,
            sessionId
        })

        // Return the storage path and metadata
        return NextResponse.json({
            success: true,
            supabasePath: data.path,
            imageReference: {
                type: 'image_reference',
                supabasePath: data.path,
                imageId: `${questionId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                metadata: {
                    name: originalMetadata.name,
                    size: originalMetadata.size,
                    fileType: originalMetadata.type
                }
            },
            sessionId: sessionId // Return session ID for anonymous users
        })

    } catch (error) {
        console.error('❌ Server error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}